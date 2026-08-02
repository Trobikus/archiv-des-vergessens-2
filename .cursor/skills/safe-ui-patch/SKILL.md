---
name: safe-ui-patch
description: >-
  Strict workflow for small Hub/UI patches (tooltips, copy, CSS, locale
  strings). Use when the task is localized UI/copy/CSS and must not touch
  sim, protocol, server, or saves.
paths:
  - "apps/client/**"
  - "packages/content/src/i18n/**"
  - "site/**"
---

# Skill: safe-ui-patch (STRICT)

Use only for **localized** UI/copy/CSS work. If the task smells like architecture, stop and switch to `hard-stop-architecture`.

## Allowed

- Component/text/CSS in `apps/client/**`
- Locale keys in `@adv/content` i18n (DE **and** EN together)
- Site markup/CSS under `site/**` when the task is studio-site UI (respect studio-logo rule)

## Forbidden during this skill

- `packages/sim/**`, `packages/protocol/**`, `apps/server/**`
- Save/codec/migration paths / `game-session` / `game-state` rewires
- Balancing numbers, golden snapshots
- Broad Hub restyles, new design tokens, card/hero redesigns unless explicitly requested
- Renames or file moves "for cleanliness"
- React / htm / new state libraries

## Steps

1. Find the exact component, class, or i18n key. Cite it before editing.
2. Edit only that surface. Copy existing patterns (`Tip` / TipBubble, class names, key shape).
3. User-facing strings → update **DE and EN**. Do not leave orphan keys.
4. Prefer `class="..."` Preact DOM attributes already used by peers.
5. Run:
   - `npm run typecheck`
   - `node tools/gates/i18n-keys.mjs`
   - optional: `npm run gate:lite`
6. If tip titles changed: `npx vitest run apps/client/src/ui/tip-i18n.test.ts`
7. If more than 5 files changed for a "small" fix: revert extras and redo narrower.
8. Finish with `pre-done-gate`. Summarize files touched and intentionally *not* touched.

## Abort conditions

- Need protocol/sim/server change to finish → stop, report blocker.
- Gate failure you "fix" by editing golden/snapshot → **forbidden**. Fix the real cause or stop.
