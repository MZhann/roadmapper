import { test, expect } from "@playwright/test";
// Fixture helpers are deliberately excluded from the app bundle.
const { mockSession } = require("../../scripts/mock-session.cjs");
const { goal, draft, notes } = require("../../scripts/fixtures.cjs");

test("signed-out visitors can open the sign-in flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Any goal. One clear path.")).toBeVisible();
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continue with Apple", exact: true }),
  ).toBeVisible();
});
test("saved draft restores and a failed revision preserves the plan", async ({
  page,
}) => {
  await mockSession(page, { draft });
  await page.route("**/functions/v1/milo-planner", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Planner is temporarily unavailable. Please retry." },
    }),
  );
  await page.goto("/goal/new/review");
  await expect(page.getByText(draft.plan.title, { exact: true })).toBeVisible();
  await page
    .getByLabel("Ask for a change", { exact: true })
    .fill("Make the start easier");
  await page
    .getByRole("button", { name: "Send change request", exact: true })
    .click();
  await expect(
    page.getByText("Planner is temporarily unavailable. Please retry.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(draft.plan.title, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(draft.plan.title, { exact: true })).toBeVisible();
});
test("roadmap starts the current lesson and requires practice before completing", async ({
  page,
}) => {
  await mockSession(page, { goals: [goal], notes });
  await page.goto(`/goal/${goal.id}`);
  await page.getByRole("button", { name: /^Step 3:/ }).click();
  await page.getByRole("button", { name: /^Start.*XP$/ }).click();
  const complete = page.getByRole("button", {
    name: "I did it — complete step",
    exact: true,
  });
  await expect(complete).toBeDisabled();
  await page.getByRole("checkbox").click();
  await expect(complete).toBeEnabled();
  await page
    .getByLabel("Note for your story", { exact: true })
    .fill("I practiced the phrases.");
  await page.reload();
  await expect(
    page.getByLabel("Note for your story", { exact: true }),
  ).toHaveValue("I practiced the phrases.");
  await expect(complete).toBeEnabled();
});
test("locked steps cannot be completed through a direct route", async ({
  page,
}) => {
  await mockSession(page, { goals: [goal] });
  await page.goto(`/goal/${goal.id}/step/step-0-3`);
  await expect(
    page.getByRole("button", { name: "I did it — complete step", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("One step at a time", { exact: true }),
  ).toBeVisible();
});
test("profile appearance survives reload", async ({ page }) => {
  await mockSession(page, { goals: [goal], notes });
  await page.goto("/profile");
  await page
    .getByRole("button", { name: "Appearance System", exact: true })
    .click();
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await page
    .getByRole("button", { name: "Close Appearance", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Appearance Dark", exact: true }),
  ).toBeVisible();
});
test("journal renders saved notes and its designed Storia placeholder", async ({
  page,
}) => {
  await mockSession(page, { goals: [goal], notes });
  await page.goto("/journal");
  await expect(page.getByText(notes[0].text, { exact: true })).toBeVisible();
  await expect(page.getByText("SOON", { exact: true })).toBeVisible();
});
test("desktop plan review and roadmap fit without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 960 });
  await mockSession(page, { goals: [goal], notes, draft });
  for (const path of ["/goal/new/review", `/goal/${goal.id}`]) {
    await page.goto(path);
    await expect(
      page.getByText(goal.title, { exact: true }).first(),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("a failed goal fetch offers a retry", async ({ page }) => {
  await mockSession(page);
  await page.route("**/rest/v1/goals?**", (route) =>
    route.fulfill({ status: 400, json: { message: "Could not load goals" } }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Retry", exact: true }),
  ).toBeVisible();
});
