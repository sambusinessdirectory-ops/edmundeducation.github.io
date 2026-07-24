#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const lessonDirectory = new URL("sentence-structure-lessons/", import.meta.url);
const outputUrl = new URL("sentence-structure-lessons-5-114.js", root);
const FIRST_LESSON = 5;
const LAST_LESSON = 114;
const QUESTIONS_PER_LESSON = 50;
const REQUIRED_QUESTION_FIELDS = [
  "id",
  "prompt",
  "promptZh",
  "starter",
  "answer",
  "answerZh",
  "highlight"
];
const SOURCE_PAGE_FIELDS = [
  "numberPage",
  "questionPage",
  "starterPage",
  "answerNumberPage",
  "answerPage"
];

function fail(message) {
  throw new Error(message);
}

function requireCondition(condition, message) {
  if (!condition) fail(message);
}

function normalText(value) {
  return String(value ?? "").trim();
}

function occurrenceCount(text, fragment) {
  const source = String(text).toLocaleLowerCase();
  const target = String(fragment).toLocaleLowerCase();
  return target ? source.split(target).length - 1 : 0;
}

function validateBilingualItems(lesson, field) {
  const items = lesson[field];
  requireCondition(Array.isArray(items) && items.length > 0, `${lesson.id}: ${field} is missing`);
  items.forEach((item, index) => {
    requireCondition(normalText(item?.en), `${lesson.id}: ${field}[${index}].en is missing`);
    requireCondition(normalText(item?.zh), `${lesson.id}: ${field}[${index}].zh is missing`);
  });
}

function validateLesson(lesson, number) {
  const lessonId = `ss${number}`;
  requireCondition(lesson && typeof lesson === "object" && !Array.isArray(lesson), `${lessonId}: lesson object is missing`);
  requireCondition(lesson.id === lessonId, `${lessonId}: id mismatch`);
  requireCondition(lesson.order === number, `${lessonId}: order mismatch`);
  requireCondition(normalText(lesson.slug), `${lessonId}: slug is missing`);
  requireCondition(normalText(lesson.title), `${lessonId}: title is missing`);
  requireCondition(normalText(lesson.titleZh), `${lessonId}: titleZh is missing`);
  requireCondition(normalText(lesson.titleEn), `${lessonId}: titleEn is missing`);
  requireCondition(normalText(lesson.formula), `${lessonId}: formula is missing`);
  requireCondition(Array.isArray(lesson.formulas) && lesson.formulas.length > 0, `${lessonId}: formulas are missing`);
  requireCondition(Array.isArray(lesson.examples) && lesson.examples.length > 0, `${lessonId}: examples are missing`);
  requireCondition(normalText(lesson.example), `${lessonId}: example is missing`);
  requireCondition(normalText(lesson.exampleZh), `${lessonId}: exampleZh is missing`);
  requireCondition(Array.isArray(lesson.instructions?.en) && lesson.instructions.en.length > 0, `${lessonId}: English instructions are missing`);
  requireCondition(Array.isArray(lesson.instructions?.zh) && lesson.instructions.zh.length > 0, `${lessonId}: Chinese instructions are missing`);
  validateBilingualItems(lesson, "benefits");
  validateBilingualItems(lesson, "rules");

  const source = lesson.source;
  requireCondition(source && typeof source === "object" && !Array.isArray(source), `${lessonId}: source metadata is missing`);
  requireCondition(normalText(source.file), `${lessonId}: source filename is missing`);
  requireCondition(Number.isInteger(source.pageCount) && source.pageCount > 0, `${lessonId}: invalid pageCount`);
  for (const field of ["lessonPages", "exercisePages", "answerPages"]) {
    requireCondition(Array.isArray(source[field]) && source[field].length > 0, `${lessonId}: ${field} is missing`);
    source[field].forEach((page) => {
      requireCondition(
        Number.isInteger(page) && page >= 1 && page <= source.pageCount,
        `${lessonId}: ${field} contains invalid page ${page}`
      );
    });
  }

  lesson.formulas.forEach((formula, index) => {
    requireCondition(normalText(formula?.id), `${lessonId}: formulas[${index}].id is missing`);
    requireCondition(normalText(formula?.formula), `${lessonId}: formulas[${index}].formula is missing`);
  });
  lesson.examples.forEach((example, index) => {
    requireCondition(normalText(example?.id), `${lessonId}: examples[${index}].id is missing`);
    requireCondition(normalText(example?.en), `${lessonId}: examples[${index}].en is missing`);
    requireCondition(normalText(example?.zh), `${lessonId}: examples[${index}].zh is missing`);
    requireCondition(normalText(example?.highlight), `${lessonId}: examples[${index}].highlight is missing`);
    requireCondition(
      occurrenceCount(example.en, example.highlight) === 1,
      `${lessonId}: examples[${index}].highlight must occur exactly once`
    );
  });

  requireCondition(
    Array.isArray(lesson.questions) && lesson.questions.length === QUESTIONS_PER_LESSON,
    `${lessonId}: expected ${QUESTIONS_PER_LESSON} questions`
  );
  const ids = new Set();
  const prompts = new Set();
  const answers = new Set();
  const answerOwners = new Map();
  const highlights = new Set();
  lesson.questions.forEach((question, index) => {
    const expectedNumber = index + 1;
    const expectedId = `${lessonId}-q${String(expectedNumber).padStart(2, "0")}`;
    requireCondition(question?.number === expectedNumber, `${expectedId}: number mismatch`);
    requireCondition(question?.id === expectedId, `${expectedId}: id mismatch`);
    for (const field of REQUIRED_QUESTION_FIELDS) {
      requireCondition(normalText(question?.[field]), `${expectedId}: ${field} is missing`);
    }
    requireCondition(
      question.answer.toLocaleLowerCase().startsWith(question.starter.toLocaleLowerCase()),
      `${expectedId}: starter does not prefix answer`
    );
    requireCondition(
      occurrenceCount(question.answer, question.highlight) === 1,
      `${expectedId}: highlight must occur exactly once`
    );
    requireCondition(
      normalText(question.answerZhSource || "pdf") !== "",
      `${expectedId}: answerZhSource is invalid`
    );
    requireCondition(
      normalText(question.promptZhSource || "pdf") !== "",
      `${expectedId}: promptZhSource is invalid`
    );
    if (
      question.cue !== undefined
      || question.cueSource !== undefined
      || question.source?.cuePage !== undefined
    ) {
      requireCondition(normalText(question.cue), `${expectedId}: cue is missing`);
      requireCondition(question.cueSource === "pdf", `${expectedId}: cueSource must be pdf`);
      requireCondition(
        Number.isInteger(question.source?.cuePage)
          && question.source.cuePage >= 1
          && question.source.cuePage <= source.pageCount,
        `${expectedId}: invalid source.cuePage`
      );
    }
    for (const field of SOURCE_PAGE_FIELDS) {
      const page = question.source?.[field];
      requireCondition(
        Number.isInteger(page) && page >= 1 && page <= source.pageCount,
        `${expectedId}: invalid source.${field}`
      );
    }
    for (const field of ["promptZhPage", "answerZhPage"]) {
      const page = question.source?.[field];
      if (page === undefined) continue;
      requireCondition(
        Number.isInteger(page) && page >= 1 && page <= source.pageCount,
        `${expectedId}: invalid source.${field}`
      );
    }
    if (question.acceptedAnswers !== undefined) {
      requireCondition(Array.isArray(question.acceptedAnswers), `${expectedId}: acceptedAnswers must be an array`);
      question.acceptedAnswers.forEach((answer) => {
        requireCondition(normalText(answer), `${expectedId}: acceptedAnswers contains an empty value`);
      });
    }
    if (question.answerParts !== undefined) {
      requireCondition(
        Array.isArray(question.answerParts) && question.answerParts.length >= 2,
        `${expectedId}: answerParts must contain at least two answers`
      );
      question.answerParts.forEach((part, partIndex) => {
        for (const field of ["label", "starter", "answer", "answerZh"]) {
          requireCondition(
            normalText(part?.[field]),
            `${expectedId}: answerParts[${partIndex}].${field} is missing`
          );
        }
        requireCondition(
          part.answer.toLocaleLowerCase().startsWith(part.starter.toLocaleLowerCase()),
          `${expectedId}: answerParts[${partIndex}] starter does not prefix answer`
        );
        for (const field of ["starterPage", "answerPage", "answerZhPage"]) {
          const page = part.source?.[field];
          if (page === undefined) continue;
          requireCondition(
            Number.isInteger(page) && page >= 1 && page <= source.pageCount,
            `${expectedId}: answerParts[${partIndex}].source.${field} is invalid`
          );
        }
        for (const suffix of ["StarterPage", "AnswerPage", "AnswerZhPage"]) {
          const field = `answerPart${partIndex}${suffix}`;
          const page = question.source?.[field];
          if (page === undefined) continue;
          requireCondition(
            Number.isInteger(page) && page >= 1 && page <= source.pageCount,
            `${expectedId}: invalid source.${field}`
          );
        }
      });
      const combinedAnswer = question.answerParts
        .map((part) => `${part.label}: ${part.answer}`)
        .join(" || ");
      const combinedChinese = question.answerParts
        .map((part) => part.answerZh)
        .join(" || ");
      requireCondition(question.answer === combinedAnswer, `${expectedId}: combined answerParts answer mismatch`);
      requireCondition(question.answerZh === combinedChinese, `${expectedId}: combined answerParts answerZh mismatch`);
    }

    const promptKey = `${question.prompt}\u0000${question.promptZh}`;
    const answerKey = `${question.answer}\u0000${question.answerZh}`;
    requireCondition(!ids.has(question.id), `${expectedId}: duplicate id`);
    requireCondition(!prompts.has(promptKey), `${expectedId}: duplicate bilingual prompt`);
    if (answers.has(answerKey)) {
      requireCondition(
        question.duplicateAnswerOf === answerOwners.get(answerKey),
        `${expectedId}: duplicate bilingual answer is not linked to its source-identical predecessor`
      );
    } else {
      requireCondition(
        question.duplicateAnswerOf === undefined,
        `${expectedId}: duplicateAnswerOf is present without a duplicate bilingual answer`
      );
    }
    requireCondition(!highlights.has(question.highlight), `${expectedId}: duplicate highlight`);
    ids.add(question.id);
    prompts.add(promptKey);
    answers.add(answerKey);
    if (!answerOwners.has(answerKey)) answerOwners.set(answerKey, question.id);
    highlights.add(question.highlight);
  });

  return lesson;
}

const lessons = [];
for (let number = FIRST_LESSON; number <= LAST_LESSON; number += 1) {
  const filename = `ss${String(number).padStart(2, "0")}.json`;
  const lesson = JSON.parse(await readFile(new URL(filename, lessonDirectory), "utf8"));
  lessons.push(validateLesson(lesson, number));
}

const output = `// Generated from tools/sentence-structure-lessons/ss05.json through ss114.json.\n`
  + `// Run tools/build-sentence-structure-expansion.mjs after editing an imported lesson.\n`
  + `(function () {\n`
  + `  "use strict";\n`
  + `  window.EDMUND_SENTENCE_STRUCTURE_EXPANSION = Object.freeze(${JSON.stringify(lessons)});\n`
  + `})();\n`;

await writeFile(outputUrl, output, "utf8");
console.log(
  `Generated ${lessons.length} Sentence Structure lessons with `
  + `${lessons.reduce((total, lesson) => total + lesson.questions.length, 0)} questions.`
);
