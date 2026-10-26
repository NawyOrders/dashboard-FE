import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // NW-246: the map library is only needed on the pages that show the branch
        // picker, so it is kept in its own chunk.
        manualChunks: {
          leaflet: ['leaflet'],
        },
      },
    },
  },
});
