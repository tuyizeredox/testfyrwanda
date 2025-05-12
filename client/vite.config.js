import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use React plugin for .js files as well
      include: "**/*.{jsx,js,ts,tsx}",
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Enable history API fallback for SPA routing
    historyApiFallback: true,
  },
  build: {
    // Ensure assets are correctly referenced
    assetsDir: 'assets',
    // Output directory
    outDir: 'dist',
  },
});
