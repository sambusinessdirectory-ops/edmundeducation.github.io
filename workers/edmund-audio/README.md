# Edmund Neural Audio Worker

This read-only Worker serves versioned IELTS Speaking Part 1, Part 3, Exam Mode,
and Passage 1 flashcard MP3 objects from the existing `edmund-assets` R2 bucket.
Speaking recordings remain individual R2 objects. Passage 1 flashcard recordings
are looked up in 256 immutable hash-prefix packs using the generated
`src/flashcard-pack-index.json`. Both layouts support browser byte-range requests
and immutable one-year caching metadata. Every packed release uses a distinct
public URL prefix; bytes must never be replaced under an existing release URL.

Deploy from this directory with the pinned Wrangler installation in the
neighbouring `speaking-system` Worker project:

```sh
../speaking-system/node_modules/.bin/wrangler deploy
```

Uploads remain a separate release step. Individual Speaking MP3 objects use
`audio/mpeg`; packed flashcard objects use `application/octet-stream`. Both use
`public, max-age=31536000, immutable` cache metadata.
