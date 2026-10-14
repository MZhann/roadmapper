import { useLocalSearchParams } from 'expo-router';
import { View,useWindowDimensions } from 'react-native';
import { useGoal, useGoals } from '@/data/queries';
import { previewGoal } from '@/data/preview';
import { themeSchema } from '@/domain/schema';
import { deadlineLabel, progressOf, statsOf } from '@/domain/progress';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { motifs } from '@/theme/motifs';
import { size,space } from '@/theme/tokens';
import { DesktopRoadmap } from '@/components/DesktopRoadmap';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card, layout, MotifBox, Pill, StateView } from '@/components/Primitives';
import { IconButton } from '@/components/Buttons';
import { MotifIcon } from '@/components/MotifIcon';
import { RoadmapPath } from '@/components/RoadmapPath';
import { ProgressBar } from '@/components/ProgressBar';
import { TabBar } from '@/components/TabBar';
import { go, replace, stepPath } from '@/lib/navigation';
import { errorMessage } from '@/lib/supabase';
function Roadmap() {
  const {width}=useWindowDimensions();
  const { id = '', theme } = useLocalSearchParams<{ id: string; theme?: string }>(); const { colors } = useTheme();
  const preview = __DEV__ && id === 'preview'; const query = useGoal(id, !preview); const allGoals = useGoals(!preview); const goal = preview ? previewGoal(themeSchema.safeParse(theme).data) : query.data;
  if (!preview && query.isPending) return <StateView kind="loading" title="Loading your path" />;
  if (query.error) return <StateView kind="error" title="Your path couldn't load" message={errorMessage(query.error)} action="Retry" onAction={() => void query.refetch()} />;
  if (!goal || !goal.units.length) return <StateView title="This path isn't here yet" message="Create a goal to start walking your path." action="Back to goals" onAction={() => replace('/')} />;
  const progress = progressOf(goal); const currentUnit = goal.units.find(u => u.steps.some(s => s.id === progress.next?.id)) ?? goal.units.at(-1)!;
  const units = [...goal.units].sort((a, b) => a.idx - b.idx); const ordered = [currentUnit, ...units.filter(u => u.id !== currentUnit.id)];
  if(width>=size.desktop)return <DesktopRoadmap goal={goal} goals={allGoals.data??[goal]} preview={preview}/>;
  return <View style={{ flex: 1, backgroundColor: colors.background }}><Screen padded={false} style={{ paddingBottom: 0 }}>
    <View style={{ paddingHorizontal: space.xxl, gap: space.sm }}><View style={[layout.row,{marginLeft:-space.m,marginBottom:space.s}]}><IconButton name="back" label="Back to goals" onPress={() => replace('/')} /><View style={layout.flex}><Text variant="tiny" muted>{motifs[goal.theme_id].label}</Text><Text variant="unit">{goal.title}</Text></View><Pill value={preview ? 12 : statsOf(allGoals.data ?? [goal]).streak} /></View>
      <ProgressBar value={preview ? goal.theme_id==='sports_movement'?0.7:0.33 : progress.ratio} /><View style={layout.between}><Text variant="tiny" muted>{preview ? goal.theme_id==='sports_movement'?'14 of 20 steps':'8 of 24 steps' : `${progress.done} of ${progress.total} steps`}</Text><Text variant="tiny" muted>{deadlineLabel(goal.deadline)}</Text></View>
    </View>
    {ordered.map(unit => <View key={unit.id}><Card style={{ marginHorizontal: space.xxl, marginTop: space.lg, paddingVertical: space.ml, ...layout.row }}><View style={layout.flex}><Text variant="eyebrow" style={{ color: colors.accent }}>UNIT {preview?unit.idx+1:unit.idx} · {unit.steps.filter(s => s.status === 'done').length} OF {unit.steps.length}</Text><Text variant="unit" style={{ marginTop: space.xxs }}>{unit.title}</Text></View><MotifBox><MotifIcon theme={goal.theme_id} /></MotifBox></Card><RoadmapPath steps={[...unit.steps].sort((a, b) => a.idx - b.idx)} allSteps={progress.steps} theme={goal.theme_id} onStart={step => go(stepPath(goal.id, step.id))} /></View>)}
  </Screen><TabBar active="path" onChange={tab => replace(tab === 'path' ? '/' : `/${tab}`)} /></View>;
}
export default function RoadmapRoute() { const { appearance, id } = useLocalSearchParams<{ appearance?: string; id: string }>(); return __DEV__ && id === 'preview' && (appearance === 'dark' || appearance === 'light') ? <ThemeProvider forced={appearance}><Roadmap /></ThemeProvider> : <Roadmap />; }
