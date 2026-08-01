export type DesktopLockdownOptions = {
  /** Force-enable even outside Tauri (e.g. `?lockdown=1`). */
  readonly force?: boolean;
};

function hasTauriGlobals(win: Window): boolean {
  const extended = win as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };
  return (
    extended.__TAURI__ !== undefined ||
    extended.__TAURI_INTERNALS__ !== undefined
  );
}

function wantsLockdownFromQuery(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("lockdown") === "1";
  } catch {
    return false;
  }
}

export function isDesktopShell(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return hasTauriGlobals(window) || wantsLockdownFromQuery();
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (target === null || typeof target !== "object") {
    return false;
  }
  const el = target as {
    isContentEditable?: boolean;
    tagName?: string;
  };
  if (el.isContentEditable === true) {
    return true;
  }
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** @internal exported for unit tests */
export function shouldBlockBrowserShortcut(event: {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  readonly target: EventTarget | null;
}): boolean {
  const key = event.key;
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  const editable = isEditableTarget(event.target);

  // DevTools / view-source
  if (key === "F12") {
    return true;
  }
  if (
    ctrlOrMeta &&
    event.shiftKey &&
    (key === "I" || key === "J" || key === "C")
  ) {
    return true;
  }
  if (ctrlOrMeta && (key === "u" || key === "U")) {
    return true;
  }

  // Reload
  if (key === "F5") {
    return true;
  }
  if (ctrlOrMeta && (key === "r" || key === "R")) {
    return true;
  }

  // Zoom
  if (
    ctrlOrMeta &&
    (key === "+" || key === "-" || key === "=" || key === "_" || key === "0")
  ) {
    return true;
  }

  // History navigation
  if (event.altKey && (key === "ArrowLeft" || key === "ArrowRight")) {
    return true;
  }
  if (key === "Backspace" && !editable) {
    return true;
  }

  // Common browser chrome shortcuts (keep copy/paste/select in inputs)
  if (ctrlOrMeta && !editable) {
    if (
      key === "p" ||
      key === "P" ||
      key === "s" ||
      key === "S" ||
      key === "o" ||
      key === "O"
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Blocks browser chrome affordances so the Tauri shell feels like a standalone game.
 * No-ops outside Tauri unless `force` / `?lockdown=1`.
 */
export function installDesktopLockdown(
  options: DesktopLockdownOptions = {},
): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => undefined;
  }

  const enabled = options.force === true || isDesktopShell();
  if (!enabled) {
    return () => undefined;
  }

  const root = document.documentElement;
  root.classList.add("is-desktop-shell");

  const onContextMenu = (event: MouseEvent): void => {
    if (isEditableTarget(event.target)) {
      return;
    }
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!shouldBlockBrowserShortcut(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const onWheel = (event: WheelEvent): void => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  };

  const onDragStart = (event: DragEvent): void => {
    if (isEditableTarget(event.target)) {
      return;
    }
    event.preventDefault();
  };

  document.addEventListener("contextmenu", onContextMenu, true);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("wheel", onWheel, { capture: true, passive: false });
  document.addEventListener("dragstart", onDragStart, true);

  return () => {
    root.classList.remove("is-desktop-shell");
    document.removeEventListener("contextmenu", onContextMenu, true);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("wheel", onWheel, true);
    document.removeEventListener("dragstart", onDragStart, true);
  };
}
