import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { db } from './supabase';
WebBrowser.maybeCompleteAuthSession();
export const authRedirect = () => makeRedirectUri({ scheme: 'milo', path: 'auth/callback' });
const exchanges = new Map<string, Promise<void>>();
export function exchangeAuthCode(code: string): Promise<void> {
  const existing = exchanges.get(code); if (existing) return existing;
  const result = (async () => { const { error } = await db().auth.exchangeCodeForSession(code); if (error) throw error; })();
  exchanges.set(code, result); return result;
}
export async function signIn(provider: 'apple' | 'google') {
  if (provider === 'apple' && Platform.OS === 'ios' && await AppleAuthentication.isAvailableAsync()) {
    const nonce = Crypto.randomUUID(); const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
    const credential = await AppleAuthentication.signInAsync({ requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL], nonce: hashedNonce });
    if (!credential.identityToken) throw new Error('Apple did not return a sign-in token. Please try again.');
    const { error } = await db().auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken, nonce }); if (error) throw error;
    if (credential.fullName?.givenName) await db().auth.updateUser({ data: { name: credential.fullName.givenName } });
    return;
  }
  const redirectTo = authRedirect();
  const { data, error } = await db().auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' } }); if (error) throw error;
  if (Platform.OS !== 'web' && data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return;
    const params = new URL(result.url).searchParams;
    if (params.get('error_description')) throw new Error(params.get('error_description')!);
    const code = params.get('code'); if (!code) throw new Error('The sign-in link was incomplete. Please try again.');
    await exchangeAuthCode(code);
  }
}
export async function sendMagicLink(email: string) {
  const { error } = await db().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: authRedirect(), shouldCreateUser: true } });
  if (error) throw error;
}
