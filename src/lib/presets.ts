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
  group?: string;
}

export interface PresetGroup {
  label: string;
  presets: Preset[];
}

const p = (
  id: string,
  emoji: string,
  title: string,
  color: RoamColor,
  minutes: number,
  opts: { subtitle?: string; dnd?: boolean; keepAlive?: boolean } = {},
): Preset => ({
  id,
  emoji,
  title,
  color,
  minutes,
  subtitle: opts.subtitle,
  dnd: opts.dnd ?? false,
  keepAlive: opts.keepAlive ?? false,
});

export const PRESET_GROUPS: PresetGroup[] = [
  {
    label: 'Meetings',
    presets: [
      p('call', '📞', 'On a call', 'red', 30, { dnd: true }),
      p('meeting', '🎥', 'In a meeting', 'red', 60, { dnd: true }),
      p('customer', '🤝', 'Customer call', 'red', 45, { dnd: true }),
      p('presenting', '🎤', 'Presenting', 'red', 30, { subtitle: 'Screen is shared', dnd: true }),
      p('interview', '🗣️', 'Interviewing', 'red', 60, { dnd: true }),
      p('pairing', '👥', 'Pairing', 'blue', 60),
    ],
  },
  {
    label: 'Focus',
    presets: [
      p('focus', '🧠', 'Deep work', 'purple', 60, { subtitle: 'Heads down', dnd: true, keepAlive: true }),
      p('headphones', '🎧', 'Headphones on', 'purple', 60, { subtitle: 'Not ignoring you', dnd: true }),
      p('coding', '💻', 'Coding', 'indigo', 60, { keepAlive: true }),
      p('writing', '📝', 'Writing', 'blue', 45, { subtitle: 'Docs and tickets' }),
      p('designing', '🎨', 'Designing', 'pink', 60, { subtitle: 'In Figma' }),
      p('planning', '🗺️', 'Planning', 'teal', 45),
      p('learning', '📚', 'Reading', 'gold', 45, { subtitle: 'Docs, RFCs, papers' }),
      p('thinking', '🤔', 'Thinking', 'purple', 20),
    ],
  },
  {
    label: 'Engineering',
    presets: [
      p('review', '🔀', 'Reviewing PRs', 'green', 30),
      p('debugging', '🐛', 'Debugging', 'orange', 45, { dnd: true }),
      p('testing', '🧪', 'Testing', 'teal', 30),
      p('deploy', '🚀', 'Deploying', 'orange', 30, { subtitle: 'Watching the pipeline' }),
      p('ci', '⏳', 'Waiting on CI', 'gray', 30),
      p('incident', '🚨', 'Incident', 'red', 60, { subtitle: 'Do not disturb', dnd: true, keepAlive: true }),
    ],
  },
];

export const PRESETS: Preset[] = PRESET_GROUPS.flatMap((g) => g.presets);
