---
name: alpha-bugfix
description: Fixes player-facing bugs before official test alpha. Use when the user reports a bug, regression, broken UI, save/auth/sync failure, combat/idle wrong numbers, or release-blocking defect.
---

# Skill: Alpha bugfix

## Goal

Fix the defect with minimal blast radius. Do not “clean up” surrounding systems.

## Triage

1. Reproduce from description (or write a failing test that encodes the bug).
2. Classify surface:
   - **UI/Hub** → `apps/client/src/ui/**`, styles
   - **Game logic** → `apps/client/src/services/**`, `@adv/sim`
   - **Save/sync** → `@adv/protocol` save types + client save/cloud services + server save module
   - **Auth/social** → protocol payloads + server modules + client auth/friend/guild/chat services
   - **Desktop/Launcher** → Tauri shell only; never move game logic into Rust
3. Find the **smallest** owning function/component. Prefer fixing there.

## Fix rules

- Prefer a regression test next to existing `*.test.ts` patterns
- Do not change unrelated copy, layout, or balancing
- If the bug is wrong understanding of Clan vs Guild — fix toward README/protocol truth (Clan local, Guild live)
- If numbers look “off”, verify against `@adv/sim` + golden snapshot before “correcting” formulas

## Verify

```bash
npx vitest run <path-to-relevant-test>
npm run typecheck
npm run lint
# if release-risk:
npm run gate
```

## Done criteria

- Bug covered or manually reasoned with clear root cause
- No new warnings (`eslint --max-warnings=0`)
- No accidental API / save-shape changes
