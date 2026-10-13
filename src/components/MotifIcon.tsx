import Svg, { Path } from 'react-native-svg';
import type { ThemeId } from '@/domain/schema';
import { motifs } from '@/theme/motifs';
import { useTheme } from '@/theme/ThemeProvider';
export function MotifIcon({ theme, size = 30, faint = false }: { theme: ThemeId; size?: number; faint?: boolean }) { const { colors } = useTheme(); return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={faint ? colors.motifFaint : colors.accent} strokeWidth={faint ? 0.9 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><Path d={(motifs[theme] ?? motifs.general_adventure).path} /></Svg>; }
