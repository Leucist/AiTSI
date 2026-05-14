import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export function LevelCompleteOverlay(props: { onNextLevel: () => void }) {
    return (
        <motion.div
            data-testid="overlay-level-complete"
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
                data-testid="btn-next-stage"
                onClick={props.onNextLevel}
                className="group flex items-center gap-3 bg-black text-white font-black py-5 px-12 rounded-2xl hover:bg-neutral-900 transition-all shadow-2xl"
            >
                NEXT STAGE
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );
}
