import { PrismaClient } from "@prisma/client";
import { shopifyApi } from "@shopify/shopify-api";

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

export default prisma;

export async function createCustomForm(data) {
  return prisma.customForm.create({
    data,
  });
}

export async function getCustomForms() {
  return prisma.customForm.findMany();
}

export async function updateCustomForm(id, data) {
  return prisma.customForm.update({
    where: { id },
    data,
  });
}

export async function deleteCustomForm(id) {
  console.log("Deleting form with id:", id); // Debugging log
  return prisma.customForm.delete({
    where: { id },
  });
}

export async function createDiscountCodeWithSegment(admin, newForm) {


console.log("newForm", newForm);
  try {

//     const createSegmentMutation = `
//     mutation segmentCreate($name: String!, $query: String!) {
//       segmentCreate(name: $name, query: $query) {
//       segment {
//         id
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

// const segmentResponse = await admin.graphql(createSegmentMutation, {
//     variables: {
//         name: `${newForm.title}`,
//         query: "customer_tags CONTAINS 'Guest'"
//     },
//   });


// const responseJson = await segmentResponse.json();
// console.log(responseJson);




    // Step 3: Create a discount code for the price rule
    const createDiscountCodeMutation = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
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

    const discountCodeResponse = await admin.graphql(createDiscountCodeMutation, {

        variables: {
          "basicCodeDiscount": {
            "title": `${newForm.title}`,
            "code": `${newForm.title}`,
            "startsAt": "2022-06-21T00:00:00Z",
            "customerSelection": {
              "all": true
            },
            "customerGets": {
              "value": {
                "percentage": 0.5
              },
              "items": {
                "all": true
              }
            },
            "appliesOncePerCustomer": true
          }
        }        
    });

    const discountCodeResponseJson = await discountCodeResponse.json()
    console.log(JSON.stringify(discountCodeResponseJson));
    return discountCodeResponseJson

  } catch (error) {
    console.error("Error creating discount code with segment:", error.message);
    throw new Error("An error occurred while creating the discount code with the segment.");
  }
}
