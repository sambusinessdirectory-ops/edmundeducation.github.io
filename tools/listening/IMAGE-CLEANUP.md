# DSE listening image cleanup

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
