import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = dirname(fileURLToPath(import.meta.url));
const rootPackage = JSON.parse(
  readFileSync(join(rootDir, "package.json"), "utf8"),
) as { readonly version?: string };
const appVersion =
  typeof rootPackage.version === "string" && rootPackage.version.length > 0
    ? rootPackage.version
    : "0.0.0-dev";

export default defineConfig({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
  },
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "packages/protocol/src/**/*.ts",
        "packages/core/src/**/*.ts",
        "packages/sim/src/**/*.ts",
        "packages/content/src/**/*.ts",
        "apps/client/src/services/**/*.ts",
        "apps/client/src/state/**/*.ts",
        "apps/server/src/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/index.ts"],
      thresholds: {
        "packages/sim/src/**": {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        "packages/core/src/**": {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        "packages/protocol/src/**": {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        "packages/content/src/**": {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
        "apps/client/src/services/**": {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
        "apps/client/src/state/**": {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
        "apps/server/src/**": {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
      },
    },
  },
});
