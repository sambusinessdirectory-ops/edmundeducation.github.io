const PLATFORM_ART = "assets/sentence-structure/coast/props.webp";
let activeQuestionId = "";
let motionTimer = 0;
let reactionTimer = 0;

export function sentenceJourneyEnabled(lesson) {
  const order = Number(lesson?.order || 0);
  return order >= 1 && order <= 30 && lesson?.questions?.length === 50;
}

export function sentenceJourneyPlatformHtml(number, status = "pending") {
  const label = status === "correct" ? "✓" : status === "wrong" ? "!" : "";
  return `<div class="sentence-journey-platform is-${status}" aria-hidden="true">
    <svg viewBox="34 157 523 361" preserveAspectRatio="xMidYMax meet"><image href="${PLATFORM_ART}" width="1536" height="1024"></image></svg>
    <strong>${String(number).padStart(2, "0")}</strong><span>${label}</span>
  </div>`;
}

export function sentenceJourneyActorHtml() {
  return `<div class="sentence-journey-eddy" data-sentence-journey-eddy data-motion="idle" aria-hidden="true">
    <i class="sentence-journey-eddy-shadow"></i><i class="sentence-journey-eddy-sprite"></i>
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
  return Math.max(0, platformBox.top - listBox.top + platformBox.height * .42 - actor.offsetHeight * .82);
}

export function mountSentenceJourney(root) {
  const { list, actor } = journeyElements(root);
  if (!list || !actor) return;
  let stop = stopFor(list, activeQuestionId);
  if (!stop) stop = list.querySelector("[data-eddy-stop]:not([data-stop-status='correct'])") || list.querySelector("[data-eddy-stop]");
  if (!stop) return;
  activeQuestionId = stop.dataset.eddyStop || "";
  requestAnimationFrame(() => {
    actor.style.transition = "none";
    actor.style.top = `${actorTop(list, actor, stop)}px`;
    stop.dataset.eddyActive = "true";
    requestAnimationFrame(() => { actor.style.transition = ""; });
  });
}

export function moveSentenceJourney(root, questionId, { announce = true } = {}) {
  const { list, actor, status } = journeyElements(root);
  const stop = stopFor(list, questionId);
  if (!list || !actor || !stop) return 0;
  const nextTop = actorTop(list, actor, stop);
  const previousTop = Number.parseFloat(actor.style.top || String(nextTop));
  const distance = Math.abs(nextTop - previousTop);
  const duration = reducedMotion() ? 0 : Math.round(Math.min(1250, Math.max(430, 360 + distance * .22)));
  list.querySelectorAll("[data-eddy-active]").forEach((item) => delete item.dataset.eddyActive);
  stop.dataset.eddyActive = "true";
  actor.dataset.direction = nextTop < previousTop ? "up" : "down";
  actor.dataset.motion = duration ? "walk" : "idle";
  actor.style.setProperty("--eddy-walk-duration", `${duration}ms`);
  actor.style.top = `${nextTop}px`;
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
