import React, { useEffect, useState } from 'react';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { ROAM_STATUS_ID, type Activity, type ConfigStatus } from '../lib/types';
import { formatRemaining } from '../lib/utils';
import SeatPreview from './SeatPreview';

interface Props {
  config: ConfigStatus | null;
  activities: Activity[];
  keepAlive: boolean;
  clearing: string | null;
  onClear: (externalId: string) => void;
}

const CurrentActivity: React.FC<Props> = ({ config, activities, keepAlive, clearing, onClear }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const primary = activities[0];

  return (
    <div className="status-card">
      <SeatPreview name={config?.userName ?? ''} image={config?.userImage} display={primary?.display} />
      <Stack gap={6} style={{ flex: 1, minWidth: 0 }} justify="center">
        {!primary ? (
          <>
            <Text className="t1" size="sm" fw={600}>
              Available
            </Text>
            <Text className="t3" size="xs">
              Pick a preset to show what you're up to.
            </Text>
          </>
        ) : (
          activities.map((a) => {
            const ours = a.externalId === ROAM_STATUS_ID;
            return (
              <Group key={a.externalId} gap={6} wrap="nowrap" align="flex-start">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text className="t1" size="sm" fw={600} truncate>
                      {a.display.title}
                    </Text>
                    {a.dnd && (
                      <Badge size="xs" variant="light" color="red" radius="sm">
                        DND
                      </Badge>
                    )}
                  </Group>
                  <Text className="t3" size="xs" truncate>
                    {a.display.subtitle ? `${a.display.subtitle} · ` : ''}
                    {ours && keepAlive ? 'Until cleared' : formatRemaining(a.expiresAt, now)}
                    {!ours ? ' · from another app' : ''}
                  </Text>
                </div>
                <Tooltip label="Clear" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={`Clear ${a.display.title}`}
                    loading={clearing === a.externalId}
                    onClick={() => onClear(a.externalId)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            );
          })
        )}
      </Stack>
    </div>
  );
};

export default CurrentActivity;
