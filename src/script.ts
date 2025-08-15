import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

let ballStuckTimer = 0; // Tracks how long the ball has been stuck at edges
let isPaused = false; // Game pause state
const maxScore = 2; // Maximum score to win the game
const PADDLE_SPEED = 0.08; // Adjust this value to change paddle speed
const BALL_STUCK_TIMEOUT = 50; // 50 milliseconds
const EDGE_THRESHOLD = 10; // Distance from top/bottom edge considered "stuck"

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
      ball.update(delta, [leftPlayerPaddle.rect(), rightPlayerPaddle.rect()]);
      updateLeftPlayerPaddle(delta);
      updateRightPlayerPaddle(delta);
      checkBallStuck(delta);
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
  const gameAreaLeft = window.innerWidth * 0.1; // 10vw left sidebar
  const gameAreaRight = window.innerWidth * 0.98; // 98vw - 2vw right border
  return rect.right >= gameAreaRight || rect.left <= gameAreaLeft;
}

function handleLose(): void {
  const rect = ball.rect();
  const gameAreaRight = window.innerWidth * 0.98; // 98vw - 2vw right border
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
  ballStuckTimer = 0; // Reset stuck timer when someone scores
}

function checkBallStuck(delta: number): void {
  const rect = ball.rect();
  // Calculate game area boundaries - entire game board
  const gameAreaTop = window.innerHeight * 0.02;
  const gameAreaBottom = window.innerHeight * 0.98;
  
  const isNearTopEdge = rect.top <= gameAreaTop + EDGE_THRESHOLD;
  const isNearBottomEdge = rect.bottom >= gameAreaBottom - EDGE_THRESHOLD;
  
  if (isNearTopEdge || isNearBottomEdge) {
    // Ball is near an edge, increase timer
    ballStuckTimer += delta;
    
    if (ballStuckTimer >= BALL_STUCK_TIMEOUT) {
      console.log("Ball was stuck for too long, giving it a push...");
      // Give the ball a small push away from the edge
      if (isNearTopEdge) {
        ball.y = ball.y + 2; // Push down from top edge
      }
      if (isNearBottomEdge) {
        ball.y = ball.y - 2; // Push up from bottom edge  
      }
      ballStuckTimer = 0;
    }
  } else {
    // Ball is not near edges, reset timer
    ballStuckTimer = 0;
  }
}

function updateLeftPlayerPaddle(delta: number): void {
  // Left player controls: W (up) and S (down)
  if (keys.w) {
    // Constrain paddle to game area: account for paddle height (80px ≈ 4vh)
    leftPlayerPaddle.position = Math.max(4, leftPlayerPaddle.position - PADDLE_SPEED * delta);
  }
  if (keys.s) {
    leftPlayerPaddle.position = Math.min(92, leftPlayerPaddle.position + PADDLE_SPEED * delta);
  }
}

function updateRightPlayerPaddle(delta: number): void {
  // Right player controls: Arrow Up and Arrow Down
  if (keys.ArrowUp) {
    // Constrain paddle to game area: account for paddle height (80px ≈ 4vh)
    rightPlayerPaddle.position = Math.max(4, rightPlayerPaddle.position - PADDLE_SPEED * delta);
  }
  if (keys.ArrowDown) {
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

window.requestAnimationFrame(update);
