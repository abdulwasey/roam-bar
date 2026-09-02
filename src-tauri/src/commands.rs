use crate::config::{self, Config};
use crate::heartbeat::Heartbeat;
use crate::models::{Activity, ActivityState, AppConfigInput, ConfigStatus, RoamUser, SetActivityInput};
use crate::roam;
use tauri::{AppHandle, Manager, State};

async fn load_cfg() -> Result<Config, String> {
    let cfg = config::load();
    if !cfg.user_id.is_empty() || cfg.token.is_empty() {
        return Ok(cfg);
    }
    let user = roam::resolve_user(&cfg).await?;
    config::save_identity(&user)?;
    Ok(config::load())
}

fn update_tray(app: &AppHandle, activities: &[Activity]) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let title = activities.first().map(|a| a.display.emoji.clone());
        let _ = tray.set_title(title);
    }
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
pub async fn get_activities(
    app: AppHandle,
    heartbeat: State<'_, Heartbeat>,
) -> Result<ActivityState, String> {
    let cfg = load_cfg().await?;
    let activities = roam::list_activities(&cfg).await?;
    update_tray(&app, &activities);
    if activities.is_empty() {
        heartbeat.stop();
    }
    Ok(ActivityState {
        activities,
        keep_alive: heartbeat.is_running(),
    })
}

#[tauri::command]
pub async fn set_activity(
    app: AppHandle,
    heartbeat: State<'_, Heartbeat>,
    input: SetActivityInput,
) -> Result<Activity, String> {
    let cfg = load_cfg().await?;
    let activity = roam::set_activity(&cfg, &input.display, input.ttl_seconds, input.dnd).await?;
    if input.keep_alive {
        heartbeat.start(input.display.clone(), input.ttl_seconds, input.dnd);
    } else {
        heartbeat.stop();
    }
    update_tray(&app, std::slice::from_ref(&activity));
    Ok(activity)
}

#[tauri::command]
pub async fn clear_activity(
    app: AppHandle,
    heartbeat: State<'_, Heartbeat>,
    external_id: String,
) -> Result<(), String> {
    let cfg = config::load();
    roam::clear_activity(&cfg, &external_id).await?;
    if external_id == roam::EXTERNAL_ID {
        heartbeat.stop();
    }
    let remaining = roam::list_activities(&cfg).await.unwrap_or_default();
    update_tray(&app, &remaining);
    Ok(())
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
