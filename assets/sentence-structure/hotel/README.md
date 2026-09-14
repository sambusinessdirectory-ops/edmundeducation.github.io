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


## Revision 3 — September 14 video corrections

The user's 20.83-second recording exposed problems that the earlier animated-pixel checks did not catch: the funicular lost rail contact and flickered, trees rippled internally, manual panning exposed a flat pink gutter, and boundary fog faded the companion heading. These replace the relevant rendering details described in Revision 2.

### Funicular

The previous slope of −0.55 did not match the painted rails. The nearest rail was digitised at source (1260,316) and (1380,263.2), giving −0.44. The vehicle's nearest front-wheel contact is the anchor; both the rear-wheel projection and all translation follow this same line. The carriage retains the complete generated source asset. Its front and side are projected once using two affine faces into a 448×400 premultiplied-alpha canvas displayed at 112×100 source units. No one-pixel strips are redrawn during travel.

In the live map, this prepared canvas is a separate compositor layer with a 23-second linear Web Animation. Its source pixels are never cleared or redrawn while travelling. An SVG clip retains the original hotel occlusion and outside-image exit. Scenery repaints cannot blank the carriage. Reduced motion pauses at the fully visible 11.8-second pose. The Canvas-only deterministic test path draws the same prepared sprite with the same rail anchor.

### Vegetation

`sentence-structure-hotel-vegetation.mjs` replaces per-pixel UV distortion with original-art canopy cutouts. Each cutout rotates about one fixed root, using a constant phase for the entire object so that branches and snow move together. The 18 exterior trees and 14 potted plants retain the original source detail. Tree, plant, rail, viaduct, lamp, hotel and sign masks keep foreground objects fixed. Plant root cuts stop at the pot rim and clip moving foliage above the base.

`vegetation-clean.png` is the clean background beneath moving canopies. Only masked areas use it; it is never used as the complete scene. It was generated by the built-in image editor, from the unchanged reference, on September 14. Original generated file: `exec-9be9ed4a-c42d-41ca-84a1-238243d4c448.png`. SHA-256: `3e2073475840c15de5139015b0fb59017981a1f49bb23e14c98ce480ebb3c0bc`.

The initial hard canopy masks revealed bright straight outlines when they moved. Feathering the matte edges removed those seams. A browser check then detected changes at a pot base; locating roots at the actual rims and clipping below them corrected that regression. Source rectangles, transform changes and arbitrary pixel hashes alone are insufficient evidence of natural animation.

### Camera and fog

Horizontal manual panning is bounded by the hotel artwork whenever it is visible, even when the selected lesson is still on the toy map. An overview narrower than the viewport remains centred. The preceding realms retain their original camera padding.

The fog is now 100 world units high instead of 160, with lower opacity and a narrower blur. The original companion frame and heading are copied into an opaque, aligned canvas above the fog, with the live companion above that. This preserves the heading exactly while mist crosses the map seam.

### Verification

- Source plate checks keep 1,463,808 pixels outside the existing repair bounds identical.
- The real app fixture opens all 30 hotel lessons, exercises paired rooms, account-scoped preferences, both elevator ride directions, every tree/plant/lamp/flag, exterior-only snow and reduced motion.
- `tools/test-sentence-structure-hotel-motion.cjs` records a loop and second emergence, asserts zero vehicle repaints and unchanged sprite pixels, checks continuous translation on the rail slope, and verifies the reduced-motion pose. The reviewed run collected 1,433 frames; median scenery interval 16.7 ms, 95th percentile 33.4 ms in headless Chromium while recording. This is a local measurement, not a guarantee for every device.
- Fog regression compares actual screenshots of the companion heading with fog opacity zero and one. Edge checks attempt panning beyond both image edges on phone and tablet.
- Review normal-size video and close-up frames; do not accept a passing movement hash as a substitute for visible rail contact, complete silhouettes, fixed roots or steady opacity.

### Background-plate prompt (built-in image editor)

Use case: precise-object-edit. Edit target: the supplied 1402x1122 hotel scene. Asset purpose: a CLEAN BACKGROUND PLATE beneath moving vegetation in a web animation. Keep the same composition, perspective, exact hotel architecture and every non-vegetation object. Remove ALL trees and plants, including the tall snowy evergreen trees on both outer sides of the hotel, the distant conifers in front of the mountains, all the potted leafy plants inside the six hotel corridors, the four potted evergreen trees on the front stair pillars, and the small evergreen trees and bushes across the bottom. Fill the removed areas naturally with the rocky snowy cliff, mountains, walls, rails and ground that would be behind them. Empty pots remain in place, with their exact pots and bases and shadows retained. All hotel walls, gold rails, bridge viaducts, the train and elevated track, the lamp posts, road sign, van, front stairs, and doors stay exactly fixed and unchanged. Do NOT add plants, trees, other objects or change architecture. This background will only be used inside small exposed areas under the original vegetation, so matching rock and wall colors and light exactly is essential. Output full image, same aspect ratio and framing, no crop, no labels.
