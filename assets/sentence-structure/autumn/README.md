# Sentence Structure: autumn woodland, lessons 31–60

Approved coastal interaction and animation workflow, extended on 12 September 2026.

## Scope and integration

The existing coast is lessons 1–30. Woodland is 31–60; lessons 61–345 remain the lesson list. `sentence-structure-realms.mjs` composes both themes inside one map, using the real catalogue IDs and existing progress, arrival card and lesson-opening callbacks. It does not create learning attempts or change exercises.

The same account/system preference holds one saved stone across both realms. Eddie's flag remains red, Phoebe's lavender and Elsie's yellow. An autumn leaf decorates the flag when pinned to a woodland stone. Preferences retain the existing browser-local persistence model; this change does not add cross-device storage. A deferred camera-centering check handles hosts that restore the account before showing the dashboard.

## Artwork and coordinates

| File | Source dimensions | Use |
| --- | --- | --- |
| `background.webp` | 1606 × 979 | Continuous wide autumn forest with two bridges, a river and one lit cottage |
| `rabbit.webp` | 1254 × 1254, RGBA | Painted body, two articulated ears and blinking eyes |
| `stone.webp` | 1611 × 976, RGBA | Bark-edged wooden stepping platform with a clear number area |

The background displays at 3200 × 1950 world units. The playable center is 1600 units wide, with 800 units of painted scenery on each side. Autumn starts at global Y 1950; the complete world is 3900 high. Original coastal stone positions are unchanged. Woodland row baselines are local Y 520, 1010, 1250, 1490 and 1710, with seven positions per serpentine row. Keep the background proportions, masks and navigation coordinates synchronized when changing the illustration.

The rabbit's feet remain anchored near the upper-left forest clearing. The cottage is in the upper-right part of the central gameplay area, so its warm windows are visible at normal zoom. The masters and exact image-generation prompts were retained with the task's local artwork output; prompts are also in `ARTWORK-PROMPTS.md`. Production encoding preserved genuine alpha on rabbit and platform, without a painted checkerboard.

## Motion recipe

Use the shared map animation clock. Clear the rabbit canvas before every frame, paint rotated ear cutouts and then the body, and compress each eye locally for the blink. Do not fade several whole rabbit poses over one another. Ear pivots on the source are (649, 415) and (794, 387); the foot anchor is (649, 1166). Maximum ear rotations are 0.13 and 0.10 radians, with different gesture periods. Blinks last 0.34 seconds in a 5.6-second cycle. Body rocking stays below 0.009 radians.

River motion uses a masked copy of the actual painted water plus slow downstream current strokes. The mask excludes both bridges and prominent rocks. The near river and distant brook each have a flow layer. Far fog layers use different 46–62-second drifts. Circular radial window blooms breathe over approximately 8–10 seconds with restrained opacity and scale. Ten small copper/ochre leaves fall over 19–28 seconds, with varied phase, size and drift. Clip those leaves to the visible woodland portion, so they do not fall over the coastal scene.

Pause animation when the map is hidden or offscreen. Respect reduced motion: retain the scene and interaction, stop ambient CSS animation and draw a resting rabbit. Do not use intervals or create an additional perpetual animation loop.

## Paths, water and the realm border

The woodland trail is warm, textured earth; platforms are cut wood with bark and moss, and milestones 40/50/60 are small wooden signs. The trail crosses the existing painted bridge between 37 and 38 instead of painting a road across the river.

`sentence-structure-realms-navigation.mjs` owns hoof-space collision and route checks. Autumn bridge corridors are local X 113–205 and 1004–1099. The river and distant brook reject water destinations; keyboard movement slides along banks and selected routes use bridges. Update collision geometry with any future artwork relocation.

A curved trail continues from 30 to 31. A wide line of overlapping, gently drifting mist conceals the scene join around global Y 1950. The cloud border has no collision or pointer interception. It is decorative: students can walk through it in either direction, including away from the drawn trail.

Both realms have a 0.5× minimum overview with painted side extensions. Camera bounds prevent scrolling past the painted world. Lesson captions and arrival cards remain readable DOM text, separate from the scenery.

## Verification and release

- Unit checks cover all 3,600 ordered stone-to-stone routes, original coastal coordinates, river rejection, both bridge corridors, penetrable mist, one saved pin and lesson-list continuation at 61.
- The autumn browser fixture verifies real rabbit pixel changes and independently samples brief blinks at display cadence. It measures river flow, downstream strokes, fog, window bloom and leaves, then exercises both travel directions through the border with the selector and keyboard.
- Restore a woodland pin after logout/login and between two isolated fixture accounts. Open lesson 60 through its arrival card; verify that progress changes only through the existing learning workflow.
- Review normal and overview screenshots on desktop, tablet and phone. Check painted coverage, the cottage, rabbit joints, label clearance, cloud join and bridge alignment. Re-run the coastal and shared-map browser regressions whenever shared map logic changes.
- Publish the tested commit through the existing Pages workflow. Confirm the canonical release stamp and compare live feature-file hashes with the reviewed files.

Test fixtures use local accounts and block external services; they do not write student data.

## Lesson-page reference design

Levels 31–60 use `sentence-structure-autumn-reference.css` and `lesson-header-v4.webp` for all four teaching stages. The retired `sentence-structure-autumn-lessons.css` design is not loaded and must not be restored.

Keep one visual grammar across the lesson: the generated cabin panorama forms the header; the four-step navigation uses warm paper cards and illustrated forest medallions; pages 1–3 use ring-bound cream parchment, while page 4 uses a wooden sign and frame; copper, olive and gold leaves provide restrained accents; dark navy remains the primary teaching text; orange marks the current stage; and deep forest green is reserved for forward actions. Formula, benefit and rule content remain real DOM text. Exercise cards keep the existing inputs, answer checks, recording controls, bookmarks, progress, persistence and Eddy journey behavior.

The detailed treatment uses a rabbit in the header, an illustrated maple leaf behind each benefit number, oak leaves and an acorn at row ends, a rope-like divider, metal rings on the first three pages, botanical branches attached to the paper and cards, and a two-line green next-page button. The surrounding surface is light forest cream with foliage; it has no dark brown plank pattern or isolated floating acorn. Page 1 gives its formula and example balanced full-width illustrated frames. Rule numbers sit on five distinct generated seasonal memo tags. Step numbers sit on generated carved forest medallions. Page 4 uses a generated carved wooden sign for its heading and progress, with clean parchment question cards rather than ruled notebook cards. Decoration must never overlap a lesson title, answer input, bookmark control, or feedback. Keep the real question text and answer state separate from these images.

The four stages have distinct content layouts inside the same shell: formula and examples use large framed blocks; benefits use numbered horizontal rows; important rules use numbered parchment strips with five illustrated tags; and exercises use clean parchment question cards in a timber frame. Never reintroduce decorative scene cards, checkpoint banners, or a second lesson trail within these pages.

At 820px and 390px widths, collapse the stepper and content rows without horizontal scrolling. Respect reduced motion. Validate representative levels 31, 45 and 60, all four pages, all 50 exercise cards, the 180-level map, and the existing Eddy journey before release.

## Exercise journey for levels 31–60

Page 4 now uses the same question-bound journey module as levels 1–30. Each of the 50 question wrappers owns one platform, while one preserved Eddy actor moves vertically between them and reacts to the active answer. The autumn platform CSS reuses the exact `stone.webp` log from the realm map. A hand-painted `exercise-wooden-path-v3.webp` now makes a broad, gently winding honey-oak boardwalk with long, irregularly joined planks, large autumn maple leaves, moss and grounded acorns. Its top and bottom edges were selected to join cleanly as a repeated CSS background. Keep the boardwalk surface smooth and quiet at phone size; avoid speckles, tight grain, regularly spaced cross-boards, and floating ornaments. The path stays visually quieter than the question text and clear of the platform number and Eddy. The road and logs are CSS backgrounds so grading cannot remove them through image-element replacement. Numbers and answers remain live DOM text.

Keep the route geometry, actor contact line, slow walk timing, preserved actor on rerender, stable top-anchored platforms, scroll restoration, keyboard handling and pending-write safety in `sentence-structure-exercise-journey.mjs` and `sentence-structure.js`. Only the themed path and platform backgrounds change. Run both `tools/test-sentence-structure-eddy-journey.cjs` and `tools/test-sentence-structure-autumn-journey.cjs` when extending the journey or its layout.
