# Edmund Neural Audio Worker

This read-only Worker serves versioned IELTS Speaking Part 1, Part 3, and Exam Mode MP3
objects from the existing `edmund-assets` R2 bucket. It intentionally exposes
only the `assets/speaking-system/audio/edmund-neural/part1/`, `part3/`, and
`exam/` prefixes, supports browser byte-range requests, and applies immutable
one-year caching metadata.

Deploy from this directory with the pinned Wrangler installation in the
neighbouring `speaking-system` Worker project:

```sh
../speaking-system/node_modules/.bin/wrangler deploy
```

MP3 uploads remain a separate release step and must use `audio/mpeg` plus
`public, max-age=31536000, immutable` object metadata.
