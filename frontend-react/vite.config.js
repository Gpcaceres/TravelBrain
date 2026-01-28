import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['35.239.79.6.nip.io'],
    host: true,
    port: 5173,
  }
})
