import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { Page, Layout, Form, FormLayout, TextField, Button, Card, Select, Modal, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState } from "react";

import { getCustomFormById, updateCustomForm } from "../db.server";
import { updateDiscountMutation } from "../actions/updateDisocunt";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const formId = params.id;
  const form = await getCustomFormById(formId);

  if (!form) {
    throw new Response("Form not found", { status: 404 });
  }

  return json({ form });
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  try {
    const formId = params.id;

    const formData = await request.formData();

    const updatedForm = {
      title: formData.get("title"),
      description: formData.get("description"),
      inputHeading: formData.get("inputHeading"),
      submitButtonText: formData.get("submitButtonText"),
      customCss: formData.get("customCss"),
      couponPrefix: formData.get("couponPrefix"),
      couponPostfix: formData.get("couponPostfix"),
      discountType: formData.get("discountType"),
      discountValue: formData.get("discountValue"),
    };

    const form = await getCustomFormById(formId);
    const { discountType, discountValue } = form;
    if (discountType !== updatedForm.discountType || discountValue !== updatedForm.discountValue) {
      await updateDiscountMutation(admin, form, updatedForm);
    }

    await updateCustomForm(formId, updatedForm);
    return redirect("/app");
  } catch (error) {
    return json(
      { error: "An error occurred while updating the form and discount code" },
      { status: 500 }
    );
  }
};

export default function EditForm() {
  const { form: initialForm } = useLoaderData();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const submit = useSubmit();
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation logic
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

    for (const field of requiredFields) {
      if (!form[field]) {
        setErrorMessage(`${field} is required`);
        setModalOpen(true); // Open the modal for the error message
        return;
      }
    }

    setErrorMessage(null); // Reset error message if validation passes
    submit(e.target, { method: "post" });
  };

  const handleChange = (value, name) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Discount type options
  const discountTypeOptions = [
    { label: "Select Discount Type", value: "" },
    { label: "Fixed Amount", value: "fixed" },
    { label: "Percentage", value: "percentage" },
  ];

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
  };

  return (
    <Page
      narrowWidth
      title="Edit Form"
      primaryAction={{
        content: "Back",
        url: `/app/`,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="Title"
                    name="title"
                    value={form.title}
                    onChange={(value) => handleChange(value, "title")}
                    autoComplete="off"
                    placeholder="Enter form title"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={(value) => handleChange(value, "description")}
                    autoComplete="off"
                    multiline={4}
                    placeholder="Enter form description"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Input Heading"
                    name="inputHeading"
                    value={form.inputHeading}
                    onChange={(value) => handleChange(value, "inputHeading")}
                    autoComplete="off"
                    placeholder="Enter input heading"
                  />
                  <TextField
                    label="Submit Button Text"
                    name="submitButtonText"
                    value={form.submitButtonText}
                    onChange={(value) => handleChange(value, "submitButtonText")}
                    autoComplete="off"
                    placeholder="Enter submit button text"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Custom CSS"
                    name="customCss"
                    value={form.customCss}
                    onChange={(value) => handleChange(value, "customCss")}
                    autoComplete="off"
                    multiline={4}
                    placeholder="Enter custom CSS for the form"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Coupon Prefix"
                    name="couponPrefix"
                    value={form.couponPrefix}
                    onChange={(value) => handleChange(value, "couponPrefix")}
                    autoComplete="off"
                    placeholder="Enter coupon prefix"
                  />
                  <TextField
                    label="Coupon Postfix"
                    name="couponPostfix"
                    value={form.couponPostfix}
                    onChange={(value) => handleChange(value, "couponPostfix")}
                    autoComplete="off"
                    placeholder="Enter coupon postfix"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <Select
                    label="Discount Type"
                    name="discountType"
                    options={discountTypeOptions}
                    value={form.discountType}
                    onChange={(value) => handleChange(value, "discountType")}
                    placeholder="Select discount type"
                  />
                </FormLayout.Group>

                {form.discountType && (
                  <FormLayout.Group>
                    <TextField
                      label={
                        form.discountType === "fixed"
                          ? "Discount Amount (Fixed)"
                          : "Discount Percentage"
                      }
                      name="discountValue"
                      value={form.discountValue}
                      min="1"
                      max="1000"
                      onChange={(value) => handleChange(value, "discountValue")}
                      autoComplete="off"
                      type="number"
                      prefix={form.discountType === "percentage" ? "%" : "$"}
                      placeholder={`Enter discount ${form.discountType === "fixed" ? "amount" : "percentage"}`}
                    />
                  </FormLayout.Group>
                )}

                <Button submit variant="primary" loading={isLoading}>
                  Update Form
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Modal for error messages */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Validation Error"
        primaryAction={{
          content: "Close",
          onAction: handleCloseModal,
        }}
      >
        <Modal.Section>
          <Text color="critical">{errorMessage}</Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
