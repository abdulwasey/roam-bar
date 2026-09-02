import React, { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Box, Button, Divider, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconPower, IconRefresh, IconSettings } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { clearActivity, getActivities, getConfigStatus, quitApp, setActivity } from './lib/api';
import type { Activity, ConfigStatus, SetActivityInput } from './lib/types';
import type { Preset } from './lib/presets';
import { errorText } from './lib/utils';
import CurrentActivity from './components/CurrentActivity';
import PresetGrid from './components/PresetGrid';
import CustomForm from './components/CustomForm';
import Settings from './components/Settings';

const POLL_INTERVAL = 30 * 1000;

const App: React.FC = () => {
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [keepAlive, setKeepAlive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const status = await getConfigStatus();
      setConfig(status);
      if (!status.configured) return;
      const state = await getActivities();
      setActivities(state.activities);
      setKeepAlive(state.keepAlive);
    } catch (err) {
      notifications.show({ color: 'red', title: 'Roam', message: errorText(err) });
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, POLL_INTERVAL);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const submit = async (input: SetActivityInput) => {
    setBusy(true);
    try {
      await setActivity(input);
      await refresh();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Could not set activity', message: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const pickPreset = (p: Preset) =>
    submit({
      display: { emoji: p.emoji, title: p.title, subtitle: p.subtitle, color: p.color },
      ttlSeconds: p.minutes * 60,
      dnd: p.dnd,
      keepAlive: p.keepAlive,
    });

  const clear = async (externalId: string) => {
    setClearing(externalId);
    try {
      await clearActivity(externalId);
      await refresh();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Could not clear', message: errorText(err) });
    } finally {
      setClearing(null);
    }
  };

  if (view === 'settings') {
    return (
      <Box className="cb-shell">
        <Box className="cb-scroll" style={{ padding: 0 }}>
          <Settings
            onBack={() => setView('main')}
            onSaved={() => {
              refresh();
              setView('main');
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="cb-shell">
      <Box className="cb-header" style={{ padding: '9px 12px' }}>
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text fw={700} size="sm">
              Roam Bar
            </Text>
            <Text className="t3" size="10px">
              {config?.userName ? `Setting status for ${config.userName}` : 'Not connected'}
            </Text>
          </Box>
          <Group gap={2} wrap="nowrap">
            <Tooltip label="Refresh" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={refresh}>
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Settings" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={() => setView('settings')}>
                <IconSettings size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Quit" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={() => quitApp()}>
                <IconPower size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>

      <Box className="cb-scroll">
        {config && !config.configured ? (
          <Stack gap={8} align="center" py={24}>
            <Text className="t2" size="xs" ta="center">
              Connect your Roam account to start setting activities.
            </Text>
            <Button size="xs" onClick={() => setView('settings')}>
              Open Settings
            </Button>
          </Stack>
        ) : (
          <Stack gap={10}>
            <CurrentActivity activities={activities} keepAlive={keepAlive} clearing={clearing} onClear={clear} />
            <Divider label="Presets" labelPosition="left" />
            <PresetGrid busy={busy} onPick={pickPreset} />
            <Divider label="Custom" labelPosition="left" />
            <CustomForm busy={busy} onSubmit={submit} />
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default App;
