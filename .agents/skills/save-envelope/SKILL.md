---
name: save-envelope
description: Safely changes save envelope, Phase2 payload fields, migrations, IndexedDB, or cloud sync. Use for save format, autosave, offline queue, cloud load/save, or v1 import issues.
---

# Skill: Save envelope

## Read first

- `docs/save-format.md`
- `docs/adr/0002-persistence.md`
- `packages/protocol/src/save-envelope.ts`
- `packages/protocol/src/save-payload.ts`
- `packages/protocol/src/migrate.ts`
- `packages/protocol/src/envelope.ts`
- Client: `save-store.ts`, `save-storage.ts`, `cloud-sync-service.ts`, `state/game-state.ts`
- Server: `apps/server/src/modules/save/handlers.ts`

## Invariants

- `SAVE_SCHEMA_VERSION = 1` until an explicit migration step is added
- Envelope shape: `{ schemaVersion, savedAt, payload }`
- Cloud size cap: `MAX_CLOUD_SAVE_BYTES` (240 KiB)
- Conflict rule: newer `savedAt` wins (existing behavior)
- Chat/battle ephemeral — not in envelope
- Desktop must **not** grow a parallel save DB

## Adding a payload field

1. Extend types + `validatePhase2SavePayload` / defaults in `@adv/protocol`
2. Map in `game-state.ts` ↔ payload (both directions)
3. Keep defaults safe for older local envelopes (validator/default path)
4. If the change is breaking → bump schemaVersion **and** append `SAVE_MIGRATIONS` step (never bump alone)
5. Add/adjust tests in protocol + client save tests

## v1 import

- Use existing `importV1Save` / `tools/migrate-v1-saves` paths
- Do not silently treat v1 JSON as v2 envelope

## Verify

```bash
npx vitest run packages/protocol
npx vitest run apps/client/src/services/save-storage.test.ts
npm run typecheck
npm run gate   # recommended — save bugs brick alpha
```
