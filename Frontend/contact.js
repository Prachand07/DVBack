
document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactform');

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Form data object
    const formData = {
      name,
      email,
      message
    };

    // Send POST request to backend
    fetch('http://localhost:8090/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // or response.text() based on backend
    })
    .then(data => {
      // Show SweetAlert success and reset form
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'Thank you for reaching out.',
        confirmButtonColor: '#3085d6'
      });

      contactForm.reset();
    })
    .catch(error => {
      // Optional error alert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#d33'
      });
      console.error('Error:', error);
    });
  });

  // Input focus/blur animation
  const formInputs = document.querySelectorAll('.form-input, .form-textarea');
  formInputs.forEach(input => {
    input.addEventListener('focus', function () {
      this.parentElement.classList.add('input-active');
    });

    input.addEventListener('blur', function () {
      if (!this.value) {
        this.parentElement.classList.remove('input-active');
      }
    });
  });
});
