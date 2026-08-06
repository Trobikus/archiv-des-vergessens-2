---
name: safe-change
description: Mandatory change workflow for Archiv des Vergessens near alpha. Use for any code edit, feature, refactor request, or bugfix to prevent invented APIs and structural drift. Prefer this skill before writing code in Cursor or Antigravity.
---

# Skill: Safe change (alpha)

## Goal

Ship the smallest correct diff that matches **existing** architecture. Zero speculative design.

Also see: `AGENTS.md`, `.cursor/rules/scope-lock.mdc`, Cursor skills `safe-ui-patch` / `hard-stop-architecture`, and `references/` in this folder.

## Procedure

1. **Restate the task** in one sentence (scope + out-of-scope).
2. **Content Police** — if the task adds/deepens gameplay, hub, or content: load `content-police` and emit ALLOW / DENY / CORE-FIX-ONLY before coding. DENY → stop.
3. **Locate truth** — open the nearest existing implementation (see `references/read-first.md`).
4. **Map touch list** — files you will change. If >8 files or crosses client+server+protocol without an existing pattern, pause and confirm with the user.
5. **Implement by imitation** — copy naming/placement/error handling; obey package leaves + server≠sim/content.
6. **Keep structure identical** — no new packages/apps/state libs; stay on `main`.
7. **Verify** — targeted tests first; save/auth/sim/protocol/i18n/hub → full `npm run gate` (tiny UI may use `gate:lite`).
8. **Report** what changed, what you verified, and residual risk. Finish with Cursor `pre-done-gate` when in Cursor.

## Forbidden during alpha

See `references/do-not-invent.md`. Especially: zod, React/htm, Tauri save DB, server Clan, fake offline social, balancing without Freigabe, golden-only gate silence, silent schema bumps, side branches, force-push.

## When stuck

Stop. Quote the conflicting files/ADRs. Ask one precise question. Do not paper over uncertainty with new abstractions.
