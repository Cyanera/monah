import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// One-off build for the single-file preview: fonts are inlined as data URIs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { "import.meta.env.VITE_MEMORY_ROUTER": '"1"' },
  build: { outDir: "dist-artifact", assetsInlineLimit: 100_000_000, cssCodeSplit: false },
});
