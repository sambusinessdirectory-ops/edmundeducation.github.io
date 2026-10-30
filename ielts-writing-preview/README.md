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
- Task 1 keeps the original source `prompt` and provides a separate `quizPrompt` for the student view and narration. The quiz wording removes graph-type labels that would give away the first answer and repairs obvious spacing or spelling defects in the affected prompt. The chart title/question sits directly above its image in the same table cell.
- Task 1 asks for three independent choices: one of seven graph types, Dynamic or Static, and any combination of five tense options. They remain ungraded student judgments and are saved immediately per student on this device under the existing preview storage identity plus `:task1`.
- Task 1 display order is a stable seeded shuffle of the 60 original IDs so the source file's type blocks do not disclose the chart answer. Saved choices and audio remain keyed by the original stable ID.
- Each of the 60 Task 1 and 242 Task 2 questions has a dedicated MP3 narration in `audio/`, indexed by `question-audio.json`. Narration rotates British male (`bm_fable`), British female (`bf_isabella`), and American female (`af_heart`) with the same local Kokoro model and recipes as Professional English. The play control uses a CSS icon, not an emoji glyph.

## Verification

Run `node tools/test-ielts-writing-preview.mjs` from the repository root. Browser checks should confirm 60 Task 1 rows, 242 Task 2 rows, image loading, chart-type labels hidden in the Task 1 questions, three Task 1 controls including multiple tenses, saved choices after reload, translation hidden on initial load, and narration playback in both tasks.

To regenerate audio, run `tools/generate-ielts-preview-audio.py` in the workspace TTS virtual environment with the verified local Kokoro model and voice files. The script fingerprints each prompt and recipe, so unchanged clips are reused. The `--start`, `--end`, and `--output` options allow partitioned generation; combine completed manifests before publication and confirm all 302 paths exist.
