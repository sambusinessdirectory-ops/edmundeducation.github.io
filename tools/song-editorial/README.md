# Song editorial release standard

## Listening alternatives

Each wrong choice must be a real word or natural phrase that could plausibly be heard in the blank. Compare it with the actual sung target and the surrounding sentence. Use a meaningful audible difference (word choice, tense, pronoun, negation, word order or a genuine sound contrast). Do not add letters, manufacture spellings, append arbitrary suffixes, or replace the final word mechanically with “again”. Do not use spelling-only variants or homophones as competing listening answers. Being present in a source worksheet does not make a distractor acceptable.

Review all three alternatives in context, not just the correct key. The reviewed-word list is a lexical gate, not proof of sentence quality. Unknown words require human/editorial review; never automatically add a rejected token merely to make the gate pass. Legitimate inflections, contractions, dialect, foreign lyrics and names may be added with a documented reason. Inspect grammar and plausibility separately. Preserve the correct answer, its lyric occurrence and the option-position balance.

Run `node tools/check-song-quality.mjs`, `node tools/test-song-editorial.mjs` and `node tools/test-song-route.mjs` before every release. The Pages workflow runs these checks automatically. Database validation also rejects the known malformed patterns, retired fallback phrases and unfinished introductions.

Changing option wording requires a new exercise version. Leave historical attempts and saved answer records untouched; do not turn a student's old choice into a new choice or change an old grade. A revised exercise starts on its new version.

## Complete introductions

Read the complete source introduction across page boundaries. Compare its first and final sentences with the stored text. Retain English word boundaries when PDF lines wrap. A missing final clause must block import even when the source itself is incomplete. Repair it editorially and record that it is new wording, not recovered source text. Do not silently invent the missing source. Preserve administrator formatting and show the entire introduction at every viewport size without line clamping or fixed-height clipping.

2026-10-30 review: all 49 published descriptions checked. Lea's PDF and stored introduction both ended at “最令人難”; its final sentence was completed editorially. Four descriptions also had a missing space within an English song title. Bohemian Rhapsody's 49 target phrases were reviewed across four levels; 134 question rows received revised distractors. Correct keys and their positions were retained.
