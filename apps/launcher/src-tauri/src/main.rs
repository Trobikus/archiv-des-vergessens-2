//! Prevents an extra console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use futures_util::StreamExt;
use reqwest::header::{HeaderMap, HeaderValue, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

const GITHUB_REPO: &str = "Trobikus/archiv-des-vergessens-2";
const USER_AGENT_VALUE: &str = "ArchivDesVergessensLauncher/2.0";
/// Ed25519 verifying key for portable ZIP signatures (same key family as v1).
const RELEASE_PUBKEY_HEX: &str = "8894761a4e3b7bbe5896bf6ef15ae2f13c1610b7248b992425ffb712a2adab08";
const ZIP_ASSET_NAME: &str = "archiv-des-vergessens.zip";

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

fn get_game_dir() -> Result<PathBuf, String> {
    let mut path =
        dirs::data_dir().ok_or_else(|| "Konnte APPDATA-Verzeichnis nicht ermitteln.".to_string())?;
    path.push("ArchivDesVergessens");
    path.push("app");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

fn get_version_file_path() -> Result<PathBuf, String> {
    Ok(get_game_dir()?.join("version.json"))
}

fn get_executable_path() -> Result<PathBuf, String> {
    let dir = get_game_dir()?;
    for name in ["ArchivDesVergessens.exe", "adv-desktop.exe", "archiv-des-vergessens.exe"] {
        let candidate = dir.join(name);
        if candidate.exists() {
            return Ok(candidate);
        }
    }
    Ok(dir.join("ArchivDesVergessens.exe"))
}

fn build_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static(USER_AGENT_VALUE));
    headers
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

    Ok(Some("2.0.0".to_string()))
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
        return Err(format!("GitHub-API HTTP-Status: {}", res.status()));
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
    let temp_zip_path = game_dir
        .parent()
        .ok_or_else(|| "Ungültiger Installationspfad.".to_string())?
        .join("temp_download.zip");

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
            get_installed_game_version,
            check_github_release,
            download_and_extract_game,
            launch_installed_game,
            close_launcher
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten des Siegel-Portal-Launchers");
}
