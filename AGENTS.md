# AGENTS.md — Archiv des Vergessens / Grimoire Interactive

Portable agent contract for **Cursor**, **Antigravity**, and any other coding agent.

You are in **SAFE MODE**. Be strict. Prefer stopping over inventing scope.

## Branching

- Work only on `main` unless the human explicitly orders another branch.
- No drive-by feature branches, no `cursor/*` branches unless asked.

## Always-on policies

Read and obey (Cursor loads these automatically; other tools must treat them as law):

- `.cursor/rules/scope-lock.mdc`
- `.cursor/rules/package-boundaries.mdc`
- `.cursor/rules/main-only.mdc`
- `.cursor/rules/studio-logo.mdc`

## Skills (use deliberately)

| Skill | When |
|---|---|
| `.cursor/skills/safe-ui-patch/SKILL.md` | Tooltips, copy, CSS, locale strings |
| `.cursor/skills/hard-stop-architecture/SKILL.md` | Protocol, saves, auth, WS, sim, migrations, cross-package refactors |
| `.cursor/skills/pre-done-gate/SKILL.md` | Before claiming done / commit / push |

## High-risk paths (do not touch without explicit ask)

- `packages/sim/**` and `balancing.golden.json` (never edit golden to silence gates)
- `packages/protocol/**`
- `apps/server/**`
- Save / codec / migration paths and `tools/migrate-*`
- Tauri Rust beyond shell (`quit_app`, window, lockdown)
- Auth parameters / `schemaVersion` without a migration task

## Quality gates

| Change class | Required |
|---|---|
| Tiny UI/copy | `node tools/gates/agent-lite.mjs` (or typecheck + i18n-keys + balancing-snapshot) |
| Anything else / unsure | full `npm run gate` |
| Architecture / sim / server / saves | full `npm run gate` — no exceptions |

Also: `npm run lint`, tests inside `gate`, Playwright/clippy when available.

## Architecture facts (do not violate)

- TypeScript strict, Preact client, npm workspaces
- `@adv/protocol` mini-validators — **no zod**
- One persistence strategy: client IndexedDB/offline queue; server SQLite = account authority; **no** Tauri rusqlite game DB
- Balancing numbers stay v1-identical (golden snapshot)
- Studio logos: `site/assets/studio-mark.png` / `site/assets/studio-icon.png` only

## Hooks (Cursor)

Project hooks live in `.cursor/hooks.json`:

- Warn/record high-risk file edits
- Block force-push, hard reset, gate-skip env hacks
- On stop after high-risk edits: force a gate + scope audit follow-up

If you are not Cursor: simulate the same discipline manually.

## Antigravity / Gemini note

Even with a strong model: keep SAFE MODE. Skills + this file + rules still apply. Strong models fail by over-scoping; weak models fail by guessing — both are caught by scope lock + gates.
