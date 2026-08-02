---
trigger: always_on
description: Alpha-release safety for Archiv des Vergessens — prevent inventing APIs, wrong architecture, or breaking changes
---

# Alpha safety (0.3.0-alpha — short before official test alpha)

You work on **Archiv des Vergessens v2** (`archiv-des-vergessens-2`) with **Gemini in Antigravity**. The product is near first official test-alpha. Wrong guesses are unacceptable.

## Non-negotiables

1. **Never invent.** If a type, event, service, CSS class, i18n key, DB column, or package import is not already in the repo, do not create a parallel system. Extend the existing one.
2. **Read before write.** Open the real files in the touch area first. Prefer surgical diffs over rewrites.
3. **Preserve structure.** Keep monorepo layout, package names (`@adv/*`), service factories (`create*Service`), validators, hub categories, and CSS patterns identical in spirit and naming.
4. **Stop on ambiguity.** If requirements conflict with code/ADRs, or the change touches save/auth/balancing/protocol without a clear existing pattern — **ask**, do not guess.
5. **Gate before done.** Meaningful code changes are unfinished until relevant checks pass (`npm run typecheck`, `lint`, targeted tests; full `npm run gate` for release-risk areas). Tiny UI/copy may use `npm run gate:lite` — never for sim/protocol/server/saves.
6. **No drive-by refactors.** No renames, dependency swaps, formatting-only churn, or “while I’m here” cleanups outside the task.
7. **German product, bilingual UI.** Player-facing copy: DE + EN keys in lockstep. Agent may answer in German when the user writes German.
8. **Never silence gates.** Do not edit `balancing.golden.json` (or skip tests via env) to make red green. Fix the cause or stop.
9. **No destructive git.** No `push --force`, no `reset --hard`, no mass `git clean -f` unless the human explicitly orders it.
10. **Weak-model hard stop.** Without a Pro-class / Gemini-3.1-Pro session: do **not** implement protocol, save/codec/migration, auth, WS authority, or sim math — plan only, then wait or ask.

## Load skills when relevant

Use `.agents/skills/*/SKILL.md` for the matching domain (safe-change, client-feature, protocol-ws, save-envelope, sim-balancing, i18n-content, server-module, ui-hub, gate-verify, alpha-bugfix).
