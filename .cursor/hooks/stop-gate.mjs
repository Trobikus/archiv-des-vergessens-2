#!/usr/bin/env node
/**
 * stop — if high-risk paths were edited this conversation, force one follow-up
 * that requires full gate + scope confirmation before the agent can rest.
 */
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import {
  RISK_LATEST_FILE,
  readJsonStdin,
  riskSessionFile,
  writeJson,
} from "./lib/risk.mjs";

const payload = await readJsonStdin();
const status = payload.status || "completed";
const loopCount = Number(payload.loop_count || 0);
const conversationId =
  payload.conversation_id || payload.session_id || payload.generation_id || "";

if (status !== "completed" || loopCount > 0) {
  writeJson({});
  process.exit(0);
}

function loadState(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const candidates = [];
if (conversationId) candidates.push(riskSessionFile(conversationId));
candidates.push(RISK_LATEST_FILE);

let state = null;
let sessionPath = null;
for (const path of candidates) {
  const loaded = loadState(path);
  if (loaded && Array.isArray(loaded.files) && loaded.files.length > 0) {
    state = loaded;
    sessionPath = path;
    break;
  }
}

if (!state || !sessionPath) {
  writeJson({});
  process.exit(0);
}

const files = state.files;

// Consume markers so we only loop once.
for (const path of new Set([sessionPath, RISK_LATEST_FILE, conversationId ? riskSessionFile(conversationId) : null].filter(Boolean))) {
  try {
    unlinkSync(path);
  } catch {
    /* ignore */
  }
}

const list = files.map((f) => `- ${f}`).join("\n");
writeJson({
  followup_message:
    `SAFE-MODE STOP HOOK: high-risk paths were edited in this session:\n${list}\n\n` +
    `Before finishing you MUST:\n` +
    `1) Confirm each path was explicitly requested by the user (quote the request).\n` +
    `2) Run full \`npm run gate\` (not the lite gate).\n` +
    `3) If any edit was drive-by or speculative, revert it immediately.\n` +
    `4) Never "fix" balancing/golden failures by rewriting the golden file unless that was the task.\n` +
    `Reply with gate results and a scope audit.`,
});
process.exit(0);
