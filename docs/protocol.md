# Protocol (Phase 4)

Wire format:

```ts
type WsMessage = { type: string; payload: Record<string, unknown> };
```

Validators live in `@adv/protocol` (`validateWsMessage`, auth/cloud payload validators).

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

Chat / leaderboard / social events land in Phase 7.
