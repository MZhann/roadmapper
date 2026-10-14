import { Slot, useLocalSearchParams } from 'expo-router';
import { AuthGate } from '@/components/AuthGate';
export default function GoalLayout() { const {id}=useLocalSearchParams<{id:string}>(); return __DEV__&&id==='preview'?<Slot/>:<AuthGate><Slot/></AuthGate>; }
