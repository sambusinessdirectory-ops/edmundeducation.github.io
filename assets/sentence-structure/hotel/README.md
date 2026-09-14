# The Grand English Hotel — Sentence Structure 151–180

The user supplied `Sentence Structure.png` and explicitly requested preservation of its design. `reference.png` is the unchanged 1402 × 1122 source. This is a layered illustration with masked animation, not a newly modelled 3D hotel.

## Provenance

- Reference SHA-256: `b4d04892586320689895a5036ab3213c73f83ffc8685e354179760616fb34162`.
- Restoration SHA-256: `87977bc15570800c61b40a83f048766e3df9be65d5091fa5d0d4267e83ca9594`.
- `restoration.png` was produced with the built-in image editor on 2026-09-14. Only local masks are copied from it; the full generated plate is never substituted for the reference.
- Original generated filename: `exec-815d893a-091d-4f3c-9e44-50afdbbe7ca5.png`.
- The user subsequently approved removing the six numbered category labels and six right-wall slogans and changing the van lettering to “The Grand English Hotel”. Three image-editor attempts failed with connection errors. The user explicitly approved matched webpage overlays instead. `HOTEL_LETTERING_REPAIRS` bounds the changes, interpolating surrounding paint rows and rendering the exact van name in three lines. No API/CLI image-generation fallback was used.

### Successful restoration prompt

Use case: precise-object-edit. This is an existing image to edit, NOT an invitation to redesign it. Asset: clean restoration plate for animation of the exact attached hotel. Preserve original camera, crop, 1402:1122 aspect ratio, every architectural shape, all lettering except as specified, ornaments, balconies, fixtures, doors, mountain snow, lighting, color and texture. Make ONLY these localized removals and restorations: (1) remove the bellboy horse character standing at the middle hotel balcony and reconstruct the matching wall/door and railing behind him, including the implied room 11. (2) Remove the small horse portrait and name Eddie INSIDE the top-right companion card, leaving the card frame and heading Your Companion intact and blank space below. (3) Remove ONLY the two pink flag cloths at the very top left and right; keep poles, finials and domes, restore sky behind cloths. (4) Remove ONLY the pink funicular rail car at the upper-right image edge; preserve the incline track and forest, reconstruct the small forest region behind the car. (5) Erase ONLY the two lines '21 ROOMS' and 'ONE BRIGHTER YOU' in the lower-right roadside sign; leave its decorative crest, frame, warm pink plaster, exact outline and all foreground shrubs unchanged. Do not remove any trees, plants, lamps, paintings, luggage, van, doors or furniture. No new objects. No new snow or motion blur. Retain original visual detail and sharpness. The unedited regions must match the input as closely as possible. Return one clean plate at the same composition.

## Implementation

- `sentence-structure-hotel-geometry.mjs`: source coordinates, 21 painted doors containing 30 real lesson IDs, corridors, concealed service passage, vegetation anchors, 35 lights, exterior silhouette and motion functions.
- `sentence-structure-hotel-scenery.mjs`: reference-preserving plate, complete reconstructed funicular, original flag texture cutouts, Canvas snow and WebGL foliage/light/elevator masks. The train runs uphill over 23 seconds and wraps while outside the visible area. Flag roots, plant pots and tree roots remain fixed.
- `sentence-structure-hotel-elevator.mjs`: the supplied bronze elevator reference, fixed shaft rails/landing marks, a moving cabin and the selected companion behind foreground gate bars. A tall feathered oval mixes this scene into the actual wall shader only when the character approaches the lift. The repaired wall returns when the character leaves. A masked Canvas fallback is available without WebGL.
- `sentence-structure-hotel.mjs` and `.css`: live companion, transparent door targets, shared-room choices and exact roadside sign `150 Rooms` / `The Grand English Hotel`.
- The first nine existing rooms each host two lessons, and the remaining twelve host one each. Door artwork/numbers stay as drawn. Real lesson numbers and titles are exposed by the lesson picker, focus/hover and entry card.
- The site has 345 lessons; the map covers 1–180 and the remaining list starts at 181. No exercises, answers, account data or progress were altered by this change.
- Source artwork retains its original resolution; CSS uses a 1600-unit coordinate system. Browser enlargement cannot add source detail.

## Quality gates and lessons learned

1. Audit source pixels outside authorized repair bounds; any difference fails. Review the composited app, not just the restoration asset.
2. A tight character-shaped mask exposed a partial door numeral. Restore the complete small occluded doorway bay, preserving the surrounding architecture.
3. The original funicular was partly hidden by the cliff: extracting its visible silhouette produced half a moving carriage. That was rejected. The complete reconstructed vehicle must be tested independently of the backdrop, with a continuous body and all wheels. Keep the original silhouette only as the old vehicle's removal mask. Inspect emergence, full mid-track visibility, exit and wrap poses, and project the receding side along the existing rails.
4. Do not pack phase data into a canvas alpha channel: canvas premultiplication erased the zero-phase lamp's RGB mask. Upload mask bytes directly into WebGL and verify actual pixels for every lamp.
5. Sample paint inside the decorative panel. Sampling its border created a visible stripe on the former “Food & Drink” panel; use clean interior paint for that panel.
6. Exclude both the complete hotel silhouette and the companion card from snow. Reduced motion freezes the illustration and omits snowfall; unsupported WebGL uses the repaired still plate.
7. Shared door coordinates need selected-lesson-aware arrival resolution; proximity alone incorrectly chooses the first lesson. Saved room/companion state remains scoped per account.
8. A short final realm at overview zoom needs enough camera space to align its top without exposing the previous realm. Mobile views may pan within the map; the page must not overflow.

## Reproducible validation

Run the existing coast, realms, zen, dream and toy Node tests plus `tools/test-sentence-structure-hotel.mjs`, `tools/test-sentence-structure-system.mjs` and `tools/test-common-expression-map.mjs`. The route test covers all 32,400 ordered pairs for the 180 mapped lessons.

`tools/test-sentence-structure-hotel-browser.cjs` runs the actual application with local fixture accounts and blocks external services. It opens every new lesson, checks paired room selection, account ownership, all 14 potted plants/18 exterior trees/35 lights/two flags, exterior snow, stationary walls/pot bases, reduced motion, map pause and desktop/tablet/phone layouts. `tools/test-sentence-structure-hotel-art.cjs` checks source fidelity, seven train poses and graphics fallback. Set `MAP_TEST_ARTIFACTS` to the desired evidence directory. A local browser/server is required.

Publish through the existing Pages workflow, retaining other contributors' changes with a normal fast-forward push; verify the workflow and canonical `release.json` plus changed asset hashes after publication.

## Revision 2 — complete vehicle, stronger foliage and visible elevator

The user requested these refinements on 2026-09-14 after viewing the first release: complete the half-hidden funicular, make tree motion moderately visible, reveal a working elevator through a vertically elongated oval in the left wall, remove the upper-left phrase and add a fog boundary between the toy and hotel realms.

- `funicular-complete.png` is a new 1536 × 1024 full-vehicle image produced by the built-in image editor. The first output painted a checkerboard instead of a genuine alpha channel. A second precise edit replaced only that backdrop with chroma green. The browser computes clean alpha, including between wheels, with edge despill. The complete body is preserved; its receding side is projected to the track. SHA-256: `783887de9a964fb8320acf0f6081fa6a3d8ffdeb3f14c271ca9c1a6cc6e6c3c6`.
- `elevator-reference.png` is the user's supplied 274 × 585 screenshot, unmodified on disk. The renderer omits its 54-pixel top capture margin. SHA-256: `5eafb290f3a6af863ea53afc11cc689c3fb360315954e5ed6e0814cd3ba53191`.
- The shaft now sits at source x = 225, centered in the existing pink panels. The 160 × 288 reveal follows the cabin vertically. The oval is feathered by the fragment shader, while the shaft remains fixed in hotel coordinates. Boarding opens the foreground gate; the passenger and cabin share their floor coordinate. Hotel journeys use 220 world units/second, capped at 9.5 seconds, so the ride is visible. Other map themes retain their prior travel timing.
- Foliage masks retain fixed bases, with broader canopy coverage, staggered main sway and a smaller secondary gust. Native pixel tracking across five phases measured 7 pixels peak-to-peak on an exterior pine and 3 on a potted entrance tree. Animated-pixel checks still cover all 18 exterior trees and 14 potted plants.
- The approved paint-overlay method removes only the upper-left dark lettering and underline, preserving the sky texture. The initial full rectangular interpolation produced a flat patch; a local diffusion fill restricted to the lettering and its antialiasing corrected it without flattening the sky.
- The toy/hotel seam has a warm 160-unit fog layer with restrained drifting mist. It is decorative and never intercepts navigation. Reduced motion freezes the fog and vegetation. All 32,400 ordered routes were rechecked after moving the shaft.
- Full-vehicle alpha comparison at the exposed track pose is 100%; start, end and wrap poses contain no visible carriage. A painted checkerboard, changed transform value or shifting hash alone is not proof of a complete or visibly moving object.

### Full-carriage prompt (built-in image editor)

Use case: background-extraction / precise-object-edit. Reference image: a cropped, partly occluded pink Alpine funicular at the Grand English Hotel. Create ONE complete, isolated funicular carriage matching that exact dusty pink painted vehicle, detailed period windows, dark undercarriage, rail wheels, trim and softly shaded curved roof. Reconstruct the ENTIRE missing right/rear section instead of keeping the tree-shaped diagonal cutout. All four body corners, the full continuous bottom edge, roof, both ends, windows and full undercarriage must be visible. No cropped or occluded parts. Keep the same three-quarter view: the left end is closest to the viewer and the long right side recedes gently to the right/up. The vehicle is a small elegant vintage alpine cable railway car, not a locomotive. Its bottom follows a gently uphill-right railway perspective, but the cabin remains upright. Preserve the pink, ivory, charcoal and burgundy palette and the reference's finely detailed painted cinematic style. Transparent background with genuine alpha. No rails, trees, scenery, snow, words, text or drop shadow. Center the full carriage with clear transparent margins on every side. It will be animated independently over the existing hotel artwork. Output a sharp detailed landscape cutout.

### Corrective matte prompt (built-in image editor)

Edit target: the just generated full pink funicular carriage. Preserve the complete carriage absolutely unchanged, including every edge, window, roof, wheel, reflection and color. Remove ONLY the gray checkerboard backdrop. Replace the entire backdrop, including gaps under and between wheels, with ONE perfectly uniform flat pure chroma green (#00FF00). No shadow, no gradient, no texture and no checkerboard. The carriage itself must not become green. Keep the same resolution, composition and clear margins. This is a technical color-key asset for a browser renderer; the flat green background will be made transparent by code.
