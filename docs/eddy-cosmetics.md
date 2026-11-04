# Shared Eddy and Noir modular wardrobe

For the complete fitting, state and release standards, use the Modular Character Wardrobe Golden Manual v3. The older repository v2 manual describes the historical pipeline.

Eddy and Noir share one student-owned catalog, one headwear slot and one top slot. The white fedora combines with any top. The tops are cream cable-knit crewneck, charcoal turtleneck, blue swordsman jacket, brown leather bomber jacket, charcoal sunburst hoodie and black blazer over hoodie. Choosing Noir renders Noir's independently fitted atlas for the same saved item IDs and named/favorite sets. Elsie, Phoebe and Celeste do not use this shared catalog.

The standing sprite contract is a 1024 by 1024 atlas of sixteen 256-pixel views. Character-specific overlays contain only garment pixels; the canonical standing and blink characters remain the base. The three newest tops have unmodified Eddy and Noir fitting references, design screenshots, prompts, hashes, review captures and a reproducible extractor in `tools/mascot-art/wardrobe/shared-three-garments/`. Run `python3 tools/prepare-shared-three-garments.py` to rebuild their six lossless WebP overlays. The sunburst source shows only the back, so its plain front is an art inference. Blazer plus hoodie is one combined top in the current slot model.

`eddy-cosmetics.mjs` caches a composite per character, base image and equipment. Maps read saved equipment; the open closet reads draft equipment. A successful save acknowledges the shared wardrobe record; cancel/discard keeps saved state intact. Standing 3D actors use dressed open and blink atlases and disable bare-body optical flow while equipped. Seated clothing is not supported.

The existing `eddy_closet_sync` RPC validates student ownership. The three new IDs require the allowlist-only migration `supabase/migrations/20260916001200_shared_three_garments.sql` before production saves will accept them; GitHub Pages does not apply migrations automatically. The migration does not change the table, account model, grants or RPC. No real student account is modified by fixture tests.

Validation includes `tools/test-eddy-cosmetics.mjs`, `tools/test-shared-three-garments-browser.cjs`, both Eddy and Noir wardrobe browser fixtures, `tools/test-avatar-portals-v2.cjs` and `tools/test-speaking-mascot-characters.mjs`. Light/dark and 3D all-view sheets are in the shared-three-garments QA directory. Human appearance review and public asset/database verification are separate release gates.
