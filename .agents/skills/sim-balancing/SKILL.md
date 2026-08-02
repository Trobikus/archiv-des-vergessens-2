---
name: sim-balancing
description: Touches @adv/sim combat/idle math, CONFIG, sanitize, or golden balancing snapshot. Use only when fixing sim bugs or when the user explicitly approves balancing changes.
paths:
  - "packages/sim/**"
---

# Skill: Sim / balancing

## Danger level: high (alpha)

Balancing is **v1 word-parity** gated by golden snapshot. Casual tweaks break CI and player trust.

## Read first

- `packages/sim/src/config.ts`
- Relevant: `math.ts`, `click.ts`, `combat.ts`, `sanitize.ts`
- `packages/sim/src/balancing-snapshot.ts`
- `packages/sim/src/snapshots/balancing.golden.json`
- Gate: `tools/gates/balancing-snapshot.mjs`

## Rules

1. **Default:** fix call-site bugs in client/services; leave CONFIG numbers alone.
2. Change CONFIG/math **only** with explicit user Freigabe.
3. After an approved number/formula change:
   - Update implementation
   - Update/regenerate golden snapshot via the project’s existing snapshot test/workflow
   - Ensure `node tools/gates/balancing-snapshot.mjs` passes
4. Keep `@adv/sim` pure — no I/O, no `@adv/*` imports, no DOM.
5. Client/UI must call sim functions; do not duplicate formulas in TSX.

## Verify

```bash
node tools/gates/balancing-snapshot.mjs
npx vitest run packages/sim
npm run typecheck
```
