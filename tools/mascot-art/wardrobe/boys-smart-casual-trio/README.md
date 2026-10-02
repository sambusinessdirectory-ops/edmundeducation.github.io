# Boys smart-casual trio

Catalog group: `boys` (Eddy and Noir). Slot: `top`.

The six `*-fit.png` files are independent character-specific fitting references produced against each canonical 4x4 standing atlas. They are not runtime character replacements. `tools/prepare-boys-smart-casual-trio.cjs` extracts only garment-coloured pixels, preserves 1024x1024 registration, pads transparent edge RGB per cell, and writes the six lossless runtime WebP overlays plus item-only PNG sources.

The black sweater is restricted by the union of the same character's independently extracted shirt and blazer silhouettes. This prevents dark mane, muzzle, hoof and tail pixels from entering the garment while retaining that character's own fit; no Eddy overlay is reused for Noir.

The visual-acceptance manifests record the user's explicit approval of the actual-renderer proof board. Deployment remains permitted only while the locked asset and evidence hashes pass the fail-closed gate.
