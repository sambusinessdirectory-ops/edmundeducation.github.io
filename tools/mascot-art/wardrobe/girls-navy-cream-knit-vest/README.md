# Navy cream-trim sleeveless knit vest

navy-cream-knit-vest is a girls-only torso top fitted independently to Celeste, Phoebe and Elsie. It is deliberately sleeveless: every canonical arm/foreleg and wrist hoof remains visible. The cream V-neck is shallower than the product reference and ends on the upper chest.

## Asset contract

- *-fit.png are the identity-preserving 16-view worn fitting references created against each canonical standing atlas.
- *-item-generated.png are garment-only extraction studies. They are retained as audit evidence but are not runtime sources because generative isolation enlarged the garments and lost character/hair occlusion.
- *-item-source.png are the registered, character-specific transparent garment sources produced from the accepted fitting references.
- navy-cream-knit-vest-display.png is the transparent inventory source with the raised V-neck.
- node tools/prepare-girls-navy-cream-knit-vest.cjs produces the three independent registered 1024 × 1024 lossless WebP overlays and copies the inventory art.
- Runtime overlays live at assets/speaking-system/cosmetics/{character}/navy-cream-knit-vest.webp.

The item uses the girls top slot. Existing equipment normalization prevents simultaneous use with a full-body dress while preserving headwear and future shoes/accessories.

## QA and release gate

Run:

1. node tools/prepare-girls-navy-cream-knit-vest.cjs
2. node tools/test-navy-cream-knit-vest-browser.cjs
3. node tools/build-navy-cream-knit-vest-approval.cjs
4. node tools/test-wardrobe-visual-acceptance.mjs

qa-approval-v1.jpg contains the actual Three.js renderer for all 16 directions for all three characters on dark, midtone/blink and light backgrounds, plus the highest-risk compatible ivory botanical cap combination in open and blink states. The user explicitly accepted this hash-locked board on 2026-10-02, and the visual-acceptance manifest records that approval for the release gate.
