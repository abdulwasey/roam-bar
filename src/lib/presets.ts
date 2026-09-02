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
    label: 'Focus',
    presets: [
      p('focus', '🧠', 'Deep work', 'purple', 60, { subtitle: 'Heads down', dnd: true, keepAlive: true }),
      p('coding', '💻', 'Coding', 'indigo', 60, { keepAlive: true }),
      p('debugging', '🐛', 'Debugging', 'orange', 45, { dnd: true }),
      p('review', '🔀', 'Reviewing PRs', 'green', 30, { subtitle: 'bolt / real-app' }),
      p('writing', '📝', 'Writing', 'blue', 45, { subtitle: 'Docs & tickets' }),
      p('planning', '🗺️', 'Planning', 'teal', 45),
      p('design', '🎨', 'Design review', 'pink', 30, { subtitle: 'In Figma' }),
      p('learning', '📚', 'Learning', 'gold', 45),
      p('thinking', '🤔', 'Thinking', 'purple', 20),
    ],
  },
  {
    label: 'Meetings',
    presets: [
      p('call', '📞', 'On a call', 'red', 30, { dnd: true }),
      p('meeting', '🎥', 'In a meeting', 'red', 60, { dnd: true }),
      p('standup', '🧍', 'Standup', 'red', 15, { dnd: true }),
      p('one-on-one', '💬', '1:1', 'red', 30, { dnd: true }),
      p('pairing', '👥', 'Pairing', 'blue', 60),
      p('interview', '🎧', 'Interviewing', 'red', 60, { dnd: true }),
      p('demo', '🖥️', 'Demo', 'orange', 30, { dnd: true }),
      p('customer', '🤝', 'Customer call', 'red', 45, { dnd: true }),
      p('workshop', '🧑‍🏫', 'Workshop', 'gold', 60, { dnd: true, keepAlive: true }),
    ],
  },
  {
    label: 'Engineering',
    presets: [
      p('deploy', '🚀', 'Deploying', 'orange', 30, { subtitle: 'Watching the pipeline' }),
      p('ci', '⚙️', 'Watching CI', 'gray', 30),
      p('release', '🏷️', 'Cutting a release', 'lime', 45),
      p('oncall', '🚨', 'On-call', 'red', 60, { keepAlive: true }),
      p('incident', '🔥', 'Incident', 'red', 60, { dnd: true, keepAlive: true }),
      p('merging', '🧩', 'Resolving conflicts', 'orange', 30),
      p('testing', '🧪', 'Testing', 'teal', 30),
    ],
  },
  {
    label: 'Away',
    presets: [
      p('lunch', '🍽️', 'Lunch', 'gray', 45, { subtitle: 'Back soon' }),
      p('coffee', '☕', 'Coffee', 'gray', 15),
      p('snack', '🍪', 'Snack', 'gray', 10),
      p('break', '🌿', 'Short break', 'gray', 15),
      p('brb', '🏃', 'BRB', 'gray', 10),
      p('walk', '🚶', 'Walk', 'green', 30),
      p('gym', '🏋️', 'Gym', 'green', 60),
      p('commute', '🚗', 'Commuting', 'gray', 45),
      p('errand', '🛒', 'Errand', 'gray', 45),
      p('appointment', '🩺', 'Appointment', 'gray', 60, { dnd: true }),
      p('family', '👶', 'Family time', 'pink', 45, { dnd: true }),
    ],
  },
  {
    label: 'Out',
    presets: [
      p('ooo', '🌴', 'Out of office', 'gray', 60, { dnd: true, keepAlive: true }),
      p('sick', '🤒', 'Out sick', 'gray', 60, { dnd: true, keepAlive: true }),
      p('travel', '✈️', 'Traveling', 'blue', 60, { keepAlive: true }),
      p('wfh', '🏠', 'Working from home', 'blue', 60, { keepAlive: true }),
      p('office', '🏢', 'At the office', 'blue', 60, { keepAlive: true }),
      p('done', '🌙', 'Done for the day', 'indigo', 60, { dnd: true, keepAlive: true }),
    ],
  },
];

export const PRESETS: Preset[] = PRESET_GROUPS.flatMap((g) => g.presets);
