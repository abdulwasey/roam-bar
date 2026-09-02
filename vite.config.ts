import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tauri expects a fixed port and ignores the dev server's own host handling.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1421,
    strictPort: true,
  },
  build: {
    target: 'safari14',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
