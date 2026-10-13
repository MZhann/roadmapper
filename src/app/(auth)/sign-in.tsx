import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { signIn, sendMagicLink } from '@/lib/auth';
import { errorMessage } from '@/lib/supabase';
import { back, replace } from '@/lib/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { IconButton, PrimaryButton } from '@/components/Buttons';
import { ProviderButton } from '@/components/ProviderButton';
import { Card, InlineError, Input, layout } from '@/components/Primitives';
export default function SignIn() {
  const { colors } = useTheme(); const { session } = useAuth(); const [email, setEmail] = useState(''); const [busy, setBusy] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [sent, setSent] = useState(false);
  useEffect(() => { if (session) replace('/'); }, [session]);
  const run = async (kind: 'apple' | 'google' | 'email') => {
    if (busy) return; setError(null);
    if (kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    setBusy(kind);
    try { if (kind === 'email') { await sendMagicLink(email); setSent(true); } else await signIn(kind); } catch (e) { if (!(e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED')) setError(errorMessage(e)); } finally { setBusy(null); }
  };
  const legal = async (kind: 'terms' | 'privacy') => { const url = kind === 'terms' ? process.env.EXPO_PUBLIC_TERMS_URL : process.env.EXPO_PUBLIC_PRIVACY_URL; if (!url) { setError(`The ${kind === 'terms' ? 'Terms' : 'Privacy Policy'} will be published before launch.`); return; } try { await Linking.openURL(url); } catch (e) { setError(errorMessage(e)); } };
  return <Screen footer={<Text variant="tiny" muted style={{ textAlign: 'center' }}>By continuing you agree to the <Text variant="tiny" accessibilityRole="link" onPress={() => void legal('terms')} style={{ color: colors.accent }}>Terms</Text> and <Text variant="tiny" accessibilityRole="link" onPress={() => void legal('privacy')} style={{ color: colors.accent }}>Privacy Policy</Text>.</Text>}>
    <View style={{ marginLeft: -space.m }}><IconButton name="back" label="Back" onPress={() => back('/welcome')} /></View>
    <Text variant="title" style={{ marginTop: space.page, marginBottom: space.s }}>Save your progress</Text><Text muted>One account keeps your goals, streaks and notes in sync across iPhone and web.</Text>
    <View style={{ gap: space.md, marginTop: space.footer }}><ProviderButton provider="apple" loading={busy === 'apple'} disabled={!!busy} onPress={() => void run('apple')} /><ProviderButton provider="google" loading={busy === 'google'} disabled={!!busy} onPress={() => void run('google')} /></View>
    <View style={[layout.row, { marginVertical: space.section }]}><View style={{ flex: 1, height: 1, backgroundColor: colors.line }} /><Text variant="caption" muted>or</Text><View style={{ flex: 1, height: 1, backgroundColor: colors.line }} /></View>
    <View style={{ gap: space.s }}><Text variant="caption">Email</Text><Input accessibilityLabel="Email" autoComplete="email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={value => { setEmail(value); setSent(false); }} placeholder="you@example.com" onSubmitEditing={() => void run('email')} /></View>
    <View style={{ marginTop: space.ml, gap: space.m }}><PrimaryButton label={sent ? 'Send another link' : 'Send magic link'} loading={busy === 'email'} disabled={!!busy} onPress={() => void run('email')} /><Text variant="small" muted style={{ textAlign: 'center' }}>No password needed — we email you a one-tap sign-in link.</Text><InlineError message={error} />{sent && <Card><Text variant="card">Check your inbox</Text><Text muted>Open the link on this device to sign in. You can return here to try another email.</Text></Card>}</View>
  </Screen>;
}
