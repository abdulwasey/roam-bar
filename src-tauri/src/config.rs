use crate::models::RoamUser;
use keyring::Entry;

const SERVICE: &str = "com.realbrokerage.roambar";

pub const TOKEN: &str = "roam_token";
pub const USER_ID: &str = "roam_user_id";
pub const USER_NAME: &str = "roam_user_name";
pub const USER_EMAIL: &str = "roam_user_email";
pub const USER_IMAGE: &str = "roam_user_image";

#[derive(Debug, Clone, Default)]
pub struct Config {
    pub token: String,
    pub user_id: String,
    pub user_name: String,
    pub user_email: String,
    pub user_image: String,
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

pub fn load() -> Config {
    Config {
        token: get(TOKEN).unwrap_or_else(|| crate::secrets::ROAM_TOKEN.to_string()),
        user_id: get(USER_ID).unwrap_or_default(),
        user_name: get(USER_NAME).unwrap_or_default(),
        user_email: get(USER_EMAIL).unwrap_or_default(),
        user_image: get(USER_IMAGE).unwrap_or_default(),
    }
}

pub fn save_token(token: &str) -> Result<(), String> {
    let token = token.trim();
    if token.is_empty() {
        return Ok(());
    }
    set(TOKEN, token)
}

pub fn save_identity(user: &RoamUser) -> Result<(), String> {
    set(USER_ID, &user.id)?;
    set(USER_NAME, &user.name)?;
    set(USER_EMAIL, &user.email)?;
    set(USER_IMAGE, user.image_url.as_deref().unwrap_or(""))
}
