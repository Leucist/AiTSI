import { Rect, LEVELS } from './constants';
import { Player } from '../app/types';
import { checkAABBCollision, calculateDistance } from './engine_NH';

export function checkCoinCollection(player: Player, coins: { x: number; y: number; id: number }[], collected: Set<number>): number[] {
    const newlyCollected: number[] = [];
    for (const coin of coins) {
        if (!collected.has(coin.id)) {
            const dist = calculateDistance(
                player.x + player.width / 2, 
                player.y + player.height / 2, 
                coin.x, 
                coin.y
            );
            if (dist < 25) {
                newlyCollected.push(coin.id);
            }
        }
    }
    return newlyCollected;
}

export function checkExitCollision(player: Player, exit: Rect): boolean {
    return checkAABBCollision(
        { x: player.x, y: player.y, width: player.width, height: player.height },
        exit
    );
}

export function updateScore(currentScore: number, coinsCount: number): number {
    return currentScore + coinsCount * 10;
}

export function validateSaveData(data: any): boolean {
    if (!data) return false;
    if (typeof data.levelIndex !== 'number' || data.levelIndex < 0 || data.levelIndex >= LEVELS.length) return false;
    if (typeof data.score !== 'number' || data.score < 0) return false;
    if (!Array.isArray(data.coinsCollected)) return false;
    return true;
}
