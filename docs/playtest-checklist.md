# Phasen-Playtest-Checkliste

DoD-Nachweis pro Phase (manuell + automatisiert). Abhaken erst bei gr�nem `npm run gate` und Git-Tag `v2-phaseN`.

## Phase 0 ? Fundament ? (`v2-phase0`)

- [x] `npm run gate` gr�n (tsc, eslint 0 warnings, tests+coverage, client build)
- [x] Client zeigt Boot-Shell (?Boot OK? / Ladezustand)
- [x] Workspaces `packages/*`, `apps/*`, `tools/*` aufl�sbar
- [x] ADRs + Parity-/Protocol-/Save-Docs vorhanden
- [x] CI-Workflow `.github/workflows/ci.yml` vorhanden

## Phase 1 ? Kernel + Balancing ? (`v2-phase1`)

- [x] `@adv/core` Kernel nutzbar (DI, EventBus, Store, Ticker, Logger, Result, BigNum, RNG)
- [x] `@adv/sim` CONFIG + Math-Formeln vorhanden
- [x] Balancing-Snapshot-Gate in `npm run gate` (Golden `balancing.golden.json`)
- [x] Snapshot unver�ndert ohne explizite Freigabe

## Phase 2 ? Vertical Slice ? (`v2-phase2`)

- [x] Sammeln erh�ht Partikel; Klickkraft-Upgrade kostet Partikel und erh�ht Gewinn
- [x] GedankenArchiv kaufen erzeugt Mneme �ber Tick
- [x] Speichern / Laden rundtrippt Fortschritt (Memory + IndexedDB-Adapter)
- [x] Offline-Fortschritt vergibt Mneme beim Boot und zeigt Report-Banner
- [x] Autosave l�uft im Session-Loop
- [x] Vertical-Slice-Tests + Coverage-Gates (inkl. Client-Services/State ?60 %) gr�n
- [x] Tag `v2-phase2` auf `main` (Direct-Merge; kein separater PR)

## Phase 3 ? Content + Kampf/Story ? (`v2-phase3`)

- [x] Charakter erstellen (Name 2?20, Klasse kosmetisch) und Spiel starten
- [x] DE/EN umschalten; Labels aus i18n-Keys; i18n-Key-Gate in `npm run gate` gr�n
- [x] Story-Intro (3 Frames) beim ersten �ffnen der Chronik, danach gespeichert als gesehen
- [x] Boss-Kampf starten: Auto-Ticks, Speer/Schild/Heilung, Fliehen
- [x] Sieg vergibt EXP (+ Item bei Mid/End-Boss); Held kann Stats verteilen und looten/equippen
- [x] Speichern/Laden beh�lt Held, Boss-Fortschritt, Locale und Intro-Flag
- [x] Phase-3-Slice-Tests + `npm run gate` gr�n
- [ ] Tag `v2-phase3` (nach Freigabe setzen)

## Phase 4 ? Server + Auth + Cloud ??

- [x] Guest-Handshake (`auth`) und Offline-Spiel mit lokalem Save
- [x] Register / Login / Token-Verify / Logout
- [x] convertGuest ? registrierter Account; lokaler Fortschritt bleibt, dann Cloud-Push
- [x] Cloud save/load (Save-Envelope); neueres `savedAt` gewinnt
- [x] Superseded Token kann nicht cloud-speichern
- [x] User-Migration Dry-Run Tool (`tools/migrate-v1-users/`)
- [x] Phase-4-Tests + `npm run gate` gr�n
- [ ] Tag `v2-phase4` nach Merge
- [ ] Manueller Playtest (Guest/Register/Cloud �ber zwei Sessions)

## Phase 5 ? Tauri-Shell + E2E ??

- [x] `@adv/desktop` startet Client im Webview (devUrl 5173 / frontendDist)
- [x] Identifier `com.grimoire.archivdesvergessens2` + Updater-Pubkey/Endpoint aus v1
- [x] Keine lokale Save-DB / kein Rust-Game-Loop
- [x] `quit_app` + Safe-Quit �ber `app:quit-requested` (Client speichert vor Exit)
- [x] Playwright-Smoke (`npm run e2e`): Intro ? Login, keine pageerrors
- [x] `cargo clippy -D warnings` in Gate/CI-Job `desktop`
- [x] App-Version `2.0.0` (Root/Cloud sp�ter Phase 8 vereinheitlicht)
- [ ] Manueller Playtest: `npm run tauri:dev` ? Quit-Button + Fenster-X speichern und beenden
- [ ] Nach Quit: CMD-Meldungen `Chrome_WidgetWin_0` / Vite-Lifecycle sind harmlos (siehe `apps/desktop/README.md`)
- [ ] Tag `v2-phase5` nach Merge

## Phase 6 ? Feature-Parit�t A?F ?

- [x] Hub-Tabs Wellen A?F spielbar (Quests?Tutorial/Settings)
- [x] Phase-6-Service-Tests + `npm run gate` gr�n
- [ ] Tag `v2-phase6` nach Freigabe

## Phase 7 ? Social/Live ??

- [x] Globaler Chat: senden, Broadcast, History; Offline-Fallback lokal
- [x] Leaderboard: pers�nliche Rekorde + globales Top-10 (nur registriert submit)
- [x] Freunde: Anfragen/Accept-Sim/Entfernen (lokal)
- [x] Clan: Rekrutieren (`#clan-recruit-panel`), Produktion, Expedition, Raid
- [x] Clan-Offline-Produktion im Boot-Report
- [x] Server-Module + Protocol-Docs; Phase-7-Tests gr�n
- [x] Playtest-Abdeckung: 2-Client Chat-Broadcast + registrierter LB-Submit/Jump-Limits; Clan/Freunde offline (inkl. Expedition/Raid/Offline-Produktion)
- [x] Tag `v2-phase7` nach Freigabe

## Phase 8 — Härtung → Release 2.0.0

- [x] Perf-Budgets + Frame-Degradation im Session-Ticker
- [x] DomPool / ObjectPool + Leak-Tests; FloatingDamage pooled
- [x] a11y-Basis (`docs/a11y-checklist.md`) + Gate + Playwright
- [x] CHANGELOG + Patch Notes 2.0.0
- [x] Updater-Rollout: Artifacts, v2-Endpoint, `release.yml`, Client-Check
- [x] Cutover-Docs + Versionen `2.0.0`
- [x] `npm run gate` Schritte `a11y-basis` / `perf-budgets`
- [ ] Manueller Playtest: lange Session ohne Leak; Update-Check in Desktop
- [ ] Tag `v2-phase8` / Release-Tag `v2.0.0` nach Freigabe

## Phase 9 ? v1-Save-Importer

- [x] `importV1Save` mappt IDB-/Cloud-/Inner-State ? validiertes v2-Envelope
- [x] Options-UI Datei-Import + Confirm
- [x] CLI `tools/migrate-v1-saves` dry-run/`--apply`
- [ ] Manueller Playtest: echten v1-Export importieren und Hub/Kampf pr�fen
- [ ] Tag `v2-phase9` nach Freigabe
