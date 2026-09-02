import React, { useState } from 'react';
import { Button, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { ROAM_COLORS, type RoamColor } from '../lib/types';
import EmojiPicker from './EmojiPicker';

export interface CustomDraft {
  emoji?: string;
  title?: string;
  subtitle?: string;
  color?: RoamColor;
  minutes?: number | null;
  dnd?: boolean;
}

export interface CustomValues {
  emoji: string;
  title: string;
  subtitle: string;
  color: RoamColor;
  minutes: number | null;
  dnd: boolean;
}

interface Props {
  busy: boolean;
  draft?: CustomDraft;
  mode: 'status' | 'preset' | 'update';
  onSet: (values: CustomValues) => void;
  onSavePreset?: (values: CustomValues) => void;
  onCancel?: () => void;
}

const DURATIONS: { label: string; minutes: number | null }[] = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: 'Until cleared', minutes: null },
];

const CustomForm: React.FC<Props> = ({ busy, draft = {}, mode, onSet, onSavePreset, onCancel }) => {
  const [emoji, setEmoji] = useState(draft.emoji ?? '💬');
  const [title, setTitle] = useState(draft.title ?? '');
  const [subtitle, setSubtitle] = useState(draft.subtitle ?? '');
  const [color, setColor] = useState<RoamColor>(draft.color ?? 'blue');
  const [minutes, setMinutes] = useState<number | null>(draft.minutes === undefined ? 30 : draft.minutes);
  const [dnd, setDnd] = useState(draft.dnd ?? false);

  const valid = title.trim().length > 0;
  const values = (): CustomValues => ({
    emoji: emoji.trim() || '💬',
    title: title.trim(),
    subtitle: subtitle.trim(),
    color,
    minutes,
    dnd,
  });

  const primary = () => {
    if (!valid) return;
    if (mode === 'preset') onSavePreset?.(values());
    else onSet(values());
  };

  return (
    <Stack gap={10}>
      {mode === 'preset' && (
        <Text className="t2" size="xs">
          Editing preset. Changes apply to the button, not your current status.
        </Text>
      )}
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
          onKeyDown={(e) => e.key === 'Enter' && primary()}
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

      {mode === 'preset' ? (
        <Group gap={6} grow>
          <Button size="sm" leftSection={<IconDeviceFloppy size={15} />} disabled={!valid} onClick={primary}>
            Save preset
          </Button>
          <Button
            size="sm"
            variant="light"
            leftSection={<IconCheck size={15} />}
            disabled={!valid}
            loading={busy}
            onClick={() => {
              if (!valid) return;
              onSavePreset?.(values());
              onSet(values());
            }}
          >
            Save and set
          </Button>
        </Group>
      ) : (
        <Group gap={6} grow>
          <Button size="sm" leftSection={<IconCheck size={15} />} disabled={!valid} loading={busy} onClick={primary}>
            {mode === 'update' ? 'Update status' : 'Set status'}
          </Button>
          {onCancel && (
            <Button size="sm" variant="subtle" color="gray" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Group>
      )}
    </Stack>
  );
};

export default CustomForm;
