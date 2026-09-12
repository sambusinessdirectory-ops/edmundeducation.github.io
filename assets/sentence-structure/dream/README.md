# Dream pillow-cloud realm — lessons 91–120

The complete main composition now fits the original 1600-unit map width. The 3200-unit painting includes quiet scenery on either side, revealed on zoom out. The camera retains readable 18-unit captions (15.8 screen pixels at the tested 1440-pixel desktop width), with the first dream view starting 145 units into the realm. The realm is 1850 units tall; later stops remain available through normal scrolling and walking.

## Artwork and placement

- `background-normal.webp`: the current 1672 × 941 painting, mapped to 3200 × 1850 with a left offset of −800. The bear, lamp, crescent, seven hanging stars, castle, lantern globe, tent and complete railway fit the normal entry view.
- `cushion.webp`: a softly painted, transparent ivory cushion with gold piping. Soft contact shadows replace the rigid coin rims.
- Thirty lesson cushions follow a curved quilted trail. The trail is internal to the dream realm; no connector strips cross the cloud borders.
- `star.webp` and `moon.webp`: independent transparent cutouts. These objects, castle flags, train and rails are absent from the background, preventing duplicate silhouettes.
- `background.webp` and `train.webp` are retained legacy assets and are no longer loaded by this realm.
- `NORMAL-VIEW-PROMPTS.md` records exact built-in ImageGen prompts and final master paths. The older `ARTWORK-PROMPTS.md` records earlier iterations.

## Motion at normal zoom

- Stars move ±11 world pixels over 5.4–7.26 seconds and brighten/dim on separate phases. Standard-view browser samples verify more than 15 screen pixels of vertical travel for every star.
- The moon rocks from −9° to +9° over nine seconds. Four flags wave about fixed poles, with changing fold shading.
- Thirty-two sparse distant points include eight small cross-shaped glints. Opacity ranges from 0.1 to 1 with staggered timing.
- Clouds move inside feathered masks in one complete GPU repaint. Castle walls and the sleeping face remain stationary. The belly deformation has a 1.3% envelope over 5.8 seconds.
- Six restrained lamp/window blooms pulse independently.
- A real three-dimensional wooden locomotive and two wagons follow the same closed rail geometry over a continuous 34-second loop. Upright bodies, rotating wheels, connecting rods, couplings and contact shadows replace the flattened sprite train. Rail gauge matches wheel placement.
- Three.js r186 and RoundedBoxGeometry are vendored under `assets/vendor/three-r186/`, with the MIT license. `train-fallback.webp` is a rendered compatibility frame for browsers without WebGL2; those browsers retain a static train.
- Motion shares the map lifecycle and reduced-motion setting. GPU resources are released on teardown.

## Lesson behavior and verification

All 120 real mapped lessons, the remaining 225 lesson links, account-owned progress, three companions and the single saved location retain their contracts. Cloud borders remain freely walkable. Garden framing and its five visible lamps are unchanged.

The browser fixture checks normal framing and label size, actual pixel motion, star displacement, moon angle, flag-tip displacement, twinkle intensity, label/cushion collisions, train travel, account isolation, saved locations, realm traversal, reduced motion and desktop/tablet/phone layouts. The route suite checks all 14,400 ordered lesson pairs.

Local preview and QA output: `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-dream-normal-view/`. Publication is complete only after Pages checks and canonical deployed-file hashes agree with the release commit.
