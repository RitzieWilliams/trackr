import { useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../theme';
import { useLists } from '../data/ListsContext';
import { ICONS, getListIcon, getListActivityType } from '../lib/progress';
import { Button, FormInput, FormLabel } from '../components/ui';

// Create a list, or edit one when opened with ?id=
export default function ListForm() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { getList, createList, updateList } = useLists();
  const editing = id ? getList(id) : null;

  const [name, setName]                 = useState(editing ? editing.name : '');
  const [activityType, setActivityType] = useState(editing ? getListActivityType(editing) : '');
  const [countMode, setCountMode]       = useState(editing ? editing.countMode || 'up' : 'up');
  const [targetText, setTargetText]     = useState(editing && editing.target ? String(editing.target) : '');
  const [icon, setIcon]                 = useState(editing ? getListIcon(editing) : ICONS[0]);
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);

  const isDown = countMode === 'down';

  // Returns { ok, target } where target is a positive integer or null (no goal)
  function readTarget() {
    const raw = targetText.trim();
    if (raw === '') {
      if (isDown) return { ok: false, error: 'Enter a starting number to count down from.' };
      return { ok: true, target: null };
    }
    const target = Number(raw);
    if (!Number.isInteger(target) || target < 1) return { ok: false, error: 'Enter a whole number of 1 or more.' };
    return { ok: true, target };
  }

  async function save() {
    const next = {};
    if (!name.trim())         next.name = 'Enter a list name.';
    if (!activityType.trim()) next.activityType = 'Enter an activity type.';
    const t = readTarget();
    if (!t.ok) next.target = t.error;
    setErrors(next);
    if (Object.keys(next).length) return;

    const fields = { name: name.trim(), activityType: activityType.trim(), icon, countMode, target: t.target };
    setSaving(true);

    if (editing) {
      const { error } = await updateList(editing.id, fields);
      setSaving(false);
      if (error) { Alert.alert('Failed to save list', error.message); return; }
      router.back();
    } else {
      const { error, list } = await createList(fields);
      setSaving(false);
      if (error) { Alert.alert('Failed to create list', error.message); return; }
      router.dismiss();
      router.push(`/list/${list.id}`);
    }
  }

  const hint = isDown
    ? "Each entry takes one away. You'll be notified when it hits zero."
    : "You'll be notified when you reach it. Leave blank to just keep count.";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: editing ? 'Edit List' : 'New List' }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <FormLabel>List Name</FormLabel>
        <FormInput value={name} onChangeText={setName} placeholder="e.g. Morning Routine" maxLength={50} autoFocus={!editing} />
        <FieldError text={errors.name} />

        <FormLabel style={styles.gap}>Activity Type</FormLabel>
        <FormInput value={activityType} onChangeText={setActivityType} placeholder="e.g. Running, Journaling, Cold Shower..." maxLength={40} />
        <FieldError text={errors.activityType} />

        <FormLabel style={styles.gap}>Counting</FormLabel>
        <View style={[styles.toggle, { borderColor: colors.border }]}>
          {[['up', '↑ Count Up'], ['down', '↓ Count Down']].map(([mode, label]) => {
            const active = countMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => { setCountMode(mode); setErrors(e => ({ ...e, target: undefined })); }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.toggleOption, active && { backgroundColor: colors.primary }]}
              >
                <Text style={[type.label, { color: active ? colors.primaryText : colors.textMuted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <FormLabel style={styles.gap}>{isDown ? 'Starting Number' : 'Goal (optional)'}</FormLabel>
        <FormInput
          value={targetText}
          onChangeText={text => { setTargetText(text); setErrors(e => ({ ...e, target: undefined })); }}
          placeholder={isDown ? 'e.g. 10' : 'e.g. 5'}
          keyboardType="number-pad"
          maxLength={6}
        />
        {errors.target
          ? <FieldError text={errors.target} />
          : <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6 }}>{hint}</Text>}

        <FormLabel style={styles.gap}>Icon</FormLabel>
        <View style={styles.iconGrid}>
          {ICONS.map(option => {
            const selected = option === icon;
            return (
              <Pressable
                key={option}
                onPress={() => setIcon(option)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.iconOption,
                  { backgroundColor: colors.surface, borderColor: selected ? colors.text : 'transparent' },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          title={saving ? 'Saving...' : editing ? 'Save Changes' : 'Create List'}
          onPress={save}
          disabled={saving}
          style={{ marginTop: 32, paddingVertical: 16 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldError({ text }) {
  const { colors } = useTheme();
  if (!text) return null;
  return <Text style={{ color: colors.danger, fontSize: 13, marginTop: 6 }}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48 },
  gap: { marginTop: 22 },
  toggle: { flexDirection: 'row', borderWidth: 1 },
  toggleOption: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  // 8 per row: fixed percentage widths, leftover space split between them
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 6 },
  iconOption: { width: '11.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
