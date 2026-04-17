import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type {Plugin} from 'vite';
import {defineConfig, loadEnv} from 'vite';

/**
 * Canonical / Open Graph base URL.
 * Do NOT use VERCEL_URL here: it points at the per-deployment hostname (often team-protected → 401 for bots),
 * so WhatsApp/Facebook cannot fetch og:image. Prefer VITE_SITE_ORIGIN or VERCEL_PROJECT_PRODUCTION_URL.
 */
function resolvePublicSiteOrigin(mode: string): string {
  const env = loadEnv(mode, '.', '');
  const explicit = env.VITE_SITE_ORIGIN?.trim().replace(/\/$/, '');
  if (explicit) return explicit;

  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (prodHost) return `https://${prodHost}`;

  return 'https://field-o.vercel.app';
}

function siteOriginForMeta(mode: string): Plugin {
  return {
    name: 'site-origin-html-meta',
    transformIndexHtml(html) {
      const origin = resolvePublicSiteOrigin(mode);
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
