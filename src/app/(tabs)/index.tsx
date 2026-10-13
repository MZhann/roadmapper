import { Screen } from '@/components/Screen';
import { HomeEmpty } from '@/components/HomeEmpty';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/data/queries';
export default function Home() { const { session } = useAuth(); const profile = useProfile(session?.user.id); return <Screen><HomeEmpty name={profile.data?.name ?? 'friend'} minutes={profile.data?.daily_minutes} /></Screen>; }
