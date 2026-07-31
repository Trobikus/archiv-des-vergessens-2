/**
 * Balancing snapshot gate — fails if @adv/sim golden snapshot drifts.
 * Invoked from tools/gates/gate.mjs (and usable standalone).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const result = spawnSync(
  "npx",
  [
    "vitest",
    "run",
    "packages/sim/src/balancing-snapshot.test.ts",
    "--reporter=dot",
  ],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
  },
);

if (result.status !== 0) {
  console.error(
    "balancing-snapshot gate failed: golden snapshot drift or math regression",
  );
  process.exit(result.status ?? 1);
}

console.log("balancing-snapshot gate: OK");
