import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import path from "path"
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: "",
	publicDir: "public",
	base: "/",
	server: {
		open: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	// optimizeDeps: {
	// 	// 	// exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
	// 	esbuildOptions: {
	// 		supported: {
	// 			"top-level-await": true,
	// 		},
	// 	},
	// },
	build: {
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
			},
		},
		assetsDir: "assets",
		// target: ['esnext']
	},
	optimizeDeps: {
		exclude: [],
	},
	assetsInclude: ["**/*.wasm", "**/*.ktx2", "**/*.glb", "**/*.gltf", "**/*.png"],
})
