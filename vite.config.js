import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/login': 'http://localhost:5000',
      '/register': 'http://localhost:5000',
      '/usuarios': 'http://localhost:5000',
      '/encomendas': 'http://localhost:5000',
      '/acessos': 'http://localhost:5000',
      '/ocorrencias': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    }
  }
})
