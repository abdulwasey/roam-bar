import React, { useMemo, useState } from 'react';
import { Popover, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { EMOJI_GROUPS, searchEmojis, type EmojiEntry } from '../lib/emojis';

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

const isEmojiLike = (s: string) => /\p{Extended_Pictographic}/u.test(s);

const EmojiPicker: React.FC<Props> = ({ value, onChange }) => {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchEmojis(query), [query]);
  const typedEmoji = isEmojiLike(query) ? query.trim() : '';

  const pick = (e: string) => {
    onChange(e);
    setQuery('');
    setOpened(false);
  };

  const cell = (entry: EmojiEntry) => (
    <button
      key={entry.e}
      type="button"
      title={entry.name}
      className={`emoji-cell ${entry.e === value ? 'emoji-cell-active' : ''}`}
      onClick={() => pick(entry.e)}
    >
      {entry.e}
    </button>
  );

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" width={320} shadow="md" withinPortal>
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
          placeholder="Search, or paste any emoji"
          leftSection={<IconSearch size={13} />}
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (typedEmoji) pick(typedEmoji);
              else if (results[0]) pick(results[0].e);
            }
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpened(false);
            }
          }}
          mb={4}
        />
        <Text className="t3" size="10.5px" mb={8}>
          ⌃⌘Space opens the macOS picker into this box.
        </Text>
        <div className="emoji-scroll">
          {typedEmoji ? (
            <div>
              <div className="preset-group-label">Use typed emoji</div>
              <div className="emoji-grid">{cell({ e: typedEmoji, name: 'typed' })}</div>
            </div>
          ) : query ? (
            results.length ? (
              <div className="emoji-grid">{results.map(cell)}</div>
            ) : (
              <Text className="t3" size="xs" ta="center" py={12}>
                No emoji named “{query.trim()}”.
              </Text>
            )
          ) : (
            EMOJI_GROUPS.map((g) => (
              <div key={g.label}>
                <div className="preset-group-label">{g.label}</div>
                <div className="emoji-grid">{g.emojis.map(cell)}</div>
              </div>
            ))
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};

export default EmojiPicker;
