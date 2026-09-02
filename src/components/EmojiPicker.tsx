import React, { useState } from 'react';
import { Popover, Text, TextInput } from '@mantine/core';
import { EMOJI_GROUPS } from '../lib/emojis';

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker: React.FC<Props> = ({ value, onChange }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" width={300} shadow="md" withinPortal>
      <Popover.Target>
        <button
          type="button"
          className="emoji-trigger"
          aria-label="Choose emoji"
          aria-expanded={opened}
          onClick={() => setOpened((o) => !o)}
        >
          {value || '☺'}
        </button>
      </Popover.Target>
      <Popover.Dropdown className="emoji-dropdown">
        <TextInput
          size="xs"
          placeholder="Type or paste any emoji"
          value={value}
          maxLength={16}
          autoFocus
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && setOpened(false)}
          mb={4}
        />
        <Text className="t3" size="10.5px" mb={8}>
          Press ⌃⌘Space in the box for the full macOS picker.
        </Text>
        <div className="emoji-scroll">
          {EMOJI_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="preset-group-label">{g.label}</div>
              <div className="emoji-grid">
                {g.emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`emoji-cell ${e === value ? 'emoji-cell-active' : ''}`}
                    onClick={() => {
                      onChange(e);
                      setOpened(false);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};

export default EmojiPicker;
