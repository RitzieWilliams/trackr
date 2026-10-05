import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../../theme';
import { useSession } from '../../data/SessionContext';
import { useLists } from '../../data/ListsContext';
import { loadProfile, saveProfile } from '../../data/profile';
import { supabase } from '../../lib/supabase';
import { computeStreak } from '../../lib/progress';
import { Button, FormInput, FormLabel, SectionHeading } from '../../components/ui';

const THEME_OPTIONS = [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']];

export default function Profile() {
  const { colors, preference, setPreference } = useTheme();
  const { session } = useSession();
  const { lists } = useLists();

  const [profile, setProfile] = useState(() => {
    const stored = loadProfile();
    const metaName = session?.user?.user_metadata?.name;
    return stored.name || !metaName ? stored : { ...stored, name: metaName };
  });
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.goal);
  const [saved, setSaved] = useState(false);

  const displayName = profile.name || 'You';
  const initials = displayName.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const totalActivities = lists.reduce((sum, l) => sum + l.entries.length, 0);

  function handleSave() {
    const next = { name: name.trim(), goal: goal.trim() };
    saveProfile(next);
    setProfile(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleLogout() {
    Alert.alert('Log Out?', "You'll be returned to the TRACKR welcome screen. Your data stays saved.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  // Required by the App Store for apps with account sign-up.
  // delete_user() is a Supabase SQL function that removes the user's lists, entries and account.
  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account?',
      'This permanently deletes your account, all your lists and all your entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.rpc('delete_user');
            if (error) { Alert.alert('Failed to delete account', error.message); return; }
            saveProfile({ name: '', goal: '' });
            await supabase.auth.signOut({ scope: 'local' });
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.primaryText, fontSize: 24, fontWeight: '800' }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.title, { color: colors.text, fontSize: 22 }]} numberOfLines={1}>{profile.name || 'Your Name'}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 2 }} numberOfLines={2}>{profile.goal || 'Set a goal or tagline'}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          {[[lists.length, 'Lists'], [totalActivities, 'Activities'], [computeStreak(lists), 'Day Streak']].map(([value, label]) => (
            <View key={label} style={[styles.stat, { backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{value}</Text>
              <Text style={[type.label, { color: colors.textMuted, fontSize: 9.5 }]}>{label}</Text>
            </View>
          ))}
        </View>

        <SectionHeading style={{ marginTop: 32 }}>Edit Profile</SectionHeading>
        <FormLabel>Name</FormLabel>
        <FormInput value={name} onChangeText={setName} placeholder="Your name" maxLength={50} />
        <FormLabel style={{ marginTop: 18 }}>Goal / Tagline</FormLabel>
        <FormInput value={goal} onChangeText={setGoal} placeholder="e.g. Run a marathon this year" maxLength={80} />
        <Button title={saved ? 'Saved!' : 'Save Changes'} onPress={handleSave} style={{ marginTop: 20 }} />

        <SectionHeading style={{ marginTop: 40 }}>Appearance</SectionHeading>
        <View style={[styles.toggle, { borderColor: colors.border }]}>
          {THEME_OPTIONS.map(([value, label]) => {
            const active = preference === value;
            return (
              <Pressable
                key={value}
                onPress={() => setPreference(value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.toggleOption, active && { backgroundColor: colors.primary }]}
              >
                <Text style={[type.label, { color: active ? colors.primaryText : colors.textMuted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeading style={{ marginTop: 40 }}>Account</SectionHeading>
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>{session?.user?.email}</Text>
        <Button title="Log Out" variant="ghost" onPress={handleLogout} />
        <Button title="Delete Account" variant="danger" onPress={handleDeleteAccount} style={{ marginTop: 10 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 18, gap: 4 },
  toggle: { flexDirection: 'row', borderWidth: 1 },
  toggleOption: { flex: 1, alignItems: 'center', paddingVertical: 12 },
});
