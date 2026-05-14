import React from 'react';
import { Coins, Pause, Save, Trophy } from 'lucide-react';

export function Hud(props: {
    score: number;
    levelIndex: number;
    levelsCount: number;
    coinsCount: number;
    onTogglePause: () => void;
    onSaveGame: () => void;
}) {
    return (
        <div data-testid="hud" className="flex justify-between items-center mb-4 bg-neutral-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span data-testid="hud-score" className="font-mono text-2xl font-bold text-yellow-500">{props.score}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Current Level</span>
                    <span data-testid="hud-level" className="text-sm font-bold text-emerald-400">STAGE {props.levelIndex + 1} / {props.levelsCount}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div data-testid="hud-coins" className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-xl border border-white/5">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono text-sm font-bold">{props.coinsCount}</span>
                </div>
                <button
                    data-testid="btn-pause"
                    onClick={props.onTogglePause}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <Pause className="w-5 h-5" />
                </button>
                <button
                    data-testid="btn-save"
                    onClick={props.onSaveGame}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-emerald-400"
                    title="Save Game"
                >
                    <Save className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
