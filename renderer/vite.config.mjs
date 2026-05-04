import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist', // Keep it inside renderer/dist
  },
  plugins: [react()],
  server: {
    open: false, // Prevent auto-opening in browser
    port: 5174, // use a different port
    strictPort: true, // fail if port is already in use so we don't silently pick another
  },
});