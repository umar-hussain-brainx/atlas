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
  Modal, // Import Modal component
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { createCustomForm, createDiscountCodeWithSegment } from "../db.server";

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
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

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

  // Convert empty strings to null
  Object.keys(data).forEach((key) => {
    if (data[key] === "") {
      data[key] = " ";
    }
  });
  
  data.shop = shop;

  try {
    // Create the custom form in the database
    const newForm = await createCustomForm(data);
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
  const [showModal, setShowModal] = useState(false); // State for showing modal

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

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields except customCss
    const requiredFields = [
      "title",
      "description",
      "inputHeading",
      "submitButtonText",
      "couponPrefix",
      "couponPostfix",
      "discountType",
      "discountValue",
    ];

    // Validate required fields
    for (const field of requiredFields) {
      if (!formState[field]) {
        setValidationError(`${field} is required`);
        setShowModal(true); // Show modal popup with validation error
        return; // Stop form submission if validation fails
      }
    }

    // Reset validation error before submitting
    setValidationError(null);

    setIsSubmitting(true);
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
              <form onSubmit={handleSubmit}>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Form Title"
                      value={formState.title}
                      onChange={handleChange("title")}
                      required
                      placeholder="Enter the form title"
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Form Description"
                      value={formState.description}
                      onChange={handleChange("description")}
                      required
                      multiline={4}
                      placeholder="Enter the form description"
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Input Heading"
                      value={formState.inputHeading}
                      onChange={handleChange("inputHeading")}
                      placeholder="Enter input text"
                    />
                    <TextField
                      label="Submit Button Text"
                      value={formState.submitButtonText}
                      onChange={handleChange("submitButtonText")}
                      required
                      placeholder="Enter submit button text"
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Custom CSS"
                      value={formState.customCss}
                      onChange={handleChange("customCss")}
                      multiline={4}
                      placeholder="Enter custom CSS"
                    />
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <TextField
                      label="Coupon Prefix"
                      value={formState.couponPrefix}
                      onChange={handleChange("couponPrefix")}
                      required
                      placeholder="Enter coupon prefix"
                    />
                    <TextField
                      label="Coupon Postfix"
                      value={formState.couponPostfix}
                      onChange={handleChange("couponPostfix")}
                      required
                      placeholder="Enter coupon postfix"
                    />
                  </FormLayout.Group>

                  {/* New Discount Type Select Box */}
                  <FormLayout.Group>
                    <Select
                      label="Discount Type"
                      options={discountTypeOptions}
                      value={formState.discountType}
                      onChange={handleChange("discountType")}
                      required
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
                        min="1"
                        max="1000"
                        required
                        onChange={handleChange("discountValue")}
                        type="number"
                        prefix={
                          formState.discountType === "percentage" ? "%" : "$"
                        }
                        placeholder={
                          formState.discountType === "fixed"
                            ? "Enter discount amount"
                            : "Enter discount percentage"
                        }
                      />
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

      {/* Modal for validation error */}
      {validationError && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)} // Close modal handler
          title="Validation Error"
          primaryAction={{
            content: "Close",
            onAction: () => setShowModal(false), // Close modal on button click
          }}
        >
          <Modal.Section>
            <Text style={{ textTransform: "capitalize" }}>
              <strong>{validationError}</strong>
            </Text>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
