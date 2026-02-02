import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    build: {
      // Enable minification with Terser
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console statements in production
          drop_console: true,
          drop_debugger: true,
        },
      },
      // Code splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'socket-vendor': ['socket.io-client'],
            'media-vendor': ['mediasoup-client'],
            'utils': ['axios', 'lucide-react']
          }
        }
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 600
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
