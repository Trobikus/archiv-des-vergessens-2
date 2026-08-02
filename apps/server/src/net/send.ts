import type { WebSocket } from "ws";

export function sendJson(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
): void {
  if (ws.readyState !== ws.OPEN) {
    return;
  }
  ws.send(JSON.stringify({ type, payload }));
}

export function broadcastJson(
  clients: Iterable<WebSocket>,
  type: string,
  payload: Record<string, unknown>,
): void {
  for (const client of clients) {
    sendJson(client, type, payload);
  }
}

export function sendToUserIds(
  forEachSession: (
    fn: (ws: WebSocket, session: { userId: string | null }) => void,
  ) => void,
  userIds: ReadonlySet<string> | readonly string[],
  type: string,
  payload: Record<string, unknown>,
): void {
  const targets =
    userIds instanceof Set ? userIds : new Set(userIds);
  if (targets.size === 0) {
    return;
  }
  forEachSession((ws, session) => {
    if (session.userId !== null && targets.has(session.userId)) {
      sendJson(ws, type, payload);
    }
  });
}
