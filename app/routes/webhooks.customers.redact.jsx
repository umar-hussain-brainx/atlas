import { json, redirect } from "@remix-run/node";
import { createCustomForm, getCustomForms, updateCustomForm, deleteCustomForm } from "../db.server";

export const loader = async () => {
  const forms = await getCustomForms();
  console.log("Loaded forms:", forms); // Debugging log
  return json({ forms });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "create":
    case "update":
      const formFields = [
        "title", "description", "inputHeading", "submitButtonText",
        "customCss", "couponPrefix", "couponPostfix"
      ];
      const data = Object.fromEntries(
        formFields.map(field => [field, formData.get(field)])
      );
      if (action === "create") {
        await createCustomForm(data);
      } else {
        const id = formData.get("id");
        await updateCustomForm(id, data);
      }
      break;
    case "delete":
      const id = formData.get("id");
      console.log("Deleting form with id:", id); // Debugging log
      await deleteCustomForm(id);
      break;
  }

  return json({ success: true });
};
