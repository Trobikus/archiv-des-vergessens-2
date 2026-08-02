---
name: safe-ui-patch
description: >-
  Strict workflow for small Hub/UI patches (tooltips, copy, CSS, locale
  strings). Use when the task is localized UI/copy/CSS and must not touch
  sim, protocol, server, or saves.
---

# Skill: safe-ui-patch (STRICT)

Use only for **localized** UI/copy/CSS work. If the task smells like architecture, stop and switch to `hard-stop-architecture`.

## Allowed

- Component/text/CSS in `apps/client/**`
- Locale keys in `@adv/content` i18n (DE **and** EN together)
- Site markup/CSS under `site/**` when the task is studio-site UI (respect studio-logo rule)

## Forbidden during this skill

- `packages/sim/**`, `packages/protocol/**`, `apps/server/**`
- Save/codec/migration paths
- Balancing numbers, golden snapshots
- Broad Hub restyles, new design tokens, card/hero redesigns unless explicitly requested
- Renames or file moves "for cleanliness"

## Steps

1. Find the exact component, class, or i18n key. Cite it before editing.
2. Edit only that surface. Copy existing patterns (TipBubble, class names, key shape).
3. User-facing strings → update **DE and EN**. Do not leave orphan keys.
4. Run:
   - `npm run typecheck`
   - `node tools/gates/i18n-keys.mjs`
5. If more than 5 files changed for a "small" fix: revert extras and redo narrower.
6. Summarize: files touched, what was intentionally *not* touched.

## Abort conditions

- Need protocol/sim/server change to finish → stop, report blocker.
- Gate failure you "fix" by editing golden/snapshot → **forbidden**. Fix the real cause or stop.
