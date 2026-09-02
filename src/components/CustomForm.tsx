import React, { useState } from 'react';
import { Button, Group, Select, Slider, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { ROAM_COLORS, type RoamColor, type SetActivityInput } from '../lib/types';

interface Props {
  busy: boolean;
  onSubmit: (input: SetActivityInput) => void;
}

const CustomForm: React.FC<Props> = ({ busy, onSubmit }) => {
  const [emoji, setEmoji] = useState('💬');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [color, setColor] = useState<RoamColor>('blue');
  const [minutes, setMinutes] = useState(30);
  const [dnd, setDnd] = useState(false);
  const [keepAlive, setKeepAlive] = useState(false);

  const valid = emoji.trim().length > 0 && title.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      display: {
        emoji: emoji.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        color,
      },
      ttlSeconds: minutes * 60,
      dnd,
      keepAlive,
    });
  };

  return (
    <Stack gap={8}>
      <Group gap={6} wrap="nowrap" align="flex-end">
        <TextInput
          label="Emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.currentTarget.value)}
          size="xs"
          maxLength={16}
          style={{ width: 64 }}
          styles={{ input: { textAlign: 'center', fontSize: 16 } }}
        />
        <TextInput
          label="Title"
          placeholder="What are you doing?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          size="xs"
          maxLength={140}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Group>
      <TextInput
        label="Subtitle"
        placeholder="Optional detail"
        value={subtitle}
        onChange={(e) => setSubtitle(e.currentTarget.value)}
        size="xs"
        maxLength={140}
      />
      <Group gap={8} wrap="nowrap" align="flex-end">
        <Select
          label="Color"
          data={ROAM_COLORS.map((c) => ({ value: c, label: c }))}
          value={color}
          onChange={(v) => v && setColor(v as RoamColor)}
          size="xs"
          allowDeselect={false}
          style={{ width: 110 }}
        />
        <Stack gap={2} style={{ flex: 1 }}>
          <Text size="xs" fw={500}>
            Duration · {minutes} min
          </Text>
          <Slider
            min={5}
            max={60}
            step={5}
            value={minutes}
            onChange={setMinutes}
            size="sm"
            label={null}
            marks={[{ value: 15 }, { value: 30 }, { value: 45 }]}
          />
        </Stack>
      </Group>
      <Group justify="space-between" mt={4}>
        <Switch size="xs" label="Do not disturb" checked={dnd} onChange={(e) => setDnd(e.currentTarget.checked)} />
        <Switch
          size="xs"
          label="Keep alive until cleared"
          checked={keepAlive}
          onChange={(e) => setKeepAlive(e.currentTarget.checked)}
        />
      </Group>
      <Button size="xs" leftSection={<IconSend size={14} />} disabled={!valid} loading={busy} onClick={submit}>
        Set activity
      </Button>
    </Stack>
  );
};

export default CustomForm;
