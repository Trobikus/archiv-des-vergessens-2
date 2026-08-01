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

## Phase 3 — Content + Kampf/Story ⬜

- [ ] Charakter erstellen (Name 2–20, Klasse kosmetisch) und Spiel starten
- [ ] DE/EN umschalten; Labels aus i18n-Keys; i18n-Key-Gate in `npm run gate` grün
- [ ] Story-Intro (3 Frames) beim ersten Öffnen der Chronik, danach gespeichert als gesehen
- [ ] Boss-Kampf starten: Auto-Ticks, Speer/Schild/Heilung, Fliehen
- [ ] Sieg vergibt EXP (+ Item bei Mid/End-Boss); Held kann Stats verteilen und looten/equippen
- [ ] Speichern/Laden behält Held, Boss-Fortschritt, Locale und Intro-Flag
- [ ] Phase-3-Slice-Tests + `npm run gate` grün
- [ ] Tag `v2-phase3` nach Merge

## Phase 4+ — offen

Playtest-Punkte werden mit der jeweiligen Phase ergänzt.
