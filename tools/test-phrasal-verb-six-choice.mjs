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
  const context = {
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

for (const lessonNumber of Array.from({ length: 10 }, (_, index) => index + 1)) {
  test(`module ${lessonNumber} offers six stable unique choices and only reveals after the correct click`, () => {
    const lesson = lessons[lessonNumber - 1];
    const context = choiceContext(lesson);
    assert.equal(context.usesPhrasalChoices(lesson), true);
    for (const question of lesson.questions) {
      const choices = Array.from(context.phrasalChoices(lesson, question));
      assert.equal(choices.length, 6, question.id);
      assert.equal(new Set(choices).size, 6, question.id);
      assert.equal(choices.filter((form) => form === question.targetForm).length, 1, question.id);
      assert.deepEqual(choices, Array.from(context.phrasalChoices(lesson, question)), question.id);
      const correctMeanings = new Set(lesson.questions.filter((item) => item.targetForm === question.targetForm).map((item) => item.targetMeaningZh));
      for (const distractor of choices.filter((form) => form !== question.targetForm)) {
        assert.equal(lesson.questions.some((item) => item.targetForm === distractor && correctMeanings.has(item.targetMeaningZh)), false, `${question.id}: ${distractor} duplicates the correct meaning`);
      }
    }
    const question = lesson.questions[0];
    const wrong = Array.from(context.phrasalChoices(lesson, question)).find((form) => form !== question.targetForm);
    context.selectPhrasalChoice(question.id, wrong);
    assert.equal(context.state.exercise.correctIds.length, 0);
    assert.equal(context.state.exercise.questionState[question.id], undefined);
    assert.equal(context.state.exercise.drafts[question.id], wrong);
    context.selectPhrasalChoice(question.id, question.targetForm);
    assert.deepEqual(Array.from(context.state.exercise.correctIds), [question.id]);
    assert.equal(context.state.exercise.questionState[question.id].lastAnswer, question.answer);
    assert.equal(context.state.exercise.questionState[question.id].reveal, true);
    assert.equal(context.state.exercise.drafts[question.id], undefined);
  });
}

test("modules outside the pilot retain sentence-input mode", () => {
  const context = choiceContext(lessons[10]);
  assert.equal(context.usesPhrasalChoices(lessons[10]), false);
});
