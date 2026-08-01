# Migrate v1 users → v2

Copies **only** the `users` table (PBKDF2 hashes/salts identical). Cloud saves, leaderboard, and chats are **not** migrated.

## Safety

1. Copy the v1 `database.db` first — never point `--source` at the live production file without a backup.
2. Default is **dry-run** (read-only source, no target writes).
3. `sessionToken` is always set to `NULL` so users re-login on v2.

## Usage

```bash
# Dry-run report
node tools/migrate-v1-users/migrate-v1-users.mjs \
  --source path/to/v1-copy/database.db \
  --target apps/server/data/database.db

# Apply inserts (skip duplicates unless --force)
node tools/migrate-v1-users/migrate-v1-users.mjs \
  --source path/to/v1-copy/database.db \
  --target apps/server/data/database.db \
  --apply
```
