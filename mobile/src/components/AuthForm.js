import { KeyboardAvoidingView, Platform, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

// Shared shell for the login and register screens: heading, subtitle, message box, fields
export default function AuthForm({ title, subtitle, message, children }) {
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={{ color: colors.textMuted, marginBottom: 24, fontSize: 15 }}>{subtitle}</Text>
        {message && (
          <View style={[styles.message, { borderColor: message.error ? colors.danger : colors.border }]}>
            <Text style={{ color: message.error ? colors.danger : colors.text, fontSize: 14 }}>{message.text}</Text>
          </View>
        )}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', textTransform: 'uppercase', letterSpacing: -0.6, marginBottom: 6 },
  message: { borderWidth: 1, padding: 12, marginBottom: 18 },
});
