# Brown shearling lace-up boots

One `feet`-slot cosmetic fitted independently to Eddy, Noir, Celeste, Phoebe, and Elsie.

## Source and build contract

- `*-fit.png` files are ImageGen fitting references derived from each canonical 16-view atlas. They are never shipped as replacement characters.
- `*-item-source.png` files are deterministic item-only, full-canvas registered sources.
- Runtime assets are lossless 1024×1024 WebP overlays in `assets/speaking-system/cosmetics/<character>/brown-shearling-lace-boots.webp`.
- `brown-shearling-lace-boots-display.png` is the transparent ImageGen inventory product cutout; the normalized 512×512 copy ships from the shared cosmetics directory.
- `tools/prepare-all-brown-shearling-lace-boots.cjs` rejects incomplete cells, excess ankle height, and loss of canonical ground contact.
- `tools/test-brown-shearling-lace-boots-browser.cjs` renders all 80 directions in the actual Three.js character renderer in open/blink states and verifies boys-jacket plus girls-long-gown combinations.
- `qa-approval-v1.jpg` and `visual-acceptance-v1.json` lock the exact runtime assets and review evidence. The manifest remains pending until explicit user acceptance.

The production database migration is prepared locally but must not be applied, and the branch must not be released, until the locked visual board is accepted.
