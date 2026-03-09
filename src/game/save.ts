import { Level } from './constants';

export const SAVE_KEY = 'super-coin-quest-save';

export function hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
}

export function saveGame(data: { levelIndex: number; score: number; coinsCollected: Set<number> }): void {
    const saveData = {
        levelIndex: data.levelIndex,
        score: data.score,
        coinsCollected: Array.from(data.coinsCollected),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

export function loadGame(): { levelIndex: number; score: number; coinsCollected: Set<number> } | null {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);
    return {
        levelIndex: data.levelIndex,
        score: data.score,
        coinsCollected: new Set<number>(data.coinsCollected),
    };
}

export function resetPlayerToLevelStart(level: Level): {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    grounded: boolean;
    facing: 'left' | 'right';
} {
    return {
        x: level.start.x,
        y: level.start.y,
        vx: 0,
        vy: 0,
        width: 30,
        height: 34,
        grounded: false,
        facing: 'right',
    };
}
