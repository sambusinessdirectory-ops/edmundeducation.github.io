# IELTS Writing Question Preview — content record

## Inputs

- Task 2: `Althea - IETLS Writing Task 2 - Questions for Class Demonstration - V1.pdf` (39 pages, provided by the owner). The filename's `IETLS` typo is corrected to **IELTS** in the published title.
- Task 1: the 60 existing diagram records and images in `writing-practice-ielts-task1-data.js`. This page previews those records; it does not duplicate the source image files.

## Editorial handling

- The PDF contains **242** essay prompts under **20** topic headings. The preview retains each prompt in source order with its source page and a stable `T2-###` identifier. A car-free-day prompt appears under both Environment and Transport in the source and is kept in both positions.
- Prompts spanning pages were rejoined before publication. Surrounding study notes, estimated preparation times, claimed past-paper years, and frequency claims were excluded because they are not part of the essay questions.
- Obvious source spelling and grammar errors were corrected without changing the intended task. Examples include `IETLS` → `IELTS`, `debit/debits` → `debt/debts`, `payed` → `paid`, `pervious` → `previous`, `affects` → `effects`, and `to what extend` → `to what extent`. Several broken or incomplete question sentences were repaired for readability.
- Traditional Chinese translations were written for every full essay prompt. They are hidden on initial load and appear only when the student presses the translation toggle.
- The five topic-type options are student selections; the page does not prefill a correct answer. Choices are saved locally on the student's device. This page does not grade them.

## Verification

Run `node tools/test-ielts-writing-preview.mjs` from the repository root. Browser checks should confirm 60 Task 1 rows, 242 Task 2 rows, diagram image loading, translation hidden on initial load, toggle behaviour, and persistence of the five-option dropdown.
