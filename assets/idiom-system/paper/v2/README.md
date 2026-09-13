# Idiom papercraft artwork — second edition

The rejected first edition enlarged a small central background and used flat geometric props. This edition uses detailed generated paper miniatures for all decorative moving objects and a separate sharp main scene.

- landscape.webp: 1672 × 941; main plate displayed at 1600 × 900 world units.
- foreground.webp: 1691 × 930; separate lower meadow plate.
- plants.webp: six textured foliage variants.
- props.webp: two sailboats, a wooden/parchment rotor, two layered paper clouds, and a thick paper platform.
- bird.webp: textured body and two wing pieces; the renderer clips neighboring atlas pieces and overlaps wing roots at the shoulders.
- flags.webp: two cloth variants used on three castle poles.

The original RGB sprite atlases use magenta compositing screens. `idiom-paper-artwork.mjs` prepares a cached native Canvas composite, preserving foreground texture and removing screen spill. The masters are not claimed to have alpha. Sprites are encoded as lossless WebP; scenery uses quality 97. Retain original source pixels and alpha review when revising these materials.

The main image is displayed at its intended size. Zoom-out reveals a clean parchment matte and paper border around the finite map, without enlarged or stretched scenery. The lower plate has a short vertical blend. Every tree and shrub is rendered separately; none is painted into the static plates.

Original generated PNGs, exact prompts, normal-view screenshots, closeups, motion and cutout checks are archived in the task workspace at `outputs/idiom-paper-rebuild/`. Run `node --test tools/test-idiom-paper.mjs` for navigation and motion contracts, and `node tools/test-idiom-paper-browser.cjs` with Playwright available for browser verification.
