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
    label: 'Chaos',
    presets: [
      p('rabbit-hole', '🐇', 'Down a rabbit hole', 'purple', 45, { subtitle: 'Send help' }),
      p('flaky', '🎰', 'Retrying the flaky test', 'orange', 30, { subtitle: 'It passed locally' }),
      p('waiting-ci', '🫠', 'Waiting on CI', 'gray', 30, { subtitle: 'Agent contention' }),
      p('rebase', '🧙', 'Rebasing', 'indigo', 30, { subtitle: 'Conflicts everywhere', dnd: true }),
      p('spaghetti', '🍝', 'Untangling spaghetti', 'gold', 45, { subtitle: 'Legacy code' }),
      p('rubber-duck', '🦆', 'Rubber ducking', 'yellow', 20, { subtitle: 'Talking to myself' }),
      p('claude', '🤖', 'Pairing with Claude', 'teal', 60, { subtitle: 'Reviewing the robot' }),
      p('deleting', '🧹', 'Deleting code', 'green', 30, { subtitle: 'Best kind of PR' }),
      p('naming', '🏷️', 'Naming things', 'pink', 15, { subtitle: 'The hard problem' }),
      p('repro', '🔬', 'Reproducing a bug', 'orange', 45, { subtitle: 'Works on my machine' }),
      p('hotfix', '🧯', 'Hotfixing prod', 'red', 60, { subtitle: 'Do not disturb', dnd: true, keepAlive: true }),
      p('estimating', '🔮', 'Estimating tickets', 'purple', 30, { subtitle: 'Guessing confidently' }),
      p('git-blame', '🕵️', 'Reading git blame', 'gray', 15, { subtitle: 'It was me' }),
      p('npm', '⏳', 'Waiting on npm install', 'gray', 10),
      p('context', '🤹', 'Context switching', 'lime', 30, { subtitle: 'Six tabs deep' }),
      p('zombie', '🧟', 'Reviving a dead branch', 'green', 45, { subtitle: 'Three months old' }),
    ],
  },
];

export const PRESETS: Preset[] = PRESET_GROUPS.flatMap((g) => g.presets);
