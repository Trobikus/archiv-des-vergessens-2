---
name: hard-stop-architecture
description: >-
  Hard stop policy for protocol, saves, auth, WebSocket, sim/balancing,
  migrations, and cross-package refactors. Use when the task touches
  architecture, persistence, or math — or when a weaker model is active.
---

# Skill: hard-stop-architecture (STRICT)

## Default policy

**Do not implement** architecture / persistence / sim work under weak or Auto/Composer-tier models unless the user explicitly overrides with something like: "ignore hard-stop and implement anyway".

Instead:

1. Write a short plan: goal, files, risks, gate impact, rollback.
2. List exact commands to verify (`npm run gate`, targeted tests).
3. Wait for a stronger model (Cursor Pro-class or Antigravity Gemini 3.1 Pro) or an explicit override.

## Always forbidden shortcuts

- Editing `packages/sim/src/snapshots/balancing.golden.json` to make a red gate green
- Changing `schemaVersion`, PBKDF2 params, or save codec without an explicit migration task
- Adding zod (protocol uses mini-validators)
- Putting game persistence into Tauri/Rust
- "Temporary" duplication of authority (client inventing server truth)

## If explicitly cleared to implement

1. Re-read `docs/adr/0001-stack.md`, `docs/adr/0002-persistence.md`, and the relevant section of `docs/REWRITE_PLAN.md`.
2. Keep package boundaries intact.
3. Add/adjust tests next to the change.
4. Run **full** `npm run gate` — no lite gate for this class of work.
5. Commit only after gate is green; message must name the risk surface (protocol/save/auth/sim).
