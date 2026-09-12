# Sentence Structure — The Sentence Shore

This theme maps the first **30** entries in the real Sentence Structure catalogue.
The remaining **315** entries (31–345) continue below as the original lesson list.
The first thirty also have a list option. Search still covers the entire course;
bookmarks, lesson pages, answer checking, progress and study time use the existing
Sentence Structure implementation.

## Artwork and interaction

`sentence-structure-map.mjs` adapts catalogue titles and question references without
downloading the full exercises. Short stone captions identify each construction;
the arrival card and accessibility labels retain the full title. Map counters use
the best recorded correct count for that lesson, capped at its question count.
Exploration and location flags do not create learning records or study time.

`sentence-structure-coast.mjs` supplies the scene and animation layers. The shared
map supplies Eddie/Phoebe/Elsie, walking, idle movement, arrival cards, drag/touch
panning, keyboard controls and bounded zoom. A 3200 × 1950 painted surround adds
800 world pixels beyond each side of the original lesson area. Students can zoom
out to half the normal scale, subject to a responsive floor that keeps the entire
viewport covered by scenery. The original 1600 × 1950 lesson coordinates, stream
boundaries and saved stone IDs remain unchanged. A driftwood flag with a scallop
emblem preserves Eddie red, Phoebe
lavender and Elsie yellow. There is one saved stone per account for this system,
stored in this browser at `edmund-lesson-map-v1:sentence-structure:<account>`.
Walking to a different stone does not overwrite that saved location. This is not
cross-device storage.

The first thirty sit on sea-glass and shell sandstone platforms. Their connecting
route is a textured sand trail, with a wooden bridge across the western stream.
The painting includes a second, central footbridge. Markers identify 10, 20 and 30.
Scene coordinates are 1600 × 1950; row heights deliberately follow clear grass
above and below the stream instead of imposing equal spacing over the artwork.

`sentence-structure-coast-navigation.mjs` traces the sea limit and central stream
bank. Click destinations in water are rejected. A visibility graph routes longer
journeys over a bridge or around the eastern bank. Keyboard steps test the entire
segment, with axis sliding at a bank. Both bridge decks have explicit hoof-space
bounds. Recheck these outlines after any background or bridge placement change.

## Gentle motion

- Three distinct cloud shapes drift at different phases and speeds, including
  opposing directions. They reuse the approved coastal cloud artwork.
- The sailboat travels 170 world pixels in 68 seconds, with a small wake and a
  separate 9-second rocking cycle.
- Two flying gulls glide at different depths and speeds. Painted wing parts
  articulate continuously around their shoulder anchors on every animation frame.
  Each canvas is cleared before drawing; poses never dissolve or leave trails.
- The perched gull has a registered foot anchor, gentle body sway, a blink every
  5.9 seconds and a 3.8-second wing stretch every 12.4 seconds. Its first stretch
  begins after 1.2 seconds, so the movement is noticeable without a long wait.
- The stationary crab independently lifts its painted claws on 8.7- and
  10.3-second cycles and gently rocks. Its first gesture begins after 0.8 seconds;
  its placement stays on the same rock.
- Independent water masks contain ocean shimmer, stream flow and fine moving
  highlights. Foam pulses beside the rocks. Land, cliffs and the island stay still.
- Grass, daisies and flowering coastal shrubs have varied root-pivot sway,
  amplitude, timing and direction. Placement guards protect stones and captions;
  plants occupy coastal beds, with no pots scattered on wild land.

Canvas wildlife uses the shared scene clock. All decorative CSS is paused by the
shared `data-animating` lifecycle. Hiding the map, moving it offscreen or hiding
the document pauses animation; losing keyboard focus alone does not. Reduced
motion stops decoration and makes travel immediate while retaining water bounds.

The articulation implementation is `sentence-structure-shore-wildlife.mjs`.
Atlas polygons are explicit. Review a contact sheet of intermediate frames after
changing them: no static feather fragments may remain around a moving wing.
Browser checks compare actual canvas pixel hashes as well as gesture state, so
changing an animation attribute without repainting cannot pass verification.

## Source assets

The user's coastal illustration is a style/composition reference. No reference
lesson text, progress, horse or interface is baked into the background. Generated
masters and prompts are retained in the task workspace at
`outputs/sentence-coast-assets/`. Production assets are WebP. Atlas rectangles and
animal anchors are explicit; do not assume a generated sheet follows an exact grid.
Every SVG crop has a unique clip path to prevent adjacent-sprite leakage.

The generated sprite masters included a baked checkerboard. With the user's
explicit approval, local macOS Vision masks removed it, with a further alpha-only
refinement inside the boat rigging. Grey feathers and white petals retain their
painted detail. Original RGB channels and all sprite coordinates are unchanged in
the transparent PNG masters; WebP exports preserve alpha for the website. Cleanup
sources and dark/green verification composites are in the masters' `work/` folder.

## Checks and release

Run:

```sh
node --test tools/test-sentence-structure-system.mjs tools/test-sentence-structure-coast.mjs
node --test tools/test-common-expression-system.mjs tools/test-common-expression-map.mjs tools/test-common-expression-garden.mjs tools/test-common-expression-coast.mjs
node tools/test-sentence-structure-coast-browser.cjs
MAP_TEST_SYSTEM=speaking node tools/test-common-expression-map-browser.cjs
```

Browser fixtures use local fake accounts and block external student services.
Checks cover all 30 links, the 315-entry continuation list, progress, flag colours,
account isolation, reduced motion, visible ambient motion, zoom and responsive
layouts. Navigation tests sample all 900 pairs of stones and both bridge crossings.
Inspect screenshots at desktop, tablet and phone sizes, including the stream and
wildlife. Verify genuine alpha in transparent sprites before release. The existing
GitHub Pages workflow includes the new navigation and catalogue-adapter tests.

Deploy through the existing website workflow only after asset and browser review;
then verify the canonical page, release SHA and each new module/CSS/WebP asset.
