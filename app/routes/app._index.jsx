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
  Button,
  Modal,
  Toast,
  Frame 
} from "@shopify/polaris";
import { MenuVerticalIcon, ClipboardIcon } from "@shopify/polaris-icons"; 
import { authenticate } from "../shopify.server";
import { getCustomForms, deleteCustomForm } from "../db.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  const authHeader = await authenticate.admin(request);
  if (!authHeader) {
    return redirect("/auth");
  }
  const shop = authHeader.session.shop;
  const forms = await getCustomForms();
  return json({ forms, shop });
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
  const { forms, shop } = useLoaderData();
  const fetcher = useFetcher();
  const [popoverActive, setPopoverActive] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [formIdToDelete, setFormIdToDelete] = useState(null);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const togglePopover = (id) => {
    setPopoverActive((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id) => {
    setFormIdToDelete(id);
    setModalActive(true);
  };

  const confirmDelete = () => {
    fetcher.submit({ action: "delete", id: formIdToDelete }, { method: "post" });
    setModalActive(false);
  };

  const cancelDelete = () => {
    setModalActive(false);
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setToastMessage(`Copied Snippet ID: ${id}`);
      setToastActive(true);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <Frame>
      <Page>
        <div style={{ margin: "15px 0", borderRadius: "10px", overflow: "hidden", backgroundColor: "#fff", padding: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
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
                <BlockStack gap="200" >
                  <Text as="h3" variant="headingLg">Existing Forms</Text>
                  {forms.length === 0 ? (
                    <BlockStack gap="200" alignment="center">
                      <Text>No data available. Click the button above to create a form.</Text>
                    </BlockStack>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                      {forms.map((form) => (
                        <Card key={form.id} sectioned>
                          <BlockStack gap="200">
                            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                              <Popover
                                active={popoverActive === form.id}
                                activator={
                                  <Button
                                    onClick={() => togglePopover(form.id)}
                                    plain
                                    icon={MenuVerticalIcon}
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
                              <div style={{ margin: "5px 0" }}>
                                <Button
                                  plain
                                  icon={ClipboardIcon}
                                  tone="base"
                                  onClick={() => copyToClipboard(`${shop}/pages/affiliate?af=${form.id}`)}
                                  style={{ cursor: 'pointer' }}
                                  aria-label={`Copy ID: ${form.id}`}
                                />
                              </div>
                            </div>
                            <div style={{ width: "90%", minHeight: "80px" }}>
                              <Text as="h4" variant="headingMd">{form.title}</Text>
                              <Text as="p">{form.description}</Text>
                            </div>
                          </BlockStack> 
                        </Card>
                      ))}
                    </div>
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>

        {/* Toast Notification */}
        {toastActive && (
          <Toast
            content={toastMessage}
            onDismiss={() => setToastActive(false)}
            duration={3000}
          />
        )}

        {/* Modal for confirming delete action */}
        <Modal
          open={modalActive}
          onClose={cancelDelete}
          title="Confirm Delete"
          primaryAction={{
            content: "Delete",
            onAction: confirmDelete,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: cancelDelete,
            },
          ]}
        >
          <Modal.Section>
            <Text>Are you sure you want to delete this form?</Text>
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
