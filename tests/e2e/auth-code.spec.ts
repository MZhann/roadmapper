import { test, expect } from "@playwright/test";

test("email sign-in uses a code, preserves errors for retry, and establishes a session", async ({
  page,
}) => {
  const sent: Record<string, unknown>[] = [];
  const verified: Record<string, unknown>[] = [];
  await page.route("**/auth/v1/otp**", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ json: {} });
  });
  await page.route("**/auth/v1/verify**", async (route) => {
    const body = route.request().postDataJSON();
    verified.push(body);
    if (body.token !== "654321")
      return route.fulfill({
        status: 403,
        json: {
          error_code: "otp_expired",
          msg: "Token has expired or is invalid",
        },
      });
    await route.fulfill({
      json: {
        access_token: "test-only",
        refresh_token: "test-only",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "11111111-1111-4111-8111-111111111111",
          aud: "authenticated",
          email: body.email,
          app_metadata: {},
          user_metadata: {},
          created_at: "2026-10-01T00:00:00Z",
        },
      },
    });
  });
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({
      json: new URL(route.request().url()).pathname.endsWith("profiles")
        ? null
        : [],
    }),
  );
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill("Test@Example.com");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(
    page.getByText("Check your email", { exact: true }),
  ).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(sent[0].email).toBe("test@example.com");
  expect(sent[0]).not.toHaveProperty("redirect_to");
  await page.getByRole("button", { name: /Resend code in/ }).click();
  expect(sent).toHaveLength(1);
  const code = page.getByLabel("Sign-in code", { exact: true });
  await code.fill("123456");
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect(
    page.getByText(/That code is incorrect or expired/),
  ).toBeVisible();
  await expect(code).toHaveValue("123456");
  await code.fill("654 321");
  await expect(code).toHaveValue("654321");
  await page.screenshot({ path: ".artifacts/screens/auth-code.png" });
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect(page).toHaveURL(/\/intro$/);
  expect(verified[1]).toMatchObject({
    email: "test@example.com",
    token: "654321",
    type: "email",
  });
});
