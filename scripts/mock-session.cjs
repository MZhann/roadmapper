// Browser-only fixtures for visual checks; never included in the application.
const userId = "11111111-1111-4111-8111-111111111111";
async function mockSession(
  page,
  { goals = [], notes = [], draft = null, profile = {} } = {},
) {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL || "https://milo-tests.supabase.co";
  const ref = new URL(url).hostname.split(".")[0];
  await page.addInitScript(
    ({ ref, userId, draft }) => {
      const user = {
        id: userId,
        email: "visual-check@example.test",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: "2026-10-01T00:00:00Z",
      };
      localStorage.setItem(
        `sb-${ref}-auth-token`,
        JSON.stringify({
          access_token: "visual-check-only",
          refresh_token: "visual-check-only",
          expires_at: Math.floor(Date.now() / 1000) + 86400,
          expires_in: 86400,
          token_type: "bearer",
          user,
        }),
      );
      if (draft && !localStorage.getItem(`milo.draft.${userId}`))
        localStorage.setItem(`milo.draft.${userId}`, JSON.stringify(draft));
    },
    { ref, userId, draft },
  );
  await page.route(`${url}/rest/v1/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/profiles")
      ? {
          id: userId,
          name: "Mukan",
          daily_minutes: 15,
          reminder_time: "19:00",
          timezone: "UTC",
          onboarding_complete: true,
          created_at: "2026-10-01T00:00:00Z",
          ...profile,
        }
      : path.endsWith("/goals")
        ? new URL(route.request().url()).searchParams.has("id")
          ? (goals[0] ?? null)
          : goals
        : notes;
    await route.fulfill({ json: data });
  });
}
module.exports = { mockSession, userId };
