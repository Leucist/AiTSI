import React from 'react';

export function attachKeyboardControls(params: {
    keysRef: React.MutableRefObject<Record<string, boolean>>;
    onEscape: () => void;
}): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
        params.keysRef.current[e.code] = true;
        if (e.code === 'Escape') params.onEscape();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        params.keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
}
