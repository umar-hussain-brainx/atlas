import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Icon,
  Popover,
  ActionList,
  Button
} from "@shopify/polaris";
import { MenuVerticalIcon } from "@shopify/polaris-icons"; // Icon for the "More" button
import { authenticate } from "../shopify.server";
import { getCustomForms, deleteCustomForm } from "../db.server";
import { useState } from "react";

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
  const [popoverActive, setPopoverActive] = useState(null); // To track popover for each form

  const togglePopover = (id) => {
    setPopoverActive((prev) => (prev === id ? null : id)); // Toggle popover by form id
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      fetcher.submit({ action: "delete", id }, { method: "post" });
    }
  };

  return (
    <Page>
      <div
        style={{
          margin: "15px 0",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#fff",
          padding: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text variant="headingLg" style={{ flex: 1, textAlign: "center" }}>
            Atlas Headrest Affiliate App
          </Text>
          <Button variant="primary" style={{ marginLeft: "10px" }} url="/app/forms/new">
              Create New Form
          </Button>
        </div>
      </div>

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <BlockStack gap="200">
                <Text as="h3" variant="headingLg">
                  Existing Forms
                </Text>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                  }}
                >
                  {forms.map((form) => (
                    <Card
                      key={form.id}
                      sectioned
                      style={{
                        flex: "1 1 calc(50% - 20px)",
                        boxSizing: "border-box",
                      }}
                    >
                      <BlockStack gap="200">
                      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <Popover
                        active={popoverActive === form.id}
                        activator={
                          <Button
                            onClick={() => togglePopover(form.id)}
                            plain
                            icon={MenuVerticalIcon} // Replace with your desired icon
                          />
                        }
                        onClose={() => setPopoverActive(null)}
                      >
                        <ActionList
                          items={[
                            {
                              content: "Edit",
                              url: `/app/forms/${form.id}/edit`,
                            },
                            {
                              content: "Delete",
                              destructive: true,
                              onAction: () => handleDelete(form.id),
                            },
                          ]}
                        />
                      </Popover>
                    </div>
                        <Text as="h4" variant="headingMd">
                          {form.title}
                        </Text>
                        <Text as="p">{form.description}</Text>
                      </BlockStack>
                    </Card>
                  ))}
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
