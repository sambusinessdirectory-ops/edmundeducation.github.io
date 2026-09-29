# Eddy exercise journey wardrobe

`*-target-4x2.png` are contact-sheet references made from the canonical bare
walk, jump and encourage strips. Each `*-fit-smooth.png` sheet contains eight
pose-specific renders of an existing Eddy wardrobe model. The original
transparent fedora model is in `assets/speaking-system/cosmetics/eddy/`.

Run `tools/prepare-eddy-journey-clothes.py` with Pillow and NumPy to rebuild
the eight-frame transparent WebP strips in
`assets/sentence-structure/exercise-eddy/`. The builder registers each fitted
render to its canonical motion frame, removes the light background and matte,
and retains the model's fabric texture, seams, pockets, print, and full-body
rendering. It does not mix body pixels from separate renders or repaint the
garments. Fedora-only strips use the canonical bare body with the existing
transparent fedora model; combinations put that model over each fitted frame.
QA frames go to
`/tmp/eddy-journey-qa` by default; set `EDDY_JOURNEY_QA` to change that path.

`eddy-journey-review.png` shows one representative frame from each motion and
item at approximately the app's display size. Final visual checks should also
inspect all eight frames against light and dark backgrounds.
