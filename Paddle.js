const SPEED = 0.02

export default class Paddle {
  constructor(paddleElem) {
    this.paddleElem = paddleElem
    this.reset()
  }

  get position() {
    return parseFloat(
      getComputedStyle(this.paddleElem).getPropertyValue("--position")
    )
  }

  set position(value) {
    this.paddleElem.style.setProperty("--position", value)
  }

  rect() {
    return this.paddleElem.getBoundingClientRect()
  }

  reset() {
    this.position = 50
  }

  update(delta, ballHeight) {
    this.position += SPEED * delta * (ballHeight - this.position)
    // Add boundary constraints to prevent paddle from going off-screen
    const PADDLE_HALF_HEIGHT = 5 // Half of paddle height (10vh / 2 = 5vh)
    this.position = Math.max(PADDLE_HALF_HEIGHT, Math.min(100 - PADDLE_HALF_HEIGHT, this.position))
  }
}
