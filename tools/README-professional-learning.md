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
node tools/test-professional-polysemy-resume.mjs
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

## Lesson 2/3 content and resume update

The catalogue now contains 17 dialogues / 188 spoken turns and 61 polysemy words /
371 questions across three lessons. Lesson 2 has three paired beginner/professional
rows; Lesson 3 has four. Source Situation/flowchart material is excluded. Both
new Dialogue 3 PDFs contain the same professional script, so the existing distinct
beginner script is preserved; see the content import notes.

Polysemy drafts save the exact question, selected answer, retry queue, round and
attempt UUID to the account. Progress counts unique correct questions within a
word; only the completed word contributes one point to the dashboards. Accepted
ambiguous sense alternatives normalize to the server's canonical answer. Correct
choices are green, including after an incorrect selection. Completed tiles use a
darker green, a larger tick and a subtle static gold sheen. Redo starts a new attempt.

Dialogue drafts are versioned. The previous l2d2 beginner script moves to
l2d2-beginner while the restored professional script uses contentVersion 2. The
catalogue migration preserves old saved drafts under the beginner ID, and the
client also preserves unsynced device-only drafts before starting the new script.

Progress bars use the current flashcard queue, the selected blank difficulty, or
the current polysemy word; lesson-level polysemy progress counts completed words.
The long Pages validation step, all audio checks, PGlite account/score tests, and
Playwright checks for audio resume, bookmarks, warnings, exact draft resume,
question counts, paired rows and 5× mobile layout passed before publication.

## Mobile flashcards

The card utilities sit in a separate row. Colored status tiles and equal square
review/known buttons keep icons in React-owned markup. Revealing an answer is
one-way; the redundant Show front control is removed. The completion heading
stacks English over Chinese and the review count is red.

`flashcard-swipe.mjs` handles pointer movement directly, locks vertical scrolling,
animates accepted swipes before committing once, and suppresses the synthetic
click after a gesture. It ignores the child's bubbling lost-capture event when
touch capture transfers to the answer card. Cleanup cancels pending marks when
navigating; reduced-motion users skip the departure animation. Run
`node tools/test-professional-mobile-cards.mjs` for gesture safety checks.
