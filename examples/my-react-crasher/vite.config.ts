/// <reference types="./vite-env" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({mode}) => {
  return {
    base: mode === "pages" ? "/my-react-crasher/" : "/",
    plugins: [react()],
    envPrefix: 'BUGSPLAT_',
    build: {
      sourcemap: true,
    },
    test: { 
      environment: 'jsdom',
      include: ['./src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
});
  