fetch("./Frontend/Navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-container").innerHTML = data; // Insert navbar HTML

    // Load CSS
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./Frontend/Navbar.css";
    document.head.appendChild(link);

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

