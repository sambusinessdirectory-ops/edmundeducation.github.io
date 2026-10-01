# Ivory tiered flutter-sleeve dress

`ivory-tiered-dress` is a full-body garment fitted independently to Celeste, Phoebe and Elsie. It covers the top and lower-body clothing areas while leaving headwear, accessories and shoes available.

## Asset contract

- `design-reference.png` is the user-supplied garment reference.
- `*-fit.png` are built-in ImageGen character fitting references.
- `*-overlay-source.png` are built-in ImageGen garment-isolation sources.
- `ivory-tiered-dress-display.png` is the transparent inventory product source.
- `node tools/prepare-girls-ivory-tiered-dress.cjs` removes generation-edge noise and produces three independent registered 1024 x 1024 lossless WebP overlays.
- Runtime overlays live at `assets/speaking-system/cosmetics/{character}/ivory-tiered-dress.webp`.

The item uses slot `fullBody` with coverage `top` and `lower`. Equipping it clears those two character-specific slots; shoes and headwear remain compatible.

## QA

Inspect every cell in each `qa-*-composite.jpg`. Confirm that the canonical face, eyes, mane, tail and hooves remain intact; the ruched bodice, flutter sleeves and tiered ivory skirt must remain registered in all sixteen directions.
