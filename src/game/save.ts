import { Level } from './constants';

export const SAVE_KEY = 'super-coin-quest-save';

export async function hasSave(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:3001/api/load', {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        if (!response.ok) return !!localStorage.getItem(SAVE_KEY);
        const data = await response.json();
        return data.hasSave;
    } catch (e) {
        return !!localStorage.getItem(SAVE_KEY);
    }
}

export async function saveGame(data: { levelIndex: number; score: number; coinsCollected: Set<number> }): Promise<void> {
    const saveData = {
        levelIndex: data.levelIndex,
        score: data.score,
        coinsCollected: Array.from(data.coinsCollected),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    
    try {
        await fetch('http://localhost:3001/api/save', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token-123' 
            },
            body: JSON.stringify(saveData)
        });
    } catch (e) {
        console.error('Failed to save to backend', e);
    }
}

export async function loadGame(): Promise<{ levelIndex: number; score: number; coinsCollected: Set<number> } | null> {
    try {
        const response = await fetch('http://localhost:3001/api/load', {
            headers: { 'Authorization': 'Bearer mock-token-123' }
        });
        if (response.ok) {
            const result = await response.json();
            if (result.hasSave && result.data) {
                return {
                    levelIndex: result.data.levelIndex,
                    score: result.data.score,
                    coinsCollected: new Set<number>(result.data.coinsCollected),
                };
            }
        }
    } catch (e) {
        console.error('Failed to load from backend', e);
    }
    
    // Fallback to local storage
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
