import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing function: ${name}`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated function: ${name}`);
}

assert.match(
  source,
  /\.study-side\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*calc\(var\(--flashcard-sticky-header-height\) \+ 16px\);[\s\S]*?max-height:\s*calc\(100dvh - var\(--flashcard-sticky-header-height\) - 32px\);[\s\S]*?overflow-y:\s*auto;/,
  "The action and note rail must remain in the viewport on desktop"
);
assert.match(
  source,
  /@media \(max-width: 680px\)[\s\S]*?\.study-side\s*\{[\s\S]*?order:\s*-1;[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*calc\(var\(--flashcard-sticky-header-height\)/,
  "The compact mobile rail must precede the card and remain sticky"
);
assert.match(
  source,
  /@media \(max-width: 1080px\)[\s\S]*?\.study-side\s*\{[\s\S]*?top:\s*calc\(var\(--flashcard-sticky-header-height\) \+ 12px\);[\s\S]*?max-height:\s*calc\(100dvh - var\(--flashcard-sticky-header-height\) - 24px\);/,
  "The tablet rail must stay below the shared sticky header"
);
assert.match(source, /function setupStudyStickyHeaderOffset\(\)/);
assert.match(source, /new ResizeObserver\(updateStudyStickyHeaderOffset\)/);
assert.match(source, /setupStudyStickyHeaderOffset\(\);/);
assert.match(source, /\.flash-frame\s*\{[\s\S]*?touch-action:\s*pan-y pinch-zoom;/);
assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);

const studyMarkup = sourceBetween(
  '<section class="deck-card hidden" data-deck-view>',
  '<script src="https://cdn.jsdelivr.net/npm/@supabase'
);
assert.equal((studyMarkup.match(/data-prev-study-card/g) || []).length, 2);
assert.equal((studyMarkup.match(/data-next-study-card/g) || []).length, 2);
assert.equal((studyMarkup.match(/data-reveal-study-card/g) || []).length, 1);
assert.equal((studyMarkup.match(/data-countdown-clock/g) || []).length, 2);
assert.match(source, /class="mobile-study-tools"/);
assert.match(
  source,
  /@media \(max-width: 1080px\), \(any-pointer: coarse\)[\s\S]*?\.front-stage > \.card-nav[\s\S]*?display:\s*none !important;[\s\S]*?\.mobile-study-tools\s*\{[\s\S]*?display:\s*grid;/,
  "Tablet and touch devices must use the on-screen navigation column"
);

const countdownUpdate = sourceBetween(
  "function updateCountdownClock(value, muted = false)",
  "function hideCountdownClock()"
);
assert.match(countdownUpdate, /querySelectorAll\("\[data-countdown-clock\]"\)\.forEach/);

const renderStudyCard = sourceBetween("function renderStudyCard()", "function fitVisibleCardTerms()");
assert.match(renderStudyCard, /querySelectorAll\("\[data-prev-study-card\]"\)/);
assert.match(renderStudyCard, /querySelectorAll\("\[data-next-study-card\]"\)/);
assert.match(renderStudyCard, /querySelectorAll\("\[data-reveal-study-card\]"\)/);
assert.match(renderStudyCard, /revealButtons\.forEach/);

const flipCurrentCard = sourceBetween("function flipCurrentCard()", "function moveStudyCard(delta)");
assert.match(flipCurrentCard, /studySession\.flipped\) return/);
assert.match(flipCurrentCard, /scheduleRevealedBackCardScroll\(\)/);

const scrollStudyTarget = sourceBetween(
  "function scrollStudyTargetIntoView(target, options = {})",
  "function scheduleStudyScroll(selector, options = {})"
);
assert.match(scrollStudyTarget, /querySelector\("\.edmund-system-header"\)/);
assert.match(scrollStudyTarget, /headerBottom \+ 12/);
assert.match(scrollStudyTarget, /mobileDock\.getBoundingClientRect\(\)\.bottom \+ 10/);

const timedReveal = sourceBetween("function autoCountdownRed()", "function completionSummaryHtml()");
assert.match(timedReveal, /scheduleRevealedBackCardScroll\(\)/);

const moveStudyCard = sourceBetween("function moveStudyCard(delta)", "function findNextUnansweredPosition");
assert.match(moveStudyCard, /scheduleCurrentFrontCardScroll\(\)/);

const markCard = sourceBetween("function markCard(result)", "function handleCardPrimaryAction");
assert.match(markCard, /scheduleCurrentFrontCardScroll\(\)/);

const classifySource = extractFunction("classifyStudyCardSwipe");
const classifyStudyCardSwipe = vm.runInNewContext(`(${classifySource})`);
assert.equal(classifyStudyCardSwipe(130, 8, 400, 420), "green");
assert.equal(classifyStudyCardSwipe(-130, 8, 400, 420), "red");
assert.equal(classifyStudyCardSwipe(25, 1, 100, 420), "");
assert.equal(classifyStudyCardSwipe(70, 120, 250, 420), "");
assert.equal(classifyStudyCardSwipe(58, 3, 70, 420), "green");

const swipeStart = sourceBetween(
  "function handleStudyCardPointerDown(event)",
  "function handleStudyCardPointerMove(event)"
);
assert.match(swipeStart, /!studySession\?\.flipped/);
assert.match(swipeStart, /studySwipeStartedOnControl\(event\.target\)/);

const swipeCommit = sourceBetween(
  "function commitStudyCardSwipe(state, result)",
  "function handleStudyCardPointerDown(event)"
);
assert.match(swipeCommit, /currentStudyCardToken\(\) === state\.cardToken/);
assert.match(swipeCommit, /markCard\(result\)/);
assert.equal((swipeCommit.match(/markCard\(/g) || []).length, 1);

const swipeSetup = sourceBetween(
  "function setupStudyCardSwipeHandlers()",
  "function flipCurrentCard()"
);
assert.match(swipeSetup, /pointerdown/);
assert.match(swipeSetup, /pointermove/);
assert.match(swipeSetup, /passive: false/);
assert.match(swipeSetup, /pointercancel/);

const primaryAction = sourceBetween(
  "function handleCardPrimaryAction(event)",
  "function handleCardSecondaryAction(event)"
);
assert.match(primaryAction, /Date\.now\(\) < suppressStudyCardClickUntil/);

const secondaryAction = sourceBetween(
  "function handleCardSecondaryAction(event)",
  "function finishRound()"
);
assert.match(secondaryAction, /Date\.now\(\) < suppressStudyCardContextMenuUntil/);

console.log("Flashcard study interaction checks passed.");
