export const updateDiscountMutation = async (admin, oldForm, newForm) => {
  try {
    const { discountType } = newForm
    let customerGetsValue;
    if (discountType === "percentage") {
      customerGetsValue = {
        value: {
          percentage: parseFloat(newForm.discountValue) / 100,
        },
        items: {
          all: true,
        },
      };
    } else if (discountType === "fixed") {
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

    const updateDiscountResponse = await admin.graphql(
      updateDiscountCodeMutation,
      {
        variables: {
          id: `${oldForm.discountId}`,
          basicCodeDiscount: {
            customerGets: customerGetsValue,
          },
        },
      },
    );

    await updateDiscountResponse.json();
  } catch (error) {
    console.error("Error creating discount code with segment:", error);
    throw new Error(
      "An error occurred while creating the discount code with the segment.",
    );
  }
};
