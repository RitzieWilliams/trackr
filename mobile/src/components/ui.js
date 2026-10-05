import { Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { useTheme, type } from '../theme';

// Small building blocks that mirror the web app's .btn, .form-input, .badge, etc.

export function Button({ title, onPress, variant = 'primary', disabled, style }) {
  const { colors } = useTheme();
  const variants = {
    primary: { bg: colors.primary, fg: colors.primaryText, border: colors.primary },
    ghost:   { bg: 'transparent',  fg: colors.text,        border: colors.border },
    danger:  { bg: 'transparent',  fg: colors.danger,      border: colors.danger },
  };
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <Text style={[type.label, { color: v.fg, fontSize: 12 }]}>{title}</Text>
    </Pressable>
  );
}

export function SectionHeading({ children, style }) {
  const { colors } = useTheme();
  return (
    <Text style={[type.label, styles.sectionHeading, { color: colors.textMuted, borderBottomColor: colors.border }, style]}>
      {children}
    </Text>
  );
}

export function FormLabel({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[type.label, { color: colors.textMuted, marginBottom: 8, fontSize: 10.5 }, style]}>{children}</Text>;
}

export function FormInput(props) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, props.style]}
    />
  );
}

export function Badge({ children, filled }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, filled
      ? { backgroundColor: colors.primary, borderColor: colors.primary }
      : { backgroundColor: colors.surface2, borderColor: colors.border }]}>
      <Text style={[type.label, { fontSize: 10, color: filled ? colors.primaryText : colors.textMuted }]}>{children}</Text>
    </View>
  );
}

export function GoalBadge() {
  return <Badge filled>🎉 Goal reached</Badge>;
}

export function ProgressBar({ pct }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.barWrap, { backgroundColor: colors.border }]}>
      <View style={[styles.bar, { width: `${pct}%`, backgroundColor: colors.text }]} />
    </View>
  );
}

export function EmptyText({ children }) {
  const { colors } = useTheme();
  return <Text style={[type.label, { color: colors.textMuted, textAlign: 'center', paddingVertical: 40, fontSize: 12 }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  barWrap: { height: 4, marginTop: 12 },
  bar: { height: '100%' },
});
