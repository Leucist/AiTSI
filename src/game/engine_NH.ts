import { CANVAS_HEIGHT, CANVAS_WIDTH, GRAVITY } from './config';
import { Player } from '../app/types';
import { Rect } from './constants';

export function applyGravity(player: Player): void {
    player.vy += GRAVITY;
}

export function updatePosition(player: Player): void {
    player.x += player.vx;
    player.y += player.vy;
}

export function handlePlatformCollisions(player: Player, platforms: Rect[]): boolean {
    let grounded = false;
    for (const platform of platforms) {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // Collision from top
            if (player.vy > 0 && player.y + player.height - player.vy <= platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                grounded = true;
            }
            // Collision from bottom
            else if (player.vy < 0 && player.y - player.vy >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.vy = 0;
            }
            // Collision from sides
            else if (player.vx > 0) {
                player.x = platform.x - player.width;
            } else if (player.vx < 0) {
                player.x = platform.x + platform.width;
            }
        }
    }
    return grounded;
}

export function constrainToBoundaries(player: Player): boolean {
    let gameOver = false;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y > CANVAS_HEIGHT) {
        gameOver = true;
    }
    return gameOver;
}

export function checkAABBCollision(rect1: Rect, rect2: Rect): boolean {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
