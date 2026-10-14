# Milo

An iOS-first Expo app that turns a goal into an AI-generated path, daily practice, and a private progress journal. Built from the Quiet Ambition canvases in `milo-design/`.

## Continue on your Mac

Use Node 22.13+ (Node 22 LTS recommended) and npm.

```sh
git clone https://github.com/MZhann/roadmapper.git
cd roadmapper
npm ci
cp .env.example .env.local
# Fill the two Supabase public values, then:
npm run web
```

Open `http://localhost:8081`. `/dev/components` compares the shared components in both appearances. The app requires a Supabase session; preview fixtures are only used by test scripts, never as a fallback for real accounts.

The connected Supabase project is `lvtynjnpvnpqsrjvgwhl`. Its schema and `milo-planner` / `milo-account` functions have been deployed. The OpenAI secret is already on the server. **The ignored Windows `.env.local` is not in Git**: recreate it from the project dashboard on your Mac. No OpenAI key belongs in the mobile app or EAS public variables.

Apple/Google provider credentials and public legal pages are still needed before a store release. See [setup and account credentials](docs/SETUP.md) and [verification report](docs/VERIFICATION.md).

## Phone development

EAS cloud builds can be started from Windows or macOS; a Mac is not required to install Milo on an iPhone. The project is linked to [@zhanbo04/milo](https://expo.dev/accounts/zhanbo04/projects/milo). `eas.json` includes development, simulator, preview and production profiles.

The first signed iPhone preview, **1.0.0 (1)**, is [ready to install](https://expo.dev/accounts/zhanbo04/projects/milo/builds/25b7fe68-67f1-4352-9c4d-822d5eb4c87a) on the registered iPhone. Open that page in Safari and tap Install. Newly registered devices require a new build or re-signing before they can install it.

For a standalone iPhone test, register the device and create a preview build. This requires a paid Apple Developer membership. The two public Supabase values are configured in the project's EAS **preview** environment.

```sh
npx eas-cli@latest login
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

Open the registration link in Safari on the iPhone and follow the profile instructions before building. Let EAS manage Apple signing, select the registered iPhone, then open the completed build's installation link on that phone. Enable Settings → Privacy & Security → Developer Mode and restart when prompted. The preview app runs without a development server. Use email sign-in until the Apple/Google providers are configured, and allow `milo://auth/callback` in Supabase Authentication → URL Configuration.

For live code changes, use a development build instead:

```sh
npx eas-cli@latest login
# Add the EXPO_PUBLIC_* values to the EAS development environment first.
npx eas-cli@latest build --platform ios --profile development
npx expo start --dev-client
```

For an iOS simulator build, use `--profile simulator`. The configured bundle identifier is `app.milo.roadmapper`; confirm its ownership in your Apple Developer account before signing. Native projects use Expo Continuous Native Generation; do not hand-edit `ios/` or `android/`.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npx expo-doctor
```

Browser tests mock Supabase and AI and do not incur API charges. GitHub Actions runs these checks and a web export. `npm run check:backend` reports connectivity and enabled auth providers without printing keys.

## Project map

- `src/app/`: Expo Router screens, in handoff screen order.
- `src/theme/`: exact light/dark tokens, seven category motifs, and the single brand selection.
- `src/components/`: shared controls, winding roadmap, lesson blocks, desktop layouts.
- `src/domain/`: validated AI schema, schedules, progress and streak calculations.
- `supabase/`: additive migrations, authenticated AI and account-deletion Edge Functions.
- `tests/`: plan/progress regressions and browser flows.
- [Design checks](docs/DESIGN_CHECKS.md): per-screen comparisons and explicit deviations.

The backend keeps lesson completion atomic, awards XP once, checks step ordering and ownership, and preserves completed work during revisions. Photos use private storage and expiring signed URLs. Storia export and Milo Plus remain **Soon**, as specified in the design; no purchase or export is simulated.

Use `npx expo install <package>` for dependency changes. The decoder and UUID overrides address transitive advisories; the small `postinstall` compatibility patch is covered by tests. Remaining upstream tooling advisories are recorded in the verification report.
