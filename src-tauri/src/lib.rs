mod commands;
mod config;
mod heartbeat;
mod models;
mod roam;
mod secrets;

use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::{ManagerExt, MacosLauncher};
use tauri_plugin_positioner::{Position, WindowExt};

pub static PINNED: AtomicBool = AtomicBool::new(false);

pub fn dlog(msg: &str) {
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open("/tmp/roam-bar-debug.log")
    {
        let ts = chrono::Local::now().format("%H:%M:%S%.3f");
        let _ = writeln!(f, "{ts}  {msg}");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    std::panic::set_hook(Box::new(|info| {
        dlog(&format!("!!! PANIC: {info}"));
    }));
    dlog("==================== run() start ====================");

    let result = tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .manage(heartbeat::Heartbeat::default())
        .invoke_handler(tauri::generate_handler![
            commands::get_config_status,
            commands::save_config,
            commands::get_activities,
            commands::set_activity,
            commands::clear_activity,
            commands::set_pinned,
            commands::hide_window,
            commands::quit_app,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("main") {
                if let Err(e) = window_vibrancy::apply_vibrancy(
                    &window,
                    window_vibrancy::NSVisualEffectMaterial::HudWindow,
                    Some(window_vibrancy::NSVisualEffectState::Active),
                    Some(16.0),
                ) {
                    dlog(&format!("setup: vibrancy error: {e}"));
                }
            }

            if config::get("autostart_init").is_none() {
                if let Err(e) = app.autolaunch().enable() {
                    dlog(&format!("setup: autostart enable error: {e}"));
                }
                let _ = config::set("autostart_init", "1");
            }

            let menu = (|| -> tauri::Result<Menu<_>> {
                let show_i = MenuItem::with_id(app, "show", "Open Roam Bar", true, None::<&str>)?;
                let quit_i = MenuItem::with_id(app, "quit", "Quit Roam Bar", true, None::<&str>)?;
                Menu::with_items(app, &[&show_i, &quit_i])
            })()
            .map_err(|e| dlog(&format!("setup: menu build error: {e}")))
            .ok();

            let tray_icon = tauri::include_image!("icons/tray.png");
            let mut builder = TrayIconBuilder::with_id("main-tray")
                .icon(tray_icon)
                .tooltip("Roam Bar")
                .icon_as_template(true)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "show" => show_popover(app),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_popover(tray.app_handle());
                    }
                });
            if let Some(menu) = menu {
                builder = builder.menu(&menu);
            }
            if let Err(e) = builder.build(app) {
                dlog(&format!("setup: !!! TRAY BUILD ERROR: {e}"));
            }

            if let Some(window) = app.get_webview_window("main") {
                let w = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        if !PINNED.load(Ordering::Relaxed) {
                            let _ = w.hide();
                        }
                    }
                });
            }

            dlog("setup: complete");
            Ok(())
        })
        .run(tauri::generate_context!());

    match result {
        Ok(_) => dlog("run() exited cleanly"),
        Err(e) => dlog(&format!("run() error: {e}")),
    }
}

fn toggle_popover(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) && window.is_focused().unwrap_or(false) {
            let _ = window.hide();
            return;
        }
    }
    show_popover(app);
}

fn show_popover(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.move_window(Position::TrayBottomCenter);
        let _ = window.show();
        let _ = window.set_focus();
    }
}
