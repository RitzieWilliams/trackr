import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../../theme';
import { useLists } from '../../data/ListsContext';
import {
  getListIcon, getListActivityType, computeStreak, sortNewestFirst, groupByDay, timeOfDay,
} from '../../lib/progress';
import { EmptyText, ProgressBar, SectionHeading } from '../../components/ui';
import DayGroup from '../../components/DayGroup';

export default function Reports() {
  const { colors } = useTheme();
  const { lists } = useLists();

  const allEntries = lists.flatMap(l => l.entries.map(e => ({ ...e, list: l })));
  const maxCount = Math.max(1, ...lists.map(l => l.entries.length));
  const byCount = [...lists].sort((a, b) => b.entries.length - a.entries.length);
  const recent = groupByDay(sortNewestFirst(allEntries).slice(0, 20));

  const stats = [
    [lists.length, 'Total Lists'],
    [allEntries.length, 'Activities Logged'],
    [computeStreak(lists), 'Day Streak'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.summary}>
        {stats.map(([value, label]) => (
          <View key={label} style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[type.label, { color: colors.textMuted, fontSize: 9.5, textAlign: 'center' }]}>{label}</Text>
          </View>
        ))}
      </View>

      <SectionHeading style={{ marginTop: 32 }}>By List</SectionHeading>
      {lists.length === 0 && <EmptyText>No lists yet. Create one to see your report.</EmptyText>}
      <View style={{ gap: 2 }}>
        {byCount.map(list => (
          <View key={list.id} style={[styles.row, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 22 }}>{getListIcon(list)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[type.cardName, { color: colors.text, fontSize: 14 }]} numberOfLines={1}>{list.name}</Text>
              <Text style={[type.label, { color: colors.textMuted, fontSize: 10, marginTop: 2 }]}>{getListActivityType(list)}</Text>
              <ProgressBar pct={Math.round((list.entries.length / maxCount) * 100)} />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{list.entries.length}</Text>
              <Text style={[type.label, { color: colors.textMuted, fontSize: 9.5 }]}>logged</Text>
            </View>
          </View>
        ))}
      </View>

      <SectionHeading style={{ marginTop: 40 }}>Recent Activity</SectionHeading>
      {recent.length === 0 && <EmptyText>No activities logged yet.</EmptyText>}
      {recent.map(group => (
        <DayGroup key={group.key} group={group}>
          {group.entries.map(e => (
            <View key={e.id} style={[styles.feedItem, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 18 }}>{getListIcon(e.list)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 14 }}>{e.text}</Text>
                <Text style={[type.label, { color: colors.textMuted, fontSize: 10, marginTop: 2 }]}>{e.list.name}</Text>
              </View>
              <Text style={[type.label, { color: colors.textMuted, letterSpacing: 0.4 }]}>{timeOfDay(e.createdAt)}</Text>
            </View>
          ))}
        </DayGroup>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  summary: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, paddingVertical: 20, paddingHorizontal: 6, alignItems: 'center' },
  statValue: { fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  feedItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 18 },
});
