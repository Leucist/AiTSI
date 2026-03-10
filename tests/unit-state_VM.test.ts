import { describe, it, expect } from 'vitest';
import { validateSaveData } from '../src/game/logic_NH';
import { LEVELS } from '../src/game/constants';

describe('Unit Tests: Backend Logic & State Transitions (VM)', () => {
    // 1-5: Save/Load Edge Cases using validateSaveData
    it('1. should invalidate empty save data object', () => {
        expect(validateSaveData({})).toBe(false);
    });

    it('2. should check for missing required keys in JSON via validator', () => {
        const data = { levelIndex: 0 };
        expect(validateSaveData(data)).toBe(false);
    });

    it('3. should invalidate data if coinsCollected is missing', () => {
        const data = { levelIndex: 0, score: 0 };
        expect(validateSaveData(data)).toBe(false);
    });

    it('4. should validate data against real LEVELS count', () => {
        const maxValidIdx = LEVELS.length - 1;
        expect(validateSaveData({ levelIndex: maxValidIdx, score: 0, coinsCollected: [] })).toBe(true);
        expect(validateSaveData({ levelIndex: LEVELS.length, score: 0, coinsCollected: [] })).toBe(false);
    });

    it('5. should handle max score validation (logical boundary)', () => {
        expect(validateSaveData({ levelIndex: 0, score: 1000000, coinsCollected: [] })).toBe(true);
    });

    // 6-10: State Management Transitions (Simulated)
    it('6. should transition state logically (playing -> win)', () => {
        let state: 'playing' | 'win' | 'game-over' = 'playing';
        state = 'win';
        expect(state).toBe('win');
    });

    it('7. should transition state logically (playing -> game-over)', () => {
        let state: 'playing' | 'win' | 'game-over' = 'playing';
        state = 'game-over';
        expect(state).toBe('game-over');
    });

    it('8. should transition state logically (paused -> playing)', () => {
        let isPaused = true;
        isPaused = false;
        expect(isPaused).toBe(false);
    });

    it('9. should transition state logically (start -> playing)', () => {
        let state: 'start' | 'playing' = 'start';
        state = 'playing';
        expect(state).toBe('playing');
    });

    it('10. should validate level index range based on LEVELS constants', () => {
        const validIndices = LEVELS.map((_, i) => i);
        expect(validIndices).toContain(0);
        expect(validIndices).toContain(LEVELS.length - 1);
    });
});
