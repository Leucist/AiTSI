import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        plugins: [react(), tailwindcss()],
        define: {
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
        server: {
            hmr: process.env.DISABLE_HMR !== 'true',
            headers: {
                'X-Frame-Options': 'SAMEORIGIN',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://localhost:3000 http://localhost:3001 https://generativelanguage.googleapis.com;",
            },
        },
    };
});
