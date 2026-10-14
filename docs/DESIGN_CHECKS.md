# Design checks

Source: `milo-design/DESIGN_HANDOFF.md`, `milo-design/design/canvas.json`, and each screen's inline styles. Mobile reference size: 390 × 844. Exact light/dark palettes are in `src/theme/tokens.ts`.

## Foundation / dev components

- All required shared components appear together in both appearances at `/dev/components`; controls are interactive.
- Nunito 400/600/700/800/900 and Noto Sans JP 700 are bundled locally.
- Solid offset shadows, selection borders, node sizes, icon paths, button typography and palettes are transcribed from the handoff.
- Native safe areas replace the canvas's fixed top inset. Text may grow and content may scroll to support Dynamic Type and small displays.
- Brand choice overrides the older icon and capitalized wordmark on individual canvases, as required by §7. The original selected SVGs are rendered directly.
- Deviation: only one expression per mascot was supplied. The four mood props use restrained poses of the supplied illustration, not invented artwork.
- The component gallery is a development canvas, so it contains multiple loading/error/empty examples at once.

Rendered verification and further screen-specific deviations are recorded below as each screen is completed.

## Roadmap / RoadmapDark

- Rendered at 390 × 844 in both appearances; compared against renders of the original design markup. Node geometry, Bézier paths, dotted strokes, motifs, ring, solid shadows and tab bar match the source.
- Uses one shared path for every category, responsive to actual available width. Nodes expose completion/lock state and open a clamped 250px popover.
- Deviations: path scrolls instead of clipping the final node; additional units are accessible below the current unit. Initial-current nodes receive extra top room for the START tag. Long titles wrap for accessibility.
- Production data comes from Supabase. Preview data is restricted to development and an explicit `preview` ID.
- XP is awarded on first completion only; reviewing a step does not grant repeat XP (avoids unlimited reward farming in the canvas's example review button).
- Native safe-area spacing replaces fixed status-bar space. Remaining-days copy is computed from real calendar dates.

## 01 Welcome

- The original dotted illustration, node placement, display typography, copy and actions are ported from Main.dc.html.
- Deviations: chosen A-trail logo and lowercase brand wordmark replace the earlier canvas mark; the small goat is included as required by the handoff. Screen can scroll at large text sizes.
- Pure introductory content has no data dependency; font initialization and the route error boundary cover loading/failure. There is no missing-content condition.

## 02 Sign in

- Matches Auth.dc.html hierarchy, provider button assets, email field, divider and explanatory copy. Includes pending, invalid-email, provider-error and magic-link-sent states.
- Real Supabase PKCE magic links and browser OAuth; native Apple token sign-in with a hashed nonce. Auth restoration is server-render safe; native sessions use SecureStore.
- Deviation: legal links are accessible touch targets and report unconfigured public legal URLs rather than linking to `#`. Provider credentials are configured outside the app. An additional callback route handles expired/missing codes.

## 03 Onboarding

- Three slides reproduce the goal card, question bubbles, path illustration, headings and copy from Onboarding.dc.html. Active indicator grows to 24px; Skip and Continue work.
- Reduced motion disables indicator animation. Pure local slide content uses the root loading/error handling; it cannot have an empty data state.
- Deviation: illustration scales through the shared component; touch targets may exceed the canvas height when Dynamic Type needs more room.
# Personalize

Compared the rendered 390 × 844 screen with Personalize.dc.html: input, two-column time cards, reminder card and footer match the canvas structure. Deviations: name is empty until entered or obtained from the account, so Continue is initially disabled; web says reminders are available in the mobile app. Scrollable content accommodates larger system text. Native notifications require device verification.
# HomeEmpty

Compared the rendered 390 × 844 screen with HomeEmpty.dc.html. Matches the prompt card, suggested goals and tab bar. Deviations: sample goal is a placeholder until typed or selected; the greeting follows local time; saved drafts gain a resume action. The microphone shortcut is omitted (the platform keyboard supplies dictation). Prompt content and cards grow with Dynamic Type instead of clipping. The AI endpoints authenticate every request and return actionable errors.
# Clarify

Compared the questions screen with Clarify.dc.html at 390 × 844. Matches progress, goal summary, question hierarchy and four option cards. Deviations: selected brand logo replaces the older mark; question count and content come from AI; custom answers and back navigation are available. Inputs validate dates and minutes. Empty question sets can continue directly; loading, retry and saved-draft recovery are implemented.
# RealityCheck

Checked the rendered layout against RealityCheck.dc.html. The chat bubble, honest-check card, duration comparison and two paths follow the canvas. Deviations: comparison bars represent relative time, never probability of success; “Fluent” is replaced by “More time” because a duration cannot promise fluency. Text, durations and achievable scope come from the feasibility response; long content scrolls. Draft recovery and persistence errors are covered.
# Generating

Compared the path artwork, heading and stage list with Generating.dc.html at 390 × 844. Original SVG geometry and 2.4-second drawing animation are retained, with a static path under reduced motion. Deviations: accurate “a minute or two” estimate replaces the unverified 15-second claim; stage checkmarks show only known inputs, not simulated server progress. Users can leave with their draft retained. Generation failures offer retry without losing answers.
# PlanReview

Compared the mobile review with PlanReview.dc.html. Unit accordions, three summary tiles, suggestion chips, revision field and fixed Start action follow the canvas. Deviations: real generated title/counts/date/summary replace samples, content scrolls, touch targets are at least 44px, and date formatting follows the device locale. Changes regenerate the complete draft; failed revisions preserve it. Starting uses a transaction with a draft UUID to prevent duplicate goals.
# Home

Checked Home.dc.html against the rendered dashboard. Matches the goal heading, streak/XP pills, indigo current-step card, progress rings and dashed new-goal action. Deviations: real counts and schedules replace example figures; completed goals and “set for today” states are shown when appropriate; a refresh action is added. Loading, empty, failed fetch and saved-draft states are implemented.
# Roadmap data integration

Rechecked the roadmap with actual-shaped goal records. Unit numbering now uses the database's one-based order; completed counts and streak derive from stored steps; lock messages use local dates. The sports dark preview uses the canvas's 70% progress. Goal routes now require a session, apart from the explicit development preview. Live backend checks passed plan saving, ordered completion, duplicate XP prevention, journal persistence and anonymous isolation.
# Lesson

Compared the lesson with Lesson.dc.html. Header, segmented progress, phrase cards, pronunciation actions, tip treatment, optional note and fixed completion action use the source tokens. All seven content block types render. Deviations: no fake “[AI illustration]” placeholder is shown; real image blocks have a failure fallback. Practice tasks and quizzes must be self-checked before completion. Long lessons scroll and note/checklist drafts survive reopening. Speech uses the device voice; native audio still needs a device check. AI help has its own loading and retry state.
# StepComplete

Compared with StepComplete.dc.html. The 160px badge, 112px check, pop animation, three stats and next-step card follow the canvas. Deviations: the selected goat is added as required by the handoff; actual XP/streak/progress and unlock dates replace examples. Photo selection compresses images to JPEG and stores them privately; upload failures retain the completed step. This screen rejects links to unfinished steps.
# Journal

Compared the journal timeline and Storia card with Journal.dc.html. Deviations: real goal names and dates replace sample chips; “All goals” is available; saved photos replace the canvas placeholder. Tapping a note opens editing, lesson review and explicit deletion confirmation. The Storia card remains labelled Soon as designed. Empty, loading, retry and unavailable-photo states are implemented.
# Profile

Compared Profile.dc.html with the rendered stats, weekly bars and settings rows. Values now reflect completed steps and local calendar dates. Settings open accessible sheets for name/time, reminders, appearance and account actions. Deviations: the unspecified “[PRICE]/mo” is replaced by “Coming soon”; no pretend subscription is offered. Account deletion requires typing DELETE and removes private photos before the account. Legal URLs still need the owner's published policies before release.
# DesktopRoadmap

Compared the 1440 × 960 app with DesktopRoadmap.dc.html. Sidebar, responsive columns, 520px path with inline labels, current-step card, latest note and adjustment input follow the desktop canvas. The same RoadmapPath renders the desktop geometry (66/80px nodes, 86px interval). Deviations: real content and additional units are scrollable; long labels wrap; adjustments have a preview and explicit Apply action. Completed steps are preserved and stale revisions are rejected by the database.
# DesktopCreate

Compared the 1440 × 960 review layout with DesktopCreate.dc.html: 68px header, 1240px content area, conversation/details column and draft-plan column. Real questions, answers, revisions and units replace the example conversation. Revision history is persisted with the draft. No “updated” badge is fabricated for a unit; successful revisions are acknowledged after server validation. Error states preserve the previous plan.

# Final comparison pass

Rechecked all seven category motifs in light and dark, the 1024px desktop breakpoint, and a 320px long-title/enlarged-text stress layout. No horizontal page overflow was observed. At 1024px the right panel moves below the path; at 1440px it is beside it. Native Dynamic Type and device safe areas still need an iPhone pass.

The required small goat is now present on Generating and RealityCheck; these placements follow handoff §7 where the older screen canvases omit it. The mobile revision send control now matches the dark square from PlanReview. Reminder notifications use the platform presentation rather than a custom mascot attachment. Auth state no longer clears an active plan when the same account regains browser focus. Runtime loading/error/retry states and local persistence were exercised in automated and live checks.

### October 14 usability update — shared controls
Added native calendar/time pickers (browser-native equivalents on web), multi-select cards and smoothly animated progress respecting reduced motion. Compared the light/dark component gallery at 1000px. Deviation: new picker controls and checkbox states requested by the user; existing tokens retained.


### Auth revision
Compared the 390 x 844 code-entry screen with Auth.dc.html tokens and spacing. Deviation: email is primary and a new six-digit code stage replaces the magic-link message, per user request. Invalid/expired code retry, resend cooldown and successful session navigation pass the browser test.


### Introduction revision
Checked the revised welcome slide at 390 x 844 against Onboarding.dc.html. Deviation: welcoming quick-setup copy, back navigation between slides, and self-paced learning replace daily-budget and one-step-per-day copy, per user request. Original art, cards and theme tokens retained.

