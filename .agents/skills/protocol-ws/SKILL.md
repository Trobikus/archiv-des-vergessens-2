---
name: protocol-ws
description: Changes WebSocket protocol events, payloads, and validators in @adv/protocol and matching client/server handlers. Use when adding or fixing auth, cloud, chat, friends, guild, or leaderboard wire contracts.
paths:
  - "packages/protocol/**"
  - "apps/server/**"
  - "apps/client/src/services/**"
  - "docs/protocol.md"
---

# Skill: Protocol / WebSocket

## Read first

- `docs/protocol.md`
- `packages/protocol/src/events.ts`
- Matching `*-payloads.ts` / `ws-message.ts`
- Client: `apps/client/src/services/ws-client.ts` + domain `*-service.ts`
- Server: `apps/server/src/net/router.ts` + `modules/<domain>/handlers.ts`

## Rules

1. Add event name constants to `WS_EVENTS` — never hardcode raw strings in call sites when a constant exists.
2. Naming: `domain:action` and `domain:action:success` / `:error` as peers do.
3. Write/extend **hand-rolled** validators returning `ValidationResult<T>`:
   - `{ ok: true, value }` / `{ ok: false, error }`
   - **No zod** (ADR 0001)
4. Update **both** sides:
   - Client sender/handler
   - Server router module handler
   - Tests (`packages/protocol` + client/server tests)
5. Fail closed when offline for social send paths (no fake local success for chat/friends/guild).
6. Guests cannot cloud-save; respect existing auth gates.

## Social ownership reminder

| Feature | Owner |
|---|---|
| Friends, Guild, Chat, Leaderboard | Live WS + server DB |
| NPC Clan | Client save only |

## Verify

```bash
npx vitest run packages/protocol
npx vitest run apps/client/src/services/<domain>
npx vitest run apps/server
npm run typecheck
```
