import type { RoamColor } from './types';

export interface Preset {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  color: RoamColor;
  minutes: number;
  dnd: boolean;
  keepAlive: boolean;
}

export const PRESETS: Preset[] = [
  { id: 'focus', emoji: '🧠', title: 'Deep work', subtitle: 'Heads down', color: 'purple', minutes: 60, dnd: true, keepAlive: true },
  { id: 'call', emoji: '📞', title: 'On a call', color: 'red', minutes: 30, dnd: true, keepAlive: false },
  { id: 'meeting', emoji: '🎥', title: 'In a meeting', color: 'red', minutes: 60, dnd: true, keepAlive: false },
  { id: 'review', emoji: '🔀', title: 'Reviewing PRs', subtitle: 'bolt / real-app', color: 'green', minutes: 30, dnd: false, keepAlive: false },
  { id: 'deploy', emoji: '🚀', title: 'Deploying', subtitle: 'Watching the pipeline', color: 'orange', minutes: 30, dnd: false, keepAlive: false },
  { id: 'pairing', emoji: '👥', title: 'Pairing', color: 'blue', minutes: 60, dnd: false, keepAlive: false },
  { id: 'lunch', emoji: '🍽️', title: 'Lunch', subtitle: 'Back soon', color: 'gray', minutes: 45, dnd: false, keepAlive: false },
  { id: 'break', emoji: '☕', title: 'Short break', color: 'gray', minutes: 15, dnd: false, keepAlive: false },
  { id: 'commute', emoji: '🚗', title: 'Commuting', color: 'gray', minutes: 45, dnd: false, keepAlive: false },
  { id: 'ooo', emoji: '🌴', title: 'Out of office', color: 'gray', minutes: 60, dnd: true, keepAlive: true },
];
