# Golden Horsey trophies

A golden Eddie reward for finishing all 50 questions in a Sentence Structure module. The smiling horse, waving hoof, swept mane, handled star cup and stepped gold pedestal follow the user's Eddie reference.

- `golden-eddie-v1.webp`: front view for the completion screen, trophy collection, lesson list and the front-facing hotel. Built-in original: `exec-73af1528-dcd8-4a93-b60c-7e98f26e9687.png`. Genuine generated alpha, resized to 720 × 720 with 24 px transparent padding on all sides.
- `golden-eddie-map-v2.webp`: elevated straight-south view for the outdoor map platforms, with a level horizontal front edge and centered plaque. The original diagonally turned `golden-eddie-map-v1.webp` is retained for provenance. The camera looks down approximately 45 degrees, exposing the mane, cup interior and upper face of the pedestal. The asset sits on the existing platform; module numbers remain readable in front.
- Both sprites are 768 × 768 WebP at quality 93 and alpha quality 100. They are layered artwork, not live 3D models.
- Exact primary prompts and generation provenance: `prompts-v1.json` and the south-facing correction in `prompts-v2.json`. The built-in image tool produced both views. The map view and transparency edit returned a painted checkerboard, so the built-in editor replaced only that background with solid blue. `tools/build-golden-eddie-map.cjs` converts the keyed backdrop and edge spill to alpha; it does not reshape the sculpture.

The current student's existing attempts determine all awards. An eligible module has exactly 50 distinct question IDs. A completed attempt must have correctCount 50 and totalCount 50; when correct IDs are present, all 50 current questions must be represented uniquely. Legacy completed records without IDs use their validated counts. Separate partial attempts never combine into an award. No new reward database or local-storage progress is introduced.

The dashboard collection includes every eligible module, including lessons 181–345 beyond the map. An earned trophy remains when a new practice attempt begins. All 180 map destinations retain their routes and native lesson actions. Paired hotel modules show their own statues at the shared door, with the front-view sprite matching the hotel's perspective.

Validation: `tools/test-sentence-structure-trophies.mjs` checks thresholds, unique IDs, legacy completions, partial attempts and all 345 modules. `tools/test-sentence-structure-trophies-browser.cjs` submits a real fixture's 50th answer, verifies saved-attempt restoration, prior awards, owner isolation, the collection, map placement, paired hotel visibility, list mode and phone layout. All external services are mocked or blocked. The existing 39 Sentence Structure system checks and coast/realm/hotel checks also pass.

Source originals and review evidence: `/Users/sammak/Documents/ChatGPT/Astra/outputs/golden-horsey-trophy/`.


Trophies have ten larger star/mote particles with longer bright phases, a small edge glow, and a left-to-right sheen every 5.8 seconds. The sheen is masked by the exact sprite alpha, so it never draws a rectangle across the background. Silver uses a live grayscale/brightness finish on the same gold artwork, with cool white reflections and particles; no additional raster asset is required. Effects pause with the map or closed collection, and moving effects disappear under reduced-motion preferences.

The upper-left map header shows Eddie with the current student’s earned / available trophy count. Both numbers come from the same current eligible catalogue as the collection (345 modules today); repeated completions count once. Clicking the counter opens the collection. The browser fixture verifies updates after earning, saved normal-mode restoration, account switching, and desktop/phone header layouts.

Silver is awarded when one attempt reaches at least 25 distinct correct answers in an eligible 50-question module. The existing full-completion rule upgrades it to gold; later practice never downgrades the highest earned tier. Separate partial attempts do not pool. Gold counts remain completion counts; the collection also reports its silver total.

The map's hide/show button stores only a display preference, scoped to the current student in browser local storage. Trophies and their effects disappear together, while platform numbers and navigation remain usable. Existing attempts are never changed by hiding or interacting.

Map trophies are independent buttons beside the original platform buttons. Pointer or keyboard activation starts a 1.3-second rise, alternating wiggles and landing, without forwarding the click to map navigation. Collection and completion trophies support the same interaction. Browser checks cover silver thresholds/promotion, masked sheen movement, stronger particles, landing, keyboard activation, route isolation, hiding and reload/account preference isolation.
