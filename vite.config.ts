import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { alias } from 'drizzle-orm/gel-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = defineConfig({
  plugins: [
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})

export default config
