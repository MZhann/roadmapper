import { useState } from 'react';
import { View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { help } from '@/lib/planner';
import { errorMessage } from '@/lib/supabase';
import { Text } from './Text';
import { Card, Input, InlineError } from './Primitives';
import { PrimaryButton, TextButton } from './Buttons';
import { space } from '@/theme/tokens';
export function HelpPanel({stepId,onClose}:{stepId:string;onClose:()=>void}) { const [question,setQuestion]=useState('');const answer=useMutation({mutationFn:()=>help(stepId,question)});return <Card style={{gap:space.md}}><Text variant="heading">A little help</Text><Text variant="bodySmall" muted>Ask Milo to explain an idea or give you another example.</Text><Input accessibilityLabel="Question about this lesson" multiline placeholder="What would you like help with?" value={question} onChangeText={setQuestion} maxLength={1000}/><InlineError message={answer.error?errorMessage(answer.error):null}/><PrimaryButton label="Ask Milo" compact disabled={!question.trim()} loading={answer.isPending} onPress={()=>answer.mutate()}/>{answer.data&&<View accessibilityLiveRegion="polite"><Text selectable>{answer.data}</Text></View>}<TextButton label="Back to lesson" onPress={onClose}/></Card>; }
