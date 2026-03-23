import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/')
          ) {
            return 'react-vendor';
          }

          if (id.includes('react-router-dom')) {
            return 'router-vendor';
          }

          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }

          if (id.includes('socket.io-client')) {
            return 'socket-vendor';
          }

          if (
            id.includes('react-icons') ||
            id.includes('lucide-react')
          ) {
            return 'icons-vendor';
          }

          if (
            id.includes('chart.js') ||
            id.includes('react-chartjs-2')
          ) {
            return 'charts-vendor';
          }

          if (
            id.includes('react-calendar') ||
            id.includes('date-fns')
          ) {
            return 'calendar-vendor';
          }

          if (
            id.includes('@dnd-kit/core') ||
            id.includes('@dnd-kit/sortable') ||
            id.includes('@dnd-kit/utilities')
          ) {
            return 'dnd-vendor';
          }
        },
      },
    },
  },
})
