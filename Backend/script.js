const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const ipAddress = CONFIG.PUBLIC_IP;

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function getTokenFromCookies() {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "authToken") return value;
  }
  return null;
}

console.log("Token:", getTokenFromCookies());

async function verifyToken() {
  try {
    const token = getTokenFromCookies();

    if (!token) {
      console.error("No authToken found in cookies.");
      return;
    }

    const response = await fetch(`${ipAddress}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.valid) {
      redirectToHostingPage();
    } else {
      console.error("Invalid token.");
    }
  } catch (error) {
    console.error("Token verification failed:", error);
  }
}

function redirectToHostingPage() {
  const selectedHosting = localStorage.getItem("selectedHosting"); // Retrieve stored choice

  if (selectedHosting?.includes("Static")) {
    window.location.href = "../Frontend/S3hosting.html";
  } else if (selectedHosting?.includes("EC2")) {
    window.location.href = "../Frontend/ec2-hosting.html";
  } else {
    console.error("No valid hosting type selected.");
  }
}

verifyToken();

function validateSignupForm() {
  const username = document.getElementById("name").value;
  const email = document.getElementById("email").value; 
  const password = document.getElementById("password").value;
  const usernameRegex = /^[a-zA-Z]/;
  if (!usernameRegex.test(username)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Username",
      text: "Username must start with a letter.",
      backdrop: false,
      confirmButtonText: "OK",
    });
    return false;
  }

  // Email validation
  const emailRegex =
    /^[^\s@]+@((gmail\.com|yahoo\.com|outlook\.com)|stu[^\s@]*\.[a-z]{2,})$/i;
  if (!emailRegex.test(email)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Only Gmail, Yahoo, Outlook, or student emails (domains starting with 'stu') are allowed.",
      backdrop: false,
      confirmButtonText: "OK",
    });
    return false;
  }

  // Password validation (at least 8 characters, 1 number, 1 special char, 1 uppercase, 1 lowercase)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Password",
      text: "Please enter a password that contains at least 8 characters (including 1 uppercase letter, 1 number, and 1 special character).",
      backdrop: false,
      confirmButtonText: "OK",
    });
    return false;
  }

  return true;
}

// Signup form submission
document
  .getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Form submission triggered");

    if (!validateSignupForm()) {
      console.log("Client-side validation failed");
      return;
    }

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Collected input:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    try {
      console.log("Sending signup request to:", `${ipAddress}/signup`);

      const response = await fetch(`${ipAddress}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      console.log("Raw response:", response);

      let data;
      try {
        data = await response.clone().json();
        console.log("Parsed response JSON:", data);
      } catch (err) {
        const text = await response.text();
        console.error("Response was not valid JSON. Raw response text:", text);
        throw new Error("Invalid JSON in server response");
      }

      if (response.ok) {
        console.log("Signup success. Token received:", data.token);

        document.cookie = `authToken=${data.token}; path=/; max-age=3600; Samesite=Lax`;

        Swal.fire({
          icon: "success",
          title: "Signup Successful! Go ahead and deploy!!",
          backdrop: false,
          text: "Redirecting...",
          showConfirmButton: false,
          timer: 1000,
        });

        setTimeout(() => {
          const selectedHosting = localStorage.getItem("selectedHosting");
          console.log("Redirecting based on selected hosting:", selectedHosting);

          if (selectedHosting) {
            if (selectedHosting.includes("Static")) {
              localStorage.removeItem("selectedHosting");
              window.location.href = "../Frontend/S3hosting.html";
            } else if (selectedHosting.includes("EC2")) {
              localStorage.removeItem("selectedHosting");
              window.location.href = "../Frontend/ec2-hosting.html";
            } else {
              window.location.href = "../index.html#services";
            }
          } else {
            window.location.href = "../index.html#services";
          }
        }, 1000);

      } else {
        console.warn("Signup failed:", data.message);
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          backdrop: false,
          text: data.message || "Please try again.",
          confirmButtonText: "OK",
        });
      }

    } catch (error) {
      console.error("Signup error caught:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        backdrop: false,
        text: "Something went wrong. Please try again.",
        confirmButtonText: "OK",
      });
    }
  });


// Sign-in form submission
document
  .getElementById("signin-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
      const response = await fetch(`${ipAddress}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        document.cookie = `authToken=${data.token}; path=/; max-age=3600; Samesite=Lax`;

        Swal.fire({
          icon: "success",
          title: "Sign-in Successful! Go ahead and deploy your code! ",
          text: "Redirecting...",
          backdrop: false,
          timer: 2000,
        });

        setTimeout(() => {
          const selectedHosting = localStorage.getItem("selectedHosting");

          if (selectedHosting) {
            if (selectedHosting.includes("Static")) {
              localStorage.removeItem("selectedHosting");
              window.location.href = "../Frontend/S3hosting.html";
            } else if (selectedHosting.includes("EC2")) {
              localStorage.removeItem("selectedHosting");
              window.location.href = "../Frontend/ec2-hosting.html";
            } else {
              window.location.href = "../index.html#services";
            }
          } else {
            window.location.href = "../index.html#services";
          }
        }, 1000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Sign-in Failed",
          backdrop: false,
          text: data.message || "Please try again.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        backdrop: false,
        text: "Something went wrong. Please try again.",
      });
    }
  });
