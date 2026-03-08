export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Level {
    platforms: Rect[];
    coins: { x: number; y: number; id: number }[];
    exit: Rect;
    start: { x: number; y: number };
}

export const LEVELS: Level[] = [
    {
        start: { x: 50, y: 300 },
        platforms: [
            { x: 0, y: 380, width: 800, height: 20 }, // Ground
            { x: 200, y: 280, width: 100, height: 20 },
            { x: 400, y: 200, width: 100, height: 20 },
            { x: 600, y: 120, width: 100, height: 20 },
        ],
        coins: [
            { x: 250, y: 250, id: 1 },
            { x: 450, y: 170, id: 2 },
            { x: 650, y: 90, id: 3 },
        ],
        exit: { x: 750, y: 330, width: 40, height: 50 },
    },
    {
        start: { x: 50, y: 300 },
        platforms: [
            { x: 0, y: 380, width: 300, height: 20 },
            { x: 400, y: 380, width: 400, height: 20 },
            { x: 300, y: 300, width: 100, height: 20 },
            { x: 150, y: 220, width: 100, height: 20 },
            { x: 450, y: 220, width: 100, height: 20 },
            { x: 300, y: 140, width: 100, height: 20 },
        ],
        coins: [
            { x: 350, y: 270, id: 4 },
            { x: 200, y: 190, id: 5 },
            { x: 500, y: 190, id: 6 },
            { x: 350, y: 110, id: 7 },
        ],
        exit: { x: 750, y: 330, width: 40, height: 50 },
    },
    {
        start: { x: 50, y: 300 },
        platforms: [
            { x: 0, y: 380, width: 150, height: 20 },
            { x: 250, y: 300, width: 100, height: 20 },
            { x: 450, y: 250, width: 100, height: 20 },
            { x: 650, y: 200, width: 150, height: 20 },
            { x: 500, y: 120, width: 100, height: 20 },
            { x: 300, y: 80, width: 100, height: 20 },
            { x: 100, y: 120, width: 100, height: 20 },
        ],
        coins: [
            { x: 300, y: 270, id: 8 },
            { x: 500, y: 220, id: 9 },
            { x: 720, y: 170, id: 10 },
            { x: 550, y: 90, id: 11 },
            { x: 350, y: 50, id: 12 },
            { x: 150, y: 90, id: 13 },
        ],
        exit: { x: 20, y: 80, width: 40, height: 40 },
    }
];
