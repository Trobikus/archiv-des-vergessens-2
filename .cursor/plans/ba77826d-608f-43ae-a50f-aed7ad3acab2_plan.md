# Phase 5 — Tauri-Shell + Playwright + Updater 2.0.0

## Goal

Desktop-Shell ohne Save-DB/Game-Loop; Identifier + Updater-Key aus v1; Playwright-Smoke; App-Version `2.0.0`; DoD inkl. `cargo clippy -D warnings`.

## Approach

- Tauri 2 in `apps/desktop/src-tauri/`, lädt `@adv/client` (dev: `http://localhost:5173`, build: `apps/client/dist`)
- Rust nur Shell: `quit_app`, `show_main_window`, `open_release_page` + Safe-Quit (`CloseRequested` → `app:quit-requested` + 4s Force-Quit)
- Playwright smoketestet den **Web-Build** via `vite preview` (kein tauri-driver)
- Gate: clippy + e2e konditional (skip ohne cargo/browser); CI bekommt eigene Jobs `desktop` + `e2e`
- Version: Tauri/Cargo/`@adv/desktop` = `2.0.0`; Root + Cloud-Strings = `2.0.0-phase5` (Phasen-Konvention)

## Out of scope

- rusqlite / Save-DB / game_loop / v1-Launcher
- Signierte Release-Bundles / `createUpdaterArtifacts` (Phase 8)
- Git-Tag `v2-phase5` (User setzt nach Playtest)

---

## Work steps

### 1. Desktop package

**Modify** `apps/desktop/package.json`:
- version `2.0.0`
- scripts: `tauri`, `dev`, `build`, `clippy`
- devDependency `@tauri-apps/cli` ^2

**Modify** `apps/desktop/README.md` — Dev/Build/Clippy + Shell-Scope.

### 2. Tauri Rust crate (`apps/desktop/src-tauri/`)

| File | Purpose |
|------|---------|
| `Cargo.toml` | crate `adv-desktop` v2.0.0; deps tauri/process/updater/opener; **kein** rusqlite |
| `build.rs` | `tauri_build::build()` |
| `src/main.rs` | windows_subsystem + `adv_desktop_lib::run()` |
| `src/lib.rs` | plugins + CloseRequested safe-quit + invoke_handler |
| `src/commands/mod.rs` | `quit_app`, `show_main_window`, `open_release_page` + URL-Validation (+ unit test) |
| `tauri.conf.json` | siehe Key values |
| `capabilities/default.json` | core/updater/process/opener |
| `icons/*` | Copy aus v1 `src-tauri/icons/` |

**Key `tauri.conf.json` values:**
- `identifier`: `com.grimoire.archivdesvergessens`
- `version`: `2.0.0`
- `devUrl`: `http://localhost:5173`
- `frontendDist`: `../../client/dist`
- `beforeDevCommand` / `beforeBuildCommand`: `npm run dev:client` / `npm run build` mit `cwd: "../../.."`
- Updater pubkey + endpoint aus v1 (GitHub `archiv-des-vergessens` latest.json)
- `bundle.active` / `createUpdaterArtifacts`: `false`
- Window: 1280×800, min 1024×700, fullscreen, label `main`, `withGlobalTauri: true`

### 3. Client Safe-Quit

**Create** `apps/client/src/services/desktop-shell.ts`:
- `isDesktop()`, `initDesktopShell(session)` → listen `app:quit-requested` → `session.quitGame()`
- typed `__TAURI__` (kein `@tauri-apps/api` nötig)

**Modify** `apps/client/src/ui/App.tsx` boot-effect:
- nach `setSession(next)` → `initDesktopShell(next)`
- Cleanup unlisten + destroy

`game-session.quitGame()` bleibt (`invoke("quit_app")`).

### 4. Playwright (`tools/e2e/`)

**Create:**
- `package.json` (`@adv/e2e`, `@playwright/test`)
- `playwright.config.ts` — chromium, `webServer` = client preview port `4317`
- `tests/smoke.spec.ts`
- `tsconfig.json`
- Update `README.md`

**Smoke asserts:**
1. Title `Archiv des Vergessens`
2. `[data-testid="intro-view"]` sichtbar
3. `[data-testid="intro-skip"]` klickbar (Boot fertig offline)
4. `[data-testid="login-view"]` sichtbar
5. Keine `pageerror`s

Kein laufender Server nötig (Offline-Boot → Login).

### 5. Root scripts + Gate + CI

**Modify** root `package.json`:
- version → `2.0.0-phase5`
- scripts: `tauri:dev`, `clippy`, `e2e`

**Modify** `tools/gates/gate.mjs`:
- nach bestehenden Steps: `clippy` wenn `cargo` vorhanden und `SKIP_CLIPPY≠1`
- `e2e` wenn Playwright-Browser da und `SKIP_E2E≠1`

**Modify** `.github/workflows/ci.yml`:
- Job `desktop`: Rust toolchain + clippy + Linux WebKit deps + `npm run clippy -w @adv/desktop`
- Job `e2e`: build client + `playwright install --with-deps chromium` + `npm run e2e`

**Modify** `eslint.config.js` — ignore `tools/e2e/**`.

### 6. Version strings (Cloud)

Bump `2.0.0-phase4` → `2.0.0-phase5` in:
- `apps/server/src/config.ts`
- `apps/server/src/modules/auth/handlers.ts`
- `apps/client/src/services/cloud-sync-service.ts`
- zugehörige Tests (`auth-cloud.test.ts`, protocol tests)

### 7. Docs

- `docs/playtest-checklist.md` — Phase-5-Abschnitt
- `docs/REWRITE_PLAN.md` — Phase 5 Status + Erledigt-Liste

---

## Verification

```powershell
npm ci
npm run gate
npm run clippy -w @adv/desktop
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
npx playwright install chromium
npm run build -w @adv/client
npm run e2e
npm run tauri:dev   # manuell: Quit + Fenster-X → Save + Exit
```

DoD: gate grün + clippy `-D warnings` + e2e grün + Playtest-Checkliste abhakbar. Tag `v2-phase5` durch User.

## Critical files

| Path | Action |
|------|--------|
| `apps/desktop/package.json` | replace stub |
| `apps/desktop/src-tauri/**` | create (Tauri shell) |
| `apps/client/src/services/desktop-shell.ts` | create |
| `apps/client/src/ui/App.tsx` | wire shell |
| `tools/e2e/**` | create Playwright |
| `tools/gates/gate.mjs` | clippy + e2e |
| `.github/workflows/ci.yml` | desktop + e2e jobs |
| `package.json` | scripts + version |
| Cloud version call sites | phase5 bump |
| `docs/playtest-checklist.md`, `docs/REWRITE_PLAN.md` | Phase 5 |

## Risk notes

- Updater-Endpoint zeigt bewusst auf v1-Release-Feed (Cutover Phase 8)
- E2E deckt Web-Frontend ab, nicht die native Window-IPC (dafür clippy + manueller `tauri:dev`)
