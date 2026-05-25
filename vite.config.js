import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({
      presets: [reactCompilerPreset(), ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]],
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workspace/api-client-react': path.resolve(__dirname, './src/lib/api-client-react/index.js'),
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'framer-motion',
      'wouter',
      '@tanstack/react-query',
      'lucide-react',
      'react-icons/fa',
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-switch',
      '@radix-ui/react-slider',
      '@radix-ui/react-separator',
      '@radix-ui/react-select',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-progress',
      '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar',
      '@radix-ui/react-label',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-aspect-ratio',
      'class-variance-authority',
      'cmdk',
      'input-otp',
      'react-resizable-panels',
      'sonner',
    ],
  },
})
