function loadComponent(htmlPath, containerId, cssPath = null, jsPath = null, callback = null) {
  fetch(htmlPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${htmlPath}: ${response.statusText}`);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById(containerId).innerHTML = data;

      if (cssPath) {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssPath;
        document.head.appendChild(link);
      }
      if (jsPath) {
        let script = document.createElement("script");
        script.src = jsPath;
        script.onload = () => {
          console.log(`${jsPath} loaded successfully.`);
          if (callback && typeof callback === "function") {
            callback(); 
          }
        };
        document.body.appendChild(script);
      }
    })
    .catch((error) => console.error(`Error loading ${containerId}:`, error));
}

loadComponent(
  "./Frontend/Navbar.html",
  "navbar-container",
  "./Frontend/Navbar.css",
  "./Backend/Navbar.js",
  () => {
    if (typeof updateNavbar === "function") {
      updateNavbar();
    } else {
      console.error("updateNavbar function is not defined.");
    }
  }
);

loadComponent(
  "./Frontend/CloudCards.html",
  "services",
  null,
  "./Frontend/ServiceCards.js"
);


loadComponent(
  "./Frontend/terminal.html",
  "terminal",
  null,
  "./Frontend/Terminal.js",
  () => {
    if (typeof addLine === "function") {
      addLine(); 
    }
  }
);


document.addEventListener("DOMContentLoaded", function () {
  let video = document.getElementById("preloader-video");
  let preloader = document.getElementById("preloader");
  let content = document.getElementById("content");

  if (video) {
    video.onended = function () {
      preloader.style.display = "none";
      content.style.display = "block";
    };
  } else {
    console.error("Preloader video element not found.");
  }
});
