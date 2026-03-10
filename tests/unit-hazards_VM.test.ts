import { describe, it, expect } from 'vitest';
import { calculateDistance, checkAABBCollision } from '../src/game/engine_NH';

describe('Unit Tests: Dimensions & Math (VM)', () => {
    // 1-5: Math Helpers
    it('1. should calculate distance correctly for positive coordinates', () => {
        expect(calculateDistance(0, 0, 3, 4)).toBe(5);
    });

    it('2. should calculate distance as 0 for same point', () => {
        expect(calculateDistance(10, 10, 10, 10)).toBe(0);
    });

    it('3. should handle negative coordinates in distance calculation', () => {
        expect(calculateDistance(-1, -1, 2, 3)).toBe(5);
    });

    it('4. should detect collision between overlapping rectangles', () => {
        const r1 = { x: 0, y: 0, width: 10, height: 10 };
        const r2 = { x: 5, y: 5, width: 10, height: 10 };
        expect(checkAABBCollision(r1, r2)).toBe(true);
    });

    it('5. should not detect collision for separated rectangles', () => {
        const r1 = { x: 0, y: 0, width: 10, height: 10 };
        const r2 = { x: 20, y: 20, width: 10, height: 10 };
        expect(checkAABBCollision(r1, r2)).toBe(false);
    });

    // 6-10: Boundary & Edge Logic (Logic Mocks)
    it('6. should detect overlap on edges', () => {
        const r1 = { x: 0, y: 0, width: 10, height: 10 };
        const r2 = { x: 9, y: 9, width: 10, height: 10 };
        expect(checkAABBCollision(r1, r2)).toBe(true);
    });

    it('7. should not overlap if touching only (x+w = x2)', () => {
        const r1 = { x: 0, y: 0, width: 10, height: 10 };
        const r2 = { x: 10, y: 0, width: 10, height: 10 };
        expect(checkAABBCollision(r1, r2)).toBe(false);
    });

    it('8. should calculate large distances without overflow', () => {
        expect(calculateDistance(0, 0, 3000, 4000)).toBe(5000);
    });

    it('9. should handle small floating point distances', () => {
        const dist = calculateDistance(0, 0, 0.3, 0.4);
        expect(dist).toBeCloseTo(0.5);
    });

    it('10. should handle horizontal-only distance', () => {
        expect(calculateDistance(10, 5, 20, 5)).toBe(10);
    });
});
