import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: "src/content-script.ts",
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "content.js"
      }
    }
  }
});
