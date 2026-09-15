# Eddy + Noir: three shared tops

The item IDs are `brown-leather-bomber`, `sunburst-hoodie` and `black-blazer-hoodie`. Each occupies the existing `top` slot and is compatible with the shared white fedora. A single saved item ID selects independently fitted artwork for Eddy or Noir; no generated body or face replaces either canonical character.

## Sources and design decisions

- The three `*-original.png` files are unmodified user screenshots. `*-reference.jpg` are compact review copies.
- Six `*-fit.png` files are unmodified ImageGen fitting outputs. The built-in ImageGen tool edited each canonical standing atlas with its corresponding product screenshot as a design reference. The fit output is 1254 square and is resampled once to the 1024 square canonical canvas during extraction.
- The sunburst screenshot shows only the back. A plain faded-black front with drawstrings and kangaroo pocket is an inferred design detail; the warm ivory symbol appears in rear views.
- The blazer-over-hoodie screenshot is treated as one combined top because the current shared wardrobe has one top slot.
- Canonical bases: `assets/speaking-system/mascots/v4/{eddy,noir}-standing.png`; blink resources and view order come from `speaking-mascot-views.mjs`.

## Rebuild and integration

Run `python3 tools/prepare-shared-three-garments.py` from the repository root with Pillow and NumPy. The per-cell extractor compares the fit against the original character, selects garment colors and silhouette, fills enclosed design holes, rejects neutral matte, antialiases alpha and pads edge RGB from opaque garment colors. It writes six lossless 1024-square WebP overlays into the character-specific cosmetics directories. The original bases, fedora and hat-hide masks remain independent assets. Parameters are calibrated to these six references, not a general garment segmentation algorithm.

The catalog and thumbnail mapping are in `eddy-cosmetics.mjs` and `eddy-closet-inventory.mjs`. The SQL allowlist extension is `supabase/migrations/20260916001200_shared_three_garments.sql`; it changes accepted IDs only, preserving the student-owned wardrobe table, slot semantics, RPC, permissions and saved records. The module/asset cache tag is `20260916-three-tops1`.

## QA and limits

`qa/paired-light-contact-sheet.jpg`, `qa/paired-dark-contact-sheet.jpg` and `qa/paired-3d-contact-sheet.jpg` summarize all sixteen standing directions for both characters. The browser fixture `tools/test-shared-three-garments-browser.cjs` captures each item alone, with fedora, and in the actual 3D standing renderer; it checks dressed open/blink atlases and disables bare-body optical flow. Existing Eddy, Noir and cross-portal fixture journeys cover saved sets, favorites, draft discard, account isolation and restoration.

The generated fit is artwork, not proof of anatomical precision at every animation moment. Standing poses are supported; seated fits are not. Human appearance acceptance and live migration/deployment verification remain release gates. The production database currently rejects the new IDs until this migration is applied. The GitHub Pages workflow excludes `supabase/`, so the migration must be applied and verified separately before the new catalog is published.
