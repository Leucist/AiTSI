import { describe, it, expect } from 'vitest';
import { validateSaveData } from '../src/game/logic_NH';
import { LEVELS } from '../src/game/constants';

// Data: Save format and level structure
describe('Data & Validation', () => {
    
    it('21. should pass validation for correct save data', () => {
        const data = { levelIndex: 1, score: 50, coinsCollected: [1, 2, 3] };
        expect(validateSaveData(data)).toBe(true);
    });

    it('22. should fail validation if levelIndex is negative', () => {
        const data = { levelIndex: -1, score: 50, coinsCollected: [] };
        expect(validateSaveData(data)).toBe(false);
    });

    it('23. should fail validation if score is negative', () => {
        const data = { levelIndex: 0, score: -100, coinsCollected: [] };
        expect(validateSaveData(data)).toBe(false);
    });

    it('24. should fail validation if coinsCollected is not an array', () => {
        const data = { levelIndex: 0, score: 0, coinsCollected: null };
        expect(validateSaveData(data)).toBe(false);
    });

    it('25. should fail validation for null/undefined data', () => {
        expect(validateSaveData(null)).toBe(false);
        expect(validateSaveData(undefined)).toBe(false);
    });

    it('26. should have at least 3 levels defined in constants', () => {
        expect(LEVELS.length).toBeGreaterThanOrEqual(3);
    });

    it('27. each level should have a starting position', () => {
        LEVELS.forEach(level => {
            expect(level.start).toBeDefined();
            expect(level.start.x).toBeGreaterThanOrEqual(0);
            expect(level.start.y).toBeGreaterThanOrEqual(0);
        });
    });

    it('28. each level should have at least one platform', () => {
        LEVELS.forEach(level => {
            expect(level.platforms.length).toBeGreaterThan(0);
        });
    });

    it('29. each level should have coins defined', () => {
        LEVELS.forEach(level => {
            expect(level.coins).toBeDefined();
            expect(Array.isArray(level.coins)).toBe(true);
        });
    });

    it('30. exit should be within canvas boundaries for each level', () => {
        LEVELS.forEach(level => {
            expect(level.exit.x).toBeGreaterThanOrEqual(0);
            expect(level.exit.x).toBeLessThan(800); // CANVAS_WIDTH
            expect(level.exit.y).toBeGreaterThanOrEqual(0);
            expect(level.exit.y).toBeLessThan(600); // CANVAS_HEIGHT
        });
    });

});
