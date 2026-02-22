import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import babel from "vite-plugin-babel";

/**
 * @returns {import('vite').Plugin[]}
 */
const creaoPlugins = () => [
	babel({
		enforce: "pre",
		include: ["src/**/*"],
		exclude: ["src/components/ui/**/*"],
		filter: /\.[jt]sx?$/,
		babelConfig: {
			plugins: [
				[
					"@babel/plugin-syntax-typescript",
					{
						isTSX: true,
					},
				],
				[
					"@babel/plugin-transform-react-jsx-development",
					{
						runtime: "automatic",
						importSource: "react-jsx-source",
					},
				],
			],
		},
	}),
	{
		// add alias to config
		name: 'creao-plugin',
		enforce: 'post',
		config(config) {
			const rolldownOptions = config.optimizeDeps.esbuildOptions
			config.optimizeDeps.esbuildOptions = undefined
			return {
				optimizeDeps: {
					rolldownOptions
				},
				resolve: {
					alias: {
						"react-jsx-source/jsx-dev-runtime": resolve(
							process.cwd(),
							"./src/sdk/core/internal/react-jsx-dev.js",
						),
					},
				},
			}
		}
	}
];

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.TENANT_ID ? `/${process.env.TENANT_ID}/` : "./",
	define: {
		"import.meta.env.TENANT_ID": JSON.stringify(process.env.TENANT_ID || ""),
	},
	plugins: [
		...creaoPlugins(),
		TanStackRouterVite({
			autoCodeSplitting: false, // affects pick-n-edit feature. disabled for now.
		}),
		viteReact({
			jsxRuntime: "automatic",
		}),
		svgr(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "0.0.0.0",
		port: 3000,
		allowedHosts: true, // respond to *any* Host header
		watch: {
			usePolling: true,
			interval: 300, // ms; tune if CPU gets high
		},
	},
	build: {
		chunkSizeWarningLimit: 1500,
	},
});
