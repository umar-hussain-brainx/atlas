import { json, redirect } from "@remix-run/node";
import { createCustomForm, getCustomForms } from "../db.server";

export const loader = async () => {
  const forms = await getCustomForms();
  console.log("Loaded forms:", forms); // Debugging log
  return json({ forms });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const inputHeading = formData.get("inputHeading");
  const inputPlaceholder = formData.get("inputPlaceholder");
  const submitButtonText = formData.get("submitButtonText");
  const customCss = formData.get("customCss");
  const couponPrefix = formData.get("couponPrefix");
  const couponPostfix = formData.get("couponPostfix");

  console.log("Form data received:", { title, description, inputHeading, inputPlaceholder, submitButtonText, customCss, couponPrefix, couponPostfix }); // Debugging log

  await createCustomForm({
    title,
    description,
    inputHeading,
    inputPlaceholder,
    submitButtonText,
    customCss,
    couponPrefix,
    couponPostfix,
  });

  return redirect("/webhooks/customers/redact");
};
