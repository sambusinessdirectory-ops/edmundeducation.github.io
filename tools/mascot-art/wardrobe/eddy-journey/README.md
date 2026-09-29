# Eddy exercise journey wardrobe

`*-target-4x2.png` are contact-sheet references made from the canonical bare
walk, jump and encourage strips. The three olive T-shirt fitting references
guide its sleeve and hem silhouette. Other garments are drawn directly over
the original animation pixels with clean colors and garment details.

Run `tools/prepare-eddy-journey-clothes.py` with Pillow and NumPy to rebuild
the eight-frame transparent WebP strips in
`assets/sentence-structure/exercise-eddy/`. Eddy's original body pixels are
always the base. No generated skin, face, mane, leg, hoof or tail pixels are
used. The builder draws flat, smooth fabric, collar and jacket details and
composes each top with the fedora.
QA frames go to
`/tmp/eddy-journey-qa` by default; set `EDDY_JOURNEY_QA` to change that path.

`eddy-journey-review.png` shows one representative frame from each motion and
item at approximately the app's display size. Final visual checks should also
inspect all eight frames against light and dark backgrounds.
