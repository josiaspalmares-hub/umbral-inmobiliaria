import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: { web: resolve(__dirname, 'index.html') },
    },
  },
})
