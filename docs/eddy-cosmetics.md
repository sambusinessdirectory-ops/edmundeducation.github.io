# Eddy's modular wardrobe

The closet offers one headwear slot and one top slot. White fedora can be
combined with either cream cable-knit or charcoal turtleneck. Clicking an
equipped item removes it. Save avatar commits the current outfit; named sets
save the whole combination, and choosing a saved set equips and saves it.
Remove all previews the bare avatar, then Save avatar persists that choice.

The supplied September 14–15 clothing sheets are registered to the canonical
16-direction v4 Eddy atlas by tools/prepare-eddy-cosmetics.py. It uses the first
turnaround set, cleans detached alpha speckles, and maps each garment to a
direction-specific anchor. Full-canvas WebP layers live in
assets/speaking-system/cosmetics/eddy/. The hat hiding mask replaces the
original crown and ears. The body foreground mask preserves the face, mane,
tail and exposed hooves; it samples the current open/blink base, so it does not
freeze the eyes. The source files remain in the user's Downloads folder.

eddy-cosmetics.mjs composes on equipment/image changes and caches one atlas
per open/blink base and outfit. The 2D maps draw the cached canvas; 3D standing
actors reuse their existing mesh and shader with two replacement textures.
No garment objects or render passes are added during walking. Seated poses
keep their existing distinct artwork.

The authenticated eddy_closet_sync RPC validates the shared student session,
restricts item IDs and slots, and stores equipped items plus up to 50 named
sets in private avatar_closet.wardrobes. Direct API table grants are revoked.
RLS intentionally has no policies: access is through the checked private
function and public invoker wrapper only. The advisor's informational
RLS-without-policy notice is expected for this private table.

The local cache is student-scoped and the cloud is authoritative on restore.
Late restore/save responses cannot replace another student's wardrobe.
Explicit save failures remain visible and do not claim a successful save.

Validation: node --test tools/test-eddy-cosmetics.mjs,
node tools/test-eddy-cosmetics-browser.cjs, and
node tools/test-horsey-portals-browser.cjs. Browser tests use only fixture
accounts and block all external requests.
