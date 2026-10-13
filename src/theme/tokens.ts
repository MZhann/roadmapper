/** Values from DESIGN_HANDOFF.md and the inline screen canvases. */
export const light = {
  background: '#F6F7F5', surface: '#FFFFFF', line: '#E4E6E1', ink: '#15171A',
  inkSecondary: '#3A4048', muted: '#5E646B', accent: '#3346D3', accentDeep: '#2535A8',
  accentSoft: '#E8EBFC', onAccent: '#FFFFFF', lockedNode: '#ECEEEA',
  lockedNodeShadow: '#D9DCD5', lockedIcon: '#8A9097', pathDash: '#C9CDC6',
  motifFaint: '#E2E4DF', streakBg: '#FFF3E6', streakText: '#8A4A0E', streakIcon: '#C2620F',
  inset: '#F0F1EE', warning: '#D9822B', tipText: '#5C3409', weekBar: '#BFC7F5',
  story: '#15171A', storyTile: '#2A2E33', storyText: '#FFFFFF', storyMuted: '#B9BEC4',
  white: '#FFFFFF', transparent: 'transparent', shadow: 'rgba(0,0,0,0.10)',
};
export type Palette = typeof light;
export const dark: Palette = {
  background: '#0F1113', surface: '#181B1E', line: '#2A2E33', ink: '#F1F2F3',
  inkSecondary: '#C9CDD2', muted: '#9AA1A9', accent: '#8C9BFF', accentDeep: '#5563C9',
  accentSoft: '#1F2547', onAccent: '#0F1113', lockedNode: '#22262B',
  lockedNodeShadow: '#15181B', lockedIcon: '#6C737B', pathDash: '#3A3F45',
  motifFaint: '#262A2F', streakBg: '#2E2216', streakText: '#F0A257', streakIcon: '#F0A257',
  inset: '#22262B', warning: '#F0A257', tipText: '#F0A257', weekBar: '#5563C9',
  story: '#181B1E', storyTile: '#2A2E33', storyText: '#FFFFFF', storyMuted: '#B9BEC4',
  white: '#FFFFFF', transparent: 'transparent', shadow: 'rgba(0,0,0,0.5)',
};
export const colors = { light, dark };
export const space = { none: 0, hair: 1, xxs: 2, dot: 3, xs: 4, micro: 5, sm: 6, s: 8, m: 10, md: 12, ml: 14, lg: 16, xl: 18, xxl: 20, page: 24, section: 28, block: 32, footer: 36, hero: 40, huge: 48, webTop: 60, welcomeTop: 72 } as const;
export const radius = { xs: 5, chip: 8, tag: 10, small: 12, control: 14, button: 16, option: 18, card: 20, input: 22, hero: 24, round: 999 } as const;
export const size = { touch: 44, button: 56, secondary: 52, input: 54, icon: 24, tabBar: 84, radio: 22, ring: 52, node: 64, currentNode: 76, desktop: 1024, mobileMax: 480 } as const;
export const fonts = { regular: 'Nunito_400Regular', semibold: 'Nunito_600SemiBold', bold: 'Nunito_700Bold', extraBold: 'Nunito_800ExtraBold', black: 'Nunito_900Black', japanese: 'NotoSansJP_700Bold' } as const;
export const type = {
  display: { fontSize: 36, lineHeight: 39, fontFamily: fonts.black, letterSpacing: -0.8 },
  title: { fontSize: 30, lineHeight: 34, fontFamily: fonts.black, letterSpacing: -0.6 },
  titleSmall: { fontSize: 28, lineHeight: 33, fontFamily: fonts.black, letterSpacing: -0.5 },
  heading: { fontSize: 24, lineHeight: 29, fontFamily: fonts.black, letterSpacing: -0.4 },
  lesson: { fontSize: 26, lineHeight: 30, fontFamily: fonts.black, letterSpacing: -0.4 },
  subheading: { fontSize: 22, lineHeight: 27, fontFamily: fonts.black },
  unit: { fontSize: 19, lineHeight: 24, fontFamily: fonts.black },
  card: { fontSize: 16, lineHeight: 22, fontFamily: fonts.extraBold },
  button: { fontSize: 17, lineHeight: 24, fontFamily: fonts.extraBold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.semibold },
  bodyLarge: { fontSize: 17, lineHeight: 25, fontFamily: fonts.semibold },
  bodySmall: { fontSize: 15, lineHeight: 22, fontFamily: fonts.semibold },
  caption: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold },
  small: { fontSize: 13, lineHeight: 18, fontFamily: fonts.bold },
  tiny: { fontSize: 12, lineHeight: 17, fontFamily: fonts.extraBold },
  eyebrow: { fontSize: 12, lineHeight: 17, fontFamily: fonts.black, letterSpacing: 0.6 },
  tab: { fontSize: 11, lineHeight: 16, fontFamily: fonts.extraBold },
} as const;
export const motion = { spring: { damping: 18, stiffness: 220 }, transition: 200, bob: 2400, pop: 520 } as const;
