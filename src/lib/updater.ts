import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateInfo {
  version: string;
  notes?: string;
  raw: Update;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const update = await check({ timeout: 15000 });
  if (!update) return null;
  return { version: update.version, notes: update.body ?? undefined, raw: update };
}

export async function installUpdate(info: UpdateInfo): Promise<void> {
  await info.raw.downloadAndInstall();
  await relaunch();
}
