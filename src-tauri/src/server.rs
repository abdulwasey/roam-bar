use crate::activity::{self, Source};
use crate::models::{ActivityDisplay, SetActivityInput};
use crate::roam;
use serde::Deserialize;
use serde_json::json;
use tauri::{AppHandle, Manager};
use tiny_http::{Header, Method, Response, Server};

pub const ADDR: &str = "127.0.0.1:47831";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetBody {
    emoji: String,
    title: String,
    #[serde(default)]
    subtitle: Option<String>,
    #[serde(default)]
    color: Option<String>,
    #[serde(default)]
    minutes: Option<u32>,
    #[serde(default)]
    dnd: bool,
    #[serde(default)]
    keep_alive: bool,
    #[serde(default)]
    source: Option<String>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct ClearBody {
    #[serde(default)]
    if_source: Option<String>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct TouchBody {
    #[serde(default)]
    minutes: Option<u32>,
    #[serde(default)]
    if_source: Option<String>,
}

fn json_response(status: u16, body: serde_json::Value) -> Response<std::io::Cursor<Vec<u8>>> {
    Response::from_string(body.to_string())
        .with_status_code(status)
        .with_header(Header::from_bytes("Content-Type", "application/json").unwrap())
}

fn source_matches(app: &AppHandle, wanted: &Option<String>) -> bool {
    match wanted.as_deref().filter(|w| !w.is_empty()) {
        None => true,
        Some(w) => app.state::<Source>().get().as_deref() == Some(w),
    }
}

async fn handle(app: &AppHandle, method: &Method, path: &str, body: &str) -> (u16, serde_json::Value) {
    match (method, path) {
        (Method::Get, "/activity") => match activity::state(app).await {
            Ok(s) => (200, json!(s)),
            Err(e) => (502, json!({ "error": e })),
        },
        (Method::Post, "/activity") => {
            let Ok(b) = serde_json::from_str::<SetBody>(body) else {
                return (400, json!({ "error": "expected {emoji,title,subtitle?,color?,minutes?,dnd?,keepAlive?,source?}" }));
            };
            let input = SetActivityInput {
                display: ActivityDisplay {
                    emoji: b.emoji,
                    title: b.title,
                    subtitle: b.subtitle.filter(|s| !s.is_empty()),
                    color: b.color.filter(|s| !s.is_empty()),
                },
                ttl_seconds: b.minutes.unwrap_or(30).clamp(1, 60) * 60,
                dnd: b.dnd,
                keep_alive: b.keep_alive,
            };
            match activity::set(app, input, b.source.filter(|s| !s.is_empty())).await {
                Ok(a) => (200, json!(a)),
                Err(e) => (502, json!({ "error": e })),
            }
        }
        (Method::Post, "/clear") => {
            let b: ClearBody = serde_json::from_str(body).unwrap_or_default();
            if !source_matches(app, &b.if_source) {
                return (200, json!({ "skipped": true, "reason": "set by a different source" }));
            }
            match activity::clear(app, roam::EXTERNAL_ID).await {
                Ok(()) => (200, json!({ "cleared": true })),
                Err(e) => (502, json!({ "error": e })),
            }
        }
        (Method::Post, "/touch") => {
            let b: TouchBody = serde_json::from_str(body).unwrap_or_default();
            if !source_matches(app, &b.if_source) {
                return (200, json!({ "skipped": true, "reason": "set by a different source" }));
            }
            match activity::touch(app, b.minutes.unwrap_or(15).clamp(1, 60) * 60).await {
                Ok(Some(a)) => (200, json!(a)),
                Ok(None) => (200, json!({ "skipped": true, "reason": "nothing active" })),
                Err(e) => (502, json!({ "error": e })),
            }
        }
        _ => (404, json!({ "error": "unknown route" })),
    }
}

pub fn start(app: AppHandle) {
    std::thread::spawn(move || {
        let server = match Server::http(ADDR) {
            Ok(s) => s,
            Err(e) => {
                crate::dlog(&format!("server: bind {ADDR} failed: {e}"));
                return;
            }
        };
        crate::dlog(&format!("server: listening on {ADDR}"));
        for mut req in server.incoming_requests() {
            let mut body = String::new();
            let _ = std::io::Read::read_to_string(req.as_reader(), &mut body);
            let method = req.method().clone();
            let path = req.url().split('?').next().unwrap_or("/").to_string();
            let (status, json) = tauri::async_runtime::block_on(handle(&app, &method, &path, &body));
            let _ = req.respond(json_response(status, json));
        }
    });
}
