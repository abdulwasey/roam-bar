import type { Activity } from './types';
import type { Preset } from './presets';

export function minutesLeft(expiresAt: string, now = Date.now()): number {
  const ms = new Date(expiresAt).getTime() - now;
  return Math.max(0, Math.ceil(ms / 60000));
}

export function formatRemaining(expiresAt: string, now = Date.now()): string {
  const mins = minutesLeft(expiresAt, now);
  if (mins <= 0) return 'Expiring';
  if (mins < 60) return `${mins} min left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h left` : `${h} h ${m} min left`;
}

export function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function isPresetActive(preset: Preset, activity: Activity | undefined): boolean {
  if (!activity) return false;
  return activity.display.emoji === preset.emoji && activity.display.title === preset.title;
}

export function matchesFilter(preset: Preset, filter: string): boolean {
  const q = filter.trim().toLowerCase();
  if (!q) return true;
  return [preset.title, preset.subtitle ?? '', preset.id].some((s) => s.toLowerCase().includes(q));
}
