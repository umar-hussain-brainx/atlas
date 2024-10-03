// Function to fetch form data from the Remix loader
async function fetchFormData(formId) {
    try {
        const requestOptions = {
            method: "GET",
            redirect: "manual",
            headers: {
                "ngrok-skip-browser-warning": true,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            };
      
        const response = await fetch(`https://${shop}/apps/atlas-proxy/getFormData?formId=${formId}`, requestOptions)
      
      if (!response.ok) {
        throw new Error('Failed to fetch form data');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching form data:', error);
      return null;
    }
  }
  
  // Function to handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
  
    try {
      const response = await fetch(`https://${shop}/apps/atlas-proxy/submitform`, {
        method: 'POST',
        redirect: "manual",
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify({
          ...Object.fromEntries(formData),
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      alert('Form submitted successfully!');
      // You can add more user feedback or actions here
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  }

  // Function to render the form in the trigger div
  function renderForm(container, formId, formHTML) {
    container.innerHTML = formHTML;
    const form = container.querySelector('form');
    if (form) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'formId';
      hiddenInput.value = formId;
      form.appendChild(hiddenInput);
    }
  
  
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  }
  
  // Main function to initialize forms
  async function initAtlasApp() {
    const appTriggers = document.querySelectorAll('.atlasAppTrigger');
  
    for (const trigger of appTriggers) {
      const formId = trigger.getAttribute('data-id'); // Ensure this is defined
      console.log('Fetching form data for ID:', formId);
      if (formId) {
        const data = await fetchFormData(formId); // Correctly use formId here
  
        if (data && data.formHTML) {
          renderForm(trigger, formId, data.formHTML);
        } else {
          trigger.innerHTML = '<p>Error loading form. Please try again later.</p>';
        }
      }
    }
  }
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', initAtlasApp);
