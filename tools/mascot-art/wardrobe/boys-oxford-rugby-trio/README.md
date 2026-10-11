# Eddy and Noir Oxford and rugby tops

Catalog group: `boys` (Eddy and Noir). Slot: `top`.

The six `*-fit.png` files are independent fitting references generated against each character's canonical 4×4 standing atlas using the supplied Oxford or rugby design screenshot. They are guides only. `tools/prepare-boys-oxford-rugby-trio.cjs` rejects the generated anatomy using canonical-base difference and garment color selection, preserves 1024×1024 cell registration, and writes six lossless clothing-only WebP overlays plus item-only PNG sources.

The rugby overlays are restricted by each character's independently extracted Oxford top silhouette, expanded eight pixels, to avoid dark mane, muzzle, hoof and tail pixels. No Eddy overlay is used for Noir.

`tools/test-boys-oxford-rugby-trio-browser.cjs` captures the actual 3D renderer in all 16 directions, with open and blink eyes, three background tones, and a compatible hat and boots. `tools/build-boys-oxford-rugby-trio-approval.cjs` assembles the proof and creates pending, hash-locked visual acceptance manifests. Release requires explicit human review of the board under the v5 wardrobe SOP.
