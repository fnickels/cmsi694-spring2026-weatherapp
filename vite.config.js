import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: 'localhost'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    css: true,
    include: ['tests/unit/**/*.test.{js,jsx,ts,tsx}', 'tests/integration/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['tests/e2e/**', '**/node_modules/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
