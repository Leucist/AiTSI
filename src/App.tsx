import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, Coins, Play, RotateCcw, ArrowRight, ArrowLeft, ArrowUp, Pause, Save, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LEVELS, Level, Rect } from './game/constants';
import { GameState, Particle, Player } from './app/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GRAVITY, JUMP_FORCE, MOVE_SPEED } from './game/config';
import { attachKeyboardControls } from './game/input';
import { hasSave, loadGame as loadGameFromStorage, resetPlayerToLevelStart, saveGame as saveGameToStorage } from './game/save';
import { runGameLoop } from './game/loop';
import { Hud } from './ui/Hud';
import { StartOverlay } from './ui/overlays/StartOverlay';
import { PauseOverlay } from './ui/overlays/PauseOverlay';
import { LevelCompleteOverlay } from './ui/overlays/LevelCompleteOverlay';
import { GameOverOverlay } from './ui/overlays/GameOverOverlay';
import { WinOverlay } from './ui/overlays/WinOverlay';

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>('start');
    const [levelIndex, setLevelIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [coinsCollected, setCoinsCollected] = useState<Set<number>>(new Set());
    const [savedGameExists, setSavedGameExists] = useState(false);

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

    const scoreRef = useRef(0);
    const coinsRef = useRef<Set<number>>(new Set());
    const particlesRef = useRef<Particle[]>([]);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const frameCountRef = useRef(0);

    const syncState = () => {
        setScore(scoreRef.current);
        setCoinsCollected(new Set(coinsRef.current));
    };

    const resetPlayer = (level: Level) => {
        playerRef.current = resetPlayerToLevelStart(level);
    };

    const checkSave = useCallback(async () => {
        setSavedGameExists(await hasSave());
    }, []);

    useEffect(() => {
        checkSave();
    }, [checkSave]);

    const saveGame = async () => {
        await saveGameToStorage({ levelIndex, score: scoreRef.current, coinsCollected: coinsRef.current });
        setSavedGameExists(true);
    };

    const loadGame = async () => {
        const loaded = await loadGameFromStorage();
        if (!loaded) return;
        setLevelIndex(loaded.levelIndex);
        scoreRef.current = loaded.score;
        coinsRef.current = new Set(loaded.coinsCollected);
        syncState();
        resetPlayer(LEVELS[loaded.levelIndex]);
        setGameState('playing');
    };

    const startGame = () => {
        setLevelIndex(0);
        scoreRef.current = 0;
        coinsRef.current = new Set();
        syncState();
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
        return attachKeyboardControls({ keysRef, onEscape: togglePause });
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'playing') return;
        return runGameLoop({
            canvasRef,
            keysRef,
            frameCountRef,
            playerRef,
            particlesRef,
            levelIndex,
            levels: LEVELS,
            coinsCollected: coinsRef.current,
            onCoinCollect: (ids) => {
                ids.forEach(id => coinsRef.current.add(id));
                scoreRef.current += ids.length * 10;
                syncState();
            },
            setGameState,
        });
    }, [gameState, levelIndex]);


    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white">
            <div className="max-w-4xl w-full">
                {/* Header / HUD */}
                {gameState !== 'start' && (
                    <Hud
                        score={score}
                        levelIndex={levelIndex}
                        levelsCount={LEVELS.length}
                        coinsCount={coinsCollected.size}
                        onTogglePause={togglePause}
                        onSaveGame={saveGame}
                    />
                )}

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
                            <StartOverlay hasSave={savedGameExists} onStartGame={startGame} onLoadGame={loadGame} />
                        )}

                        {gameState === 'paused' && (
                            <PauseOverlay
                                onTogglePause={togglePause}
                                onSaveGame={saveGame}
                                onQuitToMenu={() => setGameState('start')}
                            />
                        )}

                        {gameState === 'level-complete' && (
                            <LevelCompleteOverlay onNextLevel={nextLevel} />
                        )}

                        {gameState === 'game-over' && (
                            <GameOverOverlay onTryAgain={startGame} />
                        )}

                        {gameState === 'win' && (
                            <WinOverlay score={score} onNewGame={startGame} />
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