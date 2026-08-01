# Phasen-Playtest-Checkliste

DoD-Nachweis pro Phase (manuell + automatisiert). Abhaken erst bei grünem `npm run gate` und Git-Tag `v2-phaseN`.

## Phase 0 — Fundament ✅ (`v2-phase0`)

- [x] `npm run gate` grün (tsc, eslint 0 warnings, tests+coverage, client build)
- [x] Client zeigt Boot-Shell („Boot OK“ / Ladezustand)
- [x] Workspaces `packages/*`, `apps/*`, `tools/*` auflösbar
- [x] ADRs + Parity-/Protocol-/Save-Docs vorhanden
- [x] CI-Workflow `.github/workflows/ci.yml` vorhanden

## Phase 1 — Kernel + Balancing ✅ (`v2-phase1`)

- [x] `@adv/core` Kernel nutzbar (DI, EventBus, Store, Ticker, Logger, Result, BigNum, RNG)
- [x] `@adv/sim` CONFIG + Math-Formeln vorhanden
- [x] Balancing-Snapshot-Gate in `npm run gate` (Golden `balancing.golden.json`)
- [x] Snapshot unverändert ohne explizite Freigabe

## Phase 2 — Vertical Slice ✅ (`v2-phase2`)

- [x] Sammeln erhöht Partikel; Klickkraft-Upgrade kostet Partikel und erhöht Gewinn
- [x] GedankenArchiv kaufen erzeugt Mneme über Tick
- [x] Speichern / Laden rundtrippt Fortschritt (Memory + IndexedDB-Adapter)
- [x] Offline-Fortschritt vergibt Mneme beim Boot und zeigt Report-Banner
- [x] Autosave läuft im Session-Loop
- [x] Vertical-Slice-Tests + Coverage-Gates (inkl. Client-Services/State ≥60 %) grün
- [x] Tag `v2-phase2` auf `main` (Direct-Merge; kein separater PR)

## Phase 3+ — offen

Playtest-Punkte werden mit der jeweiligen Phase ergänzt.
