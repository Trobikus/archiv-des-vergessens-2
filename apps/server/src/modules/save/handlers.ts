import {
  MAX_CLOUD_SAVE_BYTES,
  migrateSaveEnvelope,
  validateCloudSavePayload,
  validatePhase2SavePayload,
  WS_EVENTS,
} from "@adv/protocol";
import type { WebSocket } from "ws";

import type { PreparedStatements } from "../../db/open";
import { sendJson } from "../../net/send";
import type { ClientSession } from "../../net/session";

export type SaveHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly cloudVersion: string;
};

function hasActiveRegisteredSession(
  session: ClientSession,
  stmts: PreparedStatements,
): boolean {
  if (
    session.userId === null ||
    session.sessionToken === null ||
    session.isGuest
  ) {
    return false;
  }
  const row = stmts.getUserBySession.get(
    session.userId,
    session.sessionToken,
  );
  return row !== undefined;
}

function requireRegisteredSession(
  ws: WebSocket,
  session: ClientSession,
  stmts: PreparedStatements,
  eventNamespace: string,
): boolean {
  if (hasActiveRegisteredSession(session, stmts)) {
    return true;
  }
  sendJson(ws, `${eventNamespace}:error`, {
    error: "Nicht authentifiziert oder Sitzung abgelaufen.",
  });
  return false;
}

export function handleSaveMessage(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
  session: ClientSession,
  deps: SaveHandlerDeps,
): boolean {
  switch (type) {
    case WS_EVENTS.CLOUD_SAVE: {
      if (
        !requireRegisteredSession(ws, session, deps.stmts, "cloud:save")
      ) {
        return true;
      }
      try {
        const parsed = validateCloudSavePayload(payload);
        if (!parsed.ok) {
          sendJson(ws, WS_EVENTS.CLOUD_SAVE_ERROR, { error: parsed.error });
          return true;
        }
        const migrated = migrateSaveEnvelope(parsed.value.envelope);
        if (!migrated.ok) {
          sendJson(ws, WS_EVENTS.CLOUD_SAVE_ERROR, { error: migrated.error });
          return true;
        }
        const phasePayload = validatePhase2SavePayload(migrated.value.payload);
        if (!phasePayload.ok) {
          sendJson(ws, WS_EVENTS.CLOUD_SAVE_ERROR, {
            error: phasePayload.error,
          });
          return true;
        }
        const saveDataStr = JSON.stringify(migrated.value);
        if (Buffer.byteLength(saveDataStr, "utf8") > MAX_CLOUD_SAVE_BYTES) {
          sendJson(ws, WS_EVENTS.CLOUD_SAVE_ERROR, {
            error: "Speicherstand zu groß.",
          });
          return true;
        }
        const timestamp = Date.now();
        const version = parsed.value.version ?? deps.cloudVersion;
        deps.stmts.upsertSave.run(
          session.userId,
          session.username,
          saveDataStr,
          version,
          timestamp,
        );
        sendJson(ws, WS_EVENTS.CLOUD_SAVE_SUCCESS, { timestamp });
      } catch {
        sendJson(ws, WS_EVENTS.CLOUD_SAVE_ERROR, {
          error: "Fehler beim Schreiben des Spielstands.",
        });
      }
      return true;
    }

    case WS_EVENTS.CLOUD_LOAD: {
      if (
        !requireRegisteredSession(ws, session, deps.stmts, "cloud:load")
      ) {
        return true;
      }
      try {
        const row = deps.stmts.getSave.get(session.userId) as
          | { saveData: string; version: string; timestamp: number }
          | undefined;
        if (row === undefined) {
          sendJson(ws, WS_EVENTS.CLOUD_LOAD_SUCCESS, { envelope: null });
          return true;
        }
        let parsedRaw: unknown;
        try {
          parsedRaw = JSON.parse(row.saveData) as unknown;
        } catch {
          sendJson(ws, WS_EVENTS.CLOUD_LOAD_SUCCESS, { envelope: null });
          return true;
        }
        if (parsedRaw === null) {
          sendJson(ws, WS_EVENTS.CLOUD_LOAD_SUCCESS, {
            userId: session.userId ?? undefined,
            timestamp: row.timestamp,
            envelope: null,
            version: row.version,
          });
          return true;
        }
        const migrated = migrateSaveEnvelope(parsedRaw);
        if (!migrated.ok) {
          sendJson(ws, WS_EVENTS.CLOUD_LOAD_SUCCESS, { envelope: null });
          return true;
        }
        sendJson(ws, WS_EVENTS.CLOUD_LOAD_SUCCESS, {
          userId: session.userId ?? undefined,
          timestamp: row.timestamp,
          envelope: migrated.value,
          version: row.version,
        });
      } catch {
        sendJson(ws, WS_EVENTS.CLOUD_LOAD_SUCCESS, { envelope: null });
      }
      return true;
    }

    default:
      return false;
  }
}
