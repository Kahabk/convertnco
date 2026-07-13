import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const staticAssets = ['imgeasset', 'logos', 'web_aset', 'new.jpg', 'wight_logo.png', 'favicon.png'];

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-static-root-assets',
        apply: 'build',
        closeBundle() {
          const outDir = path.resolve(__dirname, 'dist');

          for (const asset of staticAssets) {
            const from = path.resolve(__dirname, asset);
            const to = path.resolve(outDir, asset);

            if (!fs.existsSync(from)) continue;
            fs.cpSync(from, to, {recursive: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['responsibilities-rod-released-rid.trycloudflare.com'],

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
