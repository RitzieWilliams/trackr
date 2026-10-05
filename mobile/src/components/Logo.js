import { Text, View } from 'react-native';
import { useTheme } from '../theme';

// The web app's SVG logo (three stepped bars + wordmark), drawn with Views
export default function Logo({ scale = 1 }) {
  const { colors } = useTheme();
  const bar = w => ({ width: w * scale, height: 8 * scale, backgroundColor: colors.text, marginBottom: 6 * scale });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 * scale }}>
      <View style={{ paddingTop: 6 * scale }}>
        <View style={bar(40)} />
        <View style={bar(28)} />
        <View style={bar(16)} />
      </View>
      <Text style={{ color: colors.text, fontSize: 34 * scale, fontWeight: '800', letterSpacing: -1 }}>TRACKR</Text>
    </View>
  );
}
