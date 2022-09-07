/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: "/my-react-crasher/",
  plugins: [react()],
  envPrefix: 'BUGSPLAT_',
  build: {
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
  },
});
