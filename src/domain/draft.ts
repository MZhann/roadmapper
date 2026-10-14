import { z } from "zod";
import { clarificationSchema, planSchema, realitySchema } from "./schema";
export const questionAnswerSchema = z.object({
  selected: z.array(z.string().max(200)).max(6).default([]),
  custom: z.string().max(1000).default(""),
  customOpen: z.boolean().default(false),
  date: z.string().default(""),
});
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
export const emptyAnswer = (): QuestionAnswer => ({
  selected: [],
  custom: "",
  customOpen: false,
  date: "",
});
export function answerText(answer: QuestionAnswer) {
  return (
    answer.date ||
    [
      ...answer.selected,
      ...(answer.customOpen && answer.custom.trim()
        ? [answer.custom.trim()]
        : []),
    ].join("; ")
  );
}
export const draftSchema = z.object({
  id: z.uuid(),
  prompt: z.string().max(2000),
  minutes: z.number().int().min(5).max(180),
  days: z.number().int().min(1).max(366),
  answers: z.record(z.string(), z.string().max(3000)),
  questionAnswers: z.record(z.string(), questionAnswerSchema).default({}),
  questionIndex: z.number().int().min(0).max(5).default(0),
  targetDate: z.string().nullable().default(null),
  clarification: clarificationSchema.nullable(),
  reality: realitySchema.nullable(),
  plan: planSchema.nullable(),
  acceptStretch: z.boolean(),
  revision: z.number().int().min(0),
  history: z
    .array(
      z.object({
        request: z.string().max(1000),
        response: z.string().max(1000),
      }),
    )
    .max(10)
    .default([]),
});
export type Draft = z.infer<typeof draftSchema>;
