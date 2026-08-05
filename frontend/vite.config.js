import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        suppressWarnings: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      includeAssets: ['app-logo.png'],
      manifest: {
        name: 'Tower Wagon Driver Management System',
        short_name: 'Tower Wagon Driver system',
        description: 'Railways MERN Web App',
        theme_color: '#2375f1',
        background_color: '#424242',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/app-logo.png',
            sizes: '1024x1024',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
