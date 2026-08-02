# v1 → v2 Cutover

Procedure for switching production from `archiv-des-vergessens` (v1) to
`archiv-des-vergessens-2` (v2 / Release 2.0.0).

## Preconditions

1. `npm run gate` green on the release commit (enforced by `.githooks/pre-push`
   when pushing `v*.*.*` tags; release workflow does **not** re-run the gate)
2. Desktop updater endpoint points at
   `https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest/download/latest.json`
3. Signing secrets available in GitHub Actions:
   - `ED25519_PRIVATE_KEY` (portable ZIP: 64-char hex seed matching launcher pubkey)
4. Fresh backup of the live v1 `database.db`

## Account migration

Only the `users` table (PBKDF2 hashes/salts) is copied. Cloud saves, chat, and
leaderboard are **not** migrated.

```bash
# Always dry-run first
node tools/migrate-v1-users/migrate-v1-users.mjs \
  --source path/to/v1-copy/database.db \
  --target apps/server/data/database.db

# Apply
node tools/migrate-v1-users/migrate-v1-users.mjs \
  --source path/to/v1-copy/database.db \
  --target apps/server/data/database.db \
  --apply
```

Users must re-login (`sessionToken` cleared).

## Desktop updater cutover

1. Tag `v2.0.0` (or next SemVer) → `release.yml` builds portable
   `archiv-des-vergessens-2.zip` / `.sig` / `ArchivDesVergessens2-Launcher.exe`
   (no NSIS / Windows setup EXE)
2. Publish the GitHub Release (draft → public)
3. Point players at the **v2 Siegel-Portal launcher** (`ArchivDesVergessens2-Launcher.exe`)
   from the v2 release (or announce the new download URL). v1 clients keep using the
   v1 feed until they install via the new launcher.
4. Portable installs land in the folder chosen in the launcher (default
   `%APPDATA%\ArchivDesVergessens2\app\`) and are updated by the launcher.

## Server cutover

1. Deploy `@adv/server` with `CLOUD_SAVE_VERSION=2.0.0`
2. Keep v1 server reachable in read-only / announce mode until traffic drains
3. Point DNS / reverse-proxy WS endpoint at v2
4. Announce Discord / in-game: accounts reuse password; cloud saves are fresh by default.
   Players can import a local v1 JSON dump via **Options → v1-Spielstand importieren**
   or `tools/migrate-v1-saves` (see `docs/save-format.md`).

## Rollback

- Re-point WS DNS to v1
- Do **not** re-merge migrated users into v1 without a backup restore
- Desktop: leave the previous GitHub Release as `latest` if a bad build ships
