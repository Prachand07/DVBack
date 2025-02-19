
function GotoSignLogin() {
    window.location.href = "../Frontend/SignUp.html";
}

function logout() {
    document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";   // if not there cookies remain in session
    window.location.href = "../index.html";
}

function getTokenFromCookies() {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === "authToken") return value;
    }
    return null;
}
function scrollToTop() {
    window.location.href = "../index.html";
  }
  
  function scrollToServices() {
    document.getElementById("services").scrollIntoView({ behavior: "smooth" });
  }
  



function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1]; // Get payload part it has 3 parts header.payload.signature
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); //replace 
        return JSON.parse(atob(base64)); // Decode to Base64 and use as JS object
    } catch (e) {
        console.error("Error decoding token", e);
        return null;
    }
}


function getUserInitials(username) {
    // Extract the first letter of the first and last name
    const nameParts = username.split(" ");
    const firstLetter = nameParts[0].charAt(0).toUpperCase();
    const lastLetter =
        nameParts.length > 1
            ? nameParts[nameParts.length - 1].charAt(0).toUpperCase()
            : "";
    return firstLetter + lastLetter;
}

function updateNavbar() {
    console.log("Navbar is updating...");
    const token = getTokenFromCookies();
    const userInfoDiv = document.getElementById("user-info");

    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.username) {
            const initials = getUserInitials(decodedToken.username);
            const fullName = decodedToken.fullName || decodedToken.username;

            userInfoDiv.innerHTML = `
                <div class="user-menu">
                    <div class="user-info">
                        <div class="user-icon">${initials}</div>
                    </div>
                    <div class="dropdown-menu">
                        <div class="user-details">
                            <div class="avatar">${initials}</div>
                            <div class="user-name">${fullName}</div>
                        </div>
                        <ul class="menu-items">
                            <li>My Projects</li>
                            <li>Account Settings</li>
                            <li>Support & Feedback</li>
                        </ul>
                        <button onclick="logout()" class="logout-btn">Log Out</button>
                    </div>
                </div>
            `;

            const userInfo = document.querySelector(".user-info");
            const dropdownMenu = document.querySelector(".dropdown-menu");

            userInfo.addEventListener("click", function () {
                dropdownMenu.classList.toggle("show");
            });

            document.addEventListener("click", function (event) {
                if (
                    !userInfo.contains(event.target) &&
                    !dropdownMenu.contains(event.target)
                ) {
                    dropdownMenu.classList.remove("show");
                }
            });
        }
    } else {
        userInfoDiv.innerHTML = `<button onclick="GotoSignLogin()" class="cta">Sign In</button>`;
    }
}

window.updateNavbar = updateNavbar;
