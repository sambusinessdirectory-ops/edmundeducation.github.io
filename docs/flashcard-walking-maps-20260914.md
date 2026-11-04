# Walkable flashcard collections

The flashcard range screen now opens as a connected illustrated journey. The wooden abacus, medal cabinet and jewel box are real destinations for the same Eddie, Phoebe and Elsie companion engine used by the lesson maps. A platform click walks to the platform; the arrival card starts practice through the existing native flashcard action. Merely walking never writes a study result.

## Interaction and layout

- Forty destinations on a 337-card fixture: eight standard modes, eleven 30-card ranges and twenty-one 10-card ranges. Empty ranges are omitted from the walkable map and remain disabled in Normal mode. Short and final ranges retain their actual endpoints and card counts.
- Four abacus platforms, five medals and four gems per row. Numbering alternates across rows; walking takes a direct line to the selected platform, independent of numbering. Collection shortcuts and the destination picker walk between regions. The map supports click-to-walk, arrow keys / WASD, mouse dragging, touch panning, zoom and a whole-collection overview.
- The board and platform spacing are 20% smaller. Manual zoom and overview remain available; walking preserves the chosen scale. Native text selection and image dragging are suppressed only within the map viewport, while map panning remains available.
- The established directional mascot sprites provide walking legs and body movement. One saved flag and selected companion are scoped to account, language and deck. Changing account, language or deck cannot inherit another scope's saved location or mastery rewards.
- Reduced motion resolves travel immediately. Map animation pauses outside the deck-start panel or visible browser viewport and resumes when appropriate. A saved Normal mode preference displays compact text buttons with progress and launches the same native actions, without building the graphical map.
- Completion still uses the original familiarity records: glow on fully mastered standard beads, laurels on mastered medals and silhouette-following gold rims on mastered gems. Eleven ribbon designs, nine gem colors, eight gem shapes including the aqua clover, and spaced walnut counters remain intact.

## Implementation

`flashcard-range-map.mjs` adapts `common-expression-map.mjs` through its theme, terrain, navigation and lifecycle hooks. The established mascot artwork is reused. The shared engine adds an opt-out for automatic collection overview fitting; only the flashcard theme opts out, leaving other maps unchanged. The range renderer passes a current snapshot to the adapter, and the page notifies it when the deck-start panel becomes active or inactive. All seven editions share this integration.

Art is cloned from the existing range buttons with independent SVG IDs, so original buttons remain a functional fallback and masks cannot collide. Range launch still calls the original button, preserving confirmation, card queues, study mode, access and persistence behavior. The CSS confines the large panning canvas to its own panel instead of allowing it to widen the page grid.

No backend, account permissions or progress schema changed. Two generated, genuinely transparent oak supports replace the thin abacus posts. Each gem has a recessed velvet compartment with one of four lining tints. Asset provenance is recorded in `assets/flashcards/range-worlds/README.md`, `prompts-v2.json` and `prompts-v4.json`.

## Verification

- `node tools/test-flashcard-range-map.mjs`: 40 compact destinations, 1280-pixel width and 3744-pixel full-fixture height, exact 5/4 medal/gem columns, all 1,600 direct source/destination route pairs, free movement and short decks. Included in the Pages release gate.
- `node tools/test-flashcard-range-map-browser.cjs`: actual shipped page with synthetic local records; blocks cloud authentication. Verifies visible character displacement, no session before arrival, arrival actions, all companions, saved-location reload, account/language isolation, keyboard movement, partial/final/empty decks, all rewards, reduced motion, mobile, overview, embedded reading, night mode, saved Normal mode, compact phone buttons, wooden supports, four lining variants, native drag-selection prevention and constant zoom sampled every animation frame during ordinary, overview and manually zoomed journeys.
- `node tools/test-flashcard-range-worlds.cjs`: original quick-selection flow and material behavior, with the map adapter excluded only for this fallback-specific fixture.
- Existing deck-mode, study-interaction, state-integrity and language-edition checks pass.

The shared map unit and browser checks also pass. Desktop, phone, Normal mode and embedded screenshots were visually reviewed. Review screenshots finish transient CSS arrival animations and hide the unrelated page cursor/header so they do not obscure the map. Evidence is in `/Users/sammak/Documents/ChatGPT/Astra/outputs/flashcard-map-refinements-v4/`.

The user explicitly authorized publishing this walkable version on 14 September 2026. Publish by a normal fast-forward push, then verify the Pages workflow, canonical release commit and served file hashes.
