import React from 'react';
import { ActionIcon, Button, Group, Text } from '@mantine/core';
import { IconDownload, IconX } from '@tabler/icons-react';
import type { UpdateInfo } from '../lib/updater';

interface Props {
  update: UpdateInfo;
  installing: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const UpdateBanner: React.FC<Props> = ({ update, installing, onInstall, onDismiss }) => (
  <div className="update-banner" role="status">
    <Text size="xs" fw={600} truncate>
      Roam Bar {update.version} is available
    </Text>
    <Group gap={4} wrap="nowrap">
      <Button size="compact-xs" leftSection={<IconDownload size={12} />} loading={installing} onClick={onInstall}>
        Update
      </Button>
      <ActionIcon size="xs" variant="subtle" color="gray" aria-label="Dismiss" onClick={onDismiss}>
        <IconX size={12} />
      </ActionIcon>
    </Group>
  </div>
);

export default UpdateBanner;
