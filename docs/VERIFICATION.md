# Verification — 14 October 2026

## Implemented

All 16 mobile screens and the two desktop layouts from the design handoff are implemented. The component comparison route includes the selected A-trail logo and goat, Nunito typography, shared controls and both appearances. Seven categories share one roadmap layout. Screen feature commits follow the handoff order; [DESIGN_CHECKS.md](DESIGN_CHECKS.md) records individual comparisons and deviations.

## Passed

- TypeScript strict checking and Expo ESLint.
- Expo Doctor: 21/21 checks.
- 18 automated domain tests: schema rejection, self-paced progression, quiz answers, calendar/time parsing, Japanese voice selection, streak boundaries, draft compatibility and patched URL decoding.
- 15 browser regressions against the production web bundle, including email-code verification/retry/paste, multi-select/deselection, custom answers and date persistence across back/close/reload, regeneration after choosing a default, reminder picker retention, pronunciation controls/errors, and two consecutive future-dated lesson completions. Existing session, journal, theme, desktop and failure checks also pass. Speech is mocked in browser tests; these verify interaction and language/voice requests, not audible output.
- Web production export and iOS Hermes bundle export. This verifies JS/assets, not native signing or device behavior.
- Signed EAS iPhone preview build: Milo 1.0.0 (1), completed 14 October 2026 from commit `8b52d26`. [Build and installation](https://expo.dev/accounts/zhanbo04/projects/milo/builds/25b7fe68-67f1-4352-9c4d-822d5eb4c87a). Native compilation, signing and IPA upload succeeded; the ad hoc provisioning profile includes the registered iPhone. This confirms the native build, not an on-device runtime pass.
- Fourteen rendered category/appearance combinations, plus a 320px long-title / enlarged-web-text check, without horizontal page overflow. This is additional web layout coverage, not a substitute for iOS Dynamic Type testing.
- Server functions pass Deno type checking.
- Nine migration versions are recorded locally. The latest migration `20261014083102_self_paced_steps.sql` was applied and its remote timestamp reconciled.
- Exact OpenAI secret value absent from tracked files and both production exports.

The final iOS asset payload is approximately 6.4 MB, reduced from 53.7 MB by importing only the six font weights the app uses. The updated native JS/Hermes bundle is approximately 5.9 MB.

## Live Supabase and AI checks

A temporary QA account exercised real APIs and AI responses. The full browser flow passed without page errors: enter a goal, clarify, assess feasibility, generate, request an AI revision, save, open a lesson, complete its practice, save a note, upload a private photo, reload the journal, switch to dark and reload.

Additional backend checks passed:

- Out-of-order completion rejected; duplicate completion awards zero additional XP and does not duplicate the note.
- Authenticated users cannot read another account's goal/steps/notes or complete its steps; anonymous requests cannot read goal data.
- AI lesson help and future-plan revision work. Revision preserves completed content, notes and XP, allows further work regardless of minutes already completed today, and rejects stale concurrent edits.
- Missing/empty plan envelopes, null concurrency guards and invalid timezones are rejected without changing stored work.
- Photos are fetched through signed links from the private bucket.
- Account deletion requires confirmation and deletes its private photos before removing the account. The QA account could no longer sign in afterward. Database checks confirmed zero remaining QA users, goals, notes and photos.

No user's existing account or data was used for destructive testing. Local test credentials and logs stay in the ignored `.artifacts/` directory.

## Remaining setup and unverified behavior

- Apple and Google providers are still disabled. Their developer-account credentials and allowed redirect configuration must be supplied as described in [SETUP.md](SETUP.md). Email is enabled. The app now verifies six-digit email codes in-app, but both Supabase email templates must use `{{ .Token }}`. Dashboard template confirmation and a real inbox round trip remain pending; see [SETUP.md](SETUP.md#email).
- The signed iPhone preview is ready to install. No signed Android build, TestFlight upload or App Store submission was performed. Native Apple sign-in, keyboard/safe-area behavior, VoiceOver/Dynamic Type, speech, haptics, photo permissions and scheduled reminders still require a real-device pass.
- Published privacy and terms URLs are still missing. Storia and Plus intentionally remain Soon.
- Web hosting is not provisioned; add its origin to the server CORS allowlist when deploying.

## Dependency and database audit

The vulnerable URI decoder was upgraded to 0.5.0 with a tested CommonJS/ESM adapter for the Expo Router dependency chain. Xcode's UUID dependency was upgraded to 11.1.1; generation was checked. A clean install applies the adapter through `postinstall`.

`npm audit` still reports 19 high-severity entries (the date picker adds another affected dependency chain) propagated through Expo build tooling from **braces 3.0.3** and **node-forge 1.4.0**, for which no patched release was available at verification time. These are not claimed fixed; do not use `npm audit fix --force`, which proposed incompatible Expo versions. Track the [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and [node-forge advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv) and update through Expo-compatible releases.

Supabase's advisor flags authenticated access to SECURITY DEFINER RPCs; this is intentional for atomic, ownership-checked save/complete/revise/quota operations. Usage tables intentionally have no client-readable RLS policy. Equivalent legacy policies were consolidated and the missing notes foreign-key index was added. The project also reports leaked-password protection disabled; the app exposes OAuth and email codes, not password sign-up. That project-level option was not changed through the available MCP tools.


## Usability update verification

- Native calendar and time controls use SDK-compatible `@react-native-community/datetimepicker`; web uses browser-native inputs. Reminder selection is available in onboarding and Profile.
- Pronunciation normalizes Japanese aliases to `ja-JP`, selects a matching installed voice, exposes loading/playing/stop/error states, and stops on leaving the lesson or backgrounding. iOS uses `expo-audio` with `playsInSilentMode: true` and the application speech session. Microphone and background-audio permissions are disabled. Audible output and reminder delivery must still be checked on the registered iPhone.
- The live planner generated 12 self-paced Japanese steps with 41 Japanese-tagged phrases, with no daily-time question. No additional TTS API or key is used.
- `supabase/tests/self_paced.sql` passed against the connected database in a rolled-back transaction: daily budgets and future dates no longer gate work; ordering, ownership, duplicate XP protection, revision conflict detection, completed notes and same-session goal completion remain correct.
- The temporary AI test account was deleted and subsequent sign-in failed as expected. User accounts were not used for these tests.
- GitHub Actions passed for application/build commit `7bb93af`: [CI run](https://github.com/MZhann/roadmapper/actions/runs/38538448662).
- EAS preview **1.0.0 (2)** completed successfully from `7bb93af` at 09:00 UTC on 14 October 2026. Native compilation, signing, and IPA export/upload passed. [Install the updated iPhone build](https://expo.dev/accounts/zhanbo04/projects/milo/builds/88a5b018-5ede-43b3-ab2e-d78c869e869b). It includes the registered iPhone and replaces build 1.

## Visual samples

The samples below use test data; category motifs and palettes change while geometry stays shared.

![Light roadmap](previews/roadmap-light.png)

![Dark roadmap](previews/roadmap-dark.png)
