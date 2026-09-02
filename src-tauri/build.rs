fn main() {
    println!("cargo:rerun-if-env-changed=ROAM_DEV_TOKEN");
    tauri_build::build()
}
