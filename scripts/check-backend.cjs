try {
  process.loadEnvFile(".env.local");
} catch {}
(async () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("Supabase public configuration is missing.");
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
  });
  const settings = await response.json();
  console.log(
    JSON.stringify({
      reachable: response.ok,
      providers: {
        apple: settings.external?.apple,
        google: settings.external?.google,
        email: settings.external?.email,
      },
    }),
  );
  const tables = await fetch(`${url}/rest/v1/goals?select=id&limit=0`, {
    headers: { apikey: key },
  });
  console.log("Goals table API status:", tables.status);
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
