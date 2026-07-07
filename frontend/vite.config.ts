import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Bulletproof functional approach for TypeScript
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Bundle all Material UI components into 'mui.js'
            if (id.includes('@mui')) {
              return 'mui';
            }
            // Bundle React core libraries into 'vendor.js'
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 600, 
  }
})