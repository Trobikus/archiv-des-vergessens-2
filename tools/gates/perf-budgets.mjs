/**
 * Ensures PERFORMANCE_BUDGETS stay wired and match Phase-8 long-session rules.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  [
    "vitest",
    "run",
    "packages/core/src/performance-budget.test.ts",
    "packages/core/src/object-pool.test.ts",
  ],
  { stdio: "inherit", shell: true },
);

if (result.status !== 0) {
  console.error("perf-budgets: failed");
  process.exit(result.status ?? 1);
}

console.log("perf-budgets: OK");
