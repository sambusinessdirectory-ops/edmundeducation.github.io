# Phrasal Verb desert map

The map covers lessons 1–30. The original cards for lessons 31–329 continue below it. Permanent IDs, questions, grading, progress and bookmarks belong to the existing Phrasal Verb host; the map owns navigation and account-scoped companion/location preferences only.

## Artwork and composition

`background-complete.webp` is a complete 1241 × 1268 built-in ImageGen painting displayed at 1600 × 1635 world units. It extends the original desert with a lower oasis, broad dunes and grouped rocks. Three manually registered pond polygons define both surface animation clips and dry-ground navigation. There is no edge fade, blur, reflected padding or synthetic landscape extension. The earlier `background.webp` is retained as source history and is no longer rendered.

Palms, cacti, reeds and shrubs are deliberately simple native SVG artwork in `phrasal-verb-desert-plants.mjs`: broad fronds, smooth trunks, a small palette and no fine texture. All 29 planted groups sway about their roots with varied phase and 6.2–9.02 second periods. Palms use ±2.4°, cacti ±1.7°, other plants ±3.4°. Offscreen plants pause.

`botanical-atlas.webp` is now used only for the two small tumbleweeds. It is an RGB ImageGen atlas whose neutral background is removed at rendering time by the existing SVG color matrix; the source has no alpha channel. Clouds reuse the established coastal cloud asset. All three ponds have clipped surface shifts and sparse ripples. Two tumbleweeds roll in opposing directions, with rotation coupled to distance/radius. The shared owner suspends decoration while hidden or inactive; reduced motion freezes it.

The sandstone platforms and winding trail are native SVG. Open ground allows direct walking in any direction. A small visibility graph routes around the three shores; keyboard steps also test those boundaries. The trail only indicates lesson order. The final two stops end in open sand beyond the lower oasis.

Standard zoom retains readable stops and two-axis panning. Minus or the 全圖 button fits the entire landscape into a plain cream frame. At full overview the arrival card docks below the picture. The optional camera behavior is scoped to this theme. Saved locations beyond lesson 30 recover to the first stop while keeping the chosen companion.

The full generation prompt and original PNG are retained in the task archive `outputs/phrasal-desert-map-v2`. The built-in tool was used for the painting; export to WebP used Sharp. There is no new runtime dependency.

## Validation

- `node --test tools/test-phrasal-desert.mjs`: first-30 scope, true identities/question totals, 900 ordered dry routes, direct land travel, three pond obstacles, progress, plant spacing and camera.
- Host/outbox tests and shared/coast/realm geometry regression: 54 checks passed.
- `node tools/test-phrasal-desert-browser.cjs`: actual entries for all 30 mapped lessons; all 299 continuation cards; progress, saved pins, account isolation, out-of-scope saved pin recovery, no walking-induced attempts; animated direct walking and shore detours; pond click rejection; all visible plants, clouds, three ponds and opposing tumbleweeds; unchanged landmark pixels; full-art bounds and readable normal view at 1440 × 1050, 820 × 1180 and 390 × 844.
- Shared Speaking map browser regression: existing zoom bounds, lesson entry, progress, pins and mouse/keyboard/touch navigation.
- Paint registration: 3,517 sampled turquoise water pixels fall inside blocked walking space.

Browser checks use isolated fixture accounts and block external student services. They do not exercise a real authenticated student session or physical Safari hardware. Publication is checked against the canonical release and deployed file hashes.
