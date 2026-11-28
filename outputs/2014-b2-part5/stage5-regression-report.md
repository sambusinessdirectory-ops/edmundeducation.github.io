# 2014 B2 Super Curation — Stage 5 regression report

## Reference-aligned teaching flow

Each task begins with four writing-preparation actions: parse the task, build the content skeleton, draft independently, and check facts/tone. The learner then opens the model inside the same central practice page. Every title, salutation, sentence and sign-off line is an atomic teaching unit. Each cited source is visited in a bounded preview and immediately followed by an explicit return to the same model unit.

## Runtime totals

- Stage 5 steps: 237
- Writing-preparation actions: 12
- Atomic model units: 49 (Task A 13, Task B 15, Task C 21)
- Exact source visits: 88
- Paired source returns: 88
- Unique verified Stage 3/4 evidence IDs: 79
- Missing evidence IDs, missing routes, unpaired visits and duplicate IDs: 0 / 0 / 0 / 0

## Visual and interaction contract

- Fixed five-stage rail, fixed left teaching dock and central draft/model page.
- Right evidence inventory on desktop; task-specific counts and red midline strikes as evidence becomes used.
- Task A/B/C keywords use cyan/yellow/pink. Reusable sentence structures use pale purple.
- Exact source text uses navy. Podcast sources open on the exact transcript sentence with the supplied Traditional Chinese line visible.
- The source preview has a navy header, blue border, independent scrolling, drag movement, four-corner resize and viewport bounds.
- Stage 5 deliberately has no spotlight mask, matching the supplied “No Spotlight” reference.
- Rewinding removes later model reveals and later red/navy use marks; other tasks retain their independent position.

## Model authority

All three responses are **user-provided draft target models**. They are not official HKEAA answers or approved benchmarks. Approval remains required before benchmark use.

## Writing bridge

| Task | Native answer fields |
| --- | --- |
| A / Task 8 | `2014-b2-12-information`, `2014-b2-13-information-cont` |
| B / Task 9 | `2014-b2-14-speech`, `2014-b2-15-speech-cont` |
| C / Task 10 | `2014-b2-16-letter`, `2014-b2-17-letter-cont` |

Transfer requires an explicit learner action and copies only that task’s draft. Planning notes, model text and evidence metadata are excluded. The automated journey recorded no network write requests.

## Automated results

- `paper3-2014-stage5.test.cjs`: PASS — Task A/B/C source previews and returns, rewind removal, persistence, answer transfer, storage failure, and 1440/1100/768/390 responsive states; zero page errors and failed assets.
- `paper3-2014-stage4.test.cjs`: PASS — all earlier-stage counts and the Stage 4 → Stage 5 handoff remain correct.
- `tools/paper3/build-2014-b2-stage5-audit.mjs`: PASS — 237 steps, 88 visits, 88 paired returns, 79 unique evidence IDs, zero missing or duplicate records.
- `tools/paper3/test-verify-paper3-compliance.mjs`: PASS.

## Scope

No deployment or publication was performed. The local page remains the review target until the draft models receive approval and deployment is explicitly authorized.
