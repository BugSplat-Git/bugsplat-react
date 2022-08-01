/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: 'BUGSPLAT_',
  test: {
    environment: 'jsdom',
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
  },
});
