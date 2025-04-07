document.addEventListener("DOMContentLoaded", function () {
    const headingTop = document.querySelector(".heading-top");
    const headingBottom = document.querySelector(".heading-bottom");
    const heroSection = document.querySelector(".hero");
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.7) &&
            rect.bottom >= (window.innerHeight * 0.3)
        );
    }
    
    // Trigger animation on page load
    setTimeout(function() {
        if (isInViewport(heroSection)) {
            headingTop.classList.add("active");
            headingBottom.classList.add("active");
        }
    }, 300);
    
    function handleScroll() {
        if (isInViewport(heroSection)) {
            // When heading is in viewport → Show heading (slide to center)
            headingTop.classList.add("active");
            headingBottom.classList.add("active");
        } else {
            // When scrolled away → Hide heading (slide back)
            headingTop.classList.remove("active");
            headingBottom.classList.remove("active");
        }
    }
    
    // Initial check on page load
    handleScroll();
    
    // Check on scroll
    window.addEventListener("scroll", handleScroll);
});