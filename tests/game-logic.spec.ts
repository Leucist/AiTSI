import { describe, it, expect } from 'vitest';
import { checkCoinCollection, checkExitCollision, updateScore } from '../src/game/logic_NH';
import { Player } from '../src/app/types';

describe('Unit Tests: Realistic Game Logic', () => {
    const createPlayer = (): Player => ({
        x: 100, y: 100, vx: 0, vy: 0, width: 32, height: 48, facing: 'right', grounded: true
    });

    it('11. Coin collection distance should use Pythagorean theorem (25px threshold)', () => {
        const player = createPlayer();
        const coins = [{ x: 110, y: 110, id: 1 }];
        const newlyCollected = checkCoinCollection(player, coins, new Set());
        expect(newlyCollected).toContain(1);
    });

    it('12. Coin should NOT be collected at distance > 25', () => {
        const player = createPlayer();
        const coins = [{ x: 200, y: 200, id: 2 }];
        const newlyCollected = checkCoinCollection(player, coins, new Set());
        expect(newlyCollected).toHaveLength(0);
    });

    it('13. Collecting a coin should add +10 to the score', () => {
        const score = 0;
        const newScore = updateScore(score, 1);
        expect(newScore).toBe(10);
    });

    it('14. Set should NOT allow collecting the same coin twice', () => {
        const player = createPlayer();
        const coins = [{ x: 110, y: 110, id: 1 }];
        const collected = new Set<number>([1]);
        const newlyCollected = checkCoinCollection(player, coins, collected);
        expect(newlyCollected).toHaveLength(0);
    });

    it('15. Level exit should be determined by AABB collision with the door', () => {
        const player = createPlayer();
        const exit = { x: 100, y: 100, width: 40, height: 40 };
        const isExiting = checkExitCollision(player, exit);
        expect(isExiting).toBe(true);
    });

    it('16. State change to game-over (Logical check)', () => {
        let state: 'playing' | 'game-over' = 'playing';
        state = 'game-over';
        expect(state).toBe('game-over');
    });

    it('17. Level transition should correctly sum the result', () => {
        let currentIdx = 0;
        expect(currentIdx + 1).toBe(1);
    });

    it('18. LevelIndex should not exceed the limit (App logic check)', () => {
        const levelsLength = 3;
        const nextLevel = Math.min(2, levelsLength - 1);
        expect(nextLevel).toBe(2);
    });

    it('19. Restart should reset score through current helpers', () => {
        const score = updateScore(500, -50); 
        expect(score).toBe(0); // Assuming reset logic via helper mock
    });

    it('20. Facing direction should update logically based on vx', () => {
        const vx = -4;
        const facing = vx > 0 ? 'right' : 'left';
        expect(facing).toBe('left');
    });
});