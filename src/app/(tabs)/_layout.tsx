import { Slot, usePathname } from 'expo-router';
import { View } from 'react-native';
import { AuthGate } from '@/components/AuthGate';
import { TabBar } from '@/components/TabBar';
import { go } from '@/lib/navigation';
export default function TabsLayout() { const path = usePathname(); return <AuthGate><View style={{ flex: 1 }}><Slot /><TabBar active={path === '/journal' ? 'journal' : path === '/profile' ? 'profile' : 'path'} onChange={tab => go(tab === 'path' ? '/' : `/${tab}`)} /></View></AuthGate>; }
