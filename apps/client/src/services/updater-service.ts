import { createLogger } from "@adv/core";

const log = createLogger("updater");

export type UpdateCheckResult =
  | { readonly status: "unsupported" }
  | { readonly status: "up-to-date" }
  | { readonly status: "available"; readonly version: string }
  | { readonly status: "error"; readonly message: string };

type TauriUpdate = {
  readonly available?: boolean;
  readonly version?: string;
  downloadAndInstall?: (
    onEvent?: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }) => void,
  ) => Promise<void>;
};

type TauriUpdaterApi = {
  readonly check?: () => Promise<TauriUpdate | null | undefined>;
};

type TauriGlobal = {
  readonly updater?: TauriUpdaterApi;
  readonly core?: {
    readonly invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
};

function getUpdater(): TauriUpdaterApi | undefined {
  const win = window as Window & { __TAURI__?: TauriGlobal };
  return win.__TAURI__?.updater;
}

/** Check for a signed desktop update (no-op outside Tauri). */
export async function checkForDesktopUpdate(): Promise<UpdateCheckResult> {
  const updater = getUpdater();
  if (!updater?.check) {
    return { status: "unsupported" };
  }
  try {
    const update = await updater.check();
    if (update?.available && typeof update.version === "string") {
      log.info(`update available: ${update.version}`);
      return { status: "available", version: update.version };
    }
    return { status: "up-to-date" };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    log.warn(`update check failed: ${message}`);
    return { status: "error", message };
  }
}

export async function installDesktopUpdate(
  update: TauriUpdate,
): Promise<boolean> {
  if (!update.downloadAndInstall) {
    return false;
  }
  try {
    await update.downloadAndInstall();
    return true;
  } catch (cause) {
    log.warn(
      `update install failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    return false;
  }
}

export async function openReleasePage(url?: string): Promise<void> {
  const win = window as Window & { __TAURI__?: TauriGlobal };
  const invoke = win.__TAURI__?.core?.invoke;
  if (!invoke) {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return;
  }
  try {
    await invoke("open_release_page", url ? { url } : {});
  } catch (cause) {
    log.warn(
      `open_release_page failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
}
