import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        chunkSplitPlugin({
            customSplitting: {
                pixi: ["pixi.js"],
            },
        }),
    ],
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
