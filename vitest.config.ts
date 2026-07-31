import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "packages/protocol/src/**/*.ts",
        "packages/core/src/**/*.ts",
        "packages/sim/src/**/*.ts",
        "packages/content/src/**/*.ts",
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
      },
    },
  },
});
