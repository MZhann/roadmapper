import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { colors, type Palette } from './tokens';
export type Appearance = 'system' | 'light' | 'dark';
type Theme = { colors: Palette; mode: 'light' | 'dark'; appearance: Appearance; setAppearance: (value: Appearance) => Promise<void> };
const Context = createContext<Theme>({ colors: colors.light, mode: 'light', appearance: 'system', setAppearance: async () => {} });
export function ThemeProvider({ children, forced }: PropsWithChildren<{ forced?: 'light' | 'dark' }>) {
  const system = useColorScheme(); const [appearance, setValue] = useState<Appearance>('system');
  useEffect(() => { if (!forced) void AsyncStorage.getItem('milo.appearance').then(v => { if (v === 'dark' || v === 'light') setValue(v); }).catch(() => {}); }, [forced]);
  const mode = forced ?? (appearance === 'system' ? system === 'dark' ? 'dark' : 'light' : appearance);
  const setAppearance = async (value: Appearance) => { await AsyncStorage.setItem('milo.appearance', value); setValue(value); };
  return <Context.Provider value={{ colors: colors[mode], mode, appearance, setAppearance }}>{children}</Context.Provider>;
}
export const useTheme = () => useContext(Context);
