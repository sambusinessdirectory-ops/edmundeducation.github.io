# Cream sherpa jacket: three-character fitting package

The supplied ivory fleece reference is catalog item `cream-sherpa-jacket`. The item is available to Celeste, Phoebe and Elsie; equipped clothing, saved sets and favorites are independent per girl; each uses an independent 1024 x 1024 transparent overlay with 16 canonical cells.

## Authoring

Built-in ImageGen created each `*-fit.png` against its original character atlas. Exact prompts are saved in `prompts.json`. These fitting sources are not replacement base sprites. `node tools/prepare-girls-fleece.cjs` extracts the garment and preserves the original character. The supplied product photograph is the inventory display image.

Follow Golden Manual v3's fitting, registration, alpha and actual-renderer acceptance principles. For this girls catalog, a complete item requires all THREE fits (Celeste, Phoebe, Elsie), extending the existing paired Eddy/Noir standard. Never stretch one character's overlay onto another.

## Extraction findings

Pale fleece highlights cannot be discarded as background. Elsie's initial color mask left holes; the final extractor admits pale highlights and protects the original mane separately. Morphology runs in two explicit stages so dilation and erosion cannot override each other. Celeste's creamy garment is segmented separately from her cool white hair. Source-specific thresholds are not a universal remover. Review neck, cuffs, belly and tail boundaries whenever artwork changes.

## Saved-state contract

Existing `headwear` and `top` remain the boys slots. Girls use independent `celesteTop`, `phoebeTop` and `elsieTop` slots. Item availability and artwork are catalog concerns; availability must never automatically synchronize equipped clothing. A girls named set has both `group: girls` and its `character`. The same set name can exist independently for all three girls. Remove-all, equip-set and favorite actions affect only that character.

`character_closet_sync` validates the account, locks the account wardrobe row and merges only the selected character's equipment and sets. It preserves other characters even if a different page holds an older snapshot. Existing shared girls looks and sets are copied once into independent entries to preserve visible choices; subsequent updates are separate. Old pages must reload before saving through the retired whole-wardrobe write endpoint, preventing shared snapshots from overwriting independent outfits. The original restore RPC remains available. Celeste continues to use the Rose Atelier room.

## Verification

- Wardrobe unit checks include group isolation and three distinct fitted assets.
- `tools/test-girls-fleece-browser.cjs`: all three actual closets, 16 open-eye and 16 closed-eye 3D views per character, inventory photograph, equipped status, same-name character separation, favorites, save/reload and unsaved cancel/discard.
- `tools/test-girls-fleece-portals.cjs`: Elsie clothed with Phoebe/Celeste independently bare, and available closet controls for all three girls in all eleven lesson portals; boys saved equipment remains intact.
- Base character and blink atlases are unchanged; this package does not retouch pre-existing sprite art. Rendered QA includes the current base/blink artwork.

The migration was created using the Supabase CLI, then ordered after the previous future-dated shared-three-garments migration so a clean replay cannot revert the expanded equipment validator.

- `tools/test-independent-girls-outfits-browser.cjs`: independent equip/save/reload, remove-all, same-named sets, favorites and discarded Celeste closet preview.
