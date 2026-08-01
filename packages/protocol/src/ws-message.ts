import type { ValidationResult } from "./save-envelope";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type WsMessage = {
  readonly type: string;
  readonly payload: Record<string, unknown>;
};

export function validateWsMessage(value: unknown): ValidationResult<WsMessage> {
  if (!isRecord(value)) {
    return { ok: false, error: "message must be an object" };
  }

  const type = value["type"];
  if (typeof type !== "string" || type.length === 0) {
    return { ok: false, error: "type must be a non-empty string" };
  }

  const rawPayload = value["payload"];
  if (rawPayload === undefined) {
    return {
      ok: true,
      value: { type, payload: {} },
    };
  }

  if (!isRecord(rawPayload)) {
    return { ok: false, error: "payload must be an object" };
  }

  return {
    ok: true,
    value: { type, payload: rawPayload },
  };
}
