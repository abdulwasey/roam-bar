import { PRESET_GROUPS, type Preset, type PresetGroup } from './presets';
import { loadPresets, savePresets } from './api';

export interface PresetStore {
  hidden: string[];
  overrides: Record<string, Preset>;
  custom: Preset[];
}

const KEY = 'roambar.presets.v1';
export const CUSTOM_GROUP = 'Yours';

export const emptyStore = (): PresetStore => ({ hidden: [], overrides: {}, custom: [] });

function parseStore(raw: string | null): PresetStore | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PresetStore>;
    return {
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
      overrides: parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {},
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
    };
  } catch {
    return null;
  }
}

function readLocal(): PresetStore | null {
  try {
    return parseStore(window.localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function loadStore(): PresetStore {
  return readLocal() ?? emptyStore();
}

export async function loadStoreFromDisk(): Promise<PresetStore> {
  const fromDisk = parseStore(await loadPresets().catch(() => null));
  if (fromDisk) return fromDisk;
  const local = readLocal();
  if (local) await savePresets(JSON.stringify(local)).catch(() => undefined);
  return local ?? emptyStore();
}

export function saveStore(store: PresetStore): void {
  const json = JSON.stringify(store);
  savePresets(json).catch(() => undefined);
  try {
    window.localStorage.setItem(KEY, json);
  } catch {
    return;
  }
}

export function isCustomId(id: string): boolean {
  return id.startsWith('custom:');
}

export function buildGroups(store: PresetStore): PresetGroup[] {
  const groups: PresetGroup[] = [];
  if (store.custom.length) groups.push({ label: CUSTOM_GROUP, presets: store.custom });
  for (const g of PRESET_GROUPS) {
    const presets = g.presets.filter((p) => !store.hidden.includes(p.id)).map((p) => store.overrides[p.id] ?? p);
    if (presets.length) groups.push({ label: g.label, presets });
  }
  return groups;
}

export function removePreset(store: PresetStore, id: string): PresetStore {
  if (isCustomId(id)) return { ...store, custom: store.custom.filter((p) => p.id !== id) };
  return { ...store, hidden: store.hidden.includes(id) ? store.hidden : [...store.hidden, id] };
}

export function upsertPreset(store: PresetStore, preset: Preset): PresetStore {
  if (isCustomId(preset.id)) {
    const exists = store.custom.some((p) => p.id === preset.id);
    return { ...store, custom: exists ? store.custom.map((p) => (p.id === preset.id ? preset : p)) : [preset, ...store.custom] };
  }
  return { ...store, overrides: { ...store.overrides, [preset.id]: preset } };
}

export function rememberCustom(store: PresetStore, preset: Omit<Preset, 'id'>): PresetStore {
  const same = store.custom.find((p) => p.emoji === preset.emoji && p.title === preset.title);
  const entry: Preset = { ...preset, id: same?.id ?? `custom:${Date.now()}` };
  const rest = store.custom.filter((p) => p.id !== entry.id);
  return { ...store, custom: [entry, ...rest].slice(0, 30) };
}
