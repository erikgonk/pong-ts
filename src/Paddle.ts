const SPEED = 0.02;

export default class Paddle {
  private paddleElem: HTMLElement;
  private _position: number = 50;

  constructor(paddleElem: HTMLElement) {
    this.paddleElem = paddleElem;
    this.reset();
  }

  get position(): number {
    return this._position;
  }

  set position(value: number) {
    this._position = value;
    this.updatePosition();
  }

  private updatePosition(): void {
    // Calculate top position based on the original CSS logic: calc(2vh + (var(--position) * 0.96vh))
    const topValue = 2 + (this._position * 0.96);
    this.paddleElem.style.top = `${topValue}vh`;
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

  highlight(): void {
    // Change to yellow highlight
    this.paddleElem.style.backgroundColor = '#EDD24E';
    
    // Reset to original color after a short delay
    setTimeout(() => {
      this.paddleElem.style.backgroundColor = '#D9D9D9';
    }, 150); // 150ms highlight duration
  }
}
