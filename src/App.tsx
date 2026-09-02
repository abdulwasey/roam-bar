import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionIcon, Avatar, Box, Button, Group, SegmentedControl, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { IconPower, IconSearch, IconSettings, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { listen } from '@tauri-apps/api/event';
import { clearActivity, getActivities, getConfigStatus, hideWindow, quitApp, setActivity, setPinned } from './lib/api';
import type { Activity, ConfigStatus, SetActivityInput } from './lib/types';
import type { Preset } from './lib/presets';
import { buildGroups, CUSTOM_GROUP, defaultGroupOf, loadStore, loadStoreFromDisk, rememberCustom, removePreset, saveStore, upsertPreset, type PresetStore } from './lib/presetStore';
import { checkForUpdate, installUpdate, type UpdateInfo } from './lib/updater';
import UpdateBanner from './components/UpdateBanner';
import { errorText } from './lib/utils';
import CurrentActivity from './components/CurrentActivity';
import PresetGrid from './components/PresetGrid';
import CustomForm, { type CustomDraft, type CustomValues } from './components/CustomForm';
import Settings from './components/Settings';

const POLL_INTERVAL = 30 * 1000;
const UPDATE_INTERVAL = 6 * 60 * 60 * 1000;

type Editing = { kind: 'status' } | { kind: 'preset'; preset: Preset } | null;

const App: React.FC = () => {
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [filter, setFilter] = useState('');
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [keepAlive, setKeepAlive] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState<string | null>(null);
  const [store, setStore] = useState<PresetStore>(() => loadStore());
  const [draft, setDraft] = useState<CustomDraft | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [installing, setInstalling] = useState(false);

  const groups = useMemo(() => buildGroups(store), [store]);
  const groupOptions = useMemo(() => groups.map((g) => g.label).filter((l) => l !== CUSTOM_GROUP), [groups]);

  const updateStore = (next: PresetStore) => {
    setStore(next);
    saveStore(next);
  };

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
        const editingField = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
        if (editingField !== pinned) {
          pinned = editingField;
          setPinned(editingField).catch(() => undefined);
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
    loadStoreFromDisk().then(setStore).catch(() => undefined);
    const check = () => checkForUpdate().then(setUpdate).catch(() => undefined);
    const t = window.setTimeout(check, 5000);
    const id = window.setInterval(check, UPDATE_INTERVAL);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
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

  const leaveCustom = () => {
    setDraft(null);
    setEditing(null);
    setTab('presets');
  };

  const submit = async (input: SetActivityInput) => {
    setBusy(true);
    try {
      await setActivity(input);
      await refresh();
      leaveCustom();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Could not set status', message: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const toInput = (p: Omit<Preset, 'id'>): SetActivityInput => ({
    display: { emoji: p.emoji, title: p.title, subtitle: p.subtitle || undefined, color: p.color },
    ttlSeconds: p.minutes * 60,
    dnd: p.dnd,
    keepAlive: p.keepAlive,
  });

  const valuesToPreset = (v: CustomValues, id?: string): Omit<Preset, 'id'> => {
    const home = id ? defaultGroupOf(id) : undefined;
    const group = v.group && v.group !== CUSTOM_GROUP && v.group !== home ? v.group : undefined;
    return {
      emoji: v.emoji,
      title: v.title,
      subtitle: v.subtitle || undefined,
      color: v.color,
      minutes: v.minutes ?? 60,
      dnd: v.dnd,
      keepAlive: v.minutes === null,
      group,
    };
  };

  const pickPreset = (p: Preset) => submit(toInput(p));

  const setFromCustom = (v: CustomValues) => {
    const preset = valuesToPreset(v);
    const knownDefault = groups.some((g) => g.label !== 'Yours' && g.presets.some((p) => p.emoji === preset.emoji && p.title === preset.title));
    if (!knownDefault && editing?.kind !== 'status') updateStore(rememberCustom(store, preset));
    return submit(toInput(preset));
  };

  const savePreset = (v: CustomValues) => {
    if (editing?.kind === 'preset') {
      updateStore(upsertPreset(store, { ...valuesToPreset(v, editing.preset.id), id: editing.preset.id }));
    } else if (!editing) {
      updateStore(rememberCustom(store, valuesToPreset(v)));
      notifications.show({ color: 'green', title: 'Preset saved', message: `${v.emoji} ${v.title}` });
    }
    leaveCustom();
  };

  const editPreset = (p: Preset, group: string) => {
    setDraft({
      emoji: p.emoji,
      title: p.title,
      subtitle: p.subtitle ?? '',
      color: p.color,
      minutes: p.keepAlive ? null : p.minutes,
      dnd: p.dnd,
      group: group === CUSTOM_GROUP ? '' : group,
    });
    setEditing({ kind: 'preset', preset: p });
    setTab('custom');
  };

  const editStatus = (a: Activity) => {
    setDraft({
      emoji: a.display.emoji,
      title: a.display.title,
      subtitle: a.display.subtitle ?? '',
      color: a.display.color ?? 'blue',
      minutes: keepAlive ? null : Math.max(5, Math.min(60, Math.ceil((new Date(a.expiresAt).getTime() - Date.now()) / 60000))),
      dnd: a.dnd,
    });
    setEditing({ kind: 'status' });
    setTab('custom');
  };

  const install = async () => {
    if (!update) return;
    setInstalling(true);
    try {
      await installUpdate(update);
    } catch (err) {
      notifications.show({ color: 'red', title: 'Update failed', message: errorText(err) });
      setInstalling(false);
    }
  };

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
            hiddenCount={store.hidden.length + Object.keys(store.overrides).length}
            onRestorePresets={() => updateStore({ ...store, hidden: [], overrides: {} })}
            update={update}
            installing={installing}
            onCheckUpdate={async () => {
              const u = await checkForUpdate();
              setUpdate(u);
              return u;
            }}
            onInstallUpdate={install}
          />
        </Box>
      </Box>
    );
  }

  const formMode = editing?.kind === 'preset' ? 'preset' : editing?.kind === 'status' ? 'update' : 'status';
  const formKey = editing?.kind === 'preset' ? `preset:${editing.preset.id}` : editing?.kind === 'status' ? 'status' : 'new';

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

      {update && <UpdateBanner update={update} installing={installing} onInstall={install} onDismiss={() => setUpdate(null)} />}

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
            <CurrentActivity
              config={config}
              activities={activities}
              keepAlive={keepAlive}
              source={source}
              clearing={clearing}
              onClear={clear}
              onEdit={editStatus}
            />
            <Group gap={6} wrap="nowrap" mt={10}>
              <SegmentedControl
                size="xs"
                value={tab}
                onChange={(v) => {
                  if (v === 'presets') leaveCustom();
                  else setTab('custom');
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
              <PresetGrid
                groups={groups}
                busy={busy}
                filter={filter}
                active={activities[0]}
                onPick={pickPreset}
                onEdit={editPreset}
                onRemove={(p) => updateStore(removePreset(store, p.id))}
              />
            ) : (
              <CustomForm
                key={formKey}
                busy={busy}
                mode={formMode}
                groupOptions={groupOptions}
                draft={draft ?? { title: filter.trim() }}
                onSet={setFromCustom}
                onSavePreset={savePreset}
                onCancel={editing ? leaveCustom : undefined}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default App;
