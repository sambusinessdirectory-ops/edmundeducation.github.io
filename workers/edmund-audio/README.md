# Edmund Neural Audio Worker

This read-only Worker serves versioned IELTS Speaking Part 1, Part 3, Exam Mode,
and flashcard MP3 objects from the existing `edmund-assets` R2 bucket. Speaking
recordings remain individual R2 objects. Flashcard recordings are looked up in
immutable hash-prefix packs through these generated indexes:

- `src/flashcard-pack-index.json` — the established Passage 1 release
- `src/flashcard-pack-index-passage2.json` — the Passage 2 release
- `src/flashcard-pack-index-reading-expansion.json` — the combined Passage 2
  additions and Passage 3 release
- `src/flashcard-pack-index-flashcard-expansion.json` — the reserved 142-deck
  IELTS Listening/DSE expansion; the Worker ignores it until its verified R2
  upload sets `r2UploadComplete: true`

All packed releases support browser byte-range requests and immutable one-year caching
metadata. Every packed release uses a distinct public URL prefix; bytes must
never be replaced under an existing release URL. Passage 2 reuses an overlapping
recording from the Passage 1 release instead of uploading a duplicate. The
Reading expansion similarly reuses every applicable recording from both earlier
releases and the immutable pre-expansion manifest.

Deploy from this directory with the pinned Wrangler installation in the
neighbouring `speaking-system` Worker project:

```sh
../speaking-system/node_modules/.bin/wrangler deploy
```

Uploads remain a separate release step. Individual Speaking MP3 objects use
`audio/mpeg`; packed flashcard objects use `application/octet-stream`. Both use
`public, max-age=31536000, immutable` cache metadata.

For the Passage 2 release, first generate every required individual MP3, then
run the dedicated builder and uploader from the repository root:

```sh
python3 tools/build-flashcard-audio-r2-packs-passage2.py
python3 tools/upload-flashcard-audio-packs-r2-passage2.py \
  --wrangler workers/speaking-system/node_modules/.bin/wrangler \
  --check
python3 tools/upload-flashcard-audio-packs-r2-passage2.py \
  --wrangler workers/speaking-system/node_modules/.bin/wrangler \
  --prune-source-audio
```

After pruning, rebuild `flashcards-audio-manifest.js`, test the Worker, deploy
the Worker, and only then publish the website manifest that points at the new
public release URLs.

For the combined Passage 2 additions and Passage 3 release, use its immutable
builder and uploader instead:

```sh
python3 tools/build-flashcard-audio-r2-packs-reading-expansion.py
python3 tools/upload-flashcard-audio-packs-r2-reading-expansion.py \
  --wrangler workers/speaking-system/node_modules/.bin/wrangler \
  --check
python3 tools/upload-flashcard-audio-packs-r2-reading-expansion.py \
  --wrangler workers/speaking-system/node_modules/.bin/wrangler
```

Deploy and live-test the Worker after that upload. Then invoke the uploader
again with `--prune-source-audio`; in this mode it only prunes source MP3s from
the already-complete immutable release and performs no R2 writes.

For the fourth release, build and locally validate from the repository root:

```sh
python3 tools/build-flashcard-audio-r2-packs-flashcard-expansion.py
python3 tools/upload-flashcard-audio-packs-r2-flashcard-expansion.py \
  --wrangler workers/speaking-system/node_modules/.bin/wrangler \
  --check
```

Run `wrangler deploy --dry-run` before uploading. The normal uploader reads
every pack back from R2 and checks its complete SHA-256 before setting the
completion flag. Deploy and run `node tools/verify-live-edmund-audio.mjs` before
invoking the uploader again with `--prune-source-audio`.

Keep all four index imports in release order in `src/index.js`: Passage 1,
Passage 2, Reading expansion, then the 142-deck flashcard expansion. Older
release URLs and pack bytes remain unchanged when a later index is added.
