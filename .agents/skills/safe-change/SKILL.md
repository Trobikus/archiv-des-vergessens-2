---
name: safe-change
description: Mandatory change workflow for Archiv des Vergessens near alpha. Use for any code edit, feature, refactor request, or bugfix to prevent invented APIs and structural drift. Prefer this skill before writing code.
---

# Skill: Safe change (alpha)

## Goal

Ship the smallest correct diff that matches **existing** architecture. Zero speculative design.

## Procedure

1. **Restate the task** in one sentence (scope + out-of-scope).
2. **Locate truth** — open the nearest existing implementation:
   - Similar service / panel / handler / validator / test
   - ADR or doc if persistence/protocol/stack is involved
3. **Map touch list** — files you will change. If >8 files or crosses client+server+protocol without an existing pattern, pause and confirm with the user.
4. **Implement by imitation**
   - Copy naming, folder placement, export style, error handling from neighbors
   - Reuse helpers; do not invent parallel utilities
5. **Keep structure identical**
   - No new top-level packages/apps
   - No new state libraries or CSS frameworks
   - No renaming public WS events or save fields unless explicitly requested + migration plan
6. **Verify**
   - Run the narrowest useful check first (vitest file / typecheck)
   - For anything touching save, auth, sim, protocol, i18n, or hub chrome: run `npm run gate` (or the matching gate scripts)
7. **Report** what changed, what you verified, and any residual risk

## Forbidden during alpha

- Greenfield rewrites of working modules
- “Improving” architecture without being asked
- Adding dependencies unless unavoidable and approved
- Changing balancing numbers without explicit user Freigabe
- Editing `balancing.golden.json` to silence a failing gate
- Silent `schemaVersion` bumps
- Fake offline social (chat/friends/guild) behavior
- Force-push / hard-reset “cleanup”
- Implementing save/protocol/auth/sim under a weak model without explicit override

## When stuck

Stop. Quote the conflicting files/ADRs. Ask one precise question. Do not paper over uncertainty with new abstractions.
