import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/*_NH.test.ts', 'tests/*_VM.test.ts', 'tests/physics.spec.ts', 'tests/data.spec.ts', 'tests/game-logic.spec.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
