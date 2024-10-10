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
    const data = Object.fromEntries(formData.entries());
    // const loader = document.querySelector('body .loader');
    // if (loader) {
    //   loader.classList.remove('hide');
    // }

    try {

      const response = await fetch(`https://${shop}/apps/atlas-proxy/submitform`, {
        method: 'POST',
        redirect: "manual",
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      // Display coupon code after form submission
      const couponCode = result.couponCode;

      function handleCouponCode(couponCode) {
        const couponDiv = document.querySelector('.atlasAppTrigger');
        const imageElement = couponDiv.querySelector('img');
        const formElement = couponDiv.querySelector('form');
      
        // Remove the form if it exists
        if (formElement) {
          formElement.remove();
        }
      
        if (couponCode) {
          const buttonHTML = `
            <div>
              <h2>THANKS FOR SIGNING UP!</h2>
              <p>Use Code for 20% off your first order.</p>
              <button role="button" id="copyButton" aria-label="Copy coupon code" 
                class="needsclick go4024032121 kl-private-reset-css-Xuajs1" 
                style="position: relative; display: flex; flex-direction: row; align-items: center;
                padding: 25px; justify-content: center; background: rgba(255, 255, 255, 0);
                border-radius: 4px; border: 4px dashed rgb(0, 0, 0); color: rgb(0, 0, 0); 
                line-height: 1; text-align: center; word-break: break-word; cursor: pointer;
                width: 100%;">
                
                <div class="needsclick kl-private-reset-css-Xuajs1" 
                  style="padding: 10px; font-family: Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace; 
                  font-size: 24px; font-weight: 700;">
                  ${couponCode}
                </div>

                <svg id="copyIcon" class="needsclick  kl-private-reset-css-Xuajs1" style="color: rgb(0, 0, 0); height: 32px; width: 32px;cursor: pointer; flex-shrink: 0;"><svg width="32" height="33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.602 1.1a3 3 0 0 0-3 3v18.4a3 3 0 0 0 3 3H8v-2H3.602a1 1 0 0 1-1-1V4.1a1 1 0 0 1 1-1h15.2a1 1 0 0 1 1 1v1.2h2V4.1a3 3 0 0 0-3-3h-15.2Z" fill="currentColor"></path><rect x="11.199" y="8.5" width="19.2" height="22.4" rx="2" stroke="currentColor" stroke-width="2"></rect></svg></svg>
              </button>
            </div>
          `;
      
          // Insert the button into the coupon div
          if (imageElement) {
            imageElement.insertAdjacentHTML('afterend', buttonHTML);
          }
      
          // Add event listener to copy coupon code
          document.getElementById('copyButton').addEventListener('click', function() {
            // Copy coupon code to clipboard
            const tempInput = document.createElement('input');
            tempInput.value = couponCode;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
      
            // Update the icon after copy
            const copyIcon = document.getElementById('copyIcon');
            copyIcon.innerHTML = `
              <svg width="32" height="33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 24l-8-8 2.828-2.828L12 18.344 25.172 5.172 28 8l-16 16z" fill="green"></path>
              </svg>`;
          });
        } else {
          // User already signed up
          const messageHTML = `
            <div>
              <h2>Sorry, You are already signed up!</h2>
            </div>
          `;
      
          // Insert the message into the coupon div
          if (imageElement) {
            imageElement.insertAdjacentHTML('afterend', messageHTML);
          }
        }
      }
      handleCouponCode(couponCode);


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
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    const afValue = getQueryParam('af');

    for (const trigger of appTriggers) {
     
      const formId = afValue /// Ensure this is defined
      if (formId) {
        try {
          const data = await fetchFormData(formId); // Correctly use formId here
  
          if (data && data.formHTML) {
            renderForm(trigger, formId, data.formHTML);
  
            // Create the image element and set its source
            const image = document.createElement('img');
            image.src = 'https://atlasheadrest.com/cdn/shop/files/Placeholder_Image_10.png?v=1699343670&width=500';
  
            // Insert the image before the form inside the current trigger element
            const formElement = trigger.querySelector('form');
            if (formElement) {
              trigger.insertBefore(image, formElement);
            }
          } else {
            trigger.innerHTML = ` <div>
              <h2>Oops, Not available!</h2>
            </div>`;
          }
        } catch (error) {
          trigger.innerHTML = `<div>
              <h2>Oops, incorrect form URL!</h2>
            </div>`;
          console.error('Error fetching form data:', error);
        }
      }
    }
  }
  
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', initAtlasApp);
