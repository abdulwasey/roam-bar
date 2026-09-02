export const ROAM_COLORS = [
  'blue',
  'gold',
  'gray',
  'green',
  'indigo',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

export type RoamColor = (typeof ROAM_COLORS)[number];

export interface ActivityDisplay {
  emoji: string;
  title: string;
  subtitle?: string;
  color?: RoamColor;
}

export interface Activity {
  userId: string;
  externalId: string;
  display: ActivityDisplay;
  dnd: boolean;
  startedAt: string;
  expiresAt: string;
}

export interface SetActivityInput {
  display: ActivityDisplay;
  ttlSeconds: number;
  dnd: boolean;
  keepAlive: boolean;
}

export interface ActivityState {
  activities: Activity[];
  keepAlive: boolean;
}

export interface ConfigStatus {
  configured: boolean;
  email: string;
  userId: string;
  userName: string;
}

export interface AppConfig {
  token: string;
  email: string;
}

export interface RoamUser {
  id: string;
  name: string;
  email: string;
}
