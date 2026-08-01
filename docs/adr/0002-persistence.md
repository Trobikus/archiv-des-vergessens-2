# ADR 0002: Persistence strategy

## Status

Accepted (Phase 0)

## Context

v1 stores saves in multiple places (including Tauri rusqlite). That split caused sync and ownership ambiguity.

## Decision

- One Save-Envelope + codec (`schemaVersion: 1`, breaking)
- Server SQLite is account authority
- IndexedDB is client cache / offline queue
- No Tauri-rusqlite for game saves
- Envelope + `schemaVersion` contract from Phase 0; `migrateSaveEnvelope` runner from Phase 2 (identity for schema 1; append steps on bumps)
- Cloud saves from v1 are not auto-migrated on the server; user table (PBKDF2 params identical) may migrate via `tools/migrate-v1-users`
- Phase 9: optional client/CLI import via `importV1Save` (v1 JSON → v2 envelope); not part of `migrateSaveEnvelope`

## Consequences

Desktop is a shell only. Offline play queues mutations until cloud sync (Phase 4).
Schema bumps must ship a discrete migration step; missing steps fail load validation.
v1→v2 progress recovery is an explicit import path (Options / `tools/migrate-v1-saves`), not a silent schema migration.
