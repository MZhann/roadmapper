import { z } from 'zod';
import { db } from './supabase';
import { clarificationSchema, realitySchema, validatePlan } from '@/domain/schema';
import type { Draft } from '@/domain/draft';
export async function callPlanner(action: string, body: Record<string, unknown>) {
 const { data, error } = await db().functions.invoke('milo-planner', { body: { action, ...body } });
 if (error) {
  const response = 'context' in error ? error.context : undefined;
  if (response instanceof Response) { const payload = await response.json().catch(() => null); if (payload?.error) throw new Error(payload.error); }
  throw new Error('Could not reach the planner. Check your connection and try again.');
 }
 if (data?.error) throw new Error(data.error);
 return data;
}
export async function clarify(draft: Draft) { return clarificationSchema.parse(await callPlanner('clarify', { draft })); }
export async function assess(draft: Draft) { return realitySchema.parse(await callPlanner('assess', { draft })); }
export async function plan(draft: Draft, adjustment?: string) { return validatePlan(await callPlanner(adjustment ? 'revise' : 'plan', { draft, adjustment })); }
export async function help(stepId: string, question: string) { return z.object({ answer: z.string().min(1) }).parse(await callPlanner('help', { stepId, question })).answer; }
