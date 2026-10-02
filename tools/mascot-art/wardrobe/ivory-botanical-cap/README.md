# Ivory botanical baseball cap

`ivory-botanical-cap` is a shared headwear item fitted independently to Eddy, Noir, Celeste, Phoebe and Elsie. The design is a warm ivory six-panel cotton baseball cap with a curved brim and a small dark-olive botanical sprig centered on the front panel.

## Asset contract

- `design-reference.png` is the user-supplied product reference.
- `cap-directions-source.png` is the built-in ImageGen item-only 16-direction source. It is not used directly by the runtime.
- `*-fit-reference.png` are the five character-specific fitting references produced against each canonical standing atlas.
- `node tools/prepare-ivory-botanical-cap.cjs` removes disconnected generation noise, calibrates each cap to its canonical cell, preserves canonical ear/forelock identity pixels, and exports separate lossless overlays and shape-specific hide masks.
- Runtime files are `assets/speaking-system/cosmetics/{character}/ivory-botanical-cap.webp` and `ivory-botanical-cap-hide.webp`.
- The inventory image is `assets/speaking-system/cosmetics/shared/ivory-botanical-cap-display.png`.

The cap occupies the `headwear` slot and remains compatible with tops, full-body garments, lower-body garments and shoes. Its mask is derived from this cap geometry; the fedora mask is never reused.

## QA

Inspect all sixteen cells in `qa-*-composite.jpg`, `qa-*-light.jpg` and `qa-*-blink.jpg`. Confirm the brim follows the muzzle direction; ears and defining forelock/hair remain intact; no cap floats, reverses, clips an eye or muzzle, exposes a rectangular cut, or carries edge speckles. Browser QA must also cover all metadata-defined standing directions, blink, dark/light backgrounds, closet scale, map scale, saved/draft isolation and combinations with representative body garments.
