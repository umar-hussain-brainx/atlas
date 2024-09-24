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
  FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { createCustomForm } from "../db.server";

export const loader = async ({ request }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    return redirect("/auth");
  }
  return json({});
};

export const action = async ({ request }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    return json({ error: "Authentication failed" }, { status: 401 });
  }

  const formData = await request.formData();
  const formFields = [
    "title", "description", "inputHeading", "submitButtonText",
    "customCss", "couponPrefix", "couponPostfix"
  ];
  const data = Object.fromEntries(
    formFields.map(field => [field, formData.get(field)])
  );

  await createCustomForm(data);
  return redirect("/app"); // Redirect to the main page after form creation
};

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
  });

  const handleChange = (field) => (value) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetcher.submit(formState, { method: "post" });
  };

  return (
    <Page>
      <TitleBar title="Create New Custom Signup Form" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <form onSubmit={handleSubmit}>
                <FormLayout>
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
                  <TextField
                    label="Custom CSS"
                    value={formState.customCss}
                    onChange={handleChange("customCss")}
                    multiline={4}
                  />
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
                  <Button primary submit>
                    Create Form
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