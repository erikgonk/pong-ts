// import { Game } from "./Game";

export class GameConfig {
  // Game rules
  public static MAX_SCORE = 5; // Game.maxScore |
  public static readonly PADDLE_SPEED = 0.08;
  public static readonly FRAME_RATE_LIMIT = 8.33; // ms ( FPS)
  
  // AI settings
  public static AI_UPDATE_COOLDOWN = 100; // ms
  public static readonly AI_TARGET_THRESHOLD = 2.0; // Minimum change to update target
  public static readonly AI_MOVEMENT_THRESHOLD = 1.0; // Minimum distance to move paddle
  public static readonly AI_MAX_SIMULATION_STEPS = 10;
  
  // Game area boundaries
  public static readonly GAME_AREA_TOP_PERCENT = 2; // 2vh
  public static readonly GAME_AREA_BOTTOM_PERCENT = 98; // 98vh
  public static readonly PADDLE_BOUNDARY_TOP = 4; // Minimum paddle position
  public static readonly PADDLE_BOUNDARY_BOTTOM = 92; // Maximum paddle position
  
  // Game area layout
  public static readonly SIDEBAR_WIDTH = 64; // px
  public static readonly RIGHT_MARGIN_VW = 0.02; // 2vw
  public static readonly PADDLE_X_OFFSET = 30; // px from edge
  public static readonly BALL_SCALING_FACTOR = 0.0088; // 0.88vw in pixels
  
  // Player names (could be made configurable later)
  public static readonly DEFAULT_LEFT_PLAYER = "Erik";
  public static readonly DEFAULT_RIGHT_PLAYER = "Simon";
}
