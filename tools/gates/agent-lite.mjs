#!/usr/bin/env node
/**
 * Lite gate for tiny UI/copy agent patches.
 * NOT a substitute for `npm run gate` on sim/protocol/server/save work.
 */
import { spawnSync } from "node:child_process";

const steps = [
  ["balancing-snapshot", "node tools/gates/balancing-snapshot.mjs"],
  ["i18n-keys", "node tools/gates/i18n-keys.mjs"],
  ["typecheck", "npm run typecheck"],
];

let failed = false;
for (const [name, command] of steps) {
  console.log(`\n==> agent-lite: ${name}`);
  const result = spawnSync(command, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`agent-lite failed at step: ${name}`);
    failed = true;
    break;
  }
}

if (failed) {
  process.exit(1);
}
console.log("\nagent-lite: OK (still run full `npm run gate` for non-trivial changes)");
process.exit(0);
