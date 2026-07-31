export const SAVE_SCHEMA_VERSION = 1 as const;

export type SaveEnvelope = {
  readonly schemaVersion: typeof SAVE_SCHEMA_VERSION;
  readonly savedAt: number;
  readonly payload: unknown;
};

export type ValidationOk<T> = { readonly ok: true; readonly value: T };
export type ValidationErr = { readonly ok: false; readonly error: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationErr;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateSaveEnvelope(
  value: unknown,
): ValidationResult<SaveEnvelope> {
  if (!isRecord(value)) {
    return { ok: false, error: "envelope must be an object" };
  }

  if (value["schemaVersion"] !== SAVE_SCHEMA_VERSION) {
    return { ok: false, error: "unsupported schemaVersion" };
  }

  const savedAt = value["savedAt"];
  if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) {
    return { ok: false, error: "savedAt must be a finite number" };
  }

  if (!("payload" in value)) {
    return { ok: false, error: "payload is required" };
  }

  return {
    ok: true,
    value: {
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt,
      payload: value["payload"],
    },
  };
}
