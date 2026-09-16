# Professional English progress and saved exercises

The published app uses `professional-english/learning-state.mjs` for account-scoped
preferences, drafts, word bookmarks, an offline outbox, active study time and live
invalidations. Its custom session is validated inside every database RPC. The
public Realtime channel carries only a refresh notification; it never carries
student names, totals, answers, drafts or session credentials. New tables have RLS
and no direct anon/authenticated grants. The intentionally exposed SECURITY
DEFINER RPCs retain the portal's existing custom-session authorization model.

`special_learning_events` counts each correct card/blank once per attempt, and
one polysemy word only after its complete answer map matches the curriculum.
Retries use stable identifiers. Existing flashcard attempts are snapshotted once,
using their known/correct count and recorded time, so future completed rounds
cannot double-count the new question events. Activity time counts focused visible
study, pauses after two minutes without interaction, and is sent in short chunks.

The frontend preserves the three flashcard mark statistics. Its question/time
charts and team totals use the new summary RPCs. Realtime notifications refresh
charts immediately; a five-second recovery poll also covers disconnected clients.

Run:

```
node tools/test-professional-learning-activity.mjs
node tools/test-professional-learning-sync.mjs
node tools/test-learning-updates-20260911.mjs --require-complete-audio
node tools/test-professional-lesson3-polysemy.mjs
node tools/test-professional-feedback.mjs
node tools/test-special-flash-card.mjs
```

The pinned Realtime dependency is in `tools/email-qa/package.json` and its lockfile.
Bundle its `@supabase/realtime-js/dist/module/index.js` with esbuild, using
`--bundle --format=esm --platform=browser --minify`, into
`professional-english/realtime-client.mjs` when upgrading that dependency.

Lesson 2 has 50 mirrored-front/back PDF cards, three bilingual examples per card,
and verified Kokoro `af_heart` recordings. The import generator creates the deck
inactive; activate it only after its audio assets are available on the live site.
