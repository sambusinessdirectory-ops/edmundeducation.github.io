import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const root = resolve(
  process.argv[2] || dirname(dirname(fileURLToPath(import.meta.url)))
);
const dataPath = resolve(root, "writing-practice-business-standard-response-book1-data.js");
const htmlPath = resolve(root, "writing-practice.html");
const homeworkCatalogPath = resolve(root, "homework-resource-catalog.mjs");
const audioManifestPath = resolve(root, "writing-audio-manifest.js");

const idFor = number => `business-english-standard-response-book-1-q${number}`;
const expectedIds = Array.from({ length: 10 }, (_, index) => idFor(index + 1));
const expectedModes = ["blank", "start", "end", "both"];
const expectedDifficulties = ["standard", "medium", "hard", "hell"];
const expectedSourceExercises = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];
const expectedBlankCounts = new Map([
  [idFor(1), [35, 45, 75, 86]],
  [idFor(2), [33, 45, 75, 64]],
  [idFor(3), [35, 45, 75, 81]],
  [idFor(4), [35, 45, 75, 73]],
  [idFor(5), [35, 45, 74, 62]],
  [idFor(6), [33, 45, 75, 88]],
  [idFor(7), [35, 45, 75, 96]],
  [idFor(8), [35, 45, 74, 84]],
  [idFor(9), [35, 45, 75, 80]],
  [idFor(10), [35, 45, 75, 74]]
]);
const chinesePattern = /[\u3400-\u9fff]/u;
const wordPattern = /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu;

function loadWindowScript(path) {
  const window = {};
  vm.runInNewContext(readFileSync(path, "utf8"), { window }, { filename: path, timeout: 30_000 });
  return window;
}

function evaluateDeclaration(source, name, nextDeclaration) {
  const start = source.indexOf(`const ${name} =`);
  const end = source.indexOf(nextDeclaration, start);
  assert.ok(start >= 0 && end > start, `could not isolate ${name} from writing-practice.html`);
  const context = {};
  vm.runInNewContext(
    `${source.slice(start, end)}\nglobalThis.result = ${name};`,
    context,
    { filename: `writing-practice.html#${name}`, timeout: 30_000 }
  );
  return context.result;
}

function sentenceText(sentence) {
  return (sentence?.parts || [])
    .map(part => typeof part === "string" ? part : part?.answer || "")
    .join("");
}

function paragraphText(paragraph) {
  return (paragraph?.sentences || []).map(sentenceText).join(" ");
}

function normalized(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014\u2010]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Mirrors splitSentenceByDifficultyAnswers() and the sentence-to-paragraph
// fallback used by buildPracticeDifficultyParagraphs() in writing-practice.html.
function splitByAnswers(text, answers, answerState) {
  const parts = [];
  let textCursor = 0;
  while (answerState.index < answers.length) {
    const answer = String(answers[answerState.index] || "");
    assert.ok(answer, `empty answer at index ${answerState.index}`);
    const matchIndex = text.indexOf(answer, textCursor);
    if (matchIndex < 0) break;
    if (matchIndex > textCursor) parts.push(text.slice(textCursor, matchIndex));
    parts.push({ answer });
    textCursor = matchIndex + answer.length;
    answerState.index += 1;
  }
  if (textCursor < text.length) parts.push(text.slice(textCursor));
  return parts.length ? parts : [text];
}

function reconstruct(exercise, answers, paragraphScoped = false) {
  const answerState = { index: 0 };
  const paragraphs = exercise.paragraphs.map(paragraph => {
    if (paragraphScoped) {
      return { sentences: [{ parts: splitByAnswers(paragraphText(paragraph), answers, answerState) }] };
    }
    return {
      sentences: paragraph.sentences.map(sentence => ({
        parts: splitByAnswers(sentenceText(sentence), answers, answerState)
      }))
    };
  });
  return { answerState, paragraphs };
}

const html = readFileSync(htmlPath, "utf8");
const writingSections = evaluateDeclaration(html, "writingSections", "const writingProgressionRows");
const writingPathways = evaluateDeclaration(html, "writingPathways", "const dseWritingYears");
const sectionKeys = Array.from(writingSections, section => section.key);

assert.equal(
  sectionKeys.indexOf("business-english"),
  sectionKeys.indexOf("government-writing") + 1,
  "Business English must appear immediately after Government Writing"
);
assert.equal(sectionKeys.at(-1), "business-english", "Business English must be the final subject tile before utility tiles");

const renderDashboardSource = html.slice(
  html.indexOf("function renderDashboard()"),
  html.indexOf("function renderStudents()", html.indexOf("function renderDashboard()"))
);
assert.ok(
  renderDashboardSource.indexOf("writingSections.map(tileHtml)")
    < renderDashboardSource.indexOf('key: "bookmarks"'),
  "the Bookmark tile must render after every subject tile, including Business English"
);

const businessPathway = writingPathways["business-english"];
assert.ok(businessPathway, "Business English pathway missing");
assert.equal(businessPathway.title, "\u5546\u52d9\u82f1\u8a9e");
assert.equal(businessPathway.tasks.length, 1);
assert.equal(businessPathway.tasks[0].key, "task-standard-business-response");
assert.equal(businessPathway.tasks[0].label, "Standard Business Response");
assert.equal(businessPathway.tasks[0].essayTypes.length, 1);
assert.equal(businessPathway.tasks[0].essayTypes[0].key, "book-1");
assert.equal(businessPathway.tasks[0].essayTypes[0].label, "Book 1");
assert.deepEqual(Array.from(businessPathway.tasks[0].essayTypes[0].deckIds), expectedIds);

assert.match(html, /writing-practice-business-standard-response-book1-data\.js\?v=/);
assert.match(html, /window\.EDMUND_BUSINESS_WRITING_STANDARD_RESPONSE_BOOK1_EXERCISES/);

const dataWindow = loadWindowScript(dataPath);
const exercises = dataWindow.EDMUND_BUSINESS_WRITING_STANDARD_RESPONSE_BOOK1_EXERCISES;
assert.ok(exercises && typeof exercises === "object", "Business English Book 1 export missing");
assert.deepEqual(Object.keys(exercises), expectedIds, "Book 1 must export the ten stable Q1-Q10 routes in order");

let renderedConfigurationCount = 0;
for (const [index, id] of expectedIds.entries()) {
  const questionNumber = index + 1;
  const exercise = exercises[id];
  assert.equal(exercise.id, id, `${id}: route ID must remain stable`);
  assert.match(exercise.title, new RegExp(`^Q${questionNumber} - `), `${id}: question title missing`);
  assert.equal(exercise.exam, "Business English");
  assert.equal(exercise.taskType, "Standard Business Response \u00b7 Book 1");
  assert.equal(exercise.questionPrompt?.length, 2, `${id}: English and Chinese task prompts are required`);
  assert.ok(String(exercise.questionPrompt[0]).trim(), `${id}: English task prompt missing`);
  assert.match(String(exercise.questionPrompt[1]), chinesePattern, `${id}: Chinese task prompt missing`);

  assert.deepEqual(Array.from(exercise.practiceModes), expectedModes, `${id}: four cue modes`);
  assert.deepEqual(
    Object.keys(exercise.practiceModeDetails || {}),
    expectedModes,
    `${id}: cue-mode descriptions`
  );
  assert.deepEqual(
    Array.from(exercise.practiceDifficultySets || [], set => set.key),
    expectedDifficulties,
    `${id}: four difficulty tiers`
  );
  assert.equal(
    exercise.practiceModes.length * exercise.practiceDifficultySets.length,
    16,
    `${id}: four cue modes x four difficulties must yield 16 modes`
  );
  renderedConfigurationCount += exercise.practiceModes.length * exercise.practiceDifficultySets.length;

  assert.equal(exercise.paragraphs?.length, 8, `${id}: eight English response sections required`);
  assert.equal(exercise.translationSections?.length, 8, `${id}: eight bilingual response sections required`);
  assert.equal(exercise.translation?.length, 8, `${id}: eight Chinese response sections required`);
  assert.equal(exercise.showWordBank, false, `${id}: word bank must remain disabled`);

  const canonicalParagraphs = exercise.paragraphs.map(paragraphText);
  exercise.translationSections.forEach((section, sectionIndex) => {
    const items = Array.from(section.items || []);
    assert.ok(items.length, `${id}: translation section ${sectionIndex + 1} is empty`);
    const translatedEnglish = normalized(items.map(item => item.english || "").join(" "));
    const translatedChinese = items.map(item => String(item.chinese || "").trim()).join(" ");
    assert.equal(
      translatedEnglish,
      normalized(canonicalParagraphs[sectionIndex]),
      `${id}: bilingual English must reconstruct section ${sectionIndex + 1}`
    );
    assert.match(translatedChinese, chinesePattern, `${id}: section ${sectionIndex + 1} Chinese translation missing`);
    assert.equal(
      normalized(exercise.translation[sectionIndex]),
      normalized(translatedChinese),
      `${id}: section ${sectionIndex + 1} Chinese views must agree`
    );
  });

  const expectedCounts = expectedBlankCounts.get(id);
  exercise.practiceDifficultySets.forEach((difficulty, difficultyIndex) => {
    assert.deepEqual(
      Array.from(difficulty.sourceExerciseNumbers || []),
      expectedSourceExercises[difficultyIndex],
      `${id}/${difficulty.key}: source exercise group`
    );
    assert.equal(
      difficulty.answers?.length,
      expectedCounts[difficultyIndex],
      `${id}/${difficulty.key}: exact blank count`
    );
    assert.ok(
      difficulty.answers.every(answer => typeof answer === "string" && answer.length > 0 && answer.trim() === answer),
      `${id}/${difficulty.key}: every answer must be a non-empty trimmed string`
    );

    let reconstructed = reconstruct(exercise, difficulty.answers);
    if (reconstructed.answerState.index !== difficulty.answers.length) {
      reconstructed = reconstruct(exercise, difficulty.answers, true);
    }
    assert.equal(
      reconstructed.answerState.index,
      difficulty.answers.length,
      `${id}/${difficulty.key}: every answer must align using the production fallback`
    );
    assert.deepEqual(
      reconstructed.paragraphs.map(paragraphText),
      canonicalParagraphs,
      `${id}/${difficulty.key}: blanks must reconstruct the canonical response`
    );
  });
}

assert.equal(renderedConfigurationCount, 160, "10 questions x 16 fill-in-the-blank configurations");
assert.equal(
  exercises[idFor(8)].practiceDifficultySets.find(set => set.key === "hard")?.answers.length,
  74,
  "Q8 Hard must retain the normalized 74-answer source"
);

const q3Text = exercises[idFor(3)].paragraphs.map(paragraphText).join(" ");
assert.match(q3Text, /Take a delayed product launch as an example\./);
assert.doesNotMatch(q3Text, /exaple/i, "Q3 must repair the source typo before display and narration");

assert.ok(existsSync(homeworkCatalogPath), "generated Homework catalog is missing");
const catalogUrl = `${pathToFileURL(homeworkCatalogPath).href}?business-writing-test=${Date.now()}`;
const { HOMEWORK_RESOURCE_CATALOG } = await import(catalogUrl);
const businessHomework = HOMEWORK_RESOURCE_CATALOG.filter(resource =>
  String(resource.id || "").startsWith("fill:business-english-standard-response-book-1-q")
);
assert.equal(businessHomework.length, 10, "Homework must itemize all ten Business English Book 1 questions");
for (const questionNumber of [1, 10]) {
  const id = idFor(questionNumber);
  const resource = businessHomework.find(item => item.id === `fill:${id}`);
  assert.ok(resource, `Homework link missing for ${id}`);
  assert.equal(resource.url, `writing-practice.html?exercise=${id}`);
  assert.equal(resource.sectionKey, "business-english");
}

assert.ok(existsSync(audioManifestPath), "Writing Practice audio manifest is missing");
const audioWindow = loadWindowScript(audioManifestPath);
const audio = audioWindow.EDMUND_WRITING_AUDIO || {};
const businessAudioIds = expectedIds.filter(id => Boolean(audio[id]));
assert.deepEqual(businessAudioIds, expectedIds, "audio manifest must cover all ten Book 1 responses in route order");
for (const id of expectedIds) {
  const entry = audio[id];
  const expectedWords = Array.from(
    exercises[id].paragraphs
      .flatMap(paragraph => paragraph.sentences)
      .flatMap(sentence => sentenceText(sentence).match(wordPattern) || [])
  );
  assert.deepEqual(Array.from(entry.words || [], row => row[0]), expectedWords, `${id}: word timings must match the essay`);
  const audioPath = resolve(root, entry.path || "");
  assert.ok(existsSync(audioPath), `${id}: audio MP3 missing`);
  assert.ok(statSync(audioPath).size > 10_000, `${id}: audio MP3 is implausibly small`);
}

console.log("Business English Book 1 validation passed: 10 questions, 160 fill modes, bilingual sections and exact blank alignment.");
