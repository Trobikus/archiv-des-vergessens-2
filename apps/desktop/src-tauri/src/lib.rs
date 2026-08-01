pub mod commands;

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use tauri::{Emitter, Manager};

pub fn create_app_builder() -> tauri::Builder<tauri::Wry> {
    let quitting_flag = Arc::new(AtomicBool::new(false));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .on_window_event(move |window, event| {
            let label = window.label();
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if label == "main" {
                    api.prevent_close();
                    let _ = window.emit("app:quit-requested", ());

                    if !quitting_flag.swap(true, Ordering::SeqCst) {
                        let app = window.app_handle().clone();
                        let flag_clone = Arc::clone(&quitting_flag);
                        std::thread::spawn(move || {
                            std::thread::sleep(std::time::Duration::from_secs(4));
                            if flag_clone.load(Ordering::SeqCst) {
                                println!("[Tauri] Fallback force-quit triggered for main window.");
                                commands::exit_app(&app);
                            }
                        });
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::quit_app,
            commands::show_main_window,
            commands::open_release_page
        ])
}

pub fn run() {
    create_app_builder()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
