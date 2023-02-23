import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import ViteYaml from "@modyfi/vite-plugin-yaml";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), ViteYaml()],
    optimizeDeps: {
        include: ["pixi.js"],
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "assets/chunk-[hash].js",
                chunkFileNames: "assets/chunk-[hash].js",
                assetFileNames: "assets/[ext]-[hash].[ext]",
            },
        },
    },
});
