# DSE mascot views and exam behaviour — 8 September 2026

Current classroom assets are in `assets/speaking-system/mascots/v2/`: six RGBA PNG atlases (Eddy, Elsie and Phoebe, each standing and seated) and six numeric `.flow` correspondence fields. Each pose has 16 measured views. Artwork was generated and transparency extracted with the built-in `image_gen` tool. Selected outputs were copied unchanged; no Python pixel retouching was applied. The original supplied Eddy animation remains preserved in the repository.

`prompts.json` records the six initial image-generation prompts. The subsequent image edits asked ImageGen to remove the checkerboard/backdrop, retain all sixteen complete characters, and return genuine transparent alpha while preserving character identity and pose. `sources.json` identifies selected generated files and published hashes. Prompt angle instructions were not reliably followed by the generator: `view-order.json` explicitly maps the actual artwork, including nonuniform angular intervals, instead of assuming row order is correct.

The creative briefs specify Eddy's dark warm chestnut `#A35627`, Elsie's brighter copper `#C56523`, and Phoebe's muted chestnut `#A76742`. The renderer calibrates saturated coat regions to these base swatches while retaining texture and shading. Hair, blazes, hooves, blue bow, halter and eye colours are excluded as far as the colour mask permits. Lighting and shaded artwork naturally produce values other than the base swatch.

`analyse-views.py` measures alpha silhouettes, crop coordinates, foot baselines, torso centres and muzzle locations. It calculates smoothed bidirectional optical flow in memory and writes numerical displacement fields and `speaking-mascot-views.mjs`. Rebuild from the site root with Python, Pillow, NumPy and OpenCV installed:

```
python tools/mascot-art/v2/analyse-views.py
```

`MascotCharacters` projects the views onto a shallow curved surface in the existing 3D classroom. Neighbouring views deform with camera angle. At each handover the renderer selects one warped source, avoiding the doubled eyes and translucent limbs produced by alpha cross-fading distinct illustrations. Head and torso select views independently, joined below the muzzle. This remains illustrated 2.5D, not a reconstructed volumetric mesh; some shape changes can remain at handovers and steep vertical angles. The image-generation views are not exact equal-angle scans.

Exam phases use seated artwork with bent knees and the existing school chairs. The feet use a consistent floor anchor; the seated hips are near the chair's 0.46-unit seat height. The current turn controls a short mouth-opening cycle with phrase pauses. This is turn-driven animation, not audio/phoneme lip-sync. Other candidates ease their gaze toward the speaker and nod at separately phased intervals of about five seconds. Reduced motion stops mouth, breathing and nod animation and sets attention directly. Blank candidate names leave empty chairs. Asset loads are shared within a classroom and disposed on remount, including late and failed loads.

Validation: `test-speaking-mascot-behaviour.mjs` covers colours, phase selection, wraparound, syllable pauses, gaze and staggered nods. `test-speaking-mascot-characters.mjs` covers all 96 measured views, RGBA/flow integrity, independent candidate state, shared resources, floor anchoring and disposal. Real Chromium checks exercised lobby-to-exam seating, speaker switching/stopping, mouth openings/pauses, both listeners' gaze/nods, reduced motion, eleven viewing angles, 2/3/4 candidates and 390px mobile layout, without shader or local asset errors. The preview uses the same production renderer at `elsie-model-review.html`.
