import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: process.env.MILO_TEST_URL || "http://localhost:8081",
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.MILO_TEST_URL
    ? undefined
    : {
        command: "npx expo start --web --port 8081",
        url: "http://localhost:8081",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          CI: "1",
          EXPO_PUBLIC_SUPABASE_URL:
            process.env.EXPO_PUBLIC_SUPABASE_URL ||
            "https://milo-tests.supabase.co",
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
            process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
            "sb_publishable_mock_for_tests_only",
        },
      },
});
