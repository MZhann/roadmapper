This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


Milo is an iOS-first (Expo / React Native / TypeScript) app that turns one goal prompt into an AI-generated, gamified step-by-step roadmap.

## Before writing any UI
1. Read `milo-design/DESIGN_HANDOFF.md` fully.
2. The screen files in `milo-design/design/*.dc.html` are the source of truth. Match their inline style values exactly (colors, font sizes/weights, radii, spacing, shadows, copy). Never invent new colors or spacing — use `src/theme/tokens.ts`.
3. Brand assets are in `milo-design/brand/`. The chosen logo/mascot is set only in `src/theme/brand.ts`.

## Stack
Expo (latest SDK), Expo Router, TypeScript strict, Supabase (auth + Postgres + RLS + Edge Functions), TanStack Query, Reanimated, Gesture Handler, react-native-svg, expo-haptics, @expo-google-fonts/nunito.

## Rules
- Build order: tokens → shared components → RoadmapPath → screens (in screen-map order). One screen per commit.
- After each screen, list any deviation from its design file and why.
- Every screen needs loading, empty and error states.
- Respect reduce-motion, Dynamic Type and safe areas. No emoji in UI.
- AI calls go only through Supabase Edge Functions; never ship API keys in the app.
- Run `npx tsc --noEmit` and the linter before every commit.
