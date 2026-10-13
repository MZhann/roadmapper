import { Platform, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Logo } from '@/components/Logo';
import { WelcomeArt } from '@/components/WelcomeArt';
import { PrimaryButton, TextButton } from '@/components/Buttons';
import { go } from '@/lib/navigation';
import { space } from '@/theme/tokens';
export default function Welcome() {
  return <Screen style={Platform.OS === 'web' ? { paddingTop: space.welcomeTop, paddingBottom: 0 } : { paddingBottom: 0 }} footerStyle={{ paddingTop: space.block, paddingBottom: space.hero, gap: space.md }} footer={<><PrimaryButton label="Get started" onPress={() => go('/sign-in')} /><TextButton label="I already have an account" muted onPress={() => go('/sign-in')} /></>}>
    <Logo wordmark /><View style={{ flex: 1, minHeight: 300, marginTop: space.page }}><View style={{ position: 'absolute', left: 0, right: 0, top: 0 }}><WelcomeArt /></View></View>
    <View style={{ gap: space.md }}><Text variant="display">{'Any goal.\nOne clear path.'}</Text><Text variant="bodyLarge" muted>Describe what you want to achieve. Milo maps it into small daily steps you can actually finish.</Text></View>
  </Screen>;
}
