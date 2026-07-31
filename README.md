# Archiv des Vergessens v2

Greenfield-Rewrite. v1-Referenz: `F:\Max_Projekte\archiv-des-vergessens-1` (read-only).

## Plan

- [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) — vollständiger Rewrite-Plan
- [docs/parity-checklist.md](docs/parity-checklist.md) — Feature-Parität vs. v1
- [docs/adr/](docs/adr/) — Architekturentscheidungen

## Fortschritt

| Phase | Status |
|---|---|
| 0 Fundament | ✅ erledigt (`v2-phase0`, [PR #1](https://github.com/Trobikus/archiv-des-vergessens-2/pull/1)) |
| 1 Kernel + Balancing | ✅ erledigt (`v2-phase1`, [PR #2](https://github.com/Trobikus/archiv-des-vergessens-2/pull/2)) |
| 2–9 | ⬜ offen — Details in [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) |

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
