import { z } from 'zod';
import { clarificationSchema, planSchema, realitySchema } from './schema';
export const draftSchema = z.object({ id: z.uuid(), prompt: z.string().max(2000), minutes: z.number().int().min(5).max(180), days: z.number().int().min(1).max(366), answers: z.record(z.string(), z.string().max(1000)), clarification: clarificationSchema.nullable(), reality: realitySchema.nullable(), plan: planSchema.nullable(), acceptStretch: z.boolean(), revision: z.number().int().min(0) });
export type Draft = z.infer<typeof draftSchema>;
