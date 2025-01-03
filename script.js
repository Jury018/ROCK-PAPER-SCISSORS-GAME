// Select the background music element using the existing 'id' from the HTML
const bgMusic = document.getElementById('bgMusic');

// Game Mode Buttons
const classicButton = document.getElementById('classicButton');
const adventureButton = document.getElementById('adventureButton');

// Music toggle button
const toggleMusicButton = document.getElementById('toggleMusicButton');

// Music state: true means playing, false means paused
let isMusicPlaying = false; // Start with music paused

// Check if the user came from gamepage (using URL parameters)
const urlParams = new URLSearchParams(window.location.search);
const fromGamePage = urlParams.get('fromGamePage');

// If the user came from gamepage, do not play music automatically
if (fromGamePage) {
    isMusicPlaying = false;
    toggleMusicButton.textContent = "🔇 Music Off"; // Update button text
    bgMusic.pause(); // Ensure music is paused immediately
}

// Function to toggle the music
function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        toggleMusicButton.textContent = "🔇 Music Off"; // Text for turning music off
    } else {
        bgMusic.play().catch(error => {
            // Handle playback error (e.g., user denied autoplay)
            console.error("Music playback error:", error);
            toggleMusicButton.textContent = "🔇 Music Off"; // Update text if there's an issue
        });
        toggleMusicButton.textContent = "🔊 Music On"; // Text for turning music on
    }
    isMusicPlaying = !isMusicPlaying;
}

// Add event listener for the toggle button
toggleMusicButton.addEventListener('click', toggleMusic);

// Event listener for Classic Mode Button
classicButton.addEventListener('click', () => {
  window.location.href = 'gamepage.html?mode=classic';
});

// Event listener for Adventure Mode Button
adventureButton.addEventListener('click', () => {
  window.location.href = 'adventuremode.html?mode=adventure';
});

// Scroll Reveal Initialization (for animations)
ScrollReveal().reveal('.reveal', {
    origin: 'bottom',
    distance: '50px',
    duration: 1000,
    delay: 200,
    easing: 'ease-out',
    reset: true
});

