import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type {Plugin} from 'vite';
import {defineConfig, loadEnv} from 'vite';

function siteOriginForMeta(mode: string): Plugin {
  return {
    name: 'site-origin-html-meta',
    transformIndexHtml(html) {
      const env = loadEnv(mode, '.', '');
      const fromEnv = env.VITE_SITE_ORIGIN?.trim().replace(/\/$/, '');
      const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, '');
      const origin =
        fromEnv ||
        (vercel ? `https://${vercel.replace(/^https?:\/\//, '')}` : '') ||
        'https://field-o.vercel.app';
      return html.replaceAll('%SITE_ORIGIN%', origin);
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  return {
    plugins: [react(), tailwindcss(), siteOriginForMeta(mode)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
