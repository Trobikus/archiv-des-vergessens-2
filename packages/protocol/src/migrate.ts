import {
  SAVE_SCHEMA_VERSION,
  type SaveEnvelope,
  type ValidationResult,
  validateSaveEnvelope,
} from "./save-envelope";

export type SaveMigration = {
  readonly from: number;
  readonly to: number;
  readonly migrate: (payload: unknown) => unknown;
};

/**
 * Migration table. Schema 1 uses identity so the runner API exists from day one.
 * Future versions append discrete `from -> from+1` steps.
 */
export const SAVE_MIGRATIONS: readonly SaveMigration[] = [
  {
    from: 1,
    to: 1,
    migrate: (payload) => payload,
  },
];

/**
 * Validate envelope and run migrations up to `SAVE_SCHEMA_VERSION`.
 */
export function migrateSaveEnvelope(
  value: unknown,
): ValidationResult<SaveEnvelope> {
  const validated = validateSaveEnvelope(value);
  if (!validated.ok) {
    return validated;
  }

  let payload = validated.value.payload;
  for (const step of SAVE_MIGRATIONS) {
    if (
      step.from === validated.value.schemaVersion &&
      step.to === SAVE_SCHEMA_VERSION
    ) {
      payload = step.migrate(payload);
    }
  }

  return {
    ok: true,
    value: {
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: validated.value.savedAt,
      payload,
    },
  };
}
