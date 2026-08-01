import { validateWsMessage, WS_EVENTS } from "@adv/protocol";
import type { WebSocket } from "ws";

import {
  handleAuthMessage,
  type AuthHandlerDeps,
} from "../modules/auth/handlers";
import {
  handleSaveMessage,
  type SaveHandlerDeps,
} from "../modules/save/handlers";
import { sendJson } from "./send";
import type { ClientSession } from "./session";

export type RouterDeps = AuthHandlerDeps & SaveHandlerDeps;

export function routeMessage(
  ws: WebSocket,
  raw: string,
  session: ClientSession,
  deps: RouterDeps,
): void {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw) as unknown;
  } catch {
    sendJson(ws, WS_EVENTS.ERROR, { message: "Ungültiges JSON-Format." });
    return;
  }

  const message = validateWsMessage(parsedJson);
  if (!message.ok) {
    sendJson(ws, WS_EVENTS.ERROR, { message: message.error });
    return;
  }

  const { type, payload } = message.value;
  if (handleAuthMessage(ws, type, payload, session, deps)) {
    return;
  }
  if (handleSaveMessage(ws, type, payload, session, deps)) {
    return;
  }
  sendJson(ws, WS_EVENTS.ERROR, {
    message: `Unbekannter Nachrichtentyp: ${type}`,
  });
}
