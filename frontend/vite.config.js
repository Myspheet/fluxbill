import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, proxy /api -> the Laravel backend so the SPA can use relative URLs
// (CORS is also configured server-side for cross-origin production use).
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
