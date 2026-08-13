#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");

const [flashcards, sentence, common, speaking, video, writingSubmission, idiom, proverb, phrasalVerb, writingPractice] = await Promise.all([
  read("flashcards.html"),
  read("sentence-structure.js"),
  read("common-expression-system.js"),
  read("speaking-system.js"),
  read("video-class.js"),
  read("writing-submission.js"),
  read("idiom-system.js"),
  read("proverb-system.js"),
  read("phrasal-verb-system.js"),
  read("writing-practice.html")
]);

for (const eventName of ["edmund:idle-break-start", "edmund:idle-break-resume", "edmund:idle-break-logout"]) {
  for (const [name, source] of Object.entries({ flashcards, sentence, common, speaking, video, writingSubmission, idiom, proverb, phrasalVerb, writingPractice })) {
    assert.match(source, new RegExp(eventName), `${name} must handle ${eventName}`);
  }
}

assert.match(flashcards, /const endpoint = flashcardIdlePausedAt \|\| Date\.now\(\)/);
assert.match(flashcards, /studySession\.startedAt = Number\(studySession\.startedAt \|\| pausedAt\) \+ \(resumedAt - pausedAt\)/);
assert.match(flashcards, /flashcardIdlePausedAt = 0;[\s\S]*?stopCountdownTimers\(\);/, "logout must clear the frozen timestamp and countdown state");
assert.match(flashcards, /startCardCountdownIfNeeded\(\{ resume: true \}\)/);
assert.match(flashcards, /startAnswerCheckCountdown\(\{ resume: true \}\)/);

assert.match(sentence, /function startExerciseClock\(\)[\s\S]*?idleBreakIsPaused\(\)/);
assert.match(sentence, /edmund:idle-break-start[\s\S]*?pauseExerciseClock\(\)/);
assert.match(sentence, /edmund:idle-break-resume[\s\S]*?startExerciseClock\(\)/);

assert.match(common, /function startClock\(\)[\s\S]*?!idleBreakIsPaused\(\)/);
assert.match(common, /edmund:idle-break-start[\s\S]*?pauseClock\(\)/);
assert.match(common, /edmund:idle-break-resume[\s\S]*?startClock\(\)/);

assert.match(speaking, /idleBreakDurationMs/);
assert.match(speaking, /examElapsedMilliseconds[\s\S]*?state\.idleBreakExamPausedAt/);
assert.match(speaking, /item\.settleEndsAt \+= pauseDuration/);
assert.match(speaking, /item\.prepEndsAt \+= pauseDuration/);
assert.match(speaking, /EdmundIdleBreak\?\.markActivity\?\.\(\)/, "active recorder clock must keep the shared guard awake");

assert.match(video, /beginHeartbeat\(\)[\s\S]*?EdmundIdleBreak\?\.isPaused/);
assert.match(video, /edmund:idle-break-start[\s\S]*?elements\.video\.pause\(\)/);
assert.match(video, /edmund:idle-break-resume[\s\S]*?elements\.video\.play\(\)/);

assert.match(writingSubmission, /function writingClockEligible\([\s\S]*?!idleBreakIsPaused\(\)/);
assert.match(writingSubmission, /pauseWritingTimersForIdleBreak[\s\S]*?pauseWritingTimer/);
assert.match(writingSubmission, /pauseWritingTimersForIdleBreak[\s\S]*?pauseWritingStopwatch/);
assert.match(writingSubmission, /resumeWritingTimersAfterIdleBreak[\s\S]*?resumeWritingTimer/);
assert.match(writingSubmission, /resumeWritingTimersAfterIdleBreak[\s\S]*?startWritingStopwatch/);

for (const [name, source] of Object.entries({ idiom, proverb, phrasalVerb })) {
  assert.match(source, /function startExerciseClock\(\)[\s\S]*?idleBreakIsPaused\(\)/, `${name} must refuse to restart while the break dialog is open`);
  assert.match(source, /edmund:idle-break-start[\s\S]*?pauseExerciseClock\(\)/, `${name} must capture and pause its exercise clock`);
  assert.match(source, /edmund:idle-break-resume[\s\S]*?exerciseClockWasRunningBeforeIdleBreak[\s\S]*?startExerciseClock\(\)/, `${name} must resume only a previously active exercise clock`);
}

assert.match(writingPractice, /function writingPracticeElapsedDuration\([\s\S]*?idleBreakDurationMs[\s\S]*?end - start - paused/);
assert.match(writingPractice, /edmund:idle-break-start[\s\S]*?writingPracticeIdleRound = roundIsRunning \? practiceState : null/);
assert.match(writingPractice, /edmund:idle-break-resume[\s\S]*?practiceState === writingPracticeIdleRound[\s\S]*?idleBreakDurationMs/);
assert.match(writingPractice, /durationMs: writingPracticeElapsedDuration\([\s\S]*?practiceState\.idleBreakDurationMs/);

console.log("Idle-break timer integration checks passed.");
