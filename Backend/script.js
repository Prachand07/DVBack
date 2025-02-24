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

        

        const response = await fetch(`http://${ipAddress}:8090/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (data.valid) {
            window.location.href = "../Frontend/S3hosting.html";
        } else {
            console.error("Invalid token.");
        }
    } catch (error) {
        console.error("Token verification failed:", error);
    }
}

verifyToken();

// Function to validate the signup form
function validateSignupForm() {
    const username = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    // Username validation (must start with a letter)
    const usernameRegex = /^[a-zA-Z]/;
    if (!usernameRegex.test(username)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Username",
            text: "Username must start with a letter.",
            backdrop: false, // Prevent white background
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
            text: "Please enter a password that contains at least 8 Characters(with at least 1 uppercase), 1 Number,1 special character",
            backdrop: false, // Prevent white background
            confirmButtonText: "OK",
        });
        return false;
    }

    return true;
}

// Signup form submission
document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateSignupForm()) {
        return; // Stop request if validation fails
    }

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`http://${ipAddress}:8090/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            document.cookie = `authToken=${data.token}; path=/; max-age=3600; Samesite=Lax`;
            Swal.fire({
                icon: "success",
                title: "Signup Successful!",
                backdrop: false,
                text: "Redirecting...",
                showConfirmButton: false,
                timer: 1000,
            });

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);
        } else {
            Swal.fire({
                icon: "error",
                title: "Signup Failed",
                backdrop: false,
                text: data.message || "Please try again.",
                confirmButtonText: "OK",
            });
        }
    } catch (error) {
        console.error("Signup failed:", error);
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
document.getElementById("signin-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
        
        const response = await fetch(`http://${ipAddress}:8090/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            document.cookie = `authToken=${data.token}; path=/; max-age=3600; Samesite=Lax`;

            Swal.fire({
                icon: "success",
                title: "Sign-in Successful!",
                text: "Redirecting...",
                backdrop: false,
                timer: 2000,
            });

            setTimeout(() => {
                window.location.href = "../index.html";
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
