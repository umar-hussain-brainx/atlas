import { authenticate } from "../shopify.server";
import shopify from "../shopify.server";
import { authenticate } from "../../shopify.server";
import { findCustomerByEmailAndFormId, createCustomer, getCustomFormById } from "../../db.server";

export const action = async ({ request }) => {

  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: responseHeaders,
    });
  }

  const { email, formId } = await request.json();
  // Check if the customer already exists
  const existingCustomer = await findCustomerByEmailAndFormId(email, formId);

  if (existingCustomer) {
  
    
    if (customerData.data.customers.edges.length > 0) {
      // Customer exists in Shopify, return a message
      return new Response(JSON.stringify({ message: 'Customer already exists' }), {
        status: 400,
        headers: responseHeaders,
      });
    }
    
    // If customer doesn't exist, continue with the rest of the code...
  }

  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (request.method !== 'POST') {
    const failedResponseData = {
      message: 'Method not allowed',
    };

    
    return new Response(JSON.stringify(failedResponseData), {
      status: 405, // Method Not Allowed
      headers: responseHeaders,
    });
  }

  const customerCreateMutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        segment {
          id
        }
        userErrors {
          field
          message
        }
      }
  }`;

    const customerResponse = await admin.graphql(customerCreateMutation, {
      variables: {
       "input": {
        "email": email,
        "acceptsMarketing": true
        }
      },
    });

    const responseJson = await customerResponse.json();
    console.log(responseJson);

    return new Response(JSON.stringify({ message: 'Form submitted successfully' }), {
      status: 200,
      headers: responseHeaders,
    });


};
