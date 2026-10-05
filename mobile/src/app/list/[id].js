import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, type } from '../../theme';
import { useLists } from '../../data/ListsContext';
import {
  getListIcon, getListActivityType, getProgress, progressLabel, progressSubLabel,
  sortNewestFirst, groupByDay, timeOfDay,
} from '../../lib/progress';
import { Badge, Button, EmptyText, GoalBadge, ProgressBar } from '../../components/ui';
import DayGroup from '../../components/DayGroup';
import GoalModal from '../../components/GoalModal';

export default function ListDetail() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { getList, addEntry, deleteEntry, setListArchived, deleteList } = useLists();
  const [adding, setAdding] = useState(false);
  const [goalVisible, setGoalVisible] = useState(false);

  const list = getList(id);
  if (!list) return null; // deleted, or still loading

  const progress = getProgress(list);
  const groups = groupByDay(sortNewestFirst(list.entries));

  async function handleAdd() {
    setAdding(true);
    const { error, reachedGoal } = await addEntry(list);
    setAdding(false);
    if (error) { Alert.alert('Failed to add activity', error.message); return; }

    if (reachedGoal) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGoalVisible(true);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async function handleDeleteEntry(entryId) {
    const { error } = await deleteEntry(list.id, entryId);
    if (error) Alert.alert('Failed to delete entry', error.message);
  }

  async function handleArchiveToggle() {
    const archive = !list.archivedAt;
    const { error } = await setListArchived(list.id, archive);
    if (error) { Alert.alert(`Failed to ${archive ? 'archive' : 'restore'} list`, error.message); return; }
    // Archiving sends you back to Home, where the list is now tucked away
    if (archive) router.back();
  }

  function handleDelete() {
    Alert.alert(
      'Delete List?',
      `This will permanently delete "${list.name}" and all its entries. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteList(list.id);
            if (error) { Alert.alert('Failed to delete list', error.message); return; }
            router.back();
          },
        },
      ]
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.titleRow}>
            <Text style={{ fontSize: 28 }}>{getListIcon(list)}</Text>
            <Text style={[type.title, { color: colors.text, flex: 1 }]}>{list.name}</Text>
          </View>

          <View style={styles.badges}>
            <Badge>{`${getListIcon(list)} ${getListActivityType(list)}`}</Badge>
            {list.archivedAt && <Badge>Archived</Badge>}
          </View>

          <View style={styles.progressRow}>
            <Text style={[styles.progressValue, { color: colors.text }]}>{progressLabel(list)}</Text>
            <Text style={[type.label, { color: colors.textMuted }]}>{progressSubLabel(list)}</Text>
            {progress.reached && <GoalBadge />}
          </View>
          {progress.pct !== null && <ProgressBar pct={progress.pct} />}

          <View style={styles.actions}>
            <Button title="Edit" variant="ghost" onPress={() => router.push({ pathname: '/list-form', params: { id: list.id } })} style={styles.action} />
            <Button title={list.archivedAt ? 'Restore' : 'Archive'} variant="ghost" onPress={handleArchiveToggle} style={styles.action} />
            <Button title="Delete" variant="danger" onPress={handleDelete} style={styles.action} />
          </View>
        </View>

        <Button title={adding ? 'Adding...' : '+ Add Activity'} onPress={handleAdd} disabled={adding} style={{ paddingVertical: 16, marginBottom: 28 }} />

        {groups.length === 0 && <EmptyText>No activities logged yet. Tap “Add Activity” to record one.</EmptyText>}

        {groups.map(group => (
          <DayGroup key={group.key} group={group}>
            {group.entries.map(entry => (
              <View key={entry.id} style={[styles.entry, { backgroundColor: colors.surface }]}>
                <Text style={{ color: colors.text, flex: 1, fontWeight: '500', fontSize: 15 }}>{entry.text}</Text>
                <Text style={[type.label, { color: colors.textMuted, letterSpacing: 0.4 }]}>{timeOfDay(entry.createdAt)}</Text>
                <Pressable
                  onPress={() => handleDeleteEntry(entry.id)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Delete entry"
                >
                  <Text style={{ color: colors.textMuted, fontSize: 20, lineHeight: 22 }}>×</Text>
                </Pressable>
              </View>
            ))}
          </DayGroup>
        ))}
      </ScrollView>

      <GoalModal list={list} visible={goalVisible} onClose={() => setGoalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  header: { paddingBottom: 24, marginBottom: 24, borderBottomWidth: StyleSheet.hairlineWidth },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 20 },
  progressValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  action: { flex: 1, paddingHorizontal: 8 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18 },
});
