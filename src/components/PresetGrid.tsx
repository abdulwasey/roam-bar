import React from 'react';
import { SimpleGrid } from '@mantine/core';
import { PRESETS, type Preset } from '../lib/presets';

interface Props {
  busy: boolean;
  onPick: (preset: Preset) => void;
}

const PresetGrid: React.FC<Props> = ({ busy, onPick }) => (
  <SimpleGrid cols={2} spacing={6}>
    {PRESETS.map((p) => (
      <button key={p.id} type="button" className={`preset-btn glow-${p.color}`} disabled={busy} onClick={() => onPick(p)}>
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
);

export default PresetGrid;
