# Flashcard range worlds

Shared range-selection presentation for `flashcards.html`, including the original edition and Italian, French, German, Spanish, Japanese and Korean editions. It also adapts to embedded reading-comprehension panels and the night theme.

## Walkable map

The default presentation is now a connected companion map, with a saved, plain Normal mode alternative. Eddie, Phoebe and Elsie walk to the platforms before the learner chooses Start practice. See [walkable map implementation and verification](../../../docs/flashcard-walking-maps-20260914.md).

## Design and behavior

- Standard modes use golden lacquered wooden beads on an abacus in a sunlit study. Real walnut spacer sprites fill about 60% of each available gap, leaving breathing room; a ResizeObserver adapts their count and positions to the actual layout. The red-only and green-only controls retain their material colors. All beads glow when the entire deck is mastered; the heading explicitly explains this deck-level criterion. The standard random 10/20/30/40 controls retain their existing unmastered-card selection behavior.
- Thirty-card ranges use ivory-faced brass medals, eleven distinct fabric ribbon palettes and stripe layouts, walnut framing and forest-green felt. Desktop rows contain five medals. Completion adds gold laurels on both sides and a small star.
- Ten-card ranges use nine separately colored gems in eight shapes, four per desktop row in a burgundy velvet case. Ivory round, burgundy oval, emerald cut, royal-blue round, blush pear, aqua four-leaf clover, amethyst cushion, amber marquise and teal hexagon all have quiet centers for readable live numbers. Completion adds a gold bezel derived from each actual alpha silhouette, including the concave clover outline. Uncompleted stones have no gold edge.
- Existing fallback HTML, forty native buttons, delegated events and session selection attributes remain available. Labels, progress and descriptions are live text, independent of the artwork.
- The existing range definitions are preserved: 30-card blocks through 300 plus the remainder; 10-card blocks through 200 plus the remainder. Partial final ranges display their actual available endpoints and denominator. Empty/unavailable ranges remain disabled and never appear completed.

## Progress ownership

`refreshDeckStartPanel` supplies the current account's existing `getDeckFamiliarity` result to the presentation layer. No separate completion store, timestamps or new backend endpoints are introduced. A nonempty range is complete only when every actual card is green and none are red. Red takes precedence over a conflicting stale green value. Clearing mastery immediately removes the decoration on the next panel refresh. Ownerless sessions show no rewards. Existing language-specific storage and record routing are preserved.

## Artwork provenance

The user's three supplied references are `Flashcard Stanadard Mode.png`, `Flash card - 30 card range.png`, and `Flash card 10 mode.png`. The built-in image generator produced six separate assets. Exact generation prompts are in [prompts.json](prompts.json).

| Asset | Built-in original |
| --- | --- |
| bead.webp | exec-e5b36752-d5ba-4805-af4e-9e81df4e86bf.png |
| medal.webp | exec-bd90c6a8-5fd3-41df-9cab-bfcf6521726c.png |
| gem.webp | exec-dad66ab6-f96e-415b-be64-1915a28fd3dc.png |
| wood.webp | exec-6e5322a3-5718-4953-abe5-f66334e2b35d.png |
| cabinet.webp | exec-e3f51877-ad41-4f08-91bd-e90b55de0115.png |
| velvet.webp | exec-8dbba2dc-ae52-4017-8261-c7563c0b39f4.png |

Full-resolution PNG originals are preserved at `/Users/sammak/Documents/ChatGPT/Astra/outputs/flashcard-range-worlds/artwork/`. The web assets use WebP quality 90 and alpha quality 100. Objects are 600×600, sufficient for the 195px maximum display size at 3× density; backgrounds retain their 1536×1024 resolution. The original six images total 784,464 bytes. The old gem.webp is retained for provenance but is no longer requested by the renderer. This is layered raster artwork with HTML/CSS and SVG completion ornaments, not a real-time 3D scene.

Generated sprites were inspected for genuine transparency. The alpha channel ranges from 0 to 255; no checkerboard or painted backdrop is displayed. Sprite numbers and labels are never baked into images. Native SVG gradients use unique IDs, avoiding cross-instance fragment collisions. Decoration layers ignore pointer input.

## September 14 refinement (worlds2)

The supplied ribbon, gem-cut/color and quatrefoil references informed the second pass. Exact prompts and edit outcomes are recorded in [prompts-v2.json](prompts-v2.json).

- Nine new gem sprites are 480×480 transparent WebP, with each stone fitted inside 370×370. They retain real distinct colors rather than hue-rotating one noisy diamond. Light stones use dark type; dark stones use ivory type. Reflections are concentrated around the rim.
- The initial atlas and attempted transparency repair both contained a painted checkerboard. The built-in image editor replaced only that backdrop with flat chroma green. `node tools/build-flashcard-gems-v2.cjs /path/to/gems-chroma-original.png` flood-fills connected green background from each cell boundary, keys it to alpha, treats only adjacent edge spill, and packs the nine sprites. Internal gem regions are preserved. The script verifies a 3×3 layout. Original: `exec-e0bf4f60-9c38-4740-82d6-6c871f6e1f9a.png`.
- Walnut spacer original: `exec-e58fdef5-28ea-415d-a050-a25bc25e57e0.png`, genuine alpha, trimmed and resized to 112×300 WebP.
- Ribbons use SVG color/stripe layers clipped to the original medal alpha, with original grayscale fabric shading and fine weave. The original brass buckle, medal body and completion laurels stay intact.
- A morphological dilation of each gem's alpha forms its gold reward rim. The gold mask preserves the stone silhouette and never covers its readable center.
- Wide layout: standard 4 columns, medals 5, gems 4. Tablet: 2/3/4. Phone: 2/2/2. Embedded reading panes keep one object per column and independent vertical scrolling.
- Full-resolution generation sources, review captures, exact prompts and preview: `/Users/sammak/Documents/ChatGPT/Astra/outputs/flashcard-range-worlds-v2/`.
- The browser check verifies all seven languages, eleven ribbon variants, nine gem colors, the clover, eighteen desktop spacer beads, native button actions, actual mastery rules, account/language isolation and compact layouts. Fixed page navigation is hidden only while taking collection-only evidence captures; it is present during interaction checks and unchanged in production code.

## Issues caught and solved

1. The migrated local workspace had a symlink that prevented sandboxed image reads. Authorized filesystem inspection loaded reduced reference previews into conversation; the built-in image generator then used those visible references. Original input files were unchanged.
2. The legacy ten-card yellow styles overrode the gem tray. A unique range container scopes the new stylesheet above those old selectors while preserving the unenhanced fallback. The night theme's important declarations receive a narrow material-specific override.
3. Long range numbers crossed medal rims. Container-relative type scales with the actual object width. Partial ranges also update the spoken description and session label.
4. Stretching an entire cabinet picture put lower progress labels on the frame on tall screens. Nine-slice image borders preserve a fixed rim depth, with sufficient interior padding.
5. Shorter final rows left rails ending in empty space. Rods now span each grid row and are clipped inside the frame. The embedded columns retain independent vertical scrolling without horizontal overflow.
6. Initial laurels looked too dense. Paired, separated leaf silhouettes now follow each side of the medal.
7. Inherited embedded heading backgrounds repeated a miniature backdrop. Headings use a transparent background instead.
8. Completion glow initially replaced red/green bead filters. The glow now composes with each bead's existing color filter.

## Verification

- `node tools/test-flashcard-range-worlds.mjs`: full/partial/remainder completion, stale green/red conflicts, duplicate indices, empty and unavailable ranges, deployed artwork existence.
- `node tools/test-flashcard-range-worlds.cjs`: shipped real HTML/CSS/scripts with synthetic local catalogue and persistence adapters. All cloud requests and real authentication are blocked. Exercises all forty buttons; 337-, 35- and 0-card fixtures; each standard mode; first/partial/remainder ranges; nested-image clicks; persisted progress reload; two accounts and sign-out; seven language editions; keyboard selection; night and reduced-motion settings; desktop, tablet, phone and embedded panels.
- Existing deck-mode, study-interaction, private-deck, state-integrity, sync-resilience, conflict-recovery, PWA-update and login checks passed. Existing language-edition checks passed.
- Evidence and screenshots: `/Users/sammak/Documents/ChatGPT/Astra/outputs/flashcard-range-worlds/qa/`.

Screenshots show synthetic review records, not any student's actual progress. A passing state check does not replace visual inspection of the completed and incomplete materials, actual normal-size labels and compact layouts.


## September 14 refinement (worlds4)

- Walking follows a direct line, independent of the alternating platform numbering. It preserves the learner's chosen zoom across collection boundaries. Manual zoom, overview and panning remain available.
- The connected board, spacing and objects are approximately 20% smaller. The 337-card fixture measures 1280 × 3744 map units, retaining four abacus platforms, five medals and four gems per row.
- Normal mode uses compact text buttons and current progress. It persists per account, language and deck through the existing map preference store. A restored Normal mode skips building the graphical map entirely. Embedded phones show two columns without retaining the sprite's empty square.
- Each gem sits in an independent padded velvet well, using four subtle burgundy/plum lining tints and inset shading. Native text selection and image dragging are disabled within the graphical viewport.
- `abacus-left-v4.webp` and `abacus-right-v4.webp` are substantial sloping honey-oak legs with broad feet, grain, bevels and matching light. They are separate 350 × 1024 crops from built-in original `exec-1f2d2f88-637e-4f75-ab2b-677f1bb132a2.png`, preserving its true alpha. Conversion used WebP quality 93 and alpha quality 100; no background replacement was needed. The outer 350-pixel portions of the 1536 × 1024 source form the respective supports. Exact prompt and preparation are recorded in [prompts-v4.json](prompts-v4.json).
- Evidence, source artwork and screenshots: `/Users/sammak/Documents/ChatGPT/Astra/outputs/flashcard-map-refinements-v4/`.
