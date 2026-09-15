# Eddy's modular wardrobe

For the complete standards, production workflow, debugging history and release
checklist, see [The Golden Manual v2](golden-manual-modular-wardrobe-v2.md).

## Current architecture

The closet supports one headwear slot and one top slot for Eddy: white fedora,
cream cable-knit crewneck, charcoal turtleneck and blue swordsman jacket. The hat combines independently
with any top. Save avatar persists the preview; named sets save combinations.
Choosing a saved set equips and saves it. Remove all is a preview until saved.

The final sweaters are extracted from character-registered fitting references by
tools/prepare-eddy-tailored-sweaters.py, called automatically by
tools/prepare-eddy-cosmetics.py. Only garment pixels are exported: the original
character base is retained. The old body-front mask is no longer used by the
runtime sweater compositor. The fedora uses a brim-following hiding mask.

tools/clean-mascot-edges.py cleans the actual runtime standing and blink resources,
including elsie-blink-registered.png, and the fedora. Sweater padding is performed
by the fitted-garment extractor. Follow the Golden Manual's build order; some
original art inputs still depend on the author's Downloads folder.

eddy-cosmetics.mjs caches composites per base image and equipped state. The 2D
maps reuse canvases; 3D standing actors replace textures on the existing mesh.
Equipped sprites disable bare-body optical-flow warping to prevent clothing
distortion; turns use the nearest authored direction. Seated outfits are not
implemented.

Account-scoped equipment and up to 50 named sets are saved through
eddy_closet_sync, which validates the shared student session and item allowlist.
Local cache restores and late responses are guarded against account switches and
newer edits. Refer to the migration and Golden Manual for the access boundary.

Validation includes tools/test-eddy-cosmetics.mjs,
tools/test-eddy-cosmetics-browser.cjs,
tools/test-speaking-mascot-characters.mjs and
tools/test-horsey-portals-browser.cjs. Browser fixture tests are not a substitute
for human visual review or a production database audit.

Version 2 isolates draft clothing in the closet. Maps and other standing renderers use saved equipment only. Closing a dirty closet asks before discarding; cancel retains the draft. Successful restored logins refresh the universal student session, normalized wardrobe identities share one saved record, and focus/pageshow reconcile account changes. See tools/test-avatar-state-v2.mjs and tools/test-avatar-portals-v2.cjs for failure, discard and multi-portal coverage.
