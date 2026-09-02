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
    label: 'E2E',
    presets: [
      p('pw-writing', '🎭', 'Writing Playwright specs', 'purple', 60, { subtitle: 'Runner pattern, page objects' }),
      p('pw-suite', '🕰️', 'Waiting for the E2E suite', 'gray', 60, { subtitle: '30 min plus queue' }),
      p('pw-rerun', '🔁', 'Rerunning failed specs', 'orange', 30, { subtitle: '/ci rerun-failed' }),
      p('pw-trace', '🎞️', 'Reading a Playwright trace', 'blue', 30, { subtitle: 'Frame by frame' }),
      p('pw-assert', '🧿', 'Fixing a web-first assertion', 'teal', 30, { subtitle: 'toBeVisible, eventually' }),
      p('pw-seed', '🌱', 'Seeding test data', 'green', 20, { subtitle: 'No hardcoded names' }),
      p('pw-timeout', '🐢', 'Chasing a timeout', 'gold', 45, { subtitle: '30s was not enough' }),
      p('pw-affected', '🎯', 'Tagging affected specs', 'lime', 20, { subtitle: 'Path to tag mapping' }),
    ],
  },
  {
    label: 'Mobile',
    presets: [
      p('metro', '📱', 'Building real-app', 'blue', 45, { subtitle: 'Metro is bundling' }),
      p('xcode', '🍎', 'Waiting on Xcode', 'gray', 60, { subtitle: 'Archiving, still' }),
      p('gradle', '🐘', 'Android build', 'green', 45, { subtitle: 'Gradle is thinking' }),
      p('pods', '🧊', 'Pod install', 'gray', 20, { subtitle: 'CocoaPods roulette' }),
      p('simulator', '🎛️', 'Testing on the simulator', 'indigo', 30, { subtitle: 'Shaking the phone' }),
      p('testflight', '🚢', 'Shipping to TestFlight', 'orange', 30, { subtitle: 'Waiting for review' }),
      p('rerender', '🔋', 'Hunting a re-render', 'red', 45, { subtitle: 'Profiler open' }),
      p('offline', '📴', 'Testing offline mode', 'gray', 20, { subtitle: 'Airplane mode on' }),
    ],
  },
  {
    label: 'Dev life',
    presets: [
      p('shipping', '🧑‍💻', 'Just shipping', 'green', 30, { subtitle: 'Green checks everywhere' }),
      p('rtfm', '📖', 'Reading the docs', 'blue', 30, { subtitle: 'Actually reading them' }),
      p('docker', '🐳', 'Docker is downloading', 'gray', 20, { subtitle: 'A 4 GB image' }),
      p('rotate', '🔑', 'Rotating a token', 'red', 15, { subtitle: 'It leaked somewhere' }),
      p('devenv', '🧰', 'Fixing my dev environment', 'orange', 30, { subtitle: 'nvm use, again' }),
      p('tutorial', '🎓', 'Learning a new framework', 'purple', 60, { subtitle: 'Tutorial hell' }),
      p('cors', '🌐', 'Debugging CORS', 'red', 30, { subtitle: 'It is always CORS' }),
      p('so', '🕳️', 'Stack Overflow spelunking', 'gold', 20, { subtitle: 'Answer from 2013' }),
      p('bikeshed', '🚲', 'Bikeshedding', 'yellow', 15, { subtitle: 'Tabs vs spaces' }),
      p('cache', '💾', 'Cache invalidation', 'teal', 30, { subtitle: 'One of the two hard things' }),
      p('rfc', '🔭', 'Reading the RFC', 'indigo', 45, { subtitle: 'Section 4.2' }),
      p('bundle', '🗜️', 'Shrinking the bundle', 'lime', 45, { subtitle: 'Every KB counts' }),
      p('types', '🧩', 'Fighting TypeScript', 'blue', 30, { subtitle: 'as unknown as any' }),
      p('regex', '🧶', 'Writing a regex', 'pink', 20, { subtitle: 'Now I have two problems' }),
    ],
  },
  {
    label: 'Product',
    presets: [
      p('roadmap', '🗺️', 'Roadmapping', 'blue', 60, { subtitle: 'Moving boxes to Q4' }),
      p('prd', '📋', 'Writing a PRD', 'indigo', 60, { subtitle: 'Someone will read it' }),
      p('prioritizing', '🎯', 'Prioritizing', 'orange', 30, { subtitle: 'Everything is P0' }),
      p('user-interview', '🧑‍🤝‍🧑', 'User interview', 'green', 45, { subtitle: 'Nodding thoughtfully', dnd: true }),
      p('metrics', '📈', 'Staring at metrics', 'teal', 30, { subtitle: 'Line goes sideways' }),
      p('saying-no', '🙅', 'Saying no nicely', 'pink', 30, { subtitle: 'It is on the roadmap' }),
      p('stakeholders', '🎤', 'Stakeholder update', 'red', 30, { subtitle: 'Slides at 11', dnd: true }),
      p('competitor', '🔭', 'Competitor research', 'purple', 45, { subtitle: 'They shipped it first' }),
    ],
  },
  {
    label: 'Project',
    presets: [
      p('gantt', '📅', 'Updating the Gantt', 'blue', 30, { subtitle: 'It slipped again' }),
      p('estimates', '⏱️', 'Chasing estimates', 'gold', 30, { subtitle: 'It depends' }),
      p('scope-creep', '🧯', 'Managing scope creep', 'orange', 45, { subtitle: 'Just one more thing' }),
      p('status-report', '📣', 'Status report', 'green', 30, { subtitle: 'Green with a hint of amber' }),
      p('unblocking', '🧩', 'Unblocking people', 'teal', 45, { subtitle: 'Herding cats' }),
      p('notes', '🗒️', 'Meeting notes', 'gray', 20, { subtitle: 'Action items for everyone' }),
      p('sprint-planning', '📊', 'Sprint planning', 'indigo', 60, { subtitle: 'Velocity is a suggestion', dnd: true }),
      p('risk', '🚦', 'Risk register', 'red', 30, { subtitle: 'All of them are red' }),
    ],
  },
  {
    label: 'Backend',
    presets: [
      p('migration', '🗄️', 'Writing migrations', 'indigo', 45, { subtitle: 'The down migration is a prayer' }),
      p('query', '🐘', 'Tuning a query', 'blue', 45, { subtitle: 'EXPLAIN ANALYZE' }),
      p('auth', '🔐', 'Debugging auth', 'red', 45, { subtitle: '401, again' }),
      p('microservices', '🕸️', 'Untangling microservices', 'purple', 60, { subtitle: 'yenta called arrakis called hermes' }),
      p('queue', '📨', 'Debugging a queue', 'orange', 45, { subtitle: 'The messages went somewhere' }),
      p('logs', '📜', 'Reading logs', 'gray', 30, { subtitle: 'grep ERROR' }),
      p('spec', '🧬', 'Writing the OpenAPI spec', 'teal', 45, { subtitle: 'Frontend is waiting' }),
      p('jvm', '☕', 'Waiting for the JVM', 'gold', 15, { subtitle: 'Spring is booting' }),
      p('dns', '🔥', 'Prod is on fire', 'red', 60, { subtitle: 'It is DNS', dnd: true, keepAlive: true }),
      p('load-test', '🏋️', 'Load testing', 'lime', 45, { subtitle: 'p99 went to lunch' }),
    ],
  },
  {
    label: 'AI',
    presets: [
      p('prompting', '🪄', 'Prompt engineering', 'purple', 45, { subtitle: 'Please please please' }),
      p('training', '🧠', 'Training a model', 'indigo', 60, { subtitle: 'Loss goes brrr', keepAlive: true }),
      p('evals', '🧪', 'Running evals', 'teal', 45, { subtitle: '0.72 to 0.73, huge' }),
      p('vibes', '🎲', 'Vibes-based evaluation', 'pink', 30, { subtitle: 'Looks right to me' }),
      p('tokens', '💸', 'Watching token spend', 'gold', 30, { subtitle: 'Context window go boom' }),
      p('rag', '📚', 'Building RAG', 'blue', 60, { subtitle: 'Chunks all the way down' }),
      p('hallucination', '🕵️', 'Hallucination hunting', 'orange', 45, { subtitle: 'That API does not exist' }),
      p('rate-limit', '🚧', 'Rate limited', 'red', 15, { subtitle: '429 city' }),
      p('agent-loop', '🔁', 'Agent is looping', 'purple', 30, { subtitle: 'Tool call 47 of ?' }),
      p('mcp', '🔌', 'Wiring an MCP server', 'green', 45, { subtitle: 'Tools all the way down' }),
    ],
  },
  {
    label: 'QA',
    presets: [
      p('cannot-repro', '🐞', 'Reproducing a bug', 'orange', 45, { subtitle: 'Cannot reproduce' }),
      p('regression', '✅', 'Regression testing', 'green', 60, { subtitle: 'Clicking all the things' }),
      p('test-cases', '📋', 'Writing test cases', 'blue', 45, { subtitle: 'Edge cases only' }),
      p('break-things', '🧨', 'Breaking things on purpose', 'red', 45, { subtitle: 'It is my job' }),
      p('exploratory', '🔍', 'Exploratory testing', 'teal', 30, { subtitle: 'What does this button do' }),
      p('bug-report', '📝', 'Filing bugs', 'gold', 30, { subtitle: 'Steps to reproduce: exist' }),
    ],
  },
  {
    label: 'Design',
    presets: [
      p('figma', '🎨', 'In Figma', 'pink', 60, { subtitle: 'Auto layout is fighting back' }),
      p('one-px', '📐', 'Nudging by 1px', 'purple', 30, { subtitle: 'It matters' }),
      p('components', '🧩', 'Building components', 'indigo', 60, { subtitle: 'Variants of variants' }),
      p('crit', '🗣️', 'Design crit', 'red', 45, { subtitle: 'Have you tried…', dnd: true }),
      p('colors', '🌈', 'Choosing colors', 'gold', 30, { subtitle: 'Fifty shades of gray' }),
      p('handoff', '🤝', 'Dev handoff', 'green', 30, { subtitle: 'It is all in the file' }),
      p('icons', '✏️', 'Drawing icons', 'teal', 45, { subtitle: '24px of suffering' }),
    ],
  },
  {
    label: 'Mood',
    presets: [
      p('headdesk', '🤕', 'Banging my head on the keyboard', 'red', 30, { subtitle: 'jjjjjjjjjjjj' }),
      p('regret', '🫠', 'Busy regretting life choices', 'purple', 45, { subtitle: 'Should have been a farmer' }),
      p('dont-call', '📵', "Don't call me", 'red', 60, { subtitle: 'I hate working', dnd: true }),
      p('fine', '🔥', 'This is fine', 'orange', 30, { subtitle: 'Everything is on fire' }),
      p('coffee-needed', '🫗', 'Running on caffeine', 'gold', 30, { subtitle: 'Cup number four' }),
      p('monday', '🗓️', 'It is Monday', 'gray', 60, { subtitle: 'Approach with caution' }),
      p('friday', '🎉', 'It is Friday', 'green', 60, { subtitle: 'Mentally at the beach' }),
      p('existential', '🌌', 'Staring into the void', 'indigo', 20, { subtitle: 'The void stares back' }),
      p('nap', '😴', 'Powering down', 'gray', 20, { subtitle: 'Not asleep, resting my eyes' }),
      p('crying', '😭', 'Crying in TypeScript', 'blue', 30, { subtitle: 'Type instantiation is excessively deep' }),
      p('screaming', '😱', 'Internal screaming', 'red', 15, { subtitle: 'External calm' }),
      p('zen', '🧘', 'Practicing patience', 'teal', 30, { subtitle: 'CI is on attempt 4' }),
      p('lucky', '🍀', 'Feeling lucky', 'lime', 30, { subtitle: 'Pushing without running tests' }),
      p('sarcasm', '🙃', 'Everything is great', 'yellow', 30, { subtitle: 'Definitely not sarcasm' }),
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
