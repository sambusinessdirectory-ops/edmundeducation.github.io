# Edmund Neural Audio Worker

This read-only Worker serves versioned IELTS Speaking Part 1, Part 3, Exam Mode,
and flashcard MP3 objects from the existing `edmund-assets` R2 bucket. Speaking
recordings remain individual R2 objects. Flashcard recordings are looked up in
immutable hash-prefix packs through these generated indexes:

- `src/flashcard-pack-index.json` — the established Passage 1 release
- `src/flashcard-pack-index-passage2.json` — the Passage 2 release

Both layouts support browser byte-range requests and immutable one-year caching
metadata. Every packed release uses a distinct public URL prefix; bytes must
never be replaced under an existing release URL. Passage 2 reuses an overlapping
recording from the Passage 1 release instead of uploading a duplicate.

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
