import { Modal, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { getProgress, getListActivityType } from '../lib/progress';
import { Button } from './ui';

export default function GoalModal({ list, visible, onClose }) {
  const { colors } = useTheme();
  if (!list) return null;

  const p = getProgress(list);
  const message = p.mode === 'down'
    ? `${list.name} counted down from ${p.target} to zero.`
    : `You've logged ${p.target} × ${getListActivityType(list)} — goal complete.`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: colors.text }]}>Goal Reached!</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          <Button title="Awesome" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 24 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 400, borderWidth: 1, padding: 28, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', textTransform: 'uppercase', letterSpacing: -0.4, marginBottom: 8 },
  message: { fontSize: 15, textAlign: 'center' },
});
