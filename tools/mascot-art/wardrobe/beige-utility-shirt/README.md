# Beige rolled-sleeve utility shirt

- Item ID: `beige-utility-shirt`
- Catalog group: boys (`eddy`, `noir`)
- Slot: top; compatible with headwear and footwear
- Price: 30, matching existing utility/camp shirts
- Pose family: standing; 16 directional views per character, open and blink
- Design: warm sand-beige button-up with a pointed open collar, two flap chest pockets, small tan buttons, rolled tab sleeves, and a curved hem
- Release state: **pending human visual acceptance** under the v4 Golden Manual; the migration and site changes are local only

## Source and runtime files

`design-reference.png` is the user's product screenshot. `product-cutout.png` is an isolated catalog source. `eddy-fit.png` and `noir-fit.png` are full-character fitting references made with built-in ImageGen; they are not runtime character replacements. The image-generation prompts and input roles are in `generation-prompts.md`.

`tools/prepare-beige-utility-shirt.py` resizes the fitting references to the canonical 1024 × 1024 grid, selects garment-colored pixels in each 256 × 256 upper-body cell, and exports independent full-canvas RGBA WebP overlays. It also writes item-source PNGs, light/dark flat composites, and the shared 512 × 512 inventory image.

Runtime files:

- `assets/speaking-system/cosmetics/eddy/beige-utility-shirt.webp`
- `assets/speaking-system/cosmetics/noir/beige-utility-shirt.webp`
- `assets/speaking-system/cosmetics/shared/beige-utility-shirt-display.png`

The website retains its original mascot body, face, eyes, mane, legs, hooves, and tail. The runtime overlays contain only shirt pixels.

## Source hashes

| Source | SHA-256 |
| --- | --- |
| `assets/speaking-system/mascots/v4/eddy-standing.png` | `07d0beb9dd367d04310d6fd0f20662cb565ede654b4131041f6802adfc2f011e` |
| `assets/speaking-system/mascots/v4/noir-standing.png` | `fc3d5b179363285f6a6dfc0252027c1bdb1a9b1ef2aebb43850effd16a7b2e8c` |
| `design-reference.png` | `67e89ee51cb585cc5d49f401642f3435e4feb66f7c3e825bb31b8a2efeb019ed` |
| `product-cutout.png` | `22a81df161171902f03b767069dbc7f0b26f715cb1a1b8c9300f01a720f97eac` |
| `eddy-fit.png` | `ad7b0be4ce8be2a4bae1ac1d72645a22cf0e8b7893c0b4f0eff1cbc43e38fcea` |
| `noir-fit.png` | `2715216eb833afa24a5b39a6ddee2eefa6b951e7a06b8590fe9591acdb81c42d` |
| `tools/prepare-beige-utility-shirt.py` | `001c972d0b1ae544291067949ddfe46ca57ba0c734ce32e42c13367bff43e71c` |

The exact runtime asset and proof hashes are recorded in `visual-acceptance-beige-utility-shirt-v1.json`.

## Rebuild and review

From the repository root, using the bundled Pillow/NumPy Python and Node/Playwright runtimes:

1. Run `tools/prepare-beige-utility-shirt.py`.
2. Run `tools/test-beige-utility-shirt-browser.cjs` to capture all 16 directions for both characters through the actual 3D standing renderer, open/blink, light/dark, and shirt plus botanical cap and boots.
3. Run `tools/build-beige-utility-shirt-detail.py` and `tools/build-beige-utility-shirt-approval.cjs` to make enlarged and consolidated proof and refresh the hash manifest.
4. Run `tools/test-wardrobe-visual-acceptance.mjs --allow-pending` to check hashes while awaiting human review. The release gate without that flag must fail until explicit human visual acceptance is recorded.

The proof board is `qa-approval-v1.jpg`; `qa-detail-v1.jpg` enlarges front, profile, rear, and diagonal views. The individual `qa-*-3d-*.jpg` files provide the full 16-view actual-renderer evidence.

## Limits

The shirt is fitted only to standing sprites. It is not a rigged 3D mesh, seated outfit, or walking-frame garment. Generated fitting references contain altered character pixels, but those pixels are discarded by the garment-only extractor. The reference photograph suggests a linen texture; the catalog describes the visible style without claiming a verified fabric composition. Automated renderer and state checks are mechanical evidence, not visual acceptance.
