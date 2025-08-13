const INITIAL_VELOCITY = 0.055
const PADDLE_HIT_SPEED_INCREASE = 2.05 // 5% speed increase per paddle hit
const MAX_VELOCITY = 0.12 // Maximum speed limit

export default class Ball {
  constructor(ballElem) {
    this.ballElem = ballElem
    this.reset()
  }

  get x() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"))
  }

  set x(value) {
    this.ballElem.style.setProperty("--x", value)
  }

  get y() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"))
  }

  set y(value) {
    this.ballElem.style.setProperty("--y", value)
  }

  rect() {
    return this.ballElem.getBoundingClientRect()
  }

  reset() {
    this.x = 50
    this.y = 50
    this.direction = { x: 0 }
    while (
      Math.abs(this.direction.x) <= 0.2 ||
      Math.abs(this.direction.x) >= 0.9
    ) {
      const heading = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) }
    }
    this.velocity = INITIAL_VELOCITY
  }

  update(delta, paddleRects) {
    this.x += this.direction.x * this.velocity * delta
    this.y += this.direction.y * this.velocity * delta
    // Removed continuous speed increase - now only increases on paddle hits
    const rect = this.rect()

    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1
    }

    // Check collision with each paddle individually
    paddleRects.forEach(paddleRect => {
      if (isCollision(paddleRect, rect)) {
        // Calculate hit position as percentage (0-100)
        const ballCenterY = rect.top + rect.height / 2
        const paddleCenterY = paddleRect.top + paddleRect.height / 2
        const paddleHeight = paddleRect.height
        
        // Calculate relative hit position (0 = top, 0.5 = center, 1 = bottom)
        const relativeHitY = (ballCenterY - (paddleCenterY - paddleHeight / 2)) / paddleHeight
        const hitPercentage = Math.max(0, Math.min(1, relativeHitY)) // Clamp between 0-1
        
        // Convert to angle within 120-degree range (-60 to +60 degrees)
        const maxAngle = Math.PI / 3 // 60 degrees in radians
        const angle = (hitPercentage - 0.5) * 2 * maxAngle // -60 to +60 degrees
        
        // Determine ball direction based on which side of screen the paddle is on
        const ballSpeed = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y)
        
        if (paddleRect.left < window.innerWidth / 2) {
          // Left paddle (player) - ball goes right
          this.direction.x = Math.cos(angle) * ballSpeed
          this.direction.y = Math.sin(angle) * ballSpeed
        } else {
          // Right paddle (computer) - ball goes left
          this.direction.x = -Math.cos(angle) * ballSpeed
          this.direction.y = Math.sin(angle) * ballSpeed
        }
        
        // Normalize direction to maintain consistent speed
        const magnitude = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y)
        this.direction.x /= magnitude
        this.direction.y /= magnitude
        
        // Original Pong style: Increase speed on paddle hit
        this.velocity = Math.min(this.velocity * PADDLE_HIT_SPEED_INCREASE, MAX_VELOCITY)
      }
    })
  }
}

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min
}

function isCollision(rect1, rect2) {
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  )
}
