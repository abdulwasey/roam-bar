use crate::config;
use crate::heartbeat::Heartbeat;
use crate::models::{Activity, ActivityState, SetActivityInput};
use crate::roam;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Default)]
pub struct Source(Mutex<Option<String>>);

impl Source {
    pub fn get(&self) -> Option<String> {
        self.0.lock().unwrap().clone()
    }
    fn set(&self, v: Option<String>) {
        *self.0.lock().unwrap() = v;
    }
}

fn update_tray(app: &AppHandle, activities: &[Activity]) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let title = activities.first().map(|a| a.display.emoji.clone());
        let _ = tray.set_title(title);
    }
}

fn notify(app: &AppHandle) {
    let _ = app.emit("activity-changed", ());
}

pub async fn state(app: &AppHandle) -> Result<ActivityState, String> {
    let cfg = config::load();
    let activities = roam::list_activities(&cfg).await?;
    update_tray(app, &activities);
    let heartbeat = app.state::<Heartbeat>();
    let source = app.state::<Source>();
    if !activities.iter().any(|a| a.external_id == roam::EXTERNAL_ID) {
        heartbeat.stop();
        source.set(None);
    }
    Ok(ActivityState {
        activities,
        keep_alive: heartbeat.is_running(),
        source: source.get(),
    })
}

pub async fn set(app: &AppHandle, input: SetActivityInput, from: Option<String>) -> Result<Activity, String> {
    let cfg = config::load();
    let activity = roam::set_activity(&cfg, &input.display, input.ttl_seconds, input.dnd).await?;
    let heartbeat = app.state::<Heartbeat>();
    if input.keep_alive {
        heartbeat.start(input.display.clone(), input.ttl_seconds, input.dnd);
    } else {
        heartbeat.stop();
    }
    app.state::<Source>().set(from);
    update_tray(app, std::slice::from_ref(&activity));
    notify(app);
    Ok(activity)
}

pub async fn clear(app: &AppHandle, external_id: &str) -> Result<(), String> {
    let cfg = config::load();
    roam::clear_activity(&cfg, external_id).await?;
    if external_id == roam::EXTERNAL_ID {
        app.state::<Heartbeat>().stop();
        app.state::<Source>().set(None);
    }
    let remaining = roam::list_activities(&cfg).await.unwrap_or_default();
    update_tray(app, &remaining);
    notify(app);
    Ok(())
}

pub async fn touch(app: &AppHandle, ttl_seconds: u32) -> Result<Option<Activity>, String> {
    let cfg = config::load();
    let current = roam::list_activities(&cfg)
        .await?
        .into_iter()
        .find(|a| a.external_id == roam::EXTERNAL_ID);
    let Some(current) = current else {
        return Ok(None);
    };
    let activity = roam::set_activity(&cfg, &current.display, ttl_seconds, current.dnd).await?;
    notify(app);
    Ok(Some(activity))
}
