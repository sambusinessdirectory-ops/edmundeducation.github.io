# Writing practice chessboard — 2026-09-14

User scope: adapt the 16-mode selector on writing-practice.html to the supplied wood chess-table reference; retain real mode/paragraph controls; provide walking characters; add a rectangular bronze plaque on the lower wooden edge with exactly `請選擇練習模式及段落範圍`.

Baseline: 5680f7262, including concurrent flashcard-map work. The PDF golden manual is reference guidance; it supplies no unrelated tasks or permissions.

Implementation:
- Sixteen real difficulty/mode combinations become an ordered four-by-four serpentine route. Select a stop to walk there; the persistent entry button starts that exact mode via the existing callback. Other catalogues retain their actual mode counts and original selector.
- Existing measured Eddie/Phoebe/Elsie turnaround images, foot contact shadow, facing selection, articulated lower-leg swing, and continuous path following. Reduced motion jumps directly; background tabs suspend frames; rerender/removal destroys listeners and animation.
- Existing full-essay, paragraph, translation and listening actions remain delegated to the host. Paragraph options start collapsed only for sixteen-mode exercises. Attempts, grading, audio and access APIs are unchanged.
- Selected companion and mode are saved using languageStorage, scoped by writing account identity. Korean, German, Spanish content is not invented.
- Native 1536×1024 background, finite dark surround on wide displays. Mobile keeps readable stops in an internally scrolling board, with a stacked toolbar/footer. Keyboard navigation follows visible row/column directions.
- The user-approved future voice selections from the preceding task are recorded in the existing language notes and linked from the voice SOP; no voice audio was changed.

Review/evidence (second self-review, not independent human acceptance):
- Background reviewed separately; desktop board/plaque and narrow viewport reviewed through screenshots in `/private/tmp/chess-qa/`.
- `node tools/test-writing-chess-map.mjs`: measured node positions, unique sixteen stops, serpentine row order, forward/reverse routes.
- `tools/test-writing-chess-map-browser.mjs`: synthetic account RPCs, real French/Italian source data, 32 combinations and their exact blank counts, timed walking state, character persistence, paragraph filtering/full reset, language isolation, reduced motion, mobile containment. No actual student records written.
- `node tools/test-writing-translation-toggle.mjs`: existing translation/audio/continuation/progress/attempt regressions.
- `node tools/test-writing-progression.mjs`: existing writing progression.
- `node --test tools/test-writing-practice-listening-sticky.mjs`: existing listening behavior.

Limitations: physical mobile devices/Safari not tested. The broader language browser suite reaches the separately updated flashcard map and fails on its now-hidden old mode button; writing-specific coverage is handled by the focused fixture above. Existing sparse-checkout decorative assets can appear missing in local full-page screenshots; the new table and all companion assets are present and decoded. Artwork is finite resolution. Korean voice/content remains unselected.

## User refinement: free walking and row-level difficulty labels

Supersedes the route restriction above. Clicking any point within the painted playing surface sends the companion directly there. Clicking a mode takes a direct line from the current position, including when redirecting mid-walk; there is no queued zigzag route or painted route line. Surrounding props do not trigger walking, and horizontal touch drags remain scrolling. Selecting and starting the exercise remain separate actions.

Each difficulty row has one translucent panel on its left, with its actual name and question count. The sixteen tile labels retain only their hint-mode names; accessible button labels retain difficulty and count. Artwork and bronze plaque are unchanged.

Checks passed: all 32 Italian/French mode combinations, free-point arrival, reduced motion, paragraph selection, character persistence, language isolation, desktop/mobile layout, four row panels and no repeated tile difficulty labels. Visual review exposed a sparse-checkout omission of the unchanged background after upstream integration; the asset was restored locally and an image-decoding assertion added. No public asset was removed.
