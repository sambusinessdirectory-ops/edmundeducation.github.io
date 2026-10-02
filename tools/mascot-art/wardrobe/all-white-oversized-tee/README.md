# White oversized crew-neck T-shirt

One `top`-slot cosmetic fitted independently to Eddy, Noir, Celeste, Phoebe, and Elsie.

## Source and build contract

- `*-fit.png` files are ImageGen fitting references derived from each canonical 16-view atlas. They are never shipped as replacement characters.
- `*-item-source.png` files are deterministic item-only, full-canvas registered sources extracted without replacing face, body, limb, mane, hair, tail, bow, bridle, or hoof pixels.
- Runtime assets are lossless 1024×1024 WebP overlays in `assets/speaking-system/cosmetics/<character>/white-oversized-tee.webp`.
- `white-oversized-tee-display.png` is the transparent ImageGen inventory product cutout; the normalized 512×512 copy ships from the shared cosmetics directory.
- `tools/prepare-all-white-oversized-tee.cjs` rejects incomplete cells and limits the mask to the upper-body garment region while excluding warm ivory hair and coat pixels.
- `tools/test-white-oversized-tee-browser.cjs` renders all 80 directions in the actual Three.js character renderer in open/blink states, checks full-body exclusivity, and verifies the botanical-cap plus shearling-boots combination.
- `qa-approval-v1.jpg` and `visual-acceptance-v1.json` lock the exact runtime assets and review evidence. The manifest remains pending until explicit user acceptance.

The production database migration is prepared locally but must not be applied, and the branch must not be released, until the locked visual board is accepted.
