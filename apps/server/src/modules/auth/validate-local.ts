export function sanitizeText(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") {
    return "";
  }
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim()
    .substring(0, maxLength);
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length >= 6 && email.length <= 254;
}

export function isValidUsernameChars(username: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(username);
}
