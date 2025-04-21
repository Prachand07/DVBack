document.addEventListener('DOMContentLoaded', function() {
    // Create particles
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random animation delay
        const delay = Math.random() * 15;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    // TV hover effect - MODIFIED to only work when hovering over the TV container
    const tvContainer = document.querySelector('.tv-container');
    
    // Only apply 3D effect when mouse is over the TV container
    tvContainer.addEventListener('mousemove', function(e) {
        if (!tvContainer.classList.contains('fullscreen')) {
            // Get the position relative to the TV container
            const rect = tvContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position within the container
            const xAxis = (rect.width / 2 - x) / 15;
            const yAxis = (rect.height / 2 - y) / 15;
            
            tvContainer.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });
    
    // Reset transform when mouse leaves the TV container
    tvContainer.addEventListener('mouseleave', function() {
        tvContainer.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });

    // Video switching functionality
    const videoElement = document.getElementById('tv-video');
    const tvScreen = document.querySelector('.tv-screen');
    const prevButton = document.getElementById('prev-video');
    const nextButton = document.getElementById('next-video');
    const videoIndicators = document.querySelectorAll('.video-indicator');
    const textContents = document.querySelectorAll('.text-content');
    
    // Video sources array
    const videoSources = ['https://deployverse.s3.ap-south-1.amazonaws.com/video.mp4', 'https://deployverse.s3.ap-south-1.amazonaws.com/video1.mp4','https://deployverse.s3.ap-south-1.amazonaws.com/video2.mp4'];
    let currentVideoIndex = 0;
    
    // Function to switch text content with animation
    function switchTextContent(index) {
        // First, remove active class from all content blocks
        textContents.forEach(content => {
            if (content.classList.contains('active')) {
                content.classList.add('slide-out');
                setTimeout(() => {
                    content.classList.remove('active', 'slide-out');
                }, 500);
            }
        });
        
        // After a delay, add active class to the new content block
        setTimeout(() => {
            const newContent = document.querySelector(`.text-content[data-content="${index}"]`);
            newContent.classList.add('active', 'slide-in');
            
            setTimeout(() => {
                newContent.classList.remove('slide-in');
            }, 500);
        }, 500);
    }
    
    // Function to play video with TV on and glitch effects
    function playVideo(index) {
        // Update current index
        currentVideoIndex = index;
        
        // Update indicators
        videoIndicators.forEach((indicator, i) => {
            if (i === currentVideoIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Switch text content with animation
        switchTextContent(index);
        
        // Create new TV-on element with animation
        const oldTvOn = document.querySelector('.tv-on');
        const newTvOn = document.createElement('div');
        newTvOn.className = 'tv-on';
        if (oldTvOn) {
            oldTvOn.remove();
        }
        tvScreen.appendChild(newTvOn);
        
        // Create new glitch effect element with animation
        const oldGlitch = document.querySelector('.glitch-effect');
        const newGlitch = document.createElement('div');
        newGlitch.className = 'glitch-effect';
        if (oldGlitch) {
            oldGlitch.remove();
        }
        tvScreen.appendChild(newGlitch);
        
        // Hide video initially
        videoElement.style.opacity = '0';
        
        // Change video source
        const sourceElement = videoElement.querySelector('source');
        sourceElement.src = videoSources[currentVideoIndex];
        
        // Apply specific styling for first video
        if (index === 0) {
            videoElement.classList.add('first-video');
        } else {
            videoElement.classList.remove('first-video');
        }
        
        videoElement.load();
        
        // Remove old animation classes and add them again to restart animations
        videoElement.style.animation = 'none';
        videoElement.offsetHeight; // Trigger reflow
        videoElement.style.animation = 'videoFadeIn 1s 2s forwards';
        
        // Play video after TV animation completes
        setTimeout(() => {
            videoElement.play().catch(error => {
                console.error("Video play failed:", error);
                // If autoplay fails, make the video visible anyway
                videoElement.style.opacity = "1";
            });
        }, 1000); // Wait for the TV animation to complete
    }
    
    // Previous video button
    prevButton.addEventListener('click', function() {
        let newIndex = currentVideoIndex - 1;
        if (newIndex < 0) {
            newIndex = videoSources.length - 1;
        }
        playVideo(newIndex);
    });
    
    // Next video button
    nextButton.addEventListener('click', function() {
        let newIndex = currentVideoIndex + 1;
        if (newIndex >= videoSources.length) {
            newIndex = 0;
        }
        playVideo(newIndex);
    });
    
    // Video indicator clicks
    videoIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            playVideo(index);
        });
    });
    
    // Fullscreen functionality
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const fullscreenIcon = document.querySelector('.fullscreen-icon');
    const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');
    
    fullscreenToggle.addEventListener('click', function() {
        toggleFullscreen();
    });
    
    // Function to toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            // Enter fullscreen mode
            if (tvContainer.requestFullscreen) {
                tvContainer.requestFullscreen();
            } else if (tvContainer.msRequestFullscreen) {
                tvContainer.msRequestFullscreen();
            } else if (tvContainer.mozRequestFullScreen) {
                tvContainer.mozRequestFullScreen();
            } else if (tvContainer.webkitRequestFullscreen) {
                tvContainer.webkitRequestFullscreen();
            }
            
            tvContainer.classList.add('fullscreen', 'entering-fullscreen');
            fullscreenIcon.style.display = 'none';
            exitFullscreenIcon.style.display = 'block';
            
            // Reset transform to avoid conflicts with 3D effect
            tvContainer.style.transform = 'none';
            
        } else {
            // Exit fullscreen mode
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            
            tvContainer.classList.remove('fullscreen', 'entering-fullscreen');
            fullscreenIcon.style.display = 'block';
            exitFullscreenIcon.style.display = 'none';
        }
    }
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    function handleFullscreenChange() {
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            // Fullscreen was exited
            tvContainer.classList.remove('fullscreen', 'entering-fullscreen');
            fullscreenIcon.style.display = 'block';
            exitFullscreenIcon.style.display = 'none';
        }
    }
    
    // Keyboard shortcuts for fullscreen
    document.addEventListener('keydown', function(e) {
        // ESC key already handled by browser for exiting fullscreen
        
        // F key to enter fullscreen
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
        }
    });
    
    // Removed title letter hover effects as requested
    
    // Initialize with first video
    playVideo(0);
});

