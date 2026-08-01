import { DE } from "./de";
import { EN } from "./en";

export type I18nKey = keyof typeof DE;

export function listI18nKeys(): readonly I18nKey[] {
  return Object.keys(DE) as I18nKey[];
}

export function assertI18nKeyParity(): void {
  const deKeys = Object.keys(DE).sort();
  const enKeys = Object.keys(EN).sort();
  const missingInEn = deKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(EN, key),
  );
  const missingInDe = enKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(DE, key),
  );
  if (missingInEn.length > 0 || missingInDe.length > 0) {
    throw new Error(
      `i18n key mismatch: missingInEn=${missingInEn.join(",")} missingInDe=${missingInDe.join(",")}`,
    );
  }
}
