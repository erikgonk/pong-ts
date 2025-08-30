import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import { GameConfig } from "./GameConfig.js";
import { InputManager, KeyAction } from "./InputManager.js";
import { AIManager, PlayerSide } from "./AIManager.js";
import { ScoreManager, GameResult } from "./ScoreManager.js";
import { UIManager } from "./UIManager.js";

export interface GameOptions {
  leftPlayer: string;
  rightPlayer: string;
  maxScore: number;
  gameMode: 'p-vs-ai' |  'ai-vs-p' | 'p-vs-p' | 'ai-vs-ai';
  aiDifficulty?: 1000 | 100 | 1;
}

export class Game {
  // Game configuration
  private options: GameOptions;

  // Game state
  private isPaused = false;
  private lastTime?: number;

  // Game objects
  private ball!: Ball;
  private leftPlayerPaddle!: Paddle;
  private rightPlayerPaddle!: Paddle;

  // Managers
  private inputManager!: InputManager;
  private aiManager!: AIManager;
  private scoreManager!: ScoreManager;
  private uiManager!: UIManager;

  // DOM elements
  private ballElement!: HTMLElement;
  private leftPaddleElement!: HTMLElement;
  private rightPaddleElement!: HTMLElement;

  constructor(options?: Partial<GameOptions>) {
    // Update GameConfig with provided values
    if (options?.maxScore) {
      GameConfig.MAX_SCORE = options.maxScore;
    }
    if (options?.aiDifficulty) {
      GameConfig.AI_UPDATE_COOLDOWN = options.aiDifficulty;
    }
    
    // Set default options and merge with provided options
    this.options = {
      leftPlayer: options?.leftPlayer || GameConfig.DEFAULT_LEFT_PLAYER,
      rightPlayer: options?.rightPlayer || GameConfig.DEFAULT_RIGHT_PLAYER,
      maxScore: options?.maxScore || GameConfig.MAX_SCORE,
      gameMode: options?.gameMode || 'p-vs-p',
      aiDifficulty: options?.aiDifficulty || (GameConfig.AI_UPDATE_COOLDOWN as 1000 | 100 | 1)
    };
    this.initializeDOM();
    this.initializeManagers();
    this.initializeGameObjects();
    this.setupDebugFunctions();
  }

  private initializeDOM(): void {
    this.ballElement = UIManager.getElement("ball");
    this.leftPaddleElement = UIManager.getElement("left-paddle");
    this.rightPaddleElement = UIManager.getElement("right-paddle");
  }

  private initializeManagers(): void {
    // Initialize managers with their required DOM elements
    const leftPlayerScoreElem = UIManager.getElement("left-score");
    const rightPlayerScoreElem = UIManager.getElement("right-score");
    const leftPlayer = UIManager.getElement("left-player");
    const rightPlayer = UIManager.getElement("right-player");
    const pauseOverlay = UIManager.getElement("pause-overlay");
    const pauseBtn = UIManager.getElement("pause-btn");
    const playBtn = UIManager.getElement("play-btn");
    const gameArea = UIManager.getElement("game-area");

    this.inputManager = new InputManager(() => this.togglePause());
    this.aiManager = new AIManager();
    this.scoreManager = new ScoreManager(leftPlayerScoreElem, rightPlayerScoreElem, this.options.maxScore);
    this.uiManager = new UIManager(
      pauseOverlay,
      pauseBtn,
      playBtn,
      gameArea,
      leftPlayer,
      rightPlayer,
      () => this.togglePause()
    );

    // Set player names and configure AI based on game mode
    this.configureGameMode();
    this.uiManager.setPlayerNames(this.options.leftPlayer, this.options.rightPlayer);
  }

  private configureGameMode(): void {
    switch (this.options.gameMode) {
      case 'p-vs-ai':
        this.options.rightPlayer = "ChatGPT";
        this.aiManager.disableAI(PlayerSide.LEFT); // Only disable left, right stays AI
        break;
      case 'ai-vs-p':
        this.options.leftPlayer = "Gemini";
        this.aiManager.disableAI(PlayerSide.RIGHT); // Only disable right, left stays AI
        break;
      case 'p-vs-p':
        this.aiManager.disableAI(PlayerSide.LEFT);
        this.aiManager.disableAI(PlayerSide.RIGHT);
        break;
      case 'ai-vs-ai':
        this.options.leftPlayer = "ChatGPT";
        this.options.rightPlayer = "Gemini";
        // Both AI are already enabled by default, no action needed
        break;
    }
  }

  private initializeGameObjects(): void {
    this.ball = new Ball(this.ballElement);
    this.leftPlayerPaddle = new Paddle(this.leftPaddleElement);
    this.rightPlayerPaddle = new Paddle(this.rightPaddleElement);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.uiManager.showPauseOverlay();
    } else {
      this.uiManager.hidePauseOverlay();
    }
  }

  // Public methods for controlling AI
  public enableAILeft(): void {
    this.aiManager.enableAI(PlayerSide.LEFT);
  }

  public enableAIRight(): void {
    this.aiManager.enableAI(PlayerSide.RIGHT);
  }

  public disableAI(): void {
    this.aiManager.disableAI();
  }

  // Getters for accessing game state
  public get gameAreaTop(): number { return GameConfig.GAME_AREA_TOP_PERCENT; }
  public get gameAreaBottom(): number { return GameConfig.GAME_AREA_BOTTOM_PERCENT; }
  public get getBall(): Ball { return this.ball; }
  public get getLeftPaddle(): Paddle { return this.leftPlayerPaddle; }
  public get getRightPaddle(): Paddle { return this.rightPlayerPaddle; }

  private setupDebugFunctions(): void {
    (window as any).enableAILeft = () => this.enableAILeft();
    (window as any).enableAIRight = () => this.enableAIRight();
    (window as any).disableAI = () => this.disableAI();
  }

  // Main game loop
  public start(): void {
    const gameLoop = (time: number) => {
      if (this.lastTime != null) {
        const delta = time - this.lastTime;
        
        // Limit frame rate to prevent excessive updates
        if (delta < GameConfig.FRAME_RATE_LIMIT) {
          window.requestAnimationFrame(gameLoop);
          return;
        }
        
        if (!this.isPaused) {
          this.ball.update(delta, this.leftPlayerPaddle, this.rightPlayerPaddle);
          this.aiManager.updateAI(this.ball, time);
          this.updateLeftPlayerPaddle(delta);
          this.updateRightPlayerPaddle(delta);
          
          if (this.isLose()) {
            this.handleLose();
          }
        }
      }
      this.lastTime = time;
      window.requestAnimationFrame(gameLoop);
    };
    window.requestAnimationFrame(gameLoop);
  }

  private updateLeftPlayerPaddle(delta: number): void {
    if (this.aiManager.isEnabled(PlayerSide.LEFT)) {
      // AI movement towards target
      const currentPosition = this.leftPlayerPaddle.position;
      const target = this.aiManager.getTarget(PlayerSide.LEFT);
      const difference = target - currentPosition;
      
      // Use threshold for precise positioning but prevent oscillation
      if (Math.abs(difference) > GameConfig.AI_MOVEMENT_THRESHOLD) { 
        const direction = difference > 0 ? 1 : -1;
        const newPosition = currentPosition + (direction * GameConfig.PADDLE_SPEED * delta);
        this.leftPlayerPaddle.position = Math.max(
          GameConfig.PADDLE_BOUNDARY_TOP, 
          Math.min(GameConfig.PADDLE_BOUNDARY_BOTTOM, newPosition)
        );
      }
      return;
    }
    // Human player controls: W (up) and S (down)
    if (this.inputManager.isPressed(KeyAction.MOVE_LEFT_UP)) {
      this.leftPlayerPaddle.position = Math.max(
        GameConfig.PADDLE_BOUNDARY_TOP, 
        this.leftPlayerPaddle.position - GameConfig.PADDLE_SPEED * delta
      );
    } else if (this.inputManager.isPressed(KeyAction.MOVE_LEFT_DOWN)) {
      this.leftPlayerPaddle.position = Math.min(
        GameConfig.PADDLE_BOUNDARY_BOTTOM, 
        this.leftPlayerPaddle.position + GameConfig.PADDLE_SPEED * delta
      );
    }
  }

  private updateRightPlayerPaddle(delta: number): void {
    if (this.aiManager.isEnabled(PlayerSide.RIGHT)) {
      // AI movement towards target
      const currentPosition = this.rightPlayerPaddle.position;
      const target = this.aiManager.getTarget(PlayerSide.RIGHT);
      const difference = target - currentPosition;
      
      // Use threshold for precise positioning but prevent oscillation
      if (Math.abs(difference) > GameConfig.AI_MOVEMENT_THRESHOLD) { 
        const direction = difference > 0 ? 1 : -1;
        const newPosition = currentPosition + (direction * GameConfig.PADDLE_SPEED * delta);
        this.rightPlayerPaddle.position = Math.max(
          GameConfig.PADDLE_BOUNDARY_TOP, 
          Math.min(GameConfig.PADDLE_BOUNDARY_BOTTOM, newPosition)
        );
      }
      return;
    }
    // Human player controls: Arrow Up and Arrow Down
    if (this.inputManager.isPressed(KeyAction.MOVE_RIGHT_UP)) {
      this.rightPlayerPaddle.position = Math.max(
        GameConfig.PADDLE_BOUNDARY_TOP, 
        this.rightPlayerPaddle.position - GameConfig.PADDLE_SPEED * delta
      );
    } else if (this.inputManager.isPressed(KeyAction.MOVE_RIGHT_DOWN)) {
      this.rightPlayerPaddle.position = Math.min(
        GameConfig.PADDLE_BOUNDARY_BOTTOM, 
        this.rightPlayerPaddle.position + GameConfig.PADDLE_SPEED * delta
      );
    }
  }

  private isLose(): boolean {
    const rect = this.ball.rect();
    // Check if ball goes beyond the game board area
    const gameAreaLeft = GameConfig.SIDEBAR_WIDTH;
    const gameAreaRight = window.innerWidth - (window.innerWidth * GameConfig.RIGHT_MARGIN_VW);
    return rect.right >= gameAreaRight || rect.left <= gameAreaLeft;
  }

  private handleLose(): void {
    const rect = this.ball.rect();
    const gameAreaRight = window.innerWidth - (window.innerWidth * GameConfig.RIGHT_MARGIN_VW);
    
    let result: GameResult;
    if (rect.right >= gameAreaRight) {
      // Ball went off right side - left player scores
      result = this.scoreManager.addScore('left');
    } else {
      // Ball went off left side - right player scores
      result = this.scoreManager.addScore('right');
    }
    
    // Only show dashboard at the end of the match (when maxScore is reached)
    if (result === GameResult.LEFT_WINS || result === GameResult.RIGHT_WINS) {
      this.isPaused = true; // Stop the game loop
      setTimeout(() => {
        import('./Dashboard').then(({ showDashboard }) => {
          const scores = this.scoreManager.getScores();
          showDashboard({
            username: this.options.leftPlayer, // or rightPlayer, adjust as needed
            stats: {
              won: scores.left,
              lost: scores.right,
              scores: scores.left,
              friends: 3
            },
            points: {
              scored: scores.left,
              received: scores.right
            }
          });
        });
      }, 500); // Small delay to allow last frame to render
    }
    this.ball.reset();
  }
}
