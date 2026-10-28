# Three-proverb curation review — 2026-10-28

Status: complete review edition, requested for live publication by the owner. This edition is separate from the existing scored student route. It is not a claim that the wider idiom rollout has been audited or completed.

## Inventory

| Lesson | Guide stages | Guide decisions / choices | Original IDs | Extensions | Practice choices / Chinese reasons |
|---|---:|---:|---:|---:|---:|
| Out of Sight, Out of Mind | 6 | 4 / 12 | 50 | 10 | 240 / 240 |
| Every Man Has His Price | 6 | 4 / 12 | 50 | 10 | 240 / 240 |
| Once Bitten, Twice Shy | 6 | 4 / 12 | 50 | 10 | 240 / 240 |
| Total | 18 | 12 / 36 | 150 | 30 | 720 / 720 |

Each original item retains its `proverb-0N-qNN` identifier and a verbatim snapshot of its old English prompt and answer. New items use `proverb-0N-xNN`; they are not inserted into the original 50-question score denominator. All 60 questions remain visible together. JSON files are the maintained editorial source, not generated generic foil banks.

## Applicable standards

Read the 2026-10-23 Super Curation manual and the 2026-10-22 New Teaching Style manual. Later owner preferences control: remove Build the Phrase, put Chinese first in guide explanations and choices, keep four full English practice options, and give specific Traditional Chinese reasons. No gamification or beach redesign. The owner requested a quality review, then explicitly requested live publication of all three review lessons.

The review route uses six guide stages plus practice; old stage 4 links resolve to the response stage. The same writer performed the editorial review; no independent human or blind semantic approval is claimed.

## Meaning references

- [Cambridge: out of sight, out of mind](https://dictionary.cambridge.org/dictionary/english/out-of-sight-out-of-mind?topic=forgetting-and-forgetfulness): absence from view makes forgetting easier, not inevitable.
- [Dictionary.com / American Heritage Idioms: every man has his price](https://www.dictionary.com/browse/every-man-has-his-price): cynical observation about being bribed, applicable beyond men. No unverified origin story is taught.
- [Cambridge: once bitten, twice shy](https://dictionary.cambridge.org/dictionary/english/once-bitten-twice-shy) and [Collins](https://www.collinsdictionary.com/us/dictionary/english/once-bitten-twice-shy): prior unpleasant experience leads to caution in similar situations.

Definitions in the lessons are original paraphrases. Scenes and choices are authored examples, not dictionary quotations.

## Editorial decisions and repairs

- Lesson 1 distinguishes reduced attention from resolution, disappearance, deliberate rejection, and an inevitable loss of affection. Counterexamples remain counterexamples. Item 34 explicitly says an unavailable web form does not prove that passengers forgot it; the old answer over-inferred their mental state.
- Restored missing time, frequency, actor, obligation and scope details, including a few days before an unanswered email, unpaid bills, watering, monthly/weekly contact, possible versus certain outcomes, and intentions versus completed results.
- Lesson 2 attributes cynical claims to the correct character. Offers are not completed bribes; belief is not proof; depiction is not endorsement; fair wages are not bribery. A refusal challenges a universal claim without proving nobody can ever be bribed. Traditional wording is not restricted to males.
- Lesson 3 keeps the prior setback and corresponding caution connected. It retains conditional willingness to try again, rather than converting every precaution into permanent refusal. Corrected the school’s decision tense, removed an invented “last year” from the holiday-insurance answer, and corrected the Chens’ Chinese family reference.
- Each extension set has 10 named themes. The three guides use distinct meaning, evidence, social-tone, response and boundary scenes; model and read-aloud sentences differ.
- Foils were authored against each item’s source/scene, with their own Chinese explanations. Automated checks find no duplicate explanations among the 720 practice choices, no duplicate choices within an item, and no longest/shortest option ratio above 1.6.
- Lesson 2 necessarily revisits attribution and universal claims frequently because the retained source bank concentrates on those issues. Diversity of misconception strength and teaching effectiveness remains a legitimate subject of the owner’s quality review; structural tests do not establish pedagogical quality or certify all twelve editorial axes.

## Twelve-axis coverage and limits

| Axis | Review evidence |
|---|---|
| Meaning | Dictionary-anchored lesson boundaries and reviewed item explanations |
| Natural English | Full-sentence keys/foils; repaired awkward or unsupported original answers |
| Source fidelity | 150 exact source snapshots; revisions distinguish conditions, frequency, sequence and actor |
| One intended key | One authored key per item; per-option counter-reasons; ambiguity repairs including lesson 1 item 34 |
| Plausible situations | Original scenarios plus 30 new contexts; no universal moral rule presented as fact |
| Diagnostic foils | Actor, scope, time, evidence, causation, literal meaning, stance and action errors |
| Length | All 180 sets within 1.6 max/min word ratio |
| Clarity | One question per card; stable IDs and explicit instructions |
| Traditional Chinese | Chinese prompts, guide choices and all 756 guide/practice reasons authored/re-read |
| Rationale | Specific changed detail or inference explained; 720 practice reasons unique |
| Neutral highlights | Text-only common-word alignment; no correctness input; all options treated alike |
| Reveal / progress | Browser checks cover all 180 wrong-then-correct interactions and reload persistence |

These rows document the work performed, not an independent certification or a claim that software tests prove semantic uniqueness.

## Runtime and visual verification

- `node --test tools/test-proverb-curation.mjs`: 7 tests pass.
- Existing `test-proverb-system.mjs` and `test-proverb-black-sand.mjs`: 14 tests pass.
- `test-proverb-curation-browser.mjs`: all 180 cards wrong → correct, selected-error-only reveal, four explanations after success, 60/60 reload persistence in each lesson, all 12 guide decisions, original stage-4 redirect, bookmark persistence.
- 21 phone views at 390px: no horizontal overflow. Desktop 1440px and phone screenshots inspected.
- Speech text/language dispatch checked with a mock; this does not certify a device’s voice quality. Valid recording created using Chromium’s fake microphone, stopped, and removed on navigation. Denied microphone access remains non-blocking.
- No JavaScript page errors in the browser test.

Review progress uses version-scoped `sessionStorage`. It is not account progress and is not uploaded. Audio uses browser speech synthesis and temporary in-page recording; no production audio pack or recording-upload claim is made. Existing student authentication, 150-question score records, source catalogue and beach remain unchanged.

## Publication

Entry: `/proverb-curation-review.html`, with direct lesson links `#proverb-01/1`, `#proverb-02/1`, `#proverb-03/1`. The page says it is a review edition and does not write student scores. Publication/live checks are recorded in the task response after deployment.


## Main portal integration — 2026-10-28

The owner approved moving this content into `/proverb-system.html`. All three lessons now use the approved native Compass renderer: six guide stages and 60 practice cards each. Stage 4 is hidden and skipped. No lesson content was redrafted for this integration.

The original 50 IDs per lesson retain the existing account score denominator. The ten extensions save locally under the account and curation version. Existing earned scores remain valid; current-edition completion is tracked separately using versioned question state. Pending answers survive failed saves and retry on reopening. No database schema change is required. The Worker accepts both legacy answers and the 150 revised keys, and rejects legacy-only answers falsely labelled as current-edition completion.

Validation: 7 editorial structural tests, 14 existing portal/background tests, 3 progress tests, and 12 Worker tests pass. The native-portal browser test exercises all 180 wrong/correct interactions, all three guides, real Worker request validation with a fixture backend, reload, account isolation, score boundaries, failed-save recovery, and 390px layout. No real student records were used by these tests. Mobile screenshot inspected. Deployment and live verification follow these checks; publication is not asserted by this audit entry.
