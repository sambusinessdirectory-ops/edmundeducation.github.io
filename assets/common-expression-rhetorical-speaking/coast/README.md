# Rhetorical Speaking — Mediterranean coast

This theme uses the shared Common Expression map engine. The live catalogue supplies 29 lessons; no titles, totals or completion records come from the visual reference. All lessons remain open. Map exploration does not count as lesson study time or completion.

## Asset layers

- `background.webp`: fixed coastal village, sea, terraces and meadow surface.
- `plants.webp`: transparent olive, cypress, lavender, shrub, grass and terracotta-pot artwork.
- `props.webp`: transparent limestone/mosaic stone, sailboat, cloud, lavender floret, olive leaf and milestone artwork.
- `ARTWORK-PROMPTS.txt`: prompts used with the built-in image generation tool. The background used the supplied Mediterranean reference; other assets were generated as separate layers.

Masters are retained in `outputs/rhetorical-coast-assets` in the task workspace. Production exports are WebP, approximately 1.2 MB combined. No bitmap re-editing is needed for placement: `common-expression-coast.mjs` stores the actual source rectangles, and every SVG image has its own explicit clip. This matters because the generated atlas does not precisely follow its requested regular grid; a guessed grid exposes neighbouring sprite fragments.

## Interaction and animation

The shared engine owns walking and idle horse animation, arrival cards, keyboard/drag/touch controls, zoom limits, companion choice, progress and the single saved location. `common-expression-coast.mjs` supplies artwork, placement, the sea boundary and the flag decoration. `common-expression-coast.css` supplies the visual treatment and ambient motion.

The first terrace begins at world Y=575. The accessible rectangle starts at Y=550, below the sea/village plate, so both direct journeys and keyboard movement stay on dry ground. Scene changes must re-check the shoreline against these bounds. The optional `cameraTop` theme hook shows the panorama at the first terrace on taller viewports; smaller screens retain room below the horse for the lesson card. Other themes retain their previous camera behaviour.

Every separate foliage layer has deterministic, varied timing, phase and direction. Rotation is below 1.7 degrees and pivots at the roots. Potted foliage moves independently of its grounded pot. Three boats travel just 48 world pixels over 110–140 seconds; three clouds drift 56 pixels over 95–118 seconds. Seven small lavender/olive particles cross the visible viewport rather than only the top of the world. Hidden scenes pause. Reduced-motion settings remove falling particles and stop decorative movement while keeping lesson controls available.

Milestones use the real lesson order at 10 and 20. The single brass-tipped, swallowtail flag keeps Eddie red, Phoebe lavender and Elsie yellow. The shared preference key is `edmund-lesson-map-v1:rhetorical-speaking:<account>`; it does not overwrite Speaking or Writing preferences.

## Verification and release

Run `node --test tools/test-common-expression-system.mjs tools/test-common-expression-map.mjs tools/test-common-expression-garden.mjs tools/test-common-expression-coast.mjs`.

Run `MAP_TEST_SYSTEM=rhetorical-speaking node tools/test-common-expression-map-browser.cjs`, then the same browser fixture for `speaking` and `written` when changing shared logic. Fixtures use isolated local accounts and block external student services. The coast fixture checks animation movement, rooted pots, water rejection, reduced motion, pause, all three flag colours, saved-location/account isolation, all 29 lesson links, touch panning, resizing and zoom limits. Inspect its desktop, milestone, tablet and phone PNGs as well as test results.

Publish through the existing GitHub Pages workflow and verify the deployed release SHA plus the new theme files and all three WebP assets. Keep application/module/CSS query versions in sync when changing cached files.
