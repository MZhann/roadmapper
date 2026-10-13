import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';
import { Text } from './Text';
export const clampProgress = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
export function ProgressBar({ value, height = 10, segments, label = 'Progress', color }: { value: number; height?: number; segments?: number; label?: string; color?: string }) {
  const { colors } = useTheme(); const progress = clampProgress(value);
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={{ flexDirection: 'row', gap: space.xs }}>
    {segments ? Array.from({ length: segments }, (_, i) => <View key={i} style={{ flex: 1, height, borderRadius: radius.xs, backgroundColor: i < progress * segments ? color ?? colors.accent : colors.line }} />) : <View style={{ height, flex: 1, overflow: 'hidden', borderRadius: radius.xs, backgroundColor: colors.line }}><View style={{ height, width: `${progress * 100}%`, borderRadius: radius.xs, backgroundColor: color ?? colors.accent }} /></View>}
  </View>;
}
export function ProgressRing({ value }: { value: number }) {
  const { colors } = useTheme(); const progress = clampProgress(value); const circumference = 2 * Math.PI * 22;
  return <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`${Math.round(progress * 100)} percent complete`}><Svg width={52} height={52} style={{ position: 'absolute' }}><Circle cx={26} cy={26} r={22} fill="none" stroke={colors.lockedNode} strokeWidth={5} /><Circle cx={26} cy={26} r={22} fill="none" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${circumference * progress} ${circumference}`} transform="rotate(-90 26 26)" /></Svg><Text variant="small">{Math.round(progress * 100)}%</Text></View>;
}
