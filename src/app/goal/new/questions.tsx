import { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { IconButton, PrimaryButton, TextButton } from '@/components/Buttons';
import { ProgressBar } from '@/components/ProgressBar';
import { OptionCard } from '@/components/OptionCard';
import { Card, Input, InlineError, StateView, layout } from '@/components/Primitives';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icon';
import { useDraft } from '@/providers/DraftProvider';
import { assess, clarify } from '@/lib/planner';
import { errorMessage } from '@/lib/supabase';
import { go } from '@/lib/navigation';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';
export default function Questions() {
 const { draft, save } = useDraft(); const { colors } = useTheme(); const [index, setIndex] = useState(0); const [value, setValue] = useState(''); const [custom, setCustom] = useState(false);
 const clarification = useQuery({ queryKey: ['clarify', draft!.id], queryFn: () => clarify(draft!), initialData: draft!.clarification ?? undefined, staleTime: Infinity, retry: false });
 const questions = clarification.data?.questions ?? []; const question = questions[index]; const selected = value || (question && draft?.answers[question.id]) || '';
 const next = useMutation({ mutationFn: async (skip: boolean) => {
  const answer = skip ? 'Choose a sensible default for me.' : selected.trim();
  let updated = { ...draft!, clarification: clarification.data!, answers: question ? { ...draft!.answers, [question.id]: answer } : draft!.answers };
  if (question?.kind === 'date' && !skip) { const number = Number(answer); if (Number.isInteger(number) && number >= 1 && number <= 366) updated = { ...updated, days: number }; else { const date = new Date(`${answer}T12:00:00`); const today = new Date(); today.setHours(12,0,0,0); const days = Math.round((date.getTime()-today.getTime())/86400000)+1; if (!/^\d{4}-\d{2}-\d{2}$/.test(answer) || !Number.isFinite(days) || days < 1 || days > 366) throw new Error('Choose a date within the next year (YYYY-MM-DD).'); updated = { ...updated, days }; } }
  if (question?.kind === 'minutes' && !skip) { const minutes = Number(answer); if (!Number.isInteger(minutes) || minutes < 5 || minutes > 180) throw new Error('Choose between 5 and 180 minutes.'); updated = { ...updated, minutes }; }
  await save(updated);
  if (index < questions.length-1) { setIndex(index+1); setValue(''); setCustom(false); return; }
  const reality = await assess(updated); await save({ ...updated, reality, days: reality.requested_days, minutes: reality.daily_minutes });
  go(reality.unrealistic ? '/goal/new/reality-check' : '/goal/new/generating');
 } });
 if (clarification.isPending) return <Screen><StateView kind="loading" title="Getting to know your goal" message="Milo is finding the few details that will shape your plan." /></Screen>;
 if (clarification.isError) return <Screen><StateView kind="error" title="Couldn’t prepare your questions" message={errorMessage(clarification.error)} action="Try again" onAction={() => void clarification.refetch()} /><TextButton label="Back to your goal" onPress={() => go('/')} /></Screen>;
 return <Screen footer={<><InlineError message={next.error ? errorMessage(next.error) : null} /><PrimaryButton label={index < questions.length-1 ? 'Continue' : 'Build my plan'} loading={next.isPending} disabled={!!question && !selected.trim()} onPress={() => next.mutate(false)} /><TextButton label={index ? 'Back to previous question' : 'Not sure — you decide'} muted onPress={() => { if (next.isPending) return; if (index) { setIndex(index-1); setValue(''); } else next.mutate(true); }} />{index > 0 && <TextButton label="Not sure — you decide" muted onPress={() => { if (!next.isPending) next.mutate(true); }} />}</>}>
  <View style={[layout.row, { marginLeft: -space.m }]}><IconButton name="close" label="Save draft and close" onPress={() => go('/')} /><View style={layout.flex}><ProgressBar value={questions.length ? (index+1)/questions.length : 1} height={10} /></View><Text variant="caption" muted>{questions.length ? `${index+1} of ${questions.length}` : 'Ready'}</Text></View>
  <Card style={[layout.row, { marginTop: space.page, paddingHorizontal: space.md, paddingVertical: space.m, borderRadius: radius.control, gap: space.m }]}><Icon name="path" size={18} color={colors.accent} /><Text variant="caption" muted style={layout.flex}>{clarification.data.title}</Text></Card>
  <View style={[layout.row, { marginTop: space.section, alignItems: 'flex-start', gap: space.m }]}><Logo wordmark={false} size={36} /><View style={layout.flex}><Text variant="heading" style={{ marginBottom: space.sm }}>{question?.question ?? 'Your goal is clear.'}</Text><Text variant="bodySmall" muted>{question?.why ?? 'We have enough detail to map your path. Review the plan before you start.'}</Text></View></View>
  {question && <View style={{ gap: space.m, marginTop: space.page }}>{question.options.map(option => <OptionCard key={option.value} title={option.label} description={option.description} selected={selected===option.value} onPress={() => { setValue(option.value); setCustom(false); }} />)}{custom || !question.options.length ? <Input accessibilityLabel="Your answer" placeholder={question.kind==='date' ? 'Date: YYYY-MM-DD' : question.kind==='minutes' ? 'Minutes per day' : 'Your answer'} value={value} onChangeText={setValue} multiline={question.kind==='text'} maxLength={1000} keyboardType={question.kind==='minutes' ? 'number-pad' : 'default'} /> : <TextButton label={question.kind==='date' ? 'Choose another date' : 'Write my own answer'} muted onPress={() => { setValue(''); setCustom(true); }} />}</View>}
 </Screen>;
}
