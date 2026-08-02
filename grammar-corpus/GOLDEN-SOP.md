# Golden SOP — Edmund Grammar Detection Corpus

Document owner: Edmund Sir
System: Edmund Writing Submission portal
Canonical schema: `schemaVersion: 1`
Initial published corpus: `2026-08-01.1`
Applies to: teacher-authored grammar examples, reusable rules, exceptions, Supabase publication, Cloudflare Worker bundling, testing and rollback

## 1. Purpose

This SOP defines the only approved procedure for creating, reviewing, storing,
publishing and maintaining grammar-detection data for the Edmund Writing
Submission portal.

The corpus is not a list of every English sentence. It is a structured teaching
library that records:

- complete incorrect and corrected writing examples;
- sentence-level correction pairs;
- every individual grammatical change;
- reusable grammar rules;
- Traditional Chinese explanations;
- acceptable alternatives;
- exceptions and valid counterexamples; and
- retrieval, development, holdout and regression partitions.

The purpose is to teach the checker reusable grammatical structures while
preserving Edmund Sir's explanation style. The system must still analyse new
sentences independently. It must never assume that a near match has the same
answer as a stored example.

## 2. Non-negotiable principles

1. **Teacher approval is the authority.** Student writing, AI output, Harper
   output and local-rule suggestions cannot publish themselves.
2. **Preserve the student's intended meaning.** Correct grammar without adding,
   deleting or changing ideas unless the original meaning is genuinely
   impossible to recover. Ambiguous cases must be withheld for review.
3. **Separate grammar from style.** Do not label a merely less elegant phrase as
   grammatically wrong.
4. **Annotate every change.** The listed issue replacements must reconstruct the
   complete corrected sentence exactly.
5. **Document alternatives and exceptions.** A rule without its limits becomes
   an over-correction rule.
6. **Publish immutable versions.** Correct an approved release by creating a new
   release; never overwrite published rows.
7. **Keep evaluation material separate.** A grammatical family must not appear
   partly in retrieval and partly in holdout.
8. **Fail closed.** Invalid, incomplete or conflicting data must stop the
   release rather than silently entering production.
9. **Protect student privacy.** Corpus publication never requires storing live
   student sentences in the corpus, logs or a lookup database.
10. **Do not map isolated test sentences into production as emergency patches.**
    Add a reviewed reusable rule family and regression tests instead.

## 3. System architecture

The data has one authoritative authoring source and three generated outputs.

```text
Teacher-reviewed workbook / draft material
                  |
                  v
grammar-corpus/corpus-v1.json
        canonical publishable source
                  |
                  v
grammar-corpus/validate-and-generate.mjs
        |                 |                  |
        v                 v                  v
Worker snapshot      Supabase seed       Review CSV sheets
grammar-corpus.      seed-corpus-v1.sql  sheets-v1/*.csv
generated.js
```

Runtime storage is intentionally split:

- **Supabase** is the private normalized archive and release registry.
- **Cloudflare Worker** contains a compact, read-only snapshot of the current
  approved retrieval data.
- **The browser** receives grammar results, not the complete private corpus or
  any Supabase server credential.

This design avoids a Supabase round trip every time a student completes a
sentence. Exact teacher-approved matches also avoid a Workers AI call.

## 4. Repository files and ownership

| File or directory | Purpose | May be edited manually? |
|---|---|---:|
| `grammar-corpus/corpus-v1.json` | Canonical current release source | Yes, after review |
| `grammar-corpus/validate-and-generate.mjs` | Validator and output generator | Only for deliberate schema/tool changes |
| `grammar-corpus/seed-corpus-v1.sql` | Generated immutable Supabase seed | No |
| `grammar-corpus/sheets-v1/*.csv` | Generated workbook review sheets | No |
| `workers/writing-submission/src/grammar-corpus.generated.js` | Generated Worker snapshot | No |
| `supabase-writing-grammar-corpus.sql` | One-time normalized schema and security controls | Only through reviewed migration work |
| `workers/writing-submission/src/grammar-corpus.js` | Exact lookup and structural-guide runtime | Only through reviewed application work |
| `workers/writing-submission/test/grammar-corpus.test.mjs` | Corpus-runtime tests | Yes, when behaviour changes |

`v1` in `corpus-v1.json` refers to the data schema, not the release date. Future
releases continue to use this filename while `schemaVersion` remains `1`.
Every approved release receives a new `corpusVersion` inside the file.

## 5. Roles and approval boundary

One person may perform more than one role, but each pass must be completed
separately.

### 5.1 Author

- Writes the incorrect paragraph and its intended corrected form.
- States the topic, level and English variant.
- Proposes issues, rules, alternatives and exceptions.

### 5.2 Grammar reviewer

- Confirms that the correction is grammatical.
- Confirms that meaning has not changed.
- Separates grammar errors from stylistic preferences.
- Checks every issue and every valid alternative.

### 5.3 Corpus editor

- Assigns stable identifiers.
- Reuses existing rule IDs where appropriate.
- Normalizes the reviewed workbook into `corpus-v1.json`.
- Runs the validator and resolves data-contract failures.

### 5.4 Release operator

- Reviews the generated diff.
- Applies the Supabase seed.
- Verifies database counts.
- Runs the complete test suite.
- Deploys the Worker and static site changes.
- Records the commit and deployed versions.

No role may approve raw AI output automatically. The final authority remains a
human teacher review.

## 6. Recommended authoring workbook

Use an Excel or Google Sheets workbook while drafting. The production system
currently publishes JSON, not a workbook directly. A reviewed workbook must be
normalized into the canonical JSON before release.

Use these six sheets:

1. `Groups`
2. `Paragraphs`
3. `Sentences`
4. `Issues`
5. `Rules`
6. `Exceptions`

Do not paste workbook rows directly into Supabase. Do not treat the generated
CSV files as editable masters. The CSVs are review exports generated from the
canonical JSON.

## 7. Planning each new dataset batch

### 7.1 Build coverage, not sentence volume

Before writing a new paragraph, compare the proposed grammar problems with the
current rule inventory.

Classify each planned issue as:

- **new rule family** — no existing rule explains it;
- **new structural variant** — same rule in a meaningfully different structure;
- **new vocabulary/topic variant** — same structure in a different topic;
- **exception/counterexample** — prevents an existing rule from becoming too
  broad; or
- **regression case** — a previously failed behaviour that must remain fixed.

A productive batch normally contains a mixture. As a working target:

- 50–70% new rule families or genuinely new structures;
- 20–30% recombinations of existing rules in new topics or sentence forms; and
- 10–20% exceptions, correct counterexamples and regression cases.

These percentages are editorial guidance, not validator requirements.

### 7.2 Avoid artificial duplication

Do not create ten sentences that differ only by replacing `Tom` with `Mary` or
`school` with `office`. One strong example, one structurally different variant
and one counterexample are more valuable.

Vocabulary variety is useful only when the grammar structure still requires
the system to generalize. Topic words themselves must not become the detection
rule.

### 7.3 Suggested paragraph specification

For ordinary B1–B2 training data, aim for:

- 90–120 words;
- 6–8 complete sentences;
- 10–20 clearly defensible grammar issues;
- no more than eight displayed issues in one sentence; and
- a coherent topic with an identifiable intended meaning.

The validator permits broader limits, but these editorial limits keep examples
teachable and reviewable.

## 8. Creating the paragraph record

Required paragraph fields are:

| Field | Standard |
|---|---|
| `paragraphId` | `PARA-` followed by at least four digits, e.g. `PARA-0003` |
| `groupKey` | Stable uppercase family key, e.g. `ONLINE_LEARNING_001` |
| `title` | Short English title |
| `topicCategory` | Consistent broad category such as `Education / Technology` |
| `studentLevel` | e.g. `B1–B2` |
| `incorrectParagraph` | Exact ordered join of all incorrect sentences, separated by one space |
| `correctedParagraph` | Exact ordered join of all corrected sentences, separated by one space |
| `originalWordCount` | Space-delimited count calculated from the incorrect paragraph |
| `correctedWordCount` | Space-delimited count calculated from the corrected paragraph |
| `sentenceCount` | Number of sentence rows |
| `issueCount` | Number of issue rows belonging to the paragraph |
| `englishVariant` | `British English`, `American English`, or `both` |
| `author` | Normally `Edmund Sir` |
| `status` | Must be `approved` in a publishable JSON release |
| `version` | Positive integer for the paragraph record |
| `retrievalEligible` | `true` only for approved retrieval material |
| `evaluationHoldout` | `true` only for a holdout family; then retrieval must be `false` |
| `notes` | Concise editorial context |

### 8.1 Paragraph-writing rules

- The incorrect paragraph should resemble plausible student writing, not random
  word salad.
- Keep enough correct language that the intended meaning can be recovered.
- Do not deliberately insert spelling mistakes unless spelling is part of the
  planned coverage.
- Do not use offensive, private or personally identifying content.
- Do not include real student names or copy a student's paragraph verbatim
  without an approved anonymization process.
- If meaning is ambiguous, rewrite the training example before annotation.

## 9. Creating sentence records

Each paragraph must be split into complete sentences.

| Field | Standard |
|---|---|
| `sentenceId` | `<paragraphId>-S01`, `<paragraphId>-S02`, etc. |
| `paragraphId` | Existing parent paragraph ID |
| `order` | Unique positive order within the paragraph |
| `incorrectSentence` | Exact source sentence, including final punctuation |
| `correctedSentence` | Complete teacher-approved correction |
| `reviewPolicy` | `exact`, `guidance`, or `abstain` |
| `status` | `approved` for publication |

Every incorrect sentence must end in `.`, `!`, `?` or `;`.

### 9.1 Review-policy meanings

- `exact` — the exact source sentence may receive the teacher correction
  directly if the paragraph is retrieval-eligible.
- `guidance` — archive-only under the current generator. It does not enter the
  Worker snapshot until runtime support is deliberately extended.
- `abstain` — preserve for evaluation or documentation, but never use as a
  runtime answer.

The current generator publishes only `exact` sentences belonging to approved,
retrieval-eligible paragraphs in a `retrieval` group. Do not assume that a
`guidance` row is currently sent to the AI.

### 9.2 Exact means byte-for-byte

Production exact lookup uses the stored sentence text exactly, including case,
spacing and punctuation. A near match never inherits the stored correction.
The validator normalizes only to prevent duplicate exact examples.

The teacher-approved corrected counterpart is also recognized as an exact
clean sentence and returns no issue.

## 10. Creating issue records

Create one issue record for each independent correction.

| Field | Standard |
|---|---|
| `issueId` | `<paragraphId>-I001`, `<paragraphId>-I002`, etc. |
| `sourceIssueId` | Local readable ID such as `I001` |
| `sentenceId` | Existing parent sentence ID |
| `order` | Unique positive order within the sentence |
| `wrongText` | Exact non-empty substring from the incorrect sentence |
| `replacementText` | Exact non-empty replacement substring |
| `occurrence` | One-based occurrence of `wrongText` in that sentence |
| `ruleId` | Existing reusable rule ID |
| `explanationZhHant` | Brief issue-specific Traditional Chinese explanation |
| `acceptableAlternatives` | JSON array; empty when none |
| `confidence` | `0.5`–`1`; use `1` for fully teacher-confirmed examples |
| `status` | `approved` for publication |

### 10.1 Span rules

- `wrongText` must appear exactly in the incorrect sentence.
- If the same text appears twice, set `occurrence` to `1`, `2`, etc.
- Issue spans may not overlap.
- Character offsets are never entered manually; the generator calculates them.
- Empty insertion or deletion spans are not supported. Anchor an insertion or
  deletion to the smallest meaningful phrase.

Examples:

- insertion: use `go school` → `go to school`, not an empty span → `to`;
- deletion: use `near from` → `near`, not `from` → an empty value;
- phrase replacement: use `would not got` → `would not have got` when the
  grammar issue operates across the phrase.

### 10.2 Reconstruction rule

After all issue replacements are applied to the incorrect sentence, the result
must equal `correctedSentence` exactly. That includes capitalization, spaces,
apostrophes and punctuation.

If a corrected sentence contains an unannotated change, either:

1. add a valid issue record for that change; or
2. remove the unnecessary stylistic change from the correction.

Never hide a style rewrite inside a grammar correction.

### 10.3 Dividing issues

Separate issues when each has an independent teaching reason. Combine text into
one issue when splitting it would create overlapping spans or misleading
partial corrections.

Example:

```text
wrong:       would not got
replacement: would not have got
rule:        THIRD_CONDITIONAL_RESULT
```

Do not create overlapping `got` and `would not got` issues.

## 11. Reusable rule records

A reusable rule describes a grammatical relationship, not a single sentence.

| Field | Standard |
|---|---|
| `ruleId` | Uppercase snake case, e.g. `INDIRECT_QUESTION_ORDER` |
| `titleZhHant` | Short Traditional Chinese teaching title |
| `grammarCategory` | One value from the approved category list |
| `formula` | Compact grammatical formula |
| `structuralSignature` | Structural features, not topic vocabulary |
| `incorrectPattern` | Generalized wrong structure |
| `correctPattern` | Generalized correct structure |
| `explanationZhHant` | Reusable brief Traditional Chinese explanation |
| `correctExamples` | Several short correct examples where useful |
| `incorrectExamples` | Several short incorrect examples where useful |
| `alternativeCorrections` | Other generally valid formulations |
| `englishVariant` | `British English`, `American English`, or `both` |
| `status` | `approved` |
| `version` | Positive integer |
| `author` | Normally `Edmund Sir` |

### 11.1 Approved grammar categories

Use exactly one of:

- `subject_verb_agreement`
- `article_or_determiner`
- `singular_plural`
- `countability`
- `verb_form_or_tense`
- `modal_or_auxiliary`
- `infinitive_or_gerund`
- `preposition`
- `pronoun`
- `sentence_structure`
- `conjunction`
- `parallelism`
- `comparison`
- `possessive`
- `punctuation`
- `spelling_or_spacing`
- `word_form`
- `word_choice`
- `other_grammar`

Use `other_grammar` only after confirming that no narrower category applies.

### 11.2 Reuse versus creating a rule

Reuse an existing rule ID when the grammatical reason is the same, even if:

- the topic changes;
- the nouns and verbs change;
- the subject is a person rather than an organization; or
- the sentence is longer or shorter.

Create a new rule when the grammatical condition, correction formula or set of
exceptions is materially different.

Do not create topic-specific rule IDs such as `SCHOOL_NEEDS_S`. Use structural
IDs such as `SINGULAR_SUBJECT_VERB`.

## 12. Exceptions, counterexamples and alternatives

Every broad rule must be reviewed for cases where its surface pattern can be
correct.

Required exception fields:

| Field | Standard |
|---|---|
| `exceptionId` | `EX-<RULE_ID>-01`, `-02`, etc. |
| `ruleId` | Existing parent rule |
| `order` | Unique positive order within that rule |
| `conditionEn` | Exact condition under which the apparent pattern is valid |
| `exampleText` | A complete valid counterexample |
| `explanationZhHant` | Traditional Chinese explanation of why it is valid |
| `englishVariant` | Applicable variant |
| `status` | `approved` |

Distinguish:

- **acceptable alternative for this issue** — store in the issue's
  `acceptableAlternatives`;
- **general alternative formulation for a rule** — store in the rule's
  `alternativeCorrections`; and
- **valid counterexample that limits a rule** — create an exception record.

Example:

- error: `near from the station` → `near the station`;
- valid alternative: `close to the station`;
- counterexample: `The negotiations were near to completion.`

## 13. Traditional Chinese explanation standard

### 13.1 Tone

Use clear Traditional Chinese suitable for Hong Kong learners. The tone should
be calm, direct and instructional—not punitive.

Preferred wording:

- `這裡……所以寫……`
- `……後面使用動詞原形。`
- `這是間接問句，因此……`
- `在一般英文中，information 是不可數名詞。`

Avoid:

- `這句完全錯誤。`
- vague comments such as `文法不好`;
- unexplained labels only; and
- absolute claims where a documented exception exists.

Use `通常` when the rule is not universal, then add the relevant exception.

### 13.2 Terminology glossary

| English concept | Preferred Traditional Chinese |
|---|---|
| base verb | 動詞原形 |
| third-person singular | 第三身單數 |
| plural subject | 複數主語 |
| countable noun | 可數名詞 |
| uncountable noun | 不可數名詞 |
| modal verb | 情態動詞 |
| infinitive | 不定詞 |
| gerund | 動名詞 |
| indirect question | 間接問句 |
| passive voice | 被動語態 |
| relative clause | 關係子句 |
| past participle | 過去分詞 |
| parallel structure | 平行結構 |

### 13.3 Two explanation levels

Keep the issue explanation short and sentence-specific:

```text
companies 是複數主語，現在式動詞用 require，不加 s。
```

Keep the reusable rule explanation general:

```text
複數主語在一般現在式中通常配合不加 s 的動詞。
```

Long worked examples belong in `correctExamples`, `incorrectExamples` and the
editorial teaching library—not inside every issue row.

### 13.4 Explanation checklist

Each issue explanation should answer at least two of these questions:

1. Which word or structure controls the grammar?
2. Which form is required?
3. Why is the student's form unsuitable here?
4. What is the corrected form?

## 14. British and American English

- Use `both` when the rule is unchanged across variants.
- Use `British English` or `American English` when the accepted form differs.
- Do not mark a valid spelling from the other standard as incorrect.
- Record alternative forms, e.g. `got` and `gotten`, where grammatically
  appropriate.
- Keep one paragraph internally consistent unless the example is explicitly
  about variant comparison.

## 15. Groups and data partitions

Related variants share one `groupKey`. A group must belong entirely to one
partition.

| Partition | Purpose | Included in current Worker snapshot? |
|---|---|---:|
| `retrieval` | Approved production examples | Yes, when paragraph and sentence flags also permit it |
| `development` | Examples used while designing and tuning | No |
| `holdout` | Hidden evaluation families | No |
| `regression` | Known failure cases used for testing | No |

For a mature corpus, reserve approximately 20% of independent grammar families
for holdout evaluation. Do not place a paraphrase or vocabulary swap of a
retrieval example in holdout; that leaks the answer family into training.

For a holdout paragraph:

```json
{
  "retrievalEligible": false,
  "evaluationHoldout": true
}
```

For a retrieval paragraph:

```json
{
  "retrievalEligible": true,
  "evaluationHoldout": false
}
```

## 16. Corpus-level release metadata

| Field | Standard |
|---|---|
| `schemaVersion` | Currently `1` |
| `corpusVersion` | New immutable release ID, recommended `YYYY-MM-DD.N` |
| `title` | Human-readable release title |
| `status` | `approved` only after editorial review |
| `author` | Release owner |
| `approvedAt` | Canonical UTC ISO time such as `2026-08-01T00:00:00.000Z` |
| `notes` | What this release adds or changes |
| `annotationNotes` | Persistent corpus-wide editorial principles |

The active JSON is a complete snapshot, not a delta. A new release starts from
the previous complete corpus, then adds or corrects reviewed data and receives
a new `corpusVersion`.

Never reuse a version number for changed content. The generated canonical
SHA-256 fingerprint makes this a hard database rule.

## 17. Authoring-to-publication procedure

### Phase A — Plan

1. Review the existing Rules and Exceptions sheets.
2. Create a coverage plan for the batch.
3. Assign a new paragraph ID and group key.
4. Choose the partition before writing variants.
5. Record whether each planned issue is new, reused, exceptional or regression.

### Phase B — Write and annotate

1. Write the coherent incorrect paragraph.
2. Write the fully corrected paragraph while preserving meaning.
3. Split both into corresponding sentence pairs.
4. Record each issue separately.
5. Reuse or create rule records.
6. Record acceptable alternatives and counterexamples.
7. Check British/American variation.
8. Count words, sentences and issues.

### Phase C — Editorial review

Perform two passes.

**Pass 1: grammar and meaning**

- Is the correction grammatical?
- Is every original idea preserved?
- Did the correction accidentally improve style rather than grammar?
- Are all alternatives and exceptions represented?

**Pass 2: annotation and pedagogy**

- Does each issue identify the correct span?
- Does each issue use the correct rule ID?
- Does the Chinese explanation teach the actual reason?
- Would the rule over-correct a valid sentence?
- Is the example family in the correct partition?

Only after both passes may the material become `approved` in the canonical
JSON.

### Phase D — Normalize into the canonical JSON

1. Start from the current complete `corpus-v1.json`.
2. Bump `corpusVersion`.
3. Update the title, approval time and release notes.
4. Add the reviewed group, paragraph, sentence, issue, rule and exception rows.
5. Preserve all previously approved records unless the new version deliberately
   supersedes a faulty record.
6. Keep JSON strings trimmed; do not add control characters.
7. Do not manually add character offsets or Worker structure tags.

### Phase E — Generate and validate

From the repository root:

```sh
node grammar-corpus/validate-and-generate.mjs
```

Or from `workers/writing-submission`:

```sh
npm run corpus:check
```

The generator must finish successfully and report the expected:

- corpus version;
- content SHA-256;
- group count;
- paragraph count;
- sentence count;
- issue count;
- rule count; and
- exception count.

It then regenerates the Worker snapshot, SQL seed and six CSV sheets.

### Phase F — Review generated changes

Run:

```sh
git diff --check
git status --short
git diff --stat
```

Confirm:

- no unrelated file changed;
- all generated outputs changed consistently;
- the generated file header still says not to edit it;
- counts match the workbook review totals; and
- no secrets, student identities or live student writing appear in the diff.

### Phase G — Run the complete checks

From `workers/writing-submission`:

```sh
npm run check
```

This performs:

1. corpus regeneration and validation;
2. Worker syntax checking;
3. the complete Node test suite; and
4. a Cloudflare Wrangler deployment dry run.

From the repository root also run:

```sh
node tools/test-writing-submission-ai.mjs
```

Do not deploy if either command fails.

### Phase H — Store the release in Supabase

The schema migration is applied once:

```text
supabase-writing-grammar-corpus.sql
```

For each new release, apply only the newly generated:

```text
grammar-corpus/seed-corpus-v1.sql
```

The seed transaction:

1. rejects a reused version with a different hash;
2. creates the release as `reviewed`;
3. inserts all normalized rows;
4. verifies all table counts;
5. promotes the release to `approved`; and
6. marks it as the single current release.

Verify with:

```sql
select * from public.writing_grammar_corpus_status();
```

The returned version and counts must exactly match the generator output.

### Phase I — Deploy the Worker

From `workers/writing-submission`:

```sh
npm run deploy
```

Verify the public health endpoint:

```text
https://edmund-writing-submission.edmundeducation.workers.dev/v1/health
```

Confirm that `grammarCorpus.version` matches the Supabase current release and
that `approvedSentenceCount` matches the generated Worker count.

Use a cache-busting query value if an edge briefly returns the previous health
response immediately after deployment.

### Phase J — Commit and publish the static repository

1. Confirm the worktree contains only intended files.
2. Commit with a release-specific message.
3. Push `main`.
4. Wait for the `Deploy GitHub Pages` workflow to complete successfully.
5. Confirm the public `writing-submission-ai.js` contains the expected corpus
   engine integration.

Record:

- corpus version;
- content hash;
- Git commit;
- Supabase verification counts;
- Worker version ID;
- test results; and
- GitHub Pages deployment result.

## 18. Automated validation contract

The current validator rejects publication when any of the following occurs:

- invalid or duplicate IDs;
- missing paragraph, sentence or rule parents;
- an unapproved publishable record;
- invalid category, English variant, partition or review policy;
- invalid ordering or duplicate order numbers;
- incorrect word, sentence or issue counts;
- paragraph text that does not exactly equal the ordered sentence join;
- a sentence without accepted final punctuation;
- `wrongText` not found at the declared occurrence;
- overlapping issue spans;
- issue replacements that do not reconstruct the corrected sentence;
- more than eight issues in one sentence;
- a holdout paragraph marked retrieval-eligible;
- a paragraph whose flags disagree with its group partition;
- a duplicate normalized exact source sentence; or
- malformed or conflicting runtime material.

Passing automation does not replace teacher review. It proves data integrity,
not pedagogical correctness.

## 19. Supabase data model and security

The private normalized tables are:

- `writing_grammar_corpus_releases`
- `writing_grammar_corpus_groups`
- `writing_grammar_rules`
- `writing_grammar_paragraphs`
- `writing_grammar_sentences`
- `writing_grammar_issues`
- `writing_grammar_rule_exceptions`

Security controls:

- Row Level Security is enabled on every corpus table.
- No permissive browser policies exist.
- `public`, `anon`, `authenticated` and `service_role` receive no direct table
  access.
- `service_role` may execute only the restricted status function.
- The browser never receives the Supabase server secret.
- Approved and retired releases are immutable through database triggers.

Corpus publication is a private deployment operation. Do not create a public
Supabase endpoint that returns the corpus merely for runtime convenience.

## 20. Runtime detection behaviour

### 20.1 Exact approved source

When the student's completed sentence is byte-for-byte identical to an
approved exact source sentence, the Worker returns the teacher-approved
correction and explanations without invoking Workers AI.

### 20.2 Exact approved correction

When the sentence is byte-for-byte identical to the teacher's corrected
counterpart, the Worker treats it as an approved clean sentence and returns no
issue.

### 20.3 Unseen sentence

An unseen sentence is reviewed independently by the general AI pipeline. The
corpus may provide only a small number of structurally relevant guides. Guides
are selected using grammar categories and structural features rather than
topic words alone.

The AI may not copy names, facts or vocabulary from a guide. A guide is not an
answer key for a near match.

### 20.4 Fallback and failure

- The 70B model proposes and audits a correction.
- The 8B model is an independent last-resort fallback when safe 70B output is
  unavailable.
- Local rules and Harper remain limited backup checks.
- If no result can be verified safely, the system returns an availability
  warning rather than claiming the sentence is correct.
- Quota exhaustion is an availability state, not a grammar judgment.

## 21. Privacy and logging rules

Never store in the corpus:

- live student submissions;
- student IDs, names, passwords or tokens;
- raw Workers AI prompts or responses;
- unreviewed accepted suggestions; or
- provider error payloads containing student text.

The grammar-check request sends only the completed sentence. It does not send
the topic, complete essay, student account, earlier sentences or grammar log.

Do not add sentence text to console logs, analytics events, KV, R2, Durable
Objects or Supabase lookup logs.

## 22. Quality-assurance tests for each batch

Create or select tests covering:

1. **Exact incorrect** — returns all approved issues.
2. **Exact corrected** — returns no issues.
3. **Unseen vocabulary variant** — does not require an exact database match.
4. **Valid counterexample** — is not falsely corrected.
5. **British/American alternative** — both accepted where intended.
6. **Multi-error sentence** — every independent issue is represented.
7. **Meaning preservation** — proposed correction does not change facts,
   polarity, numbers, names or quoted text.
8. **Near match** — does not inherit an exact teacher answer.
9. **Holdout family** — absent from the Worker snapshot.
10. **Conflict case** — invalid or contradictory corpus data fails closed.

Maintain a small regression set for every production failure. Regression tests
may refer to the grammar structure, but production code must not contain a
sentence-specific rescue table.

## 23. Release acceptance checklist

Do not declare a release complete until every item is true.

### Editorial

- [ ] Incorrect and corrected paragraphs preserve the same meaning.
- [ ] Every definite grammar error is annotated.
- [ ] No style-only change is presented as mandatory grammar.
- [ ] Every issue uses the correct reusable rule.
- [ ] Alternatives and exceptions are documented.
- [ ] Traditional Chinese explanations follow the approved tone and glossary.
- [ ] English variant is correct and consistent.
- [ ] Group partition and holdout decision are approved.

### Data integrity

- [ ] New stable IDs contain no collisions.
- [ ] Counts are correct.
- [ ] Sentence joins reproduce both paragraphs exactly.
- [ ] Issue replacements reproduce every corrected sentence exactly.
- [ ] Issue spans do not overlap.
- [ ] No sentence exceeds eight issues.
- [ ] `corpusVersion` is new.
- [ ] Approval time is canonical UTC ISO format.

### Technical

- [ ] Generator completes successfully.
- [ ] Generated counts and SHA-256 are recorded.
- [ ] `git diff --check` passes.
- [ ] Complete Worker test suite passes.
- [ ] Browser adapter test passes.
- [ ] Wrangler dry run passes.
- [ ] Supabase status version and counts match.
- [ ] Deployed Worker health version and count match.
- [ ] GitHub Pages deployment succeeds.
- [ ] Public browser integration serves the expected engine.
- [ ] Worktree is clean after commit and push.

## 24. Rollback and correction procedure

### 24.1 Never edit an approved release

If an approved example is wrong, create a corrected full snapshot with a new
`corpusVersion`. Preserve the faulty release for audit history.

### 24.2 If Supabase publication succeeds but Worker deployment fails

Preferred recovery:

1. fix the deployment problem without changing corpus content;
2. rerun tests; and
3. deploy the already generated matching Worker snapshot.

If immediate rollback is necessary:

1. retrieve the previous release seed and Worker snapshot from the previous Git
   commit using a temporary worktree or a deliberate revert—not a destructive
   reset;
2. reapply the previous idempotent seed to restore its `is_current` flag;
3. redeploy the previous Worker snapshot; and
4. verify that Supabase and Worker versions match again.

Do not delete the failed release. Do not manually edit its approved child rows.

### 24.3 If a bad release reaches production

1. Record the affected corpus version and failure.
2. Restore the previous matching database/Worker pair if learner impact is
   material.
3. Create a new corrected release rather than reusing the bad version.
4. Add a regression case that would have prevented the failure.
5. Repeat the complete release checklist.

## 25. Troubleshooting guide

| Error or symptom | Likely cause | Required response |
|---|---|---|
| `wrongText is not present` | Text or occurrence number does not match source | Copy exact source substring and correct the one-based occurrence |
| `overlaps` | Two issue spans cover some of the same characters | Combine the grammatical phrase or redesign non-overlapping issues |
| `issues reconstruct ... not the approved correction` | Missing, extra or inaccurate issue replacement | Compare every change and annotate or remove it |
| `paragraph ... is not the ordered sentence join` | Spacing, punctuation or sentence text differs | Rebuild paragraph from ordered sentence strings with one space |
| word-count mismatch | Manual count differs from whitespace count | Recalculate from the exact stored paragraph |
| duplicate exact sentence | Same normalized source appears twice | Reuse the existing record or create a genuinely different structure |
| missing rule | Issue references an unknown `ruleId` | Reuse a valid rule or add and review a complete rule record |
| holdout/retrieval mismatch | Paragraph flags disagree with group partition | Correct the entire family's partition and flags |
| corpus version exists with different content | Published version number was reused | Assign a new `corpusVersion` |
| Supabase counts do not match | Incomplete or inconsistent seed operation | Stop; do not approve; regenerate and reapply transactionally |
| Worker health shows previous version | Deployment propagation or old deployment | Confirm deploy result, retry with cache-busting query and inspect version ID |
| exact sentence works but new sentence fails | AI availability or insufficient generalization | Check AI availability; add reusable structural coverage, not an exact rescue map |
| quota exhausted | Cloudflare daily AI allowance used | Treat as unavailable; exact corpus and local fallback may continue |

## 26. Change-control rules

A schema or runtime change requires more than a corpus release when it modifies:

- allowed fields;
- grammar categories;
- review policies;
- ID formats;
- issue-span behaviour;
- partition semantics;
- Worker guide selection;
- database tables or permissions; or
- generated output shapes.

For such changes:

1. update the validator first;
2. update or add tests;
3. update the Supabase migration safely;
4. update the runtime consumer;
5. update this SOP and the corpus README;
6. run old-corpus compatibility tests; and
7. publish a new schema version only if backward compatibility cannot be
   maintained.

## 27. Minimum handover package for future work

When providing new data for implementation, supply:

- the reviewed workbook or normalized draft;
- paragraph and group IDs;
- partition decision;
- incorrect and corrected paragraphs;
- sentence pairs;
- all issues with exact wrong/replacement text;
- existing or proposed rule IDs;
- Traditional Chinese explanations;
- alternatives and counterexamples;
- British/American decision;
- approval status; and
- notes identifying new versus reused grammar coverage.

If any field is missing, the material remains a draft and must not be published.

## 28. Current baseline

Initial release `2026-08-01.1` contains:

- 2 approved paragraphs;
- 14 approved sentences;
- 31 individual issues;
- 23 reusable rules; and
- 13 exceptions or valid counterexamples.

These records are the baseline for future coverage planning. New sets should
expand reusable grammatical structures and counterexamples—not merely repeat
the same errors with different names.
