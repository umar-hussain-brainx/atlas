import { authenticate } from "../shopify.server";
import { findCustomerByEmailAndFormId, createCustomer, getCustomFormById } from "../db.server"; // Corrected import path

export const action = async ({ request }) => {
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: responseHeaders,
    });
  }

  try {
    const { admin } = await authenticate.public.appProxy(request);

    if (!admin) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: responseHeaders,
      });
    }

    const { email, formId } = await request.json();
    console.log('Received data:', { email, formId }); // Log the received data

    // Check if the customer already exists in our database
    const existingCustomer = await findCustomerByEmailAndFormId(email, formId);

    if (existingCustomer) {
      return new Response(JSON.stringify({ message: 'Customer already exists' }), {
        status: 200,
        headers: responseHeaders,
      });
    }
    console.log("existingCustomer",existingCustomer);
    // If customer doesn't exist, proceed with customer creation
    const customerCreateMutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
            acceptsMarketing
          }
          customerUserErrors {
            field
            message
            code
          }
        }
      }
    `;

    const customerResponse = await admin.graphql(customerCreateMutation, {
      variables: {
        input: {
          id:"asasd-11aaa",
          firstName: "John",
          lastName: "Smith",
          email: "johnsmith@shopify.com",
          phone: "+15146669999",
          password: "5hopify",
          acceptsMarketing: true,
        },
      },
    });

    // Handle errors from the customer creation response
    const { customerCreate } = customerResponse.data;
    if (customerCreate.customerUserErrors.length > 0) {
      throw new Error(customerCreate.customerUserErrors[0].message);
    }

    // Create the customer in your database
    await createCustomer({
      email,
      shopifyCustomerId: customerCreate.customer.id,
      customFormId: formId,
    });

    // Get the form to retrieve the discount code
    const form = await getCustomFormById(formId);
    let discountCode = '';
    if (form && form.discountId) {
      discountCode = `${form.couponPrefix}${form.couponPostfix}`;
    }

    return new Response(JSON.stringify({ 
      message: 'Customer created successfully',
      discountCode: discountCode,
    }), {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Error processing customer:', error);
    return new Response(JSON.stringify({ message: 'Error processing customer', error: error.message }), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
