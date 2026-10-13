# Milo — Design Handoff for Codex

The design source lives in `design/` — one HTML file per screen (`*.dc.html`).
**These files are the source of truth.** Every color, size, radius, shadow, font weight and copy string is written inline in them. Open a file, read the inline `style="…"` values, and reproduce them 1:1 in React Native. The `<script data-dc-script>` block at the bottom of each file holds the screen's data and logic (e.g. how roadmap nodes are positioned) — port that logic too.

Ignore `<script src="./support.js">`, `<x-dc>`, `<helmet>`, `<sc-for>` (= `.map()`), `<sc-if>` (= conditional render), `{{value}}` (= prop/state binding), `<dc-import>` (= render that component with props). These are design-tool syntax, not part of the app.

Stack: Expo (latest SDK) + Expo Router + TypeScript + Supabase + TanStack Query + Reanimated + Gesture Handler + expo-haptics.

---

## 1. Design tokens (create `src/theme/tokens.ts` first)

| Token | Light | Dark |
|---|---|---|
| background | `#F6F7F5` | `#0F1113` |
| surface | `#FFFFFF` | `#181B1E` |
| line | `#E4E6E1` | `#2A2E33` |
| ink (text) | `#15171A` | `#F1F2F3` |
| inkSecondary | `#3A4048` | `#C9CDD2` |
| muted | `#5E646B` | `#9AA1A9` |
| accent | `#3346D3` | `#8C9BFF` |
| accentDeep (3D shadow under accent) | `#2535A8` | `#5563C9` |
| accentSoft | `#E8EBFC` | `#1F2547` |
| onAccent | `#FFFFFF` | `#0F1113` |
| lockedNode | `#ECEEEA` | `#22262B` |
| lockedNodeShadow | `#D9DCD5` | `#15181B` |
| lockedIcon | `#8A9097` | `#6C737B` |
| pathDash | `#C9CDC6` | `#3A3F45` |
| motifFaint | `#E2E4DF` | `#262A2F` |
| streakBg / streakText | `#FFF3E6` / `#8A4A0E` | `#2E2216` / `#F0A257` |
| streakIcon | `#C2620F` | `#F0A257` |

**One accent for all categories.** Categories never change color — only the motif icon.

**Typography — Nunito** (`@expo-google-fonts/nunito`, weights 400/600/700/800/900). Japanese text: Noto Sans JP.

| Style | Size / weight / letter-spacing |
|---|---|
| Display | 36 / 900 / -0.8 |
| Title | 28–30 / 900 / -0.6 |
| Heading | 22–24 / 900 / -0.4 |
| Card title | 16–17 / 800 |
| Button | 17 / 800 |
| Body | 15–17 / 600, line-height 1.45–1.5 |
| Caption | 13–14 / 700, muted |
| Eyebrow | 12 / 900 / +0.6, UPPERCASE |

**Spacing:** screen padding 20–24, top inset ~60 (use safe area, no fake status bar), gaps 8 / 10 / 12 / 16 / 24.
**Radii:** chips 8, small buttons 12–14, buttons & inputs 16, cards 18–24, hero card 24, avatar/nodes 50%.

---

## 2. Core components (build in `src/components/`)

- **PrimaryButton** — h 56, radius 16, bg accent, text onAccent 17/800, **solid shadow `0 4px 0 accentDeep`** (the "3D" look — in RN use a View behind it offset 4px, not a blurred shadow). Pressed: translateY +3 and shadow shrinks to 1px; light haptic.
- **SecondaryButton** — h 52, surface bg, 1.5px line border, radius 16.
- **OptionCard** (selectable) — radius 18, padding 14–16. Unselected: surface + 1.5px line border + `0 3px 0 line`. Selected: accentSoft bg + 2px accent border + `0 3px 0 accent`. Radio dot 22px.
- **Chip** — radius 999, padding 8×14, 13–14/800.
- **StatTile** — surface, 1px line border, radius 14–18, value 18–24/900, label 12–13/800 muted.
- **StreakPill / XPPill** — radius 12, padding 7×10, 15/900.
- **ProgressBar** — h 8–10, radius 5, track line color, fill accent.
- **ProgressRing** — 52px, stroke 5, track `#ECEEEA`, starts at 12 o'clock (react-native-svg).
- **TabBar** — h 84, surface, top border line; 3 tabs: Path, Journal, Profile; icon 24, label 11/800; active = accent, inactive = muted.
- **MotifIcon** — stroke line icon, `theme_id → path` (paths are in `Roadmap.dc.html` / `Themes.dc.html` script blocks; copy them exactly).
- **RoadmapPath** — see §4.

All icons: 24-viewBox stroke icons, stroke-width 2.2–2.6, round caps/joins. Use the inline SVG paths from the files (react-native-svg) or Lucide equivalents. **No emoji anywhere.**

---

## 3. Screen map

| # | Design file | Route (Expo Router) | Notes |
|---|---|---|---|
| 01 | `Main.dc.html` | `/(auth)/welcome` | |
| 02 | `Auth.dc.html` | `/(auth)/sign-in` | Apple, Google, email magic link (Supabase OTP) |
| 03 | `Onboarding.dc.html` | `/(onboarding)/intro` | 3 slides, animated dot indicator (active dot 24px wide) |
| 04 | `Personalize.dc.html` | `/(onboarding)/personalize` | name, daily minutes, reminder toggle |
| 05 | `HomeEmpty.dc.html` | `/(tabs)/index` (no goals) | goal textarea + example ideas |
| 06 | `Clarify.dc.html` | `/goal/new/questions` | AI questions, one per screen, segmented progress |
| 07 | `RealityCheck.dc.html` | `/goal/new/reality-check` | shown only if AI flags the timeline as unrealistic |
| 08 | `Generating.dc.html` | `/goal/new/generating` | path draws itself; checklist of stages |
| 09 | `PlanReview.dc.html` | `/goal/new/review` | expandable units, quick-change chips, change input |
| 10 | `Home.dc.html` | `/(tabs)/index` (has goals) | today card + goal list |
| 11 | `Roadmap.dc.html` | `/goal/[id]` | **the key screen**, light |
| 12 | `RoadmapDark.dc.html` | same, dark mode | same component, `dark` + `sports_movement` theme |
| 13 | `Lesson.dc.html` | `/goal/[id]/step/[stepId]` | content blocks + note field |
| 14 | `StepComplete.dc.html` | `/goal/[id]/step/[stepId]/done` | pop-in check badge |
| 15 | `Journal.dc.html` | `/(tabs)/journal` | timeline of step notes; "Storia" card = Soon |
| 16 | `Profile.dc.html` | `/(tabs)/profile` | stats, weekly bars, settings rows |
| — | `Themes.dc.html` | — | reference: tokens, type scale, 8 theme motifs |
| D1 | `DesktopRoadmap.dc.html` | web, `/goal/[id]` ≥ 1024px | sidebar + path + right panel |
| D2 | `DesktopCreate.dc.html` | web, `/goal/new` ≥ 1024px | chat left, plan preview right |
| — | `Logos.dc.html`, `Mascots.dc.html` | — | brand options, see §7 |

`canvas.json` lists every screen and its frame size (mobile = 390×844).

---

## 4. Roadmap path — exact algorithm (from `Roadmap.dc.html`)

For node `i` (0-based), on a 390-wide canvas:

```ts
const cx = 195 + Math.round(78 * Math.sin(i * 1.05));
const cy = 46 + i * 92;
const size = state === 'current' ? 76 : 64;
```

- Connecting line: cubic Bézier between consecutive centers, control points at the vertical midpoint: `C q.x midY, p.x midY, p.x p.y`.
- Completed segment: solid accent, width 5, opacity 0.35. Upcoming segment: pathDash, width 4, dasharray `1 12`, round caps (dotted).
- **Done node:** accent fill, white check, shadow `0 6px 0 accentDeep`.
- **Current node:** accent fill, white star, 6px accentSoft ring, a "START" tag 40px above that bobs ±4px over 2.4s.
- **Locked node:** lockedNode fill, lock icon, shadow `0 6px 0 lockedNodeShadow`. Last node in a unit uses a flag icon.
- Tap a node → popover (250 wide, radius 18) 16px below the node, x clamped to 16px from the screen edges: "Step N of M · 20 min", title, button (Start / Review / locked message).
- Two faint category motifs (84px and 64px, stroke 0.9, motifFaint) sit in the empty space beside the path.
- Unit header card above the path: eyebrow "UNIT 2 · 4 OF 6" in accent, unit name 19/900, 52px motif box on the right.
- Scale the x amplitude to the screen width (`width/2 ± width*0.2`) so it works on every iPhone.

---

## 5. Motion rules (restrained)

- Springs: Reanimated `withSpring({ damping: 18, stiffness: 220 })` for press/select.
- Transitions 160–240ms. Step-complete badge: scale 0.6 → 1.06 → 1, 520ms.
- Generating screen: path stroke draws over 2.4s, loops.
- Respect `AccessibilityInfo.isReduceMotionEnabled()` — disable bobbing, drawing and pop-in.
- Haptics: selection on option tap, light on button press, success on step complete.

---

## 6. Data model (Supabase)

```
profiles(id, name, daily_minutes, reminder_time, created_at)
goals(id, user_id, title, prompt, theme_id, deadline, daily_minutes, status, created_at)
units(id, goal_id, idx, title)
steps(id, unit_id, idx, title, minutes, xp, content jsonb, status, unlock_date, completed_at)
notes(id, step_id, user_id, text, photo_url, created_at)
```
`theme_id` ∈ `languages_learning | sports_movement | money_business | art_creativity | technology | life_wellbeing | general_adventure` (fallback `general_adventure`).
`steps.content` = array of blocks: `text | phrase | image | tip | task | checklist | quiz`.
RLS on every table: `user_id = auth.uid()`.

---

## 7. Brand — name, logo, mascot

- App name: **Milo** (wordmark is lowercase `milo`, Nunito 900, letter-spacing -1).
- Logo options: `brand/logo-*.svg` (1024×1024, ready for the App Store icon export). Design board: `design/Logos.dc.html`.
- Mascot options: `brand/mascot-*.svg`. Design board: `design/Mascots.dc.html`.
- **The final choice lives in one place**: `src/theme/brand.ts` → `export const BRAND = { logo: 'A-trail', mascot: 'goat' }`. Build `<Logo />` and `<Mascot mood="happy|thinking|sad|cheer" />` components that read from it, so swapping is a one-line change.
- Mascot appears (small, 56–96px) on: Welcome, Generating, Reality check, Step complete, empty states, and streak-reminder notifications. Never on the roadmap path itself (keeps it quiet).
- Render SVGs with `react-native-svg` (`react-native-svg-transformer` to import `.svg` files as components).
- App icon: export the chosen logo SVG to a 1024×1024 PNG, set it in `app.json` → `expo.icon`.
