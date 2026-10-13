import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { HomeEmpty } from '@/components/HomeEmpty';
import { useAuth } from '@/providers/AuthProvider';
import { useGoals, useProfile } from '@/data/queries';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { ProgressRing } from '@/components/ProgressBar';
import { Card, Pill, StateView, layout } from '@/components/Primitives';
import { IconButton, TextButton } from '@/components/Buttons';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, size, space } from '@/theme/tokens';
import { deadlineLabel, progressOf, statsOf } from '@/domain/progress';
import { go, goalPath, stepPath } from '@/lib/navigation';
import { errorMessage } from '@/lib/supabase';
import { useDraft } from '@/providers/DraftProvider';
export default function Home() {
 const { session } = useAuth(); const profile = useProfile(session?.user.id); const goals=useGoals(); const [creating,setCreating]=useState(false); const {colors}=useTheme(); const draft=useDraft();
 if(goals.isPending) return <Screen><StateView kind="loading" title="Loading your goals…"/></Screen>;
 if(goals.isError) return <Screen><StateView kind="error" title="Couldn’t load your goals" message={errorMessage(goals.error)} action="Retry" onAction={()=>void goals.refetch()}/></Screen>;
 if(!goals.data.length||creating) return <Screen>{creating&&<IconButton name="back" label="Back to goals" onPress={()=>setCreating(false)}/>}<HomeEmpty name={profile.data?.name??'friend'} minutes={profile.data?.daily_minutes}/></Screen>;
 const stats=statsOf(goals.data); const active=goals.data.filter(g=>g.status==='active'); const completed=goals.data.filter(g=>g.status==='completed'); const today=active.map(goal=>({goal,...progressOf(goal)})).find(g=>g.current);
 return <Screen style={{paddingHorizontal:space.xxl}}>
  <View style={[layout.between,{flexWrap:'wrap'}]}><Text variant="titleSmall">Your goals</Text><View style={{flexDirection:'row',gap:space.s}}><Pill value={stats.streak}/><Pill kind="xp" value={stats.xp}/></View></View>
  {today?.current?<Pressable accessibilityRole="button" accessibilityLabel={`Start ${today.current.title}`} onPress={()=>go(stepPath(today.goal.id,today.current!.id))} style={{marginTop:space.xxl,gap:space.ml,padding:space.xl,borderRadius:radius.hero,backgroundColor:colors.accent,boxShadow:`0 5px 0 ${colors.accentDeep}`}}><View style={layout.between}><Text variant="eyebrow" style={{color:colors.onAccent,opacity:0.85,flex:1}}>TODAY · STEP {today.done+1} OF {today.total}</Text><Text variant="small" style={{color:colors.onAccent,opacity:0.85}}>{today.current.minutes} min</Text></View><Text variant="subheading" style={{color:colors.onAccent}}>{today.current.title}</Text><View style={layout.between}><Text variant="caption" style={{color:colors.onAccent,opacity:0.85,flex:1}}>{today.goal.title}</Text><View style={{minHeight:size.touch,paddingHorizontal:space.lg,borderRadius:radius.small,backgroundColor:colors.surface,justifyContent:'center'}}><Text variant="bodySmall" style={{fontFamily:fonts.black,color:colors.accent}}>Start</Text></View></View></Pressable>:<Card style={{marginTop:space.xxl,gap:space.s}}><Text variant="card">{active.length?'You’re set for today':'Look how far you’ve come'}</Text><Text variant="bodySmall" muted>{active.length?'Your next steps unlock on their scheduled dates. You can revisit any completed lesson.':'Your goals are complete. A new path is waiting whenever you are ready.'}</Text></Card>}
  {[[active,'IN PROGRESS'],[completed,'COMPLETED']].map(([items,title])=>{const list=items as typeof active;return list.length>0&&<View key={title as string}><Text variant="eyebrow" muted style={{marginTop:space.section,marginBottom:space.md}}>{title as string}</Text><View style={{gap:space.m}}>{list.map(goal=>{const p=progressOf(goal);return <Pressable key={goal.id} accessibilityRole="button" accessibilityLabel={`Open ${goal.title}`} onPress={()=>go(goalPath(goal.id))} style={[layout.row,{gap:space.ml,padding:space.ml,borderRadius:radius.card,borderWidth:1,borderColor:colors.line,backgroundColor:colors.surface}]}><ProgressRing value={p.ratio}/><View style={layout.flex}><Text variant="card">{goal.title}</Text><Text variant="small" muted style={{marginTop:space.xxs}}>{p.done} of {p.total} steps · {goal.status==='completed'?'Achieved':deadlineLabel(goal.deadline)}</Text></View><Icon name="next" size={18} color={colors.lockedIcon}/></Pressable>;})}</View></View>;})}
  <Pressable accessibilityRole="button" onPress={()=>setCreating(true)} style={[layout.row,{justifyContent:'center',minHeight:size.secondary,marginTop:space.md,borderRadius:radius.button,borderWidth:2,borderStyle:'dashed',borderColor:colors.pathDash}]}><Icon name="plus" size={18}/><Text variant="bodySmall" style={{fontFamily:fonts.extraBold}}>New goal</Text></Pressable>
  {draft.draft&&<TextButton label="Continue saved draft" onPress={()=>go(draft.draft?.plan?'/goal/new/review':'/goal/new/questions')}/>}<TextButton label={goals.isFetching?'Refreshing…':'Refresh goals'} muted onPress={()=>void goals.refetch()}/>
 </Screen>;
}
