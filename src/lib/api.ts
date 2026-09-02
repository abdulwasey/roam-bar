import { invoke } from '@tauri-apps/api/core';
import type { Activity, ActivityState, AppConfig, ConfigStatus, RoamUser, SetActivityInput } from './types';

export function getConfigStatus(): Promise<ConfigStatus> {
  return invoke<ConfigStatus>('get_config_status');
}

export function saveConfig(config: AppConfig): Promise<RoamUser> {
  return invoke<RoamUser>('save_config', { config });
}

export function getActivities(): Promise<ActivityState> {
  return invoke<ActivityState>('get_activities');
}

export function setActivity(input: SetActivityInput): Promise<Activity> {
  return invoke<Activity>('set_activity', { input });
}

export function clearActivity(externalId: string): Promise<void> {
  return invoke<void>('clear_activity', { externalId });
}

export function setPinned(pinned: boolean): Promise<void> {
  return invoke<void>('set_pinned', { pinned });
}

export function hideWindow(): Promise<void> {
  return invoke<void>('hide_window');
}

export function quitApp(): Promise<void> {
  return invoke<void>('quit_app');
}
