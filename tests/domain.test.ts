import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import {
  planSchema,
  validatePlan,
  type Goal,
  type Plan,
} from "../src/domain/schema";
import {
  localDate,
  progressOf,
  statsOf,
  stepState,
  stepsOf,
} from "../src/domain/progress";
import { draftSchema } from "../src/domain/draft";
import { structuredSchema } from "../supabase/functions/_shared/structured-schema";
import queryString from "query-string";

const step = {
  title: "Practice",
  minutes: 5,
  xp: 20,
  day: 1,
  content: [{ type: "task" as const, text: "Practice once." }],
};
const plan: Plan = {
  title: "A useful goal",
  summary: "A small first step.",
  theme_id: "general_adventure",
  days: 3,
  daily_minutes: 10,
  units: [{ title: "Begin", steps: [step, { ...step, day: 2 }] }],
};
const copy = () => structuredClone(plan);
test("validates an actionable plan", () =>
  assert.equal(validatePlan(plan).units[0].steps.length, 2));
test("accepts multiple steps beyond the legacy daily budget", () => {
  const p = copy();
  p.units.push({ title: "More", steps: [{ ...step, day: 2, minutes: 10 }] });
  assert.equal(validatePlan(p).units.length, 2);
});
test("rejects nonmonotonic and out-of-range schedules", () => {
  const p = copy();
  p.units[0].steps[0].day = 3;
  assert.throws(() => validatePlan(p), /inconsistent schedule/);
  p.units[0].steps[0].day = 1;
  p.units[0].steps[1].day = 4;
  assert.throws(() => validatePlan(p), /inconsistent schedule/);
});
test("rejects missing or empty units and lessons", () => {
  assert.throws(() => validatePlan({ ...plan, units: [] }));
  assert.throws(() => validatePlan({ ...plan, units: [{ title: "Empty" }] }));
  assert.throws(() =>
    validatePlan({
      ...plan,
      units: [{ title: "Empty", steps: [{ ...step, content: [] }] }],
    }),
  );
});
test("rejects quiz answers outside their choices", () => {
  const p = copy();
  p.units[0].steps[0].content = [
    {
      type: "quiz",
      question: "Which?",
      options: ["A", "B"],
      answer: 2,
      explanation: "A is correct.",
    },
  ];
  assert.throws(() => validatePlan(p), /invalid answer/);
});
test("requires secure image URLs and descriptive alt text", () => {
  const p = copy();
  p.units[0].steps[0].content = [
    { type: "image", url: "http://example.com/photo.png", alt: "Diagram" },
  ];
  assert.throws(() => validatePlan(p));
});
test("caps total plan size across units", () => {
  const p = copy();
  p.days = 180;
  p.units = Array.from({ length: 5 }, (_, u) => ({
    title: "Unit",
    steps: Array.from({ length: 25 }, (_, i) => ({
      ...step,
      day: u * 25 + i + 1,
    })),
  }));
  assert.throws(() => validatePlan(p), /at most 120/);
});
test("emits supported structured output unions without starts_with format", () => {
  const schema = JSON.stringify(structuredSchema(z.toJSONSchema(planSchema)));
  assert.ok(schema.includes("anyOf"));
  assert.ok(!schema.includes("oneOf"));
  assert.ok(!schema.includes("starts_with"));
});
function goal(): Goal {
  return {
    id: "goal",
    user_id: "owner",
    title: "Goal",
    prompt: "A useful goal",
    summary: "",
    theme_id: "technology",
    daily_minutes: 10,
    deadline: "2026-10-20",
    status: "active",
    created_at: "2026-10-01T00:00:00Z",
    units: [
      {
        id: "unit",
        goal_id: "goal",
        idx: 1,
        title: "Begin",
        steps: [0, 1, 2].map((i) => ({
          id: `step-${i}`,
          unit_id: "unit",
          idx: i + 1,
          ...step,
          content: step.content,
          status: i === 0 ? "done" : "pending",
          unlock_date: i === 2 ? "2026-10-16" : "2026-10-01",
          completed_at:
            i === 0 ? new Date(2026, 9, 13, 12).toISOString() : null,
        })),
      },
    ],
  };
}
test("unlocks the next unfinished step immediately, regardless of its old date", () => {
  const steps = stepsOf(goal());
  assert.deepEqual(
    steps.map((s) => stepState(s, steps)),
    ["done", "current", "locked"],
  );
  steps[1].unlock_date = "2026-10-15";
  assert.equal(stepState(steps[1], steps), "current");
  steps[1].status = "done";
  assert.equal(stepState(steps[2], steps), "current");
});
test("sorts database relations without mutating them", () => {
  const g = goal();
  g.units[0].steps.reverse();
  assert.equal(stepsOf(g)[0].idx, 1);
  assert.equal(g.units[0].steps[0].idx, 3);
  assert.equal(progressOf(g).ratio, 1 / 3);
});
test("calculates streak across local calendar and month boundaries", () => {
  const g = goal();
  g.units[0].steps.forEach((s, i) => {
    s.status = "done";
    s.completed_at = new Date(2026, 9, 1 - i, 23, 30).toISOString();
  });
  const stats = statsOf([g], new Date(2026, 9, 2, 8));
  assert.equal(stats.streak, 3);
  assert.equal(stats.xp, 60);
  assert.equal(stats.steps, 3);
  assert.equal(statsOf([g], new Date(2026, 9, 3, 8)).streak, 0);
});
test("weekly minutes group completed work by local Monday through Sunday", () => {
  const stats = statsOf([goal()], new Date(2026, 9, 14, 12));
  assert.equal(stats.week[0].date, "2026-10-12");
  assert.equal(stats.week[1].minutes, 5);
  assert.equal(
    stats.week.reduce((n, d) => n + d.minutes, 0),
    5,
  );
  assert.equal(localDate(new Date(2026, 0, 2, 0, 1)), "2026-01-02");
});
test("restores older drafts with an empty revision history", () => {
  const restored = draftSchema.parse({
    id: "22222222-2222-4222-8222-222222222222",
    prompt: "A useful goal",
    minutes: 10,
    days: 3,
    answers: {},
    clarification: null,
    reality: null,
    plan: null,
    acceptStretch: false,
    revision: 0,
  });
  assert.deepEqual(restored.history, []);
});
test("patched URL decoding supports normal links and malformed input", () => {
  assert.equal(queryString.parse("name=Hello%20world").name, "Hello world");
  assert.equal(typeof queryString.parse("name=%E0%A4%A").name, "string");
  assert.doesNotThrow(() => queryString.parse("name=" + "%E0%A4".repeat(500)));
});
