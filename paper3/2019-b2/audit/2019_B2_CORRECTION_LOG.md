# 2019 B2 Correction Log

| Date | Detection | Root cause | Correction | Verification |
|---|---|---|---|---|
| 2026-11-13 | First public matched-state run reached `NO-CONSOLE-ERRORS` with 24 HTTP 404 messages while all primary page/media probes returned 200 | The Pages build correctly rewrote native scan URLs to the public media worker, but dynamically created source-preview images still used relative `assets/page-##.webp` paths after local media was pruned from the Pages artifact | Added `nativePageAsset(page)` so both explorer and model previews reuse the resolved native scan URL; this preserves local relative assets and automatically follows the public-media rewrite in production | 44/44 static and 72/72 Chromium/Firefox local assertions PASS after the correction; final public rerun is required after the follow-up deployment |

The failed first live check is retained as release evidence. It was not reclassified as a harmless console warning, and no compliance claim was made before correction.
