# Camel tailored coat dress

`camel-coat-dress` is a full-body girls wardrobe item fitted independently to Celeste, Phoebe and Elsie. It occupies the main top and lower-body coverage areas while deliberately leaving the feet available for future shoes.

## Asset contract

- `design-reference.png` is the user-supplied garment reference.
- `*-fit.png` are built-in ImageGen fitting references registered to each character's canonical 4 x 4 standing atlas. They are source material, not runtime replacement characters.
- `camel-coat-dress-display.png` is the transparent inventory product image.
- `node tools/prepare-girls-camel-coat-dress.cjs` extracts only the camel garment into three independent 1024 x 1024 lossless WebP overlays.
- Runtime overlays live at `assets/speaking-system/cosmetics/{character}/camel-coat-dress.webp`.

The item uses slot `fullBody` with coverage `top` and `lower`. Equipping it clears a character's top and lower-body slots, and equipping either of those clears the full-body slot. Headwear, accessories and `feet`/shoes remain compatible.

## QA

Inspect every cell in each `qa-*-composite.jpg`: face, eyes, mane, tail and hooves must remain the canonical base art; lapels, sleeves, buttons, waist and flared hem must remain complete. Verify open and blink atlases in the real renderer and confirm saved outfit isolation for all three girls.
