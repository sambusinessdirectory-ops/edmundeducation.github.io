# Rhetorical Speaking — Mediterranean coast

This theme uses the shared Common Expression map engine. The live catalogue supplies 29 lessons; no titles, totals or completion records come from the visual reference. All lessons remain open. Map exploration does not count as lesson study time or completion.

## Asset layers

- `background.webp`: fixed coastal village, sea, terraces and meadow surface.
- `plants.webp`: transparent olive, cypress, lavender, shrub, grass and terracotta-pot artwork.
- `props.webp`: transparent limestone/mosaic stone, sailboat, lavender floret, olive leaf and milestone artwork.
- `clouds-v2.webp`: three separately painted cloud silhouettes: a long bank, a compact cluster and a wispy pair.
- `ARTWORK-PROMPTS.txt`: prompts used with the built-in image generation tool. The background used the supplied Mediterranean reference; other assets were generated as separate layers.

Masters are retained in `outputs/rhetorical-coast-assets` in the task workspace. Production exports are WebP, approximately 1.5 MB combined. No bitmap re-editing is needed for placement: `common-expression-coast.mjs` stores the actual source rectangles, and every SVG image has its own explicit clip. This matters because the generated atlas does not precisely follow its requested regular grid; a guessed grid exposes neighbouring sprite fragments.

## Interaction and animation

The shared engine owns walking and idle horse animation, arrival cards, keyboard/drag/touch controls, zoom limits, companion choice, progress and the single saved location. `common-expression-coast.mjs` supplies artwork, placement, the sea boundary and the flag decoration. `common-expression-coast.css` supplies the visual treatment and ambient motion.

The first terrace begins at world Y=575. The accessible rectangle starts at Y=550, below the sea/village plate, so both direct journeys and keyboard movement stay on dry ground. Scene changes must re-check the shoreline against these bounds. The optional `cameraTop` theme hook shows the panorama at the first terrace on taller viewports; smaller screens retain room below the horse for the lesson card. Other themes retain their previous camera behaviour.

Every foliage layer has varied timing, phase and direction, with its HTML wrapper pivoting at the roots. Trees sway up to 2.4 degrees, bushes up to 3.7 degrees and grass up to 5.2 degrees over 4.2–6.9 seconds, so the motion is visible at the displayed size. Plants occupy small irregular beds; collision guards exclude lesson labels, painted walls and foreground rocks. Pots sit only at the three village entrance coordinates and stay fixed while their foliage sways.

Three boats travel 128 world pixels over 49–62 seconds, with small wakes and rocking. Three distinct clouds travel 96 pixels over 60–76 seconds, with explicitly opposed directions. The ocean uses a clipped translucent texture movement plus short wave highlights; the mask excludes the island, village and bank. Seven small lavender/olive particles cross the visible viewport. Hidden scenes pause; simply losing keyboard/window focus does not freeze a visible map. Reduced-motion settings stop decoration while lesson controls remain usable.

Milestones use the real lesson order at 10 and 20. The single brass-tipped, swallowtail flag keeps Eddie red, Phoebe lavender and Elsie yellow. The shared preference key is `edmund-lesson-map-v1:rhetorical-speaking:<account>`; it does not overwrite Speaking or Writing preferences.

## Verification and release

Run `node --test tools/test-common-expression-system.mjs tools/test-common-expression-map.mjs tools/test-common-expression-garden.mjs tools/test-common-expression-coast.mjs`.

Run `MAP_TEST_SYSTEM=rhetorical-speaking node tools/test-common-expression-map-browser.cjs`, then the same browser fixture for `speaking` and `written` when changing shared logic. Fixtures use isolated local accounts and block external student services. The coast fixture checks animation movement, rooted pots, water rejection, reduced motion, pause, all three flag colours, saved-location/account isolation, all 29 lesson links, touch panning, resizing and zoom limits. The motion check samples over several seconds, requires at least six screen pixels of boat travel, verifies opposite cloud directions and measures perceptible canopy-tip movement for every plant family. Inspect its desktop, milestone, tablet, phone and paired motion PNGs as well as test results.

Publish through the existing GitHub Pages workflow and verify the deployed release SHA plus the new theme files and all four WebP assets. Keep application/module/CSS query versions in sync when changing cached files.
