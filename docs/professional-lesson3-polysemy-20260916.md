# Professional English: Lesson 3 and Lesson 1 polysemy

Adds 113 Lesson 3 flashcards (five English examples and five Traditional Chinese translations each), eight dialogues (four scenarios × beginner/professional, 80 turns), and Lesson 1 polysemy (16 words, 92 questions).

## Content

Sources: the user's Lesson 3 flashcard PDF; eight Lesson 3 fill-in-the-blanks PDFs; `Lesson_1_Multiple_Meanings.pdf`. Full dialogue text was cross-checked against the matching `Lesson 3 - Complaint Handling and Calm Response.pdf` beside those files. Dialogue translations were added in Traditional Chinese. The source typo `Suit 3001` is normalized to `Suite 3001`; the original floor and room numbers are retained. Existing Lesson 1/2 dialogue objects and audio remain unchanged.

Polysemy includes all 76 example sentences and 16 final passage excerpts. Chinese translations hide the meaning being tested. Overlapping option labels have short Chinese clarifications; example order and final passage order follow the PDF. Incorrect questions repeat in the next round until answered correctly. Completion is saved on the current device, separately per signed-in account. It is not synced between devices.

## Audio

The verified Kokoro v1.0 model/voice file hashes match the original generation recipes. Flashcards and officers: `af_heart`, en-us, speed 0.96. Tenants: `bm_fable`, en-gb, speed 0.98. Dialogue clips are content-addressed; flashcards use stable UUID paths. Existing dialogue audio manifest entries are retained. Floor abbreviations are spoken as “floor N”; slash-separated alternatives as “or”.

Generate with `tools/generate-professional-lesson3-audio.py --model PATH --voices PATH` in the existing kokoro-onnx environment. This requires ffmpeg/ffprobe, soundfile and onnxruntime. No cloud speech credentials are required.

## Release

`tools/prepare-professional-lesson3-import.py` emits an idempotent SQL import into the existing Professional English course, initially inactive. It refuses to replace different existing content. Publish the static files through the existing GitHub Pages workflow, verify all new audio URLs, then activate this specific deck. Existing all-lessons enrollments grant access automatically; no account or progress records are modified.

Validation: `node tools/test-professional-lesson3-polysemy.mjs`, `node tools/test-learning-updates-20260911.mjs`, `node tools/test-professional-feedback.mjs`, and `node tools/test-special-flash-card.mjs`. The new test is included in the Pages release gate.
