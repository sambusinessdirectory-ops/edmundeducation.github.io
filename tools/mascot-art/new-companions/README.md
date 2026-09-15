# Noir and Celeste map companions

Noir is a boy; Celeste is a girl. Reference designs were supplied by the user in `Noir Character Full Sheet.png` and `Celeste Full Character Sheet.png`.

`chroma-source.png` is the derived extraction sheet. Rebuild with:

```
node tools/mascot-art/build-new-companions.cjs tools/mascot-art/new-companions/chroma-source.png
```

The builder removes chroma, retains the largest connected character per cell (excluding ears from neighboring rows), registers feet to a common baseline, and exports transparent PNG and WebP atlases. Its explicit source/mirror table corrects the source sheet's inconsistent left/right ordering. Rear diagonal views must face away from the camera.

Both map renderers import `MAP_COMPANIONS`. New companions currently have standing map views only; registered eye-only blink atlases now preserve every body and alpha pixel. Run the builder with `blink-source.png --blink`, then `node tools/mascot-art/register-new-companion-blinks.cjs` to regenerate them. They do not expose an unfitted clothing closet or seated classroom pose. Existing trophy artwork remains separate from map companion selection.

Validation: `tools/test-new-companions-browser.cjs` exercises all eleven lesson portals; `tools/test-writing-chess-map-browser.mjs` covers the writing map. Shared flashcard range maps use the same expression-map registry.

Six trophy designs and their exact built-in image-generation prompts are in `trophies/`. Run `node tools/mascot-art/build-new-companion-trophies.cjs` to export the transparent WebP rewards. Variant artwork uses the gold master alpha when a generated variant contains a painted checkerboard.
