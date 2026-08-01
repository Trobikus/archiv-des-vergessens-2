use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

/// Destroy the main window then exit. Closing the webview first avoids the common
/// Windows WebView2 teardown noise (`Failed to unregister class Chrome_WidgetWin_0`).
pub fn exit_app(app: &AppHandle) {
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.destroy();
    }
    app.exit(0);
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    exit_app(&app);
}

#[tauri::command]
pub fn show_main_window(app: AppHandle) {
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.show();
        let _ = main_win.set_focus();
    }
}

const RELEASE_DEFAULT: &str =
    "https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest";

/// Validates that the URL points at the v2 (or legacy v1) GitHub repository.
pub fn validate_release_url(url: Option<String>) -> Result<String, String> {
    let target_url = url.unwrap_or_else(|| RELEASE_DEFAULT.to_string());

    let allowed = target_url.starts_with(
        "https://github.com/Trobikus/archiv-des-vergessens-2",
    ) || target_url.starts_with("https://github.com/Trobikus/archiv-des-vergessens/");

    // Exact v1 root without trailing slash (legacy bookmarks).
    let allowed = allowed
        || target_url == "https://github.com/Trobikus/archiv-des-vergessens"
        || target_url.starts_with("https://github.com/Trobikus/archiv-des-vergessens?");

    if !allowed {
        return Err("Ungültige URL".into());
    }

    Ok(target_url)
}

/// Opens the GitHub release page in the default browser.
#[tauri::command]
pub fn open_release_page(app: AppHandle, url: Option<String>) -> Result<String, String> {
    let target_url = validate_release_url(url)?;

    app.opener()
        .open_url(&target_url, None::<&str>)
        .map_err(|e| format!("Fehler beim Öffnen der URL: {e}"))?;

    Ok(target_url)
}

#[cfg(test)]
mod tests {
    use super::validate_release_url;

    #[test]
    fn default_url_is_v2() {
        let url = validate_release_url(None).expect("default release url");
        assert_eq!(
            url,
            "https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest"
        );
    }

    #[test]
    fn v1_and_v2_urls_are_accepted() {
        assert!(validate_release_url(Some(
            "https://github.com/Trobikus/archiv-des-vergessens-2/releases/tag/v2.0.0"
                .into()
        ))
        .is_ok());
        assert!(validate_release_url(Some(
            "https://github.com/Trobikus/archiv-des-vergessens/releases/latest".into()
        ))
        .is_ok());
    }

    #[test]
    fn foreign_url_is_rejected() {
        let err = validate_release_url(Some("https://evil.example/x".into())).unwrap_err();
        assert_eq!(err, "Ungültige URL");
    }
}
