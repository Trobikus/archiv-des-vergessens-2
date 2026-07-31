# Archiv des Vergessens v2

Greenfield-Rewrite. v1-Referenz: `F:\Max_Projekte\archiv-des-vergessens-1` (read-only).

## Plan

- [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) — vollständiger Rewrite-Plan
- [docs/parity-checklist.md](docs/parity-checklist.md) — Feature-Parität vs. v1
- [docs/adr/](docs/adr/) — Architekturentscheidungen

## Phase 0 status

Monorepo bootet: Workspaces, TypeScript strict, Vite/Preact-Shell („Boot OK“), ESLint, Vitest, CI, ADRs, Parity-Checkliste.

```bash
npm install
npm run gate
npm run dev:client
```

## Layout

```text
packages/   @adv/protocol @adv/core @adv/sim @adv/content
apps/       client  server  desktop(Phase 5)
tools/      gates
docs/       adr, parity, protocol, save-format
```
