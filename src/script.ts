import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

let isPaused = false; // Game pause state
let isAILeft = true; // AI mode
let isAIRight = true; // AI mode
const maxScore = 5; // Maximum score to win the game
const PADDLE_SPEED = 0.08; // Adjust this value to change paddle speed

// AI variables
let aiLeftTarget = 50; // AI target position for left paddle (0-100)
let aiRightTarget = 50; // AI target position for right paddle (0-100)
let lastAILeftUpdate = 0; // Timestamp of last AI update for left paddle
let lastAIRightUpdate = 0; // Timestamp of last AI update for right paddle
const COOLDOWN = 1000; // Update AI every 0.5 seconds instead of 1 second

// Game boundaries (matching Ball.ts)
const GAME_AREA_TOP_PERCENT = 2; // 2vh
const GAME_AREA_BOTTOM_PERCENT = 98; // 98vh

// Function to toggle pause state and update UI
function togglePause(): void {
  isPaused = !isPaused;
  if (isPaused) {
    pauseOverlay!.classList.remove('hidden');
    gameArea!.classList.add('blur-[9px]');
  } else {
    pauseOverlay!.classList.add('hidden');
    gameArea!.classList.remove('blur-[9px]');
  }
  console.log(isPaused ? "Game Paused" : "Game Resumed");
}

const ballElement = document.getElementById("ball");
const leftPaddleElement = document.getElementById("left-paddle");
const rightPaddleElement = document.getElementById("right-paddle");
const leftPlayerScoreElem = document.getElementById("left-score");
const rightPlayerScoreElem = document.getElementById("right-score");
const leftPlayer = document.getElementById("left-player");
const rightPlayer = document.getElementById("right-player");
const pauseOverlay = document.getElementById("pause-overlay");
const pauseBtn = document.getElementById("pause-btn");
const playBtn = document.getElementById("play-btn");
const gameContent = document.getElementById("game-content");
const gameArea = document.getElementById("game-area");

if (!leftPlayer || !rightPlayer || !ballElement || !leftPaddleElement || !rightPaddleElement || !leftPlayerScoreElem || !rightPlayerScoreElem || !pauseOverlay || !pauseBtn || !playBtn || !gameContent || !gameArea) {
  throw new Error("Required DOM elements not found");
} else {
      leftPlayer!.textContent = "Erik";
      rightPlayer!.textContent = "Simon";
}
const ball = new Ball(ballElement);
const leftPlayerPaddle = new Paddle(leftPaddleElement);
const rightPlayerPaddle = new Paddle(rightPaddleElement);

// Keyboard controls
interface Keys {
  w: boolean;
  s: boolean;
  ArrowUp: boolean;
  ArrowDown: boolean;
  ' ': boolean; // Space bar for pause
}

const keys: Keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false,
  ' ': false
};

let lastTime: number | undefined;

function update(time: number): void {
  if (lastTime != null) {
    const delta = time - lastTime;
    
    // Limit frame rate to prevent excessive updates
    if (delta < 8) { // called every ~8ms (120 FPS)
      window.requestAnimationFrame(update);
      return;
    }
    if (!isPaused) {
      ball.update(delta, leftPlayerPaddle, rightPlayerPaddle);
      updateAI(time);
      updateLeftPlayerPaddle(delta);
      updateRightPlayerPaddle(delta);
      // checkBallStuck(delta);
      if (isLose()) {
        handleLose();
      }
    }
  }
  lastTime = time;
  window.requestAnimationFrame(update);
}

function isLose(): boolean {
  const rect = ball.rect();
  // Check if ball goes beyond the game board area
  const gameAreaLeft = 64; // 64px left sidebar
  const gameAreaRight = window.innerWidth - 32; // Account for 2vw right margin (approx 32px at 1600px width)
  return rect.right >= gameAreaRight || rect.left <= gameAreaLeft;
}

function handleLose(): void {
  const rect = ball.rect();
  const gameAreaRight = window.innerWidth - 32; // Account for 2vw right margin (approx 32px at 1600px width)
  let leftPlayerScore = parseInt(leftPlayerScoreElem!.textContent || "0");
  let rightPlayerScore = parseInt(rightPlayerScoreElem!.textContent || "0");
  
  if (rect.right >= gameAreaRight) {
    // Ball went off right side - left player scores
    leftPlayerScoreElem!.textContent = (leftPlayerScore + 1).toString();
    leftPlayerScore += 1;
  } else {
    // Ball went off left side - right player scores
    rightPlayerScoreElem!.textContent = (rightPlayerScore + 1).toString();
    rightPlayerScore += 1;
  }
  
  
  if (leftPlayerScore >= maxScore || rightPlayerScore >= maxScore) {
    alert(leftPlayerScore + " - " + rightPlayerScore);
    leftPlayerScoreElem!.textContent = "0";
    rightPlayerScoreElem!.textContent = "0";
  }
  ball.reset();
}

/**
 * Updates AI targets based on ball trajectory prediction
 * Only calculates when ball is moving towards the AI and has cooldown COOLDOWN
 */
function updateAI(currentTime: number): void {
  const directionX = ball.directionX;
  
  // Update left AI if enabled, ball is moving towards it, and cooldown has passed
  if (isAILeft && directionX < 0 && (currentTime - lastAILeftUpdate >= COOLDOWN)) {
    aiLeftTarget = predictBallLanding('left');
    lastAILeftUpdate = currentTime;
    console.log(`AI Left: Ball at (${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}), Direction: (${directionX.toFixed(3)}, ${ball.directionY.toFixed(3)}), Target: ${aiLeftTarget.toFixed(1)}, Paddle: ${leftPlayerPaddle.position.toFixed(1)}`);
  }
  
  // Update right AI if enabled, ball is moving towards it, and cooldown has passed
  if (isAIRight && directionX > 0 && (currentTime - lastAIRightUpdate >= COOLDOWN)) {
    aiRightTarget = predictBallLanding('right');
    lastAIRightUpdate = currentTime;
    console.log(`AI Right: Ball at (${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}), Direction: (${directionX.toFixed(3)}, ${ball.directionY.toFixed(3)}), Target: ${aiRightTarget.toFixed(1)}, Paddle: ${rightPlayerPaddle.position.toFixed(1)}`);
  }
}

function updateLeftPlayerPaddle(delta: number): void {
  if (isAILeft) {
    // AI movement towards target
    const currentPosition = leftPlayerPaddle.position;
    const difference = aiLeftTarget - currentPosition;
    
    // Use a smaller threshold for more precise positioning but prevent oscillation
    if (Math.abs(difference) > 1.0) { 
      const direction = difference > 0 ? 1 : -1;
      const newPosition = currentPosition + (direction * PADDLE_SPEED * delta);
      leftPlayerPaddle.position = Math.max(4, Math.min(92, newPosition));
    }
    return;
  }
  // Human player controls: W (up) and S (down)
  if (keys.w) {
    // Constrain paddle to game area: account for paddle height (80px ≈ 4vh)
    leftPlayerPaddle.position = Math.max(4, leftPlayerPaddle.position - PADDLE_SPEED * delta);
  } else if (keys.s) {
    leftPlayerPaddle.position = Math.min(92, leftPlayerPaddle.position + PADDLE_SPEED * delta);
  }
}

function updateRightPlayerPaddle(delta: number): void {
  if (isAIRight) {
    // AI movement towards target
    const currentPosition = rightPlayerPaddle.position;
    const difference = aiRightTarget - currentPosition;
    
    // Use a smaller threshold for more precise positioning but prevent oscillation
    if (Math.abs(difference) > 1.0) { 
      const direction = difference > 0 ? 1 : -1;
      const newPosition = currentPosition + (direction * PADDLE_SPEED * delta);
      rightPlayerPaddle.position = Math.max(4, Math.min(92, newPosition));
    }
    return;
  }
  // Human player controls: Arrow Up and Arrow Down
  if (keys.ArrowUp) {
    // Constrain paddle to game area: account for paddle height (80px ≈ 4vh)
    rightPlayerPaddle.position = Math.max(4, rightPlayerPaddle.position - PADDLE_SPEED * delta);
  } else if (keys.ArrowDown) {
    rightPlayerPaddle.position = Math.min(92, rightPlayerPaddle.position + PADDLE_SPEED * delta);
  }
}

// Helper function to map key events to our keys object
function getKeyFromEvent(e: KeyboardEvent): keyof Keys | null {
  const keyLower = e.key.toLowerCase();
  if (keyLower === 'w' || keyLower === 's') return keyLower;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') return e.key;
  if (e.key === ' ') return ' '; // Space bar
  return null;
}

// Keyboard event listeners
document.addEventListener("keydown", (e: KeyboardEvent) => {
  const mappedKey = getKeyFromEvent(e);
  if (mappedKey) {
    // Handle space bar press - toggle pause only on keydown to avoid repeated toggles
    if (mappedKey === ' ' && !keys[' ']) {
      togglePause();
    }
    keys[mappedKey] = true;
  }
});

document.addEventListener("keyup", (e: KeyboardEvent) => {
  const mappedKey = getKeyFromEvent(e);
  if (mappedKey) {
    keys[mappedKey] = false;
  }
});

// Button click event listeners
pauseBtn!.addEventListener("click", () => {
  if (!isPaused) {
    togglePause();
  }
});

playBtn!.addEventListener("click", () => {
  if (isPaused) {
    togglePause();
  }
});

/**
 * Predicts where the ball will land on a specific side (left or right)
 * Uses algebraic trajectory calculation with wall bounces
 */
function predictBallLanding(targetSide: 'left' | 'right'): number {
  // Get current ball state
  const ballX = ball.x;
  const ballY = ball.y;
  const directionX = ball.directionX;
  const directionY = ball.directionY;
  const velocity = ball.ballVelocity;
  
  // Calculate the actual game area dimensions
  const gameAreaWidth = window.innerWidth - 64 - (window.innerWidth * 0.02); 

  // Calculate paddle positions in ball coordinate system (0-100)
  const leftPaddleXPixels = 30;
  const rightPaddleXPixels = gameAreaWidth - 30;

  // Convert to ball coordinate system
  const gameCenter = gameAreaWidth / 2;
  const scalingFactor = window.innerWidth * 0.0088; // 0.88vw in pixels
  const leftPaddleX = ((leftPaddleXPixels - gameCenter) / scalingFactor) + 50;
  const rightPaddleX = ((rightPaddleXPixels - gameCenter) / scalingFactor) + 50;
  
  const targetX = targetSide === 'left' ? leftPaddleX : rightPaddleX;
  
  // Check if ball is moving towards the target side
  if ((targetSide === 'left' && directionX >= 0) || (targetSide === 'right' && directionX <= 0)) {
    // Ball is moving away from target side, return current paddle position
    return targetSide === 'left' ? leftPlayerPaddle.position : rightPlayerPaddle.position;
  }
  
  // Use advanced trajectory simulation
  return simulateBallTrajectory(ballX, ballY, directionX, directionY, velocity, targetX);
}

/**
 * Advanced trajectory prediction with wall bounces
 * This function simulates the ball's path algebraically
 */
function simulateBallTrajectory(
  startX: number, 
  startY: number, 
  directionX: number, 
  directionY: number, 
  velocity: number, 
  targetX: number
): number {
  let currentX = startX;
  let currentY = startY;
  let currentDirX = directionX;
  let currentDirY = directionY;
  
  // Maximum simulation steps to prevent infinite loops
  const maxSteps = 20;
  let steps = 0;
  
  while (steps < maxSteps) {
    // Calculate time to reach target X
    if (Math.abs(currentDirX) < 0.001) {
      // Ball is moving vertically, won't reach target
      return Math.max(4, Math.min(92, currentY));
    }
    
    const timeToTarget = (targetX - currentX) / (currentDirX * velocity);
    
    if (timeToTarget <= 0) {
      // Ball is moving away from target
      return Math.max(4, Math.min(92, currentY));
    }
    
    // Calculate Y position at target X (without bounces)
    const projectedY = currentY + (currentDirY * velocity * timeToTarget);
    
    // Check if ball hits top or bottom boundary during this trajectory
    if (projectedY <= GAME_AREA_TOP_PERCENT && currentDirY < 0) {
      // Ball hits top boundary - calculate exact collision
      const timeToTop = (GAME_AREA_TOP_PERCENT - currentY) / (currentDirY * velocity);
      currentX += currentDirX * velocity * timeToTop;
      currentY = GAME_AREA_TOP_PERCENT;
      currentDirY *= -1; // Bounce
    } else if (projectedY >= GAME_AREA_BOTTOM_PERCENT && currentDirY > 0) {
      // Ball hits bottom boundary - calculate exact collision
      const timeToBottom = (GAME_AREA_BOTTOM_PERCENT - currentY) / (currentDirY * velocity);
      currentX += currentDirX * velocity * timeToBottom;
      currentY = GAME_AREA_BOTTOM_PERCENT;
      currentDirY *= -1; // Bounce
    } else {
      // Ball reaches target X without hitting boundaries
      return Math.max(4, Math.min(92, projectedY));
    }
    
    steps++;
  }
  
  // Fallback if simulation doesn't converge
  return Math.max(4, Math.min(92, currentY));
}

window.requestAnimationFrame(update);

// For testing - add these to window for console access
(window as any).enableAILeft = () => {
  isAILeft = true;
  console.log("AI Left enabled");
};

(window as any).enableAIRight = () => {
  isAIRight = true; 
  console.log("AI Right enabled");
};

(window as any).disableAI = () => {
  isAILeft = false;
  isAIRight = false;
  console.log("AI disabled");
};

// Debug function to test trajectory prediction
(window as any).testPrediction = () => {
  const prediction = predictBallLanding('left');
  console.log(`Current ball: (${ball.x.toFixed(1)}, ${ball.y.toFixed(1)})`);
  console.log(`Direction: (${ball.directionX.toFixed(3)}, ${ball.directionY.toFixed(3)})`);
  console.log(`Predicted landing: ${prediction.toFixed(1)}`);
  console.log(`Current paddle: ${leftPlayerPaddle.position.toFixed(1)}`);
  
  // Debug paddle positions with corrected calculation
  const gameAreaWidth = window.innerWidth - 64 - (window.innerWidth * 0.02);
  const gameCenter = gameAreaWidth / 2;
  const scalingFactor = window.innerWidth * 0.0088; // 0.88vw in pixels
  
  const leftPaddleXPixels = 30;
  const rightPaddleXPixels = gameAreaWidth - 30;
  const leftPaddleX = ((leftPaddleXPixels - gameCenter) / scalingFactor) + 50;
  const rightPaddleX = ((rightPaddleXPixels - gameCenter) / scalingFactor) + 50;
  
  console.log(`Game area width: ${gameAreaWidth.toFixed(1)}px`);
  console.log(`Game center: ${gameCenter.toFixed(1)}px`);
  console.log(`Scaling factor: ${scalingFactor.toFixed(2)}px per unit`);
  console.log(`Left paddle: ${leftPaddleXPixels}px → ${leftPaddleX.toFixed(1)} ball units`);
  console.log(`Right paddle: ${rightPaddleXPixels}px → ${rightPaddleX.toFixed(1)} ball units`);
};

// Debug function to test live ball prediction
(window as any).testLivePrediction = () => {
  console.log("=== LIVE PREDICTION TEST ===");
  const leftPrediction = predictBallLanding('left');
  const rightPrediction = predictBallLanding('right');
  console.log(`Ball: (${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}) Direction: (${ball.directionX.toFixed(3)}, ${ball.directionY.toFixed(3)})`);
  console.log(`Left prediction: ${leftPrediction.toFixed(1)}, Right prediction: ${rightPrediction.toFixed(1)}`);
  console.log(`Current targets: Left=${aiLeftTarget.toFixed(1)}, Right=${aiRightTarget.toFixed(1)}`);
};