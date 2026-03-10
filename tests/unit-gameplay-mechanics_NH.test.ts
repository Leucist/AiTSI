import { describe, it, expect, beforeEach } from 'vitest';
import { checkCoinCollection, checkExitCollision, updateScore } from '../src/game/logic_NH';
import { Player } from '../src/app/types';

describe('Game Logic', () => {
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
            grounded: true
        };
    });

    it('11. should collect a coin when close enough', () => {
        const coins = [{ x: 110, y: 120, id: 1 }];
        const collected = new Set<number>();
        const newlyCollected = checkCoinCollection(mockPlayer, coins, collected);
        expect(newlyCollected).toContain(1);
    });

    it('12. should NOT collect a coin when far away', () => {
        const coins = [{ x: 500, y: 500, id: 2 }];
        const collected = new Set<number>();
        const newlyCollected = checkCoinCollection(mockPlayer, coins, collected);
        expect(newlyCollected).toHaveLength(0);
    });

    it('13. should NOT collect a coin that is already collected', () => {
        const coins = [{ x: 110, y: 120, id: 1 }];
        const collected = new Set<number>([1]);
        const newlyCollected = checkCoinCollection(mockPlayer, coins, collected);
        expect(newlyCollected).toHaveLength(0);
    });

    it('14. should detect collision with the exit door', () => {
        const exit = { x: 100, y: 100, width: 40, height: 40 };
        const isExiting = checkExitCollision(mockPlayer, exit);
        expect(isExiting).toBe(true);
    });

    it('15. should NOT detect collision with a far away exit door', () => {
        const exit = { x: 500, y: 500, width: 40, height: 40 };
        const isExiting = checkExitCollision(mockPlayer, exit);
        expect(isExiting).toBe(false);
    });

    it('16. should correctly update score by +10 for one coin', () => {
        const newScore = updateScore(0, 1);
        expect(newScore).toBe(10);
    });

    it('17. should correctly update score for multiple coins', () => {
        const newScore = updateScore(50, 3);
        expect(newScore).toBe(80);
    });

    it('18. should handle zero coins collection without changing score', () => {
        const newScore = updateScore(100, 0);
        expect(newScore).toBe(100);
    });

    it('19. should distinguish between different coins', () => {
        const coins = [
            { x: 110, y: 120, id: 1 },
            { x: 500, y: 500, id: 2 }
        ];
        const collected = new Set<number>();
        const newlyCollected = checkCoinCollection(mockPlayer, coins, collected);
        expect(newlyCollected).toContain(1);
        expect(newlyCollected).not.toContain(2);
    });

    it('20. should allow collecting multiple coins in one check if overlapping', () => {
        const coins = [
            { x: 110, y: 120, id: 1 },
            { x: 115, y: 125, id: 2 }
        ];
        const collected = new Set<number>();
        const newlyCollected = checkCoinCollection(mockPlayer, coins, collected);
        expect(newlyCollected).toContain(1);
        expect(newlyCollected).toContain(2);
    });
});
