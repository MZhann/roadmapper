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

Apple/Google provider credentials, public legal pages, and an EAS/Apple signing session are still needed before a store release. See [setup and account credentials](docs/SETUP.md) and [verification report](docs/VERIFICATION.md).

## Phone development

The native integrations require a development build. `eas.json` includes development, simulator, preview and production profiles.

```sh
npx eas-cli@latest login
npx eas-cli@latest init
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
