import React, { useEffect, useState } from 'react';
import { Box, Button, Group, Stack, Text, Badge } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { Activity } from '../lib/types';
import { formatRemaining } from '../lib/utils';

interface Props {
  activities: Activity[];
  keepAlive: boolean;
  clearing: string | null;
  onClear: (externalId: string) => void;
}

const CurrentActivity: React.FC<Props> = ({ activities, keepAlive, clearing, onClear }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  if (activities.length === 0) {
    return (
      <Box className="glass" style={{ padding: 12 }}>
        <Text className="t2" size="xs">
          No activity set. Your seat shows as available.
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap={6}>
      {activities.map((a) => (
        <Box key={a.externalId} className={`glass glow-${a.display.color ?? 'gray'}`} style={{ padding: 12 }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
              <Text style={{ fontSize: 24, lineHeight: 1 }}>{a.display.emoji}</Text>
              <Box style={{ minWidth: 0 }}>
                <Group gap={6} wrap="nowrap">
                  <Text className="t1" size="sm" fw={600} truncate>
                    {a.display.title}
                  </Text>
                  {a.dnd && (
                    <Badge size="xs" color="red" variant="light">
                      DND
                    </Badge>
                  )}
                  {keepAlive && a.externalId === 'roambar:status' && (
                    <Badge size="xs" color="indigo" variant="light">
                      kept alive
                    </Badge>
                  )}
                </Group>
                <Text className="t3" size="10px" truncate>
                  {a.display.subtitle ? `${a.display.subtitle} · ` : ''}
                  {keepAlive && a.externalId === 'roambar:status' ? 'until cleared' : formatRemaining(a.expiresAt, now)}
                </Text>
              </Box>
            </Group>
            <Button
              size="compact-xs"
              variant="light"
              color="gray"
              leftSection={<IconX size={12} />}
              loading={clearing === a.externalId}
              onClick={() => onClear(a.externalId)}
            >
              Clear
            </Button>
          </Group>
        </Box>
      ))}
    </Stack>
  );
};

export default CurrentActivity;
