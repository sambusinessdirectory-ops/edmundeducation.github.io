# Living toy room — lessons 121–150

A warm wooden toy room follows the dream realm at world y=7000. Its main vignette fits the original 1600-unit map width. The 3200-unit background includes quiet floor/wall extensions, while the later route scrolls through a soft blue/teal felt playmat. The realm is 1850 units tall. Original caption size and standard camera scale are retained.

## Visuals and motion

- Eight coloured glass marbles roll gently in both directions. Each has its own phase, amplitude (18–25 units) and period (9–12.3 seconds). Interior glass ribbons rotate in proportion to distance travelled; the ground contact and shadow follow the marble.
- Four folded paper planes have separate wings, with gentle independent hinge motion and small body rocking. Paper shading and shadows use the same lighting as the marbles.
- A metal winding key turns continuously through a ten-second revolution beside the seated dog.
- The cream-and-brown wind-up puppy blinks periodically and makes a gentle left/right head gesture over 5.6 seconds, resting between gestures. The neck deforms continuously into the stationary body; no head/body cutout seam or duplicated silhouette is used. Eyelids sample neighbouring painted skin with feathered joins. Feet and body remain stationary.
- Thirty wooden toy-block platforms with coloured rims follow a winding wooden toy-track path. No path connects across the realm boundary.
- The blurred cloud boundary between 120 and 121 is freely walkable. Existing water and bridge rules in earlier realms remain intact.

`background.webp` and `dog.webp` are built-in ImageGen artwork. Exact prompts and master paths are in `ARTWORK-PROMPTS.md`. The background has no painted marbles, planes, dog or key, so there are no stale duplicates underneath animation. The marbles, folded paper, key and platforms use native geometry. The existing vendored Three.js r186 renderer and license are reused.

`effects-fallback.webp` is a code-rendered static compatibility frame when WebGL2 is unavailable. The dog has a canvas fallback; head articulation requires WebGL. Motion pauses with the map, freezes under reduced motion and releases graphics resources on teardown.

## Lesson integration and title removal

The map now contains the existing real lessons 1–150; lessons 151–345 remain in the list. Lesson content, saved location, companions, account ownership and best-attempt progress semantics remain unchanged.

The realm-list heading was removed at the user's request. The theme title is intentionally empty, with no replacement title or expanding list of realm names. The shared renderer respects an explicitly empty title while preserving default titles for themes that omit the field. Existing lesson count and companion controls remain.

## Verification

- Unit checks: 26 realm checks, including all 22,500 ordered lesson-to-lesson routes; thirty new positions and short labels; no slipping between marble translation and rolling; opposed directions; continuous wing/key/head motion; title deliberately empty.
- Browser fixture: normal framing and readable captions; no caption/block intersections; changing pixels for all eight marbles, all four planes and the key; dog head motion and blinks with stationary body pixels; accounts, pins, 120–121 traversal, lesson 150, reduced motion and desktop/tablet/phone views.
- Earlier coast and dream/garden regressions, including all 150 real lesson links. All 39 Sentence Structure system checks pass.
- Camera regression checks keep the complete entry vignette at standard zoom and center later selected stops when they would leave the visible area.
- Canonical release and deployed asset hashes must match before reporting publication complete.

Local masters and QA: `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-toy-realm/`.
