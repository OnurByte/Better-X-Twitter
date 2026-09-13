import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), { name: "copy-extension-manifest", closeBundle() { copyFileSync("manifest.json", "dist/manifest.json"); } }],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: "src/content-script.ts",
        worker: "src/background/service-worker.ts",
        options: "options.html",
        popup: "popup.html"
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
