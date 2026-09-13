# Cosmic Bakery — Phrasal Verb lessons 61–90

The third chapter adds 30 original lessons to the existing day oasis and moonlit desert. It uses their shared companion, account-scoped saved location, lesson-entry callback and progress display. Lessons 91–329 remain in the original continuation cards. The map never creates learning attempts when travelling.

## Artwork and source

The user's cosmic bakery reference sets the visual direction: a croissant crescent, spiral galaxy, chef-hat bakery chimney, hot chocolate, ringed pastry planet, icing path and biscuit platforms. Tiny background stars stay static; only the deliberately larger sky stars twinkle. The source screenshot's sample lesson numbers and titles are not used as course data.

The current chapter uses six raster assets produced with the built-in ImageGen tool. `background.webp` is a 1239 × 1269 painting displayed in a 1600 × 1640 chapter, exported at WebP quality 92. `galaxy.webp` retains the original approved spiral. The refinement adds four 1254 × 1254 RGBA sprites exported as lossless WebP:

- `saturn-v2.webp`: a solid strawberry-pink sphere with pastel sprinkles and one complete gold ring, reconstructed from the user's Saturn crop. The old doughnut sprite is no longer loaded.
- `moon-v2.webp`: broad luminous croissant segments, ivory seams and sugar lights; CSS adds a soft amber halo.
- `star-cookies.webp`: a smooth standing golden star biscuit grouped with two simple cocoa cookies. The revised version removes raised pearls, cracks, crumb texture and loose broken biscuits, following the user's final simplification request.
- `cupcake.webp`: a modest lilac cupcake and two cookie rocks.

All new sprites retain genuine alpha, fading to at most 1/255 at their borders. No programmatic extraction or repainting was used. Masters, exact prompts and alpha bounds are archived in `outputs/phrasal-bakery-refinement` in the task workspace. Original background and galaxy provenance remains in `outputs/phrasal-bakery-map`. Earlier atlas/checkerboard experiments and the superseded moon/Saturn sprites are not loaded by the map.

## Composition and motion

The chapter begins at world y = 3545, below the existing two landscapes and a 135-unit chapter divider. A vanilla-icing route with larger, more frequent six-color pastel sprinkles links biscuit platforms. Its right bend passes below the mug; its final bend avoids the large foreground cupcake. Five compact star-biscuit and cupcake groups occupy the gaps between the middle lesson rows. Both earlier chapter layouts and their artwork retain the approved positions. The new overview fits one complete chapter and keeps the lesson card available at lesson 90, including on phones.

| Requested feature | Implementation |
| --- | --- |
| Larger twinkling stars | 17 native SVG stars, independent 4.4–6.92 second opacity/scale cycles; small painted sky points remain fixed |
| Gently spiralling Milky Way | Circular alpha galaxy rotates continuously over 80 seconds inside a fixed inclined projection |
| Glowing, swinging croissant moon | A luminous sprite and soft native halo; whole pastry swings between −12° and +12° over 8 seconds |
| White chimney smoke | Five soft overlapping puffs start at the registered hat opening, rise 130 world units, expand, drift and fade over staggered 6.2 second loops |
| Dynamic chocolate steam | Three tapered translucent ribbons keep their bases on the cup rim; upper curls and rising dash flow evolve independently |
| Solid pink sprinkle Saturn and ring | The complete single sprite rotates with `rotateZ` through 360° every 32 seconds. No X/Y transform or perspective; its full rotation stays inside the sky |

The existing shared animation owner controls the chapter. Steam updates are limited to roughly 30 draws per second; offscreen and inactive decoration pauses. Reduced motion freezes the effects while retaining lesson access. Native SVG/CSS and images require no WebGL or additional runtime library.

## Validation

- `node --test tools/test-phrasal-bakery.mjs`: true first-90 lesson/question references, unchanged first-60 positions, all 8,100 ordered dry routes, free bakery walking, retained four-pond boundaries, icing-route clearance and fixed steam contacts.
- The bakery, night, day, host, durable-attempt and shared-map unit invocation passed 53 checks.
- `BAKERY_ONLY=1 node tools/test-phrasal-desert-browser.cjs`: normal-scale motion for all six requested features; paired changing-effect and stationary-building/cup regions; controlled samples over two complete galaxy/Saturn rotations, including rigid Z-only matrix checks; offscreen pause and reduced motion; complete standard/overview/last-stop views at 1440 × 1050, 820 × 1180 and 390 × 844.
- The full Phrasal browser fixture covers all mapped entries, continuation cards, original day/night animation, caption spacing, accounts, saved flags, real lesson titles and no walking-induced attempts.

Browser evidence uses isolated local fixture accounts with external student requests blocked. It does not authenticate as a real student, measure physical mobile/Safari performance, or verify an installed app's cache upgrade. Publication is checked separately against the canonical release identifier and the deployed loading-chain/artwork file hashes.
