---
trigger: always_on
description: Fixed architecture — package boundaries, persistence, Tauri shell, protocol validators
---

# Architecture (fixed — do not redesign)

Authoritative docs: `README.md`, `docs/adr/0001-stack.md`, `docs/adr/0002-persistence.md`, `docs/REWRITE_PLAN.md`.

## Stack

- TypeScript strict (`noUncheckedIndexedAccess`, no `any`, no bare `@ts-ignore`)
- UI: **Preact + `.tsx`** (`jsxImportSource: preact`) — **htm removed**
- Validation: hand-rolled mini-validators in `@adv/protocol` — **no zod**
- CSS: pure CSS + existing variables (`apps/client/src/styles/`)
- Node ≥ 22, npm workspaces

## Package boundaries (hard)

| Package | May import |
|---|---|
| `@adv/protocol`, `@adv/core`, `@adv/sim`, `@adv/content` | **nothing** from other `@adv/*` (leaf packages) |
| `@adv/client` | core, protocol, sim, content |
| Desktop/Launcher | Tauri shell only — **no** game DB / Rust game loop |

Compose shared packages **only in apps**. Do not add package↔package `@adv` imports.

## Persistence (one strategy)

- Save envelope `schemaVersion: 1` — bumps need a discrete migration in `packages/protocol/src/migrate.ts`
- Client: IndexedDB saves, fully offline — there is **no** game server (see `docs/adr/0003-serverless-singleplayer.md`)
- **No** Tauri-rusqlite for game saves
- Clan (NPC) = local client save slice — the only social system
