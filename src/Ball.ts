import Paddle from "./Paddle.js";

const INITIAL_VELOCITY = 0.055;
const PADDLE_HIT_SPEED_INCREASE = 1.10; // 5% speed increase per paddle hit
const MAX_VELOCITY = 0.13; // Maximum speed limit

interface Direction {
  x: number;
  y: number;
}

export default class Ball {
  private ballElem: HTMLElement;
  private direction: Direction = { x: 0, y: 0 };
  private velocity: number = INITIAL_VELOCITY;
  private _x: number = 50;
  private _y: number = 50;

  constructor(ballElem: HTMLElement) {
    this.ballElem = ballElem;
    this.reset();
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
    this.updatePosition();
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
    this.updatePosition();
  }

  private updatePosition(): void {
    const translateX = (this._x - 50) * 0.88;
    const translateY = (this._y - 50) * 0.96;
    this.ballElem.style.transform = `translate(${translateX}vw, ${translateY}vh)`;
  }

  get directionX(): number {
    return this.direction.x;
  }

  get directionY(): number {
    return this.direction.y;
  }

  get ballVelocity(): number {
    return this.velocity;
  }

  rect(): DOMRect {
    return this.ballElem.getBoundingClientRect();
  }

  reset(): void {
    // Center the ball in the middle of the game board
    this.x = 50;
    this.y = 50;

    this.direction = { x: 0, y: 0 };
    while (
      Math.abs(this.direction.x) <= 0.3 ||
      Math.abs(this.direction.x) >= 0.8
    ) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    this.velocity = INITIAL_VELOCITY;
  }

  private bounceVertical(): void {
    this.direction.y *= -1;
    if (this.direction.y < 0) {
      this.direction.y -= 0.1;  
    } else {
      this.direction.y += 0.1;
    }
  }
  
  update(delta: number, leftPaddle: Paddle, rightPaddle: Paddle): void {
    const paddleRects = [leftPaddle.rect(), rightPaddle.rect()];
    // to increase speed on paddle hits
    this.x += this.direction.x * this.velocity * delta;
    this.y += this.direction.y * this.velocity * delta;
    const rect = this.rect();
    const gameAreaTop = window.innerHeight * 0.02;
    const gameAreaBottom = window.innerHeight * 0.98;
    // Vertical boundaries
    if (rect.bottom >= gameAreaBottom || rect.top <= gameAreaTop) {
      // this.direction.y *= -1;
      this.bounceVertical();
    }
    // Check collision with each paddle individually
    paddleRects.forEach(paddleRect => {
      if (isCollision(paddleRect, rect)) {
        // Calculate hit position as percentage (0-100)
        const ballCenterY = rect.top + rect.height / 2;
        const paddleCenterY = paddleRect.top + paddleRect.height / 2;
        const paddleHeight = paddleRect.height;
        // Calculate relative hit position (0 = top, 0.5 = center, 1 = bottom)
        const relativeHitY = (ballCenterY - (paddleCenterY - paddleHeight / 2)) / paddleHeight;
        const hitPercentage = Math.max(0, Math.min(1, relativeHitY)); // Clamp between 0-1
        // Convert to angle within 120-degree range (-60 to +60 degrees)
        const maxAngle = Math.PI / 3; // 60 degrees in radians
        const angle = (hitPercentage - 0.5) * 2 * maxAngle; // -60 to +60 degrees
        // Determine ball direction based on which side of screen the paddle is on
        const ballSpeed = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        if (paddleRect.left < window.innerWidth / 2) {
          // Left paddle (player) - ball goes right
          leftPaddle.highlight();
          this.direction.x = Math.cos(angle) * ballSpeed;
          this.direction.y = Math.sin(angle) * ballSpeed;
        } else {
          // Right paddle (computer) - ball goes left
          rightPaddle.highlight();
          this.direction.x = -Math.cos(angle) * ballSpeed;
          this.direction.y = Math.sin(angle) * ballSpeed;
        }
        // Normalize direction to maintain consistent speed
        const magnitude = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        this.direction.x /= magnitude;
        this.direction.y /= magnitude;
 
        // Increase speed on paddle hit
        this.velocity = Math.min(this.velocity * PADDLE_HIT_SPEED_INCREASE, MAX_VELOCITY);
      }
    });
  }
}

function randomNumberBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function isCollision(rect1: DOMRect, rect2: DOMRect): boolean {
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  );
}
