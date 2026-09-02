import React from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { PRESET_GROUPS, type Preset } from '../lib/presets';

interface Props {
  busy: boolean;
  onPick: (preset: Preset) => void;
}

const PresetGrid: React.FC<Props> = ({ busy, onPick }) => (
  <Stack gap={10}>
    {PRESET_GROUPS.map((group) => (
      <Stack key={group.label} gap={4}>
        <Text className="t3" size="10px" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
          {group.label}
        </Text>
        <SimpleGrid cols={2} spacing={6}>
          {group.presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-btn glow-${p.color}`}
              disabled={busy}
              onClick={() => onPick(p)}
            >
              <span className="preset-emoji">{p.emoji}</span>
              <span style={{ minWidth: 0 }}>
                <span className="preset-title" style={{ display: 'block' }}>
                  {p.title}
                </span>
                <span className="preset-meta">
                  {p.keepAlive ? 'until cleared' : `${p.minutes} min`}
                  {p.dnd ? ' · DND' : ''}
                </span>
              </span>
            </button>
          ))}
        </SimpleGrid>
      </Stack>
    ))}
  </Stack>
);

export default PresetGrid;
