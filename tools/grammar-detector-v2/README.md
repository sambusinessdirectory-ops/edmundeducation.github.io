# Executable Grammar Detector — Sets 19–23

This directory is the version-controlled authoring layer that turns the five
source datasets into bounded, testable detector records. The browser loads only
the generated module at `../../writing-submission-executable-grammar.generated.js`;
it never parses these large authoring files at runtime.

## Release contents

- 332 physically supplied source issues: Set 19 = 104, Set 20 = 116, Set 21 = 83,
  Set 22 = 11, Set 23 = 18;
- 228 deduplicated rule families;
- 166 correct/adversarial controls and 1,055 development, regression, capability,
  or sealed-holdout cases;
- 124 exact adversarial controls for grammatical unseen sentences; and
- 65 approved bounded surface patterns across 49 browser-runtime families:
  Set 19 = 9 review-only patterns, Set 20 = 24 patterns, Set 21 = 20 patterns,
  Set 22 = 10 automatic patterns and 2 review-only patterns.

Set 19's supplied attachment starts at its issue table and omits both passages
and all 34 sentence pairs. Its complete issue metadata is stored. Of 33
phrase-triage candidates, 9 remain active as review-only findings after
adversarial testing.
No Set 19 sentence was invented. Set 20 declares 115 issues but contains 116
distinct rows; all 116 are retained.
Set 22 preserves its parser-oriented rule designs as inactive authoring metadata
and adds a separate, browser-safe surface matcher for each supplied issue. The
`TV show` item remains review-only because both `TV shows` and `a TV show` can be
valid repairs. Its two bounded variants cover both the workbook sentence and
the reported `loves to watch TV show` incident. The unambiguous `at the night`
item can safely offer `at night` within its bounded source context.
Set 23 stores its complete corrected v2.5 workbook record: 27 sentences, 18
source issues, 6 parser matchers, 427 bindings, 703 derived assertions, 111 test
cases, 58 expected findings, 67 adversarial controls, and all 14 reproducible
hash contracts. Its parser-dependent rules and six release gates remain
explicitly blocked, so Set 23 contributes no surface pattern until teacher,
parser, capability, and sealed-evaluation approval is recorded.

## Build and test

```sh
node tools/grammar-detector-v2/validate-and-compile.mjs
node tools/test-writing-submission-executable-grammar.mjs
```

The compiler fails closed. An active pattern must link to its source issue,
surface matcher, atomic binding, approved non-holdout evidence case, exact
runtime policy, supported browser capabilities, confidence, priority, and
conflict group. Automatic corrections require full-sentence evidence and at
least 0.99 confidence. Issue-table-only evidence can produce review findings,
but never an automatic replacement.

`adversarial-controls.json` is also a release gate. Each record contains a
grammatical unseen sentence that previously matched an over-broad candidate.
The compiler requires all 124 linked candidates to remain stored but inactive,
with an exact non-runtime regression case. The runtime test independently
proves that none of those sentences produces a grammar card.

Parser-dependent, semantic, discourse, and style families remain available in
the authoring data but are not silently downgraded into unreliable browser
rules. Holdout cases are never compiled. The production test also proves that
all correct controls and corrected source sentences remain clean, that literal
regex characters and whitespace are handled safely, and that the Set 20, Set
21, and Set 22 constructions run in altered surrounding prose rather than only
their original dataset sentences.

Do not edit the generated module. Edit the five files in `data/`, rerun the
compiler, inspect the diff, and run both commands above.
