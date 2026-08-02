---
trigger: always_on
description: Git main-only policy, quality gate, version lockstep, release caution
---

# Git & release

## Branching

- Work **only on `main`**
- Do **not** create `feature/*`, `fix/*`, or `cursor/*` branches unless the user explicitly asks
- Commit/push directly to `main` when asked to ship changes
- Default remote branch is `main` (not `master`)

## Quality

- Definition of done for risky changes: `npm run gate` green
- Pre-push hook runs gate for version tags `v*.*.*`
- Version lockstep: root `package.json` ↔ desktop/launcher package + `tauri.conf` + `Cargo.toml` (version-parity gate)

## Alpha caution

- Prefer bugfixes and small, testable increments over large features
- Do not bump `schemaVersion`, change PBKDF2 params, or alter live WSS defaults casually
- PBKDF2 frozen: 100_000 iterations, keylen 64, sha512 (`apps/server/src/db/schema.ts`)
- Live server: `wss://archiv.grimoire-interactive.de`
- Do not expose cheat/debug APIs in release client paths
