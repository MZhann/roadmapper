import { test, expect } from "@playwright/test";
const { mockSession } = require("../../scripts/mock-session.cjs");
test("profile reminder uses a time picker and retains its value when toggled", async ({
  page,
}) => {
  await mockSession(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: /^Daily reminder / }).click();
  const time = page.getByLabel("Reminder time", { exact: true });
  await expect(time).toHaveAttribute("type", "time");
  await expect(time).toHaveValue("19:00");
  await time.fill("21:45");
  const toggle = page.getByRole("switch", {
    name: "Enable daily reminder",
    exact: true,
  });
  await toggle.click();
  await expect(time).toBeDisabled();
  await toggle.click();
  await expect(time).toHaveValue("21:45");
  await page.screenshot({ path: ".artifacts/screens/profile-reminder.png" });
  await page
    .getByRole("button", { name: "Close Daily reminder", exact: true })
    .click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Daily minutes", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
});
