#!/usr/bin/env node
/**
 * postToolUse — inject additional_context when high-risk paths are edited.
 * Complements afterFileEdit (which records markers for the stop hook).
 */
import {
  isHighRiskPath,
  normalizePath,
  readJsonStdin,
  writeJson,
} from "./lib/risk.mjs";

const payload = await readJsonStdin();
const toolInput = payload.tool_input ?? {};
const candidates = [
  toolInput.path,
  toolInput.file_path,
  toolInput.filePath,
  toolInput.target_notebook,
]
  .filter(Boolean)
  .map(String);

const filePath = normalizePath(candidates[0] || "");
if (!filePath || !isHighRiskPath(filePath)) {
  writeJson({});
  process.exit(0);
}

const hints = [];
if (/packages\/sim|balancing\.golden\.json/.test(filePath)) {
  hints.push(
    "SIM/BALANCING: Freigabe required for CONFIG/math. Never edit golden only to silence the gate. Use sim-balancing / hard-stop-architecture.",
  );
}
if (/packages\/protocol|save|migrate|codec/i.test(filePath)) {
  hints.push(
    "PROTOCOL/SAVE: hand-rolled validators only (no zod). schemaVersion bumps need migrate.ts. Use save-envelope / protocol-ws.",
  );
}
if (/apps\/server|pbkdf|password/i.test(filePath)) {
  hints.push(
    "SERVER/AUTH: PBKDF2 frozen (100_000/64/sha512). Server imports core+protocol only. Clan is not a server module.",
  );
}
if (/src-tauri/.test(filePath)) {
  hints.push("TAURI: shell only — no game loop, no rusqlite game saves.");
}
if (hints.length === 0) {
  hints.push(
    `HIGH-RISK EDIT: ${filePath}. Confirm explicit user intent; full npm run gate before done.`,
  );
}

writeJson({ additional_context: hints.join("\n") });
process.exit(0);
