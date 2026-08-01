# @adv/launcher

Standalone **Siegel-Portal** launcher for Archiv des Vergessens v2.

Downloads the signed portable ZIP from GitHub Releases, verifies the Ed25519
signature, extracts into `%APPDATA%\ArchivDesVergessens\app\`, and starts the game.

## Commands

```powershell
# From repo root
npm run launcher:dev      # Tauri window with ui/
npm run launcher:build    # release EXE (no NSIS bundle)
npm run clippy -w @adv/launcher
```

Output EXE:

`apps/launcher/src-tauri/target/release/archiv-launcher.exe`

Release renames it to `ArchivDesVergessens-Launcher.exe`.

## Layout

- `ui/` — frameless Siegel-Portal front-end (`withGlobalTauri`)
- `src-tauri/` — download / verify / extract / launch commands

## Release assets expected

| Asset | Role |
|---|---|
| `archiv-des-vergessens.zip` | Portable game (`ArchivDesVergessens.exe`) |
| `archiv-des-vergessens.zip.sig` | Hex Ed25519 signature |
| `ArchivDesVergessens-Launcher.exe` | This launcher |

Signing uses `tools/sign_release.cjs` + secret `ED25519_PRIVATE_KEY` (same key as v1).
