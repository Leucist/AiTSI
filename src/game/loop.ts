import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GRAVITY, JUMP_FORCE, MOVE_SPEED } from './config';
import { Level } from './constants';
import { Particle, Player } from '../app/types';
import { drawFrame } from './render/draw';

export function runGameLoop(params: {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    keysRef: React.MutableRefObject<Record<string, boolean>>;
    frameCountRef: React.MutableRefObject<number>;
    playerRef: React.MutableRefObject<Player>;
    particlesRef: React.MutableRefObject<Particle[]>;
    levelIndex: number;
    levels: Level[];
    coinsCollected: Set<number>;
    setCoinsCollected: React.Dispatch<React.SetStateAction<Set<number>>>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setGameState: React.Dispatch<React.SetStateAction<'start' | 'playing' | 'level-complete' | 'game-over' | 'win' | 'paused'>>;
}): () => void {
    const canvas = params.canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    let animationFrameId: number;

    const createParticles = (x: number, y: number, color: string) => {
        for (let i = 0; i < 8; i++) {
            params.particlesRef.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color,
            });
        }
    };

    const update = () => {
        const player = params.playerRef.current;
        const level = params.levels[params.levelIndex];
        params.frameCountRef.current++;

        // Horizontal movement
        if (params.keysRef.current['ArrowLeft'] || params.keysRef.current['KeyA']) {
            player.vx = -MOVE_SPEED;
            player.facing = 'left';
        } else if (params.keysRef.current['ArrowRight'] || params.keysRef.current['KeyD']) {
            player.vx = MOVE_SPEED;
            player.facing = 'right';
        } else {
            player.vx *= 0.8; // Friction
        }

        // Jump
        if ((params.keysRef.current['ArrowUp'] || params.keysRef.current['KeyW'] || params.keysRef.current['Space']) && player.grounded) {
            player.vy = JUMP_FORCE;
            player.grounded = false;
            createParticles(player.x + player.width / 2, player.y + player.height, '#ffffff');
        }

        // Apply gravity
        player.vy += GRAVITY;

        // Update position
        player.x += player.vx;
        player.y += player.vy;

        // Collision detection - Platforms
        player.grounded = false;
        for (const platform of level.platforms) {
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
                    player.grounded = true;
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

        // Boundaries
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
        if (player.y > CANVAS_HEIGHT) {
            params.setGameState('game-over');
            return;
        }

        // Coin collection
        for (const coin of level.coins) {
            if (!params.coinsCollected.has(coin.id)) {
                const dist = Math.sqrt(
                    Math.pow(player.x + player.width / 2 - coin.x, 2) + Math.pow(player.y + player.height / 2 - coin.y, 2),
                );
                if (dist < 25) {
                    params.coinsCollected.add(coin.id); // Add it to parameter directly to avoid immediate next frame double counting
                    params.setCoinsCollected(prev => {
                        const next = new Set(prev);
                        next.add(coin.id);
                        return next;
                    });
                    params.setScore(s => s + 10);
                    createParticles(coin.x, coin.y, '#FFD700');
                }
            }
        }

        // Exit detection
        const exit = level.exit;
        if (
            player.x < exit.x + exit.width &&
            player.x + player.width > exit.x &&
            player.y < exit.y + exit.height &&
            player.y + player.height > exit.y
        ) {
            params.setGameState('level-complete');
            return;
        }

        // Update particles
        params.particlesRef.current = params.particlesRef.current.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });

        drawFrame({
            ctx,
            player,
            level,
            particles: params.particlesRef.current,
            coinsCollected: params.coinsCollected,
            frameCount: params.frameCountRef.current,
        });

        animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animationFrameId);
}
