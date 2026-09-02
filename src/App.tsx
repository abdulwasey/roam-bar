import React, { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Avatar, Box, Button, Group, SegmentedControl, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { IconPower, IconSearch, IconSettings, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { listen } from '@tauri-apps/api/event';
import { clearActivity, getActivities, getConfigStatus, hideWindow, quitApp, setActivity, setPinned } from './lib/api';
import type { Activity, ConfigStatus, SetActivityInput } from './lib/types';
import type { CustomDraft } from './components/CustomForm';
import type { Preset } from './lib/presets';
import { errorText } from './lib/utils';
import CurrentActivity from './components/CurrentActivity';
import PresetGrid from './components/PresetGrid';
import CustomForm from './components/CustomForm';
import Settings from './components/Settings';

const POLL_INTERVAL = 30 * 1000;

const App: React.FC = () => {
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [filter, setFilter] = useState('');
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [keepAlive, setKeepAlive] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomDraft | null>(null);
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
      setSource(state.source ?? null);
    } catch (err) {
      notifications.show({ color: 'red', title: 'Roam', message: errorText(err) });
    }
  }, []);

  useEffect(() => {
    let pinned = false;
    const sync = () => {
      window.setTimeout(() => {
        const el = document.activeElement;
        const editing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
        if (editing !== pinned) {
          pinned = editing;
          setPinned(editing).catch(() => undefined);
        }
      }, 0);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        el.blur();
        return;
      }
      hideWindow().catch(() => undefined);
    };
    document.addEventListener('focusin', sync);
    document.addEventListener('focusout', sync);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('focusin', sync);
      document.removeEventListener('focusout', sync);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, POLL_INTERVAL);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const unlisten = listen('activity-changed', () => refresh());
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      unlisten.then((f) => f()).catch(() => undefined);
    };
  }, [refresh]);

  const submit = async (input: SetActivityInput) => {
    setBusy(true);
    try {
      await setActivity(input);
      await refresh();
      setDraft(null);
      setTab('presets');
    } catch (err) {
      notifications.show({ color: 'red', title: 'Could not set status', message: errorText(err) });
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

  const edit = (a: Activity) => {
    setDraft({
      emoji: a.display.emoji,
      title: a.display.title,
      subtitle: a.display.subtitle ?? '',
      color: a.display.color ?? 'blue',
      minutes: keepAlive ? null : Math.max(5, Math.min(60, Math.ceil((new Date(a.expiresAt).getTime() - Date.now()) / 60000))),
      dnd: a.dnd,
    });
    setTab('custom');
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
      <Box className="cb-header">
        <Group justify="space-between" wrap="nowrap">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <Avatar src={config?.userImage || undefined} radius="xl" size={26}>
              {config?.userName?.slice(0, 1)}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} lh={1.15} truncate>
                {config?.userName || 'Roam Bar'}
              </Text>
              <Text className="t3" size="xs" lh={1.2}>
                {config?.configured ? 'Roam status' : 'Not connected'}
              </Text>
            </div>
          </Group>
          <Group gap={0} wrap="nowrap">
            <Tooltip label="Settings" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={() => setView('settings')} aria-label="Settings">
                <IconSettings size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Quit Roam Bar" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={() => quitApp()} aria-label="Quit">
                <IconPower size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>

      {config && !config.configured ? (
        <Stack gap={8} align="center" py={32} px={16}>
          <Text className="t2" size="xs" ta="center">
            Connect your Roam account to start setting a status.
          </Text>
          <Button size="xs" onClick={() => setView('settings')}>
            Open Settings
          </Button>
        </Stack>
      ) : (
        <>
          <Box className="sticky-top">
            <CurrentActivity config={config} activities={activities} keepAlive={keepAlive} source={source} clearing={clearing} onClear={clear} onEdit={edit} />
            <Group gap={6} wrap="nowrap" mt={10}>
              <SegmentedControl
                size="xs"
                value={tab}
                onChange={(v) => {
                  setTab(v as 'presets' | 'custom');
                  if (v === 'presets') setDraft(null);
                }}
                data={[
                  { label: 'Presets', value: 'presets' },
                  { label: 'Custom', value: 'custom' },
                ]}
              />
              {tab === 'presets' && (
                <TextInput
                  size="xs"
                  aria-label="Filter presets"
                  placeholder="Filter"
                  value={filter}
                  onChange={(e) => setFilter(e.currentTarget.value)}
                  leftSection={<IconSearch size={13} />}
                  rightSection={
                    filter ? (
                      <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setFilter('')} aria-label="Clear filter">
                        <IconX size={12} />
                      </ActionIcon>
                    ) : null
                  }
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && filter) {
                      e.stopPropagation();
                      setFilter('');
                    }
                  }}
                />
              )}
            </Group>
          </Box>
          <Box className="cb-scroll">
            {tab === 'presets' ? (
              <PresetGrid busy={busy} filter={filter} active={activities[0]} onPick={pickPreset} />
            ) : (
              <CustomForm
                key={draft ? `${draft.emoji}|${draft.title}` : 'new'}
                busy={busy}
                draft={draft ?? { title: filter.trim() }}
                onSubmit={submit}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default App;
