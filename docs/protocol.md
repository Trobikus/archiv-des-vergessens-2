# Protocol notes (Phase 0)

WS event catalog and payload validators land with Phase 4.

Phase 0 ships only the Save-Envelope validator in `@adv/protocol`:

- `schemaVersion: 1`
- `savedAt: number`
- `payload: unknown` (typed per phase)
