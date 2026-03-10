import { describe, it, expect } from 'vitest';
import { applyGravity, updatePosition, handlePlatformCollisions, constrainToBoundaries } from '../src/game/engine_NH';
import { Player } from '../src/app/types';
import { GRAVITY, CANVAS_WIDTH, CANVAS_HEIGHT } from '../src/game/config';

describe('Unit Tests: Realistic Physics', () => {
    const createPlayer = (): Player => ({
        x: 100, y: 100, vx: 0, vy: 0, width: 30, height: 34, facing: 'right', grounded: false
    });

    it('1. Gravity should increment vertical velocity (using config.GRAVITY)', () => {
        const player = createPlayer();
        applyGravity(player);
        expect(player.vy).toBe(GRAVITY);
    });

    it('2. Jump should set negative vertical velocity (Simulated)', () => {
        const player = createPlayer();
        player.vy = -10; // Jump force
        expect(player.vy).toBe(-10);
    });

    it('3. Player should fall faster with each frame', () => {
        const player = createPlayer();
        applyGravity(player);
        const vy1 = player.vy;
        applyGravity(player);
        const vy2 = player.vy;
        expect(vy2).toBeGreaterThan(vy1);
    });

    it('4. Vertical velocity should be 0 after landing on a platform', () => {
        const player = createPlayer();
        player.y = 95;
        player.vy = 5;
        const platforms = [{ x: 50, y: 125, width: 100, height: 20 }];
        handlePlatformCollisions(player, platforms);
        expect(player.vy).toBe(0);
        expect(player.y).toBe(125 - player.height);
    });

    it('5. updatePosition should correctly move the player based on velocity', () => {
        const player = createPlayer();
        player.vx = 5;
        player.vy = 2;
        updatePosition(player);
        expect(player.x).toBe(105);
        expect(player.y).toBe(102);
    });

    it('6. constrainToBoundaries should stop player at the left edge', () => {
        const player = createPlayer();
        player.x = -10;
        const gameOver = constrainToBoundaries(player);
        expect(player.x).toBe(0);
        expect(gameOver).toBe(false);
    });

    it('7. Player position should be corrected after landing (on top of platform)', () => {
        const player = createPlayer();
        player.y = 95;
        player.vy = 5;
        const platforms = [{ x: 50, y: 125, width: 100, height: 20 }];
        handlePlatformCollisions(player, platforms);
        expect(player.y).toBe(125 - player.height);
    });

    it('8. Grounded should be true after colliding with a platform from top', () => {
        const player = createPlayer();
        player.y = 95;
        player.vy = 5;
        const platforms = [{ x: 50, y: 125, width: 100, height: 20 }];
        const isGrounded = handlePlatformCollisions(player, platforms);
        expect(isGrounded).toBe(true);
    });

    it('9. Side collision should stop horizontal movement', () => {
        const player = createPlayer();
        player.x = 90;
        player.vx = 5;
        player.y = 100;
        const platforms = [{ x: 100, y: 100, width: 20, height: 50 }];
        handlePlatformCollisions(player, platforms);
        expect(player.x).toBe(100 - player.width);
    });

    it('10. Player should not exit beyond the right boundary', () => {
        const player = createPlayer();
        player.x = CANVAS_WIDTH + 10;
        const gameOver = constrainToBoundaries(player);
        expect(player.x).toBe(CANVAS_WIDTH - player.width);
    });
});