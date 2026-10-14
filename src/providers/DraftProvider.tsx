import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { useAuth } from './AuthProvider';
import { draftSchema, type Draft } from '@/domain/draft';
import { errorMessage } from '@/lib/supabase';
type State = { draft: Draft | null; loading: boolean; error: string | null; save: (draft: Draft | null) => Promise<void>; start: (prompt: string, minutes: number) => Promise<void> };
const Context = createContext<State | null>(null);
export function DraftProvider({ children }: PropsWithChildren) {
 const { session } = useAuth(); const key = `milo.draft.${session?.user.id ?? 'guest'}`;
 const [record, setRecord] = useState<{ key: string; draft: Draft | null; error: string | null }>();
 useEffect(() => { let alive = true; void AsyncStorage.getItem(key).then(raw => { if (alive) { const result = raw ? draftSchema.safeParse(JSON.parse(raw)) : null; setRecord({ key, draft: result?.success ? result.data : null, error: result && !result.success ? 'An older draft could not be restored. Please start a new goal.' : null }); } }).catch(error => { if (alive) setRecord({ key, draft: null, error: errorMessage(error) }); }); return () => { alive = false; }; }, [key]);
 const save = useCallback(async (draft: Draft | null) => { if (draft) await AsyncStorage.setItem(key, JSON.stringify(draftSchema.parse(draft))); else await AsyncStorage.removeItem(key); setRecord({ key, draft, error: null }); }, [key]);
 const start = useCallback((prompt: string, minutes: number) => save({ id: randomUUID(), prompt: prompt.trim(), minutes, days: 30, answers: {}, clarification: null, reality: null, plan: null, acceptStretch: false, revision: 0,history:[] }), [save]);
 return <Context.Provider value={{ draft: record?.key === key ? record.draft : null, loading: record?.key !== key, error: record?.key === key ? record.error : null, save, start }}>{children}</Context.Provider>;
}
export function useDraft() { const result = useContext(Context); if (!result) throw new Error('Draft provider is missing'); return result; }
