import React, { useState } from 'react';
import { Button, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { ROAM_COLORS, type RoamColor, type SetActivityInput } from '../lib/types';
import EmojiPicker from './EmojiPicker';

interface Props {
  busy: boolean;
  initialTitle?: string;
  onSubmit: (input: SetActivityInput) => void;
}

const DURATIONS: { label: string; minutes: number | null }[] = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: 'Until cleared', minutes: null },
];

const CustomForm: React.FC<Props> = ({ busy, initialTitle = '', onSubmit }) => {
  const [emoji, setEmoji] = useState('💬');
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState('');
  const [color, setColor] = useState<RoamColor>('blue');
  const [minutes, setMinutes] = useState<number | null>(30);
  const [dnd, setDnd] = useState(false);

  const valid = title.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      display: {
        emoji: emoji.trim() || '💬',
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        color,
      },
      ttlSeconds: (minutes ?? 60) * 60,
      dnd,
      keepAlive: minutes === null,
    });
  };

  return (
    <Stack gap={10}>
      <div className="field-row">
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <TextInput
          aria-label="Title"
          placeholder="What are you doing?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          size="sm"
          maxLength={140}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          data-autofocus
        />
      </div>
      <TextInput
        aria-label="Subtitle"
        placeholder="Detail, optional"
        value={subtitle}
        onChange={(e) => setSubtitle(e.currentTarget.value)}
        size="xs"
        maxLength={140}
      />

      <div>
        <Text className="field-label">Color</Text>
        <div className="swatch-row" role="radiogroup" aria-label="Color">
          {ROAM_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              className={`swatch swatch-${c} ${color === c ? 'swatch-active' : ''}`}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div>
        <Text className="field-label">Duration</Text>
        <div className="chip-row" role="radiogroup" aria-label="Duration">
          {DURATIONS.map((d) => (
            <button
              key={d.label}
              type="button"
              role="radio"
              aria-checked={minutes === d.minutes}
              className={`chip ${minutes === d.minutes ? 'chip-active' : ''}`}
              onClick={() => setMinutes(d.minutes)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <Switch
        size="xs"
        label="Do not disturb"
        description="Locks your office so nobody can drop in"
        checked={dnd}
        onChange={(e) => setDnd(e.currentTarget.checked)}
      />

      <Button size="sm" leftSection={<IconCheck size={15} />} disabled={!valid} loading={busy} onClick={submit}>
        Set status
      </Button>
    </Stack>
  );
};

export default CustomForm;
