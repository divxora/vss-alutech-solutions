import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // In dev server (command === 'serve'), always serve at root '/' so localhost:3000 returns 200 OK
  // In production build (command === 'build'), use VITE_BASE_PATH or default to '/vss-alutech-solutions/' for GitHub Pages
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || '/vss-alutech-solutions/'),
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
}));
