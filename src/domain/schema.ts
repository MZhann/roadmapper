import { z } from 'zod';
export const themeIds = ['languages_learning', 'sports_movement', 'money_business', 'art_creativity', 'technology', 'life_wellbeing', 'general_adventure'] as const;
export const themeSchema = z.enum(themeIds);
export type ThemeId = z.infer<typeof themeSchema>;
export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string().min(1).max(6000) }),
  z.object({ type: z.literal('phrase'), text: z.string().min(1).max(1000), romanization: z.string().max(1000), translation: z.string().max(1000), language: z.string().max(20) }),
  z.object({ type: z.literal('image'), url: z.string().regex(/^https:\/\/[^\s]+$/).max(2048), alt: z.string().min(1).max(500) }),
  z.object({ type: z.literal('tip'), text: z.string().min(1).max(3000) }),
  z.object({ type: z.literal('task'), text: z.string().min(1).max(3000) }),
  z.object({ type: z.literal('checklist'), items: z.array(z.string().min(1).max(500)).min(1).max(12) }),
  z.object({ type: z.literal('quiz'), question: z.string().min(1).max(1000), options: z.array(z.string().min(1).max(500)).min(2).max(6), answer: z.number().int().min(0).max(5), explanation: z.string().min(1).max(2000) }),
]);
export type ContentBlock = z.infer<typeof blockSchema>;
export const planStepSchema = z.object({ title: z.string().min(1).max(140), minutes: z.number().int().min(1).max(180), xp: z.number().int().min(5).max(100), day: z.number().int().min(1).max(366), content: z.array(blockSchema).min(1).max(16) });
export const planSchema = z.object({ title: z.string().min(1).max(140), summary: z.string().min(1).max(1000), theme_id: themeSchema, days: z.number().int().min(1).max(366), daily_minutes: z.number().int().min(5).max(180), units: z.array(z.object({ title: z.string().min(1).max(100), steps: z.array(planStepSchema).min(1).max(30) })).min(1).max(12) });
export type Plan = z.infer<typeof planSchema>;
export const questionSchema = z.object({ id: z.string().min(1).max(60), question: z.string().min(1).max(300), why: z.string().max(500), kind: z.enum(['choice', 'date', 'minutes', 'text']), options: z.array(z.object({ label: z.string().min(1).max(150), description: z.string().max(200), value: z.string().min(1).max(200) })).max(6) });
export const clarificationSchema = z.object({ title: z.string().min(1).max(140), theme_id: themeSchema, questions: z.array(questionSchema).max(5) });
export type Clarification = z.infer<typeof clarificationSchema>;
export const realitySchema = z.object({ unrealistic: z.boolean(), title: z.string().max(200), explanation: z.string().max(1000), requested_days: z.number().int().min(1).max(366), recommended_days: z.number().int().min(1).max(366), daily_minutes: z.number().int().min(5).max(180), achievable_scope: z.string().max(500) });
export type RealityCheck = z.infer<typeof realitySchema>;
export type Step = { id: string; unit_id: string; idx: number; title: string; minutes: number; xp: number; content: ContentBlock[]; status: 'pending' | 'done'; unlock_date: string | null; completed_at: string | null };
export type Unit = { id: string; goal_id: string; idx: number; title: string; steps: Step[] };
export type Goal = { id: string; user_id: string; title: string; prompt: string; summary: string; theme_id: ThemeId; deadline: string; daily_minutes: number; status: 'active' | 'completed' | 'archived'; created_at: string; units: Unit[] };
export type Profile = { id: string; name: string; daily_minutes: number; reminder_time: string | null; timezone: string; onboarding_complete: boolean; created_at: string };
export type Note = { id: string; step_id: string; user_id: string; text: string; photo_url: string | null; created_at: string; updated_at: string; steps: { title: string; idx: number; units: { goal_id: string; goals: { title: string } } } };
export function validatePlan(plan: unknown): Plan {
  const result = planSchema.parse(plan);
  const steps = result.units.flatMap(unit => unit.steps);
  if (steps.length > 120) throw new Error('The plan is too long. Please use at most 120 steps.');
  let previousDay = 0; let dailyMinutes = 0;
  for (const step of steps) {
    if (step.day < previousDay || step.day > result.days) throw new Error('The plan has an inconsistent schedule. Please regenerate it.');
    if (previousDay !== step.day) dailyMinutes = 0;
    dailyMinutes += step.minutes;
    if (dailyMinutes > result.daily_minutes) throw new Error('The plan exceeds your daily time budget. Please regenerate it.');
    previousDay = step.day;
    for (const block of step.content) if (block.type === 'quiz' && block.answer >= block.options.length) throw new Error('A quiz has an invalid answer. Please regenerate the plan.');
  }
  return result;
}
