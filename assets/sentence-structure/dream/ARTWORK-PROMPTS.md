# Dream realm artwork prompts

Mode: built-in image generation and editing.

Final artwork: `background-clouds.png` (master), `background.webp` (website), `train.png` / `train.webp`, `star.png` / `star.webp`, `moon.png` / `moon.webp`.

The generated transparent sprite alpha is preserved. Browser canvas motion reuses those assets. The final background replaces selected central pillows with clouds, preserving the track and sleeping bear.

## dreamBackgroundPrompt

Use case: precise-object-edit.
Edit the supplied dreamy bedroom illustration into a clean game environment background. Preserve its soft painterly bedtime storybook art, warm amber lamps, deep indigo night, enormous quilted pillows as rolling hills, sleeping white bear-shaped pillow on the left, distant toy castle on a pillow near upper middle-right, tall arched window, curtain, books and cosy fabric folds.
Remove ALL UI, panels, text, numbers, glowing numbered level circles, companion characters, footer and header. Reconstruct the scenery naturally where they were. Remove the walking little backpack bear and small seated toy bear. Retain the large sleeping white BEAR PILLOW with closed embroidered eyes, a clearly rounded soft tummy visible in the left-middle; it is part of the bedding.
Remove the crescent moon, dangling gold star ornaments and their strings, castle flags, and the toy train ONLY; these will be separate animated overlays. Keep the bare flagpoles on the castle and clear starry sky in the window for a moon. Keep the large round moon-like pendant upper right as a warm ambient lamp if present.
Replace the fragment of toy railway at the very bottom with ONE small complete oval wooden toy railway lying flat on a broad smooth foreground pillow in the lower right half. Make it an easy-to-trace regular elliptical loop, viewed from above at a shallow angle, about source x840–1320, y820–950 in a 1536×1024 composition. No train on it. No rails through pillows or vertical cliff walls. Keep the railway clear of other objects.
Red blankets can rest naturally on pillow ridges, but do NOT add a new elevated game road or ribbon connecting tiers. Make several broad, softly rounded pillow surfaces in the central area for 30 interactive lesson platforms to be placed later. Preserve comfortable negative space between decorative objects. The lower foreground should stay usable, not a wall of dense props.
Lighting is gentle bedtime twilight, rich navy/lavender and warm gold. Moderate painterly detail; no granular micro-texture, no stipple noise, no excessive tiny stars or synthetic fabric patterns. No text, letters, symbols resembling text, watermark, UI, people or animals other than the existing sleeping bear-shaped pillow. Full-bleed landscape, keep exact 1536×1024 composition, no flat-color blank margins.

## dreamCompositionPrompt

Use case: precise-object-edit.
Make two small compositional fixes to this exact clean bedroom background; preserve everything else and the 1536×1024 framing.
1. The sleeping white bear-shaped pillow at the left currently has its tummy hidden behind the navy pillow. Reveal a softly rounded white pillow-bear tummy directly below its sleeping face, mainly source x230–455 y355–525, by lowering the obscuring front navy pillow there. Keep its closed embroidered eyes and relaxed position; no new character, no smile, no eye opening. Rounded chest/tummy should be visibly soft enough for a subtle breathing deformation. Keep central pillow surfaces at x500+ open.
2. The oval wooden train track is too large. Make the SAME single complete flat oval track smaller and place it on the far lower-right pillow, centre around source (1300,838), horizontal radius155 and vertical radius48. All rails must lie flat, around source x1140–1460 y782–894, with an empty soft pillow surface where the previous oversized track lay. No trains. This leaves central x430–1100 clear for game lesson platforms.
Do not otherwise change the castle, window, empty moon space, lights, cloud shapes, distant trees, bedding colors or painterly style. No text, no game UI or numbered circles, no new decorative objects, no microtexture.

## dreamTrainPrompt

Use case: illustration-story.
Asset: a single toy railway sprite atlas on genuine transparent RGBA background for a dreamy bedtime game.
Show THREE separate wooden toy train pieces in a horizontal row, with large transparent gaps: left a small locomotive facing RIGHT, middle a little open passenger wagon, right another small open wagon. Each piece is seen DIRECTLY FROM ABOVE, orthographic top view, so it can rotate freely around a circular toy railway without looking upside down. The engine is the largest, with a short rounded blue boiler pointing right, tiny brass chimney, warm walnut cab toward the left, small black wheels visible evenly on BOTH long sides. The two wagons have warm honey wooden bodies, dark blue seats and four small dark wheels; rounded child-safe wooden edges.
All three vehicles run horizontally, top-down, rear left/front right, centered on the same baseline, each fits wholly in its own equal-width third of the canvas. Three pieces only, no track, no floor, no perspective side view, no scenery, no texts, no smoke, no shadow cast onto an opaque background. Soft painted storybook material with restrained clean brushwork and warm amber rim-light, deep midnight blue and honey wood to match a bedroom dream. Transparent empty pixels around every piece, no checkerboard pattern.

## dreamStarPrompt

Use case: illustration-story.
Asset: one glowing five-point hanging star ornament, centered and isolated on genuine transparent RGBA background. Warm gold paper-and-fabric dimensional star with gently rounded tips, softly painted folds toward the center, creamy amber internal illumination, a fine warmer gold rim, restrained subtle painted texture. Front view with a tiny hint of thickness. Beautiful quiet bedtime storybook illustration matching an indigo bedroom of giant pillows and toy castles. The star occupies most of a square canvas with generous transparent padding. No string (drawn separately in the game), no background, no scene, no extra stars, no words, no checkerboard. Any glow must fade to genuinely transparent pixels.

## dreamMoonPrompt

Use case: illustration-story.
Asset: one softly luminous crescent moon isolated on genuine transparent RGBA background. A warm pale honey crescent moon opening to the RIGHT, plain moon with no face, gently irregular painterly edge and a few soft watercolor mottles, subtle luminous cream center and amber rim, calm light suitable for the night sky outside a dreamy bedroom window. Front view, vertical upright crescent, centered on square canvas, generous transparent space. Rich gentle storybook paint, not glossy plastic, not photoreal astronomy, not glittery or granular. No stars, string, clouds, scenery, text or checkerboard. The inside crescent cutout and all surroundings must be genuinely transparent; a very restrained glow may fade to transparency.

## dreamCloudEditPrompt

Use case: precise-object-edit.
Edit target: the attached dreamy bedroom landscape. Keep the exact 1536 x 1024 framing, scale and placement.
Primary request: transform SOME of the pillows in the middle into actual soft, airy, billowing clouds, creating a balanced mix of clouds and cushions.
Replace the large central cream pillow mound around x600–930 y420–610, and the cream mound behind it around x890–1190 y375–540, with dreamy cloud banks. Also turn a modest portion of the cream mound around x885–1125 y625–705 into clouds. Remove their fabric stitching, seams and squared pillow corners; use a few broad rounded cloud lobes, soft feathered edges, warm pale gold highlights and gentle lavender-blue shadows. They must read as airy clouds, not textured cotton pillows or mist laid over unchanged cushions. Keep shapes calm and spacious, with no grainy/micro-detail.
Preserve all other scenery: the sleeping bear's exact face AND exposed belly at upper left, blue and red fabric cushions, lamp, window, castle towers and bare flagpoles, small houses and books, foreground fabric pillow, and especially the exact existing oval toy rail track at lower right (center about1262,807). Do not reposition anything else or change the lighting/style. The rail must stay fully visible and on its existing foreground pillow. Preserve the large areas available for lesson markers.
No text, UI, numbers, characters, trains, stars, crescent moon, flags or other new objects. Return only the same full artwork with these localized central cloud replacements.

