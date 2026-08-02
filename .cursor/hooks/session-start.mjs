#!/usr/bin/env node
/**
 * sessionStart — inject strict safe-mode context (IDE sessions).
 * Note: may not run for cloud agents at true start; rules/AGENTS.md still apply.
 */
import { readJsonStdin, writeJson } from "./lib/risk.mjs";

await readJsonStdin();

writeJson({
  additional_context:
    "ADV SAFE MODE is active. Obey .cursor/rules/scope-lock.mdc and package-boundaries.mdc. " +
    "High-risk: packages/sim, packages/protocol, apps/server, saves/migrations, balancing.golden.json, Tauri beyond shell. " +
    "Prefer skills safe-ui-patch / hard-stop-architecture / pre-done-gate. " +
    "Smallest diff. Ask when unsure. Full npm run gate for non-trivial work. Branch policy: main only.",
});
process.exit(0);
