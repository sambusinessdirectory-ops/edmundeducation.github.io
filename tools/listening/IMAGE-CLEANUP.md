# DSE listening image cleanup

## Current release: restored-v2

The first pass was too weak on coarse scan dots. The current pipeline uses native
PDF image pixels (including reassembled horizontal scan strips) for the affected
photos, then descreening, non-local means denoising and contrast correction.
The ship comes from a cleaner copy of the same printed illustration in the user's
other 2020 PDF. No objects, faces or diagram features are generated.

Run `tools/listening/restore_images.py --qa-dir /tmp/dse-restored-comparisons`
with Python, Pillow, numpy, opencv-python-headless, pypdf and pdfplumber installed.
The supplied source PDFs must be mounted at the paths documented in that script.
Then run `node tools/test-dse-image-enhancements.mjs` and the native question
browser test. Inspect every before/after comparison, not only file dimensions.

The current manifest is `assets/dse-listening/restored-v2/manifest.json`. Each
entry records the exact original-file checksum plus the restoration source and
crop where relevant. Original files and previous published derivatives remain
untouched. Maps, thin lettering and intentional pixel artwork receive lighter
treatment or are preserved when additional cleanup would damage them.

## Archived first pass: enhanced-v1 (do not use for the current release)

All images referenced in current `dse-listening-YYYY-data.js` task blocks are covered.
Unused full-page scans are deliberately excluded. Original files are never rewritten.

Run with Python 3 + Pillow and Node.js:

```sh
python3 tools/listening/enhance_images.py --qa-dir /tmp/dse-image-comparisons
node tools/test-dse-image-enhancements.mjs
```

This is **non-generative** spatial filtering, followed by Lanczos resizing:

- Halftone photos: gentle Gaussian smoothing and low-strength unsharp mask.
- Other photos: lighter smoothing/sharpening.
- Maps, lettering, drawings and pixel art: retain 90% of the source pixels and blend 10% median-filtered pixels to reduce isolated specks.
- No neural model, reconstruction, inpainting, colorization, cropping or thresholding.

Outputs have 640, 1280 and 3840 pixels on the long edge, preserving aspect ratio
to the nearest pixel. A 4K enlargement does **not** recover missing source detail.
WebP compression is lossy; the originals remain the preservation copies.

`assets/dse-listening/enhanced-v1/manifest.json` records source SHA-256 checksums,
processing profiles and output dimensions. The generated browser manifest maps
the original references to responsive copies without modifying the exam data.
Normal task pages lazily load 640/1280 versions. Existing image enlargement links
open the 3840 version, without an extra visible enlargement caption.

Inspect matched-size before/after comparisons and run the native question browser
test before deploying. It checks all 44 available tasks at desktop/mobile sizes,
including enhanced image loading and interactive answer controls.

To revert the display, remove the `upgradeDseImages` wrapper from
`renderDseBlock`; the unchanged original image references remain in the task data.
