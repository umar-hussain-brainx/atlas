// Function to fetch form data from the Remix loader
async function fetchFormData(formId) {
    

    try {
        const requestOptions = {
            method: "GET",
            redirect: "follow",
            headers: {
                "ngrok-skip-browser-warning": true,
            },
            };
      
        const response = await fetch(`https://a6f2-122-129-85-58.ngrok-free.app/api/getFormData/?formId=${formId}`, requestOptions)
            
    //   const response = await fetch(`https://a6f2-122-129-85-58.ngrok-free.app/api/getFormData/?formId=${formId}`);
      
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
  
  // Function to render the form in the trigger div
  function renderForm(container, formHTML) {
    container.innerHTML = formHTML;
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
          renderForm(trigger, data.formHTML);
        } else {
          trigger.innerHTML = '<p>Error loading form. Please try again later.</p>';
        }
      }
    }
  }
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', initAtlasApp);
