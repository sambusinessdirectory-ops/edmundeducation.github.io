# Charcoal rain jacket with pink piping

A girls wardrobe item available in Celeste, Phoebe and Elsie’s inventories. Availability is shared; `celesteTop`, `phoebeTop` and `elsieTop` remain separate saved equipment slots.

- Each character has a separately fitted 16-view overlay at 1024×1024.
- The original standing atlases remain the source of faces, manes, bodies, poses and animation.
- `design-reference.png` is the user-provided garment reference. `*-fit.png` are generated fitting references, never used directly at runtime.
- `prepare-girls-pink-rain-jacket.cjs` extracts only the charcoal fabric and pink piping, then prepares the transparent inventory thumbnail.
- Review composites show the overlays on their untouched original character atlases.

The extraction mask is limited to the jacket torso/sleeve band of each registered cell; pale hair and skin are excluded by their color, while the lower hoof area is excluded by the mask bounds. Inspect all sixteen cells when the fit source changes.
