# Moonlit Caravan — Phrasal Verb lessons 31–60

The second chapter extends the approved day oasis (1–30) in one shared map. Quick chapter buttons select the first real lesson in each region. The same companion, account-scoped saved location and learning progress work across all 60 stops. Original lesson cards continue from 61 through 329. This change adds no learning data writes or runtime dependencies.

## Artwork

`background.webp` is a 1239 × 1270 built-in ImageGen painting, exported at WebP quality 91 and displayed at 1600 × 1640 world units. It follows the user's attached moonlit desert reference: indigo sky, broad amber dunes, a distant oasis settlement, camel caravan, tents and lanterns. The art deliberately leaves the sky and plant beds available for animation layers. No blurred padding or extended edge fill is rendered.

The generated master and exact prompt are archived under `outputs/phrasal-night-map` in the task workspace. The reference file path was unavailable on disk; the successful generation used the attached conversation image through the built-in tool. No programmatic repainting, matte extraction or compositing was used on the background.

The approved `../desert/painted-plants.webp` provides 24 calm, shaded planted groups. Their bases stay anchored while broad leaves sway with varied phases. The two small rolling tumbleweeds reuse the existing atlas and rotate according to distance travelled. One crosses the local 10–20 band at y ≈ 820, the other the local 20–30 band at y ≈ 1360, in opposite directions. These are separate from the retained two day-section weeds.

The crescent moon, stars, light blooms, route and raised gold platforms are native SVG. Stars twinkle at different intervals; the moon holds still, then gently tilts +8° and −7° during a 22-second cycle. Thirteen registered lantern/window lights pulse in opacity and radius, with small warm ground pools around near lanterns. The narrow oasis has a registered clipped surface shift and sparse ripples. Static tents, camels and land do not move. Reduced motion freezes decoration; the shared map animation owner pauses when inactive, and the night chapter pauses when offscreen.

## Navigation and framing

The night chapter starts at y = 1770 and ends at y = 3410, below the untouched 1635-unit day landscape and a 135-unit chapter divider. Its 30 real lessons use five winding rows; the final two stops end in open sand. Broad gold trail strokes and coin platforms provide a distinct nighttime theme without granular ornament.

Walking is free on dry land. A shared visibility graph avoids the three day ponds and the registered night pond; keyboard movement applies the same shore margin. Overview fits the current chapter's complete artwork in a plain frame and docks the arrival card below it. Chapter changes retain overview when it is active. Standard zoom supports panning and readable lesson controls.

## Verification

- `node --test tools/test-phrasal-night.mjs`: real first-60 identities and original question references; unchanged first-30 positions; all 3,600 ordered dry routes; direct night walking; all four ponds; chapter framing bounds; opposing weed motion and requested bands; plant/caption clearance.
- `node --test tools/test-phrasal-desert.mjs tools/test-common-expression-map.mjs tools/test-phrasal-verb-system.mjs`: existing day layout, walking, completion, shared preferences and host lesson contracts.
- `node tools/test-phrasal-desert-browser.cjs`: all 60 lesson entries, 269 continuation cards, actual rendered movement and stationary landmarks, stars, moon, light bloom, all planted groups, two night tumbleweeds, free walking, chapter travel, shared pins, reduced motion and desktop/tablet/phone framing.
- `node tools/test-common-expression-map-browser.cjs`: regression of the shared default map camera, entry, progress and navigation behavior.

Browser tests use local fixture accounts with external student requests blocked. They do not exercise a real authenticated student session or physical Safari hardware. GitHub Pages deployment and canonical asset hashes are verified separately before reporting the work live.
