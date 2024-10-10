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
          <button type="submit">${formData.submitButtonText}
          <svg  class="loader hide" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><radialGradient id='a11' cx='.66' fx='.66' cy='.3125' fy='.3125' gradientTransform='scale(1.5)'><stop offset='0' stop-color='#FF156D'></stop><stop offset='.3' stop-color='#FF156D' stop-opacity='.9'></stop><stop offset='.6' stop-color='#FF156D' stop-opacity='.6'></stop><stop offset='.8' stop-color='#FF156D' stop-opacity='.3'></stop><stop offset='1' stop-color='#FF156D' stop-opacity='0'></stop></radialGradient>
          <circle transform-origin='center' fill='none' stroke='#FFF' stroke-width='15' stroke-linecap='round' stroke-dasharray='200 1000' stroke-dashoffset='0' cx='100' cy='100' r='70'><animateTransform type='rotate' attributeName='transform' calcMode='spline' dur='2' values='360;0' keyTimes='0;1' keySplines='0 0 1 1' repeatCount='indefinite'></animateTransform></circle>
          <circle transform-origin='center' fill='none' opacity='.2' stroke='#f5f5f5' stroke-width='15' stroke-linecap='round' cx='100' cy='100' r='70'></circle></svg>
          </button>
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
