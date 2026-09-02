import React from 'react';
import { Text } from '@mantine/core';
import { PRESET_GROUPS, type Preset } from '../lib/presets';
import type { Activity } from '../lib/types';
import { isPresetActive, matchesFilter } from '../lib/utils';

interface Props {
  busy: boolean;
  filter: string;
  active: Activity | undefined;
  onPick: (preset: Preset) => void;
}

const PresetGrid: React.FC<Props> = ({ busy, filter, active, onPick }) => {
  const groups = PRESET_GROUPS.map((g) => ({ ...g, presets: g.presets.filter((p) => matchesFilter(p, filter)) })).filter(
    (g) => g.presets.length > 0,
  );

  if (groups.length === 0) {
    return (
      <Text className="t3" size="xs" ta="center" py={20}>
        No preset matches “{filter.trim()}”. Use the Custom tab to set it.
      </Text>
    );
  }

  return (
    <div className="preset-groups">
      {groups.map((group) => (
        <section key={group.label} className="preset-group">
          <h3 className="preset-group-label">{group.label}</h3>
          <div className="preset-grid">
            {group.presets.map((p) => {
              const on = isPresetActive(p, active);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`preset-btn ${on ? 'preset-btn-active' : ''}`}
                  disabled={busy}
                  aria-pressed={on}
                  onClick={() => onPick(p)}
                >
                  <span className={`emoji-tile tint-${p.color}`}>{p.emoji}</span>
                  <span className="preset-text">
                    <span className="preset-title">{p.title}</span>
                    <span className="preset-meta">
                      {p.keepAlive ? 'Until cleared' : `${p.minutes} min`}
                      {p.dnd ? ' · DND' : ''}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PresetGrid;
