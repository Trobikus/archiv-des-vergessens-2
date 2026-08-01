# Archiv des Vergessens v2

Greenfield-Rewrite. v1-Referenz: `F:\Max_Projekte\archiv-des-vergessens-1` (read-only).

## Plan

- [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) — vollständiger Rewrite-Plan
- [docs/parity-checklist.md](docs/parity-checklist.md) — Feature-Parität vs. v1
- [docs/playtest-checklist.md](docs/playtest-checklist.md) — Phasen-Playtest / DoD-Nachweis
- [docs/adr/](docs/adr/) — Architekturentscheidungen

## Fortschritt

**Fertig:** Phase 0–3 · **In Arbeit:** Phase 4 (Server + Auth + Cloud)

| Phase | Status |
|---|---|
| 0 Fundament | ✅ fertig (`v2-phase0`, [PR #1](https://github.com/Trobikus/archiv-des-vergessens-2/pull/1) merged) |
| 1 Kernel + Balancing | ✅ fertig (`v2-phase1`, [PR #2](https://github.com/Trobikus/archiv-des-vergessens-2/pull/2) merged) |
| 2 Vertical Slice | ✅ fertig (`v2-phase2`, Direct-Merge) — Klick/Tick/Save/Offline |
| 3 Content + Kampf/Story | ✅ fertig — Content/i18n-Gate, Combat, Hero/Story-UI |
| 4 Server + Auth + Cloud | 🔄 in Arbeit |
| 5–9 | ⬜ offen — Details in [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) |

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
docs/       adr, parity, playtest, protocol, save-format
```
