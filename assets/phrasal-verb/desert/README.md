# Phrasal Verb desert map

This scene uses the complete public Phrasal Verb catalogue (329 lessons at this release). Permanent lesson IDs, exercises, grading, attempt storage and bookmarks remain in the host. The map owns only navigation and account-and-system-scoped browser preferences. Eddie, Phoebe and Elsie use the established shared companion artwork.

## Artwork

`background.webp` is a 1672 × 941 built-in ImageGen master encoded to WebP, displayed at 1600 × 900 world units. The supplied desert map is its style reference. Plants, clouds, roads, UI and characters were excluded from the painting. Two manually traced pond masks are registered to that displayed footprint. Quiet native dune shapes extend the painting, and the edges fade into that surround.

`botanical-atlas.webp` is a 1536 × 1024 ImageGen atlas, losslessly encoded. The generator returned an opaque neutral checkerboard even after a transparency revision. The native SVG color matrix in the scene removes neutral background at rendering time, including interior gaps, while retaining the saturated olive and golden paint. The source atlas itself does **not** contain an alpha channel. This is recorded rather than describing the source as transparent. Crops and anchored motion are in `phrasal-verb-desert.mjs`; they were reviewed in the rendered scene. Clouds reuse the existing `assets/sentence-structure/coast/clouds.webp` artwork without modification.

All requested artwork was produced with the built-in ImageGen tool. No new runtime library is required. Full prompts and original PNG masters are retained in the task's `outputs/phrasal-desert-map` archive.

## Motion and layout

Every plant in the final inventory uses a root-anchored, independently phased skew. Palms use ±2.4°, cacti ±1.7°, reeds and shrubs ±4.1°, with periods of 5.8–8.62 seconds. Offscreen vegetation pauses. Both ponds have clipped surface movement and gentle short ripples. Three clouds drift slowly with varied phases and opposed directions. Exactly two small tumbleweeds roll left-to-right and right-to-left, with angular travel coupled to distance/radius; they wrap outside the 1600-unit core.

The sandstone platforms and winding sand path are native SVG geometry. The companion follows the sampled trail between lessons; keyboard movement cannot enter the pond masks. The initial map composition is designed for the shared desktop viewport at standard zoom. Small screens retain readable map scale and allow panning. A list view and the full lesson picker remain available.

The shared animation owner pauses the scene when hidden/inactive. Reduced motion freezes decoration and preserves navigation. Rendering uses standard DOM/SVG/CSS, with Canvas 2D only for the existing shared companions. Physical Safari/mobile performance and deliberate Canvas 2D loss are outside this test coverage.

## Checks

- `node --test tools/test-phrasal-desert.mjs`: catalogue, pond boundaries, 108,241 ordered routes, keyboard routing, rolling direction/contact, progress semantics, plant envelopes, camera.
- `node --test tools/test-phrasal-verb-system.mjs tools/test-phrasal-verb-attempt-outbox.mjs`: existing host and attempt safeguards.
- `node tools/test-phrasal-desert-browser.cjs`: isolated local fixture accounts, all real lesson entries, visible motion, stationary landmarks, progress/pins/account isolation, list access, reduced motion and desktop/tablet/phone layouts. External student services are blocked.
