import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

let ballStuckTimer = 0;
const maxScore = 5; // Maximum score to win the game
const PADDLE_SPEED = 0.08; // Adjust this value to change paddle speed
const BALL_STUCK_TIMEOUT = 500; // 3 seconds in milliseconds
const EDGE_THRESHOLD = 10; // Distance from top/bottom edge considered "stuck"

const ballElement = document.getElementById("ball");
const leftPaddleElement = document.getElementById("left-paddle");
const rightPaddleElement = document.getElementById("right-paddle");
const leftPlayerScoreElem = document.getElementById("left-score");
const rightPlayerScoreElem = document.getElementById("right-score");

if (!ballElement || !leftPaddleElement || !rightPaddleElement || !leftPlayerScoreElem || !rightPlayerScoreElem) {
  throw new Error("Required DOM elements not found");
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
}

const keys: Keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false
};

let lastTime: number | undefined;
let frameCount = 0;

function update(time: number): void {
  if (lastTime != null) {
    const delta = time - lastTime;
    
    // Limit frame rate to prevent excessive updates
    if (delta < 16.67) { // ~60 FPS cap
      window.requestAnimationFrame(update);
      return;
    }
    
    ball.update(delta, [leftPlayerPaddle.rect(), rightPlayerPaddle.rect()]);
    
    // Update both player paddles based on keyboard input
    updateLeftPlayerPaddle(delta);
    updateRightPlayerPaddle(delta);
    
    // Only update hue every few frames to reduce CPU load
    frameCount++;
    if (frameCount % 3 === 0) {
      const hue = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--hue")
      );
      document.documentElement.style.setProperty("--hue", (hue + delta * 0.01).toString());
    }

    // Check if ball is stuck at top or bottom edges
    checkBallStuck(delta);

    if (isLose()) handleLose();
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
  if (rect.right >= window.innerWidth) {
    leftPlayerScoreElem!.textContent = (parseInt(leftPlayerScoreElem!.textContent || "0") + 1).toString();
  } else {
    rightPlayerScoreElem!.textContent = (parseInt(rightPlayerScoreElem!.textContent || "0") + 1).toString();
  }
  
  // Check if someone won (reached maxScore points)
  const leftPlayerScore = parseInt(leftPlayerScoreElem!.textContent || "0");
  const rightPlayerScore = parseInt(rightPlayerScoreElem!.textContent || "0");
  // ------------------------------- CHANGE THIS TO GO TO THE WINNER AND LOSER SCREEN
  // ------------------------------- CHANGE SCORE LIMIT maxScore
  if (leftPlayerScore >= maxScore) {
    alert("Left Player Wins! Final Score: " + leftPlayerScore + " - " + rightPlayerScore);
    // Reset scores
    leftPlayerScoreElem!.textContent = "0";
    rightPlayerScoreElem!.textContent = "0";
  } else if (rightPlayerScore >= maxScore) {
    alert("Right Player Wins! Final Score: " + leftPlayerScore + " - " + rightPlayerScore);
    // Reset scores
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
      console.log("Ball was stuck for too long, resetting...");
      ball.reset();
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

// Keyboard event listeners
document.addEventListener("keydown", (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (key in keys) {
    (keys as any)[key] = true;
  }
  if (e.key in keys) {
    (keys as any)[e.key] = true;
  }
});

document.addEventListener("keyup", (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (key in keys) {
    (keys as any)[key] = false;
  }
  if (e.key in keys) {
    (keys as any)[e.key] = false;
  }
});

window.requestAnimationFrame(update);
