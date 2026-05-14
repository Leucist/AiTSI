import React from 'react';
import { Download, Play } from 'lucide-react';
import { motion } from 'motion/react';

export function StartOverlay(props: {
    hasSave: boolean;
    onStartGame: () => void;
    onLoadGame: () => void;
}) {
    return (
        <motion.div
            data-testid="overlay-start"
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
                    data-testid="btn-new-adventure"
                    onClick={props.onStartGame}
                    className="group flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
                >
                    <Play className="w-6 h-6 fill-current" />
                    NEW ADVENTURE
                </button>

                {props.hasSave && (
                    <button
                        data-testid="btn-continue-journey"
                        onClick={props.onLoadGame}
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
    );
}
