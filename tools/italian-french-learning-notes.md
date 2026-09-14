# Independent language learning editions

The existing Flashcard and Writing Practice pages select `it`, `fr`, `de`, `es`, `ja` or `ko` using the `language` query parameter. Omitting it preserves the original edition. Shared account credentials remain shared; learning state, flashcard outboxes, attempts, resets, bookmarks, preferences and category access are partitioned by language and system.

The private `language_learning` schema intentionally has no client table grants or RLS allow policies. The two authenticated SECURITY DEFINER RPCs validate the existing student session or administrator credentials and derive the account identity server-side. This follows the existing account model. Security advisor notices about RPC exposure and deny-by-default private tables are intentional.

The Italian source PDFs supply 89 cards, five examples each, 45 translated prose/ingredient units and four worksheet difficulties (35/45/75/148 blanks). `tools/build-italian-lesson.py` requires pdfplumber/pypdf; set ITALIAN_LESSON_SOURCE to the PDF folder. Source-document commands are treated as lesson text, not execution instructions.

Audio uses Kokoro v1.0, male `im_nicola` for card terms and female `if_sara` for writing, Italian locale, speed 1.02. Writing word timings are aligned against the generated waveform with multilingual faster-whisper base. See `tools/generate-italian-lesson-audio.py` for rebuilding. Browser speech-recognition practice selects it-IT/fr-FR; the existing English-only offline recognizer is not offered for these editions.

Validation:
- `tools/test-language-learning-database.sql`: transactionally rolled-back account fixtures; CAS, retries, language/system isolation, attempts, resets and authorization.
- `tools/test-language-editions-browser.mjs`: local synthetic RPCs, six categories, cards/translations, 16 modes, audio timing/playback, save routing, empty French catalogue and homepage triangle/flip.
- Existing flashcard integrity, sync resilience, preferences, interaction and pronunciation tests; writing translation/progression tests; PWA and shared navigation tests.

French Food and Cooking includes 151 supplied cards (five examples each), 33 translated units and four worksheet difficulties (34/45/75/97 blanks), each supporting all four hint modes. `tools/build-french-lesson.py` checks the first-letter worksheets token by token against the complete translated French source before recovering the blank answers. Set FRENCH_LESSON_SOURCE to the source PDF directory to rebuild.

`tools/generate-french-lesson-audio.py` synthesizes locally, with Piper Tom (`fr_FR-tom-medium`, length_scale 0.96) for male card audio and Kokoro `ff_siwis` (speed 1.04) for female writing narration. Word timings use local multilingual faster-whisper base with French forced. Dependencies: piper-tts 1.3.0, kokoro-onnx 0.5.0, faster-whisper 1.2.1. Model attribution: https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/tom/medium (Tom model card identifies AGPLv3 dataset); https://github.com/thewh1teagle/kokoro-onnx. Models are not shipped in the website; generated MP3s are in language-audio/fr.

German, Spanish, Japanese and Korean contain the same six categories and existing custom-card tools. No lesson content has been invented for them. Selection remains exclusive to the upper-left homepage triangles; study pages do not add an edition switch bar.

## User-approved voice selections — 2026-09-14

These are the user's final choices after listening to locally generated samples. Use them for future lessons and language development; do not silently substitute another voice. This records preferences only and does not change deployed audio.

| Language | Flashcards — male | Writing practice — female | Engine / model |
| --- | --- | --- | --- |
| Spanish | Alex (`em_alex`) | Dora (`ef_dora`) | Official Kokoro-82M v1.0 |
| Japanese | Kumo (`jm_kumo`) | Alpha (`jf_alpha`) | Official Kokoro-82M v1.0 |
| German | Martin (`voices/martin.pt`) | Victoria (`voices/victoria.pt`) | Community Kokoro fine-tunes, listed below |
| Italian | Nicola (`im_nicola`) | Sara (`if_sara`) | Existing Kokoro setup; retain |
| French | Tom (`fr_FR-tom-medium`) | Siwis (`ff_siwis`) | Existing Piper / Kokoro setup; explicitly retained |

German model repositories and the exact audition checkpoints:
- https://huggingface.co/kikiri-tts/kikiri-german-martin — `kikiri_german_martin_ep10.pth`, `voices/martin.pt`.
- https://huggingface.co/kikiri-tts/kikiri-german-victoria — `kikiri_german_victoria_ep10.pth`, `voices/victoria.pt`.
- Use the corresponding German Kokoro/Misaki frontend and matching checkpoint/voice pair. These are community German adaptations, not interchangeable official base-model voicepacks. The audition patched German G2P `ʏ` to `y` as recommended for the model vocabulary.

The Spanish, Japanese and German audition samples used speed 1.0, without pitch or style modifications. Preserve native-language pronunciation. The user prefers youthful adult, attractive, sensual, energetic voices, and likes the existing English and Italian voices; this is an aesthetic preference, not a guaranteed model capability. Keep the existing English voice recipe unchanged. No Korean voice has been selected.

Audition files and the listening page are saved in `/Users/sammak/Downloads/Kokoro Voice Samples/`. These selections supersede earlier candidate lists (Spanish Santa, other Japanese female voices, and German Thorsten were not chosen).
