import { describe, it, expect, beforeEach } from 'vitest';
import { applyGravity, updatePosition, handlePlatformCollisions, constrainToBoundaries, checkAABBCollision } from '../src/game/engine_NH';
import { Player } from '../src/app/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GRAVITY } from '../src/game/config';

describe('Physics Engine', () => {
    let mockPlayer: Player;

    beforeEach(() => {
        mockPlayer = {
            x: 100,
            y: 100,
            vx: 0,
            vy: 0,
            width: 32,
            height: 48,
            facing: 'right',
            grounded: false
        };
    });

    it('1. should apply gravity correctly', () => {
        const initialVy = mockPlayer.vy;
        applyGravity(mockPlayer);
        expect(mockPlayer.vy).toBe(initialVy + GRAVITY);
    });

    it('2. should update position based on velocity', () => {
        mockPlayer.vx = 5;
        mockPlayer.vy = 10;
        updatePosition(mockPlayer);
        expect(mockPlayer.x).toBe(105);
        expect(mockPlayer.y).toBe(110);
    });

    it('3. should detect if player is on top of a platform', () => {
        mockPlayer.y = 153; // 153 + 48 = 201 (> 200 platform top)
        mockPlayer.vy = 5;
        const platforms = [{ x: 100, y: 200, width: 100, height: 20 }];
        const isGrounded = handlePlatformCollisions(mockPlayer, platforms);
        expect(isGrounded).toBe(true);
        expect(mockPlayer.y).toBe(200 - mockPlayer.height);
        expect(mockPlayer.vy).toBe(0);
    });

    it('4. should detect collision from the side', () => {
        mockPlayer.x = 90;
        mockPlayer.y = 100;
        mockPlayer.vx = 5;
        const platforms = [{ x: 100, y: 100, width: 20, height: 100 }];
        handlePlatformCollisions(mockPlayer, platforms);
        expect(mockPlayer.x).toBe(100 - mockPlayer.width);
    });

    it('5. should constrain player within left boundary', () => {
        mockPlayer.x = -10;
        const gameOver = constrainToBoundaries(mockPlayer);
        expect(mockPlayer.x).toBe(0);
        expect(gameOver).toBe(false);
    });

    it('6. should constrain player within right boundary', () => {
        mockPlayer.x = CANVAS_WIDTH + 10;
        const gameOver = constrainToBoundaries(mockPlayer);
        expect(mockPlayer.x).toBe(CANVAS_WIDTH - mockPlayer.width);
        expect(gameOver).toBe(false);
    });

    it('7. should trigger game over if player falls below bottom', () => {
        mockPlayer.y = CANVAS_HEIGHT + 1;
        const gameOver = constrainToBoundaries(mockPlayer);
        expect(gameOver).toBe(true);
    });

    it('8. should correctly detect AABB collision overlap', () => {
        const rect1 = { x: 0, y: 0, width: 10, height: 10 };
        const rect2 = { x: 5, y: 5, width: 10, height: 10 };
        expect(checkAABBCollision(rect1, rect2)).toBe(true);
    });

    it('9. should correctly detect no AABB collision overlap', () => {
        const rect1 = { x: 0, y: 0, width: 10, height: 10 };
        const rect2 = { x: 20, y: 20, width: 10, height: 10 };
        expect(checkAABBCollision(rect1, rect2)).toBe(false);
    });

    it('10. should handle multiple platforms simultaneously', () => {
        mockPlayer.y = 153; // 153 + 48 = 201 (> 200 platform top)
        mockPlayer.vy = 5;
        const platforms = [
            { x: 0, y: 500, width: 100, height: 20 },
            { x: 100, y: 200, width: 100, height: 20 }
        ];
        const isGrounded = handlePlatformCollisions(mockPlayer, platforms);
        expect(isGrounded).toBe(true);
        expect(mockPlayer.y).toBe(200 - mockPlayer.height);
    });
});
