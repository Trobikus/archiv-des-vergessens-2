import {
  SAVE_SCHEMA_VERSION,
  type SaveEnvelope,
} from "./save-envelope";

export function createSaveEnvelope(
  payload: unknown,
  savedAt: number = Date.now(),
): SaveEnvelope {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAt,
    payload,
  };
}
