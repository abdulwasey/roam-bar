import data from './emoji-data.json';

export interface EmojiEntry {
  e: string;
  name: string;
}

export interface EmojiGroup {
  label: string;
  emojis: EmojiEntry[];
}

const SUGGESTED = ['💻', '🧠', '📝', '📚', '🎨', '🔀', '🐛', '🧪', '🚀', '⚙️', '🏷️', '🧩', '🗺️', '📊', '🔧', '🔍', '💡', '🎯', '📞', '🎥', '💬', '🎧', '🤝', '👥', '🍽️', '☕', '🌿', '🏃', '🚗', '🏠', '🔥', '🚨', '⚡', '✨', '🎉', '🤔', '😎', '🙏', '🫡', '🤖'];

const ALL: EmojiGroup[] = (data as { label: string; emojis: [string, string][] }[]).map((g) => ({
  label: g.label,
  emojis: g.emojis.map(([e, name]) => ({ e, name })),
}));

const byEmoji = new Map<string, EmojiEntry>();
for (const g of ALL) for (const entry of g.emojis) byEmoji.set(entry.e, entry);

export const EMOJI_GROUPS: EmojiGroup[] = [
  { label: 'Suggested', emojis: SUGGESTED.map((e) => byEmoji.get(e) ?? { e, name: '' }) },
  ...ALL,
];

export function searchEmojis(query: string): EmojiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: EmojiEntry[] = [];
  for (const g of ALL) {
    for (const entry of g.emojis) {
      if (entry.name.includes(q)) {
        out.push(entry);
        if (out.length >= 120) return out;
      }
    }
  }
  return out;
}
