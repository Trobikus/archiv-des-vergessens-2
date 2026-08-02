# @adv/launcher

Standalone **Siegel-Portal** launcher for Archiv des Vergessens v2.

This is the **only player-facing EXE**. It asks for an install directory, downloads
the signed portable ZIP from GitHub Releases, verifies the Ed25519 signature,
extracts into the chosen folder (default `%APPDATA%\ArchivDesVergessens2\app\`),
writes **`Deinstallieren.cmd`** into that folder, optionally creates a **Desktop
shortcut to the launcher**, and starts the game.

v2 paths, identifiers, and binary names are fully isolated from v1
(`%APPDATA%\ArchivDesVergessens\` is rejected as an install target).

`Deinstallieren.cmd` removes the portable install directory, v2 launcher config
under `%APPDATA%\ArchivDesVergessens2\`, and the desktop shortcut — never v1 data.

## Commands

```powershell
# From repo root
npm run launcher:dev      # Tauri window with ui/
npm run launcher:build    # release EXE (no NSIS bundle)
npm run clippy -w @adv/launcher
```

Output EXE:

`apps/launcher/src-tauri/target/release/archiv-launcher.exe`

Release renames it to `ArchivDesVergessens2-Launcher.exe`.

## Layout

- `ui/` — frameless Siegel-Portal front-end (`withGlobalTauri`)
- `src-tauri/` — path picker / download / verify / extract / shortcut / launch

## Release assets expected

| Asset | Role |
|---|---|
| `ArchivDesVergessens2-Launcher.exe` | Player download (this launcher) |
| `archiv-des-vergessens-2.zip` | Portable game (`ArchivDesVergessens2.exe`) |
| `archiv-des-vergessens-2.zip.sig` | Hex Ed25519 signature |

No NSIS / Windows setup EXE is published. Updates go through this launcher.

Signing uses `tools/sign_release.mjs` + secret `ED25519_PRIVATE_KEY`
(64-char hex seed; must match `RELEASE_PUBKEY_HEX` in `src-tauri/src/main.rs`).

## Requirements

- The GitHub repository must be **public** (the launcher calls
  `/repos/.../releases/latest` without a token).
- The release must be **published** (not draft) and not only a prerelease, or
  `/releases/latest` returns 404.
