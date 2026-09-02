use crate::config;
use crate::models::ActivityDisplay;
use crate::roam;
use std::sync::Mutex;
use std::time::Duration;
use tauri::async_runtime::JoinHandle;

#[derive(Default)]
pub struct Heartbeat {
    handle: Mutex<Option<JoinHandle<()>>>,
}

impl Heartbeat {
    pub fn start(&self, display: ActivityDisplay, ttl_seconds: u32, dnd: bool) {
        self.stop();
        let interval = Duration::from_secs(u64::from(ttl_seconds.saturating_sub(60).max(30)));
        let handle = tauri::async_runtime::spawn(async move {
            loop {
                tokio::time::sleep(interval).await;
                let cfg = config::load();
                if let Err(e) = roam::set_activity(&cfg, &display, ttl_seconds, dnd).await {
                    crate::dlog(&format!("heartbeat: re-post failed: {e}"));
                }
            }
        });
        *self.handle.lock().unwrap() = Some(handle);
    }

    pub fn stop(&self) {
        if let Some(h) = self.handle.lock().unwrap().take() {
            h.abort();
        }
    }

    pub fn is_running(&self) -> bool {
        self.handle.lock().unwrap().is_some()
    }
}
