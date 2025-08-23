import { Game, GameOptions } from "./Game.js";

const gameConfig: GameOptions = {
  // Player names
  leftPlayer: "Erik",
  rightPlayer: "Simon",
  
  // Game settings
  maxScore: 2,
  // Game models:
  // - 'p-vs-ai'
  // - 'ai-vs-p'
  // - 'p-vs-p'
  // - 'ai-vs-ai'
  gameMode: "ai-vs-ai",
  aiDifficulty: 1000 // 1000 | 100 | 1 (ms)
};
const game = new Game(gameConfig);
game.start();