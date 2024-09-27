import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
  Select,
  FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { createCustomForm, createDiscountCodeWithSegment } from "../db.server";
import { v4 as uuidv4 } from "uuid";

// Loader for ensuring user authentication
export const loader = async ({ request }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    // If no valid session, redirect to authentication
    return redirect("/auth");
  }
  return json({});
};

// Action for handling form submission
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const formFields = [
    "title",
    "description",
    "inputHeading",
    "submitButtonText",
    "customCss",
    "couponPrefix",
    "couponPostfix",
    "discountType",
    "discountValue",
  ];

  // Collect form data
  const data = Object.fromEntries(
    formFields.map((field) => [field, formData.get(field)])
  );
  const uuid = uuidv4();
  data.id = uuid; // Add UUID to the form data

  try {
    // Create the custom form in the database
    const newForm = await createCustomForm(data);

    console.log("newForm", newForm);

    const segmentName = `Form ${newForm.id} Subscribers`;

    await createDiscountCodeWithSegment(admin, newForm);

    return redirect("/app");
  } catch (error) {
    console.error("Error creating form and discount code:", error);

    if (error.response) {
      console.error("API response:", error.response.data);
    }

    return json(
      { error: "An error occurred while creating the form and discount code" },
      { status: 500 }
    );
  }
};

// React component for rendering the form
export default function NewForm() {
  const fetcher = useFetcher();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    inputHeading: "",
    submitButtonText: "",
    customCss: "",
    couponPrefix: "",
    couponPostfix: "",
    discountType: "",
    discountValue: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationError, setValidationError] = useState(null); // State for validation errors

  // Handle form field changes
  const handleChange = (field) => (value) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    if (field === "discountValue") {
      setValidationError(null); // Reset validation error on value change
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setValidationError(null); // Reset validation error

    const { discountType, discountValue } = formState;

    // Validate discount value based on the discount type
    if (discountType === "percentage") {
      const value = parseFloat(discountValue);
      if (value < 0.1 || value > 1.0) {
        setValidationError("Discount percentage must be between 0.1 and 1.0.");
        setIsSubmitting(false);
        return; // Stop the submission
      }
    }

    try {
      await fetcher.submit(formState, { method: "post" });
    } catch (error) {
      setErrorMessage("An error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options for discount type select box
  const discountTypeOptions = [
    { label: "Select Discount Type", value: "" },
    { label: "Fixed Amount", value: "fixed" },
    { label: "Percentage", value: "percentage" },
  ];

  return (
    <Page>
      <div
        style={{
          margin: "15px 0",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="headingLg" style={{ flex: 1, textAlign: "center" }}>
            Atlas Headrest Affiliate App
          </Text>
          <Button variant="primary" url="/app">
            Back
          </Button>
        </div>
      </div>

      <TitleBar title="Create New Custom Signup Form" />

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              {errorMessage && <Text color="critical">{errorMessage}</Text>}
              {validationError && <Text color="critical">{validationError}</Text>}
              <form onSubmit={handleSubmit}>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Form Title"
                      value={formState.title}
                      onChange={handleChange("title")}
                    />
                    <TextField
                      label="Form Description"
                      value={formState.description}
                      onChange={handleChange("description")}
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Input Heading"
                      value={formState.inputHeading}
                      onChange={handleChange("inputHeading")}
                    />
                    <TextField
                      label="Submit Button Text"
                      value={formState.submitButtonText}
                      onChange={handleChange("submitButtonText")}
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Custom CSS"
                      value={formState.customCss}
                      onChange={handleChange("customCss")}
                      multiline={4}
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Coupon Prefix"
                      value={formState.couponPrefix}
                      onChange={handleChange("couponPrefix")}
                    />
                    <TextField
                      label="Coupon Postfix"
                      value={formState.couponPostfix}
                      onChange={handleChange("couponPostfix")}
                    />
                  </FormLayout.Group>

                  {/* New Discount Type Select Box */}
                  <FormLayout.Group>
                    <Select
                      label="Discount Type"
                      options={discountTypeOptions}
                      value={formState.discountType}
                      onChange={handleChange("discountType")}
                    />
                  </FormLayout.Group>

                  {/* Conditional Input for Discount Value */}
    
              {formState.discountType && (
                <FormLayout.Group>
                  <TextField
                    label={
                      formState.discountType === "fixed"
                        ? "Discount Amount (Fixed)"
                        : "Discount Percentage"
                    }
                    value={formState.discountValue}
                    onChange={handleChange("discountValue")}
                    type="number"
                    prefix={
                      formState.discountType === "percentage" ? "%" : "$"
                    }
                  />
                  {formState.discountType === "percentage" && validationError && (
                    <Text color="critical" style={{ marginTop: '5px', color: "red" }}>
                      {validationError}
                    </Text>
                  )}
                </FormLayout.Group>
              )}

                  <Button variant="primary" submit disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Form"}
                  </Button>
                </FormLayout>
              </form>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
