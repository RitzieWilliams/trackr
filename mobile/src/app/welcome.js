import { router } from 'expo-router';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, type } from '../theme';
import Logo from '../components/Logo';
import { Button } from '../components/ui';

const FEATURES = [
  ['📋', 'Custom Lists', 'Create activity lists for any goal — fitness, reading, mindfulness, and more.'],
  ['🎯', 'Goals', 'Count up toward a goal or count down to zero, and celebrate when you get there.'],
  ['📊', 'Reports', 'See your streak, totals, and recent activity at a glance.'],
];

export default function Welcome() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Logo scale={0.8} />

        <View style={styles.hero}>
          <Text style={[styles.headline, { color: colors.text }]}>TRACK EVERY{'\n'}WIN.</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            Build habits. Log activities. Stay consistent. Your progress, always in view.
          </Text>
          <Button title="Get Started" onPress={() => router.push('/register')} />
          <Button title="I already have an account" variant="ghost" onPress={() => router.push('/login')} style={{ marginTop: 10 }} />
        </View>

        {FEATURES.map(([icon, title, desc]) => (
          <View key={title} style={[styles.feature, { borderTopColor: colors.border }]}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: colors.text, fontSize: 12 }]}>{title}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 14 }}>{desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32 },
  hero: { marginTop: 56, marginBottom: 40 },
  headline: { fontSize: 48, fontWeight: '800', letterSpacing: -2, lineHeight: 50, marginBottom: 16 },
  sub: { fontSize: 16, lineHeight: 23, marginBottom: 28 },
  feature: { flexDirection: 'row', gap: 16, paddingVertical: 18, borderTopWidth: StyleSheet.hairlineWidth },
});
