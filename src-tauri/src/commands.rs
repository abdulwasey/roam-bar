use crate::activity;
use crate::config::{self, Config};
use crate::models::{Activity, ActivityState, AppConfigInput, ConfigStatus, RoamUser, SetActivityInput};
use crate::roam;
use tauri::{AppHandle, Manager};

async fn load_cfg() -> Result<Config, String> {
    let cfg = config::load();
    if !cfg.user_id.is_empty() || cfg.token.is_empty() {
        return Ok(cfg);
    }
    let user = roam::resolve_user(&cfg).await?;
    config::save_identity(&user)?;
    Ok(config::load())
}

#[tauri::command]
pub async fn get_config_status() -> Result<ConfigStatus, String> {
    let cfg = load_cfg().await?;
    Ok(ConfigStatus {
        configured: !cfg.token.is_empty() && !cfg.user_id.is_empty(),
        user_id: cfg.user_id,
        user_name: cfg.user_name,
        user_email: cfg.user_email,
        user_image: cfg.user_image,
    })
}

#[tauri::command]
pub async fn save_config(config: AppConfigInput) -> Result<RoamUser, String> {
    config::save_token(&config.token)?;
    let cfg = config::load();
    let user = roam::resolve_user(&cfg).await?;
    config::save_identity(&user)?;
    Ok(user)
}

#[tauri::command]
pub async fn get_activities(app: AppHandle) -> Result<ActivityState, String> {
    load_cfg().await?;
    activity::state(&app).await
}

#[tauri::command]
pub async fn set_activity(app: AppHandle, input: SetActivityInput) -> Result<Activity, String> {
    load_cfg().await?;
    activity::set(&app, input, Some("app".into())).await
}

#[tauri::command]
pub async fn clear_activity(app: AppHandle, external_id: String) -> Result<(), String> {
    activity::clear(&app, &external_id).await
}

#[tauri::command]
pub fn set_pinned(pinned: bool) {
    crate::PINNED.store(pinned, std::sync::atomic::Ordering::Relaxed);
}

#[tauri::command]
pub fn hide_window(app: AppHandle) {
    crate::PINNED.store(false, std::sync::atomic::Ordering::Relaxed);
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.hide();
    }
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}
