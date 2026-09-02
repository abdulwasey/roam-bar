use keyring::Entry;

const SERVICE: &str = "com.realbrokerage.roambar";

pub const TOKEN: &str = "roam_token";
pub const EMAIL: &str = "roam_email";
pub const USER_ID: &str = "roam_user_id";
pub const USER_NAME: &str = "roam_user_name";

#[derive(Debug, Clone, Default)]
pub struct Config {
    pub token: String,
    pub email: String,
    pub user_id: String,
    pub user_name: String,
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
        email: get(EMAIL).unwrap_or_else(|| crate::secrets::ROAM_EMAIL.to_string()),
        user_id: get(USER_ID).unwrap_or_default(),
        user_name: get(USER_NAME).unwrap_or_default(),
    }
}

pub fn save_credentials(token: &str, email: &str) -> Result<(), String> {
    if !token.trim().is_empty() {
        set(TOKEN, token.trim())?;
    }
    set(EMAIL, email.trim())
}

pub fn save_identity(user_id: &str, user_name: &str) -> Result<(), String> {
    set(USER_ID, user_id)?;
    set(USER_NAME, user_name)
}
