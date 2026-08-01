# Archiv des Vergessens

**Der Mneme-Bund** — Idle-/Progression-RPG als TypeScript-Monorepo (Client, Server, Desktop).

Version `2.0.0` (Greenfield-Rewrite). Aktueller Stand: **Phase 0–8 abgeschlossen** (Härtung / Release-Pfad). Optional danach: v1-Save-Importer (Phase 9).

---

## Überblick

Archiv des Vergessens ist ein atmosphärisches Idle-RPG mit Charakterfortschritt, Kampf, Crafting, Quests und Story. Die v2-Codebasis ist ein vollständiger Neuaufbau mit striktem TypeScript, modularer Architektur und gemeinsamer Protokollschicht für Web und Desktop.

| Fläche | Paket | Rolle |
|---|---|---|
| Spiel-Client | `@adv/client` | Preact-UI, Game-Session, Save/Offline |
| Live-Server | `@adv/server` | Auth, Cloud-Sync, Chat, Leaderboard |
| Desktop-Shell | `@adv/desktop` | Tauri 2 Fenster, Updater, Quit |
| Simulation | `@adv/sim` | Balancing, Combat-/Idle-Mathe |
| Kernel | `@adv/core` | Store, Events, Ticker, DI |
| Protokoll | `@adv/protocol` | WS-Events, Validierung, Typen |
| Content | `@adv/content` | i18n (DE/EN), Spieldaten |

---

## Voraussetzungen

- **Node.js** ≥ 22
- **npm** (Workspaces)
- Optional Desktop: **Rust** + [Tauri 2](https://v2.tauri.app/) Prerequisites (WebView2 unter Windows)

---

## Schnellstart

```bash
npm install
npm run gate          # Typecheck, Lint, Tests, Build
npm run dev:client    # Web-Client → http://localhost:5173
npm run dev:server    # WS-Server (Auth / Cloud)
```

### Desktop

```bash
npm run tauri:dev     # Client + natives Fenster
```

### Qualität & E2E

```bash
npm test
npm run test:coverage
npm run e2e           # Playwright-Smoke (Client-Build + Playwright nötig)
npm run clippy        # Rust-Lint der Desktop-Shell
```

---

## Repository-Struktur

```text
apps/
  client/     Preact-Spielclient (Vite)
  server/     Modularer WebSocket-Server
  desktop/    Tauri-2-Shell
packages/
  core/       Runtime-Kernel
  sim/        Spielsimulation & Balancing
  protocol/   Netzwerkvertrag
  content/    Texte & Content-Pipeline
tools/
  gates/      CI-/DoD-Gate (`npm run gate`)
  e2e/        Playwright-Smoke
docs/
  REWRITE_PLAN.md
  parity-checklist.md
  playtest-checklist.md
  adr/        Architekturentscheidungen
```

---

## Architektur (Kurz)

- **Eine Persistenzstrategie:** Save-Envelope im Client (IndexedDB/Offline-Queue); Server-SQLite als Account-Autorität — keine Spiel-DB in Tauri.
- **Tauri nur als Shell:** Fenster, Updater, `quit_app`; keine Rust-Game-Loop.
- **Auth:** Login bei jedem Start; optional nur Benutzername merken, Passwort immer manuell.
- **Desktop-Feel:** ESC öffnet das Spielmenü; Browser-Chrome (Kontextmenü, Reload, Zoom, DevTools-Shortcuts) ist in der Shell deaktiviert.

Details: [docs/REWRITE_PLAN.md](docs/REWRITE_PLAN.md) · [docs/adr/](docs/adr/)

---

## Fortschritt

| Phase | Status | Inhalt |
|---|---|---|
| 0 Fundament | ✅ | Monorepo, CI, ADRs |
| 1 Kernel + Balancing | ✅ | `@adv/core`, `@adv/sim`, Golden Snapshots |
| 2 Vertical Slice | ✅ | Klick / Tick / Save / Offline |
| 3 Content + Kampf/Story | ✅ | Combat, Hero, Story, i18n |
| 4 Server + Auth + Cloud | ✅ | WS-Auth, Cloud-Sync, Migrationstool |
| 5 Tauri + E2E | ✅ | Desktop-Shell, Updater-Config, Playwright |
| 6 Feature-Parität A–F | ✅ | Hub, Quests, Forge, Talente, Story, Tutorial |
| 7 Social/Live | ✅ | Chat, Freunde, Clan, Leaderboard |
| 8 Release 2.0.0 | ✅ | Perf, a11y, Patch Notes, Updater-Rollout |
| 9 v1-Save-Importer | ⬜ | Optional nach Release |

Checklisten: [parity](docs/parity-checklist.md) · [playtest](docs/playtest-checklist.md) · [a11y](docs/a11y-checklist.md) · [cutover](docs/cutover-v1.md)

---

## Skripte (Root)

| Befehl | Beschreibung |
|---|---|
| `npm run gate` | DoD-Gate (tsc, eslint, vitest, build) |
| `npm run dev:client` | Vite-Devserver Client |
| `npm run dev:server` | Auth-/Cloud-Server |
| `npm run tauri:dev` | Native Desktop-Session |
| `npm run build` | Client-Production-Build |
| `npm test` | Unit-/Integrationstests |
| `npm run e2e` | Playwright-Smoke |
| `npm run clippy` | Desktop Rust-Lint |

---

## Entwicklungshinweise

1. Jede Änderung sollte `npm run gate` grün halten.
2. Protokoll- und Save-Format-Änderungen immer in `@adv/protocol` und den Docs spiegeln.
3. v1 (`archiv-des-vergessens-1`) ist **nur Referenz** — kein aktiver Feature-Port mehr außer dokumentierter Parität.

---

## Lizenz & Projekt

Privates Studio-Projekt. Repository: [Trobikus/archiv-des-vergessens-2](https://github.com/Trobikus/archiv-des-vergessens-2).
