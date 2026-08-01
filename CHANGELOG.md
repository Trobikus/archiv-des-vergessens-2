# Changelog

All notable changes to Archiv des Vergessens v2 are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
project follows [Semantic Versioning](https://semver.org/).

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
