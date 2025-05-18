document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactform');

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Get input values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const ipAddress = CONFIG.PUBLIC_IP;
    console.log(ipAddress);
    // Validate fields
    if (!name || !email || !message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill out all fields before submitting.",
        confirmButtonColor: "#f39c12"
      });
      return;
    }

    //name validation
    const nameRegex = /^[a-zA-Z][a-zA-Z\s]*$/;
    if (!nameRegex.test(name)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Name",
        text: "Name must start with a letter and contain only letters and spaces.",
        confirmButtonColor: "#d33"
      });
      return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@((gmail\.com|yahoo\.com|outlook\.com)|stu[^\s@]*\.[a-z]{2,})$/i;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Only Gmail, Yahoo, Outlook, or student emails (domains starting with 'stu') are allowed.",
        backdrop: false,
        confirmButtonText: "OK"
      });
      return;
    }

    // Prepare data
    const formData = {
      name,
      email,
      message
    };

    // Send to backend
    fetch(`${ipAddress}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json(); // Change if backend returns text
    })
    .then(data => {
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'Thank you for reaching out.',
        confirmButtonColor: '#3085d6'
      });
      contactForm.reset();
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#d33'
      });
      console.error('Error:', error);
    });
  });

  // Input animation on focus
  const formInputs = document.querySelectorAll('.form-input, .form-textarea');
  formInputs.forEach(input => {
    input.addEventListener('focus', function () {
      this.parentElement.classList.add('input-active');
    });

    input.addEventListener('blur', function () {
      if (!this.value.trim()) {
        this.parentElement.classList.remove('input-active');
      }
    });
  });
});