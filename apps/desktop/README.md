# @adv/desktop

Tauri 2 shell for Archiv des Vergessens — window, updater plugin, and `quit_app` only.

**Not in scope:** local Save-DB, Rust game loop, rusqlite.

## Commands

```powershell
# From repo root
npm run tauri:dev          # Vite client + Tauri window
npm run clippy             # cargo clippy -D warnings
npm run build -w @adv/desktop   # production shell (needs client build)
```

## Layout

- `src-tauri/` — Rust crate + `tauri.conf.json`
- Loads `@adv/client` via `devUrl` (5173) or `frontendDist` (`apps/client/dist`)

## Identifier / updater

Ported from v1: `com.grimoire.archivdesvergessens2` + minisign pubkey.
Player distribution is **launcher + portable ZIP** (no NSIS setup EXE).
`bundle.active` / `createUpdaterArtifacts` stay off — same model as v1.
Optional in-app updater config may remain for future use; release workflow:
`.github/workflows/release.yml`.

## Desktop feel (browser chrome lockdown)

Release/dev shell configs:

- `dragDropEnabled: false` — no file drops into the webview
- `zoomHotkeysEnabled: false` — no Ctrl± page zoom
- `browserExtensionsEnabled: false` — no WebView browser extensions
- capability deny for `internal-toggle-devtools`

The client installs `installDesktopLockdown()` on boot when `__TAURI__` is present
(or `?lockdown=1` for browser smoke tests). That blocks context menu, reload,
zoom wheel, DevTools shortcuts, and back-navigation keys — while leaving Escape
and text-field editing alone.

## After quit in `tauri:dev`

Harmless Windows/dev noise you may see in the CMD window:

- `Failed to unregister class Chrome_WidgetWin_0. Error = 1412` — WebView2/Chromium teardown race
- `npm error … Lifecycle script dev failed` / exit `4294967295` — Tauri stops the Vite `beforeDevCommand`; npm reports that kill as failure

Neither means the game crashed or that the save failed. Packaged builds (`tauri build`) do not run Vite, so those npm lines do not appear there.
