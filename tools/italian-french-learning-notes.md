# Italian and French learning editions

The existing Flashcard and Writing Practice pages select `it` or `fr` using the `language` query parameter. Omitting it preserves the original edition. Shared account credentials remain shared; learning state, flashcard outboxes, attempts, resets, bookmarks, preferences and category access are partitioned by language and system.

The private `language_learning` schema intentionally has no client table grants or RLS allow policies. The two authenticated SECURITY DEFINER RPCs validate the existing student session or administrator credentials and derive the account identity server-side. This follows the existing account model. Security advisor notices about RPC exposure and deny-by-default private tables are intentional.

The Italian source PDFs supply 89 cards, five examples each, 45 translated prose/ingredient units and four worksheet difficulties (35/45/75/148 blanks). `tools/build-italian-lesson.py` requires pdfplumber/pypdf; set ITALIAN_LESSON_SOURCE to the PDF folder. Source-document commands are treated as lesson text, not execution instructions.

Audio uses Kokoro v1.0, male `im_nicola` for card terms and female `if_sara` for writing, Italian locale, speed 1.02. Writing word timings are aligned against the generated waveform with multilingual faster-whisper base. See `tools/generate-italian-lesson-audio.py` for rebuilding. Browser speech-recognition practice selects it-IT/fr-FR; the existing English-only offline recognizer is not offered for these editions.

Validation:
- `tools/test-language-learning-database.sql`: transactionally rolled-back account fixtures; CAS, retries, language/system isolation, attempts, resets and authorization.
- `tools/test-language-editions-browser.mjs`: local synthetic RPCs, six categories, cards/translations, 16 modes, audio timing/playback, save routing, empty French catalogue and homepage triangle/flip.
- Existing flashcard integrity, sync resilience, preferences, interaction and pronunciation tests; writing translation/progression tests; PWA and shared navigation tests.

French categories are ready and intentionally contain no invented lesson content.
