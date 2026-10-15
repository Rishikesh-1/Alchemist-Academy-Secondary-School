import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://alchemistacademy.edu.np',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://alchemistacademy.edu.np',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
