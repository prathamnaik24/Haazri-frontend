import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      // Force Vite to use recharts CJS bundle to avoid ES6 subpath export issues
      'recharts': path.resolve('./node_modules/recharts/lib/index.js'),
    }
  }
})
