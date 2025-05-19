// Game variables
let score = 0;
let timeLeft = 60;
let gameInterval;
let circleTimeout;
let isGameRunning = false;
let level = 1;
let combo = 0;
let circleSize = 60;
let speedFactor = 1;
let comboMultiplier = 1;
let lastTapTime = 0;

// Colors for circles
const colors = [
    { bg: 'radial-gradient(circle, #ff9a9e, #ff5252)', shadow: 'rgba(255, 82, 82, 0.4)' },
    { bg: 'radial-gradient(circle, #a6c0fe, #5a67d8)', shadow: 'rgba(90, 103, 216, 0.4)' },
    { bg: 'radial-gradient(circle, #96e6a1, #20bf6b)', shadow: 'rgba(32, 191, 107, 0.4)' },
    { bg: 'radial-gradient(circle, #ffecd2, #fcb69f)', shadow: 'rgba(252, 182, 159, 0.4)' },
    { bg: 'radial-gradient(circle, #e0c3fc, #8a5fff)', shadow: 'rgba(138, 95, 255, 0.4)' }
];

// Background gradients for different levels
const backgroundGradients = [
    'linear-gradient(135deg, #6e8efb, #a777e3)',
    'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    'linear-gradient(135deg, #a6c0fe, #f68084)',
    'linear-gradient(135deg, #d4fc79, #96e6a1)',
    'linear-gradient(135deg, #e0c3fc, #8ec5fc)'
];

// DOM elements
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const finalScoreElement = document.getElementById('final-score');
const circle = document.getElementById('circle');
const startButton = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over');
const gameContainer = document.querySelector('.game-container');
const levelElement = document.getElementById('level');
const comboElement = document.getElementById('combo');
const timerBar = document.getElementById('timer-bar');

// Start the game when the start button is clicked
startButton.addEventListener('click', startGame);

// Function to start the game
function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    score = 0;
    timeLeft = 60;
    level = 1;
    combo = 0;
    circleSize = 60;
    speedFactor = 1;
    comboMultiplier = 1;
    
    // Reset UI
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    levelElement.textContent = level;
    comboElement.textContent = combo;
    document.body.style.background = backgroundGradients[0];
    gameOverScreen.style.display = 'none';
    startButton.textContent = 'Game Running...';
    startButton.disabled = true;
    timerBar.style.width = '100%';
    
    // Start the timer and show the circle
    gameInterval = setInterval(updateTimer, 1000);
    moveCircle();
    
    // Add click event to the circle
    circle.addEventListener('click', circleClicked);
}

// Function to update the timer
function updateTimer() {
    timeLeft--;
    timeElement.textContent = timeLeft;
    timerBar.style.width = (timeLeft / 60 * 100) + '%';
    
    if (timeLeft <= 0) {
        endGame();
    }
}

// Function to move the circle to a random position
function moveCircle() {
    // Get the container dimensions
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight - 60; // Account for the game info bar
    
    // Calculate new position
    const maxX = containerWidth - circleSize;
    const maxY = containerHeight - circleSize;
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY) + 60; // Add 60 to account for the game info bar
    
    // Choose a random color
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Apply new position and style
    circle.style.left = randomX + 'px';
    circle.style.top = randomY + 'px';
    circle.style.width = circleSize + 'px';
    circle.style.height = circleSize + 'px';
    circle.style.background = randomColor.bg;
    circle.style.boxShadow = `0 5px 15px ${randomColor.shadow}`;
    circle.style.display = 'block';
    
    // Set a timeout to move the circle again or penalize for missing
    const baseDelay = 1500 / speedFactor;
    const randomDelay = Math.random() * 500 + baseDelay;
    
    circleTimeout = setTimeout(() => {
        // If the circle wasn't clicked, reset combo
        if (circle.style.display !== 'none') {
            resetCombo();
        }
        moveCircle();
    }, randomDelay);
}

// Function to handle circle clicks
function circleClicked(event) {
    // Calculate score based on combo and level
    const pointsEarned = 1 * comboMultiplier * level;
    score += pointsEarned;
    scoreElement.textContent = score;
    
    // Increment combo
    combo++;
    comboElement.textContent = combo;
    
    // Show score popup
    createScorePopup(event.clientX, event.clientY, pointsEarned);
    
    // Update level based on score
    updateLevel();
    
    // Update combo multiplier
    updateComboMultiplier();
    
    // Hide the circle
    circle.style.display = 'none';
    
    // Reset tap time for combo calculation
    lastTapTime = Date.now();
    
    // Move the circle immediately
    clearTimeout(circleTimeout);
    moveCircle();
}

// Function to update level based on score
function updateLevel() {
    const newLevel = Math.floor(score / 10) + 1;
    if (newLevel > level && newLevel <= 5) {
        level = newLevel;
        levelElement.textContent = level;
        
        // Make game harder with each level
        circleSize = Math.max(30, 60 - (level - 1) * 5);
        speedFactor = 1 + (level - 1) * 0.3;
        
        // Change background gradient
        document.body.style.background = backgroundGradients[Math.min(level - 1, backgroundGradients.length - 1)];
        
        // Add some time as a reward
        timeLeft = Math.min(60, timeLeft + 3);
        timeElement.textContent = timeLeft;
        timerBar.style.width = (timeLeft / 60 * 100) + '%';
    }
}

// Function to update combo multiplier
function updateComboMultiplier() {
    if (combo >= 10) {
        comboMultiplier = 3;
    } else if (combo >= 5) {
        comboMultiplier = 2;
    } else {
        comboMultiplier = 1;
    }
}

// Function to reset combo
function resetCombo() {
    combo = 0;
    comboMultiplier = 1;
    comboElement.textContent = combo;
}

// Function to create a score popup
function createScorePopup(x, y, points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points}`;
    
    // Position the popup where the circle was clicked
    const rect = gameContainer.getBoundingClientRect();
    popup.style.left = (x - rect.left) + 'px';
    popup.style.top = (y - rect.top) + 'px';
    
    gameContainer.appendChild(popup);
    
    // Remove the popup after animation
    setTimeout(() => {
        popup.remove();
    }, 800);
}

// Function to end the game
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearTimeout(circleTimeout);
    
    circle.style.display = 'none';
    circle.removeEventListener('click', circleClicked);
    
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'flex';
    
    startButton.textContent = 'Play Again';
    startButton.disabled = false;
}