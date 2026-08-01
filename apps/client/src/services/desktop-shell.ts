import { createLogger } from "@adv/core";

import type { GameSession } from "./game-session";
import { checkForDesktopUpdate } from "./updater-service";

const log = createLogger("desktop-shell");

type TauriEventApi = {
  readonly listen?: (
    event: string,
    handler: () => void,
  ) => Promise<() => void>;
};

type TauriCoreApi = {
  readonly invoke?: (
    cmd: string,
    args?: Record<string, unknown>,
  ) => Promise<unknown>;
};

type TauriGlobal = {
  readonly event?: TauriEventApi;
  readonly core?: TauriCoreApi;
};

function getTauri(): TauriGlobal | undefined {
  return (window as Window & { __TAURI__?: TauriGlobal }).__TAURI__;
}

export function isDesktop(): boolean {
  return getTauri() !== undefined;
}

/** Wire desktop-only behavior. Returns a cleanup fn. No-op in the browser. */
export async function initDesktopShell(
  session: GameSession,
): Promise<() => void> {
  const tauri = getTauri();
  if (!tauri?.event?.listen) {
    return () => {};
  }

  void tauri.core?.invoke?.("show_main_window");
  void checkForDesktopUpdate().then((result) => {
    if (result.status === "available") {
      log.info(`desktop update ready: ${result.version}`);
    }
  });

  try {
    return await tauri.event.listen("app:quit-requested", () => {
      void session.quitGame();
    });
  } catch (cause) {
    log.warn(
      `desktop shell init failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    return () => {};
  }
}
