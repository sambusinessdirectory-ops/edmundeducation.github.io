const PLATFORM_ART = "assets/sentence-structure/exercise-eddy/coast-platform.webp";
let activeQuestionId = "";
let motionTimer = 0;
let reactionTimer = 0;
let positionFrame = 0;
let positionObserver = null;

export function sentenceJourneyEnabled(lesson) {
  const order = Number(lesson?.order || 0);
  return order >= 1 && order <= 30 && lesson?.questions?.length === 50;
}

export function sentenceJourneyPlatformHtml(number, status = "pending") {
  return `<div class="sentence-journey-platform is-${status}" aria-hidden="true">
    <img src="${PLATFORM_ART}" width="252" height="174" loading="lazy" decoding="async" alt="">
    <strong>${String(number).padStart(2, "0")}</strong>
  </div>`;
}

export function sentenceJourneyActorHtml() {
  return `<div class="sentence-journey-eddy" data-sentence-journey-eddy data-motion="idle" aria-hidden="true">
    <i class="sentence-journey-eddy-shadow"></i><i class="sentence-journey-eddy-sprite"></i><i class="sentence-journey-eddy-blink"></i>
  </div><p class="sentence-journey-status" data-sentence-journey-status role="status" aria-live="polite"></p>`;
}

export function getSentenceJourneyQuestionId() {
  return activeQuestionId;
}

function reducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function journeyElements(root) {
  const list = root?.querySelector?.("[data-question-list]");
  return { list, actor: list?.querySelector?.("[data-sentence-journey-eddy]"), status: list?.querySelector?.("[data-sentence-journey-status]") };
}

function stopFor(list, questionId) {
  return [...(list?.querySelectorAll?.("[data-eddy-stop]") || [])]
    .find((stop) => stop.dataset.eddyStop === String(questionId));
}

function actorTop(list, actor, stop) {
  const listBox = list.getBoundingClientRect();
  const platformBox = stop.querySelector(".sentence-journey-platform").getBoundingClientRect();
  return Math.max(0, platformBox.top - listBox.top + platformBox.height * .48 - actor.offsetHeight * .9);
}

function placeActor(list, actor, stop, animate) {
  actor.style.transition = animate ? "" : "none";
  actor.style.top = `${actorTop(list, actor, stop)}px`;
  if (!animate) requestAnimationFrame(() => { if (actor.isConnected) actor.style.transition = ""; });
}

function scheduleStablePosition(list, actor) {
  cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(() => {
    positionFrame = requestAnimationFrame(() => {
      const stop = stopFor(list, activeQuestionId);
      if (actor.isConnected && stop) placeActor(list, actor, stop, false);
    });
  });
}

export function mountSentenceJourney(root) {
  const { list, actor } = journeyElements(root);
  if (!list || !actor) return;
  let stop = stopFor(list, activeQuestionId);
  if (!stop) stop = list.querySelector("[data-eddy-stop]:not([data-stop-status='correct'])") || list.querySelector("[data-eddy-stop]");
  if (!stop) return;
  activeQuestionId = stop.dataset.eddyStop || "";
  stop.dataset.eddyActive = "true";
  scheduleStablePosition(list, actor);
  positionObserver?.disconnect();
  positionObserver = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => scheduleStablePosition(list, actor))
    : null;
  positionObserver?.observe(list);
}

export function moveSentenceJourney(root, questionId, { announce = true } = {}) {
  const { list, actor, status } = journeyElements(root);
  const stop = stopFor(list, questionId);
  if (!list || !actor || !stop) return 0;
  clearTimeout(reactionTimer);
  const nextTop = actorTop(list, actor, stop);
  const previousTop = Number.parseFloat(actor.style.top || String(nextTop));
  const distance = Math.abs(nextTop - previousTop);
  const duration = reducedMotion() || distance < 4 ? 0 : Math.round(Math.min(4200, Math.max(1450, 900 + distance * .58)));
  list.querySelectorAll("[data-eddy-active]").forEach((item) => delete item.dataset.eddyActive);
  stop.dataset.eddyActive = "true";
  actor.dataset.direction = nextTop < previousTop ? "up" : "down";
  actor.dataset.motion = duration ? "walk" : "idle";
  actor.style.setProperty("--eddy-walk-duration", `${duration}ms`);
  placeActor(list, actor, stop, duration > 0);
  activeQuestionId = String(questionId);
  if (announce && status) status.textContent = `Eddy 正前往第 ${stop.dataset.questionNumber || ""} 題平台。`;
  clearTimeout(motionTimer);
  motionTimer = setTimeout(() => {
    if (actor.isConnected && actor.dataset.motion === "walk") actor.dataset.motion = "idle";
  }, duration + 40);
  return duration;
}

export function reactSentenceJourney(root, { questionId, correct }) {
  const { actor, status, list } = journeyElements(root);
  if (!actor || !list) return;
  const travel = moveSentenceJourney(root, questionId, { announce: false });
  clearTimeout(reactionTimer);
  reactionTimer = setTimeout(() => {
    if (!actor.isConnected) return;
    actor.dataset.motion = correct ? "jump" : "encourage";
    if (status) status.textContent = correct
      ? "答對了！Eddy 開心地跳起來。"
      : "再試一次！Eddy 為你做出加油手勢。";
    const reactionDuration = reducedMotion() ? 520 : correct ? 980 : 1120;
    reactionTimer = setTimeout(() => {
      if (actor.isConnected) actor.dataset.motion = "idle";
    }, reactionDuration);
  }, travel + 70);
}
