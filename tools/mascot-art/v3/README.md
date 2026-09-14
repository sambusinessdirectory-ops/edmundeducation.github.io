# Blinking mascot sheets — 15 September 2026

The three `sources/*-full-rgb.png` files are the exact Eddy, Elsie and Phoebe sheets supplied for this release. Each contains 16 open-eye views followed by the corresponding 16 closed-eye views. The files arrived as RGB PNGs with a checkerboard painted into the background, rather than genuine transparency.

`extract-blink-sheets.py` removes only pale, low-chroma background pixels connected to the sheet boundary. It detects the 32 complete silhouettes instead of slicing an assumed grid: several source characters cross nominal row boundaries. Each silhouette is normalized into a 256-square cell, producing matched 1024-square RGBA `standing` and `blink` atlases in `assets/speaking-system/mascots/v4/`. The v4 matte uses a tight checkerboard chroma threshold so Elsie’s cream hair remains opaque instead of being erased as background.

`build-views.py` measures the normalized sheets, creates compatibility flow fields, and replaces the standing entries in `speaking-mascot-views.mjs`. Existing seated body atlases remain in v2 because the supplied sheets contain standing poses only. The classroom renderer uses the new standing sheet for every head, including seated candidates, so all three characters blink without making them stand through desks.

Elsie’s closed-eye poses are independent redraws with noticeably shifted hair and head silhouettes. `register-elsie-blink.py` registers each closed drawing to the surrounding face and transfers only small, feathered eye patches onto the exact open pose. This prevents the whole head from popping during a blink while preserving the supplied eyelid artwork.

Several supplied “open” left-facing cells actually contained a wink/closed eyes or an inconsistent direction. The v4 extraction mirrors the matching open-eyed right-facing cells into Elsie’s 270°, 300° and 330° slots and Phoebe’s affected 300° slot, applying the same correction to their blink counterparts. The renderer’s shared compass conversion is tested for all eight movement directions.

Rebuild from the site root with the bundled Python runtime containing Pillow and NumPy:

```sh
python3 tools/mascot-art/v3/extract-blink-sheets.py tools/mascot-art/v3/sources/eddy-full-rgb.png assets/speaking-system/mascots/v4 eddy
python3 tools/mascot-art/v3/extract-blink-sheets.py tools/mascot-art/v3/sources/elsie-full-rgb.png assets/speaking-system/mascots/v4 elsie
python3 tools/mascot-art/v3/register-elsie-blink.py assets/speaking-system/mascots/v4/elsie-standing.png assets/speaking-system/mascots/v4/elsie-blink.png assets/speaking-system/mascots/v4/elsie-blink-registered.png
python3 tools/mascot-art/v3/extract-blink-sheets.py tools/mascot-art/v3/sources/phoebe-full-rgb.png assets/speaking-system/mascots/v4 phoebe
python3 tools/mascot-art/v3/build-views.py
```

Runtime behavior caps every closed-eye frame at 0.12 seconds, with staggered blinks roughly every 4–6 seconds, with an occasional double blink. Character instances receive different phases so they do not blink together. Reduced-motion mode holds the open-eye frame. Canvas maps use the same timing function as the WebGL classroom.

Source SHA-256:

- Eddy: `7557aeffbe1532bf8333a5f20761456a2e7370c5e492b5b884ea8485fc983b0c`
- Elsie: `e550b726b7c1b336f1c868eb7880839de8df142b95e68e36f34d9fc6c15c10e3`
- Phoebe: `1948e26c74f4d8377de41a8e58abb8a8b20e4ecd7d98e715c5b59693d612eeb0`
