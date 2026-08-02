---
name: server-module
description: Implements or fixes apps/server WebSocket modules (auth, save, chat, friends, guild, leaderboard), SQLite schema, and router wiring. Use for live server changes.
paths:
  - "apps/server/**"
---

# Skill: Server module

## Read first

- `apps/server/src/main.ts`
- `apps/server/src/net/router.ts`
- `apps/server/src/net/session.ts`
- `apps/server/src/db/schema.ts`
- `apps/server/src/modules/<domain>/handlers.ts`
- Matching validators in `@adv/protocol`

## Patterns

1. Router order matters — follow existing chain (auth → save → chat → leaderboard → friends → guild → error).
2. Handlers: validate payload → authz checks → DB → `sendJson` with `WS_EVENTS.*`.
3. Dependencies allowed: `@adv/core`, `@adv/protocol`, `ws`, `better-sqlite3` only.
4. **Never** import `@adv/sim` or `@adv/content` into the server.
5. PBKDF2 parameters in `db/schema.ts` are frozen (100_000 / 64 / sha512).
6. Prefer prepared statements / existing DB helpers; keep schema changes additive and documented.
7. Rate limits / guest restrictions: copy from auth/save modules, do not invent weaker rules.

## Do not

- Add a Rust/Tauri persistence path
- Simulate Clan on the server
- Accept unvalidated `payload` blobs into SQLite

## Verify

```bash
npx vitest run apps/server
npm run typecheck
npm run lint
```
