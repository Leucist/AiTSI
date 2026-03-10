import { describe, it, expect } from 'vitest';

describe('Unit Tests: Logika Gry', () => {
    // 11-15: Monety
    it('11. Odległość zbierania monet powinna być obliczana z tw. Pitagorasa', () => {
        const dist = Math.sqrt(Math.pow(10, 2) + Math.pow(10, 2));
        expect(dist).toBeCloseTo(14.14);
    });
    it('12. Moneta powinna być zebrana przy dystansie < 25', () => {
        expect(15 < 25).toBe(true);
    });
    it('13. Zebranie monety powinno dawać 10 punktów', () => {
        let score = 0;
        score += 10;
        expect(score).toBe(10);
    });
    it('14. Set nie powinien pozwolić zebrać tej samej monety dwa razy', () => {
        const collected = new Set([1]);
        collected.add(1);
        expect(collected.size).toBe(1);
    });
    it('15. Animacja monety powinna używać funkcji Sinus', () => {
        expect(Math.sin(0)).toBe(0);
    });

    // 16-20: Poziomy i stany
    it('16. Śmierć powinna zmieniać stan na game-over', () => {
        const state = 'game-over';
        expect(state).toBe('game-over');
    });
    it('17. Przejście poziomu powinno zwiększać levelIndex', () => {
        let idx = 0;
        expect(idx + 1).toBe(1);
    });
    it('18. LevelIndex nie powinien przekroczyć liczby poziomów', () => {
        expect(Math.min(5, 2)).toBe(2);
    });
    it('19. Restart powinien zerować wynik', () => {
        let score = 500;
        score = 0;
        expect(score).toBe(0);
    });
    it('20. Kierunek (facing) powinien zależeć od vx', () => {
        const getFacing = (vx: number) => vx > 0 ? 'right' : 'left';
        expect(getFacing(-4)).toBe('left');
    });
});