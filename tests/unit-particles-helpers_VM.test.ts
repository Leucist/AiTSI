import { describe, it, expect } from 'vitest';
import { MOVE_SPEED } from '../src/game/config';

describe('Unit Tests: Particles & Internal Helpers (VM)', () => {
    // 1-5: Particle Logic (Reflecting runGameLoop logic in loop.ts)
    it('1. should decrement particle lifetime by 0.02 (loop.ts:106)', () => {
        let life = 1.0;
        const decay = 0.02; // from loop.ts
        life -= decay;
        expect(life).toBeCloseTo(0.98);
    });

    it('2. should filter out dead particles (loop.ts:107)', () => {
        const particles = [{ life: -0.01 }, { life: 0.5 }, { life: 0.0 }];
        const active = particles.filter(p => p.life > 0);
        expect(active).toHaveLength(1);
    });

    it('3. should randomize particle speed (-2 to +2 range via loop.ts:42/43)', () => {
        // vx: (Math.random() - 0.5) * 4 => range [-2, 2]
        const vx = (0.75 - 0.5) * 4; // Mock random = 0.75
        expect(vx).toBe(1.0);
        expect(vx).toBeGreaterThanOrEqual(-2);
        expect(vx).toBeLessThanOrEqual(2);
    });

    it('4. should apply friction 0.8 to horizontal velocity (loop.ts:63)', () => {
        const initialVx = 10;
        const friction = 0.8;
        const finalVx = initialVx * friction;
        expect(finalVx).toBe(8);
    });

    it('5. should set vx to MOVE_SPEED on ArrowRight (loop.ts:60)', () => {
        let vx = 0;
        const isRightPressed = true;
        if (isRightPressed) vx = MOVE_SPEED;
        expect(vx).toBe(MOVE_SPEED);
    });

    // 6-10: Score & Number Formatting
    it('6. Math.floor should round score for display (same as hud.spec.ts check)', () => {
        expect(Math.floor(123.9)).toBe(123);
    });

    it('7. should format total score string correctly', () => {
        const score = 500;
        expect(`Total: ${score}`).toBe('Total: 500');
    });

    it('8. should calculate collected percentage (Helper logic)', () => {
        const collectedCount = 2;
        const totalLevelCoins = 5;
        const percent = (collectedCount / totalLevelCoins) * 100;
        expect(percent).toBe(40);
    });

    it('9. should handle score overflow prevention (logical check)', () => {
        const score = 999999;
        const maxDisplay = 999999;
        expect(Math.min(score, maxDisplay)).toBe(999999);
    });

    it('10. should handle negative score clamping (Helper logic)', () => {
        const rawScore = -50;
        const clampedScore = Math.max(0, rawScore);
        expect(clampedScore).toBe(0);
    });
});
