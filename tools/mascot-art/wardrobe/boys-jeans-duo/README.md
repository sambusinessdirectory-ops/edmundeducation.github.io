# Boys jeans duo

Catalog group: `boys` (Eddy and Noir). Equipment slot: `lower`.

The source photograph contains a charcoal black wash and a medium classic blue wash. The four `*-fit.png` files are independent 4×4 worn fitting references created with built-in ImageGen against Eddy's or Noir's exact canonical standing atlas, using the screenshot as a garment design reference. The prompt preserved all 16 view positions, original identity and transparent background, added only the specified jeans, left hooves bare and placed each tail outside the waistband. These fitting references are not runtime character replacements.

`tools/prepare-boys-jeans-duo.cjs` extracts denim-coloured pixels from the fitted sources into four registered 1024×1024 overlays, using the canonical base to reject generated anatomy. Charcoal extraction is restricted by the same character's blue-denim lower-body silhouette. A per-view waistband envelope trims tail-like protrusions. Dark denim fly-seam pixels are recovered only where the same character’s blue-denim guide confirms fabric, preventing the base coat from showing through. Each `*-item-source.png` is clothing-only and each runtime WebP is lossless with cell-local transparent RGB padding.

The runtime composites lower-body clothing before tops, so a shirt hem covers the waistband; full-body pieces still clear both slots. Boots and hats remain compatible. The database migration adds `eddyLower` and `noirLower` to equipment validation and account saving.

The browser fixture captures all 16 views for both items and both characters in the actual renderer, including open/blink, dark/light backgrounds, white tee plus jeans, and Oxford top plus jeans plus hat plus boots. The approval board and SHA-256 manifests are pending explicit human visual acceptance under the v5 wardrobe SOP.
