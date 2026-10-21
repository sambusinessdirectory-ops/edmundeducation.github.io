import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../phrasal-verb-system.js", import.meta.url), "utf8");
const dataSource = fs.readFileSync(new URL("../phrasal-verb-system-data.js", import.meta.url), "utf8");
const dataContext = { window: {} };
  vm.runInNewContext(dataSource, dataContext);
const lessons = dataContext.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA.lessons;

function sourceBetween(start, end) {
  return source.slice(source.indexOf(`function ${start}(`), source.indexOf(`function ${end}(`));
}

function choiceContext(lesson) {
  const sounds = [];
  const context = {
    window: { EdmundAnswerSound: { play: (correct) => sounds.push(correct) } },
    sounds,
    CONTENT: { lessons },
    state: { exercise: { id: "pilot-attempt-1", lessonId: lesson.id, correctIds: [], drafts: {}, questionState: {}, rounds: [], collapsedCorrectIds: [], correctionIds: [], round: 1, controlRevision: 0 }, lessonPage: 8 },
    getLesson: () => lesson,
    EXERCISE_PAGE: 8,
    attemptControlState: () => ({}),
    bumpAttemptControlRevisionIfChanged: () => false,
    isBookmarked: () => false,
    renderExercisePage: () => {},
    scheduleExercisePersistence: () => {},
    pauseExerciseClock: () => {}
  };
  vm.createContext(context);
  vm.runInContext(sourceBetween("usesPhrasalChoices", "questionHtml") + sourceBetween("selectPhrasalChoice", "submitExercise").replace(/async\s*$/, ""), context);
  return context;
}

test("every phrasal-verb question offers six distinct choices with one correct answer", () => {
  const meaningsByForm = new Map();
  for (const question of lessons.flatMap((lesson) => lesson.questions)) {
    if (!meaningsByForm.has(question.targetForm)) meaningsByForm.set(question.targetForm, new Set());
    meaningsByForm.get(question.targetForm).add(question.targetMeaningZh);
  }
  let checked = 0;
  for (const lesson of lessons) {
    const context = choiceContext(lesson);
    assert.equal(context.usesPhrasalChoices(lesson), true);
    for (const question of lesson.questions) {
      const choices = Array.from(context.phrasalChoices(lesson, question));
      assert.equal(choices.length, 6, question.id);
      assert.equal(new Set(choices).size, 6, question.id);
      assert.equal(choices.filter((form) => form === question.targetForm).length, 1, question.id);
      const correctMeanings = meaningsByForm.get(question.targetForm);
      for (const distractor of choices.filter((form) => form !== question.targetForm)) {
        assert.equal([...(meaningsByForm.get(distractor) || [])].some((meaning) => correctMeanings.has(meaning)), false, `${question.id}: ${distractor} duplicates the correct meaning`);
      }
      checked += 1;
    }
    assert.deepEqual(
      Array.from(context.phrasalChoices(lesson, lesson.questions[0])),
      Array.from(context.phrasalChoices(lesson, lesson.questions[0])),
      `${lesson.id}: choices moved after rendering`
    );
  }
  assert.equal(checked, lessons.reduce((total, lesson) => total + lesson.questions.length, 0));
});

for (const lessonNumber of [1, 10, 11, 29, 100, 200, 329]) {
  test(`module ${lessonNumber} keeps wrong guesses local and reveals the full sentence after success`, () => {
    const lesson = lessons[lessonNumber - 1];
    const context = choiceContext(lesson);
    const question = lesson.questions[0];
    const wrong = Array.from(context.phrasalChoices(lesson, question)).find((form) => form !== question.targetForm);
    context.selectPhrasalChoice(question.id, wrong);
    assert.equal(context.state.exercise.correctIds.length, 0);
    assert.equal(context.state.exercise.questionState[question.id], undefined);
    assert.equal(context.state.exercise.drafts[question.id], wrong);
    assert.deepEqual(context.sounds, [false]);
    context.selectPhrasalChoice(question.id, question.targetForm);
    assert.deepEqual(Array.from(context.state.exercise.correctIds), [question.id]);
    assert.equal(context.state.exercise.questionState[question.id].lastAnswer, question.answer);
    assert.equal(context.state.exercise.questionState[question.id].reveal, true);
    assert.equal(context.state.exercise.drafts[question.id], undefined);
    assert.deepEqual(context.sounds, [false, true]);
  });
}

test("a saved sentence draft does not appear as a wrong choice after migration", () => {
  const lesson = lessons[10];
  const question = lesson.questions[0];
  const context = choiceContext(lesson);
  context.state.exercise.drafts[question.id] = question.answer;
  context.escapeHtml = (value) => String(value ?? "");
  context.isBookmarked = () => false;
  context.suggestedAnswerHtml = () => "";
  vm.runInContext(sourceBetween("phrasalChoiceQuestionHtml", "questionHtml"), context);
  const html = context.phrasalChoiceQuestionHtml(lesson, question);
  assert.doesNotMatch(html, /再試一次/);
  assert.equal((html.match(/class="phrasal-choice /g) || []).length, 6);
});
