# Eddy and Noir fantasy full-body trio

Three boys-only garments from the user's three-outfit reference: crimson gilded court coat, shadow thorn robe, and ivory wayfarer robe. Each is a separate catalog item with an Eddy and a Noir fit. Each uses the `fullBody` slot with top and lower-body coverage, so equipping it clears shirts and pants. Headwear and footwear remain available. The price is 45 coins per item, consistent with existing full-body garments.

## Release state

**Visual review accepted.** The user explicitly approved all three exact actual-renderer proof boards in Codex chat on 2026-10-02T17:59:08Z. The three `visual-acceptance-*-v1.json` files hash-lock the runtime assets and proof. The live Supabase migration was applied as `20261002180418_boys_fantasy_fullbody_trio`; site publication follows separately. The migration preserves the newer smart-casual top allowlist and adds boys full-body slots to character saves.

## Sources and method

`design-reference.png` is the user's screenshot. The six `*-fit.png` files are generated fitting references showing each outfit on each character across the 4 × 4 standing atlas. The six `*-item-source.png` files are garment-only silhouette guides. The three `*-product-cutout.png` files supply the shared closet cards. See `generation-prompts.md` for the image-generation briefs and input roles.

`tools/prepare-boys-fantasy-fullbody-trio.py` aligns each item silhouette to its fit reference and extracts only costume pixels into a 1024 × 1024 overlay, 16 directions per character. It retains the canonical mascot face, mane, bridle, tail, and hooves. Eddy's red coat includes dark integrated undertrousers below the coat tails because separate pants are removed when full-body clothing is equipped. The pipeline also produces 512 × 512 catalog images and light/dark flat composites. The runtime assets are:

- `assets/speaking-system/cosmetics/{eddy,noir}/{crimson-gilded-court-coat,shadow-thorn-robe,ivory-wayfarer-robe}.webp`
- `assets/speaking-system/cosmetics/shared/{crimson-gilded-court-coat,shadow-thorn-robe,ivory-wayfarer-robe}-display.png`

## Build and review

1. Run `python3 tools/prepare-boys-fantasy-fullbody-trio.py` with Pillow and NumPy available.
2. Run `node tools/test-boys-fantasy-fullbody-browser.cjs` to capture the actual 3D standing renderer in all 16 directions for both characters, including blink, light background, and cap plus boots.
3. Run `python3 tools/build-boys-fantasy-fullbody-review.py` to build `qa-overview-v1.jpg`, each `qa-approval-*-v1.jpg` and `qa-detail-*-v1.jpg`, and pending hash manifests.
4. Run `node tools/test-wardrobe-visual-acceptance.mjs --allow-pending` to verify hashes during review. The ordinary release gate must stay closed until the reviewer accepts the exact shown proof.

These are standing sprite overlays, not rigged 3D clothing. The renderer wraps the character atlas in its usual 3D scene. Automated checks establish state and renderer coverage only; visual quality requires the user's approval.

## Source hashes

The build inputs and preparation script are SHA-256 recorded in `source-hashes.sha256`. The manifests record exact hashes for every runtime asset and proof image.
