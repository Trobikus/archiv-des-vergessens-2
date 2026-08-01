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
