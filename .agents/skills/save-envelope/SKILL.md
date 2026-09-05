---
name: save-envelope
description: Safely changes save envelope, Phase2 payload fields, migrations, or IndexedDB. Use for save format, autosave, or offline progress issues.
paths:
  - "packages/protocol/**"
  - "apps/client/src/services/**"
  - "apps/client/src/state/**"
  - "docs/save-format.md"
---

# Skill: Save envelope

## Read first

- `docs/save-format.md`
- `docs/adr/0002-persistence.md`
- `packages/protocol/src/save-envelope.ts`
- `packages/protocol/src/save-payload.ts`
- `packages/protocol/src/migrate.ts`
- `packages/protocol/src/envelope.ts`
- Client: `save-store.ts`, `save-storage.ts`, `state/game-state.ts`

## Invariants

- `SAVE_SCHEMA_VERSION = 1` until an explicit migration step is added
- Envelope shape: `{ schemaVersion, savedAt, payload }`
- Single local save slot (`slot_local_1`) — no cloud, no accounts (ADR 0003)
- Chat/battle ephemeral — not in envelope
- Desktop must **not** grow a parallel save DB
- No v1 import path — v1 saves are irrelevant (no players predate the pivot)

## Adding a payload field

1. Extend types + `validatePhase2SavePayload` / defaults in `@adv/protocol`
2. Map in `game-state.ts` ↔ payload (both directions)
3. Keep defaults safe for older local envelopes (validator/default path)
4. If the change is breaking → bump schemaVersion **and** append `SAVE_MIGRATIONS` step (never bump alone)
5. Add/adjust tests in protocol + client save tests

## Verify

```bash
npx vitest run packages/protocol
npx vitest run apps/client/src/services/save-storage.test.ts
npm run typecheck
npm run gate   # recommended — save bugs brick alpha
```
