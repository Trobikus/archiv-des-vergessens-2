/* global __TAURI__ */

function normalizeTag(v) {
  return String(v || "")
    .trim()
    .replace(/^v/i, "")
    .toLowerCase();
}

function parseVersion(v) {
  const core = normalizeTag(v).split(/[-+]/)[0] || "";
  return core.split(".").map((n) => parseInt(n, 10) || 0);
}

/** Legacy v1 used 1.x; the v2 rewrite ships 0.2.x — never treat 1.x as "up to date". */
function isLegacyV1Install(ver) {
  const major = parseVersion(ver)[0] || 0;
  return major >= 1;
}


/** True when the bound install should be replaced by the GitHub latest release. */
function needsUpdate(currentVer, latestVer) {
  if (!currentVer) return true;
  const latestTag = normalizeTag(latestVer);
  if (!latestTag) return false;
  // Track the published release tag — numeric compare alone wrongly keeps v1 (1.x) over v2 (0.2.x).
  if (normalizeTag(currentVer) === latestTag) return false;
  return true;
}

function getTauri() {
  return window.__TAURI__ || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const actionBtn = document.getElementById("action-btn");
  const closeBtn = document.getElementById("close-btn");
  const progressContainer = document.getElementById("progress-container");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const progressTrack = document.querySelector(".progress-track");
  const dustContainer = document.getElementById("dust-container");
  const statusToast = document.getElementById("status-toast");
  const versionIndicator = document.getElementById("version-indicator");
  const errorContainer = document.getElementById("error-container");
  const errorMessage = document.getElementById("error-message");
  const retryBtn = document.getElementById("retry-btn");
  const offlineBtn = document.getElementById("offline-btn");
  const installPanel = document.getElementById("install-panel");
  const shortcutPanel = document.getElementById("shortcut-panel");
  const installPathInput = document.getElementById("install-path");
  const browseBtn = document.getElementById("browse-btn");
  const confirmInstallBtn = document.getElementById("confirm-install-btn");
  const cancelInstallBtn = document.getElementById("cancel-install-btn");
  const shortcutYesBtn = document.getElementById("shortcut-yes-btn");
  const shortcutNoBtn = document.getElementById("shortcut-no-btn");

  let installedVersion = null;
  let latestReleaseInfo = null;
  let launcherState = "checking";
  let installPaths = null;

  const tauri = getTauri();
  const invoke = tauri?.core?.invoke?.bind(tauri.core);
  const listen = tauri?.event?.listen?.bind(tauri.event);

  function showToast(text, tone = "info") {
    if (!statusToast) return;
    statusToast.textContent = text;
    statusToast.classList.remove("tone-ok", "tone-info");
    statusToast.classList.add(tone === "ok" ? "tone-ok" : "tone-info", "show");
  }

  function hideSetupPanels() {
    if (installPanel) installPanel.hidden = true;
    if (shortcutPanel) shortcutPanel.hidden = true;
  }

  function setUIState(state, customText = "") {
    launcherState = state;
    if (!actionBtn || !progressContainer || !errorContainer) return;

    if (state === "error") {
      hideSetupPanels();
      actionBtn.hidden = true;
      progressContainer.hidden = true;
      errorContainer.hidden = false;
      if (errorMessage) {
        errorMessage.textContent = customText || "Das Siegel ließ sich nicht prüfen.";
      }
      return;
    }

    errorContainer.hidden = true;

    if (state === "choose-path") {
      actionBtn.hidden = true;
      progressContainer.hidden = true;
      if (shortcutPanel) shortcutPanel.hidden = true;
      if (installPanel) installPanel.hidden = false;
      if (installPathInput && installPaths) {
        installPathInput.value = installPaths.installDir || installPaths.defaultInstallDir || "";
      }
      return;
    }

    if (state === "ask-shortcut") {
      actionBtn.hidden = true;
      progressContainer.hidden = true;
      if (installPanel) installPanel.hidden = true;
      if (shortcutPanel) shortcutPanel.hidden = false;
      return;
    }

    hideSetupPanels();

    if (state === "downloading") {
      actionBtn.hidden = true;
      progressContainer.hidden = false;
      return;
    }

    progressContainer.hidden = true;
    actionBtn.hidden = false;
    actionBtn.disabled = false;

    switch (state) {
      case "checking":
        actionBtn.disabled = true;
        actionBtn.textContent = "Prüfe das Siegel…";
        break;
      case "not-installed":
        actionBtn.textContent = "Archiv öffnen";
        break;
      case "update-available":
        actionBtn.textContent = "Siegel erneuern";
        break;
      case "ready-to-play":
        actionBtn.textContent = "Ins Reich eintreten";
        break;
      default:
        break;
    }

    if (versionIndicator) {
      versionIndicator.textContent = installedVersion
        ? `Fassung v${installedVersion}`
        : "Noch nicht gebunden";
      versionIndicator.classList.add("show");
    }
  }

  function spawnDust() {
    if (!dustContainer) return;
    const mote = document.createElement("div");
    mote.className = "dust";
    const startX = Math.random() * 100;
    const size = Math.random() * 2 + 0.6;
    const duration = 5 + Math.random() * 5;
    const drift = `${Math.random() * 50 - 25}px`;
    mote.style.left = `${startX}%`;
    mote.style.width = `${size}px`;
    mote.style.height = `${size}px`;
    mote.style.setProperty("--drift", drift);
    mote.style.animationDuration = `${duration}s`;
    dustContainer.appendChild(mote);
    mote.addEventListener("animationend", () => mote.remove());
  }

  for (let i = 0; i < 10; i += 1) spawnDust();
  setInterval(spawnDust, 700);

  if (closeBtn) {
    closeBtn.addEventListener("click", async () => {
      try {
        if (invoke) await invoke("close_launcher");
        else window.close();
      } catch {
        window.close();
      }
    });
  }

  // Frameless window: data-tauri-drag-region + explicit startDragging fallback.
  const appWindow = tauri?.window?.getCurrentWindow?.();
  if (appWindow?.startDragging) {
    document.querySelectorAll("[data-tauri-drag-region]").forEach((el) => {
      el.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        appWindow.startDragging().catch(() => {
          /* ignore */
        });
      });
    });
  }

  if (listen) {
    try {
      await listen("download_progress", (event) => {
        const payload = event.payload;
        if (!payload) return;
        setUIState("downloading");
        if (progressFill) progressFill.style.width = `${payload.percent}%`;
        if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(payload.percent));
        if (progressLabel) progressLabel.textContent = payload.status;
      });
    } catch {
      /* browser preview */
    }
  }

  async function refreshInstallPaths() {
    if (!invoke) return null;
    installPaths = await invoke("get_install_paths");
    return installPaths;
  }

  async function finishAfterInstall() {
    const paths = await refreshInstallPaths();
    if (paths && !paths.shortcutPromptDone) {
      setUIState("ask-shortcut");
      return;
    }
    setUIState("ready-to-play");
  }

  async function launchGame() {
    if (!invoke) {
      setUIState("error", "Tauri-Bridge nicht verfügbar.");
      return;
    }
    actionBtn.disabled = true;
    actionBtn.textContent = "Öffne das Portal…";
    try {
      await invoke("launch_installed_game");
    } catch (err) {
      setUIState("error", `Start fehlgeschlagen: ${err}`);
    }
  }

  async function installOrUpdate() {
    if (!latestReleaseInfo || !invoke) {
      setUIState("error", "Keine Release-Information vorhanden.");
      return;
    }
    setUIState("downloading");
    try {
      await invoke("download_and_extract_game", {
        downloadUrl: latestReleaseInfo.downloadUrl || latestReleaseInfo.download_url,
        version: String(latestReleaseInfo.tagName || latestReleaseInfo.tag_name).replace(/^v/i, ""),
      });
      installedVersion = String(latestReleaseInfo.tagName || latestReleaseInfo.tag_name).replace(
        /^v/i,
        "",
      );
      showToast(`Fassung v${installedVersion} gebunden.`, "ok");
      await finishAfterInstall();
    } catch (err) {
      setUIState("error", `Installation fehlgeschlagen: ${err}`);
    }
  }

  async function beginInstallFlow() {
    try {
      await refreshInstallPaths();
    } catch {
      installPaths = null;
    }
    setUIState("choose-path");
  }

  if (browseBtn) {
    browseBtn.addEventListener("click", async () => {
      if (!invoke) return;
      try {
        const picked = await invoke("browse_install_dir");
        if (picked && installPathInput) {
          installPathInput.value = picked;
        }
      } catch (err) {
        showToast(`Ordnerwahl fehlgeschlagen: ${err}`, "info");
      }
    });
  }

  if (confirmInstallBtn) {
    confirmInstallBtn.addEventListener("click", async () => {
      if (!invoke || !installPathInput) return;
      const path = installPathInput.value.trim();
      if (!path) {
        showToast("Bitte einen Speicherort wählen.", "info");
        return;
      }
      confirmInstallBtn.disabled = true;
      try {
        await invoke("set_install_dir", { path });
        await refreshInstallPaths();
        await installOrUpdate();
      } catch (err) {
        setUIState("error", `Speicherort ungültig: ${err}`);
      } finally {
        confirmInstallBtn.disabled = false;
      }
    });
  }

  if (cancelInstallBtn) {
    cancelInstallBtn.addEventListener("click", () => {
      if (!installedVersion) {
        setUIState("not-installed");
      } else {
        setUIState("update-available");
      }
    });
  }

  if (shortcutYesBtn) {
    shortcutYesBtn.addEventListener("click", async () => {
      if (!invoke) return;
      shortcutYesBtn.disabled = true;
      try {
        await invoke("create_desktop_shortcut");
        showToast("Desktop-Verknüpfung erstellt.", "ok");
      } catch (err) {
        showToast(`Verknüpfung fehlgeschlagen: ${err}`, "info");
        try {
          await invoke("dismiss_desktop_shortcut_prompt");
        } catch {
          /* ignore */
        }
      } finally {
        shortcutYesBtn.disabled = false;
        setUIState("ready-to-play");
      }
    });
  }

  if (shortcutNoBtn) {
    shortcutNoBtn.addEventListener("click", async () => {
      if (invoke) {
        try {
          await invoke("dismiss_desktop_shortcut_prompt");
        } catch {
          /* ignore */
        }
      }
      setUIState("ready-to-play");
    });
  }

  if (actionBtn) {
    actionBtn.addEventListener("click", async () => {
      if (launcherState === "not-installed") {
        await beginInstallFlow();
      } else if (launcherState === "update-available") {
        // Updates reuse the already chosen install directory.
        await installOrUpdate();
      } else if (launcherState === "ready-to-play") {
        await launchGame();
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      checkSystemAndUpdates();
    });
  }

  if (offlineBtn) {
    offlineBtn.addEventListener("click", () => {
      launchGame();
    });
  }

  async function checkSystemAndUpdates() {
    setUIState("checking");

    if (!invoke) {
      setUIState("error", "Launcher läuft außerhalb von Tauri.");
      return;
    }

    try {
      await refreshInstallPaths();
    } catch {
      installPaths = null;
    }

    try {
      installedVersion = await invoke("get_installed_game_version");
    } catch {
      installedVersion = null;
    }

    try {
      latestReleaseInfo = await invoke("check_github_release");
      const latestTag = latestReleaseInfo.tagName || latestReleaseInfo.tag_name;

      if (!installedVersion) {
        setUIState("not-installed");
      } else if (needsUpdate(installedVersion, latestTag)) {
        if (isLegacyV1Install(installedVersion)) {
          showToast(
            `v1-Installation erkannt (v${normalizeTag(installedVersion)}) — bitte auf ${latestTag} erneuern.`,
            "info",
          );
        } else {
          showToast(`Neue Fassung verfügbar: ${latestTag}`, "info");
        }
        setUIState("update-available");
      } else {
        setUIState("ready-to-play");
      }
    } catch (err) {
      if (installedVersion) {
        showToast("Siegel-Prüfung offline — lokale Fassung verfügbar.", "info");
        setUIState("ready-to-play");
      } else {
        const detail = err != null ? String(err) : "";
        setUIState(
          "error",
          detail
            ? `Release nicht erreichbar: ${detail}`
            : "Keine gebundene Fassung und Release nicht erreichbar. Prüfe die Verbindung zu GitHub.",
        );
      }
    }
  }

  setTimeout(() => {
    checkSystemAndUpdates();
  }, 280);
});
