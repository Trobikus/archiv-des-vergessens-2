# migrate-v1-saves

Convert a v1 save JSON dump into a v2 `SaveEnvelope`.

Uses `@adv/protocol` `importV1Save` (Phase 9 adapter).

## Usage

```bash
# Dry-run (default): validate + print summary
npm run migrate:v1-saves -- --source path/to/v1-save.json --out path/to/v2-envelope.json

# Write envelope
npm run migrate:v1-saves -- --source path/to/v1-save.json --out path/to/v2-envelope.json --apply

# Optional separate account vault record
npm run migrate:v1-saves -- \
  --source path/to/v1-save.json \
  --vault path/to/vault.json \
  --out path/to/v2-envelope.json \
  --apply
```

## Accepted source shapes

- Inner v1 state (`{ hero, resources, … }`)
- IndexedDB envelope (`{ state, timestamp, … }`)
- Cloud blob (`{ saveData, timestamp }`)
- Bundle with vault (`{ state, vaultData }`)

Requires **Node.js ≥ 22.6** (`--experimental-strip-types`).

In-game alternative: **Options → v1-Spielstand importieren**.
