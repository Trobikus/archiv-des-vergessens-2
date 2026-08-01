/**
 * App display / cloud version — injected at Vite build time from the
 * workspace root `package.json` (see `vite.config.ts`).
 */
export function getAppVersion(): string {
  const viteEnv = (
    import.meta as ImportMeta & {
      readonly env: { readonly VITE_APP_VERSION?: string };
    }
  ).env;
  const fromEnv = viteEnv.VITE_APP_VERSION;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return "0.0.0-dev";
}

/** Replace `{version}` in an i18n template such as `Version {version}`. */
export function formatVersionLabel(template: string): string {
  return template.replaceAll("{version}", getAppVersion());
}
