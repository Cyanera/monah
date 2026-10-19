import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base "./" keeps the build portable: it can be served from a domain root
// or from a sub-path (GitHub Pages, Netlify, any static host).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
