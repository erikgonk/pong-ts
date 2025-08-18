import { GameConfig } from "./GameConfig.js";

export interface ScoreState {
  left: number;
  right: number;
}

export enum GameResult {
  CONTINUE,
  LEFT_WINS,
  RIGHT_WINS,
  LEFT_SCORES,
  RIGHT_SCORES
}

export class ScoreManager {
  private leftPlayerScoreElem: HTMLElement;
  private rightPlayerScoreElem: HTMLElement;
  private scores: ScoreState = { left: 0, right: 0 };
  private maxScore: number;

  constructor(leftScoreElement: HTMLElement, rightScoreElement: HTMLElement, maxScore: number = GameConfig.MAX_SCORE) {
    this.leftPlayerScoreElem = leftScoreElement;
    this.rightPlayerScoreElem = rightScoreElement;
    this.maxScore = maxScore;
    this.updateDisplay();
  }

  public addScore(side: 'left' | 'right'): GameResult {
    if (side === 'left') {
      this.scores.left++;
    } else {
      this.scores.right++;
    }
    
    this.updateDisplay();
    
    // Check for game end
    if (this.scores.left >= this.maxScore) {
      return GameResult.LEFT_WINS;
    } else if (this.scores.right >= this.maxScore) {
      return GameResult.RIGHT_WINS;
    }
    
    // Return which side scored
    return side === 'left' ? GameResult.LEFT_SCORES : GameResult.RIGHT_SCORES;
  }

  public reset(): void {
    this.scores = { left: 0, right: 0 };
    this.updateDisplay();
  }

  public getScores(): Readonly<ScoreState> {
    return { ...this.scores };
  }

  public getScoreString(): string {
    return `${this.scores.left} - ${this.scores.right}`;
  }

  private updateDisplay(): void {
    this.leftPlayerScoreElem.textContent = this.scores.left.toString();
    this.rightPlayerScoreElem.textContent = this.scores.right.toString();
  }
}
