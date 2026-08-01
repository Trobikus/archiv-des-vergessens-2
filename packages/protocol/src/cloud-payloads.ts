import {
  validateSaveEnvelope,
  type SaveEnvelope,
  type ValidationResult,
} from "./save-envelope";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const MAX_CLOUD_SAVE_BYTES = 240 * 1024;

export type CloudSavePayload = {
  readonly envelope: SaveEnvelope;
  readonly version?: string;
};

export type CloudSaveSuccessPayload = {
  readonly timestamp: number;
};

export type CloudLoadSuccessPayload = {
  readonly userId?: string;
  readonly timestamp?: number;
  readonly envelope: SaveEnvelope | null;
  readonly version?: string;
};

export type CloudErrorPayload = {
  readonly error: string;
};

export function validateCloudSavePayload(
  value: unknown,
): ValidationResult<CloudSavePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }

  const envelopeResult = validateSaveEnvelope(value["envelope"]);
  if (!envelopeResult.ok) {
    return { ok: false, error: `envelope: ${envelopeResult.error}` };
  }

  const versionRaw = value["version"];
  if (versionRaw === undefined) {
    return { ok: true, value: { envelope: envelopeResult.value } };
  }
  if (typeof versionRaw !== "string") {
    return { ok: false, error: "version must be a string" };
  }
  return {
    ok: true,
    value: { envelope: envelopeResult.value, version: versionRaw },
  };
}

export function validateCloudSaveSuccessPayload(
  value: unknown,
): ValidationResult<CloudSaveSuccessPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const timestamp = value["timestamp"];
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return { ok: false, error: "timestamp must be a finite number" };
  }
  return { ok: true, value: { timestamp } };
}

export function validateCloudLoadSuccessPayload(
  value: unknown,
): ValidationResult<CloudLoadSuccessPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }

  const envelopeRaw = value["envelope"];
  if (envelopeRaw === null || envelopeRaw === undefined) {
    const result: CloudLoadSuccessPayload = { envelope: null };
    const userId = value["userId"];
    const timestamp = value["timestamp"];
    const version = value["version"];
    if (typeof userId === "string") {
      (result as { userId?: string }).userId = userId;
    }
    if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
      (result as { timestamp?: number }).timestamp = timestamp;
    }
    if (typeof version === "string") {
      (result as { version?: string }).version = version;
    }
    return { ok: true, value: result };
  }

  const envelope = validateSaveEnvelope(envelopeRaw);
  if (!envelope.ok) {
    return { ok: false, error: `envelope: ${envelope.error}` };
  }

  const result: CloudLoadSuccessPayload = { envelope: envelope.value };
  const userId = value["userId"];
  const timestamp = value["timestamp"];
  const version = value["version"];
  if (typeof userId === "string") {
    (result as { userId?: string }).userId = userId;
  }
  if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
    (result as { timestamp?: number }).timestamp = timestamp;
  }
  if (typeof version === "string") {
    (result as { version?: string }).version = version;
  }
  return { ok: true, value: result };
}

export function validateCloudErrorPayload(
  value: unknown,
): ValidationResult<CloudErrorPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const error = value["error"];
  if (typeof error !== "string" || error.length === 0) {
    return { ok: false, error: "error is required" };
  }
  return { ok: true, value: { error } };
}
