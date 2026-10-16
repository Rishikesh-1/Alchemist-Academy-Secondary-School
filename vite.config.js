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
        target: 'http://localhost/Alchemist%20Academy',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost/Alchemist%20Academy',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
