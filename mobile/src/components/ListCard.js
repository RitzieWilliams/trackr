import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../theme';
import { getListIcon, getListActivityType, getProgress, progressLabel } from '../lib/progress';
import { Button, GoalBadge } from './ui';

export default function ListCard({ list, onPress, onRestore }) {
  const { colors } = useTheme();
  const archived = !!list.archivedAt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: pressed ? colors.surface2 : colors.surface }]}
    >
      <View style={[styles.accent, { backgroundColor: colors.text }]} />
      <View style={[styles.top, archived && { opacity: 0.55 }]}>
        <View style={[styles.icon, { backgroundColor: colors.surface2 }]}>
          <Text style={{ fontSize: 24 }}>{getListIcon(list)}</Text>
        </View>
        <View style={styles.text}>
          <Text style={[type.cardName, { color: colors.text }]} numberOfLines={2}>{list.name}</Text>
          <Text style={[type.label, { color: colors.textMuted, fontSize: 10.5, marginTop: 2 }]}>
            {getListActivityType(list)}
          </Text>
          <View style={styles.progress}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{progressLabel(list)}</Text>
            {getProgress(list).reached && <GoalBadge />}
          </View>
        </View>
      </View>
      {archived
        ? <Button title="Restore" variant="ghost" onPress={onRestore} />
        : <Text style={{ color: colors.textMuted, fontSize: 18 }}>→</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingLeft: 20,
    paddingRight: 16,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, opacity: 0.7 },
  top: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, minWidth: 0 },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0 },
  progress: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
});
