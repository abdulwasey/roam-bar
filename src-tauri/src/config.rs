use crate::models::RoamUser;
use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::RwLock;

const SERVICE: &str = "com.realbrokerage.roambar";
const TOKEN: &str = "roam_token";

#[derive(Debug, Clone, Default)]
pub struct Config {
    pub token: String,
    pub user_id: String,
    pub user_name: String,
    pub user_email: String,
    pub user_image: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Identity {
    #[serde(default)]
    user_id: String,
    #[serde(default)]
    user_name: String,
    #[serde(default)]
    user_email: String,
    #[serde(default)]
    user_image: String,
}

static CACHE: RwLock<Option<Config>> = RwLock::new(None);

fn data_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    PathBuf::from(home).join("Library/Application Support").join(SERVICE)
}

fn identity_path() -> PathBuf {
    data_dir().join("identity.json")
}

fn entry(key: &str) -> Result<Entry, String> {
    Entry::new(SERVICE, key).map_err(|e| e.to_string())
}

pub fn get(key: &str) -> Option<String> {
    match entry(key) {
        Ok(e) => match e.get_password() {
            Ok(v) if !v.is_empty() => Some(v),
            _ => None,
        },
        Err(_) => None,
    }
}

pub fn set(key: &str, value: &str) -> Result<(), String> {
    entry(key)?.set_password(value).map_err(|e| e.to_string())
}

fn read_identity() -> Identity {
    std::fs::read_to_string(identity_path())
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn write_identity(id: &Identity) -> Result<(), String> {
    let dir = data_dir();
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = identity_path();
    let tmp = path.with_extension("json.tmp");
    let json = serde_json::to_string(id).map_err(|e| e.to_string())?;
    std::fs::write(&tmp, json).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, &path).map_err(|e| e.to_string())
}

fn read_all() -> Config {
    let id = read_identity();
    Config {
        token: get(TOKEN).unwrap_or_else(|| option_env!("ROAM_DEV_TOKEN").unwrap_or("").to_string()),
        user_id: id.user_id,
        user_name: id.user_name,
        user_email: id.user_email,
        user_image: id.user_image,
    }
}

pub fn load() -> Config {
    if let Some(c) = CACHE.read().unwrap().as_ref() {
        return c.clone();
    }
    let c = read_all();
    *CACHE.write().unwrap() = Some(c.clone());
    c
}

fn invalidate() {
    *CACHE.write().unwrap() = None;
}

pub fn save_token(token: &str) -> Result<(), String> {
    let token = token.trim();
    if token.is_empty() {
        return Ok(());
    }
    set(TOKEN, token)?;
    invalidate();
    Ok(())
}

pub fn save_identity(user: &RoamUser) -> Result<(), String> {
    write_identity(&Identity {
        user_id: user.id.clone(),
        user_name: user.name.clone(),
        user_email: user.email.clone(),
        user_image: user.image_url.clone().unwrap_or_default(),
    })?;
    invalidate();
    Ok(())
}
