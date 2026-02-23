import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lodash': 'lodash-es',
    },
  },
  server: {
    port: 5173, // Cambiado para evitar conflicto con el backend (5174)
    proxy: {
      '/api': {
        target: 'http://localhost:5174', // Coincidimos con el puerto del perfil 'http' del backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})