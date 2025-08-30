import { Game, GameOptions } from "./Game.js";

const gameConfig: GameOptions = {
  // Player names
  leftPlayer: "Erik",
  rightPlayer: "Simon",
  
  // Game settings
  maxScore: 1,
  // Game models:
  // - 'p-vs-ai'
  // - 'ai-vs-p'
  // - 'p-vs-p'
  // - 'ai-vs-ai'
  gameMode: "p-vs-ai",
  aiDifficulty: 1000 // 1000 | 100 | 1 (ms)
};
const game = new Game(gameConfig);
game.start();