const SPEED = 0.02;

export default class Paddle {
  private paddleElem: HTMLElement;

  constructor(paddleElem: HTMLElement) {
    this.paddleElem = paddleElem;
    this.reset();
  }

  get position(): number {
    return parseFloat(
      getComputedStyle(this.paddleElem).getPropertyValue("--position")
    );
  }

  set position(value: number) {
    this.paddleElem.style.setProperty("--position", value.toString());
  }

  rect(): DOMRect {
    return this.paddleElem.getBoundingClientRect();
  }

  reset(): void {
    this.position = 50;
  }

  update(delta: number, ballHeight: number): void {
    this.position += SPEED * delta * (ballHeight - this.position);
    // Add boundary constraints to prevent paddle from going off-screen
    const PADDLE_HALF_HEIGHT = 5; // Half of paddle height (10vh / 2 = 5vh)
    this.position = Math.max(PADDLE_HALF_HEIGHT, Math.min(100 - PADDLE_HALF_HEIGHT, this.position));
  }
}
