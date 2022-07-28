import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import typescript2 from 'rollup-plugin-typescript2';

export default defineConfig({
  plugins: [
    {
      ...typescript2({
        tsconfigOverride: { exclude: ['spec', 'vite.config.ts'] },
      }),
      apply: 'build',
      enforce: 'pre',
    },
    react(),
  ],
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
