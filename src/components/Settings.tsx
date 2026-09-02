import React, { useEffect, useState } from 'react';
import { ActionIcon, Box, Button, Group, PasswordInput, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import { getConfigStatus, saveConfig } from '../lib/api';
import { errorText } from '../lib/utils';

const Settings: React.FC<{ onBack: () => void; onSaved: () => void }> = ({ onBack, onSaved }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [autostart, setAutostart] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getConfigStatus().then((s) => {
      setEmail(s.email);
      setUserName(s.userName);
      setUserId(s.userId);
    });
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
      const user = await saveConfig({ token, email });
      setUserName(user.name);
      setUserId(user.id);
      setToken('');
      notifications.show({ color: 'green', title: 'Connected', message: `Signed in as ${user.name}` });
      onSaved();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Save failed', message: errorText(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={10} p={12}>
      <Group gap={8}>
        <ActionIcon variant="subtle" color="gray" onClick={onBack}>
          <IconArrowLeft size={16} />
        </ActionIcon>
        <Text fw={700} size="sm">
          Settings
        </Text>
      </Group>

      <Box className="glass" style={{ padding: 12 }}>
        <Group justify="space-between">
          <Box>
            <Text className="t1" size="xs" fw={600}>
              Launch at login
            </Text>
            <Text className="t3" size="10px">
              Start Roam Bar automatically when you log in
            </Text>
          </Box>
          <Switch checked={autostart} onChange={(e) => toggleAutostart(e.currentTarget.checked)} />
        </Group>
      </Box>

      <Box className="glass" style={{ padding: 12 }}>
        <Text className="t1" size="xs" fw={600}>
          {userName ? `Connected as ${userName}` : 'Not connected'}
        </Text>
        <Text className="t3" size="10px" style={{ wordBreak: 'break-all' }}>
          {userId || 'Save a token and email to resolve your Roam user'}
        </Text>
      </Box>

      <PasswordInput
        label="Roam personal access token"
        description="Roam → User Settings → Developer. Stored in the macOS Keychain."
        placeholder="rmp-… (leave blank to keep current)"
        value={token}
        onChange={(e) => setToken(e.currentTarget.value)}
        size="xs"
      />
      <TextInput
        label="Roam email"
        placeholder="you@therealbrokerage.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        size="xs"
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />

      <Button
        mt={4}
        size="sm"
        loading={saving}
        disabled={!email.trim()}
        leftSection={<IconDeviceFloppy size={15} />}
        onClick={save}
      >
        Save and connect
      </Button>
    </Stack>
  );
};

export default Settings;
