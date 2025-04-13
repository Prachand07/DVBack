document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      
      // Form data object
      const formData = {
        name,
        email,
        subject,
        message
      };
      
      // Log form data (replace with your actual form submission logic)
      console.log('Form submitted:', formData);
      
      // Show success message with animation
      const button = document.querySelector('.submit-button');
      const buttonContent = document.querySelector('.button-content');
      
      // Add success state
      button.classList.add('success');
      buttonContent.innerHTML = '<span>Message Sent!</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
      
      // Reset form and button after delay
      setTimeout(() => {
        contactForm.reset();
        button.classList.remove('success');
        buttonContent.innerHTML = 'Send Message <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="send-icon"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>';
      }, 3000);
    });
    
    // Add focus and blur event listeners for form inputs
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    
    formInputs.forEach(input => {
      // Add active class to parent when input is focused
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('input-active');
      });
      
      // Remove active class when input loses focus
      input.addEventListener('blur', function() {
        if (!this.value) {
          this.parentElement.classList.remove('input-active');
        }
      });
    });
  });