# Navy fish bucket hat and ivory race-car baseball cap

These are two deliberately different `headwear` items for Eddy, Noir, Celeste, Phoebe and Elsie.

- `navy-fish-bucket-hat` has a soft cylindrical crown and a continuous 360-degree downward brim. It has no front visor, top button or baseball-cap panel construction.
- `ivory-racecar-baseball-cap` has a fitted six-panel crown, top button, eyelets and a forward curved visor. The red race-car embroidery appears only where its front panel is visible.

The design reference is the user's two-hat image. The two `*-source.png` files are separate built-in ImageGen item-only direction sources. `tools/prepare-all-fish-bucket-race-cap.cjs` closes their generic ear holes, registers each silhouette to the accepted botanical-cap landmarks for each character, then reopens only detected character-specific ears. It exports ten lossless RGBA atlases, ten exact alpha-derived hide masks, five item-only PNGs per design, inventory art and flat QA composites.

`tools/test-all-fish-bucket-race-cap-browser.cjs` verifies that the bucket brim remains at least eight percent wider than the baseball cap on every character, hide alpha matches the item alpha, no hat reaches the protected eye band, and every item renders in all sixteen directions through the actual 3D compositor. It captures dark/open, midtone/blink, light/open, high-risk clothing-plus-boots/open and the same combination/blink.

`qa-approval-v1.jpg` is the consolidated review surface. Its automated status is only a mechanical renderer pass. The user explicitly accepted the displayed pixels in Codex chat on 2026-10-03, and both `visual-acceptance-*.json` manifests lock that approval to the exact asset and evidence hashes. Production release remains permitted only while the fail-closed gate validates those hashes.
