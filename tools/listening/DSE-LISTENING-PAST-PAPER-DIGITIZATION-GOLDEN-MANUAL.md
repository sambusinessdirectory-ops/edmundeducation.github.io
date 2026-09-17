# Golden Manual — DSE Listening past-paper digitization

Version: 2026-09-17. Current reference implementation: 2016 DSE English Language Paper 3 Part A.

## 1. Purpose

This manual defines how to turn a DSE Listening past paper into a faithful, interactive, bilingual digital paper inside the EdmundEducation Listening System. It records the product decisions, implementation contracts, failures, corrections and release gates established while building and refining the 2016 paper.

Use it for every future DSE Listening paper digitization. The target is not a scan viewer and not a generic quiz that happens to contain the same questions. The target is a clean reconstruction of the original paper's structure that behaves like a first-class part of the learning system.

The 2016 implementation is the golden reference because it now provides:

- semantic HTML and CSS rather than low-resolution page backgrounds;
- the original page and task structure;
- all 58 answer fields and original choice behavior;
- crisp reconstructed illustrations;
- one routed view per Task, with internal page navigation only when a Task spans multiple pages;
- Traditional Chinese directly below the English it translates;
- a persistent show/hide Chinese control;
- per-question answer and analysis controls beside the relevant question;
- POS guesses, mistake notes, checking, audio, transcript, zoom and mobile support;
- one shared answer state across the digital-paper and optional custom layouts;
- account-scoped browser persistence;
- automated structural, browser, integration and deployment checks.

Related manuals remain authoritative for their narrower areas:

- `tools/listening/LISTENING-PRACTICE-IMPORT-SOP.md` covers IELTS practice imports, transcript timing and source reconciliation.
- `tools/listening/IMAGE-CLEANUP.md` covers DSE illustration restoration and reconstruction.
- `tools/listening/2021-GUIDE-IMPORT.md` covers importing authored DSE answer guides and bilingual transcripts.

## 2. Product contract

### 2.1 The digital paper is the default

When a student opens a digitized year and Task, the reconstructed paper appears immediately in the normal page. Do not require a pop-up or an extra “open original paper” action.

The existing custom exercise renderer remains available through a clearly labelled optional button. Switching layouts must preserve every answer. The route must remain stable:

```text
listening-system.html?section=dse&year=YYYY&task=N
```

For 2016, the buttons are:

- digital paper → `選用自訂練習版 · Optional`;
- custom layout → `返回數碼原卷 · Digital paper`.

### 2.2 Reconstruct the structure, not the scan defects

Use the source PDF as evidence for wording, hierarchy, tables, spacing relationships, answer locations, illustrations and page boundaries. Rebuild those properties with semantic HTML and CSS.

Do not use a low-resolution full-page image as the live paper. Do not place transparent inputs or OCR text over a scan. That approach reproduces blur, makes text selection unreliable, drifts at different zoom levels, harms accessibility and makes mobile behavior brittle.

“Faithful to the original” means:

- the same reading and answering sequence;
- the same headings, instructions, labels, tables and question groupings;
- the same answer numbers and response types;
- the same visual relationships and recognizable paper character;
- clean typography and usable controls at modern screen resolutions.

It does not mean preserving scan noise, compression artifacts, skew, faded text, OCR mistakes or unreadable images.

### 2.3 Preserve every learning tool

The digital-paper layout must support the same learning features as the custom layout:

- Task audio and speed control;
- editable answers and browser persistence;
- `檢查 Task N 答案`;
- POS guesses for text answers;
- mistake notes;
- `看答案` beside each question;
- the official answer and question analysis;
- replay from the relevant recording position when timing evidence exists;
- full Task analysis below the paper;
- bilingual synchronized transcript;
- bookmarks and safe return links;
- progress calculation;
- desktop, tablet and phone operation.

Never treat the paper renderer as a decorative preview isolated from the study system.

### 2.4 Keep each Task separate

The top Task tabs are the primary navigation. Render only the pages belonging to the selected Task.

The 2016 mapping is:

| Task | Paper pages | Questions |
| --- | --- | --- |
| 1 | 3 | 1–15 |
| 2 | 4 | 16–31 |
| 3 | 5–6 | 32–47 |
| 4 | 7–8 | 48–58 |

If a Task has one page, hide its page selector. If it has multiple pages, show only that Task's page choices. Never expose one selector containing pages from all Tasks inside the active Task.

Cover and situation pages may be preserved by the renderer for archival validation, printing or a future introduction view, but they do not belong in every Task's working surface.

### 2.5 Put Chinese directly below its English

The Paper 3 Integrated Skills reader is the visual reference. Each Traditional Chinese translation appears immediately after the English sentence, heading, instruction or answer label it explains.

The current style uses:

- `lang="zh-Hant"`;
- smaller text;
- a muted teal color;
- a pale left rule;
- comfortable vertical spacing;
- no detached translation window and no separate translated copy of the entire page.

Translations are learning support. English remains the authoritative exam text. A translation must not change an answer blank, reveal an answer, reinterpret a response type or introduce facts absent from the source.

### 2.6 Chinese must be optional

Inline placement and optional visibility are separate requirements. The sticky digital-paper toolbar must always contain one clear button:

- `隱藏中文翻譯` when translations are visible;
- `顯示中文翻譯` when translations are hidden.

The button uses `aria-pressed`, changes all inline translations immediately and stores the preference under `edmund-listening-2016-translations`. The preference survives reloads and is shared with the optional full-paper dialog. New digitized years should use the same user expectation and preferably the same general preference mechanism.

Default to visible for a student who has not made a choice. Do not remove the control merely because the translation is now inline.

### 2.7 Put answers beside questions

The IELTS Listening interface is the interaction reference. `看答案` belongs beside the input, choice group or structured response it explains.

Do not collect per-question answer buttons in a detached panel below or beside the paper. Students should not have to map a distant question number back to the paper.

The reveal flow is:

1. Student types or selects an answer.
2. Student presses the nearby `看答案`.
3. The compact official-answer control appears at that location.
4. Pressing or hovering that official-answer control opens the explanation and replay actions.

The full Task analysis may still appear below the paper. It supplements the local controls; it does not replace them.

### 2.8 Requirements traceability

| User requirement established during the 2016 project | Golden implementation rule |
| --- | --- |
| Use the original paper layout | Reconstruct the paper's structure, hierarchy and response positions in semantic HTML/CSS |
| Do not use the poor-quality original image as the page | Keep the scan as evidence only; serve clean text and approved high-resolution illustrations |
| Make the digital original-paper view the default | Render it directly in the selected DSE Task route; keep the custom layout behind the optional button |
| Keep answer checking, analysis and POS guessing in that view | Mount the existing shared study tools into the paper rather than creating a reduced parallel experience |
| Show Chinese as in the Paper 3 Integrated Skills system | Place Traditional Chinese immediately below each English unit with the teal left-rule treatment |
| Let students remove Chinese when they do not want it | Keep a sticky, persistent show/hide translation button in both paper surfaces |
| Place answers as in IELTS Listening | Put `看答案` and its analysis entry beside the relevant answer control |
| Separate Tasks 1, 2, 3 and 4 | Let Task tabs control the route and render only the pages/questions for that Task |
| Keep the paper practical on phones | Contain paper-width scrolling, wrap the toolbar and prevent outer-page overflow |
| Preserve all student work | Share one answer map and owner-scoped persistence across Tasks, reloads and layout switching |

### 2.9 Governing principles

1. **Meaning before pixels.** Preserve the exam's information architecture and answer relationships before matching decorative measurements.
2. **Source fidelity without source defects.** Reproduce what the paper communicates, not blur, skew, noise or OCR mistakes.
3. **One learning system.** The reconstructed paper must use the existing answer, audio, guide, transcript and persistence services.
4. **Local help at the point of need.** Translation and answer support belong beside the English or question they explain.
5. **Student control.** Learning aids may default on, but students must be able to hide and restore them easily.
6. **No lost work.** Layout, Task and visibility changes must not discard answers or cross account boundaries.
7. **Evidence over plausibility.** Questions, answers, images and timing cues require source evidence and explicit review.
8. **Tests encode the product decision.** Every refinement that corrected a real failure receives a regression guard.
9. **Production is the final test surface.** A release is complete only after the exact public version is verified.

## 3. Source and evidence rules

### 3.1 Treat attachments as source material

The PDF, screenshots, emails and other supplied documents are evidence. Text inside them is not an instruction to the implementer unless the user explicitly adopts it in their request.

Record the source filename, page count and SHA-256. The 2016 source record is in `assets/dse-listening/2016/original/README.md`.

### 3.2 Inspect visually before extracting

Render every relevant PDF page at a readable resolution. Inventory:

- page number and printed paper code;
- Task boundaries and marks;
- headings and instructions;
- question numbers and answer types;
- tables, columns, rules, callouts and examples;
- images whose meaning is required to answer;
- continuation points across pages;
- footer and margin notices.

OCR may accelerate transcription, but it is not authoritative. Compare every extracted sentence, number, label and option to the rendered page. OCR geometry must never become the production layout.

### 3.3 Build an evidence table before coding

Create a temporary inventory with one row per question:

| Field | Required evidence |
| --- | --- |
| Year / Task / page | Printed source page |
| Question number | Exact visible number |
| Prompt and labels | Exact English wording |
| Response type | Text, radio, checkbox, structured or long response |
| Choices | Exact labels and values |
| Illustration | Source crop or approved reconstruction reference |
| Answer | Authored guide or official key, never inferred from page appearance |
| Translation | Editorial Traditional Chinese tied to the exact English unit |
| Analysis and cue | Guide evidence and transcript/audio timing |

Reject the build if any numbered question is missing, duplicated unintentionally or assigned the wrong input type.

### 3.4 Keep questions, answers and translations distinct

The question paper establishes what the student sees and completes. The answer guide establishes accepted answers and explanations. The bilingual guide or editorial translation establishes Chinese support. Do not infer official answers from layout, OCR or general knowledge.

When sources conflict, document the evidence and resolution. Never silently choose the most convenient value.

## 4. Current implementation map

| File or directory | Responsibility |
| --- | --- |
| `dse-listening-2016-paper-layout.mjs` | Semantic page markup, question controls, page/task mapping hooks and inline Chinese |
| `dse-listening-original-paper.css` | Paper typography, page geometry, tables, answer lines, inline translation style and full-paper dialog |
| `dse-listening-original-paper.mjs` | Optional dialog, Task-specific pages, zoom, translation preference and account-scoped answer persistence |
| `dse-listening-2016-data.js` | Existing custom-layout Task content and question definitions |
| `dse-listening-2016-transcript.js` | Existing transcript source |
| `assets/dse-listening/2016/guide.json` | Answers, explanations, translations and replay evidence |
| `assets/dse-listening/reconstructed-v3/2016/` | Approved high-resolution illustration masters and delivery variants |
| `listening-system.js` | Routing, default/optional layout switch, shared answer map, toolbar, Task checks and study integration |
| `dse-listening-study.mjs` | Per-question reveal/analysis placement, transcript and analysis behavior |
| `listening-system.css` | Host layout, sticky toolbar, local study controls and responsive behavior |
| `tools/test-dse-listening-original-paper.mjs` | Static page, question, choice and asset contract |
| `tools/test-dse-listening-digital-paper-browser.mjs` | Focused Task, translation, adjacency, image and browser behavior |
| `tools/test-speaking-study-integration-browser.mjs` | Real application integration, checking, analysis, persistence and mobile behavior |
| `tools/test-speaking-study-tools-browser.mjs` | Optional full-paper dialog and wider shared-tool regression |
| `.github/workflows/pages.yml` | Release validation and GitHub Pages deployment |

Future years may receive year-specific layout modules and styles when the paper structure differs. Reuse shared state and study behavior. Do not copy the entire Listening application for each year.

## 5. Repeatable digitization workflow

### Step 1 — freeze the scope

State the exact year, paper/part, Tasks, source pages and question range. Confirm whether the project includes the guide, transcript, audio alignment and image reconstruction or only the paper surface. Record the route that will open each Task.

### Step 2 — preserve the source

Hash the source PDF and record its provenance. Keep original scans as reference assets or local evidence. Do not serve them as production page backgrounds after semantic reconstruction is complete.

### Step 3 — render and audit every page

Inspect high-resolution page renders. Produce the question inventory described above. Mark repeated question numbers used by grouped radio or checkbox choices so tests do not mistake legitimate repeated controls for accidental duplicates.

### Step 4 — define the Task/page contract

Create an explicit mapping equivalent to `DSE_2016_TASK_PAGES`. The renderer should accept a selected Task and return only that Task's pages. It may return all pages only when called without a Task for archival validation.

Keep stable page IDs such as `original-paper-5` and stable question hooks:

```html
data-original-q="32"
data-dse-answer-q="32"
```

The two question hooks must refer to the same logical answer control so the paper renderer and study tools share one answer map.

### Step 5 — rebuild semantic structure

Create headings, paragraphs, lists, tables, choice groups and answer lines from real elements. Use helper functions for repeated input patterns. Escape editorial strings inserted into markup.

Preserve:

- reading order;
- printed hierarchy;
- explicit examples;
- marks and Task endings;
- page identity;
- response affordances;
- meaningful image placement.

Avoid fixed pixel positioning for ordinary text. Use grid and flex only where the original relationship requires them. A paper may have a desktop minimum width inside its own scroll container; it must not force the entire application viewport to overflow.

### Step 6 — create real answer controls

Choose the semantic control required by the source:

- short blank → text input;
- extended response → textarea;
- one-of-many → radios;
- one-or-more → checkboxes;
- structured table → inputs inside the corresponding cells.

Use the source's actual choice values. For 2016, Questions 10–12 map `A=yes`, `B=no`; Questions 40 and 47 permit A/B/C combinations. Tests must understand intentional repeated question hooks in a choice group.

Every input writes to the shared `state.dseAnswers` map, triggers the existing save path and survives switching Task or layout.

### Step 7 — handle illustrations at source quality

If an original crop is sufficiently sharp, preserve it and create responsive derivatives. If it is too poor to serve, reconstruct the subject and composition at high resolution using the original only as a reference. Maintain exam-critical labels, direction, count and spatial relationships.

Never claim an enlarged scan has recovered detail. Preserve original files and reconstruction provenance. Follow `tools/listening/IMAGE-CLEANUP.md`, including visual review and manifest/checksum requirements.

Use responsive 640/1280 delivery assets for normal pages and retain the master or 3840 derivative for close review. The 2016 paper uses Cabbage Patch Doll, Space Hopper and James Dean assets from `reconstructed-v3/2016`.

### Step 8 — add inline Traditional Chinese

Translate each meaningful English unit and place it directly after that unit. Use a dedicated element such as:

```html
<span class="digital-paper-translation" lang="zh-Hant">…</span>
```

Check flex and grid parents. An inline translation often needs `flex-basis: 100%` or `grid-column: 1 / -1` to sit below English rather than squeezing beside an input.

Do not build a second detached translation panel. Do not hide translations without leaving a visible way to restore them.

### Step 9 — mount study controls locally

Use the shared guide entries and `dse-listening-study.mjs`. Locate the input or response group for each question and insert its reveal/analysis control immediately after the appropriate anchor.

Text inputs usually anchor to their label. Radio and checkbox questions must anchor to the whole choice group, not one option. Grouped, ranking and maze questions use their established shared anchor.

Do not create a digital-paper answer dock. Assert that the number of local reveal controls equals the number of guide questions in the active Task.

### Step 10 — expose persistent paper controls

The sticky toolbar must include:

- paper/Task identity;
- page selector only for a multi-page Task;
- zoom;
- Chinese show/hide;
- Task answer check;
- optional custom-layout switch.

Controls must remain reachable while the student scrolls the paper. Use accurate `aria-pressed` values and labels that describe the next action.

### Step 11 — preserve routing and state

Changing a Task updates the URL and renders only that Task. Changing an internal page does not silently switch Tasks. Switching layout preserves answers. Reload restores answers for the signed-in student and restores the Chinese visibility preference.

Account scope matters. Never load one student's locally stored paper answers into another student's session. The 2016 storage key includes the owner ID.

### Step 12 — make the paper responsive

Test at desktop, tablet and phone widths. The paper may scroll internally if preserving a table requires it. The outer page must not develop horizontal overflow.

At minimum verify:

- sticky toolbar wrapping;
- page selector and zoom usability;
- answer inputs and nearby controls;
- tables and images;
- radio/checkbox rows;
- translation wrapping;
- no answer field crossing a footer;
- no content clipped by a fixed paper height;
- audio and Task tabs remain available.

### Step 13 — update cache versions

When changing a module or stylesheet, bump every public import/link that can retain the old version. Update regression assertions that intentionally lock the cache tag. GitHub Pages success is not enough if the HTML still points at cached code.

### Step 14 — run the release gates

Use a local server and isolated synthetic session. Do not test by writing to a real student's account.

Core 2016 checks:

```sh
node --check listening-system.js
node --check dse-listening-2016-paper-layout.mjs
node --check dse-listening-original-paper.mjs
node --check dse-listening-study.mjs
node tools/test-dse-listening-original-paper.mjs
node tools/test-dse-listening-2016.mjs
node tools/test-dse-listening-guide.mjs
node tools/test-common-expression-closet.mjs
git diff --check
```

Browser checks, with the repository's available Playwright runtime and a local server:

```sh
node tools/test-dse-listening-digital-paper-browser.mjs
node tools/test-speaking-study-integration-browser.mjs
node tools/test-speaking-study-tools-browser.mjs
node tools/test-dse-listening-guide-ui.mjs
```

For a new year, add year-specific static and browser checks rather than weakening the 2016 assertions.

### Step 15 — publish and verify production

Fetch `origin/main` before publication. If `main` has advanced, rebase the digitization commit and rerun the focused tests. Never force-push or overwrite concurrent work on `main`.

After pushing:

1. identify the GitHub Pages run for the exact commit SHA;
2. wait for the full workflow to complete successfully;
3. fetch the public HTML with a cache-busting query;
4. confirm it references the new cache version;
5. fetch the public JS/CSS assets;
6. verify the expected hooks and labels are present;
7. open the canonical Task route and perform a representative live check.

Do not report “live” merely because a branch was pushed or local tests passed.

## 6. Problems encountered and permanent solutions

| Problem | Why it failed | Permanent solution | Regression evidence |
| --- | --- | --- | --- |
| Full-page scanned backgrounds were blurry | The supplied PDF images did not have enough resolution; enlargement amplified noise | Rebuild pages in semantic HTML/CSS and keep scans as reference only | Static test rejects `page-1.webp`–`page-8.webp`, `paper.json` and OCR overlay markup in live output |
| OCR overlays looked like a digitized paper but were fragile | Text and fields drifted over the image at zoom/mobile sizes and were not a clean reading surface | Use real headings, paragraphs, tables, labels and inputs in document order | Browser test checks semantic pages and real controls |
| “Original paper” was interpreted too literally | Reproducing the scan also reproduced its defects | Preserve the original structure and relationships while rendering clean modern text | Visual review plus required English phrases and page IDs |
| Illustrations remained low quality | Filtering or scaling could not restore missing source detail | Use approved high-resolution reconstructions with preserved exam meaning and provenance | Natural width and file-size checks for all three 2016 illustrations |
| Digital paper was hidden behind an optional pop-up | Students had to leave the normal workflow to reach the intended experience | Make the digital paper the default Task surface; keep custom layout optional | Integration test expects `.dse-digital-paper-frame` without an open dialog |
| Default paper initially lost study tools | The first paper renderer was treated as an isolated display | Mount the shared answer map, guide, POS, mistake note, analysis and audio behavior into the paper | Integration test fills, checks, reveals and opens analysis in the paper |
| All eight pages appeared in one long view | Renderer returned the whole paper regardless of active Task | Pass the selected Task to the renderer and filter by explicit Task/page mapping | Browser test asserts Task page IDs and exact question ranges |
| Page selector exposed unrelated Tasks | Page navigation was used as a second Task navigation system | Restrict page options to the active Task; hide the selector for one-page Tasks | Browser and full-paper tests assert Task-specific options |
| Chinese appeared in a detached window | Students lost the English/Chinese relationship and had to cross-reference another panel | Place each translation directly below its English source in Paper 3 style | Browser test verifies the first Chinese element is the immediate sibling and has `lang="zh-Hant"` |
| Inline Chinese broke some flex/grid layouts | Translation spans inherited row layout intended for English labels and inputs | Allow wrapping, give translations full flex basis/grid width and target non-translation spans precisely | Visual screenshots and browser no-error checks |
| Answer buttons were collected in a separate panel | The student had to search between the paper and an answer dock | Insert each `看答案` beside its input or response group | Browser test rejects the old dock and measures Q1 control proximity |
| Radio/checkbox answer controls attached to one option | Generic anchoring assumed text-label structure | For the digital paper, anchor study tools to `.digital-paper-choices` | Exact reveal-count checks for every Task and choice coverage |
| Moving Chinese inline accidentally removed its toggle | The old control belonged to the removed detached translation panel | Add a dedicated sticky-toolbar toggle for inline translations and share its stored preference with the dialog | Browser test checks both labels, `aria-pressed`, zero visible translations when hidden and persistence after reload |
| Translation visibility state could disagree with its button | A shared study preference defaulted differently from the digital paper | Give the paper one explicit visible-by-default state and update dataset, label, ARIA and storage together | Reload test verifies hidden state remains hidden |
| Switching layout risked losing work | Separate renderers could have separate answer stores | Both layouts read/write `state.dseAnswers`; persist by signed-in owner | Integration test edits in one layout, switches and reloads in the other |
| Mobile could inherit paper width as page overflow | A faithful table sometimes needs more width than a phone | Put the paper's minimum width inside its own scroll container; keep the frame within the viewport | Mobile integration asserts the frame width does not exceed the viewport |
| Browser tests expected the old eight-page selector | Correct product behavior invalidated stale assumptions | Update tests to navigate Task tabs and validate Task-specific pages | Focused browser test covers all four Tasks |
| A 2021 test fixture assumed `initialise()` was the final source line | Later application code followed initialization, so the fixture replacement stopped matching | Replace the actual initialization call rather than relying on end-of-file position | 2021 guide browser regression passes |
| A release initially served the previous cache version | Pages deployment and browser caching lagged behind the push | Bump linked cache tags, wait for Pages success and inspect live HTML/assets | Production verification checks the new cache tag and public bundle hooks |
| `main` advanced during a later refinement | A direct push was correctly rejected as non-fast-forward | Fetch, rebase onto `origin/main`, rerun focused tests, then fast-forward | Git history preserves the concurrent Natural English commit and the toggle fix |

## 7. Non-negotiable quality gates

A paper is not ready unless all of these are true.

### Content completeness

- Every intended source page is represented.
- Every numbered question exists exactly as its response type requires.
- The Task/page/question map is explicit and tested.
- Instructions, examples, units, choice labels and marks match the source.
- Answers and explanations come from evidence, not inference.

### Visual fidelity

- No production full-page scan background.
- No OCR-positioned text overlay.
- Paper hierarchy and reading order match the source.
- Images are legible and preserve answer-relevant details.
- English is crisp at normal zoom.
- Chinese is visually subordinate, directly attached and optional.

### Interaction

- Digital paper opens by default.
- Only the active Task's pages render.
- Every answer field accepts the correct response type.
- Every guide question has a nearby `看答案` control.
- Checking does not erase typed answers.
- Layout switching and Task navigation preserve answers.
- Chinese visibility survives reload.
- Zoom, internal page navigation and audio controls work.

### Accessibility

- Inputs have meaningful labels or surrounding semantic context.
- Choice groups are keyboard usable.
- Buttons describe their next action.
- Toggle buttons maintain correct `aria-pressed` values.
- Chinese elements declare `lang="zh-Hant"`.
- Focus is not lost when opening or closing analysis/dialog surfaces.
- The interface does not depend on hover alone.

### Responsive behavior

- No outer-page horizontal overflow.
- Paper scroll remains contained.
- Sticky controls wrap without covering the paper.
- Text, inputs and answer buttons remain usable at phone width.
- Multi-page Tasks can reach every page.

### Safety and data integrity

- Tests use synthetic accounts and mocked external services.
- Student answers remain scoped to the signed-in owner.
- No source PDF, credentials, local server or student data is accidentally published.
- Existing years and the optional custom layout continue to pass their regressions.

### Release

- Static and browser checks pass after the final rebase.
- Cache tags are updated consistently.
- `main` is updated by fast-forward without overwriting concurrent work.
- The exact deployment run succeeds.
- Public HTML and assets expose the expected release version.

## 8. Anti-patterns

Reject these approaches during review:

- shipping a full-page screenshot with invisible inputs;
- describing an upscaled image as restored high-resolution detail;
- using OCR output without page-by-page visual reconciliation;
- rendering all Tasks because it is simpler than routing them;
- duplicating answer state for the paper and custom layout;
- placing translations or answers in remote panels;
- hiding a learning aid without a visible restoration control;
- placing one answer-reveal button per radio option;
- removing existing audio, POS, notes or analysis to make the paper fit;
- hard-coding a fixed page height that clips translated content;
- using global page overflow to handle a wide table;
- weakening tests after a regression instead of encoding the intended behavior;
- deploying without a cache bump or public verification;
- force-updating `main` after a non-fast-forward rejection.

## 9. New-year implementation template

For a new year `YYYY`, prepare:

```text
dse-listening-YYYY-paper-layout.mjs
dse-listening-YYYY-data.js
dse-listening-YYYY-transcript.js
assets/dse-listening/YYYY/guide.json
assets/dse-listening/reconstructed-vN/YYYY/
tools/test-dse-listening-YYYY-paper.mjs
tools/test-dse-listening-YYYY-digital-paper-browser.mjs
```

Add the year to the shared `DSE_CONTENT` registration, route it through a year-specific Task/page map and reuse the shared study/state mechanisms. A new paper renderer should expose the same conceptual contract as 2016:

```js
renderYYYYDigitalPaper(answers, selectedTask)
```

The exact markup may differ because the source paper differs. Do not force every year into the 2016 table shapes. Reuse behavior and test contracts while reconstructing each source honestly.

Before release, write down:

- source checksum and page count;
- Task/page/question mapping;
- unusual answer types;
- image decisions and provenance;
- translation source and editorial rules;
- answer/guide evidence;
- known limitations;
- exact static and browser commands;
- the production cache version and deployment SHA.

## 10. Maintenance rule

This is a living Golden Manual. Update it whenever a future digitization reveals a new failure mode, changes a shared contract or introduces a better verified technique. Record the symptom, root cause, final solution and regression guard. Do not preserve abandoned experiments as recommended workflow, but keep their lesson in the problem ledger when it prevents recurrence.

The governing principle is simple: students should experience the recognizable DSE paper, rebuilt clearly for the screen, with every EdmundEducation learning tool exactly where it helps and with no loss of work.
