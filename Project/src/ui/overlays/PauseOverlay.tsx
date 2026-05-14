import React from 'react';
import { Pause } from 'lucide-react';
import { motion } from 'motion/react';

export function PauseOverlay(props: {
    onTogglePause: () => void;
    onSaveGame: () => void;
    onQuitToMenu: () => void;
}) {
    return (
        <motion.div
            data-testid="overlay-paused"
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
                        data-testid="btn-resume"
                        onClick={props.onTogglePause}
                        className="w-full bg-emerald-500 text-black font-black py-4 px-12 rounded-2xl hover:bg-emerald-400 transition-all"
                    >
                        RESUME
                    </button>
                    <button
                        data-testid="btn-save-progress"
                        onClick={props.onSaveGame}
                        className="w-full bg-neutral-800 text-white font-bold py-4 px-12 rounded-2xl hover:bg-neutral-700 transition-all border border-white/5"
                    >
                        SAVE PROGRESS
                    </button>
                    <button
                        data-testid="btn-quit-to-menu"
                        onClick={props.onQuitToMenu}
                        className="w-full text-neutral-500 font-bold py-4 px-12 rounded-2xl hover:text-white transition-all"
                    >
                        QUIT TO MENU
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
