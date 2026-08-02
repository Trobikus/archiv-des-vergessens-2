# Protocol (Phase 4 + Phase 7)

Wire format:

```ts
type WsMessage = { type: string; payload: Record<string, unknown> };
```

Validators live in `@adv/protocol` (`validateWsMessage`, auth/cloud/social payload validators).

## Auth events

| Event | Dir | Payload |
|---|---|---|
| `auth` | C→S | `{ userId, username }` guest handshake |
| `auth:success` | S→C | `{ userId, username }` |
| `auth:error` | S→C | `{ message }` |
| `auth:register` | C→S | `{ username, email, password, avatar? }` |
| `auth:register:success` | S→C | `{ user, token }` |
| `auth:register:error` | S→C | `{ error, message?, retryAfter? }` |
| `auth:login` | C→S | `{ usernameOrEmail, password }` |
| `auth:login:success` | S→C | `{ user, token }` |
| `auth:login:error` | S→C | `{ error }` |
| `auth:verifyToken` | C→S | `{ userId, token }` |
| `auth:verifyToken:success` | S→C | `{ user, token }` |
| `auth:verifyToken:error` | S→C | `{ error }` |
| `auth:convertGuest` | C→S | `{ guestId, username, email, password, avatar? }` |
| `auth:convertGuest:success` | S→C | `{ user, token, migrated: { save, leaderboard } }` |
| `auth:convertGuest:error` | S→C | `{ error, message?, retryAfter? }` |

PBKDF2 (server authority, identical to v1): 100_000 iterations, keylen 64, digest `sha512`, max password 128.

After any successful auth handshake the server also pushes chat history (as `chat:globalMessage` frames) and `leaderboard:update`.

## Cloud events

| Event | Dir | Payload |
|---|---|---|
| `cloud:save` | C→S | `{ envelope: SaveEnvelope, version? }` |
| `cloud:save:success` | S→C | `{ timestamp }` |
| `cloud:save:error` | S→C | `{ error }` |
| `cloud:load` | C→S | `{}` |
| `cloud:load:success` | S→C | `{ userId?, timestamp?, envelope, version? }` |
| `cloud:load:error` | S→C | `{ error }` |

Server validates envelope + Phase2 payload before upsert. Size cap: 240 KiB. Guests cannot cloud-save.

## Chat events (Phase 7)

| Event | Dir | Payload |
|---|---|---|
| `chat:global` | C→S | `{ message }` (sanitized ≤200, requires session `userId`) |
| `chat:globalMessage` | S→C (broadcast) | `{ id, player, message, timestamp, type: "global" }` |
| `chat:guild` | C→S | `{ message }` — registered + guild member |
| `chat:guildMessage` | S→C (guild members) | `{ id, player, message, timestamp, type: "guild", guildId }` |
| `chat:getHistory` | C→S | `{ guildId?: string \| null }` |
| `chat:history` | S→C | `{ messages: ChatMessage[] }` (last 50 global or guild) |
| `chat:error` | S→C | `{ error }` |

Guild history requires an active registered session and membership in `guildId`. Chat send fails closed when offline (no local fake messages).

## Leaderboard events (Phase 7)

| Event | Dir | Payload |
|---|---|---|
| `leaderboard:submit` | C→S | `{ prestige, bosses, level }` — registered session only |
| `leaderboard:get` | C→S | `{}` |
| `leaderboard:update` | S→C | `{ entries: LeaderboardEntry[] }` top 10 |
| `leaderboard:error` | S→C | `{ error }` |

Server clamps values, rejects implausible jumps (+50 prestige / +200 bosses / +1000 level), and upserts with `MAX()`. Rank: prestige DESC, bosses DESC, level DESC.

## Friends events (Phase 7 multiplayer)

| Event | Dir | Payload |
|---|---|---|
| `friend:request` | C→S | `{ username }` — registered only |
| `friend:accept` / `friend:decline` / `friend:cancel` / `friend:remove` | C→S | `{ username }` |
| `friend:list` | C→S | `{}` |
| `friend:update` | S→C | `{ list, pending, sent }` |
| `friend:error` | S→C | `{ error }` |

Server tables: `friend_requests`, `friendships`. Cap: 50 friends. Registered session + open WebSocket required; no client-side simulation.

## Guild events (Phase 7 multiplayer)

| Event | Dir | Payload |
|---|---|---|
| `guild:create` | C→S | `{ name }` (≥3 chars) |
| `guild:invite` / `guild:kick` | C→S | `{ username }` — owner only for invite/kick |
| `guild:acceptInvite` / `guild:declineInvite` | C→S | `{ guildId }` |
| `guild:leave` / `guild:disband` / `guild:get` | C→S | `{}` |
| `guild:update` | S→C | `{ guild, members, invites, outgoingInvites }` |
| `guild:error` | S→C | `{ error }` |

Server tables: `guilds`, `guild_members` (one guild per user), `guild_invites`. Cap: 20 members. NPC Clan idle gameplay remains a separate local save-slice (`clan`).
