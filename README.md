<p align="center">
  <img src="docs/assets/banner.png" alt="Archiv des Vergessens" width="100%" />
</p>

# Archiv des Vergessens

### *Der Mneme-Bund* — Incremental RPG · Singleplayer · 2D · Offline Progression

> Atmosphäre. Fortschritt. Archiv.  
> Ein Incremental-RPG darüber, was die Welt vergisst — und was sie bewusst zu vergessen wählt.  
> **Frühe Alpha** — Systeme ändern sich, Inhalte fehlen, Fehler sind normal.

| | |
|---|---|
| **Studio** | [Grimoire Interactive](https://grimoire-interactive.de/) |
| **Version** | `0.3.5-alpha` · [![release](https://img.shields.io/github/v/release/Trobikus/archiv-des-vergessens-2?include_prereleases&sort=semver&label=release)](https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest) [![tag](https://img.shields.io/github/v/tag/Trobikus/archiv-des-vergessens-2?sort=semver&label=tag)](https://github.com/Trobikus/archiv-des-vergessens-2/tags) [![ci](https://img.shields.io/github/actions/workflow/status/Trobikus/archiv-des-vergessens-2/ci.yml?label=ci)](https://github.com/Trobikus/archiv-des-vergessens-2/actions/workflows/ci.yml) |
| **Stack** | TypeScript strict · Preact · Vite 7 · Tauri 2 |
| **Modus** | **Singleplayer, komplett offline** — kein Server, keine Accounts, kein Cloud-Sync |
| **Sprachen** | Deutsch · English (im Spiel umschaltbar) |
| **Plattform** | Web-Browser · native Windows-Desktop-App |
| **Spieler-Download** | [`ArchivDesVergessens2-Launcher.exe`](https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest/download/ArchivDesVergessens2-Launcher.exe) (Windows, portabel) |
| **Repo** | [Trobikus/archiv-des-vergessens-2](https://github.com/Trobikus/archiv-des-vergessens-2) |

Changelog → [`CHANGELOG.md`](CHANGELOG.md)  
Studio-Site (Golden Goal) → [grimoire-interactive.de/games/archiv-des-vergessens](https://grimoire-interactive.de/games/archiv-des-vergessens)

---

## Das Spiel

**Archiv des Vergessens** ist ein RPG-firstes Incremental Game. Im Zentrum steht **ein Held: kein Team, keine Party** — nur du, deine Entscheidungen und eine Welt, die sich merkt, was andere vergessen. Wähle eine von vier Klassen — **Krieger des Lichts**, **Erzmagier**, **Schattenläufer** oder **Hüter des Archivs** — und bahne deinen Weg durch eine zerbrochene Welt.

Der Kampf läuft **automatisiert und deterministisch**: keine Reaktionsketten, kein Würfelglück — du entscheidest **vor** dem Kampf über Ausrüstung, Skills und deinen Pfad. Während du weg bist, läuft die Welt mit **Offline-Progression** weiter. Jedes System — Crafting, Skills, Weltentwicklung — greift ineinander, statt Stunden zu polstern.

Entscheidungen formen die Welt: Story-Verzweigungen mit Flag-Bedingungen, Affinitäten (Aethel/Lethe) und echten Konsequenzen — nicht nur Statistik.

> **Golden Goal:** Die [Projektbeschreibung auf der Studio-Site](https://grimoire-interactive.de/games/archiv-des-vergessens) ist der Maßstab. Was dort versprochen wird — RPG-first, deterministischer Auto-Kampf, Offline-Progression, bedeutungsvolle Entscheidungen — ist die Entwicklungsrichtung für alles Weitere.

Die v2-Codebasis ist ein **kompletter Neuaufbau** mit striktem TypeScript und klaren Paketgrenzen. Balancing-Zahlen bleiben wortgleich zu v1 (Golden-Snapshot-Gate).

### Hub & Spielsysteme

Der Client organisiert den Hub in sieben Bereichen: **Archiv** · **Held** · **Story** · **Missionen** · **Werkstatt** · **Sammlung** · **Clan**.

| Bereich | Inhalte |
|---|---|
| **Archiv** | Klick / Tick, Gedankenarchiv-Upgrades, Gather-Upgrades, Ressourcen-Übersicht |
| **Held** | Stats, Inventar, Ausrüstung, Skilltree, Lager (Tresor) |
| **Story** | Story-Kämpfe, Challenges, Combat-Analytics |
| **Missionen** | Kapitel-Karte, Quests, Daily, Achievements |
| **Werkstatt** | Schmiede, Crafting, Bibliothek |
| **Sammlung** | Reliktjagd, Codex |
| **Clan** | NPC-Clan (Idle / Raid / Expedition) — läuft komplett lokal im Client |

Quer dazu: Offline-Produktion, Autosave, Floating Damage, erklärende Hover-Tooltips und cinematic Hub-Chrome (Top-Bar, Rails, Footer) pixel-matched zu Design-Mocks. Sprachumschaltung DE/EN live in den Optionen.

Multiplayer-Systeme (Chat, Freunde, Gilde, Bestenliste, Accounts, Cloud-Sync) wurden nach dem Rewrite-Meilenstein **entfernt** — das Spiel ist rein offline ([ADR 0003](docs/adr/0003-serverless-singleplayer.md)).

### Steuerung

| Taste | Aktion |
|---|---|
| **R** | Sammeln (Gather) |
| **F** | Zum Archiv-Bereich springen |
| **Q** / **E** | Vorheriger / nächster Hub-Bereich |
| **ESC** | Pause-Menü bzw. Optionen schließen |

### Offline & Speichern

- **Autosave** im einstellbaren Intervall (5 s – 60 s) in IndexedDB — komplett lokal, ein Slot, keine Konten.
- **Offline-Progression:** Beim Start wird die vergangene Zeit angerechnet — Mneme, Clan-Partikel und Clan-Relikt-Fortschritt laufen weiter.
- Desktop (Tauri) speichert im selben v2-isolierten AppData-Profil; Updates liefert der Launcher.

---

## Studio-Architektur

Eine Persistenzstrategie. Klare Grenzen. Kein Server.

```text
┌─────────────────────────────────────────────────────────────┐
│  apps/launcher (Tauri 2) — Siegel-Portal · portable ZIP     │
│  apps/desktop  (Tauri 2)  — Fenster · quit_app · Lockdown   │
│         └─ webview ──────────────────────────────────────┐  │
│  apps/client   (Preact + Vite)  — UI · Session · Offline │  │
│         │  Save-Envelope (IndexedDB, Offline-Progress)   │  │
└─────────┼────────────────────────────────────────────────┼──┘
          │
          ▼
   packages/core · sim · content · protocol
   DI · Events · Ticker · Math · Save-Envelope
   i18n DE/EN · Balancing (Golden-Snapshot)
```

### Design-Prinzipien

| Entscheidung | Umsetzung |
|---|---|
| **Eine Persistenz** | Save-Envelope (`schemaVersion: 1`) lokal in IndexedDB — Offline-Progress beim Boot; **keine** Spiel-DB in Tauri, **kein** Cloud-Sync |
| **RPG-first** | Charakter, Story und Entscheidungen vor Zahlen |
| **Deterministischer Auto-Kampf** | `@adv/sim` ohne Zufall — Ergebnisse sind nachvollziehbar; Balancing-Parität via Golden-Snapshot-Gate |
| **Tauri nur Shell** | Fenster, Quit, Lockdown — keine Rust-Game-Loop; Updates über den Launcher |
| **Desktop-Feel** | ESC → Spielmenü; Kontextmenü, Reload, Zoom und DevTools-Shortcuts in der Shell deaktiviert |
| **Quality-first** | Jede Änderung hält `npm run gate` grün |
| **Branching** | Arbeit nur auf `main` |

Details: [`docs/REWRITE_PLAN.md`](docs/REWRITE_PLAN.md) · [`docs/adr/`](docs/adr/)

---

## Monorepo

| Fläche | Paket | Rolle |
|---|---|---|
| Spiel-Client | `@adv/client` | Preact-UI, Game-Session, Save / Offline |
| Desktop-Shell | `@adv/desktop` | Tauri 2, Quit, Lockdown |
| Launcher | `@adv/launcher` | Siegel-Portal, portable ZIP, Ed25519-Verify |
| Simulation | `@adv/sim` | Balancing, deterministische Combat- / Idle-Mathe |
| Kernel | `@adv/core` | Store, Events, Ticker, DI, Pools |
| Protokoll | `@adv/protocol` | Save-Envelope, Mini-Validatoren (kein zod) |
| Content | `@adv/content` | Spieldaten, Heldenklassen, i18n (DE/EN) |
| Gates | `@adv/gates` | CI- / DoD-Gate |
| E2E | `@adv/e2e` | Playwright-Smoke |

### Repository-Struktur

```text
archiv-des-vergessens-2/
├─ apps/
│  ├─ client/            Preact-Spielclient (Vite 7)
│  ├─ desktop/           Tauri-2-Spielshell
│  └─ launcher/          Siegel-Portal (Spieler-EXE)
├─ packages/
│  ├─ core/              Runtime-Kernel
│  ├─ sim/               Spielsimulation & Balancing
│  ├─ protocol/          Save-Envelope & Validierung
│  └─ content/           Texte, Heldenklassen & Content-Pipeline
├─ tools/
│  ├─ gates/             CI- / DoD-Gate (`npm run gate`)
│  ├─ e2e/               Playwright-Smoke
│  ├─ content/           Content-Import-Hilfen
│  └─ sign_release.mjs   Ed25519-Signatur portable ZIP
├─ design/               Design-Referenzen / Hub-Mocks / Szenen
├─ docs/                 Plan, ADRs, Legal, Checklisten
├─ CHANGELOG.md
└─ README.md
```

---

## Schnellstart

### Voraussetzungen

- **Node.js** ≥ 22
- **npm** (Workspaces)
- Optional Desktop / Launcher: **Rust** + [Tauri 2](https://v2.tauri.app/) Prerequisites (unter Windows: WebView2)

### Web-Client

```bash
npm install
npm run gate          # Typecheck, Lint, Tests, Build — DoD
npm run dev:client    # → http://localhost:5173
```

### Desktop & Launcher

```bash
npm run tauri:dev       # Spiel-Client im nativen Fenster
npm run launcher:dev    # Siegel-Portal lokal
npm run launcher:build  # Release-EXE des Launchers
```

Shell-Details: [`apps/desktop/README.md`](apps/desktop/README.md) · Launcher: [`apps/launcher/README.md`](apps/launcher/README.md)

### Qualität & E2E

```bash
npm test
npm run test:coverage
npm run e2e             # Playwright-Smoke (Client-Build nötig)
npm run clippy          # Rust-Lint Desktop-Shell
npm run clippy:launcher # Rust-Lint Launcher
```

---

## Skripte (Root)

| Befehl | Beschreibung |
|---|---|
| `npm run gate` | DoD-Gate: Balancing-Snapshot, i18n-Parität, Version-Parität, a11y-Basis, Perf-Budgets, tsc, ESLint, Vitest + Coverage, Build, optional Clippy & E2E |
| `npm run gate:lite` | Kleiner Gate (Balancing + i18n + Typecheck) für Trivia-Änderungen |
| `npm run dev:client` | Vite-Devserver Client |
| `npm run tauri:dev` | Native Desktop-Session (Spiel) |
| `npm run launcher:dev` | Siegel-Portal Dev |
| `npm run launcher:build` | Siegel-Portal Release-EXE |
| `npm run build` | Client-Production-Build |
| `npm test` | Unit- / Integrationstests (Vitest) |
| `npm run test:coverage` | Coverage-Report |
| `npm run e2e` | Playwright-Smoke |
| `npm run clippy` | Desktop Rust-Lint (`-D warnings`) |
| `npm run clippy:launcher` | Launcher Rust-Lint |
| `npm run typecheck` | Projektweiter TypeScript-Build-Graph |
| `npm run lint` | ESLint, max-warnings = 0 |

`npm install` setzt per `prepare` den Git-Hook-Pfad auf `.githooks` (Pre-Commit verbietet zod-/htm-/React-Imports und Non-`main`-Commits; Pre-Push läuft Gates; Release-Tags erzwingen lokal `npm run gate`).

---

## Roadmap — Rewrite-Phasen

| Phase | Status | Inhalt |
|---|---|---|
| **0** Fundament | ✅ | Monorepo, CI, ADRs, Parity-Checkliste |
| **1** Kernel + Balancing | ✅ | `@adv/core`, `@adv/sim`, Golden Snapshots |
| **2** Vertical Slice | ✅ | Klick / Tick / Save / Offline |
| **3** Content + Kampf / Story | ✅ | Combat, Hero, Story, i18n DE/EN |
| **4** Server + Auth + Cloud | ➡️ entfernt | Server-less Pivot — siehe [ADR 0003](docs/adr/0003-serverless-singleplayer.md) |
| **5** Tauri + E2E | ✅ | Desktop-Shell, Playwright |
| **6** Feature-Parität A–F | ✅ | Hub, Quests, Forge, Talente, Story, Tutorial |
| **7** Social / Live | ➡️ entfernt | NPC-Clan blieb — läuft lokal |
| **8** Release-Meilenstein | ✅ | Perf, a11y, Patch Notes, Release-Pipeline |

**Produktstatus:** frühe Alpha (`0.3.5-alpha`) — Playtest, Feinschliff, Inhalte.  
**Nächste Richtung:** die Systeme der Studio-Site (siehe Golden Goal oben) konsequent ausbauen.

Checklisten: [Parity](docs/parity-checklist.md) · [Playtest](docs/playtest-checklist.md) · [a11y](docs/a11y-checklist.md)

---

## Release & Siegel-Portal

| Thema | Detail |
|---|---|
| **App-ID** | `com.grimoire.archivdesvergessens2` (Desktop) · `com.grimoire.archivdesvergessens2.launcher` |
| **Spieler-EXE** | **`ArchivDesVergessens2-Launcher.exe`** — einziger Download für Spieler |
| **Artifacts** | Launcher · `archiv-des-vergessens-2.zip` · `.sig` — **kein** NSIS / Windows-Setup |
| **Portable-Spiel** | ZIP enthält `ArchivDesVergessens2.exe` |
| **Installationspfad** | Standard `%APPDATA%\ArchivDesVergessens2\app\` (im Launcher wählbar; v1-Pfade werden abgelehnt) |
| **Deinstallation** | Launcher schreibt `Deinstallieren.cmd` ins Installationsverzeichnis (nur v2; v1 bleibt unberührt) |
| **Updates** | Über den Launcher (GitHub Releases, Ed25519-Verify) — nicht über einen NSIS/`latest.json`-Setup-Pfad |
| **Workflow** | [`.github/workflows/release.yml`](.github/workflows/release.yml) — Tag `v*` oder `workflow_dispatch` |
| **CI** | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — Gate + Desktop-Clippy + E2E |
| **Signatur** | `tools/sign_release.mjs` + Secret `ED25519_PRIVATE_KEY` |
| **Release-Status** | Workflow veröffentlicht Releases **sofort** (`draft: false`) — der Launcher braucht `/releases/latest` |
| **Repo** | Muss **öffentlich** sein (Launcher ruft Releases ohne Token ab) |

> **Isolations-Hinweis:** v2 läuft rein lokal und vollständig von v1 isoliert (AppData, Binary-Namen, Tauri-IDs).  
> Accounts, Cloud und v1-Spielstand-Übernahme sind bewusst **entfallen** — es gibt keine Spieler vor dem Pivot ([ADR 0003](docs/adr/0003-serverless-singleplayer.md)).

---


## Dokumentation

| Dokument | Zweck |
|---|---|
| [`docs/REWRITE_PLAN.md`](docs/REWRITE_PLAN.md) | Gesamtplan, Phasen, Architektur (historisch) |
| [`CHANGELOG.md`](CHANGELOG.md) | Keep a Changelog |
| [`docs/save-format.md`](docs/save-format.md) | Save-Envelope & Formatvertrag |
| [`docs/parity-checklist.md`](docs/parity-checklist.md) | Feature-Parität zu v1 |
| [`docs/playtest-checklist.md`](docs/playtest-checklist.md) | Manueller Playtest |
| [`docs/a11y-checklist.md`](docs/a11y-checklist.md) | Accessibility-Basis |
| [`docs/adr/`](docs/adr/) | Architecture Decision Records |
| [`apps/desktop/README.md`](apps/desktop/README.md) | Desktop-Shell & Lockdown |
| [`apps/launcher/README.md`](apps/launcher/README.md) | Siegel-Portal |

---

## Entwicklungshinweise

1. **Gate zuerst** — jede Änderung hält `npm run gate` grün.
2. **Save-Vertrag spiegeln** — Save-Format-Änderungen immer in `@adv/protocol` und der [`docs/save-format.md`](docs/save-format.md) nachziehen; `schemaVersion` nur mit diskretem Migrationsschritt.
3. **Offline bleibt offline** — keine Live-/Multiplayer-Systeme neu erfinden; der Server ist bewusst entfernt ([ADR 0003](docs/adr/0003-serverless-singleplayer.md)).
4. **v1 ist Referenz** — `archiv-des-vergessens-1` ist read-only; kein aktiver Feature-Port außer dokumentierter Balancing-Parität.
5. **Paketgrenzen respektieren** — reine Sim-/Content-Logik bleibt frei von UI und I/O.
6. **Balancing schützen** — Zahlenänderungen brauchen grünen Golden-Snapshot.
7. **Nur `main`** — keine Feature-Branches, außer ausdrücklich gewünscht.

---

## Lizenz & Projekt

Privates Studio-Projekt von **Grimoire Interactive** (Mneme-Bund).

| Dokument | Inhalt |
|---|---|
| [`LICENSE`](LICENSE) | Proprietär — All Rights Reserved |
| [`docs/legal/PRIVACY.md`](docs/legal/PRIVACY.md) | Datenschutz / Privacy Policy (DE + EN) |
| [`docs/legal/EULA.md`](docs/legal/EULA.md) | Nutzungsbedingungen / EULA (DE + EN) |
| [`docs/legal/THIRD_PARTY_NOTICES.md`](docs/legal/THIRD_PARTY_NOTICES.md) | OSS- & Dritthinweise |

Offizielle Release-Builds dürfen persönlich und nicht-kommerziell gespielt werden; Source, Assets und Weitergabe sind ohne schriftliche Freigabe nicht gestattet.  
Rechtliches: **grimoire.interactive@gmail.com** · Kontaktformular: **kontakt@grimoire-interactive.de**

Repository: [github.com/Trobikus/archiv-des-vergessens-2](https://github.com/Trobikus/archiv-des-vergessens-2)

---

*Viel Erfolg im Archiv, Wanderer.*
