#!/usr/bin/env node
/**
 * beforeShellExecution — block destructive / policy-breaking shell patterns.
 * failClosed is enabled in hooks.json — keep this script reliable.
 */
import { readJsonStdin, writeJson } from "./lib/risk.mjs";

const payload = await readJsonStdin();
const command = String(payload.command || "");
const normalized = command.replace(/\s+/g, " ").trim();

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

// Branch creation — main-only
if (
  /\bgit\s+checkout\s+-[bB]\b/.test(normalized) ||
  /\bgit\s+switch\s+-c\b/.test(normalized)
) {
  deny(
    "Blocked: branch creation is forbidden (main-only) unless the user explicitly asks.",
    "Stay on main. Do not create feature/fix/cursor/* branches without an explicit user order.",
  );
}

if (/\bgit\s+branch\b/.test(normalized)) {
  const createsNamedBranch =
    /\bgit\s+branch\s+(?!-|#)([^\s]+)/.test(normalized) &&
    !/\bgit\s+branch\s+(-d|-D|-m|-M|-a|-r|-v|-vv|--delete|--list|--show-current|--contains|--merged|--no-merged|--format|--points-at)\b/.test(
      normalized,
    );
  if (createsNamedBranch) {
    deny(
      "Blocked: creating git branches is disabled (main-only policy).",
      "Stay on main unless the user explicitly requests a branch.",
    );
  }
}

// Force-push / history rewrite
if (
  /\bgit\s+push\b/.test(normalized) &&
  /(--force|--force-with-lease|\s-f(\s|$))/.test(normalized)
) {
  deny(
    "Blocked: git force-push is forbidden in this repo policy.",
    "Do not force-push. Fix with a new commit on main.",
  );
}

if (/\bgit\s+reset\s+--hard\b/.test(normalized)) {
  deny(
    "Blocked: git reset --hard is forbidden for agents without explicit user override.",
    "Avoid destructive resets. Prefer targeted reverts of specific files.",
  );
}

if (/\bgit\s+clean\s+-[a-zA-Z]*f/.test(normalized)) {
  deny("Blocked: git clean -f is too destructive for unattended agent use.");
}

// Silencing quality gates
if (
  /\bSKIP_(CLIPPY|E2E|GATE|TESTS?)\s*=/.test(normalized) ||
  /\bGATE_SKIP\b/.test(normalized)
) {
  deny(
    "Blocked: skipping quality gates via env flags is not allowed.",
    "Run the real gate. Fix failures properly.",
  );
}

// Publishing packages accidentally
if (/\bnpm\s+publish\b/.test(normalized) || /\bpnpm\s+publish\b/.test(normalized)) {
  deny("Blocked: npm publish is not part of this private game monorepo workflow.");
}

// Editing / deleting golden snapshot via shell
if (
  /balancing\.golden\.json/.test(normalized) &&
  /\b(rm|mv|cp|truncate|sed|perl|python|node)\b/.test(normalized)
) {
  ask(
    "Shell touches balancing.golden.json — confirm this is an intentional golden update with Freigabe, not a gate bypass.",
  );
}

// Dropping databases
if (
  /\brm\s+.*\.(sqlite|db)\b/i.test(normalized) ||
  /\bunlink\b.*\.(sqlite|db)\b/i.test(normalized)
) {
  ask("Confirm: deleting SQLite/database files can wipe alpha account/save data.");
}

// Recursive deletes of core trees — deny (stricter than ask)
if (
  /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-rf|-fr)\b/.test(normalized) &&
  /(apps|packages|site|workers|functions|\.agents|\.cursor|docs)\b/.test(normalized)
) {
  deny(
    "Blocked: recursive delete targeting core project trees.",
    "Remove specific files instead of rm -rf on apps/packages/site/…",
  );
}

writeJson({ permission: "allow" });
process.exit(0);
