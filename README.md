# Archiv des Vergessens v2

Greenfield-Rewrite. v1-Referenz: `F:\Max_Projekte\archiv-des-vergessens-1` (read-only).

## Plan

- [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) — vollständiger Rewrite-Plan
- [docs/parity-checklist.md](docs/parity-checklist.md) — Feature-Parität vs. v1
- [docs/adr/](docs/adr/) — Architekturentscheidungen

## Fortschritt

**Fertig:** Phase 0–2 · **Als Nächstes:** Phase 3 (Content + Kampf/Story)

| Phase | Status |
|---|---|
| 0 Fundament | ✅ fertig (`v2-phase0`, [PR #1](https://github.com/Trobikus/archiv-des-vergessens-2/pull/1) merged) |
| 1 Kernel + Balancing | ✅ fertig (`v2-phase1`) |
| 2 Vertical Slice | ✅ fertig (`v2-phase2`) — Klick/Tick/Save/Offline |
| 3–9 | ⬜ offen — Details in [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) |

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
