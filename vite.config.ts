import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { vercelApiPlugin } from './vite-api-plugin';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      vercelApiPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom', 'react-router-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['responsibilities-rod-released-rid.trycloudflare.com'],

      // Source modules change frequently during local development.  Never let a
      // browser profile reuse an old module here: stale Vite modules can leave
      // React unable to mount and show only the page background.
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify -- file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
