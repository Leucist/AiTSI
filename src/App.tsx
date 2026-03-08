import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, Coins, Play, RotateCcw, ArrowRight, ArrowLeft, ArrowUp, Pause, Save, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LEVELS, Level, Rect } from './constants';

const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 4;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

interface Player {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    grounded: boolean;
    facing: 'left' | 'right';
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'level-complete' | 'game-over' | 'win' | 'paused'>('start');
    const [levelIndex, setLevelIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [coinsCollected, setCoinsCollected] = useState<Set<number>>(new Set());
    const [hasSave, setHasSave] = useState(false);

    const playerRef = useRef<Player>({
        x: 50,
        y: 300,
        vx: 0,
        vy: 0,
        width: 30,
        height: 34,
        grounded: false,
        facing: 'right',
    });

    const particlesRef = useRef<Particle[]>([]);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const frameCountRef = useRef(0);

    const resetPlayer = (level: Level) => {
        playerRef.current = {
            x: level.start.x,
            y: level.start.y,
            vx: 0,
            vy: 0,
            width: 30,
            height: 34,
            grounded: false,
            facing: 'right',
        };
    };

    const checkSave = useCallback(() => {
        const saved = localStorage.getItem('super-coin-quest-save');
        setHasSave(!!saved);
    }, []);

    useEffect(() => {
        checkSave();
    }, [checkSave]);

    const saveGame = () => {
        const saveData = {
            levelIndex,
            score,
            coinsCollected: Array.from(coinsCollected),
        };
        localStorage.setItem('super-coin-quest-save', JSON.stringify(saveData));
        setHasSave(true);
        // Visual feedback could be added here
    };

    const loadGame = () => {
        const saved = localStorage.getItem('super-coin-quest-save');
        if (saved) {
            const data = JSON.parse(saved);
            setLevelIndex(data.levelIndex);
            setScore(data.score);
            setCoinsCollected(new Set(data.coinsCollected));
            resetPlayer(LEVELS[data.levelIndex]);
            setGameState('playing');
        }
    };

    const startGame = () => {
        setLevelIndex(0);
        setScore(0);
        setCoinsCollected(new Set());
        resetPlayer(LEVELS[0]);
        setGameState('playing');
    };

    const nextLevel = () => {
        if (levelIndex + 1 < LEVELS.length) {
            const nextIdx = levelIndex + 1;
            setLevelIndex(nextIdx);
            resetPlayer(LEVELS[nextIdx]);
            setGameState('playing');
        } else {
            setGameState('win');
        }
    };

    const togglePause = () => {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysRef.current[e.code] = true;
            if (e.code === 'Escape') togglePause();
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const createParticles = (x: number, y: number, color: string) => {
            for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
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
            const player = playerRef.current;
            const level = LEVELS[levelIndex];
            frameCountRef.current++;

            // Horizontal movement
            if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
                player.vx = -MOVE_SPEED;
                player.facing = 'left';
            } else if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
                player.vx = MOVE_SPEED;
                player.facing = 'right';
            } else {
                player.vx *= 0.8; // Friction
            }

            // Jump
            if ((keysRef.current['ArrowUp'] || keysRef.current['KeyW'] || keysRef.current['Space']) && player.grounded) {
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
                setGameState('game-over');
                return;
            }

            // Coin collection
            for (const coin of level.coins) {
                if (!coinsCollected.has(coin.id)) {
                    const dist = Math.sqrt(Math.pow(player.x + player.width / 2 - coin.x, 2) + Math.pow(player.y + player.height / 2 - coin.y, 2));
                    if (dist < 25) {
                        setCoinsCollected(prev => {
                            const next = new Set(prev);
                            next.add(coin.id);
                            return next;
                        });
                        setScore(s => s + 10);
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
                setGameState('level-complete');
                return;
            }

            // Update particles
            particlesRef.current = particlesRef.current.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                return p.life > 0;
            });

            draw();
            animationFrameId = requestAnimationFrame(update);
        };

        const draw = () => {
            const player = playerRef.current;
            const level = LEVELS[levelIndex];

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw Background Gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            skyGradient.addColorStop(0, '#1a2a6c');
            skyGradient.addColorStop(0.5, '#b21f1f');
            skyGradient.addColorStop(1, '#fdbb2d');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const drawCloud = (x: number, y: number, size: number) => {
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.arc(x + size * 0.6, y - size * 0.4, size * 0.8, 0, Math.PI * 2);
                ctx.arc(x + size * 1.2, y, size * 0.9, 0, Math.PI * 2);
                ctx.fill();
            };
            drawCloud(100 + (frameCountRef.current * 0.2) % 900 - 100, 80, 20);
            drawCloud(400 + (frameCountRef.current * 0.1) % 900 - 100, 120, 25);
            drawCloud(700 + (frameCountRef.current * 0.15) % 900 - 100, 60, 18);

            // Draw Platforms
            for (const platform of level.platforms) {
                // Main body
                const grad = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
                grad.addColorStop(0, '#5d4037');
                grad.addColorStop(1, '#3e2723');
                ctx.fillStyle = grad;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

                // Grass top
                ctx.fillStyle = '#43a047';
                ctx.fillRect(platform.x, platform.y, platform.width, 6);
                ctx.fillStyle = '#2e7d32';
                ctx.fillRect(platform.x, platform.y + 6, platform.width, 2);

                // Detail lines
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                for(let i = 10; i < platform.width; i += 20) {
                    ctx.moveTo(platform.x + i, platform.y + 8);
                    ctx.lineTo(platform.x + i, platform.y + platform.height);
                }
                ctx.stroke();
            }

            // Draw Coins (Animated)
            const bob = Math.sin(frameCountRef.current * 0.1) * 5;
            for (const coin of level.coins) {
                if (!coinsCollected.has(coin.id)) {
                    ctx.save();
                    ctx.translate(coin.x, coin.y + bob);

                    // Outer glow
                    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
                    glow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
                    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(0, 0, 12, 0, Math.PI * 2);
                    ctx.fill();

                    // Coin body
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    ctx.fill();

                    // Inner detail
                    ctx.strokeStyle = '#DAA520';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.fillStyle = '#DAA520';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('$', 0, 0);

                    ctx.restore();
                }
            }

            // Draw Exit (Better Door)
            const exit = level.exit;
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 3;
            ctx.strokeRect(exit.x, exit.y, exit.width, exit.height);
            // Door arch
            ctx.beginPath();
            ctx.arc(exit.x + exit.width/2, exit.y, exit.width/2, Math.PI, 0);
            ctx.fill();
            // Doorknob
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(exit.x + exit.width - 10, exit.y + exit.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw Particles
            for (const p of particlesRef.current) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // Draw Player (Better Character)
            ctx.save();
            ctx.translate(player.x, player.y);

            // Body
            ctx.fillStyle = '#E74C3C';
            ctx.fillRect(0, 0, player.width, player.height);

            // Overalls
            ctx.fillStyle = '#2980B9';
            ctx.fillRect(0, player.height * 0.6, player.width, player.height * 0.4);
            ctx.fillRect(player.width * 0.2, player.height * 0.4, player.width * 0.1, player.height * 0.2);
            ctx.fillRect(player.width * 0.7, player.height * 0.4, player.width * 0.1, player.height * 0.2);

            // Hat
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(-2, -4, player.width + 4, 8);
            ctx.fillRect(2, -8, player.width - 4, 4);

            // Eyes
            ctx.fillStyle = 'white';
            const eyeX = player.facing === 'right' ? 18 : 2;
            ctx.fillRect(eyeX, 6, 10, 8);
            ctx.fillStyle = 'black';
            const pupilX = player.facing === 'right' ? eyeX + 6 : eyeX + 2;
            ctx.fillRect(pupilX, 8, 3, 4);

            ctx.restore();
        };

        update();

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, levelIndex, coinsCollected]);

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white">
            <div className="max-w-4xl w-full">
                {/* Header / HUD */}
                <div className="flex justify-between items-center mb-4 bg-neutral-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                            </div>
                            <span className="font-mono text-2xl font-bold text-yellow-500">{score}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Current Level</span>
                            <span className="text-sm font-bold text-emerald-400">STAGE {levelIndex + 1} / {LEVELS.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-xl border border-white/5">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="font-mono text-sm font-bold">{coinsCollected.size}</span>
                        </div>
                        <button
                            onClick={togglePause}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <Pause className="w-5 h-5" />
                        </button>
                        <button
                            onClick={saveGame}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-emerald-400"
                            title="Save Game"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Game Container */}
                <div className="relative aspect-[2/1] bg-neutral-900 rounded-[2rem] overflow-hidden border-8 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="w-full h-full"
                    />

                    {/* Overlays */}
                    <AnimatePresence>
                        {gameState === 'start' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 12 }}
                                >
                                    <h1 className="text-7xl font-black mb-2 tracking-tighter italic bg-gradient-to-b from-yellow-300 to-yellow-600 bg-clip-text text-transparent drop-shadow-2xl">
                                        SUPER COIN QUEST
                                    </h1>
                                    <div className="h-1 w-32 bg-yellow-500 mx-auto mb-8 rounded-full" />
                                </motion.div>

                                <p className="text-neutral-400 mb-10 max-w-md text-lg leading-relaxed">
                                    Embark on a legendary journey through mystical lands. Collect gold and master the platforms!
                                </p>

                                <div className="flex flex-col gap-4 w-full max-w-xs">
                                    <button
                                        onClick={startGame}
                                        className="group flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
                                    >
                                        <Play className="w-6 h-6 fill-current" />
                                        NEW ADVENTURE
                                    </button>

                                    {hasSave && (
                                        <button
                                            onClick={loadGame}
                                            className="flex items-center justify-center gap-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 px-8 rounded-2xl transition-all border border-white/10"
                                        >
                                            <Download className="w-5 h-5" />
                                            CONTINUE JOURNEY
                                        </button>
                                    )}
                                </div>

                                <div className="mt-12 flex gap-10 text-[10px] uppercase tracking-[0.3em] opacity-30 font-black">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 border border-white rounded-md">WASD</span>
                                        <span>Navigate</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 border border-white rounded-md">SPACE</span>
                                        <span>Leap</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 border border-white rounded-md">ESC</span>
                                        <span>Pause</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'paused' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center"
                            >
                                <div className="bg-neutral-900 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center">
                                    <Pause className="w-16 h-16 text-yellow-500 mb-6" />
                                    <h2 className="text-4xl font-black mb-8 tracking-tight">GAME PAUSED</h2>
                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            onClick={togglePause}
                                            className="w-full bg-emerald-500 text-black font-black py-4 px-12 rounded-2xl hover:bg-emerald-400 transition-all"
                                        >
                                            RESUME
                                        </button>
                                        <button
                                            onClick={saveGame}
                                            className="w-full bg-neutral-800 text-white font-bold py-4 px-12 rounded-2xl hover:bg-neutral-700 transition-all border border-white/5"
                                        >
                                            SAVE PROGRESS
                                        </button>
                                        <button
                                            onClick={() => setGameState('start')}
                                            className="w-full text-neutral-500 font-bold py-4 px-12 rounded-2xl hover:text-white transition-all"
                                        >
                                            QUIT TO MENU
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'level-complete' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-emerald-500/95 backdrop-blur-xl flex flex-col items-center justify-center text-black p-8"
                            >
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <Trophy className="w-24 h-24 mb-6" />
                                </motion.div>
                                <h2 className="text-5xl font-black mb-2 tracking-tighter">STAGE CLEAR!</h2>
                                <p className="mb-10 font-bold text-lg opacity-70">The journey continues...</p>
                                <button
                                    onClick={nextLevel}
                                    className="group flex items-center gap-3 bg-black text-white font-black py-5 px-12 rounded-2xl hover:bg-neutral-900 transition-all shadow-2xl"
                                >
                                    NEXT STAGE
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {gameState === 'game-over' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-red-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8"
                            >
                                <h2 className="text-6xl font-black mb-4 tracking-tighter">GAME OVER</h2>
                                <p className="mb-10 font-bold text-lg opacity-70">Every hero falls, but the brave rise again.</p>
                                <button
                                    onClick={startGame}
                                    className="flex items-center gap-3 bg-white text-red-600 font-black py-5 px-12 rounded-2xl hover:bg-neutral-100 transition-all shadow-2xl"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                    TRY AGAIN
                                </button>
                            </motion.div>
                        )}

                        {gameState === 'win' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-yellow-400 backdrop-blur-xl flex flex-col items-center justify-center text-black p-8"
                            >
                                <div className="flex gap-4 mb-8">
                                    <Trophy className="w-16 h-16 opacity-50" />
                                    <Trophy className="w-24 h-24 -mt-6" />
                                    <Trophy className="w-16 h-16 opacity-50" />
                                </div>
                                <h2 className="text-6xl font-black mb-2 tracking-tighter">LEGENDARY!</h2>
                                <p className="mb-10 font-bold text-2xl">Final Score: {score}</p>
                                <button
                                    onClick={startGame}
                                    className="flex items-center gap-3 bg-black text-white font-black py-5 px-12 rounded-2xl hover:bg-neutral-900 transition-all shadow-2xl"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                    NEW GAME
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls Hint for Mobile/Touch */}
                <div className="mt-8 grid grid-cols-3 gap-6 md:hidden">
                    <div className="col-start-2 flex justify-center">
                        <button
                            onMouseDown={() => keysRef.current['ArrowUp'] = true}
                            onMouseUp={() => keysRef.current['ArrowUp'] = false}
                            onTouchStart={() => keysRef.current['ArrowUp'] = true}
                            onTouchEnd={() => keysRef.current['ArrowUp'] = false}
                            className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center active:bg-neutral-800 border border-white/10 shadow-lg"
                        >
                            <ArrowUp className="w-10 h-10" />
                        </button>
                    </div>
                    <div className="col-start-1 flex justify-center">
                        <button
                            onMouseDown={() => keysRef.current['ArrowLeft'] = true}
                            onMouseUp={() => keysRef.current['ArrowLeft'] = false}
                            onTouchStart={() => keysRef.current['ArrowLeft'] = true}
                            onTouchEnd={() => keysRef.current['ArrowLeft'] = false}
                            className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center active:bg-neutral-800 border border-white/10 shadow-lg"
                        >
                            <ArrowLeft className="w-10 h-10" />
                        </button>
                    </div>
                    <div className="col-start-3 flex justify-center">
                        <button
                            onMouseDown={() => keysRef.current['ArrowRight'] = true}
                            onMouseUp={() => keysRef.current['ArrowRight'] = false}
                            onTouchStart={() => keysRef.current['ArrowRight'] = true}
                            onTouchEnd={() => keysRef.current['ArrowRight'] = false}
                            className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center active:bg-neutral-800 border border-white/10 shadow-lg"
                        >
                            <ArrowRight className="w-10 h-10" />
                        </button>
                    </div>
                </div>

                <footer className="mt-12 flex flex-col items-center gap-4 text-neutral-600 text-xs font-bold uppercase tracking-[0.2em]">
                    <div className="flex gap-8">
                        <span>Level Design: Pro</span>
                        <span>Art: Crafted</span>
                        <span>Engine: Custom</span>
                    </div>
                    <p className="opacity-40">© 2026 Super Coin Quest Studios</p>
                </footer>
            </div>
        </div>
    );
}