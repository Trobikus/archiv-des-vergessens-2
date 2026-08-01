import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact()],
  // Relative base so Tauri (and static hosts) can load assets from frontendDist.
  base: "./",
  server: {
    port: 5173,
    strictPort: true,
  },
  clearScreen: false,
});
