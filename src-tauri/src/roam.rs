use crate::config::Config;
use crate::models::{Activity, ActivityDisplay, RoamUser};
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

const BASE: &str = "https://api.ro.am/v1";
pub const EXTERNAL_ID: &str = "roambar:status";
const MAX_PAGES: usize = 50;

#[derive(Deserialize)]
struct ApiError {
    message: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UserListResponse {
    users: Vec<RoamUser>,
    next_cursor: Option<String>,
}

#[derive(Deserialize)]
struct ActivityListResponse {
    activities: Vec<Activity>,
}

fn require(cfg: &Config) -> Result<(), String> {
    if cfg.token.is_empty() {
        return Err("Roam token not set. Open Settings and paste a personal access token.".into());
    }
    Ok(())
}

async fn check(resp: reqwest::Response) -> Result<reqwest::Response, String> {
    let status = resp.status();
    if status.is_success() {
        return Ok(resp);
    }
    let text = resp.text().await.unwrap_or_default();
    let detail = serde_json::from_str::<ApiError>(&text)
        .ok()
        .and_then(|e| e.message.or(e.error))
        .unwrap_or(text);
    Err(format!("Roam {}: {}", status.as_u16(), detail))
}

fn get(cfg: &Config, path: &str) -> reqwest::RequestBuilder {
    Client::new()
        .get(format!("{BASE}/{path}"))
        .bearer_auth(&cfg.token)
        .header("Accept", "application/json")
}

fn post(cfg: &Config, path: &str) -> reqwest::RequestBuilder {
    Client::new()
        .post(format!("{BASE}/{path}"))
        .bearer_auth(&cfg.token)
        .header("Accept", "application/json")
}

pub async fn resolve_user(cfg: &Config) -> Result<RoamUser, String> {
    require(cfg)?;
    let wanted = cfg.email.trim().to_lowercase();
    if wanted.is_empty() {
        return Err("Email not set. Enter the email you use in Roam.".into());
    }
    let mut cursor: Option<String> = None;
    for _ in 0..MAX_PAGES {
        let mut req = get(cfg, "user.list").query(&[("limit", "200")]);
        if let Some(c) = &cursor {
            req = req.query(&[("cursor", c)]);
        }
        let resp = check(req.send().await.map_err(|e| e.to_string())?).await?;
        let page: UserListResponse = resp.json().await.map_err(|e| e.to_string())?;
        if let Some(u) = page.users.into_iter().find(|u| u.email.to_lowercase() == wanted) {
            return Ok(u);
        }
        match page.next_cursor {
            Some(c) if !c.is_empty() => cursor = Some(c),
            _ => break,
        }
    }
    Err(format!("No Roam user found with email {wanted}"))
}

pub async fn set_activity(
    cfg: &Config,
    display: &ActivityDisplay,
    ttl_seconds: u32,
    dnd: bool,
) -> Result<Activity, String> {
    require(cfg)?;
    if cfg.user_id.is_empty() {
        return Err("User not resolved yet. Save your email in Settings first.".into());
    }
    let body = json!({
        "userId": cfg.user_id,
        "externalId": EXTERNAL_ID,
        "display": display,
        "ttlSeconds": ttl_seconds.clamp(30, 3600),
        "dnd": dnd,
    });
    let resp = post(cfg, "user.activity.set")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    check(resp).await?.json().await.map_err(|e| e.to_string())
}

pub async fn clear_activity(cfg: &Config, external_id: &str) -> Result<(), String> {
    require(cfg)?;
    let body = json!({ "userId": cfg.user_id, "externalId": external_id });
    let resp = post(cfg, "user.activity.clear")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    check(resp).await.map(|_| ())
}

pub async fn list_activities(cfg: &Config) -> Result<Vec<Activity>, String> {
    require(cfg)?;
    if cfg.user_id.is_empty() {
        return Ok(vec![]);
    }
    let resp = get(cfg, "user.activity.list")
        .query(&[("userId", &cfg.user_id)])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let page: ActivityListResponse = check(resp).await?.json().await.map_err(|e| e.to_string())?;
    Ok(page.activities)
}
