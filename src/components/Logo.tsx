import { View } from 'react-native';
import Trail from '../../milo-design/brand/logo-A-trail.svg';
import Milestone from '../../milo-design/brand/logo-B-milestone.svg';
import Peak from '../../milo-design/brand/logo-C-peak-m.svg';
import Progress from '../../milo-design/brand/logo-D-progress-o.svg';
import Cairn from '../../milo-design/brand/logo-E-cairn.svg';
import Summit from '../../milo-design/brand/logo-F-summit-flag.svg';
import { BRAND } from '@/theme/brand';
import { fonts, radius, space } from '@/theme/tokens';
import { Text } from './Text';
const logos = { 'A-trail': Trail, 'B-milestone': Milestone, 'C-peak-m': Peak, 'D-progress-o': Progress, 'E-cairn': Cairn, 'F-summit-flag': Summit };
export function Logo({ size = 36, wordmark = false }: { size?: number; wordmark?: boolean }) {
  const Artwork = logos[BRAND.logo];
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }} accessibilityLabel="Milo"><View style={{ width: size, height: size, borderRadius: radius.small, overflow: 'hidden' }}><Artwork width={size} height={size} /></View>{wordmark && <Text style={{ fontSize: 22, fontFamily: fonts.black, letterSpacing: -1 }}>milo</Text>}</View>;
}
