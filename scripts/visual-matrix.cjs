// Production screenshot and overflow checks for all seven categories.
const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs");
const { mockSession } = require("./mock-session.cjs");
const { goal } = require("./fixtures.cjs");
const themes = [
  "languages_learning",
  "sports_movement",
  "money_business",
  "art_creativity",
  "technology",
  "life_wellbeing",
  "general_adventure",
];
(async () => {
  fs.mkdirSync(".artifacts/matrix", { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const theme of themes)
      for (const appearance of ["light", "dark"]) {
        const page = await browser.newPage({
          viewport: { width: 390, height: 844 },
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await mockSession(page, { goals: [{ ...goal, theme_id: theme }] });
        await page.addInitScript(
          (mode) => localStorage.setItem("milo.appearance", mode),
          appearance,
        );
        await page.goto(`http://127.0.0.1:8082/goal/${goal.id}`);
        await expect(page.getByText(goal.title, { exact: true })).toBeVisible();
        if (
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          )
        )
          throw Error(`Overflow: ${theme}/${appearance}`);
        if (errors.length) throw Error(errors.join("\n"));
        await page.screenshot({
          path: `.artifacts/matrix/${theme}-${appearance}.png`,
        });
        await page.close();
      }
    const page = await browser.newPage({
      viewport: { width: 320, height: 812 },
      reducedMotion: "reduce",
    });
    const long = structuredClone(goal);
    long.title =
      "Build a consistent daily practice with small, achievable steps and enough room for everything else in life";
    long.units[0].steps[2].title =
      "Practice the complete sequence slowly and explain each part in your own words before moving forward";
    await mockSession(page, { goals: [long] });
    await page.goto(`http://127.0.0.1:8082/goal/${goal.id}`);
    await expect(page.getByText(long.title, { exact: true })).toBeVisible();
    await page.addStyleTag({
      content:
        '[dir="auto"] { font-size: 150% !important; line-height: 1.5 !important; }',
    });
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      throw Error("Narrow large-text overflow");
    await page.screenshot({
      path: ".artifacts/matrix/narrow-long-text.png",
      fullPage: true,
    });
    await page.close();
    console.log(
      "14 light/dark category captures and narrow large-text layout passed without page errors or horizontal overflow.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
