import React from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export function WinOverlay(props: { score: number; onNewGame: () => void }) {
    return (
        <motion.div
            data-testid="overlay-win"
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
            <p data-testid="final-score" className="mb-10 font-bold text-2xl">Final Score: {props.score}</p>
            <button
                data-testid="btn-new-game"
                onClick={props.onNewGame}
                className="flex items-center gap-3 bg-black text-white font-black py-5 px-12 rounded-2xl hover:bg-neutral-900 transition-all shadow-2xl"
            >
                <RotateCcw className="w-6 h-6" />
                NEW GAME
            </button>
        </motion.div>
    );
}
