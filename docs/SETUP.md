# Accounts, environment and deployment

## App environment

Copy `.env.example` to `.env.local` in the repository root:

| Variable | Where to get it |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL, currently `https://lvtynjnpvnpqsrjvgwhl.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project Connect dialog / API keys |
| `EXPO_PUBLIC_TERMS_URL` | Your published HTTPS terms page |
| `EXPO_PUBLIC_PRIVACY_URL` | Your published HTTPS privacy page |

Only the first two are required for development. Restart Metro after changing environment values. Add these public values to the matching EAS environment for cloud builds; ignored `.env.local` files are not uploaded automatically. See [Expo environment variables](https://docs.expo.dev/eas/environment-variables/).

## Server secrets

`OPENAI_API_KEY` is already configured in the connected project's Edge Function secrets and was verified with real requests. `OPENAI_MODEL` defaults to `gpt-5.4-mini`. `ALLOWED_ORIGINS` defaults to `http://localhost:8081`; add the exact HTTPS web origin when hosting the web app. Native requests do not require a browser origin.

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are supplied by the hosted Edge Function runtime. The service-role key is used only by account deletion on the server. Never add it, an OAuth secret, an Apple `.p8`, or an OpenAI key to an `EXPO_PUBLIC_*` variable.

For a new project, use the Supabase CLI after authenticating and linking the intended project:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
# Create supabase/.env.local from supabase/.env.example and fill server values.
npx supabase secrets set --env-file supabase/.env.local
npx supabase functions deploy milo-planner
npx supabase functions deploy milo-account
```

The current project was migrated through the authorized Supabase MCP. All eight local migration versions and SQL were reconciled with its remote history, including the original prototype migrations. Run `supabase migration list` before applying future changes; do not replay already applied migrations or reset the database. Older prototype functions and payload data were preserved.

The two new functions have gateway JWT verification disabled because they validate the bearer token with Supabase Auth themselves, before accessing AI or data. Do not remove this validation. AI responses undergo JSON-schema and schedule validation; usage is capped at 40 requests per user per UTC day.

## Apple and Google sign-in

Both provider buttons and callbacks are implemented. Both providers were **disabled in Supabase** during verification. The Supabase MCP connection can manage tables/functions but does not supply Apple or Google developer credentials or expose an auth-configuration tool.

In Supabase Authentication → URL Configuration, allow:

- `milo://auth/callback` for installed development/production builds.
- `http://localhost:8081/auth/callback` for local web development.
- Your deployed web origin followed by `/auth/callback`.

### Google

Create a Web application OAuth client in Google Auth Platform, configure consent/audience, and use the Supabase callback `https://lvtynjnpvnpqsrjvgwhl.supabase.co/auth/v1/callback`. Enable Google in Supabase with its **client ID and client secret**. Google login uses browser OAuth on both web and mobile, so no secret is bundled into the app. See [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

### Apple

Register or confirm the App ID `app.milo.roadmapper`, enable Sign in with Apple, and enable the Apple provider in Supabase with that allowed native client ID. EAS needs your Apple Developer team to sign the app. For web/Android Apple OAuth, also create a **Services ID**, **Team ID**, **Key ID**, and private **`.p8` signing key**, then generate the provider client secret. Put the Services ID first in Supabase's allowed client-ID list and the native bundle ID after it. Configure the same Supabase HTTPS callback. Web OAuth secrets require rotation at least every six months; native-only sign-in does not use that client secret. See [Supabase Apple setup](https://supabase.com/docs/guides/auth/social-login/auth-apple).

Keep all provider secrets in the respective provider/Supabase configuration. They do not go in the app's `.env.local`.

### Email

Magic-link sending and PKCE callback handling are implemented. Confirm the redirect allowlist, email template and SMTP configuration in Supabase. For reliable delivery to real users, configure your SMTP provider; email delivery and a real inbox round trip were not verified in this workspace. Open a PKCE email link on the device/browser that requested it.

## EAS and App Store

Cloud builds work from Windows or macOS. The repository is linked to [@zhanbo04/milo](https://expo.dev/accounts/zhanbo04/projects/milo), project ID `216f5ee1-bb99-40a6-89e2-a6bcf795f6f4`. Run `npx eas-cli@latest login` with an account that has access; you do not need to initialize a new project.

The two public Supabase values are configured in EAS's **preview** environment. Add them separately to development/production before using those profiles. EAS will manage signing after you authenticate your Apple Developer account. For an installed iPhone preview:

```sh
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

Choose website registration and open the link in Safari on the iPhone. Follow the profile installation instructions, select that device when building, and install from the finished build's link. A paid Apple Developer membership and iPhone Developer Mode are required. The preview build runs independently of Metro. See [internal distribution](https://docs.expo.dev/build/internal-distribution/) and [Developer Mode](https://docs.expo.dev/guides/ios-developer-mode/).

`.easignore` keeps local environment files, signing material, editor/agent settings, QA artifacts and reference canvases out of the upload. It preserves the brand SVG files imported by the app. When changing `.gitignore`, keep its exclusions synchronized with `.easignore`.

For a store build, after native testing:

```sh
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

Before submission, verify the native integrations on a real iPhone, publish legal pages, complete App Store privacy/AI disclosures and review account deletion. This repository has no production store submission or TestFlight build yet. See [EAS build profiles](https://docs.expo.dev/build/eas-json/).
