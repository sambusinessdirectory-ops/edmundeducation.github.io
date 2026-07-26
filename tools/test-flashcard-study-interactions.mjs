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
assert.match(source, /\.study-main::before\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?opacity:\s*0;[\s\S]*?pointer-events:\s*none;/);
assert.match(source, /\.study-main\.swipe-underlay-right::before\s*\{[\s\S]*?background:\s*linear-gradient\([^;]*#ecfdf5[^;]*#bbf7d0/);
assert.match(source, /\.study-main\.swipe-underlay-left::before\s*\{[\s\S]*?background:\s*linear-gradient\([^;]*#fff1f2[^;]*#fecaca/);
assert.match(source, /\.study-main > \.front-stage,[\s\S]*?\.study-main > \.flash-frame,[\s\S]*?z-index:\s*1;/);
assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(source, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.study-main::before,[\s\S]*?transition-duration:\s*0\.01ms !important;/);

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
assert.equal(classifyStudyCardSwipe(50, 6, 500, 340, "touch"), "green");
assert.equal(classifyStudyCardSwipe(-74, 8, 650, 720, "touch"), "red");
assert.equal(classifyStudyCardSwipe(36, 3, 80, 720, "touch"), "green");
assert.equal(classifyStudyCardSwipe(36, 3, 500, 720, "touch"), "");
assert.equal(classifyStudyCardSwipe(46, 2, 500, 340, "mouse"), "");
assert.equal(classifyStudyCardSwipe(70, 90, 200, 340, "touch"), "");

const classifyAxisSource = extractFunction("classifyStudySwipeAxis");
const classifyStudySwipeAxis = vm.runInNewContext(`(${classifyAxisSource})`);
assert.equal(classifyStudySwipeAxis("", 8, 11, "touch"), "");
assert.equal(classifyStudySwipeAxis("", 8, 7, "touch"), "");
assert.equal(classifyStudySwipeAxis("", 45, 14, "touch"), "horizontal");
assert.equal(classifyStudySwipeAxis("", 3, 22, "touch"), "vertical");
assert.equal(classifyStudySwipeAxis("horizontal", 45, 80, "touch"), "horizontal");

const swipeRuntime = {
  Date: { now: () => 1000 },
  Number,
  Math,
  classifyStudyCardSwipe,
  classifyStudySwipeAxis,
  studyCardSwipeState: null,
  suppressStudyCardClickUntil: 0,
  currentStudyCardToken: () => "card-1",
  releaseStudyCardPointer: () => {},
  clearStudyCardSwipeVisual: () => {},
  abortStudyCardSwipe: state => {
    if (swipeRuntime.studyCardSwipeState === state) swipeRuntime.studyCardSwipeState = null;
    swipeRuntime.abortCount += 1;
  },
  commitStudyCardSwipe: (_state, result) => swipeRuntime.commits.push(result),
  renderStudyCardSwipe: () => { swipeRuntime.renderCount += 1; },
  commits: [],
  abortCount: 0,
  renderCount: 0
};
const finishStudyCardSwipe = vm.runInNewContext(`(${extractFunction("finishStudyCardSwipe")})`, swipeRuntime);
const updateStudyCardSwipe = vm.runInNewContext(`(${extractFunction("updateStudyCardSwipe")})`, swipeRuntime);
const completedTouchState = {
  axis: "horizontal",
  startX: 0,
  startY: 0,
  lastX: 74,
  lastY: 8,
  startedAt: 300,
  cardWidth: 720,
  pointerType: "touch",
  cardToken: "card-1",
  frame: { classList: { add() {} } }
};
swipeRuntime.studyCardSwipeState = completedTouchState;
finishStudyCardSwipe(completedTouchState, 74, 8, { type: "touchend", cancelable: true, preventDefault() {} });
assert.deepEqual(swipeRuntime.commits, ["green"]);
assert.equal(swipeRuntime.studyCardSwipeState, null);

const jitterThenSwipeState = {
  axis: "",
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  cardWidth: 340,
  pointerType: "touch",
  frame: { classList: { add() {} } }
};
let preventedTouchMove = false;
swipeRuntime.studyCardSwipeState = jitterThenSwipeState;
updateStudyCardSwipe(jitterThenSwipeState, 8, 11, { cancelable: true, preventDefault() { preventedTouchMove = true; } });
assert.equal(jitterThenSwipeState.axis, "");
assert.equal(preventedTouchMove, false);
assert.equal(swipeRuntime.renderCount, 0);
updateStudyCardSwipe(jitterThenSwipeState, 45, 14, { cancelable: true, preventDefault() { preventedTouchMove = true; } });
assert.equal(jitterThenSwipeState.axis, "horizontal");
assert.equal(preventedTouchMove, true);
assert.equal(swipeRuntime.renderCount, 1);

const verticalIntentState = {
  axis: "",
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  cardWidth: 340,
  pointerType: "touch",
  frame: { classList: { add() {} } }
};
let preventedVerticalMove = false;
swipeRuntime.studyCardSwipeState = verticalIntentState;
updateStudyCardSwipe(verticalIntentState, 8, 7, { cancelable: true, preventDefault() { preventedVerticalMove = true; } });
assert.equal(verticalIntentState.axis, "");
updateStudyCardSwipe(verticalIntentState, 10, 50, { cancelable: true, preventDefault() { preventedVerticalMove = true; } });
assert.equal(verticalIntentState.axis, "vertical");
assert.equal(preventedVerticalMove, false);
assert.equal(swipeRuntime.abortCount, 1);
assert.equal(swipeRuntime.studyCardSwipeState, null);

function makeClassList() {
  const values = new Set();
  return {
    add: (...tokens) => tokens.forEach(token => values.add(token)),
    remove: (...tokens) => tokens.forEach(token => values.delete(token)),
    toggle: (token, enabled) => enabled ? values.add(token) : values.delete(token),
    contains: token => values.has(token)
  };
}

function makeStyle() {
  const values = new Map();
  return {
    setProperty: (name, value) => values.set(name, value),
    removeProperty: name => values.delete(name),
    getPropertyValue: name => values.get(name) || ""
  };
}

const underlayMain = {
  classList: makeClassList(),
  style: makeStyle(),
  getBoundingClientRect: () => ({ top: 100, left: 20 })
};
const underlayFrame = {
  closest: selector => selector === ".study-main" ? underlayMain : null,
  getBoundingClientRect: () => ({ top: 180, left: 45, width: 320, height: 540 })
};
const underlayRuntime = { Number, Math, Array, document: { querySelectorAll: () => [] } };
const positionStudyCardSwipeUnderlay = vm.runInNewContext(
  `(${extractFunction("positionStudyCardSwipeUnderlay")})`,
  underlayRuntime
);
const renderStudyCardSwipeUnderlay = vm.runInNewContext(
  `(${extractFunction("renderStudyCardSwipeUnderlay")})`,
  underlayRuntime
);
const clearStudyCardSwipeUnderlay = vm.runInNewContext(
  `(${extractFunction("clearStudyCardSwipeUnderlay")})`,
  underlayRuntime
);
positionStudyCardSwipeUnderlay(underlayFrame, underlayFrame.getBoundingClientRect());
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-top"), "80px");
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-left"), "25px");
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-width"), "320px");
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-height"), "540px");
renderStudyCardSwipeUnderlay(underlayFrame, "right", 0.5);
assert.equal(underlayMain.classList.contains("swipe-underlay-right"), true);
assert.equal(underlayMain.classList.contains("swipe-underlay-left"), false);
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-opacity"), "0.250");
renderStudyCardSwipeUnderlay(underlayFrame, "left", 1);
assert.equal(underlayMain.classList.contains("swipe-underlay-right"), false);
assert.equal(underlayMain.classList.contains("swipe-underlay-left"), true);
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-opacity"), "0.420");
clearStudyCardSwipeUnderlay(underlayFrame);
assert.equal(underlayMain.classList.contains("swipe-underlay-left"), false);
assert.equal(underlayMain.style.getPropertyValue("--swipe-underlay-opacity"), "");

const swipeStart = sourceBetween(
  "function handleStudyCardPointerDown(event)",
  "function handleStudyCardPointerMove(event)"
);
const canStartSwipe = extractFunction("canStartStudyCardSwipe");
assert.match(canStartSwipe, /!studySession\?\.flipped/);
assert.match(canStartSwipe, /studySwipeStartedOnControl\(target\)/);
assert.match(swipeStart, /try \{[\s\S]*?setPointerCapture/);
assert.match(source, /state\.lastX = clientX;/);
assert.match(source, /state\.lastY = clientY;/);
assert.match(source, /classifyStudyCardSwipe\([\s\S]*?state\.pointerType/);
assert.doesNotMatch(source, /width \* 0\.72/);
assert.match(source, /const travelLimit = viewportWidth \* 1\.25;/);
assert.match(source, /-webkit-touch-callout:\s*none;/);
assert.match(source, /overscroll-behavior-x:\s*none;/);
assert.match(source, /renderStudyCardSwipeUnderlay\(frame, direction, intensity\)/);
assert.match(source, /renderStudyCardSwipeUnderlay\(frame, result === "green" \? "right" : "left", 1\)/);
assert.match(source, /positionStudyCardSwipeUnderlay\(frame, rect\)/);
assert.match(source, /clearStudyCardSwipeUnderlay\(frame\)/);

const swipeCommit = sourceBetween(
  "function commitStudyCardSwipe(state, result)",
  "function handleStudyCardPointerDown(event)"
);
assert.match(swipeCommit, /currentStudyCardToken\(\) === state\.cardToken/);
assert.match(swipeCommit, /markCard\(result\)/);
assert.equal((swipeCommit.match(/markCard\(/g) || []).length, 1);

const pointerEnd = sourceBetween(
  "function handleStudyCardPointerEnd(event)",
  "function handleStudyCardLostPointerCapture(event)"
);
assert.match(pointerEnd, /event\.type === "pointercancel"[\s\S]*?abortStudyCardSwipe\(state\)/);
assert.match(pointerEnd, /finishStudyCardSwipe\(state, event\.clientX, event\.clientY, event\)/);

const lostCapture = sourceBetween(
  "function handleStudyCardLostPointerCapture(event)",
  "function handleStudyCardTouchStart(event)"
);
assert.match(lostCapture, /abortStudyCardSwipe\(state\)/);

const touchStart = sourceBetween(
  "function handleStudyCardTouchStart(event)",
  "function handleStudyCardTouchMove(event)"
);
assert.match(touchStart, /event\.touches\.length !== 1[\s\S]*?abortStudyCardSwipe\(activeState\)/);

const touchEnd = sourceBetween(
  "function handleStudyCardTouchEnd(event)",
  "function setupStudyCardSwipeHandlers()"
);
assert.match(touchEnd, /event\.type === "touchcancel"[\s\S]*?abortStudyCardSwipe\(state\)/);
assert.match(touchEnd, /if \(!touch\) return;/);

const swipeSetup = sourceBetween(
  "function setupStudyCardSwipeHandlers()",
  "function flipCurrentCard()"
);
assert.match(swipeSetup, /pointerdown/);
assert.match(swipeSetup, /pointermove/);
assert.match(swipeSetup, /passive: false/);
assert.match(swipeSetup, /pointercancel/);
assert.match(swipeSetup, /lostpointercapture/);
assert.match(swipeSetup, /touchstart/);
assert.match(swipeSetup, /touchmove/);
assert.match(swipeSetup, /touchend/);
assert.match(swipeSetup, /touchcancel/);
assert.match(swipeSetup, /handleStudyCardTouchMove, \{ passive: false \}/);

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
