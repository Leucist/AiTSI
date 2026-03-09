import React from 'react';
import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export function GameOverOverlay(props: { onTryAgain: () => void }) {
    return (
        <motion.div
            data-testid="overlay-game-over"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8"
        >
            <h2 className="text-6xl font-black mb-4 tracking-tighter">GAME OVER</h2>
            <p className="mb-10 font-bold text-lg opacity-70">Every hero falls, but the brave rise again.</p>
            <button
                data-testid="btn-try-again"
                onClick={props.onTryAgain}
                className="flex items-center gap-3 bg-white text-red-600 font-black py-5 px-12 rounded-2xl hover:bg-neutral-100 transition-all shadow-2xl"
            >
                <RotateCcw className="w-6 h-6" />
                TRY AGAIN
            </button>
        </motion.div>
    );
}
