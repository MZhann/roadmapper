import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { Step, ThemeId } from '@/domain/schema';
import { localDate, stepState } from '@/domain/progress';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, size, space } from '@/theme/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Icon } from './Icon';
import { Text } from './Text';
import { MotifIcon } from './MotifIcon';
import { PrimaryButton } from './Buttons';

export function pathPoints(count: number, width: number, offset = 0) { return Array.from({ length: count }, (_, i) => ({ x: width / 2 + Math.round(width * 0.2 * Math.sin(i * 1.05)), y: 46 + i * 92 + offset })); }
export function curve(points: { x: number; y: number }[]) { return points.map((p, i) => i ? `C ${points[i - 1].x} ${(points[i - 1].y + p.y) / 2}, ${p.x} ${(points[i - 1].y + p.y) / 2}, ${p.x} ${p.y}` : `M ${p.x} ${p.y}`).join(' '); }
export function RoadmapPath({ steps, allSteps = steps, theme, onStart, desktop=false }: { steps: Step[]; allSteps?: Step[]; theme: ThemeId; onStart: (step: Step) => void; desktop?:boolean }) {
  const { colors } = useTheme(); const [width, setWidth] = useState(390); const [selected, setSelected] = useState<string | null>(null); const reduced = useReducedMotion();
  const bob = useSharedValue(0); const animation = useAnimatedStyle(() => ({ transform: [{ translateY: bob.get() }] }));
  useEffect(() => { bob.set(reduced ? 0 : withRepeat(withTiming(-4, { duration: motion.bob / 2 }), -1, true)); return () => cancelAnimation(bob); }, [reduced, bob]);
  const current = steps.findIndex(s => stepState(s, allSteps) === 'current');
  const offset = current === 0 && !desktop ? space.hero : 0;
  const points = desktop?steps.map((_,i)=>({x:width/2+Math.round(width*110/520*Math.sin(i)),y:50+i*86})):pathPoints(steps.length, width, offset);
  const lastDone = steps.findLastIndex(step => step.status === 'done');
  const completedEnd = Math.min(lastDone + 1, steps.length - 1);
  const selectedIndex = steps.findIndex(s => s.id === selected); const selectedStep = steps[selectedIndex];
  const selectedPoint = points[selectedIndex];
  const selectedState = selectedStep ? stepState(selectedStep, allSteps) : undefined;
  const nodeSize = selectedState === 'current' ? desktop?80:size.currentNode : desktop?66:size.node;
  const height = Math.max(180, steps.length * (desktop?86:92) + offset + (selectedIndex === steps.length - 1 ? 200 : 16));
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ height, width: '100%' }}>
    <Svg width={width} height={height} style={{ position: 'absolute' }} aria-hidden><Path d={curve(points.slice(0, completedEnd + 1))} fill="none" stroke={colors.accent} strokeWidth={5} opacity={0.35} strokeLinecap="round" /><Path d={curve(points.slice(Math.max(0, completedEnd)))} fill="none" stroke={colors.pathDash} strokeWidth={4} strokeDasharray="1 12" strokeLinecap="round" /></Svg>
    {!desktop&&<><View pointerEvents="none" style={{ position: 'absolute', left: 34, top: 120 + offset }}><MotifIcon theme={theme} size={84} faint /></View>
    <View pointerEvents="none" style={{ position: 'absolute', right: 30, top: 330 + offset }}><MotifIcon theme={theme} size={64} faint /></View></>}
    {steps.map((step, i) => { const state = stepState(step, allSteps); const diameter = state === 'current' ? desktop?80:size.currentNode : desktop?66:size.node; const p = points[i]; const locked = state === 'locked'; return <View key={step.id} style={{ position: 'absolute', left: p.x - diameter / 2, top: p.y - diameter / 2, width: diameter, height: diameter }}>
      {desktop&&<View pointerEvents="none" style={{position:'absolute',top:0,bottom:0,justifyContent:'center',width:Math.min(200,width*0.4),...(p.x<width/2?{left:diameter+space.ml}:{right:diameter+space.ml})}}><Text variant="caption" style={{color:locked?colors.lockedIcon:colors.ink,textAlign:p.x<width/2?'left':'right'}}>{step.title}</Text></View>}
      {state === 'current' && <View style={{ position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, backgroundColor: colors.accentSoft, borderRadius: radius.round }} />}
      <View style={{ position: 'absolute', top: space.sm, bottom: -space.sm, left: 0, right: 0, borderRadius: radius.round, backgroundColor: locked ? colors.lockedNodeShadow : colors.accentDeep }} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Step ${allSteps.findIndex(s => s.id === step.id) + 1}: ${step.title}${locked ? ' (locked)' : state === 'done' ? ' (completed)' : ''}`} accessibilityState={{ expanded: selected === step.id }} onPress={() => setSelected(selected === step.id ? null : step.id)} style={({ pressed }) => ({ width: diameter, height: diameter, borderRadius: radius.round, backgroundColor: locked ? colors.lockedNode : colors.accent, justifyContent: 'center', alignItems: 'center', transform: [{ translateY: pressed || selected === step.id ? 2 : 0 }] })}>
        <Icon name={state === 'done' ? 'check' : state === 'current' ? 'star' : i === steps.length - 1 ? 'flag' : 'lock'} size={state === 'current' ? 30 : 26} color={locked ? colors.lockedIcon : colors.white} stroke={state === 'done' ? 3.2 : 2.2} filled={state === 'current'} />
      </Pressable>
    </View>; })}
    {current >= 0 && !selected && !desktop && <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: points[current].x - 34, top: points[current].y - size.currentNode / 2 - 40, width: 68, paddingVertical: space.sm, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.line, borderRadius: radius.tag, alignItems: 'center' }, animation]}><Text variant="small" style={{ color: colors.accent, letterSpacing: 0.8 }}>START</Text></Animated.View>}
    {selectedStep && <View style={{ position: 'absolute', zIndex: 5, left: Math.max(space.lg, Math.min(width - space.lg - 250, selectedPoint.x - 125)), top: selectedPoint.y + nodeSize / 2 + space.lg, width: 250, padding: space.ml, borderRadius: radius.option, borderWidth: 1.5, borderColor: selectedState === 'locked' ? colors.line : colors.accent, backgroundColor: colors.surface, gap: space.s, boxShadow: `0px 10px 30px ${colors.shadow}` }}>
      <Text variant="tiny" muted>Step {allSteps.findIndex(s => s.id === selectedStep.id) + 1} of {allSteps.length} · {selectedStep.minutes} min</Text><Text variant="button">{selectedStep.title}</Text>
      {selectedState === 'locked' ? <Text variant="small" muted>{selectedStep.unlock_date && selectedStep.unlock_date > localDate() ? `Available ${selectedStep.unlock_date}, after the earlier steps` : 'Finish the steps before this to unlock'}</Text> : <PrimaryButton compact label={selectedState === 'done' ? 'Review step' : `Start  +${selectedStep.xp} XP`} onPress={() => onStart(selectedStep)} />}
    </View>}
  </View>;
}
