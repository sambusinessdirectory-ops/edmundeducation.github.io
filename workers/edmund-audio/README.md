# Edmund Neural Audio Worker

This read-only Worker serves versioned IELTS Speaking Part 1 and Part 3 MP3
objects from the existing `edmund-assets` R2 bucket. It intentionally exposes
only the `assets/speaking-system/audio/edmund-neural/part1/` and `part3/`
prefixes, supports browser byte-range requests, and applies immutable one-year
caching metadata.

Deploy from this directory with the pinned Wrangler installation in the
neighbouring `speaking-system` Worker project:

```sh
../speaking-system/node_modules/.bin/wrangler deploy
```

MP3 uploads remain a separate release step and must use `audio/mpeg` plus
`public, max-age=31536000, immutable` object metadata.
