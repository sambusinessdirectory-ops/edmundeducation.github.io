# Flashcard range worlds

Shared range-selection presentation for `flashcards.html`, including the original edition and Italian, French, German, Spanish, Japanese and Korean editions. It also adapts to embedded reading-comprehension panels and the night theme.

## Design and behavior

- Standard modes use golden lacquered wooden beads on an abacus in a sunlit study. The red-only and green-only controls retain their material colors. All beads glow when the entire deck is mastered; the heading explicitly explains this deck-level criterion. The standard random 10/20/30/40 controls retain their existing unmastered-card selection behavior.
- Thirty-card ranges use ivory-faced brass medals, fabric ribbons, walnut framing and forest-green felt. Completion adds gold laurels on both sides and a small star.
- Ten-card ranges use emerald, ruby, sapphire and pale diamond variations in a burgundy velvet case. Completion adds a gold bezel and four prongs. The original emerald cutout has no gold edge, so the reward is an actual visible state change.
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

Full-resolution PNG originals are preserved at `/Users/sammak/Documents/ChatGPT/Astra/outputs/flashcard-range-worlds/artwork/`. The web assets use WebP quality 90 and alpha quality 100. Objects are 600×600, sufficient for the 195px maximum display size at 3× density; backgrounds retain their 1536×1024 resolution. All six deployed images total 784,464 bytes. This is layered raster artwork with HTML/CSS and SVG completion ornaments, not a real-time 3D scene.

Generated sprites were inspected for genuine transparency. The alpha channel ranges from 0 to 255; no checkerboard or painted backdrop is displayed. Sprite numbers and labels are never baked into images. Native SVG gradients use unique IDs, avoiding cross-instance fragment collisions. Decoration layers ignore pointer input.

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
