import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // When deploying to GitHub Pages at https://divxora.github.io/vss-alutech-solutions/
  // the base path must be '/vss-alutech-solutions/'.
  // Can be overridden via VITE_BASE_PATH (e.g., '/' for custom domains)
  base: process.env.VITE_BASE_PATH || '/vss-alutech-solutions/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
