import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-dts';

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'bugsplat'],
      output: {
        sourcemapExcludeSources: true,
      },
    },
    sourcemap: true,
    target: 'esnext',
    minify: false,
  },
});
