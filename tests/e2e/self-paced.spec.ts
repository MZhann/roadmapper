import { test, expect } from "@playwright/test";
const { mockSession } = require("../../scripts/mock-session.cjs");
const { goal } = require("../../scripts/fixtures.cjs");

test("completing a step immediately opens the next future-dated step", async ({
  page,
}) => {
  const sample = structuredClone(goal);
  const steps = sample.units.flatMap(
    (unit: {
      steps: {
        id: string;
        status: string;
        completed_at: string | null;
        unlock_date: string;
        content: unknown[];
      }[];
    }) => unit.steps,
  );
  steps
    .filter((s: { status: string }) => s.status !== "done")
    .forEach((s: { unlock_date: string; content: unknown[] }) => {
      s.unlock_date = "2099-01-01";
      s.content = [{ type: "task", text: "Practice this step" }];
    });
  await mockSession(page, { goals: [sample] });
  let completions = 0;
  await page.route("**/rest/v1/rpc/milo_complete_step", async (route) => {
    const next = steps.find((s: { status: string }) => s.status !== "done");
    expect(route.request().postDataJSON().p_step).toBe(next.id);
    next.status = "done";
    next.completed_at = new Date().toISOString();
    completions++;
    await route.fulfill({ json: { xp: 20, already_completed: false } });
  });
  await page.goto(`/goal/${goal.id}/step/step-0-2`);
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole("checkbox", { name: "Practice this step", exact: true })
      .click();
    await page
      .getByRole("button", { name: "I did it — complete step", exact: true })
      .click();
    await expect(
      page.getByText("Ready now · Keep going whenever you like", {
        exact: true,
      }),
    ).toBeVisible();
    if (i === 0)
      await page.screenshot({
        path: ".artifacts/screens/step-complete-ready.png",
      });
    await page
      .getByRole("button", { name: "Continue learning", exact: true })
      .click();
    await expect(
      page.getByRole("checkbox", { name: "Practice this step", exact: true }),
    ).toBeVisible();
  }
  expect(completions).toBe(2);
  await expect(page).toHaveURL(new RegExp(`/step/${steps[4].id}$`));
});
