import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
import { getCustomForms, updateCustomForm } from "../db.server";

export const loader = async ({ request, params }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    return redirect("/auth");
  }
  const form = await getCustomForms(params.id);
  return json({ form });
};

export const action = async ({ request, params }) => {
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

  await updateCustomForm(params.id, data);
  return redirect("/app");
};

export default function EditForm() {
  const { form } = useLoaderData();
  const fetcher = useFetcher();

  const [formState, setFormState] = useState(form);

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
      <TitleBar title="Edit Custom Signup Form" />
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
                    Update Form
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