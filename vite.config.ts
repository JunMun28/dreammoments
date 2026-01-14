import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = defineConfig(({ mode }) => {
	const isTest = mode === "test";
	return {
		plugins: [
			devtools(),
			nitro({
				preset: "vercel",
			}),
			viteTsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			tailwindcss(),
			tanstackStart(),
			viteReact(),
		],
		resolve: {
			alias: {
				...(isTest && {
					react: path.resolve(__dirname, "./node_modules/react"),
					"react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
				}),
			},
			dedupe: ["react", "react-dom"],
		},
		test: {
			environment: "jsdom",
			include: ["src/**/*.test.{ts,tsx}"],
			server: {
				deps: {
					inline: ["html-encoding-sniffer", "@exodus/bytes"],
				},
			},
		},
	};
});

export default config;
