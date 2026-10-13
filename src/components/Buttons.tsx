import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, size, space } from '@/theme/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptic } from '@/lib/haptics';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
type ButtonProps = { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; icon?: IconName; compact?: boolean; style?: StyleProp<ViewStyle>; testID?: string };
export function PrimaryButton({ label, onPress, disabled, loading, icon, compact, style, testID }: ButtonProps) {
  const { colors } = useTheme(); const reduced = useReducedMotion(); const y = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const change = (pressed: boolean) => { y.set(reduced ? pressed ? 3 : 0 : withSpring(pressed ? 3 : 0, motion.spring)); };
  const blocked = disabled || loading;
  return <View style={[{ marginBottom: space.xs, opacity: blocked ? 0.55 : 1 }, style]}>
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accentDeep, borderRadius: compact ? radius.small : radius.button, top: space.xs, bottom: -space.xs }]} />
    <Animated.View style={animated}><Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!blocked, busy: !!loading }} disabled={blocked} onPressIn={() => change(true)} onPressOut={() => change(false)} onPress={() => { haptic(); onPress(); }} style={{ minHeight: compact ? size.touch : size.button, paddingVertical: space.m, paddingHorizontal: space.lg, backgroundColor: colors.accent, borderRadius: compact ? radius.small : radius.button, flexDirection: 'row', gap: space.s, alignItems: 'center', justifyContent: 'center' }}>
      {loading ? <ActivityIndicator color={colors.onAccent} /> : icon ? <Icon name={icon} color={colors.onAccent} size={18} /> : null}
      <Text variant={compact ? 'card' : 'button'} style={{ color: colors.onAccent, textAlign: 'center', flexShrink: 1 }}>{label}</Text>
    </Pressable></Animated.View>
  </View>;
}
export function SecondaryButton({ label, onPress, disabled, loading, icon, style, testID }: ButtonProps) {
  const { colors } = useTheme();
  return <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ disabled: !!disabled, busy: !!loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [{ minHeight: size.secondary, padding: space.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: pressed ? colors.inset : colors.surface, borderRadius: radius.button, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s, opacity: disabled ? 0.55 : 1 }, style]}>
    {loading ? <ActivityIndicator color={colors.accent} /> : icon ? <Icon name={icon} size={18} /> : null}<Text variant="card" style={{ textAlign: 'center', flexShrink: 1 }}>{label}</Text>
  </Pressable>;
}
export function TextButton({ label, onPress, muted = false }: { label: string; onPress: () => void; muted?: boolean }) {
  const { colors } = useTheme(); return <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: size.touch, padding: space.s, justifyContent: 'center', alignItems: 'center' }}><Text variant="card" style={{ color: muted ? colors.muted : colors.accent, textAlign: 'center' }}>{label}</Text></Pressable>;
}
export function IconButton({ name, label, onPress, border = false }: { name: IconName; label: string; onPress: () => void; border?: boolean }) {
  const { colors } = useTheme(); return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ width: size.touch, height: size.touch, justifyContent: 'center', alignItems: 'center', borderRadius: radius.control, borderWidth: border ? 1.5 : 0, borderColor: colors.line, backgroundColor: border ? colors.surface : colors.transparent }}><Icon name={name} size={22} /></Pressable>;
}
