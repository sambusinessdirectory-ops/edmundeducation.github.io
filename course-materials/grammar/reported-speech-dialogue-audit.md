# Reported Speech dialogue-card implementation audit

Source: `course-materials/grammar/source/reported-speech-student-reading-guide-v3.md`

Reference: `文法教學對話框製作 - Grammar_Curation_Dialogue_Box_Golden_Manual_v1_2026-11-03.pdf`

## Content reconciliation

- [x] 148 unique source rules reconciled, from `RS.01.01` to `RS.12.16`.
- [x] All six source teaching sections are present for every rule.
- [x] The source order is preserved, including the deliberate staged revisiting of rule families.
- [x] Every card retains the English example, Traditional Chinese meaning, reason, comparison and limitation.
- [x] The final limitation/boundary paragraph becomes Eddy's rule-specific dialogue note.
- [x] All 148 dialogue notes are non-empty and unique.
- [x] No exercise or answer block was embedded in the curation stream.

## Dialogue-card composition

- [x] Every rule is rendered as live, selectable HTML inside the deep-green blackboard.
- [x] Eddy's portrait uses the established 33-pose cycle and remains decorative.
- [x] The cream dialogue strip remains a separate live-text element.
- [x] Rule IDs are shown as stable source labels rather than renumbered display-only labels.
- [x] Layout uses the shared conditional collision detector; Reported Speech is registered for content-driven board growth.
- [x] Portrait relocation occurs only when rendered text collides with the portrait region.
- [x] Font-ready and resize events schedule re-layout.
- [x] Long/dense-card classes remain driven by actual content length rather than a fixed module exception.

## Exercise reconciliation

- [x] 44 diagnostics reconciled in source order.
- [x] D01–D36 are rendered as three-option multiple-choice questions.
- [x] D37–D44 remain complete-sentence rewriting tasks.
- [x] Every item contains an English prompt and bracketed Traditional Chinese support.
- [x] Every item has a reviewed answer and seven-step rationale.
- [x] Every rationale links to a specific source rule in `reported-speech-source-map.json`.
- [x] Wrong MC submissions immediately reveal the correct option and model answer.
- [x] Open rewrites are explicitly self-reviewed and accept documented natural variants.
- [x] Question totals, ranges, progress, next/previous bounds and saved position derive from the module's real count (44), not the legacy fixed count (150).

## Automated checks

- [x] Generator reproduces `grammar-reported-speech-data.js` and the source map without drift.
- [x] `tools/test-grammar-reported-speech.mjs` validates all source IDs, six-step coverage, unique notes, answers, mappings and load order.
- [x] `tools/test-grammar-new-curations.mjs` validates four curation modules and all 148 new dialogue cards.
- [x] `tools/test-grammar-three-sets.mjs` validates 494 total sourced exercises, dynamic totals and MC marking.
- [x] Existing Tense, Articles, Advanced Articles, three-set, dialogue, Eddy-pose, admin-export and Indefinite Pronouns checks pass.
- [x] The Pages sparse-checkout release inputs and shared system-map checks pass.

## Visual and public verification

- [x] Desktop curation route checked at 1440 CSS pixels.
- [x] Tablet curation route checked at 1024 and 768 CSS pixels.
- [x] Phone curation route checked at 390 CSS pixels.
- [x] Representative short, long and comparison-heavy cards checked for overlap, clipping and detached captions.
- [x] Exercise mode checked for correct and incorrect MC outcomes and a rewrite reveal.
- [ ] Published HTML confirmed to reference the Reported Speech asset version.
- [ ] Public curation and practice routes confirmed after the containing deployment succeeds.

The unchecked publication items are completed only against the candidate build or the verified public release; they must not be inferred from source validation.
