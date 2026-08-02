#!/usr/bin/env node
/**
 * beforeShellExecution — block destructive / gate-bypass shell patterns.
 */
import { readJsonStdin, writeJson } from "./lib/risk.mjs";

const payload = await readJsonStdin();
const command = String(payload.command || "");

function deny(user_message, agent_message) {
  writeJson({
    permission: "deny",
    user_message,
    agent_message: agent_message || user_message,
  });
  process.exit(0);
}

function ask(user_message) {
  writeJson({
    permission: "ask",
    user_message,
    agent_message: user_message,
  });
  process.exit(0);
}

// Force-push / history rewrite
if (/\bgit\s+push\b/.test(command) && /(\s--force\b|\s-f\b)/.test(command)) {
  deny(
    "Blocked: git push --force is forbidden in this repo policy.",
    "Do not force-push. Fix commits with a new commit on main.",
  );
}

if (/\bgit\s+reset\s+--hard\b/.test(command)) {
  deny(
    "Blocked: git reset --hard is forbidden for agents without explicit user override.",
    "Avoid destructive resets. Prefer targeted reverts of specific files.",
  );
}

if (/\bgit\s+clean\s+-[a-zA-Z]*f/.test(command)) {
  deny(
    "Blocked: git clean -f is too destructive for unattended agent use.",
  );
}

// Silencing quality gates
if (
  /\bSKIP_(CLIPPY|E2E|GATE|TESTS?)\s*=/.test(command) ||
  /\bGATE_SKIP\b/.test(command)
) {
  deny(
    "Blocked: skipping quality gates via env flags is not allowed.",
    "Run the real gate. Fix failures properly.",
  );
}

// Editing / deleting golden snapshot via shell
if (
  /balancing\.golden\.json/.test(command) &&
  /\b(rm|mv|cp|truncate|sed|perl|python|node)\b/.test(command)
) {
  ask(
    "Shell touches balancing.golden.json — confirm this is an intentional golden update, not a gate bypass.",
  );
}

// Dropping databases / mass deletes
if (/\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-rf|-fr)\b/.test(command) && /apps\/|packages\/|site\//.test(command)) {
  ask(
    "Recursive delete under apps/packages/site — confirm before proceeding.",
  );
}

writeJson({ permission: "allow" });
process.exit(0);
