import { test, expect } from "@playwright/test";
const { mockSession } = require("../../scripts/mock-session.cjs");
const { goal } = require("../../scripts/fixtures.cjs");

test("pronunciation selects Japanese, shows playback, stops and reports a playback failure", async ({
  page,
}) => {
  const sample = structuredClone(goal);
  sample.units[0].steps[2].content = [
    {
      type: "phrase",
      text: "こんにちは",
      romanization: "Konnichiwa",
      translation: "Hello",
      language: "Japanese",
    },
  ];
  await mockSession(page, { goals: [sample] });
  await page.addInitScript(() => {
    const state = {
      spoken: [] as {
        text: string;
        language: string;
        voice: string | undefined;
      }[],
      cancel: 0,
      fail: false,
    };
    Object.defineProperty(window, "__speechTest", { value: state });
    class Utterance {
      text = "";
      lang = "";
      voice: { voiceURI: string } | null = null;
      onstart: (() => void) | null = null;
      onerror: (() => void) | null = null;
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: Utterance,
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        getVoices: () => [
          {
            lang: "en-US",
            voiceURI: "English",
            name: "English",
            default: true,
            localService: true,
          },
          {
            lang: "ja-JP",
            voiceURI: "Japanese",
            name: "Japanese",
            default: false,
            localService: true,
          },
        ],
        speak: (message: Utterance) => {
          state.spoken.push({
            text: message.text,
            language: message.lang,
            voice: message.voice?.voiceURI,
          });
          if (state.fail) message.onerror?.();
          else message.onstart?.();
        },
        cancel: () => {
          state.cancel++;
        },
      },
    });
  });
  await page.goto(`/goal/${goal.id}/step/step-0-2`);
  const play = page.getByRole("button", {
    name: "Play pronunciation: Konnichiwa",
    exact: true,
  });
  await play.click();
  await expect(
    page.getByText("Playing pronunciation", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __speechTest: { spoken: unknown[] } })
          .__speechTest.spoken[0],
    ),
  ).toEqual({ text: "こんにちは", language: "ja-JP", voice: "Japanese" });
  await page.screenshot({ path: ".artifacts/screens/lesson-playing.png" });
  await page
    .getByRole("button", {
      name: "Stop pronunciation: Konnichiwa",
      exact: true,
    })
    .click();
  await expect(play).toBeVisible();
  await page.evaluate(() => {
    (
      window as unknown as { __speechTest: { fail: boolean } }
    ).__speechTest.fail = true;
  });
  await play.click();
  await expect(page.getByText(/Couldn’t play pronunciation/)).toBeVisible();
  await expect(play).toBeVisible();
});
