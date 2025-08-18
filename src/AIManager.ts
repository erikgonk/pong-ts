import Ball from "./Ball.js";
import { GameConfig } from "./GameConfig.js";

export enum PlayerSide {
  LEFT = 'left',
  RIGHT = 'right'
}

export interface AIState {
  target: number;
  lastUpdate: number;
  isEnabled: boolean;
}

export class AIManager {
  private leftAI: AIState = {
    target: 50,
    lastUpdate: 0,
    isEnabled: true
  };

  private rightAI: AIState = {
    target: 50,
    lastUpdate: 0,
    isEnabled: true
  };

  public enableAI(side: PlayerSide): void {
    if (side === PlayerSide.LEFT) {
      this.leftAI.isEnabled = true;
    } else {
      this.rightAI.isEnabled = true;
    }
  }

  public disableAI(side?: PlayerSide): void {
    if (side === PlayerSide.LEFT || !side) {
      this.leftAI.isEnabled = false;
    }
    if (side === PlayerSide.RIGHT || !side) {
      this.rightAI.isEnabled = false;
    }
  }

  public isEnabled(side: PlayerSide): boolean {
    return side === PlayerSide.LEFT ? this.leftAI.isEnabled : this.rightAI.isEnabled;
  }

  public getTarget(side: PlayerSide): number {
    return side === PlayerSide.LEFT ? this.leftAI.target : this.rightAI.target;
  }

  public updateAI(ball: Ball, currentTime: number): void {
    const directionX = ball.directionX;
    
    // Update left AI if enabled, ball is moving towards it, and cooldown has passed
    if (this.leftAI.isEnabled && directionX < 0 && 
        (currentTime - this.leftAI.lastUpdate >= GameConfig.AI_UPDATE_COOLDOWN)) {
      const newTarget = this.predictBallLanding(ball, PlayerSide.LEFT);
      
      if (Math.abs(newTarget - this.leftAI.target) > GameConfig.AI_TARGET_THRESHOLD) {
        this.leftAI.target = newTarget;
        this.leftAI.lastUpdate = currentTime;
      }
    }
    
    // Update right AI if enabled, ball is moving towards it, and cooldown has passed
    if (this.rightAI.isEnabled && directionX > 0 && 
        (currentTime - this.rightAI.lastUpdate >= GameConfig.AI_UPDATE_COOLDOWN)) {
      const newTarget = this.predictBallLanding(ball, PlayerSide.RIGHT);
      
      if (Math.abs(newTarget - this.rightAI.target) > GameConfig.AI_TARGET_THRESHOLD) {
        this.rightAI.target = newTarget;
        this.rightAI.lastUpdate = currentTime;
      }
    }
  }

  private predictBallLanding(ball: Ball, targetSide: PlayerSide): number {
    // Get current ball state
    const ballX = ball.x;
    const ballY = ball.y;
    const directionX = ball.directionX;
    const directionY = ball.directionY;
    
    // Calculate the actual game area dimensions
    const gameAreaWidth = window.innerWidth - GameConfig.SIDEBAR_WIDTH - 
                         (window.innerWidth * GameConfig.RIGHT_MARGIN_VW);

    // Calculate paddle positions in ball coordinate system (0-100)
    const leftPaddleXPixels = GameConfig.PADDLE_X_OFFSET;
    const rightPaddleXPixels = gameAreaWidth - GameConfig.PADDLE_X_OFFSET;

    // Convert to ball coordinate system
    const gameCenter = gameAreaWidth / 2;
    const scalingFactor = window.innerWidth * GameConfig.BALL_SCALING_FACTOR;
    const leftPaddleX = ((leftPaddleXPixels - gameCenter) / scalingFactor) + 50;
    const rightPaddleX = ((rightPaddleXPixels - gameCenter) / scalingFactor) + 50;
    
    const targetX = targetSide === PlayerSide.LEFT ? leftPaddleX : rightPaddleX;
    
    // Check if ball is moving towards the target side
    if ((targetSide === PlayerSide.LEFT && directionX >= 0) || 
        (targetSide === PlayerSide.RIGHT && directionX <= 0)) {
      // Ball is moving away from target side, return middle position
      return 50;
    }
    
    // Use geometric trajectory calculation
    return this.simulateBallTrajectoryGeometric(ballX, ballY, directionX, directionY, targetX);
  }

  private simulateBallTrajectoryGeometric(
    startX: number, 
    startY: number, 
    directionX: number, 
    directionY: number, 
    targetX: number
  ): number {
    let currentX = startX;
    let currentY = startY;
    let currentDirX = directionX;
    let currentDirY = directionY;
    
    let steps = 0;
    
    while (steps < GameConfig.AI_MAX_SIMULATION_STEPS) {
      // Check if ball is moving toward target
      if (Math.abs(currentDirX) < 0.001) {
        return Math.max(GameConfig.PADDLE_BOUNDARY_TOP, 
                       Math.min(GameConfig.PADDLE_BOUNDARY_BOTTOM, currentY));
      }
      
      if ((targetX - currentX) / currentDirX <= 0) {
        return Math.max(GameConfig.PADDLE_BOUNDARY_TOP, 
                       Math.min(GameConfig.PADDLE_BOUNDARY_BOTTOM, currentY));
      }
      
      // Calculate how far to move in X to reach target
      const deltaX = targetX - currentX;
      
      // Calculate corresponding Y movement (maintain slope ratio)
      const deltaY = deltaX * (currentDirY / currentDirX);
      
      // Calculate projected Y position
      const projectedY = currentY + deltaY;
      
      // Check if ball hits top or bottom boundary during this trajectory
      if (projectedY < GameConfig.GAME_AREA_TOP_PERCENT && currentDirY < 0) {
        // Ball hits top boundary
        const distanceToTop = GameConfig.GAME_AREA_TOP_PERCENT - currentY;
        const xAtTop = currentX + distanceToTop * (currentDirX / currentDirY);
        currentX = xAtTop;
        currentY = GameConfig.GAME_AREA_TOP_PERCENT;
        currentDirY = Math.abs(currentDirY); // Bounce down
      } else if (projectedY > GameConfig.GAME_AREA_BOTTOM_PERCENT && currentDirY > 0) {
        // Ball hits bottom boundary
        const distanceToBottom = GameConfig.GAME_AREA_BOTTOM_PERCENT - currentY;
        const xAtBottom = currentX + distanceToBottom * (currentDirX / currentDirY);
        currentX = xAtBottom;
        currentY = GameConfig.GAME_AREA_BOTTOM_PERCENT;
        currentDirY = -Math.abs(currentDirY); // Bounce up
      } else {
        // Ball reaches target X without hitting boundaries
        return Math.max(GameConfig.PADDLE_BOUNDARY_TOP, 
                       Math.min(GameConfig.PADDLE_BOUNDARY_BOTTOM, projectedY));
      }
      
      steps++;
    }
    
    // Fallback if simulation doesn't converge
    return Math.max(GameConfig.PADDLE_BOUNDARY_TOP, 
                   Math.min(GameConfig.PADDLE_BOUNDARY_BOTTOM, currentY));
  }
}
