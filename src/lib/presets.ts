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
      p('headphones', '🎧', 'Headphones on', 'purple', 60, { subtitle: 'Not ignoring you, in the zone', dnd: true }),
      p('spelunking', '🧑‍🚀', 'Deep in the codebase', 'indigo', 60, { subtitle: 'No signal down here', keepAlive: true }),
      p('pixels', '📐', 'Pixel pushing', 'pink', 30, { subtitle: 'Chasing 1px' }),
      p('thread', '🧵', 'Pulling a thread', 'gold', 45, { subtitle: 'Started as a one-liner' }),
      p('refactor', '🪄', 'Refactoring', 'teal', 45, { subtitle: 'It was supposed to be a rename' }),
      p('astronaut', '🧭', 'Architecture astronaut', 'blue', 45, { subtitle: 'Drawing boxes and arrows' }),
      p('ticket', '🗒️', 'Writing the ticket', 'gray', 20, { subtitle: 'Terse, trust the dev' }),
      p('reading-pr', '🔎', 'Reading the PR description', 'green', 15, { subtitle: 'Actually reading it' }),
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
      p('presenting', '🎤', 'Presenting', 'red', 30, { subtitle: 'Screen is shared, be kind', dnd: true }),
      p('email-meeting', '🛋️', 'Meeting that could be an email', 'gray', 30, { subtitle: 'Cam off' }),
      p('fly', '🤫', 'Fly on the wall', 'gray', 45, { subtitle: 'Muted, listening' }),
      p('design-court', '🧑‍⚖️', 'Design review court', 'pink', 30, { subtitle: 'Defending the padding', dnd: true }),
      p('retro', '🗳️', 'Retro', 'teal', 60, { subtitle: 'Bringing stickies' }),
      p('grooming', '🔁', 'Backlog grooming', 'gold', 60, { subtitle: 'Closing tickets from 2019' }),
      p('icebreaker', '🧊', 'Icebreaker round', 'blue', 15, { subtitle: 'Two truths and a lie' }),
      p('demo-watch', '🍿', 'Watching a demo', 'orange', 30, { subtitle: 'Popcorn on' }),
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
      p('agents', '🏗️', 'Waiting on TeamCity agents', 'gray', 45, { subtitle: 'Queue of doom' }),
      p('force-push', '🧨', 'Force pushing', 'red', 10, { subtitle: 'Carefully', dnd: true }),
      p('deps', '📦', 'Bumping dependencies', 'gold', 30, { subtitle: 'Fighting yarn.lock' }),
      p('husky', '🪝', 'Fixing the pre-commit hook', 'orange', 20, { subtitle: 'Husky bit me' }),
      p('e2e', '🧑‍🔧', 'Fixing E2E', 'teal', 45, { subtitle: 'Playwright says no' }),
      p('openapi', '🧬', 'Regenerating OpenAPI clients', 'indigo', 15, { subtitle: 'Slow spec, 50 seconds' }),
      p('mfe', '🌉', 'Debugging Module Federation', 'purple', 60, { subtitle: "reading 'pathname'", dnd: true }),
      p('coverage', '🧾', 'Appeasing the coverage gate', 'lime', 30, { subtitle: 'new-code-coverage is red' }),
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
