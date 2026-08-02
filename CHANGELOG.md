# Changelog

All notable changes to Archiv des Vergessens v2 are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
project follows [Semantic Versioning](https://semver.org/).

## [0.2.4-alpha] — 2026-08-02

### Added

- Launcher writes `Deinstallieren.cmd` into the portable install folder on every install/update (removes v2 game dir, v2 AppData config, desktop shortcut; leaves v1 untouched)

## [0.2.3-alpha] — 2026-08-02

### Changed

- Full v2 isolation from v1: AppData `%APPDATA%\ArchivDesVergessens2\`, Tauri IDs `com.grimoire.archivdesvergessens2*`, binaries `ArchivDesVergessens2*.exe`, ZIP `archiv-des-vergessens-2.zip`, shortcut `Archiv des Vergessens 2.lnk`
- Launcher rejects install paths under the legacy v1 `ArchivDesVergessens` tree
- Client WS override key renamed to `adv2_server_url` (no read of v1 `archiv_server_url`)

## [0.2.2-alpha] — 2026-08-02

### Fixed

- Launcher no longer treats legacy v1 installs (`1.x`) as newer than v2 (`0.2.x`); forces Siegel renew to GitHub latest
- Default portable install folder moved under the v2 AppData tree (superseded by 0.2.3 isolation)

## [0.2.1-alpha] — 2026-08-02

### Fixed

- Launcher UI: controls and title stay visible (no `opacity: 0` / clipped-text vanish in WebView2)
- Launcher window drag on frameless chrome (`start-dragging` permission + drag regions)
- Launcher GitHub release check: clearer 404 guidance; publish releases non-draft
- Server: allow Windows Tauri origins `http://tauri.localhost` / `https://tauri.localhost`

### Changed

- Repo visibility public so the unauthenticated launcher can resolve `/releases/latest`
- Product version bump to `0.2.1-alpha`

## [2.0.0] — 2026-08-01

### Added

- Greenfield TypeScript monorepo (`@adv/client`, `@adv/server`, `@adv/desktop`, packages)
- Feature parity waves A–F (quests → tutorial/settings) and Social/Live (chat, friends, clan, leaderboard)
- Tauri 2 desktop shell with signed updater artifacts (`createUpdaterArtifacts`) and v2 `latest.json` feed
- Performance budgets + `FrameBudgetMonitor` visual degradation; `ObjectPool` / `DomPool` for floating combat text
- Accessibility basis checklist + static a11y gate + Playwright landmark smoke
- User migration tool `tools/migrate-v1-users` and cutover runbook `docs/cutover-v1.md`
- Player-facing patch notes `docs/patch-notes-2.0.0.md`
- Phase 9 v1 save importer: `@adv/protocol` `importV1Save`, Options UI import, `tools/migrate-v1-saves`
- Siegel-Portal launcher (`@adv/launcher`): portable ZIP download, Ed25519 verify, AppData install, thematic UI
- Release assets: `archiv-des-vergessens.zip` + `.sig` + `ArchivDesVergessens-Launcher.exe` alongside NSIS / `latest.json`

### Changed

- Cloud / root app version strings unified to `2.0.0`
- Release page default URL → `archiv-des-vergessens-2`
- `release.yml` builds portable package + launcher after the signed desktop updater feed

### Removed

- v1 Tauri Save-DB, Rust game loop, htm templates (by design of the rewrite)

[2.0.0]: https://github.com/Trobikus/archiv-des-vergessens-2/releases/tag/v2.0.0
