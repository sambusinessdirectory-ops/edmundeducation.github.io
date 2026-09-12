# Japanese garden artwork prompts

Generated using the built-in image generation tool on 12 September 2026; no fallback CLI was used. The final background is the simplified repaint requested by the user. Earlier composition edits are included for reproducibility, not as approved final artwork.

Final masters are saved in `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-zen-assets/`: `background.png`, `koi-red.png`, `koi-tricolor.png`, `cat.png`, `stone.png`, and `lotus.png`. Production WebP assets are in `assets/sentence-structure/zen/`. Genuine generated alpha was preserved.

## Initial garden composition

```text
Use case: illustration-story. Asset type: production background for an interactive Japanese garden lesson map.
Input image: the attached interface screenshot is a visual style and garden reference ONLY. Create the garden landscape without ANY interface, words, numbers, lesson stones, horses or other animals.
Hand-painted polished storybook Japanese tea garden: cream raked gravel and mossy soil, sculpted green pines, bamboo groves and bamboo fences, red Japanese maple foliage at the upper-left and lower-right, natural grey garden rocks, warm lit stone lanterns and a few small wooden lamps. A charming wooden Japanese teahouse with paper sliding doors, an OPEN dark doorway and a broad wooden veranda sits in the upper RIGHT of the central playable half. Hang a small cream split noren curtain beside the open doorway with a simple blue flower crest, no lettering. Keep a clear patch on the veranda for a sleeping cat to be added in code. No cat or fish drawn now. Relaxed late-afternoon light, green and ivory palette with subtle red accents.
Important layout for a game world: canvas landscape ratio about 3200:2250. It displays at3200x2250. Central playable half is x800..2400. Both outer quarters continue rich illustrated garden to all edges for zoom-out. Upper background foliage/teahouse occupy y0..430. Teahouse centre approximately x1900,y240, not at extreme right edge. Clear dry gravel/moss corridors across the central half near y540,950,1350,1720,2000; reserve these clearings for seven levels per row but DO NOT DRAW paths or levels.
Three separate small elongated turquoise ponds in gaps between the clearings: pond1 absolute x1150..2110, y660..820; pond2 x950..1900,y1060..1210; pond3 x1470..2240,y1480..1610. Rounded irregular rocky banks, all ponds separated from each other by ample dry ground. Leave wide dry corridors along both sides of central half. One small wooden arched bridge over the far right tip of the upper pond. No water in bottom foreground. Water surfaces clean, no koi, no lily pads, no flowers floating, no boats: animated fish and leaves will be separate.
Plants naturally follow pond banks, rock gardens and fences instead of isolated evenly spaced bushes. Lantern1 near left forest at absolute x1040,y390; lantern2 by right pond1 at x2200,y800; a pair of smaller lamps beside the raked sand x1430,y370. Rich painted greenery continues throughout the full scene. Entire view filled with art, no border, no empty colour margin. No text, numbers, UI, animals or airborne leaves.
```

## Bring the teahouse into the playable view

```text
Use case: precise-object-edit. Edit target: attached Japanese garden background,1496x1051.
Move the ENTIRE teahouse, its veranda, open doorway, hanging cream noren curtain and small hanging lamp exactly 230 image pixels LEFT, keeping same size and vertical position. The house currently occupies roughly x970..1450,y0..240; its new footprint must be x740..1220,y0..240. Naturally replace vegetation/rocks at its new site and repaint its old rightmost site with bamboo and shrubs. Keep a generous empty wooden veranda in front of the doorway for a sleeping cat. Keep exactly ONE teahouse. Preserve ALL ponds, bridges, foreground, main maple trees, lanterns elsewhere, full canvas dimensions and overall camera. Do not move any pond or add animals/lily pads. No UI, text, paths or lesson platforms. Everything else unchanged.
```

## Retain dry lanes around the ponds

```text
Use case: precise-object-edit. Edit the attached1496x1051 Japanese garden. Preserve the teahouse and its veranda, noren and doorway EXACTLY where they are. Preserve the overall style, lighting, canvas dimensions and plants elsewhere.
Small gameplay geometry correction: shorten the ponds horizontally so the central garden has continuous dry passage on BOTH sides. The upper pond including its rock banks and small arched bridge must fit entirely between image x440 andx1060, still around y405..474. Move its bridge left with the shortened right end and fill its former rightmost water atx1080..1230 with natural raked gravel, bank plants and rocks. The middle pond should fit betweenx420..945 aroundy563..644; fill any former water to its left with natural dry bank. The lowest pond must fit entirely betweenx715..1060 aroundy744..835, filling its former rightmost water with bank plants and gravel. There must be a clear dry route at image x1080..1125 past all three ponds. Keep three separate ponds and maintain their current vertical positions, no merging. Do not add fish, lily pads, animals, paths, stepping stones, text or interface. Do not change the teahouse.
```

## Final background: simplify edges and remove granular artifacts

```text
Use case: style-transfer with strict layout preservation. Edit target: attached Japanese garden production background1496x1051.
The current image is far too crowded and granular, especially the outer borders, bushes, rock textures and gravel. Refine it into a calm, clean hand-painted storybook game background. Use broader confident brush shapes and quiet colour areas; remove fine-grained synthetic micro-detail, tiny scratchy highlights, speckled/grainy noise and repeated squiggly gravel marks. Do NOT merely blur the existing detail: repaint it with intentional, simpler shapes.
Simplify the border vegetation substantially: fewer larger grouped leaf masses, fewer individual tufts and small flowers, open breathing room between a few main rocks and bushes. Retain the principal maple canopy upper left, sculpted pines, bamboo framing, and maple accent lower right, but make them much less densely detailed. Use sparse clear leaf shapes and soft shaded masses, not thousands of tiny leaves. Reduce harsh contrast and saturation slightly. Ground should be smooth warm ivory sand with only a few widely spaced, graceful raked curves, not fine vermicelli-like marks all over. Rocks should have broad grey planes with minimal texture. Water should have broad soft blue-green reflections and very few gentle lines.
PRESERVE EXACT canvas dimensions, camera, the TEAHOUSE and its door/veranda/noren positioning, lantern positions, THREE POND silhouettes/locations and the small arched bridge. The ponds and bridge are already mapped for collision; their geometry must not change. Do not add or move objects. Do not add text, UI, levels, paths, animals, fish or lily pads. The final result should feel like an uncluttered human-painted illustration, polished and warm, visually restful at both normal size and zoom-out.
```

## Red and white koi

```text
Use case: illustration-story. Asset type: transparent koi sprite for continuously articulated swimming.
Single elegant Japanese red-orange and white Kohaku koi seen DIRECTLY FROM ABOVE (top-down dorsal view), head pointing to the RIGHT, long body horizontal, tail to LEFT. Both dark eyes visible as small clear eyes on upper/lower sides of head, soft painted fins on each side of body, tail fully spread and visible. Graceful natural proportions, soft hand-painted polished storybook style matching a tranquil Japanese garden. Gentle slight curved resting body, almost straight, with enough width for visible articulation. One fish only. No water, no ripples, no scene, no shadow. Actual transparent background alpha=0, not a painted checkerboard. Entire fish fully within canvas with comfortable margins. Wide landscape about3:2. No text.
```

## Tricolor koi

```text
Use case: illustration-story. Asset type: transparent koi sprite for continuously articulated swimming.
Single elegant Japanese tricolour Sanke koi: white body with distinctive vermilion-red and small charcoal-black patches. Seen DIRECTLY FROM ABOVE (top-down dorsal view), head pointing RIGHT, long body horizontal, tail to LEFT. Both dark eyes clearly visible near the upper and lower edges of head, pale translucent pectoral fins on each side, tail fully spread and visible. Natural graceful fish proportions. Soft detailed hand-painted storybook style, not a photograph. One fish only, nearly straight resting pose, body and tail ready to be bent gently in code. No water, ripple, floor, scene or shadow. Actual transparent background alpha=0, no painted checkerboard. Wide landscape about3:2, full fish contained with margins. No text.
```

## Sleeping calico bobtail

```text
Use case: illustration-story. Asset type: transparent sleeping animal for a Japanese garden teahouse.
One small Japanese bobtail calico cat curled up sleeping, viewed from slightly above at three-quarter side angle. Mostly soft WHITE fur, with distinct black and warm tan patches around ears and back as in a calico Japanese bobtail. Eyes fully peacefully closed. Head on RIGHT resting on front paws, compact round curled body to LEFT, an identifiable short fluffy BOBTAIL curling outside the left rear edge with a clean visible base for gentle tail articulation. Keep the short tail clearly visible and separated in silhouette instead of hiding it underneath the body. Calm relaxed pose, ears at ease, no clothes or props. Soft detailed painterly storybook animal style, matching a Japanese garden illustration. Whole cat fully visible, no floor, no shadow, actual transparent alpha background, not checkerboard painting. One pose, one cat. Wide landscape about3:2. No text.
```

## Garden stepping platform

```text
Use case: illustration-story. Asset type: transparent Japanese garden lesson platform.
One low wide oval stepping platform made of weathered warm-grey granite, viewed from gently elevated angle. Broad smooth pale ivory stone top with a fine engraved concentric zen-ripple ring around the OUTER rim, textured grey rounded side, tiny moss at lower rim and a small red Japanese maple leaf near the lower left edge. Japanese garden aesthetic, hand-painted polished storybook style. Clear empty light center occupying at least central50% for code-drawn lesson number. Low and broad, width about1.8times height. Entire single stone visible with margin. Actual transparent alpha background, no checkerboard illustration, floor, cast-shadow plane, characters, text or numbers. No other props.
```

## Lotus leaf

```text
Use case: illustration-story. Asset type: transparent floating lotus leaf for an animated koi pond.
A single flat circular green lotus/lily-pad leaf, viewed directly from ABOVE, almost circular with an organic gently scalloped edge and one narrow V-shaped notch running toward the centre. Soft radial leaf veins, subtle olive and fresh green painted texture, dappled warm highlights, darker green rim. Hand-painted polished storybook illustration, calm Japanese garden aesthetic. No lotus flower, no water, no drops, no shadow, no stem sticking out. One complete leaf centred with generous clear margins. Actual transparent alpha background, no painted checkerboard or coloured backdrop. Square canvas, no text.
```
