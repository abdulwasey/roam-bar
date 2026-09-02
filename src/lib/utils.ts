export function minutesLeft(expiresAt: string, now = Date.now()): number {
  const ms = new Date(expiresAt).getTime() - now;
  return Math.max(0, Math.ceil(ms / 60000));
}

export function formatRemaining(expiresAt: string, now = Date.now()): string {
  const mins = minutesLeft(expiresAt, now);
  if (mins <= 0) return 'expiring';
  if (mins < 60) return `${mins} min left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h left` : `${h} h ${m} min left`;
}

export function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
