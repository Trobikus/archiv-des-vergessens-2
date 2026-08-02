#!/usr/bin/env node
/**
 * afterFileEdit — record high-risk path edits for the stop hook.
 * Informational only (cannot block); stderr warns the agent/runtime logs.
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  RISK_LATEST_FILE,
  isHighRiskPath,
  normalizePath,
  readJsonStdin,
  riskSessionFile,
  writeJson,
} from "./lib/risk.mjs";

const payload = await readJsonStdin();
const filePath = normalizePath(payload.file_path);
const conversationId =
  payload.conversation_id || payload.session_id || payload.generation_id || "unknown";

function recordRisk(targetPath) {
  let state = { files: [], updatedAt: 0 };
  try {
    state = JSON.parse(readFileSync(targetPath, "utf8"));
  } catch {
    /* new session file */
  }
  if (!state.files.includes(filePath)) {
    state.files.push(filePath);
  }
  state.updatedAt = Date.now();
  state.conversationId = conversationId;
  try {
    mkdirSync(dirname(targetPath), { recursive: true });
  } catch {
    /* /tmp exists */
  }
  writeFileSync(targetPath, `${JSON.stringify(state, null, 2)}\n`);
}

if (filePath && isHighRiskPath(filePath)) {
  recordRisk(riskSessionFile(conversationId));
  recordRisk(RISK_LATEST_FILE);
  appendFileSync(
    "/tmp/adv-agent-risk.log",
    `${new Date().toISOString()} HIGH_RISK_EDIT ${filePath} conv=${conversationId}\n`,
  );
  console.error(
    `[adv-hooks] HIGH-RISK PATH EDITED: ${filePath}\n` +
      `[adv-hooks] Confirm explicit user intent. Do not edit golden snapshots to silence gates.\n` +
      `[adv-hooks] Full npm run gate required before done.`,
  );
}

writeJson({});
process.exit(0);
