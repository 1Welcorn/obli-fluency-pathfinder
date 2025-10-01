import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Vercel configuration
      base: '/',
      // Optimize build performance for Vercel
      build: {
        target: 'es2020',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: undefined
          }
        },
        chunkSizeWarningLimit: 1000
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'import.meta.env.VITE_USE_SSH_GEMINI': JSON.stringify(env.VITE_USE_SSH_GEMINI),
        'import.meta.env.VITE_SSH_GEMINI_HOST': JSON.stringify(env.VITE_SSH_GEMINI_HOST),
        'import.meta.env.VITE_SSH_GEMINI_PORT': JSON.stringify(env.VITE_SSH_GEMINI_PORT),
        'import.meta.env.VITE_SSH_GEMINI_USERNAME': JSON.stringify(env.VITE_SSH_GEMINI_USERNAME),
        'import.meta.env.VITE_SSH_GEMINI_PRIVATE_KEY': JSON.stringify(env.VITE_SSH_GEMINI_PRIVATE_KEY),
        'import.meta.env.VITE_SSH_GEMINI_PASSWORD': JSON.stringify(env.VITE_SSH_GEMINI_PASSWORD),
        'import.meta.env.VITE_SSH_GEMINI_API_ENDPOINT': JSON.stringify(env.VITE_SSH_GEMINI_API_ENDPOINT),
        'import.meta.env.VITE_SSH_GEMINI_TIMEOUT': JSON.stringify(env.VITE_SSH_GEMINI_TIMEOUT),
        'import.meta.env.VITE_SSH_GEMINI_TOKEN': JSON.stringify(env.VITE_SSH_GEMINI_TOKEN)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
