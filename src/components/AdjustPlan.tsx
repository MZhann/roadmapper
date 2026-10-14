import { useState } from 'react';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import { Card,Input,InlineError } from './Primitives';
import { Text } from './Text';
import { PrimaryButton } from './Buttons';
import { Sheet } from './Sheet';
import { PlanUnits } from './PlanUnits';
import { adjustGoal } from '@/lib/planner';
import { db,errorMessage } from '@/lib/supabase';
import { radius,space } from '@/theme/tokens';
export function AdjustPlan({goalId,disabled=false}:{goalId:string;disabled?:boolean}) {
 const [request,setRequest]=useState('');const [review,setReview]=useState(false);const queries=useQueryClient();
 const generate=useMutation({mutationFn:()=>adjustGoal(goalId,request),onSuccess:()=>setReview(true)});
 const apply=useMutation({mutationFn:async()=>{const result=generate.data!;const {error}=await db().rpc('milo_adjust_goal',{p_goal:goalId,p_plan:result.plan,p_revision:result.revision,p_completed:result.completed_ids,p_start:result.start});if(error)throw error;await Promise.all([queries.invalidateQueries({queryKey:['goal',goalId]}),queries.invalidateQueries({queryKey:['goals']})]);setReview(false);setRequest('');generate.reset();}});
 return <><Card style={{padding:space.xxl,borderRadius:radius.hero,gap:space.md}}><Text variant="card">Adjust this plan</Text><Text variant="small" muted>Tell the AI what to change — it updates only the steps ahead.</Text><Input accessibilityLabel="Adjust this plan" placeholder="e.g. I’m busy this weekend, lighten it" value={request} onChangeText={setRequest} multiline maxLength={1000}/><PrimaryButton compact label="Preview changes" disabled={disabled||request.trim().length<3} loading={generate.isPending} onPress={()=>{apply.reset();generate.mutate();}}/><InlineError message={generate.error?errorMessage(generate.error):null}/></Card><Sheet visible={review} title="Review your new steps" onClose={()=>{if(!apply.isPending)setReview(false);}} footer={<><InlineError message={apply.error?errorMessage(apply.error):null}/><PrimaryButton label="Apply changes" loading={apply.isPending} onPress={()=>apply.mutate()}/></>}>{generate.data&&<><Text style={{marginBottom:space.lg}}>{generate.data.plan.summary}</Text><Text variant="caption" muted style={{marginBottom:space.lg}}>{generate.data.plan.days} days · {generate.data.plan.daily_minutes} minutes per day. Completed steps, XP and notes stay saved.</Text><PlanUnits plan={generate.data.plan}/></>}</Sheet></>;
}
