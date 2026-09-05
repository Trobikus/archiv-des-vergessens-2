# ADR 0003: Server-less singleplayer pivot

## Status

Accepted (Post-Rewrite pivot, September 2026)

## Context

The rewrite shipped with a Node WebSocket server (`apps/server`): auth/accounts, cloud-save sync, global chat, friends, guild, leaderboard (SQLite via `better-sqlite3`). The public game server has been shut down. The studio positioning (see the game page on grimoire-interactive.de) is **Incremental RPG · Singleplayer · 2D · Offline Progression** — one hero, deterministic auto-combat, offline progression, meaningful decisions.

Keeping dead live-service code would contradict that positioning and every future feature decision.

## Decision

- The game is **singleplayer, fully offline**. There is no game server, no accounts, no cloud sync.
- Removed: `apps/server`, the client WS/auth/cloud/social services (`ws-client`, `auth-service`, `cloud-sync-service`, `chat-service`, `friend-service`, `guild-service`, `leaderboard-service`), the live-social UI (chat / friends / guild / leaderboard panels, login screen, account badge), `tools/migrate-v1-users`, `deploy/` proxy configs, and the auth/cloud/WS payload modules in `@adv/protocol`.
- The client boots straight into local play (intro → character select). Every player is a local identity; autosave applies to all players.
- **Kept:** the local NPC clan (Idle / Raid / Expedition) as the only social system; the save envelope + `schemaVersion` contract unchanged (existing saves keep loading — including their dormant `friends`/`leaderboard` slices with default values); `importV1Save`; the launcher/desktop shells and release pipeline.
- The studio website description is the **golden goal** for future development.

## Consequences

- The save payload carries a single local slice set — the dormant `friends`/`leaderboard` slices, chat/guild runtime state, and the guest slot indirection were removed in a follow-up cleanup (no players existed, so no migration was needed; pre-pivot payloads still load, unknown keys are ignored and dropped on the next save). `schemaVersion` stays `1`.
- New systems must not invent live services or fake online success paths.
- `docs/protocol.md` describes the historical WS contract and is kept for reference only.
