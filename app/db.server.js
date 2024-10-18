import { PrismaClient } from "@prisma/client";
import { shopifyApi } from "@shopify/shopify-api";

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

export default prisma;


export async function getCustomFormById(formId) {
  return prisma.customForm.findUnique({
    where: { id: formId },
  });
}

export async function createCustomForm(data) {
  return prisma.customForm.create({
    data: {
      ...data,
      discountId: data.discountId || null,
      segmentId: data.segmentId || null,
    },
  });
}

export async function getCustomForms() {
  return prisma.customForm.findMany();
}

export async function updateCustomForm(id, data) {
  return prisma.customForm.update({
    where: { id },
    data: {
      ...data,
    },
  });
}

export async function deleteCustomForm(id) {
  console.log("Deleting form with id:", id); // Debugging log
  return prisma.customForm.delete({
    where: { id },
  });
}

export async function createDiscountCodeWithSegment(admin, newForm) {

  try {

    const createDiscountCodeMutation = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                appliesOncePerCustomer
              }
            }
          }
          userErrors {
            field
            code
            message
          }
        }
      }
    `;

    let customerGetsValue;
    const discountType = newForm.discountType.trim().toLowerCase();

    // Step 3: Determine the discount type and create the appropriate object
    if (discountType === 'percentage') {
      customerGetsValue = {
        value: {
          percentage: parseFloat(newForm.discountValue) / 100,
        },
        items: {
          all: true,
        },
      };
    } else if (discountType === 'fixed') {
      customerGetsValue = {
        value: {
          discountAmount: {
            amount: parseInt(newForm.discountValue),
            appliesOnEachItem: false,
          },
        },
        items: {
          all: true,
        },
      };
    } else {
      throw new Error("Invalid discount type");
    }

    // Step 4: Create the discount code
    const discountCodeResponse = await admin.graphql(createDiscountCodeMutation, {
      variables: {
        basicCodeDiscount: {
          title: `${newForm.title}-${newForm.id}`,
          code: `${newForm.couponPrefix}${newForm.id}${newForm.couponPostfix}`,
          startsAt: new Date().toISOString(), // Set to current date/time
          customerSelection: {
            all: true,
          },
          customerGets: customerGetsValue,
          appliesOncePerCustomer: true,
        },
      },
    });

    const discountCodeResponseJson = await discountCodeResponse.json();    
    // Extract the discount code ID from the response
    const discountId = discountCodeResponseJson.data.discountCodeBasicCreate.codeDiscountNode.id;
    
    // Update the form with the discount ID
    await prisma.customForm.update({
      where: { id: newForm.id },
      data: { discountId: discountId }
    });
    
    return discountCodeResponseJson;

  } catch (error) {
    console.error("Error creating discount code with segment:", error);
    throw new Error("An error occurred while creating the discount code with the segment.");
  }
}

export async function findCustomerByEmailAndShop(email, shop) {
  return prisma.customer.findFirst({
    where: {
      email: email,
      shop: shop,
    },
  });
}

export async function findCustomerByEmailShopAndFormId(email, shop, formId) {
  return prisma.formCustomer.findFirst({
    where: {
      customer: {
        email: email,
        shop: shop,
      },
      customFormId: formId,
    },
    include: {
      customer: true,
      customForm: true,
    },
  });
}


export async function addCustomerToForm(customerId, formId) {
  return prisma.formCustomer.create({
    data: {
      customerId: customerId,
      customFormId: formId,
    },
  });
}


export async function createCustomer({ email, shopifyCustomerId, shop, formId }) {
  const customer = await prisma.customer.create({
    data: {
      email,
      shopifyCustomerId,
      shop,
    },
  });

  if (formId) {
    await prisma.formCustomer.create({
      data: {
        customerId: customer.id,
        customFormId: formId,
      },
    });
  }

  return customer;
}


export async function findCustomerByEmailAndFormId(email, formId) {
  return prisma.formCustomer.findFirst({
    where: {
      customer: {
        email: email,
      },
      customFormId: formId,
    },
    include: {
      customer: true,
      customForm: true,
    },
  });
}


export async function updateSegmentId(formId, segmentId) {
  try {
    const updatedForm = await prisma.customForm.update({
      where: { id: formId },
      data: { segmentId: segmentId },
    });
    return updatedForm;
  } catch (error) {
    console.error("Error updating segmentId:", error);
    throw error;
  }
}
