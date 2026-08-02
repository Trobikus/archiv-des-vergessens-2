//! Prevents an extra console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use futures_util::StreamExt;
use reqwest::header::{HeaderMap, HeaderValue, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, Emitter};

const GITHUB_REPO: &str = "Trobikus/archiv-des-vergessens-2";
const USER_AGENT_VALUE: &str =
    concat!("ArchivDesVergessensLauncher/", env!("CARGO_PKG_VERSION"));
/// Ed25519 verifying key for portable ZIP signatures (v2 release key).
const RELEASE_PUBKEY_HEX: &str = "1a8208b9aa60550ff38869657b82d88fdf330bb863ab1f1bf1fa7cd4a0cb55cb";
const ZIP_ASSET_NAME: &str = "archiv-des-vergessens.zip";
const CONFIG_FILE_NAME: &str = "launcher-config.json";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseInfo {
    pub tag_name: String,
    pub download_url: String,
    pub release_notes: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProgressPayload {
    pub percent: u32,
    pub downloaded: u64,
    pub total: u64,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase")]
struct LauncherConfig {
    #[serde(default)]
    install_dir: Option<String>,
    #[serde(default)]
    shortcut_prompt_done: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InstallPaths {
    pub install_dir: String,
    pub default_install_dir: String,
    pub game_installed: bool,
    pub shortcut_prompt_done: bool,
}

fn get_config_dir() -> Result<PathBuf, String> {
    let mut path =
        dirs::data_dir().ok_or_else(|| "Konnte APPDATA-Verzeichnis nicht ermitteln.".to_string())?;
    path.push("ArchivDesVergessens");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

fn get_config_path() -> Result<PathBuf, String> {
    Ok(get_config_dir()?.join(CONFIG_FILE_NAME))
}

fn default_install_dir() -> Result<PathBuf, String> {
    // v2 portable root — keep separate from legacy v1 `%APPDATA%\ArchivDesVergessens\app`.
    Ok(get_config_dir()?.join("app-v2"))
}

fn load_config() -> LauncherConfig {
    let Ok(path) = get_config_path() else {
        return LauncherConfig::default();
    };
    let Ok(raw) = fs::read_to_string(path) else {
        return LauncherConfig::default();
    };
    serde_json::from_str(&raw).unwrap_or_default()
}

fn save_config(config: &LauncherConfig) -> Result<(), String> {
    let path = get_config_path()?;
    let raw = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

fn resolve_install_dir(config: &LauncherConfig) -> Result<PathBuf, String> {
    if let Some(custom) = config.install_dir.as_ref() {
        let trimmed = custom.trim();
        if !trimmed.is_empty() {
            return Ok(PathBuf::from(trimmed));
        }
    }
    default_install_dir()
}

fn get_game_dir() -> Result<PathBuf, String> {
    let config = load_config();
    let path = resolve_install_dir(&config)?;
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

fn get_version_file_path() -> Result<PathBuf, String> {
    Ok(get_game_dir()?.join("version.json"))
}

fn get_executable_path() -> Result<PathBuf, String> {
    let dir = get_game_dir()?;
    for name in [
        "ArchivDesVergessens.exe",
        "adv-desktop.exe",
        "archiv-des-vergessens.exe",
    ] {
        let candidate = dir.join(name);
        if candidate.exists() {
            return Ok(candidate);
        }
    }
    Ok(dir.join("ArchivDesVergessens.exe"))
}

fn game_is_installed() -> bool {
    get_executable_path()
        .map(|path| path.exists())
        .unwrap_or(false)
}

fn build_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static(USER_AGENT_VALUE));
    headers.insert(
        reqwest::header::ACCEPT,
        HeaderValue::from_static("application/vnd.github+json"),
    );
    headers
}

fn launcher_exe_path() -> Result<PathBuf, String> {
    std::env::current_exe().map_err(|e| format!("Launcher-Pfad unbekannt: {e}"))
}

fn desktop_dir() -> Result<PathBuf, String> {
    dirs::desktop_dir().ok_or_else(|| "Desktop-Verzeichnis nicht gefunden.".to_string())
}

#[cfg(target_os = "windows")]
fn create_windows_shortcut(target: &Path, link_path: &Path, working_dir: &Path) -> Result<(), String> {
    let target_str = target
        .to_str()
        .ok_or_else(|| "Ungültiger Zielpfad für Verknüpfung.".to_string())?;
    let link_str = link_path
        .to_str()
        .ok_or_else(|| "Ungültiger Verknüpfungspfad.".to_string())?;
    let work_str = working_dir
        .to_str()
        .ok_or_else(|| "Ungültiger Arbeitsordner.".to_string())?;

    let script = format!(
        "$s = New-Object -ComObject WScript.Shell; \
         $l = $s.CreateShortcut('{link}'); \
         $l.TargetPath = '{target}'; \
         $l.WorkingDirectory = '{work}'; \
         $l.Description = 'Archiv des Vergessens — Siegel-Portal'; \
         $l.Save()",
        link = link_str.replace('\'', "''"),
        target = target_str.replace('\'', "''"),
        work = work_str.replace('\'', "''"),
    );

    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            &script,
        ])
        .output()
        .map_err(|e| format!("PowerShell für Verknüpfung fehlgeschlagen: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Desktop-Verknüpfung fehlgeschlagen: {stderr}"));
    }
    Ok(())
}

#[tauri::command]
fn get_install_paths() -> Result<InstallPaths, String> {
    let config = load_config();
    let default_dir = default_install_dir()?;
    let install_dir = resolve_install_dir(&config)?;
    Ok(InstallPaths {
        install_dir: install_dir.to_string_lossy().into_owned(),
        default_install_dir: default_dir.to_string_lossy().into_owned(),
        game_installed: game_is_installed(),
        shortcut_prompt_done: config.shortcut_prompt_done,
    })
}

#[tauri::command]
fn set_install_dir(path: String) -> Result<String, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("Bitte einen gültigen Speicherort wählen.".to_string());
    }
    let dir = PathBuf::from(trimmed);
    fs::create_dir_all(&dir)
        .map_err(|e| format!("Ordner konnte nicht erstellt werden: {e}"))?;

    let mut config = load_config();
    config.install_dir = Some(dir.to_string_lossy().into_owned());
    save_config(&config)?;
    Ok(dir.to_string_lossy().into_owned())
}

#[tauri::command]
fn browse_install_dir() -> Result<Option<String>, String> {
    let config = load_config();
    let start = resolve_install_dir(&config).unwrap_or_else(|_| PathBuf::from("."));
    let picked = rfd::FileDialog::new()
        .set_title("Speicherort für Archiv des Vergessens")
        .set_directory(start)
        .pick_folder();
    Ok(picked.map(|p| p.to_string_lossy().into_owned()))
}

#[tauri::command]
fn create_desktop_shortcut() -> Result<(), String> {
    let launcher = launcher_exe_path()?;
    if !launcher.exists() {
        return Err("Launcher-EXE nicht gefunden.".to_string());
    }
    let desktop = desktop_dir()?;
    let link = desktop.join("Archiv des Vergessens.lnk");
    let work_dir = launcher
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_else(|| PathBuf::from("."));

    #[cfg(target_os = "windows")]
    create_windows_shortcut(&launcher, &link, &work_dir)?;

    #[cfg(not(target_os = "windows"))]
    {
        let _ = (launcher, link, work_dir);
        return Err("Desktop-Verknüpfungen werden nur unter Windows unterstützt.".to_string());
    }

    let mut config = load_config();
    config.shortcut_prompt_done = true;
    save_config(&config)?;
    Ok(())
}

#[tauri::command]
fn dismiss_desktop_shortcut_prompt() -> Result<(), String> {
    let mut config = load_config();
    config.shortcut_prompt_done = true;
    save_config(&config)
}

#[tauri::command]
fn get_installed_game_version() -> Result<Option<String>, String> {
    let exe_path = get_executable_path()?;
    if !exe_path.exists() {
        return Ok(None);
    }

    let version_file = get_version_file_path()?;
    if version_file.exists() {
        if let Ok(content) = fs::read_to_string(&version_file) {
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(version_str) = v["version"].as_str() {
                    return Ok(Some(version_str.to_string()));
                }
            }
        }
    }

    Ok(Some(env!("CARGO_PKG_VERSION").to_string()))
}

#[tauri::command]
async fn check_github_release() -> Result<ReleaseInfo, String> {
    let client = reqwest::Client::new();
    let api_url = format!("https://api.github.com/repos/{GITHUB_REPO}/releases/latest");

    let res = client
        .get(&api_url)
        .headers(build_headers())
        .send()
        .await
        .map_err(|e| format!("GitHub-API-Anfrage fehlgeschlagen: {e}"))?;

    if !res.status().is_success() {
        let status = res.status();
        if status.as_u16() == 404 {
            return Err(
                "Kein veröffentlichtes Release gefunden (GitHub /releases/latest → 404). \
                 Repo muss öffentlich sein und das Release darf kein Draft sein."
                    .to_string(),
            );
        }
        return Err(format!("GitHub-API HTTP-Status: {status}"));
    }

    let json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| format!("GitHub-Release-JSON ungültig: {e}"))?;

    let tag_name = json["tag_name"]
        .as_str()
        .or_else(|| json["name"].as_str())
        .unwrap_or("v2.0.0")
        .to_string();

    let release_notes = json["body"].as_str().unwrap_or("").to_string();

    let mut download_url = format!(
        "https://github.com/{GITHUB_REPO}/releases/download/{tag_name}/{ZIP_ASSET_NAME}"
    );

    if let Some(assets) = json["assets"].as_array() {
        for asset in assets {
            if let Some(name) = asset["name"].as_str() {
                if name == ZIP_ASSET_NAME || name.ends_with(".zip") {
                    if let Some(url) = asset["browser_download_url"].as_str() {
                        download_url = url.to_string();
                        if name == ZIP_ASSET_NAME {
                            break;
                        }
                    }
                }
            }
        }
    }

    Ok(ReleaseInfo {
        tag_name,
        download_url,
        release_notes,
    })
}

#[tauri::command]
async fn download_and_extract_game(
    app: AppHandle,
    download_url: String,
    version: String,
) -> Result<(), String> {
    let game_dir = get_game_dir()?;
    let temp_zip_path = get_config_dir()?.join("temp_download.zip");

    let _ = app.emit(
        "download_progress",
        ProgressPayload {
            percent: 0,
            downloaded: 0,
            total: 0,
            status: "Hole das Archiv…".to_string(),
        },
    );

    let client = reqwest::Client::new();
    let headers = build_headers();

    let response = client
        .get(&download_url)
        .headers(headers.clone())
        .send()
        .await
        .map_err(|e| format!("Download-Anfrage fehlgeschlagen: {e}"))?;

    if !response.status().is_success() {
        return Err(format!("Download HTTP-Status: {}", response.status()));
    }

    let total_size = response.content_length().unwrap_or(0);
    let mut downloaded: u64 = 0;

    let mut file = File::create(&temp_zip_path)
        .map_err(|e| format!("Temporäre Datei konnte nicht erstellt werden: {e}"))?;

    let mut stream = response.bytes_stream();
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Download-Stream-Fehler: {e}"))?;
        file.write_all(&chunk)
            .map_err(|e| format!("Schreibfehler: {e}"))?;

        downloaded += chunk.len() as u64;
        let percent = if total_size > 0 {
            ((downloaded as f64 / total_size as f64) * 100.0) as u32
        } else {
            0
        };

        let _ = app.emit(
            "download_progress",
            ProgressPayload {
                percent,
                downloaded,
                total: total_size,
                status: format!("Hole das Archiv… {percent}%"),
            },
        );
    }
    drop(file);

    let _ = app.emit(
        "download_progress",
        ProgressPayload {
            percent: 100,
            downloaded,
            total: total_size,
            status: "Prüfe das Siegel…".to_string(),
        },
    );

    let sig_url = format!("{download_url}.sig");
    let sig_response = client
        .get(&sig_url)
        .headers(headers)
        .send()
        .await
        .map_err(|e| format!("Signatur konnte nicht geladen werden: {e}"))?;

    if !sig_response.status().is_success() {
        let _ = fs::remove_file(&temp_zip_path);
        return Err(format!(
            "Signatur nicht gefunden (HTTP {}). Sicherheitsabbruch.",
            sig_response.status()
        ));
    }

    let sig_hex_str = sig_response
        .text()
        .await
        .map_err(|e| format!("Signatur konnte nicht gelesen werden: {e}"))?
        .trim()
        .to_string();

    let sig_bytes = match hex::decode(&sig_hex_str) {
        Ok(b) => b,
        Err(e) => {
            let _ = fs::remove_file(&temp_zip_path);
            return Err(format!("Ungültiges Signatur-Format: {e}"));
        }
    };

    let pub_bytes = hex::decode(RELEASE_PUBKEY_HEX)
        .map_err(|e| format!("Interner Public-Key-Fehler: {e}"))?;

    if sig_bytes.len() != 64 {
        let _ = fs::remove_file(&temp_zip_path);
        return Err("Ungültige Signaturlänge.".to_string());
    }

    let verifying_key = match VerifyingKey::from_bytes(
        pub_bytes
            .as_slice()
            .try_into()
            .map_err(|_| "Public Key hat ungültige Länge.".to_string())?,
    ) {
        Ok(k) => k,
        Err(e) => {
            let _ = fs::remove_file(&temp_zip_path);
            return Err(format!("Public-Key-Fehler: {e}"));
        }
    };

    let mut signature_bytes = [0u8; 64];
    signature_bytes.copy_from_slice(&sig_bytes);
    let signature = Signature::from_bytes(&signature_bytes);

    let zip_content = match fs::read(&temp_zip_path) {
        Ok(c) => c,
        Err(e) => {
            let _ = fs::remove_file(&temp_zip_path);
            return Err(format!("ZIP für Verifizierung nicht lesbar: {e}"));
        }
    };

    if let Err(e) = verifying_key.verify(&zip_content, &signature) {
        let _ = fs::remove_file(&temp_zip_path);
        return Err(format!(
            "Sicherheitswarnung: Signatur ungültig — Datei möglicherweise manipuliert. ({e})"
        ));
    }

    let _ = app.emit(
        "download_progress",
        ProgressPayload {
            percent: 100,
            downloaded,
            total: total_size,
            status: "Entsiegele die Hallen…".to_string(),
        },
    );

    // Clear previous portable install so stale binaries cannot linger.
    if game_dir.exists() {
        for entry in fs::read_dir(&game_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.file_name().and_then(|n| n.to_str()) == Some("version.json") {
                continue;
            }
            if path.is_dir() {
                let _ = fs::remove_dir_all(&path);
            } else {
                let _ = fs::remove_file(&path);
            }
        }
    }

    let zip_file = File::open(&temp_zip_path)
        .map_err(|e| format!("Heruntergeladenes Archiv nicht öffenbar: {e}"))?;
    let mut archive =
        zip::ZipArchive::new(zip_file).map_err(|e| format!("Ungültiges ZIP-Archiv: {e}"))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("ZIP-Eintrag-Fehler: {e}"))?;

        let outpath = match file.enclosed_name() {
            Some(path) => game_dir.join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = File::create(&outpath)
                .map_err(|e| format!("Zieldatei nicht erstellbar ({outpath:?}): {e}"))?;
            std::io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Zieldatei nicht schreibbar: {e}"))?;
        }
    }

    let _ = fs::remove_file(&temp_zip_path);

    let version_data = serde_json::json!({
        "version": version,
        "installed_at": format!("{:?}", std::time::SystemTime::now()),
        "channel": "portable-launcher"
    });
    let _ = fs::write(
        get_version_file_path()?,
        serde_json::to_string_pretty(&version_data).unwrap_or_default(),
    );

    let _ = app.emit(
        "download_progress",
        ProgressPayload {
            percent: 100,
            downloaded,
            total: total_size,
            status: "Bereit.".to_string(),
        },
    );

    Ok(())
}

#[tauri::command]
fn launch_installed_game(app: AppHandle) -> Result<(), String> {
    let exe_path = get_executable_path()?;
    if !exe_path.exists() {
        return Err(
            "Spieldatei wurde nicht gefunden. Bitte öffne zuerst das Archiv (Installation)."
                .to_string(),
        );
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        // DETACHED_PROCESS
        std::process::Command::new(&exe_path)
            .current_dir(exe_path.parent().unwrap())
            .creation_flags(0x00000008)
            .spawn()
            .map_err(|e| format!("Prozess konnte nicht gestartet werden: {e}"))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        std::process::Command::new(&exe_path)
            .current_dir(exe_path.parent().unwrap())
            .spawn()
            .map_err(|e| format!("Prozess konnte nicht gestartet werden: {e}"))?;
    }

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(500));
        app.exit(0);
    });

    Ok(())
}

#[tauri::command]
fn close_launcher(app: AppHandle) {
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_install_paths,
            set_install_dir,
            browse_install_dir,
            create_desktop_shortcut,
            dismiss_desktop_shortcut_prompt,
            get_installed_game_version,
            check_github_release,
            download_and_extract_game,
            launch_installed_game,
            close_launcher
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten des Siegel-Portal-Launchers");
}
