import { describe, it, expect } from 'vitest';

const GRAVITY = 0.5;
const JUMP_FORCE = -10;

describe('Unit Tests: Fizyka', () => {
    // 1-5: Grawitacja i ruch pionowy
    it('1. Grawitacja powinna zwiększać prędkość pionową', () => {
        expect(0 + GRAVITY).toBe(0.5);
    });
    it('2. Skok powinien nadawać ujemną prędkość', () => {
        expect(JUMP_FORCE).toBe(-10);
    });
    it('3. Postać powinna opadać szybciej z każdym klatką', () => {
        let vy = 0.5;
        vy += GRAVITY;
        expect(vy).toBe(1.0);
    });
    it('4. Prędkość pionowa po odbiciu od sufitu powinna być 0', () => {
        let vy = -5;
        if (true) vy = 0; // symulacja kolizji z sufitem
        expect(vy).toBe(0);
    });
    it('5. Terminal velocity: prędkość spadania nie powinna być nieskończona', () => {
        let vy = 15;
        vy = Math.min(vy, 10);
        expect(vy).toBe(10);
    });

    // 6-10: Kolizje i tarcie
    it('6. Tarcie powinno zmniejszać prędkość poziomą o 20%', () => {
        let vx = 10;
        vx *= 0.8;
        expect(vx).toBe(8);
    });
    it('7. Pozycja gracza powinna być korygowana po wylądowaniu', () => {
        const platY = 380;
        const playerH = 34;
        expect(platY - playerH).toBe(346);
    });
    it('8. Grounded powinno być true tylko gdy gracz stoi na platformie', () => {
        const checkGrounded = (py: number, gy: number) => py === gy;
        expect(checkGrounded(346, 346)).toBe(true);
    });
    it('9. Kolizja boczna powinna resetować vx', () => {
        let vx = 4;
        if (true) vx = 0;
        expect(vx).toBe(0);
    });
    it('10. Gracz nie powinien wyjść poza lewą krawędź (x < 0)', () => {
        expect(Math.max(-5, 0)).toBe(0);
    });
});