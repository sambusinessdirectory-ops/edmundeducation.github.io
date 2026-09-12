# Dream realm normal-view artwork — exact prompts

Generation mode: built-in ImageGen. The illustrated background and cushion were generated/edited with the image tool; the train is code-native 3D geometry, not raster generation. Local alpha cleanup was limited to the user-authorized removal of connected neutral checkerboard pixels from the cushion.

## Initial wide composition

Use case: precise-object-edit / scene recomposition and outpainting.
Edit target: the supplied dreamy pillow-and-cloud bedroom painting.
Create a 16:9 wide landscape canvas, approximately 3200 by 1800. The CENTRAL HALF (x800–2400) is the complete normal game view. Put all meaningful scene features inside this central half. The left and right 800-pixel extensions must be very simple, low-detail navy night sky above and broad soft cushions/clouds below, with no extra focal objects.
Recompose the recognizable original elements inside that central half: sleeping white pillow bear around x1080 y350 with its small exposed belly; arched window with EMPTY dark sky around x1280 y190; small illuminated toy castle with FOUR BARE flagpoles around x1710 y280; warm lamp at x850 y390; glowing spherical hanging lantern around x2200 y175; a little tent and books toward x2280 y400. The original crescent, hanging stars and flags are deliberately separate animated layers, so DO NOT add them.
Keep a spacious mixture of real rounded airy clouds and navy, cream, dusty-red quilted cushions. Continue this landscape downward through y1750, giving a winding lesson trail room to pass through varied heights. No table-like rows, no level platforms or path painted in. Surfaces remain large and calm, with no granular noise or micro-level texture.
IMPORTANT: reserve a broad clear, almost flat cream cushion between x1730–2230, y530–800 for a LARGE animated toy train and track to be overlaid. Remove the old painted oval track completely. Do not draw a train or rails anywhere.
Preserve the cosy painterly warm-gold/night-blue atmosphere. No words, numbers, UI, lesson markers, characters other than the sleeping pillow bear, extra buildings or excessive decoration. All focal features should be visible in the central half without zooming out.

## Cushion platform

Use case: stylized-concept.
Asset type: transparent game level platform.
One small, low, softly stuffed ivory quilted cushion viewed from slightly above at an oblique angle, wide rounded rectangle / gently oval shape, approximately twice as wide as deep. A subtle warm pale-gold piped seam around the edge, four soft rounded corners, faint broad quilting near the rim only. The center is broad, smooth, pale cream and completely empty for a dark level number to be drawn later. This is a cosy fairytale pillow-cloud bedroom, painted storybook style with soft warm light and gentle lavender underside shading, matching the supplied bedroom reference. It must look like a cushion resting on a soft surface, not a rigid stone, coin or shiny plastic button.
Isolated on genuinely transparent background with generous empty transparent margin. Include only the cushion; no ground plane, no cast shadow, no numbers, letters, stars, icons, hard outlines or clutter. Single centered object, no sprite sheet.

## Focal placement correction

Precise edit of this wide dreamy bedroom background. Preserve canvas framing and all existing scenery except the following three moves. The normal game camera shows ONLY the central 50% of this image (approximately x418–1254 on the 1672px-wide source), so every focal object must fit completely within those boundaries.
1. Move the table lamp and its supporting books from the far left inward to about x462, y365. Make the lampshade about 75px wide so it fits between x423 and x500, beside and slightly below the sleeping bear's face. Remove its old copy.
2. Move the right tent and its books inward to approximately x1180,y330, ending before x1240. Preserve its warm inner glow. Remove its old copy.
3. Move the spherical hanging lantern inward to x1150,y155, with its right edge before x1220. Remove its old copy.
Do not move the bear, window, castle, bare flagpoles or cloud banks. Keep the middle foreground cream cushion open for the train overlay. Quietly fill removed locations with simple dark sky, broad pillows and clouds. Do not add a track, train, moon, stars, UI, numbers, roads or platforms. Preserve the gentle painterly style. No duplicate objects.

## Tent placement correction

Precise single-object edit: move the ENTIRE glowing tent together with the complete stack of books beside it exactly 140 pixels LEFT, retaining their present size and appearance. The entire tent-and-books group must end before x1220 on this 1672-pixel-wide image. Put it just to the right of the castle, below the hanging spherical lantern. Remove the old copy and fill its old location with a simple navy pillow and clouds. Change nothing else. No new objects, no train, no tracks, no text, no UI. Preserve the canvas size and all other positions.

## Compact header — final background

Precise composition edit to make the central game scene readable on a normal screen. Preserve the 1672 x 941 canvas, central-half horizontal placement, window, sky, sphere lantern, colours and overall style.
Make the upper focal scene more compact vertically:
- Raise the sleeping pillow bear so its face is centered around (525,200) and its small visible belly around (530,255). Keep its sleepy expression and soft silhouette.
- Raise the table lamp and supporting books roughly 85px so the light is near (620,250).
- Raise the castle about 40px, retaining its four empty flagpoles.
- Raise the tent and its adjacent books about 50px.
- Bring the top edge of the broad flat cream foreground cushion up to y310, providing a clear open space from x850 to x1200, y310–440 for a large animated toy train overlay.
Fill vacated places naturally with cloud and cushion shapes. Keep the lower half as spacious softly undulating cream, navy and red cushions mixed with real fluffy clouds. Do not add any train, track, moon, stars, flags, platforms, text or UI. Do not enlarge the canvas or move meaningful objects outside x418–1254.

## Final files

- Background master: `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-dream-normal-view/background-normal.png` (1672 × 941).
- Cushion alpha master: `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-dream-normal-view/cushion.png` (1391 × 707).
- Runtime: `assets/sentence-structure/dream/background-normal.webp` and `cushion.webp`.
- Train: `sentence-structure-dream-train.mjs`; Three.js r186 is vendored with its MIT license. A rendered frame supplies the static compatibility fallback.

