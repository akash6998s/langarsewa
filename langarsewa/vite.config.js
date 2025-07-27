import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'splash.png',
      ],
      manifest: {
        name: 'Sudarshan Sena',
        short_name: 'Langar',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  // ✅ Add this server configuration to access on mobile
  server: {
    host: '0.0.0.0',  // Allows connections from any IP in the local network
    port: 5173,       // Or any port you prefer
  },
});
