import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const root = import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
      '@components': path.resolve(root, './src/components'),
      '@layouts': path.resolve(root, './src/layouts'),
      '@pages': path.resolve(root, './src/pages'),
      '@hooks': path.resolve(root, './src/hooks'),
      '@redux': path.resolve(root, './src/redux'),
      '@services': path.resolve(root, './src/services'),
      '@utils': path.resolve(root, './src/utils'),
      '@routes': path.resolve(root, './src/routes'),
      '@context': path.resolve(root, './src/context'),
      '@constants': path.resolve(root, './src/constants'),
      '@animations': path.resolve(root, './src/animations'),
      '@assets': path.resolve(root, './src/assets'),
      '@styles': path.resolve(root, './src/styles'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5183,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
