import { getCustomFormById } from "../db.server"; // Import the correct function
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {

  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (request.method !== 'GET') {
    const failedResponseData = {
      message: 'Method not allowed',
    };

    
    return new Response(JSON.stringify(failedResponseData), {
      status: 405, // Method Not Allowed
      headers: responseHeaders,
    });
  }

  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: responseHeaders,
    });
  }

  const url = new URL(request.url);
  const formId = url.searchParams.get("formId");

  try {
    const formData = await getCustomFormById(formId); // Fetch a single form by ID

    if (!formData) {
      throw new Response("Form not found", { status: 404 });
    }

    const formHTML = `
        <form id="atlasForm-${formId}">
          <h2>${formData.title}</h2>
          <p>${formData.description}</p>
          <input type="email" id="email" placeholder="Email" name="email" required>
          <button type="submit">${formData.submitButtonText}</button>
        </form>
        <style>${formData.customCss}</style>`;
        
    return new Response(JSON.stringify({formHTML}), {
      status: 200, // OK
      headers: responseHeaders,
    });


  } catch (error) {

    console.error('Error fetching form data:', error);
    const failedResponseData = {
      message: 'Error fetching form data',
      error: error.message || 'Unknown error',
    };

    return new Response(JSON.stringify(failedResponseData), {
      status: 500,
      headers: responseHeaders,
    });
  }
};
