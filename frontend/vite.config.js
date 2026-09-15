import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que se abra en la red local y el celular
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // El backend local
        changeOrigin: true,
      },
    },
  },
})