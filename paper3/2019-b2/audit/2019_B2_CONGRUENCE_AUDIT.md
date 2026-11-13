# 2019 B2 Fact-Line / Model-Answer Congruence Audit

**Machine state:** PASS.<br>
**Certification state:** human visual sign-off remains pending and is tracked separately; it does not alter the source/model mapping result.<br>
**Canonical inputs:** 420-unit fact-line analysis and the three length-controlled model answers.

## A→M: model claim to source

| Check | Result | Evidence |
|---|---:|---|
| Model tasks present | PASS | Tasks 8, 9 and 10 |
| Sentence counts | PASS | 12 / 8 / 16 |
| Word counts | PASS | 171 / 123 / 210 under the declared English-token counter |
| Every factual source ID resolves | PASS | `MODEL-003` |
| Rhetorical sentences without a source are documented | PASS | `MODEL-005` |
| Rejected/noise units cited as factual support | PASS — none | `MODEL-004` |
| Protected false claims | PASS — absent | `MODEL-007` |

Every factual model sentence owns an exact `sources` array of stable `2019-B2-U####` identifiers. Selecting the sentence exposes those identifiers, persists the use event per task, and opens the original-source preview. A no-source sentence is allowed only where its `function` is explicitly rhetorical or structural.

## M→A: source to model or rationale

The answer-permitted high-value set contains 89 units. Eighty-six are mapped to at least one model sentence. The remaining three carry authored word-control/exclusion rationales; they are not silently dropped. This is asserted by `MODEL-006`.

## Visual, recording and status congruence

- All 19 page scans and four embedded visual records resolve through `source-manifest.json`.
- All source units with `audioCue` resolve to one of 107 monotonic recording cues.
- The authentic recording provenance URL, 11,879,906-byte length and ETag are fixed in `recording-provenance.json`.
- Only `獨立寫入`, `合併寫入` and `只保留結論` can enter an evidence bank.
- `不寫入答案`, route/context, metadata-only and evidence-status units cannot create factual bank rows.
- Model sources never cite Type 6 / `不寫入答案` units.
- Podcast-derived model use mirrors the exact generated native-note line; it does not mutate the learner’s textarea.

## Task boundaries

| Task | Contract | Congruence control |
|---|---|---|
| 8 | Formal report, around 180 words | Accessibility, staffing, food, hygiene and safety evidence only; no invented wheelchair-access failure |
| 9 | Programme text, around 120 words | Theme, plot and stand-out scene; no repeated pre-filled metadata |
| 10 | Introductory speech, around 200 words | Balanced cinema/home and blockbuster/low-budget discussion; no forum hyperbole promoted to fact |

## Executable evidence

- Static validation: 44/44 PASS.
- Browser validation: 72/72 PASS in Chromium and Firefox.
- Browser checks include model counts, stable-ID map exposure, bank consumption, navy source use, podcast-note use, import/export and reload restoration.

## Conclusion

There are no unresolved A→M or M→A mapping failures, no prohibited status leakage and no unmapped high-value unit without an explicit rationale. The congruence audit is machine-clean.
