import type { Goal, Step } from "./schema";
export function stepsOf(goal: Goal): Step[] {
  return [...goal.units]
    .sort((a, b) => a.idx - b.idx)
    .flatMap((unit) => [...unit.steps].sort((a, b) => a.idx - b.idx));
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function stepState(
  step: Step,
  steps: Step[],
  today = localDate(),
): "done" | "current" | "locked" {
  if (step.status === "done") return "done";
  if (step.unlock_date && step.unlock_date > today) return "locked";
  return steps.find((s) => s.status !== "done")?.id === step.id
    ? "current"
    : "locked";
}
export function progressOf(goal: Goal) {
  const steps = stepsOf(goal);
  const done = steps.filter((step) => step.status === "done").length;
  return {
    steps,
    done,
    total: steps.length,
    ratio: steps.length ? done / steps.length : 0,
    current: steps.find((step) => stepState(step, steps) === "current"),
    next: steps.find((step) => step.status !== "done"),
  };
}
export function statsOf(goals: Goal[], now = new Date()) {
  const completed = goals
    .flatMap(stepsOf)
    .filter((s) => s.status === "done" && s.completed_at);
  const dates = new Set(
    completed.map((s) => localDate(new Date(s.completed_at!))),
  );
  const cursor = new Date(now);
  if (!dates.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(localDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() - ((day.getDay() + 6) % 7) + i);
    return {
      date: localDate(day),
      label: ["M", "T", "W", "T", "F", "S", "S"][i],
      minutes: completed
        .filter((s) => localDate(new Date(s.completed_at!)) === localDate(day))
        .reduce((sum, s) => sum + s.minutes, 0),
    };
  });
  return {
    streak,
    xp: completed.reduce((sum, s) => sum + s.xp, 0),
    steps: completed.length,
    achieved: goals.filter((g) => g.status === "completed").length,
    week,
  };
}
export function deadlineLabel(deadline: string) {
  const days = Math.round(
    (new Date(`${deadline}T00:00:00`).getTime() -
      new Date(`${localDate()}T00:00:00`).getTime()) /
      86400000,
  );
  return days < 0
    ? `${Math.abs(days)} days past target`
    : days === 0
      ? "Target: today"
      : `${days} days left`;
}
