# Professional English library and mobile study update

Students can search lesson text, dialogues, polysemy questions and assigned flashcards; open the matching page, dialogue line or card; read the three highlighted lesson documents; and download their original PDFs. All 61 polysemy entries have first-occurrence page references. The importer verified all 24 PDF pages without missing or duplicated text.

Dialogue rows support selecting and bookmarking a phrase or a complete sentence. Personal playlists support names, membership, ordering and playback using the existing original sentence recordings. Admin messages support publish and delete. Students can read messages; publishing and deletion require an administrator's scoped session token.

Mobile flashcard gestures work on both front and revealed answer panels, with touch movement and vertical scrolling handled independently. The header's automatic-audio preference is saved to the account. Progress bars remain visible while scrolling in flashcards, blanks and polysemy, using each active range or exercise's denominator.

Validation:
- All 38 checks in the existing shared database/UI release group passed.
- Chromium and WebKit browser flows passed, using intercepted API requests and synthetic accounts only. Chromium also used actual emulated touch input for both swipe directions.
- Browser flows covered autoplay on/off and reload, card search links, all three progress bars, highlighted text and PDF links, phrase selection, playlist order/playback/reload, account isolation, and admin publishing/deletion.
- PGlite and a rolled-back production transaction verified authorization, playlist isolation, idempotent publish/delete and bounded PT409 conflicts. No synthetic production messages or accounts were committed.
- Supabase migration `professional_library_messages_playlists` was applied. Its advisor findings reflect the existing intentional scoped-token RPC design: direct table access is revoked, RLS has no direct-access policies, and security-definer RPCs validate the session and administrator role. No existing login or progress-save functions were changed.

To repeat browser QA, serve the repository on port 8633, then run:

```sh
PROFESSIONAL_QA_PLAYWRIGHT=/path/to/playwright/index.mjs node tools/test-professional-library-browser.mjs Chromium
PROFESSIONAL_QA_PLAYWRIGHT=/path/to/playwright/index.mjs node tools/test-professional-library-browser.mjs WebKit
```

`FEATURE_QA_BASE` can point to another deployment. Database requests remain intercepted. The browser test does not log in to real accounts or publish real messages.
