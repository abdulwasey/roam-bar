import React from 'react';
import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import type { Preset, PresetGroup } from '../lib/presets';
import type { Activity } from '../lib/types';
import { isPresetActive, matchesFilter } from '../lib/utils';

interface Props {
  groups: PresetGroup[];
  busy: boolean;
  filter: string;
  active: Activity | undefined;
  onPick: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onRemove: (preset: Preset) => void;
}

const PresetGrid: React.FC<Props> = ({ groups, busy, filter, active, onPick, onEdit, onRemove }) => {
  const visible = groups
    .map((g) => ({ ...g, presets: g.presets.filter((p) => matchesFilter(p, filter)) }))
    .filter((g) => g.presets.length > 0);

  if (visible.length === 0) {
    return (
      <Text className="t3" size="xs" ta="center" py={20}>
        {filter.trim() ? `No preset matches “${filter.trim()}”. Use the Custom tab to set it.` : 'No presets left. Restore them from Settings.'}
      </Text>
    );
  }

  return (
    <div className="preset-groups">
      {visible.map((group) => (
        <section key={group.label} className="preset-group">
          <h3 className="preset-group-label">{group.label}</h3>
          <div className="preset-grid">
            {group.presets.map((p) => {
              const on = isPresetActive(p, active);
              return (
                <div key={p.id} className="preset-wrap">
                  <button
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
                  <Menu position="bottom-end" shadow="md" withinPortal>
                    <Menu.Target>
                      <ActionIcon className="preset-more" variant="subtle" color="gray" size="xs" aria-label={`Options for ${p.title}`}>
                        <IconDots size={13} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(p)}>
                        Edit
                      </Menu.Item>
                      <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onRemove(p)}>
                        Remove
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PresetGrid;
