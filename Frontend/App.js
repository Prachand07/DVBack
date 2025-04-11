// First check if we should redirect to mobile version
if (window.innerWidth <= 768) {
  // Check if we're already on the mobile page to prevent infinite redirect
  if (!window.location.pathname.endsWith('/Frontend/phone.html')) {
    window.location.href = '/Frontend/phone.html';
  }
} else {
  // Only proceed with desktop version if screen is large enough
  if (!sessionStorage.getItem("preloaderShown")) {
    // Set flag in sessionStorage so it doesn't show again
    sessionStorage.setItem("preloaderShown", "true");

    window.addEventListener("load", function () {
      let checkReady = setInterval(() => {
        let navbar = document.getElementById("navbar-container");
        let services = document.getElementById("services");
        let terminal = document.getElementById("terminal");
        let preloader = document.getElementById("preloader");
        let video = preloader?.querySelector("video");

        if (navbar?.innerHTML.trim() !== "" && services?.innerHTML.trim() !== "" && terminal?.innerHTML.trim() !== "") {
          clearInterval(checkReady);

          // Smooth fade-out of preloader
          preloader.style.opacity = "0";
          preloader.style.display = "none"; // Hide after fade out
          document.documentElement.style.overflow = "auto"; // Enable scrolling
          document.body.style.overflow = "auto";
        }

        // Hide preloader when the video ends
        if (video) {
          video.onended = () => {
            preloader.style.opacity = "0";
            setTimeout(() => {
              preloader.style.display = "none";
              document.body.style.overflow = "auto";
            }, 1500);
          };
        }
      }, 1500);
    });
  } else {
    // If the preloader has already been shown, hide it immediately
    document.getElementById("preloader").style.display = "none";
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  }

  // Load desktop content
  fetch("./Frontend/Navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data; // Insert navbar HTML

      // Load JS dynamically and wait for it to finish loading
      let script = document.createElement("script");
      script.src = "./Backend/Navbar.js";
      script.onload = () => {
        if (typeof updateNavbar === "function") {
          updateNavbar(); // Call only after script loads
        } else {
          console.error("updateNavbar is not defined even after script load.");
        }
      };
      document.body.appendChild(script);
    })
    .catch((error) => console.error("Error loading navbar:", error));

  fetch("./Frontend/CloudCards.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("services").innerHTML = data;
      let script = document.createElement("script");
      script.src = "./Frontend/ServiceCards.js";
      document.body.appendChild(script);
    })
    .catch((error) => console.error("Error loading content:", error));

  fetch("./Frontend/terminal.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("terminal").innerHTML = data;

      // Ensure Terminal.js runs after DOM update
      setTimeout(() => {
        let script = document.createElement("script");
        script.src = "./Frontend/Terminal.js";
        script.onload = () => {
          console.log("Terminal.js reloaded successfully");
          if (typeof addLine === "function") {
            addLine(); // Manually start animation
          }
        };
        document.body.appendChild(script);
      }, 100);
    })
    .catch((error) => console.error("Error loading terminal:", error));

  fetch("./Frontend/footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      const footer = document.getElementById("footer");
      footer.innerHTML = data;

      // Extract and reinsert script tags
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data;
      const scripts = tempDiv.querySelectorAll("script");

      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
      });
    })
    .catch((error) => console.error("Error loading content:", error));

}