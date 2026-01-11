import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
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
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      exclude: [
        'src/routeTree.gen.ts',
        'src/routes/demo/**',
        'src/components/demo.FormComponents.tsx',
        'src/data/demo.punk-songs.ts',
        'src/hooks/demo.*',
        'src/integrations/**',
        'src/router.tsx',
        'src/routes/__root.tsx',
        '**/*.config.*',
        '**/*.gen.ts',
        'src/router.tsx',
        'src/routes/__root.tsx',
        '**/*.config.*',
        '**/*.gen.ts',
        'public/**',
        '**/public/**',
        '**/assets/**',
        '**/dist/**',
        'hooks/**',
      ],
    },
  },
})
