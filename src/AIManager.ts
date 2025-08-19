import Ball from "./Ball.ts";
import { GameConfig } from "./GameConfig.ts";
// import { Game } from "./Game.ts";

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
    // Get current ball state and scale by 1000 for better precision
    const ballX = ball.x * 1000;
    const ballY = ball.y * 1000;
    const directionX = ball.directionX * 1000;
    const directionY = ball.directionY * 1000;
    
    // Calculate the actual game area dimensions
    const gameAreaWidth = window.innerWidth - GameConfig.SIDEBAR_WIDTH - 
                         (window.innerWidth * GameConfig.RIGHT_MARGIN_VW);

    // Calculate paddle positions in ball coordinate system (0-100) * 1000
    const leftPaddleXPixels = GameConfig.PADDLE_X_OFFSET;
    const rightPaddleXPixels = gameAreaWidth - GameConfig.PADDLE_X_OFFSET;

    // Convert to ball coordinate system (scaled by 1000)
    const gameCenter = gameAreaWidth / 2;
    const scalingFactor = window.innerWidth * GameConfig.BALL_SCALING_FACTOR;
    const leftPaddleX = (((leftPaddleXPixels - gameCenter) / scalingFactor) + 50) * 1000;
    const rightPaddleX = (((rightPaddleXPixels - gameCenter) / scalingFactor) + 50) * 1000;
    
    const targetX = targetSide === PlayerSide.LEFT ? leftPaddleX : rightPaddleX;
    
    // Check if ball is moving towards the target side
    if ((targetSide === PlayerSide.LEFT && directionX >= 0) || 
        (targetSide === PlayerSide.RIGHT && directionX <= 0)) {
      // Ball is moving away from target side, return middle position
      return 50;
    }
    
    // Use geometric trajectory calculation and scale result back down
    const result = this.simulateBallTrajectoryGeometric(ballX, ballY, directionX, directionY, targetX);
    return result / 1000;
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
    
    // Scale boundary values by 1000 to match our coordinate system
    const topBoundary = GameConfig.GAME_AREA_TOP_PERCENT * 1000;
    const bottomBoundary = GameConfig.GAME_AREA_BOTTOM_PERCENT * 1000;
    const paddleBoundaryTop = GameConfig.PADDLE_BOUNDARY_TOP * 1000;
    const paddleBoundaryBottom = GameConfig.PADDLE_BOUNDARY_BOTTOM * 1000;
    
    let steps = 0;
    
    while (steps < GameConfig.AI_MAX_SIMULATION_STEPS) {
      // Check if ball is moving toward target
      if (Math.abs(currentDirX) < 1) { // Scaled threshold (was 0.001)
        return Math.max(paddleBoundaryTop, 
                       Math.min(paddleBoundaryBottom, currentY));
      }
      
      if ((targetX - currentX) / currentDirX <= 0) {
        return Math.max(paddleBoundaryTop, 
                       Math.min(paddleBoundaryBottom, currentY));
      }
      
      // Calculate how far to move in X to reach target
      const deltaX = targetX - currentX;
      
      // Calculate corresponding Y movement (maintain slope ratio)
      const deltaY = deltaX * (currentDirY / currentDirX);
      
      // Calculate projected Y position
      const projectedY = currentY + deltaY;
      
      // Check if ball hits top or bottom boundary during this trajectory
      if (projectedY < topBoundary && currentDirY < 0) {
        // Ball hits top boundary
        const distanceToTop = topBoundary - currentY;
        const xAtTop = currentX + distanceToTop * (currentDirX / currentDirY);
        currentX = xAtTop;
        currentY = topBoundary;
        
        // Mirror Ball.ts bouncing logic exactly
        currentDirY *= -1; // Flip direction first
        if (currentDirY < 0) {
          currentDirY -= 100; // 0.1 * 1000 = 100 (make MORE negative)
        } else {
          currentDirY += 100; // 0.1 * 1000 = 100 (make MORE positive)
        }
        
      } else if (projectedY > bottomBoundary && currentDirY > 0) {
        // Ball hits bottom boundary
        const distanceToBottom = bottomBoundary - currentY;
        const xAtBottom = currentX + distanceToBottom * (currentDirX / currentDirY);
        currentX = xAtBottom;
        currentY = bottomBoundary;
        
        // Mirror Ball.ts bouncing logic exactly
        currentDirY *= -1; // Flip direction first
        if (currentDirY < 0) {
          currentDirY -= 100; // 0.1 * 1000 = 100 (make MORE negative)
        } else {
          currentDirY += 100; // 0.1 * 1000 = 100 (make MORE positive)
        }
        
      } else {
        // Ball reaches target X without hitting boundaries
        return Math.max(paddleBoundaryTop, 
                       Math.min(paddleBoundaryBottom, projectedY));
      }
      
      steps++;
    }
    
    // Fallback if simulation doesn't converge
    return Math.max(paddleBoundaryTop, 
                   Math.min(paddleBoundaryBottom, currentY));
  }
}
