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
- `sentence-structure-hotel-scenery.mjs`: reference-preserving plate, original train/flag texture cutouts, Canvas snow and WebGL foliage/light masks. The train runs uphill over 23 seconds and wraps while outside the visible area. Flag roots, plant pots and tree roots remain fixed.
- `sentence-structure-hotel.mjs` and `.css`: live companion, transparent door targets, shared-room choices and exact roadside sign `150 Rooms` / `The Grand English Hotel`.
- The first nine existing rooms each host two lessons, and the remaining twelve host one each. Door artwork/numbers stay as drawn. Real lesson numbers and titles are exposed by the lesson picker, focus/hover and entry card.
- The site has 345 lessons; the map covers 1–180 and the remaining list starts at 181. No exercises, answers, account data or progress were altered by this change.
- Source artwork retains its original resolution; CSS uses a 1600-unit coordinate system. Browser enlargement cannot add source detail.

## Quality gates and lessons learned

1. Audit source pixels outside authorized repair bounds; any difference fails. Review the composited app, not just the restoration asset.
2. A tight character-shaped mask exposed a partial door numeral. Restore the complete small occluded doorway bay, preserving the surrounding architecture.
3. Keep the train mask on its original silhouette and undercarriage, preserving adjoining rails and avoiding a moving forest wedge. Inspect emergence, mid-slope, exit and wrap poses.
4. Do not pack phase data into a canvas alpha channel: canvas premultiplication erased the zero-phase lamp's RGB mask. Upload mask bytes directly into WebGL and verify actual pixels for every lamp.
5. Sample paint inside the decorative panel. Sampling its border created a visible stripe on the former “Food & Drink” panel; use clean interior paint for that panel.
6. Exclude both the complete hotel silhouette and the companion card from snow. Reduced motion freezes the illustration and omits snowfall; unsupported WebGL uses the repaired still plate.
7. Shared door coordinates need selected-lesson-aware arrival resolution; proximity alone incorrectly chooses the first lesson. Saved room/companion state remains scoped per account.
8. A short final realm at overview zoom needs enough camera space to align its top without exposing the previous realm. Mobile views may pan within the map; the page must not overflow.

## Reproducible validation

Run the existing coast, realms, zen, dream and toy Node tests plus `tools/test-sentence-structure-hotel.mjs`, `tools/test-sentence-structure-system.mjs` and `tools/test-common-expression-map.mjs`. The route test covers all 32,400 ordered pairs for the 180 mapped lessons.

`tools/test-sentence-structure-hotel-browser.cjs` runs the actual application with local fixture accounts and blocks external services. It opens every new lesson, checks paired room selection, account ownership, all 14 potted plants/18 exterior trees/35 lights/two flags, exterior snow, stationary walls/pot bases, reduced motion, map pause and desktop/tablet/phone layouts. `tools/test-sentence-structure-hotel-art.cjs` checks source fidelity, seven train poses and graphics fallback. Set `MAP_TEST_ARTIFACTS` to the desired evidence directory. A local browser/server is required.

Publish through the existing Pages workflow, retaining other contributors' changes with a normal fast-forward push; verify the workflow and canonical `release.json` plus changed asset hashes after publication.
