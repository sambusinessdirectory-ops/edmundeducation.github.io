# Ivory botanical baseball cap V2

`ivory-botanical-cap` is a shared headwear item fitted independently to Eddy, Noir, Celeste, Phoebe and Elsie. The design is a warm ivory six-panel cotton baseball cap with a curved brim and a small dark-olive botanical sprig centered on the front panel.

## Asset contract

- `design-reference.png` is the user-supplied product reference.
- `*-fitting-v2.png` are the five built-in ImageGen worn fitting references generated against the canonical 4 x 4 character atlases.
- `*-cap-overlay-v2-source.png` are matching cap-only transparent sources. They preserve the exact worn silhouette, brim direction and ear openings for each character and view.
- `*-fit-reference.png` are generated composites used to inspect registration against each canonical standing atlas.
- `node tools/prepare-ivory-botanical-cap.cjs` removes disconnected generation noise, reads the character-specific worn landmarks, calibrates every cap-only cell to that fit, and exports separate lossless overlays and shape-specific hide masks.
- Runtime files are `assets/speaking-system/cosmetics/{character}/ivory-botanical-cap.webp` and `ivory-botanical-cap-hide.webp`.
- The inventory image is `assets/speaking-system/cosmetics/shared/ivory-botanical-cap-display.png`.

The cap occupies the `headwear` slot and remains compatible with tops, full-body garments, lower-body garments and shoes. Its mask is derived from this cap geometry; the fedora mask is never reused.

## QA

Inspect all sixteen cells in `qa-*-composite.jpg`, `qa-*-light.jpg`, `qa-*-blink.jpg`, `qa-*-3d-open.jpg`, `qa-*-3d-blink.jpg`, and the two `qa-*-combination-3d-*.jpg` boards. Confirm the brim follows the muzzle direction; ears and defining forelock/hair remain intact; no cap floats, reverses, clips an eye or muzzle, exposes a rectangular cut, or carries edge speckles. The representative combinations are the blue swordsman jacket for Eddy and Noir and the ivory tiered dress for Celeste, Phoebe and Elsie.

The browser test proves loading, direction coverage, blink rendering and a representative combination in the actual renderer. It deliberately reports a **MECHANICAL PASS**, never a visual pass. Production release is blocked until `visual-acceptance-v2.json` is signed for the exact asset and evidence hashes. Any changed byte invalidates that approval.

## V1 failure and V2 correction

V1 scaled one generic cap from whole-character upper-body bounds. Hair, mane and ears contaminated those bounds, so Phoebe received an oversized, low cap even though the asset loaded and automated tests passed. The bad appearance was also visible in stored QA evidence but was not treated as a release blocker.

V2 uses a worn fitting reference and an item-only source for every character and every direction. It constrains the cap above the eyes, fits the crown to the skull rather than the mane, retains natural ear openings, and adds a fail-closed human visual-acceptance manifest to the deployment workflow.
