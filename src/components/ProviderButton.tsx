import { ActivityIndicator, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, size, space } from '@/theme/tokens';
import { Text } from './Text';
export function ProviderButton({ provider, loading, disabled, onPress }: { provider: 'apple' | 'google'; loading?: boolean; disabled?: boolean; onPress: () => void }) {
  const { colors } = useTheme(); const apple = provider === 'apple';
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled, busy: !!loading }} disabled={disabled || loading} onPress={onPress} style={{ minHeight: size.input, padding: space.md, borderRadius: radius.button, borderWidth: apple ? 0 : 1.5, borderColor: colors.line, backgroundColor: apple ? colors.story : colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.m }}>
    {loading ? <ActivityIndicator color={apple ? colors.white : colors.accent} /> : apple ? <Svg width={18} height={20} viewBox="0 0 17 22" fill={colors.white}><Path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.6 4.8 1.9 5.9 1 7.5c-1.9 3.3-.5 8.1 1.3 10.8.9 1.3 1.9 2.7 3.3 2.7 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.9-1.1-2.9-4.7zM11.6 3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" /></Svg> : <Svg width={18} height={18} viewBox="0 0 48 48"><Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" /><Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></Svg>}
    <Text variant="card" style={{ color: apple ? colors.white : colors.ink }}>Continue with {apple ? 'Apple' : 'Google'}</Text>
  </Pressable>;
}
