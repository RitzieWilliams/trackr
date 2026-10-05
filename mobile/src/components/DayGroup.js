import { Text, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../theme';
import { dayLabel } from '../lib/progress';

// A day heading (Today / Yesterday / Wednesday, Oct 1) with a count, followed by its rows
export default function DayGroup({ group, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[type.label, { color: colors.text, fontSize: 12 }]}>{dayLabel(group.entries[0].createdAt)}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{group.entries.length}</Text>
      </View>
      <View style={styles.items}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 28 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    paddingBottom: 10,
    marginBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  items: { gap: 2 },
});
