import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GRAVITY, JUMP_FORCE, MOVE_SPEED } from './config';
import { Level } from './constants';
import { Particle, Player } from '../app/types';
import { drawFrame } from './render/draw';
import { 
    applyGravity, 
    updatePosition, 
    handlePlatformCollisions, 
    constrainToBoundaries 
} from './engine';
import { 
    checkCoinCollection, 
    updateScore, 
    checkExitCollision 
} from './logic';

export function runGameLoop(params: {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    keysRef: React.MutableRefObject<Record<string, boolean>>;
    frameCountRef: React.MutableRefObject<number>;
    playerRef: React.MutableRefObject<Player>;
    particlesRef: React.MutableRefObject<Particle[]>;
    levelIndex: number;
    levels: Level[];
    coinsCollected: Set<number>;
    onCoinCollect: (ids: number[]) => void;
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

        // Apply physics
        applyGravity(player);
        updatePosition(player);

        // Platform collisions
        player.grounded = handlePlatformCollisions(player, level.platforms);

        // Boundaries
        if (constrainToBoundaries(player)) {
            params.setGameState('game-over');
            return;
        }

        // Coin collection
        const newlyCollected = checkCoinCollection(player, level.coins, params.coinsCollected);
        if (newlyCollected.length > 0) {
            params.onCoinCollect(newlyCollected);
            newlyCollected.forEach(id => {
                const coin = level.coins.find(c => c.id === id);
                if (coin) createParticles(coin.x, coin.y, '#FFD700');
            });
        }

        // Exit detection
        if (checkExitCollision(player, level.exit)) {
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
