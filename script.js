import Ball from "./Ball.js"
import Paddle from "./Paddle.js"

let ballStuckTimer = 0
let maxScore = 5 // Maximum score to win the game
const PADDLE_SPEED = 0.08 // Adjust this value to change paddle speed
const PADDLE_HALF_HEIGHT = 5 // Half of paddle height (10vh / 2 = 5vh)
const BALL_STUCK_TIMEOUT = 3000 // 3 seconds in milliseconds
const EDGE_THRESHOLD = 10 // Distance from top/bottom edge considered "stuck"

const ball = new Ball(document.getElementById("ball"))
const leftPlayerPaddle = new Paddle(document.getElementById("left-paddle"))
const rightPlayerPaddle = new Paddle(document.getElementById("right-paddle"))
const leftPlayerScoreElem = document.getElementById("left-score")
const rightPlayerScoreElem = document.getElementById("right-score")

// Keyboard controls
const keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false
}

let lastTime
function update(time) {
  if (lastTime != null) {
    const delta = time - lastTime
    ball.update(delta, [leftPlayerPaddle.rect(), rightPlayerPaddle.rect()])
    
    // Update both player paddles based on keyboard input
    updateLeftPlayerPaddle(delta)
    updateRightPlayerPaddle(delta)
    
    const hue = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--hue")
    )

    document.documentElement.style.setProperty("--hue", hue + delta * 0.01)

    // Check if ball is stuck at top or bottom edges
    checkBallStuck(delta)

    if (isLose()) handleLose()
  }

  lastTime = time
  window.requestAnimationFrame(update)
}

function isLose() {
  const rect = ball.rect()
  return rect.right >= window.innerWidth || rect.left <= 0
}

function handleLose() {
  const rect = ball.rect()
  if (rect.right >= window.innerWidth) {
    leftPlayerScoreElem.textContent = parseInt(leftPlayerScoreElem.textContent) + 1
  } else {
    rightPlayerScoreElem.textContent = parseInt(rightPlayerScoreElem.textContent) + 1
  }
  
  // Check if someone won (reached maxScore points)
  const leftPlayerScore = parseInt(leftPlayerScoreElem.textContent)
  const rightPlayerScore = parseInt(rightPlayerScoreElem.textContent)
  // ------------------------------- CHANGE THIS TO GO TO THE WINNER AND LOSER SCREEN
  // ------------------------------- CHANGE SCORE LIMIT maxScore
  if (leftPlayerScore >= maxScore) {
    alert("Left Player Wins! Final Score: " + leftPlayerScore + " - " + rightPlayerScore)
    // Reset scores
    leftPlayerScoreElem.textContent = "0"
    rightPlayerScoreElem.textContent = "0"
  } else if (rightPlayerScore >= maxScore) {
    alert("Right Player Wins! Final Score: " + leftPlayerScore + " - " + rightPlayerScore)
    // Reset scores
    leftPlayerScoreElem.textContent = "0"
    rightPlayerScoreElem.textContent = "0"
  }
  
  ball.reset()
  ballStuckTimer = 0 // Reset stuck timer when someone scores
}

function checkBallStuck(delta) {
  const rect = ball.rect()
  const isNearTopEdge = rect.top <= EDGE_THRESHOLD
  const isNearBottomEdge = rect.bottom >= window.innerHeight - EDGE_THRESHOLD
  
  if (isNearTopEdge || isNearBottomEdge) {
    // Ball is near an edge, increase timer
    ballStuckTimer += delta
    
    if (ballStuckTimer >= BALL_STUCK_TIMEOUT) {
      console.log("Ball was stuck for too long, resetting...")
      ball.reset()
      ballStuckTimer = 0
    }
  } else {
    // Ball is not near edges, reset timer
    ballStuckTimer = 0
  }
}

function updateLeftPlayerPaddle(delta) {
  // Left player controls: W (up) and S (down)
  if (keys.w) {
    leftPlayerPaddle.position = Math.max(PADDLE_HALF_HEIGHT, leftPlayerPaddle.position - PADDLE_SPEED * delta)
  }
  if (keys.s) {
    leftPlayerPaddle.position = Math.min(100 - PADDLE_HALF_HEIGHT, leftPlayerPaddle.position + PADDLE_SPEED * delta)
  }
}

function updateRightPlayerPaddle(delta) {
  // Right player controls: Arrow Up and Arrow Down
  if (keys.ArrowUp) {
    rightPlayerPaddle.position = Math.max(PADDLE_HALF_HEIGHT, rightPlayerPaddle.position - PADDLE_SPEED * delta)
  }
  if (keys.ArrowDown) {
    rightPlayerPaddle.position = Math.min(100 - PADDLE_HALF_HEIGHT, rightPlayerPaddle.position + PADDLE_SPEED * delta)
  }
}

// Keyboard event listeners
document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase()
  if (key in keys) {
    keys[key] = true
  }
  if (e.key in keys) {
    keys[e.key] = true
  }
})

document.addEventListener("keyup", e => {
  const key = e.key.toLowerCase()
  if (key in keys) {
    keys[key] = false
  }
  if (e.key in keys) {
    keys[e.key] = false
  }
})

window.requestAnimationFrame(update)
