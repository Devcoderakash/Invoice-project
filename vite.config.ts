import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'react-vendor': ['react', 'react-dom'],
          'lucide-icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
