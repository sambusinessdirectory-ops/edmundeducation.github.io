# Cosmic Bakery — Phrasal Verb lessons 61–90

The third chapter adds 30 original lessons to the existing day oasis and moonlit desert. It uses their shared companion, account-scoped saved location, lesson-entry callback and progress display. Lessons 91–329 remain in the original continuation cards. The map never creates learning attempts when travelling.

## Artwork and source

The user's cosmic bakery reference sets the visual direction: a croissant crescent, spiral galaxy, chef-hat bakery chimney, hot chocolate, ringed pastry planet, icing path and biscuit platforms. Tiny background stars stay static; only the deliberately larger sky stars twinkle. The source screenshot's sample lesson numbers and titles are not used as course data.

The current chapter uses ten raster assets produced with the built-in ImageGen tool. `background.webp` is a 1239 × 1269 painting displayed in a 1600 × 1640 chapter, exported at WebP quality 92. `galaxy.webp` retains the original approved spiral. The chapter uses separate 1254 × 1254 RGBA sprites exported as lossless WebP:

- `saturn-v2.webp`: a solid strawberry-pink sphere with pastel sprinkles and one complete gold ring, reconstructed from the user's Saturn crop. The old doughnut sprite is no longer loaded.
- `moon-v2.webp`: broad luminous croissant segments, ivory seams and sugar lights; CSS adds a soft amber halo.
- `star-cookies.webp`: a smooth standing golden star biscuit grouped with two simple cocoa cookies. The revised version removes raised pearls, cracks, crumb texture and loose broken biscuits, following the user's final simplification request.
- `cupcake.webp`: a modest lilac cupcake and two cookie rocks.
- `macarons.webp`: one strawberry and one pistachio macaron in a low stack.
- `cinnamon-wafers.webp`: a cinnamon roll with a broad icing curl and two simple wafers.
- `caramel-pudding.webp`: a small smooth caramel pudding.
- `blue-planet.webp`: a distant blue sugar planet with a lavender ring and pink frosting band.

All new sprites retain genuine alpha, fading to at most 1/255 at their borders. No programmatic extraction or repainting was used. The new four decoration masters, exact prompts and alpha bounds are archived in `outputs/phrasal-bakery-y-turn` in the task workspace. Earlier selected sprites retain their provenance in `outputs/phrasal-bakery-refinement`. Original background and galaxy provenance remains in `outputs/phrasal-bakery-map`. Earlier atlas/checkerboard experiments and the superseded moon/Saturn sprites are not loaded by the map.

## Composition and motion

The chapter begins at world y = 3545, below the existing two landscapes and a 135-unit chapter divider. A vanilla-icing route with larger, more frequent six-color pastel sprinkles links biscuit platforms. Its right bend passes below the mug; its final bend avoids the large foreground cupcake. Five different ground groups occupy the middle gaps: a star biscuit, macarons, a cinnamon roll, a cupcake and a pudding. Each is used once. A small blue planet floats beside the bakery. The galaxy now sits above the bakery on the right, closer to Saturn. Both earlier chapter layouts and their artwork retain the approved positions. The new overview fits one complete chapter and keeps the lesson card available at lesson 90, including on phones.

| Requested feature | Implementation |
| --- | --- |
| Larger twinkling stars | 17 native SVG stars, independent 4.4–6.92 second opacity/scale cycles; small painted sky points remain fixed |
| Gently spiralling Milky Way | Circular alpha galaxy rotates continuously over 80 seconds inside a fixed inclined projection |
| Glowing, swinging croissant moon | A luminous sprite and soft native halo; whole pastry swings between −12° and +12° over 8 seconds |
| White chimney smoke | Five soft overlapping puffs start at the registered hat opening, rise 130 world units, expand, drift and fade over staggered 6.2 second loops |
| Fuller cup steam | Three filled, tapered translucent veils widen and curl above fixed rim contacts; soft cores and diffuse halos fade toward their tops. Shared frame updates deform the silhouettes. There are no dashed or stroked steam lines |
| Solid pink sprinkle Saturn and ring | The complete single sprite turns left and right around Y between −32° and +32° over 10 seconds, under a mild perspective. No clockwise Z spin or X tilt |

The existing shared animation owner controls the chapter. Steam updates are limited to roughly 30 draws per second; offscreen and inactive decoration pauses. Reduced motion freezes the effects while retaining lesson access. Native SVG/CSS and images require no WebGL or additional runtime library.

## Validation

- `node --test tools/test-phrasal-bakery.mjs`: true first-90 lesson/question references, unchanged first-60 positions, all 8,100 ordered dry routes, free bakery walking, retained four-pond boundaries, icing-route clearance and fixed steam contacts.
- The bakery, night, day, host, durable-attempt and shared-map unit invocation passed 53 checks.
- `BAKERY_ONLY=1 node tools/test-phrasal-desert-browser.cjs`: normal-scale motion for all requested effects, six unique decoration sprites and the relocated galaxy; paired changing-effect and stationary-building/cup regions; controlled samples over two galaxy rotations and two Saturn turning cycles, including Y-only matrix checks; offscreen pause and reduced motion; complete standard/overview/last-stop views at 1440 × 1050, 820 × 1180 and 390 × 844.
- The full Phrasal browser fixture covers all mapped entries, continuation cards, original day/night animation, caption spacing, accounts, saved flags, real lesson titles and no walking-induced attempts.

Browser evidence uses isolated local fixture accounts with external student requests blocked. It does not authenticate as a real student, measure physical mobile/Safari performance, or verify an installed app's cache upgrade. Publication is checked separately against the canonical release identifier and the deployed loading-chain/artwork file hashes.
