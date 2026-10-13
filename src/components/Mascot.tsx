import { View } from 'react-native';
import Goat from '../../milo-design/brand/mascot-goat.svg';
import Snail from '../../milo-design/brand/mascot-snail.svg';
import Pebble from '../../milo-design/brand/mascot-pebble.svg';
import Marker from '../../milo-design/brand/mascot-marker.svg';
import { BRAND } from '@/theme/brand';
const mascots = { goat: Goat, snail: Snail, pebble: Pebble, marker: Marker };
export function Mascot({ mood = 'happy', size = 80 }: { mood?: 'happy' | 'thinking' | 'sad' | 'cheer'; size?: number }) {
  const Artwork = mascots[BRAND.mascot]; const angle = { happy: '0deg', thinking: '-8deg', sad: '8deg', cheer: '-4deg' }[mood];
  return <View accessibilityLabel={`Milo, ${mood}`} style={{ width: size, height: size, transform: [{ rotate: angle }] }}><Artwork width={size} height={size} /></View>;
}
