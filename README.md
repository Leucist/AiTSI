# Super Coin Quest

Super Coin Quest is a 2D platformer web application built with React and Vite. It features a custom physics engine, particle effects, multiple levels, and a persistent saving system integrated with a backend server.

The project is designed with a strong focus on automated testing, covering everything from core physics calculations to complete end-to-end user scenarios.

---

## Features

- Dynamic 2D platforming mechanics (movement, jumping, gravity).
- Multi-level progression system.
- Persistent game state (score, level index, collected coins).
- Dual-layer saving system: LocalStorage fallback and Backend SQLite database.
- Interactive HUD (Heads-Up Display) and game overlays (Start, Pause, Game Over, Win).
- Particle systems for immersive feedback.

---

## Technology Stack

| Category | Technology |
| :--- | :--- |
| Frontend | React, Vite, Lucide Icons, Motion (AnimatePresence) |
| Backend | Node.js, Express, Better-SQLite3 |
| Styling | CSS (Tailwind compatible logic) |
| Testing (Unit) | Vitest |
| Testing (E2E/UI) | Playwright |
| Environment | Linux / Node 20+ |

---

## Project Structure

### Core Game Logic
Main game loop and core physics/logic modules were extracted to improve testability and maintainability.

- src/game/engine_NH.ts: Physics engine, gravity, and collision detection.
- src/game/logic_NH.ts: Game mechanics (coin collection, score updates).
- src/game/save.ts: Save/Load orchestration between local storage and API.
- server_NH.ts: Express backend with SQLite persistence.

### Automated Testing Suite
The project contains a comprehensive suite of 122 automated tests.

- tests/unit-*_NH.test.ts: Core unit tests for physics, mechanics, and data.
- tests/unit-*_VM.test.ts: Extended unit tests for hazards, particles, and state transitions.
- tests/*.spec.ts: Original smoke tests and UI component verification.
- tests/e2e/full-game_NH.spec.ts: Complete end-to-end gameplay scenarios.

---

## Testing Guide

The testing suite is split into two main runners. Ensure the backend server is running or the environment is prepared before executing tests.

### 1. Unit Testing (Vitest)
Unit tests verify the isolated logic without a browser. We currently have 90 unit tests.

Command:
npm run test:unit

Includes:
- Physics and collision calculations.
- Game mechanics and score progression.
- Data integrity and state transitions.
- Environment hazards and math helpers.

### 2. UI and E2E Testing (Playwright)
These tests launch a real browser to verify the interface and full game flows. We currently have 62 Playwright scenarios (31 smoke + 31 full-game E2E).

Commands:

- Run all smoke tests:
  npx playwright test tests/*.spec.ts

- Run full gameplay E2E scenarios:
  npx playwright test tests/e2e/full-game_NH.spec.ts

Note: Playwright tests are configured to run sequentially (workers: 1) to avoid database lock contention during persistence tests.

---

## Getting Started

### Installation
1. Install dependencies:
   npm install

### Development
1. Start both frontend and backend concurrently:
   npm start

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:3001

---

## Game Controls

- A / D or Left / Right: Move Player
- W or Up or Space: Jump
- Esc: Pause Game
- S or Hud Button: Save Progress
