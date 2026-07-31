# ADR 0001: Stack and monorepo layout

## Status

Accepted (Phase 0)

## Context

v1 mixes JS modules, htm templates, and a Tauri game loop. The rewrite needs a typed, testable foundation with clear package boundaries.

## Decision

- TypeScript strict (`noUncheckedIndexedAccess`, no `any`) from day one
- npm workspaces: `packages/*` + `apps/*`
- UI: Preact + `.tsx` (`jsxImportSource: preact`); htm removed
- Shared packages: `@adv/protocol`, `@adv/core`, `@adv/sim`, `@adv/content`
- Apps: `@adv/client` (Vite), `@adv/server` (Node), `@adv/desktop` (Tauri from Phase 5)
- Validation: mini-validators in `@adv/protocol` (no zod)
- Quality gate: `npm run gate` (tsc, eslint max-warnings=0, vitest coverage, client build)

## Consequences

Feature work is blocked until the gate is green. Package boundaries force pure sim/content separation from UI and I/O.
