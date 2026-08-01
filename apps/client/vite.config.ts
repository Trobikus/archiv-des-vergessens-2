import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const rootPackage = JSON.parse(
  readFileSync(join(rootDir, "package.json"), "utf8"),
) as { readonly version?: string };
const appVersion =
  typeof rootPackage.version === "string" && rootPackage.version.length > 0
    ? rootPackage.version
    : "0.0.0-dev";

export default defineConfig({
  plugins: [preact()],
  // Relative base so Tauri (and static hosts) can load assets from frontendDist.
  base: "./",
  define: {
    // Single source of truth: workspace root package.json version.
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  clearScreen: false,
});
