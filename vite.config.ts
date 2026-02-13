import crypto from "node:crypto";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

const { createHash, webcrypto } = crypto;

if (!("hash" in crypto)) {
	// @ts-expect-error - polyfill for Node versions without crypto.hash
	crypto.hash = (algorithm: string, data: ArrayBuffer | Uint8Array) => {
		const buffer =
			data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data);
		return createHash(algorithm).update(buffer).digest("hex");
	};
}

const globalCrypto = globalThis.crypto ?? webcrypto;

if (!("hash" in globalCrypto)) {
	// @ts-expect-error - polyfill for global crypto.hash
	globalCrypto.hash = crypto.hash;
}

if (!globalThis.crypto) {
	globalThis.crypto = globalCrypto;
}

const isTest = process.env.VITEST === "true";

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	server: {
		host: true,
		port: 3000,
		watch: {
			usePolling: true,
			interval: 200,
		},
	},
	test: {
		environment: "node",
		globals: true,
		exclude: [...configDefaults.exclude, "tests/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			include: ["src/**"],
		},
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
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		viteReact(),
	],
});

export default config;
