const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

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

        const response = await fetch("http://13.60.85.61:8090/verify", {
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

document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http:/13.60.85.61:8090/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            document.cookie = `authToken=${data.token}; path=/; max-age=3600; Samesite=Lax`;
            console.log(data);
            Swal.fire({
                icon: "success",
                title: "Signup Successful!",
                backdrop: false,
                text: "Redirecting...",
                showConfirmButton: false,
                timer: 1000,
            });

            setTimeout(() => {
                window.location.href = "../Frontned/SignUp.html";
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
            text: "Something went wrong. Please try again.",
            backdrop: false,
            confirmButtonText: "OK",
        });
    }
});

document.getElementById("signin-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
        const response = await fetch("http://13.60.85.61:8090/signin", {
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
                window.location.href = "../Frontend/S3hosting.html";
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
            text: "Something went wrong. Please try again.",
        });
    }
});
