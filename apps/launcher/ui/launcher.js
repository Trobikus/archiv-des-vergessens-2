/* global __TAURI__ */

function parseVersion(v) {
  return String(v || "")
    .replace(/^v/i, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

function isNewerVersion(currentVer, latestVer) {
  if (!currentVer) return true;
  const current = parseVersion(currentVer);
  const latest = parseVersion(latestVer);
  const len = Math.max(current.length, latest.length);
  for (let i = 0; i < len; i += 1) {
    const c = current[i] || 0;
    const l = latest[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
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

  let installedVersion = null;
  let latestReleaseInfo = null;
  let launcherState = "checking";

  const tauri = getTauri();
  const invoke = tauri?.core?.invoke?.bind(tauri.core);
  const listen = tauri?.event?.listen?.bind(tauri.event);

  function showToast(text, tone = "info") {
    if (!statusToast) return;
    statusToast.textContent = text;
    statusToast.classList.remove("tone-ok", "tone-info");
    statusToast.classList.add(tone === "ok" ? "tone-ok" : "tone-info", "show");
  }

  function setUIState(state, customText = "") {
    launcherState = state;
    if (!actionBtn || !progressContainer || !errorContainer) return;

    if (state === "error") {
      actionBtn.hidden = true;
      progressContainer.hidden = true;
      errorContainer.hidden = false;
      if (errorMessage) {
        errorMessage.textContent = customText || "Das Siegel ließ sich nicht prüfen.";
      }
      return;
    }

    errorContainer.hidden = true;

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
      setUIState("ready-to-play");
    } catch (err) {
      setUIState("error", `Installation fehlgeschlagen: ${err}`);
    }
  }

  if (actionBtn) {
    actionBtn.addEventListener("click", async () => {
      if (launcherState === "not-installed" || launcherState === "update-available") {
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
      installedVersion = await invoke("get_installed_game_version");
    } catch {
      installedVersion = null;
    }

    try {
      latestReleaseInfo = await invoke("check_github_release");
      const latestTag = latestReleaseInfo.tagName || latestReleaseInfo.tag_name;

      if (!installedVersion) {
        setUIState("not-installed");
      } else if (isNewerVersion(installedVersion, latestTag)) {
        showToast(`Neue Fassung verfügbar: ${latestTag}`, "info");
        setUIState("update-available");
      } else {
        setUIState("ready-to-play");
      }
    } catch {
      if (installedVersion) {
        showToast("Siegel-Prüfung offline — lokale Fassung verfügbar.", "info");
        setUIState("ready-to-play");
      } else {
        setUIState(
          "error",
          "Keine gebundene Fassung und Release nicht erreichbar. Prüfe die Verbindung.",
        );
      }
    }
  }

  setTimeout(() => {
    checkSystemAndUpdates();
  }, 280);
});
