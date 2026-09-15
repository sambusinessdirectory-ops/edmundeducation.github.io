# Eddy - Blue swordsman jacket

SOP trial, 15 September 2026. Approved for publication after local review.

## Design and registration
- Slot: top; replaces either sweater; independently combines with white-fedora.
- Navy fantasy jacket, silver piping, asymmetric front closure, high collar, short split hem, fitted bracer cuffs.
- Only garment pixels from the generated fitting reference enter the runtime.
- Original Eddy base, face, ears, mane, legs and tail remain in use.
- 1024 x 1024 RGBA WebP; sixteen registered 256 x 256 cells.
- Built-in image_gen was used. Full prompt: [prompt.txt](prompt.txt).
- Inputs: [design-reference.png](design-reference.png) and the canonical Eddy standing atlas.
- Generated fitting reference: [fitting-reference.png](fitting-reference.png).
- Extraction script: ../../../../tools/prepare-eddy-swordsman-jacket.py.
- Runtime: assets/speaking-system/cosmetics/eddy/blue-swordsman-jacket.webp plus its -icon.webp.
- Metadata and output hash: [item-spec.json](item-spec.json).

## What this trial added to the SOP
The navy fabric is extracted by a blue-channel selector. Silver trim is retained in a constrained neighborhood; bracer pixels use a separate dark-neutral selector and cuff Y range. Operations and RGB padding are clamped per cell.

Morphological closing initially reintroduced 157 bright magenta pixels. A post-closing chroma-key rejection removed them. The resulting visible alpha contains zero pixels matching the bright-magenta contamination check. Color selectors remain specific to this reference.

## Review
[rendered-review.png](rendered-review.png) shows front, three-quarter, side and rear in the real shader: top row without fedora, bottom row with fedora.
[all-views-review.png](all-views-review.png) shows all sixteen composited views.

Passed locally:
- RGBA dimensions and all sixteen populated cells.
- No bright magenta pixels in visible alpha.
- Jacket replaces a sweater without removing the hat.
- Wrong-slot and other-character exclusion.
- Named outfit save and reload via fixture RPC.
- Existing sweaters, removal and account isolation.
- 3D closet and mobile inventory layout.
- Unwarped garment rendering both with and without the fedora.

Run:
```bash
python3 tools/prepare-eddy-swordsman-jacket.py
node --test tools/test-eddy-cosmetics.mjs
node tools/test-eddy-cosmetics-browser.cjs
```

## Publication requirement
The prepared migration supabase/migrations/20260915082642_eddy_blue_swordsman_jacket.sql adds the jacket ID to the existing server top allowlist. The allowlist migration has been applied to production and verified with SQL checks for the jacket, hat combination, existing tops and invalid inputs. Fixture-save tests are not production cloud-save tests.

Before publication, apply and validate that migration, update the dependent module/asset cache versions, run release checks, deploy, and verify public resources. Preserve the separate uncommitted Golden Manual work.


## Side-profile correction, 15 September
Built-in image generation edited only the right-facing profile to extend the navy front and silver trim over Eddy's belly. The extractor takes only cell 4 from `side-repair-reference.png`; every other frame remains byte-identical to the accepted atlas. Prompt: preserve the registered 4×4 sheet, widen row 2 column 1's jacket front approximately 8 pixels at 1024 resolution from below neck to hem, close cuff gaps, retain all other poses. Reviewed in the actual standing shader with and without the fedora. Inventory uses the user's original garment photographs independently of wearable sprite art.
