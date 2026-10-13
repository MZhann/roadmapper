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
