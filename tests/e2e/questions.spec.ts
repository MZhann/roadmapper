import { test, expect } from "@playwright/test";
import { addDays, dateValue } from "../../src/domain/dateTime";
const { mockSession, userId } = require("../../scripts/mock-session.cjs");
const { draft } = require("../../scripts/fixtures.cjs");

test("answers, multiple choices and calendar date survive back, close and reload", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const questions = [
    {
      id: "skills",
      kind: "choice",
      question: "What have you tried?",
      why: "Choose everything you know.",
      options: [
        {
          label: "Greetings",
          description: "Hello and goodbye",
          value: "greetings",
        },
        { label: "Numbers", description: "Counting", value: "numbers" },
      ],
    },
    {
      id: "old-time",
      kind: "minutes",
      question: "Old daily time question",
      why: "",
      options: [],
    },
    {
      id: "date",
      kind: "date",
      question: "Do you have a target date?",
      why: "It is optional.",
      options: [],
    },
    {
      id: "details",
      kind: "text",
      question: "Anything else?",
      why: "",
      options: [],
    },
  ];
  await mockSession(page, {
    draft: {
      ...draft,
      plan: null,
      reality: null,
      answers: {},
      clarification: { ...draft.clarification, questions },
    },
  });
  await page.goto("/goal/new/questions");
  await expect(page.getByText("1 of 3", { exact: true })).toBeVisible();
  const greetings = page.getByRole("checkbox", { name: /Greetings/ });
  const numbers = page.getByRole("checkbox", { name: /Numbers/ });
  await greetings.click();
  await numbers.click();
  await expect(greetings).toBeChecked();
  await expect(numbers).toBeChecked();
  await greetings.click();
  await expect(greetings).not.toBeChecked();
  await page.getByRole("button", { name: "Write my own answer" }).click();
  await page
    .getByLabel("Your answer", { exact: true })
    .fill("I also know kana");
  await page.screenshot({ path: ".artifacts/screens/questions-multi.png" });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const target = addDays(dateValue(new Date()), 14);
  const calendar = page.getByLabel("Target date (optional)", { exact: true });
  await expect(calendar).toHaveAttribute("type", "date");
  await calendar.fill(target);
  await page.screenshot({ path: ".artifacts/screens/questions-date.png" });
  await page.getByRole("button", { name: "Back to previous question" }).click();
  await expect(greetings).not.toBeChecked();
  await expect(numbers).toBeChecked();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "I also know kana",
  );
  await numbers.click();
  await page.getByRole("button", { name: "Hide my own answer" }).click();
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Write my own answer" }).click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "I also know kana",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(calendar).toHaveValue(target);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Your answer", { exact: true })
    .fill("Travel with my family");
  await page
    .getByRole("button", { name: "Save draft and close", exact: true })
    .click();
  await page.goto("/goal/new/questions");
  await expect(page.getByText("3 of 3", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "Travel with my family",
  );
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "Travel with my family",
  );
  const saved = await page.evaluate(
    (id) => JSON.parse(localStorage.getItem(`milo.draft.${id}`)!),
    userId,
  );
  expect(saved.questionAnswers.skills.selected).toEqual([]);
  expect(saved.targetDate).toBe(target);
  expect(saved.answers.skills).toBe("I also know kana");
});

test("quick onboarding offers a time picker and no daily time-budget input", async ({
  page,
}) => {
  await mockSession(page, { profile: { onboarding_complete: false } });
  await page.goto("/intro");
  await expect(
    page.getByText("Welcome to Milo", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByText("Welcome to Milo", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(
    page.getByText("Usual time per day", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("switch", { name: "Daily reminder", exact: true })
    .click();
  const time = page.getByLabel("Reminder time", { exact: true });
  await expect(time).toHaveAttribute("type", "time");
  await time.fill("08:35");
  await page
    .getByRole("switch", { name: "Daily reminder", exact: true })
    .click();
  await page
    .getByRole("switch", { name: "Daily reminder", exact: true })
    .click();
  await expect(time).toHaveValue("08:35");
  await page.screenshot({ path: ".artifacts/screens/personalize-time.png" });
});
