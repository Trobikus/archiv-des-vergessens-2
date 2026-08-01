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

## Phase 3 — Content + Kampf/Story ✅ (`v2-phase3`)

- [x] Charakter erstellen (Name 2–20, Klasse kosmetisch) und Spiel starten
- [x] DE/EN umschalten; Labels aus i18n-Keys; i18n-Key-Gate in `npm run gate` grün
- [x] Story-Intro (3 Frames) beim ersten Öffnen der Chronik, danach gespeichert als gesehen
- [x] Boss-Kampf starten: Auto-Ticks, Speer/Schild/Heilung, Fliehen
- [x] Sieg vergibt EXP (+ Item bei Mid/End-Boss); Held kann Stats verteilen und looten/equippen
- [x] Speichern/Laden behält Held, Boss-Fortschritt, Locale und Intro-Flag
- [x] Phase-3-Slice-Tests + `npm run gate` grün
- [ ] Tag `v2-phase3` (nach Freigabe setzen)

## Phase 4 — Server + Auth + Cloud 🔄

- [x] Guest-Handshake (`auth`) und Offline-Spiel mit lokalem Save
- [x] Register / Login / Token-Verify / Logout
- [x] convertGuest → registrierter Account; lokaler Fortschritt bleibt, dann Cloud-Push
- [x] Cloud save/load (Save-Envelope); neueres `savedAt` gewinnt
- [x] Superseded Token kann nicht cloud-speichern
- [x] User-Migration Dry-Run Tool (`tools/migrate-v1-users/`)
- [x] Phase-4-Tests + `npm run gate` grün
- [ ] Tag `v2-phase4` nach Merge
- [ ] Manueller Playtest (Guest/Register/Cloud über zwei Sessions)

## Phase 5 — Tauri-Shell + E2E 🔄

- [x] `@adv/desktop` startet Client im Webview (devUrl 5173 / frontendDist)
- [x] Identifier `com.grimoire.archivdesvergessens` + Updater-Pubkey/Endpoint aus v1
- [x] Keine lokale Save-DB / kein Rust-Game-Loop
- [x] `quit_app` + Safe-Quit über `app:quit-requested` (Client speichert vor Exit)
- [x] Playwright-Smoke (`npm run e2e`): Intro → Login, keine pageerrors
- [x] `cargo clippy -D warnings` in Gate/CI-Job `desktop`
- [x] App-Version `2.0.0` (Root/Cloud `2.0.0-phase5`)
- [ ] Manueller Playtest: `npm run tauri:dev` — Quit-Button + Fenster-X speichern und beenden
- [ ] Nach Quit: CMD-Meldungen `Chrome_WidgetWin_0` / Vite-Lifecycle sind harmlos (siehe `apps/desktop/README.md`)
- [ ] Tag `v2-phase5` nach Merge
