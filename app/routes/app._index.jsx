import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getCustomForms, deleteCustomForm } from "../db.server";

export const loader = async ({ request }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    return redirect("/auth");
  }
  const forms = await getCustomForms();
  return json({ forms });
};

export const action = async ({ request }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    return json({ error: "Authentication failed" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "delete") {
    const id = formData.get("id");
    await deleteCustomForm(id);
    return json({ success: true });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function Index() {
  const { forms } = useLoaderData();
  const fetcher = useFetcher();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      fetcher.submit({ action: "delete", id }, { method: "post" });
    }
  };

  return (
    <Page>
      <TitleBar title="Atlas Headrest Affiliate Forms" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <BlockStack gap="500">
                <Button primary>
                  <Link to="/forms/new">Create New Form</Link>
                </Button>
              </BlockStack>
            </Card>
            <Card sectioned>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Existing Forms
                </Text>
                {forms.map((form) => (
                  <Card key={form.id} sectioned>
                    <BlockStack gap="200">
                      <Text as="h4" variant="headingSm">{form.title}</Text>
                      <Text as="p">{form.description}</Text>
                      <ButtonGroup>
                        <Button>
                          <Link to={`/forms/${form.id}/edit`}>Edit</Link>
                        </Button>
                        <Button destructive onClick={() => handleDelete(form.id)}>Delete</Button>
                      </ButtonGroup>
                    </BlockStack>
                  </Card>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
