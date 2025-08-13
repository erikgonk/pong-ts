# Pong Game - TypeScript

A classic Pong game implemented in TypeScript with modern web technologies.

## Features

- Two-player Pong game with keyboard controls
- TypeScript for better code maintainability and type safety
- Modular design with separate classes for Ball and Paddle
- Responsive design with CSS custom properties
- Ball speed increases on paddle hits
- Anti-stuck mechanism for balls caught at edges
- Score tracking with configurable win conditions

## Controls

- **Left Player (Player 1)**: 
  - `W` - Move paddle up
  - `S` - Move paddle down

- **Right Player (Player 2)**:
  - `Arrow Up` - Move paddle up
  - `Arrow Down` - Move paddle down

## Development

### Prerequisites

- Node.js (for TypeScript compilation and Vite)
- A modern web browser

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server with hot module replacement:
   ```bash
   npm run dev
   ```
   
   This will automatically:
   - Transpile TypeScript to JavaScript
   - Serve the game at `http://localhost:3000`
   - Auto-reload when you make changes to any file
   - Provide instant updates without manual refresh

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

5. Type checking only (without building):
   ```bash
   npm run type-check
   ```

### Development Features

- **Hot Module Replacement (HMR)**: Instant updates when you modify code
- **TypeScript Support**: Native TypeScript transpilation through Vite
- **Fast Builds**: Lightning-fast development server and builds
- **Source Maps**: Debug TypeScript directly in the browser
- **Modern Bundling**: Optimized production builds with tree shaking

### Project Structure

```
pong-ts/
├── src/                    # TypeScript source files
│   ├── Ball.ts            # Ball class with physics and collision detection
│   ├── Paddle.ts          # Paddle class with movement logic
│   └── script.ts          # Main game loop and controls
├── dist/                  # Production build output
├── styles.css             # Game styling
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration (for Vite)
└── tsconfig.build.json    # TypeScript configuration (for standalone compilation)
```

### Game Configuration

You can modify game settings by changing constants in the TypeScript files:

- `maxScore` in `script.ts` - Points needed to win
- `PADDLE_SPEED` in `script.ts` - Paddle movement speed
- `INITIAL_VELOCITY` in `Ball.ts` - Starting ball speed
- `PADDLE_HIT_SPEED_INCREASE` in `Ball.ts` - Speed multiplier on paddle hit

## Vite Integration

This project now uses Vite for an enhanced development experience:

- **Lightning Fast**: Instant server start and incredibly fast Hot Module Replacement (HMR)
- **TypeScript Native**: Built-in TypeScript support without additional configuration
- **Modern Bundling**: Optimized builds using Rollup
- **Development Features**: Source maps, error overlay, and instant feedback
- **Production Ready**: Optimized builds with tree shaking and minification

### Key Benefits

1. **Instant Updates**: Make changes to your TypeScript files and see them immediately in the browser
2. **Better Error Messages**: Clear, actionable error messages with source locations
3. **Modern Standards**: ES modules, native TypeScript, and modern JavaScript features
4. **Fast Builds**: Development builds are nearly instantaneous
5. **Optimized Production**: Efficient bundling for production deployment

## TypeScript Conversion

This game was converted from JavaScript to TypeScript, providing:

- **Type Safety**: Compile-time type checking prevents runtime errors
- **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
- **Interface Definitions**: Clear contracts for data structures like `Direction` and `Keys`
- **Improved Maintainability**: Self-documenting code with explicit types
- **Modern Development Workflow**: Automated compilation and build processes

### Key TypeScript Features Used

- **Interfaces**: `Direction` and `Keys` interfaces for type safety
- **Access Modifiers**: Private properties in classes
- **Type Annotations**: Function parameters and return types
- **Strict Null Checks**: Safe handling of potentially null DOM elements
- **ES Module Support**: Modern import/export syntax with type checking
