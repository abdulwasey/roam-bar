import React, { useEffect, useState } from 'react';
import { ActionIcon, Avatar, Box, Button, Group, PasswordInput, Stack, Switch, Text } from '@mantine/core';
import { IconArrowLeft, IconDownload, IconPlugConnected, IconRefresh, IconRestore } from '@tabler/icons-react';
import { getVersion } from '@tauri-apps/api/app';
import type { UpdateInfo } from '../lib/updater';
import { notifications } from '@mantine/notifications';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import { getConfigStatus, saveConfig } from '../lib/api';
import type { ConfigStatus } from '../lib/types';
import { errorText } from '../lib/utils';

interface Props {
  onBack: () => void;
  onSaved: () => void;
  hiddenCount: number;
  onRestorePresets: () => void;
  update: UpdateInfo | null;
  installing: boolean;
  onCheckUpdate: () => Promise<UpdateInfo | null>;
  onInstallUpdate: () => void;
}

const Settings: React.FC<Props> = ({ onBack, onSaved, hiddenCount, onRestorePresets, update, installing, onCheckUpdate, onInstallUpdate }) => {
  const [version, setVersion] = useState('');
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [autostart, setAutostart] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getConfigStatus().then(setStatus).catch(() => setStatus(null));
    getVersion().then(setVersion).catch(() => undefined);
    isEnabled().then(setAutostart).catch(() => setAutostart(false));
  }, []);

  const toggleAutostart = async (next: boolean) => {
    setAutostart(next);
    try {
      if (next) await enable();
      else await disable();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Autostart', message: errorText(err) });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const user = await saveConfig({ token });
      setToken('');
      notifications.show({ color: 'green', title: 'Connected', message: `Signed in as ${user.name}` });
      onSaved();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Could not connect', message: errorText(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={12} p={12}>
      <Group gap={6}>
        <ActionIcon variant="subtle" color="gray" onClick={onBack} aria-label="Back">
          <IconArrowLeft size={16} />
        </ActionIcon>
        <Text fw={600} size="sm">
          Settings
        </Text>
      </Group>

      <Box className="glass" p={12}>
        <Group gap={10} wrap="nowrap">
          <Avatar src={status?.userImage || undefined} radius="xl" size={36}>
            {status?.userName?.slice(0, 1)}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Text className="t1" size="sm" fw={600} truncate>
              {status?.configured ? status.userName : 'Not connected'}
            </Text>
            <Text className="t3" size="xs" truncate>
              {status?.configured ? status.userEmail : 'Paste a token below to connect'}
            </Text>
          </div>
        </Group>
      </Box>

      <Box className="glass" p={12}>
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text className="t1" size="xs" fw={600}>
              Launch at login
            </Text>
            <Text className="t3" size="xs">
              Start Roam Bar when you sign in
            </Text>
          </div>
          <Switch checked={autostart} onChange={(e) => toggleAutostart(e.currentTarget.checked)} />
        </Group>
      </Box>

      <Box className="glass" p={12}>
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text className="t1" size="xs" fw={600}>
              Default presets
            </Text>
            <Text className="t3" size="xs">
              {hiddenCount ? `${hiddenCount} removed or edited` : 'All defaults in place'}
            </Text>
          </div>
          <Button size="compact-xs" variant="light" color="gray" leftSection={<IconRestore size={13} />} disabled={!hiddenCount} onClick={onRestorePresets}>
            Restore
          </Button>
        </Group>
      </Box>

      <Box className="glass" p={12}>
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text className="t1" size="xs" fw={600}>
              {update ? `Update ${update.version} available` : `Roam Bar ${version}`}
            </Text>
            <Text className="t3" size="xs">
              {update ? 'Installs and relaunches in a few seconds' : checked ? 'You are up to date' : 'Checks every 6 hours'}
            </Text>
          </div>
          {update ? (
            <Button size="compact-xs" leftSection={<IconDownload size={13} />} loading={installing} onClick={onInstallUpdate}>
              Install
            </Button>
          ) : (
            <Button
              size="compact-xs"
              variant="light"
              color="gray"
              leftSection={<IconRefresh size={13} />}
              loading={checking}
              onClick={async () => {
                setChecking(true);
                try {
                  await onCheckUpdate();
                  setChecked(true);
                } catch (err) {
                  notifications.show({ color: 'red', title: 'Update check failed', message: errorText(err) });
                } finally {
                  setChecking(false);
                }
              }}
            >
              Check
            </Button>
          )}
        </Group>
      </Box>

      <PasswordInput
        label="Roam personal access token"
        description="Roam → User Settings → Developer. Stored in the macOS Keychain."
        placeholder={status?.configured ? 'Leave blank to keep the current token' : 'rmp-…'}
        value={token}
        onChange={(e) => setToken(e.currentTarget.value)}
        size="xs"
        onKeyDown={(e) => e.key === 'Enter' && token.trim() && save()}
      />

      <Button
        size="sm"
        loading={saving}
        disabled={!token.trim()}
        leftSection={<IconPlugConnected size={15} />}
        onClick={save}
      >
        Connect
      </Button>
    </Stack>
  );
};

export default Settings;
