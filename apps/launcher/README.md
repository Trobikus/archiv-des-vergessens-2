# @adv/launcher

Standalone **Siegel-Portal** launcher for Archiv des Vergessens v2.

This is the **only player-facing EXE**. It asks for an install directory, downloads
the signed portable ZIP from GitHub Releases, verifies the Ed25519 signature,
extracts into the chosen folder (default `%APPDATA%\ArchivDesVergessens\app\`),
optionally creates a **Desktop shortcut to the launcher**, and starts the game.

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
- `src-tauri/` — path picker / download / verify / extract / shortcut / launch

## Release assets expected

| Asset | Role |
|---|---|
| `ArchivDesVergessens-Launcher.exe` | Player download (this launcher) |
| `archiv-des-vergessens.zip` | Portable game (`ArchivDesVergessens.exe`) |
| `archiv-des-vergessens.zip.sig` | Hex Ed25519 signature |

No NSIS / Windows setup EXE is published. Updates go through this launcher.

Signing uses `tools/sign_release.mjs` + secret `ED25519_PRIVATE_KEY`
(64-char hex seed; must match `RELEASE_PUBKEY_HEX` in `src-tauri/src/main.rs`).
