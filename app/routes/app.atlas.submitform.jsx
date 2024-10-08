import { authenticate } from "../shopify.server";
import { 
  findCustomerByEmailAndShop, 
  findCustomerByEmailShopAndFormId, 
  addCustomerToForm, 
  createCustomer, 
  getCustomFormById ,
  updateSegmentId
} from "../db.server";

// Helper function to create or update customer
async function handleCustomer(admin, email, formId) {
  const getCustomerQuery = `
    query($email: String!) {
      customers(first: 1, query: $email) {
        edges {
          node {
            id
            tags
          }
        }
      }
    }
  `;

  const getCustomerResponse = await admin.graphql(getCustomerQuery, {
    variables: { email },
  });
  const customerData = await getCustomerResponse.json();

  if (customerData.data.customers.edges.length > 0) {
    // Customer exists, update tags
    const customerId = customerData.data.customers.edges[0].node.id;
    const currentTags = customerData.data.customers.edges[0].node.tags;
    const updatedTags = [...new Set([...currentTags, formId])];

    const updateCustomerMutation = `
      mutation($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            tags
          }
          userErrors {
            message
            field
          }
        }
      }
    `;

    await admin.graphql(updateCustomerMutation, {
      variables: {
        input: {
          id: customerId,
          tags: updatedTags,
        },
      },
    });

    return { customerId };
  } else {
    
    const createCustomerMutation = `
      mutation($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            tags
          }
          userErrors {
            message
            field
          }
        }
      }
    `;

    const createCustomerResponse = await admin.graphql(createCustomerMutation, {
      variables: {
        input: {
          email: email,
          tags: [formId],
        }
      },
    });

    const createCustomerData = await createCustomerResponse.json();

    if (createCustomerData.data.customerCreate.userErrors.length > 0) {
      throw new Error(createCustomerData.data.customerCreate.userErrors[0].message);
    }

    const newCustomerId = createCustomerData.data.customerCreate.customer.id;
    return { customerId: newCustomerId };
  }
}

// Main function
export const action = async ({ request }) => {

  const { admin, session } = await authenticate.public.appProxy(request);
  
  const formData = await request.json();
  const email = formData.email;
  const formId = formData.formId;
  const shop = session.shop;

  const responseHeaders = {
    "Content-Type": "application/json",
  };

  try {
    // Check if customer exists in the shop
    let customer = await findCustomerByEmailAndShop(email, shop);

    if (customer) {
      // Check if customer is already in the form
      const customerInForm = await findCustomerByEmailShopAndFormId(email, shop, formId);
      if (customerInForm) {
        return new Response(JSON.stringify({ message: 'Customer already exists for this form' }), {
          status: 200,
          headers: responseHeaders,
        });
      }

      // Customer exists in shop but not in form, add to form
      await handleCustomer(admin, email, formId);
      await addCustomerToForm(customer.id, formId);
    } else {
      // Customer doesn't exist, create in Shopify and our DB
      const { customerId } = await handleCustomer(admin, email, formId);

      // Create the customer in our database
      customer = await createCustomer({
        email,
        shopifyCustomerId: customerId,
        shop,
        formId
      });
      
    }

    const customForm = await getCustomFormById(formId);

    if (!customForm.segmentId) {
      // Create a new segment in Shopify
      const createSegmentMutation = `
        mutation segmentCreate($name: String!, $query: String!) {
          segmentCreate(name: $name, query: $query) {
            segment {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`;

      const segmentResponse = await admin.graphql(createSegmentMutation, {
        variables: {
          name: `${customForm.title} Segment`,
          query: `customer_tags CONTAINS '${formId}'`,
        },
      });

      const segmentData = await segmentResponse.json();

      const newSegmentId = segmentData?.data?.segmentCreate?.segment?.id;

      const updateDiscountCodeMutation = `
        mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const updateDiscountResponse = await admin.graphql(updateDiscountCodeMutation, {
        variables: {
          id: `${customForm.discountId}`,
          basicCodeDiscount: {
            customerSelection: {
              customerSegments: {
                add: [newSegmentId]
              }
            }
          }
        }
      });

      const updateDiscountData = await updateDiscountResponse.json();

      if (updateDiscountData.data.discountCodeBasicUpdate.userErrors.length > 0) {
        throw new Error(updateDiscountData.data.discountCodeBasicUpdate.userErrors[0].message);
      }
      
      await updateSegmentId(formId, newSegmentId);
    
    }

    // Generate a unique coupon code
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 7);
    const uniqueCode = `${customForm.couponPrefix}-${timestamp}-${randomString}-${customForm.couponPostfix}`.toUpperCase();

    // Create a new coupon code for the customer
    const createCouponCodeMutation = `
      mutation discountRedeemCodeBulkAdd($discountId: ID!, $codes: [DiscountRedeemCodeInput!]!) {
        discountRedeemCodeBulkAdd(discountId: $discountId, codes: $codes) {
          bulkCreation {
            id
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;

    const createCouponCodeResponse = await admin.graphql(createCouponCodeMutation, {
      variables: {
        discountId: customForm.discountId,
        codes: [{ code: uniqueCode }]
      }
    });

    const createCouponCodeData = await createCouponCodeResponse.json();

    if (createCouponCodeData.data.discountRedeemCodeBulkAdd.userErrors.length > 0) {
      throw new Error(createCouponCodeData.data.discountRedeemCodeBulkAdd.userErrors[0].message);
    }

    // Include the generated coupon code in the response
    return new Response(JSON.stringify({ 
      message: 'Customer processed successfully',
      couponCode: uniqueCode 
    }), {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("Error processing customer:", error);
    return new Response(JSON.stringify({ message: 'Error processing customer' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
