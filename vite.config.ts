import { defineConfig } from 'vite'
import crypto from 'node:crypto'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const { createHash, webcrypto } = crypto

if (!('hash' in crypto)) {
	// @ts-expect-error - polyfill for Node versions without crypto.hash
	crypto.hash = (algorithm: string, data: ArrayBuffer | Uint8Array) => {
		const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data)
		return createHash(algorithm).update(buffer).digest('hex')
	}
}

const globalCrypto = globalThis.crypto ?? webcrypto

if (!('hash' in globalCrypto)) {
	// @ts-expect-error - polyfill for global crypto.hash
	globalCrypto.hash = crypto.hash
}

if (!globalThis.crypto) {
	// @ts-expect-error - assign global crypto for Vite hashing
	globalThis.crypto = globalCrypto
}

const isTest = process.env.VITEST === 'true'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    watch: {
      usePolling: true,
      interval: 200,
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
  plugins: [
    ...(isTest
      ? []
      : [
          devtools({
            eventBusConfig: {
              enabled: false,
            },
          }),
          nitro(),
          tanstackStart(),
        ]),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    viteReact(),
  ],
})

export default config
