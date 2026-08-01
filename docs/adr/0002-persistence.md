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
- Cloud saves from v1 are discarded; user table (PBKDF2 params identical) may migrate later

## Consequences

Desktop is a shell only. Offline play queues mutations until cloud sync (Phase 4).
Schema bumps must ship a discrete migration step; missing steps fail load validation.
