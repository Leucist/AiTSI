export interface Player {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    grounded: boolean;
    facing: 'left' | 'right';
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export type GameState = 'start' | 'playing' | 'level-complete' | 'game-over' | 'win' | 'paused';
