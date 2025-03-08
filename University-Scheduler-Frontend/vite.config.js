import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['d6f0-2402-4000-2300-5698-e0d4-f725-9701-5e02.ngrok-free.app']
  }
})
