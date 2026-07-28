import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Enable PWA in dev mode for testing
      },
      manifest: {
        name: 'Preyson Moto Admin POS',
        short_name: 'PreysonPOS',
        description: 'Preyson Moto Offline POS System',
        theme_color: '#F97316',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'https://via.placeholder.com/192/F97316/FFFFFF?text=POS',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://via.placeholder.com/512/F97316/FFFFFF?text=POS',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.preysonmoto\.com\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  css: {
    devSourcemap: false,
  },
  build: {
    cssMinify: false,
  },
})
