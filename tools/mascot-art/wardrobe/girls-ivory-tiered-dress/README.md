# Ivory asymmetric chiffon gown

`ivory-tiered-dress` is the stable item ID for a floor-length, flutter-sleeve asymmetric chiffon gown fitted independently to Celeste, Phoebe and Elsie. It covers the top and lower-body clothing areas while leaving headwear, accessories and shoes available.

## Asset contract

- `design-reference.png` is the user-supplied garment reference.
- `*-fit-v3-long.png` are the built-in ImageGen long-gown fitting references made against each canonical 16-view atlas.
- `*-chroma-v3-long.png` are the character-specific chroma-isolated garment sources. They preserve visible mane, tail, foreleg and hoof occlusion as holes while avoiding same-colour confusion with Celeste's pale coat.
- `ivory-tiered-dress-display.png` is the transparent inventory product source.
- `node tools/prepare-girls-ivory-tiered-dress.cjs` removes generation-edge noise and produces three independent registered 1024 x 1024 lossless WebP overlays.
- Runtime overlays live at `assets/speaking-system/cosmetics/{character}/ivory-tiered-dress.webp`.

The item uses slot `fullBody` with coverage `top` and `lower`. Equipping it clears those two character-specific slots; shoes and headwear remain compatible.

## QA

Inspect every cell in `qa-*-composite.jpg` (dark/open), `qa-*-light.jpg` (light/open) and `qa-*-blink.jpg` (midtone/blink). The mandatory `qa-*-3d.jpg` sheets render the sixteen metadata-defined directions through the real Three.js standing renderer; use these rather than assuming physical atlas row order. Confirm the canonical face, eyes, muzzle, mane, tail, forelegs and hooves remain intact; the ruched bodice, flutter sleeves and ankle-length asymmetric skirt must remain registered in all sixteen directions. The extractor re-rejects chroma after mask repair and treats Celeste's canonical head and dark facial features as hard occlusion masks.
