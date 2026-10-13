import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isConfigured = Boolean(url && key && !url.includes('YOUR_PROJECT'));
const server = Platform.OS === 'web' && typeof window === 'undefined';
const storage = server ? undefined : Platform.OS === 'web' ? AsyncStorage : { getItem: SecureStore.getItemAsync, setItem: SecureStore.setItemAsync, removeItem: SecureStore.deleteItemAsync };
export const supabase = isConfigured ? createClient(url!, key!, { auth: { storage, autoRefreshToken: !server, persistSession: !server, detectSessionInUrl: false, flowType: 'pkce' } }) : null;
export function db() { if (!supabase) throw new Error('Milo is not connected yet. Add the Supabase environment settings and restart the app.'); return supabase; }
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Something went wrong. Please try again.'; }
