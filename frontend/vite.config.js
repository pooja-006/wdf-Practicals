import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'   // bind to all interfaces when running locally
  },
  preview: {
    port: 5173,
    host: '0.0.0.0'   // required inside Docker container so host can reach it
  }
})
