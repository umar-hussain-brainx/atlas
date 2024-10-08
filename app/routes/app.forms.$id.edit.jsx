import { json } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { Page, Layout, Form, FormLayout, TextField, Button, Card } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getCustomFormById, updateCustomForm } from "../db.server";
import { useState } from "react";

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
  const formData = await request.formData();
  const formId = params.id;

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

  await updateCustomForm(formId, updatedForm);

  return json({ message: "Form updated successfully" });
};

export default function EditForm() {
  const { form: initialForm } = useLoaderData();
  const [form, setForm] = useState(initialForm);
  const submit = useSubmit();
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(e.target, { method: "post" });
  };

  const handleChange = (value, name) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    
    <Page
      narrowWidth
      title="Edit Form"
      primaryAction={{
        content: "Back",
        url: `/app/forms`,
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
                />
                  </FormLayout.Group>
                  <FormLayout.Group>
                <TextField
                  label="Input Heading"
                  name="inputHeading"
                  value={form.inputHeading}
                  onChange={(value) => handleChange(value, "inputHeading")}
                  autoComplete="off"
                />
                <TextField
                  label="Submit Button Text"
                  name="submitButtonText"
                  value={form.submitButtonText}
                  onChange={(value) => handleChange(value, "submitButtonText")}
                  autoComplete="off"
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
                />
                </FormLayout.Group>
                 <FormLayout.Group>
                <TextField
                  label="Coupon Prefix"
                  name="couponPrefix"
                  value={form.couponPrefix}
                  onChange={(value) => handleChange(value, "couponPrefix")}
                  autoComplete="off"
                />
                <TextField
                  label="Coupon Postfix"
                  name="couponPostfix"
                  value={form.couponPostfix}
                  onChange={(value) => handleChange(value, "couponPostfix")}
                  autoComplete="off"
                />
                </FormLayout.Group>
                <FormLayout.Group>
                <TextField
                  label="Discount Type"
                  name="discountType"
                  value={form.discountType}
                  onChange={(value) => handleChange(value, "discountType")}
                  autoComplete="off"
                />
                <TextField
                  label="Discount Value"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={(value) => handleChange(value, "discountValue")}
                  autoComplete="off"
                />
                </FormLayout.Group>
                <Button submit loading={isLoading}>Update Form</Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
