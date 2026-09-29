let activeQuestionId = "";
let motionTimer = 0;
let reactionTimer = 0;
let positionFrame = 0;
let positionObserver = null;
let reactionSequence = 0;
const reactionAssets = new Map();
const REACTION_ASSET_URLS = {
  jump: new URL("assets/sentence-structure/exercise-eddy/eddy-jump-v3.webp", import.meta.url).href,
  encourage: new URL("assets/sentence-structure/exercise-eddy/eddy-encourage-v2.webp", import.meta.url).href
};

function preloadReactionAsset(kind) {
  if (reactionAssets.has(kind)) return reactionAssets.get(kind);
  const promise = new Promise((resolve) => {
    if (typeof globalThis.Image !== "function") return resolve(true);
    const image = new Image();
    image.onload = async () => {
      try { await image.decode?.(); } catch { /* A completed load is still paintable. */ }
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = REACTION_ASSET_URLS[kind];
  });
  reactionAssets.set(kind, promise);
  return promise;
}

function preloadReactionAssets() {
  preloadReactionAsset("jump");
  preloadReactionAsset("encourage");
}

export function sentenceJourneyEnabled(lesson) {
  const order = Number(lesson?.order || 0);
  return order >= 1 && order <= 60 && lesson?.questions?.length === 50;
}

export function sentenceJourneyPlatformHtml(number, status = "pending") {
  return `<div class="sentence-journey-platform is-${status}" aria-hidden="true">
    <strong>${String(number).padStart(2, "0")}</strong>
  </div>`;
}

export function sentenceJourneyActorHtml() {
  return `<div class="sentence-journey-eddy" data-sentence-journey-eddy data-motion="idle" aria-hidden="true">
    <i class="sentence-journey-eddy-shadow"></i><i class="sentence-journey-eddy-sprite"></i><i class="sentence-journey-eddy-action sentence-journey-eddy-jump"></i><i class="sentence-journey-eddy-action sentence-journey-eddy-encourage"></i><i class="sentence-journey-eddy-blink"></i>
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
  actor.dataset.positioned = "true";
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
  preloadReactionAssets();
  let stop = stopFor(list, activeQuestionId);
  if (!stop) stop = list.querySelector("[data-eddy-stop]:not([data-stop-status='correct'])") || list.querySelector("[data-eddy-stop]");
  if (!stop) return;
  const keepsStablePosition = actor.dataset.positioned === "true" && stop.dataset.eddyStop === activeQuestionId;
  activeQuestionId = stop.dataset.eddyStop || "";
  stop.dataset.eddyActive = "true";
  if (!keepsStablePosition) placeActor(list, actor, stop, false);
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
  const duration = reducedMotion() || distance < 4 ? 0 : Math.round(Math.min(6000, Math.max(2070, (900 + distance * .58) / .7)));
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
  const alreadyOnPlatform = actor.dataset.positioned === "true" && activeQuestionId === String(questionId);
  const travel = alreadyOnPlatform ? 0 : moveSentenceJourney(root, questionId, { announce: false });
  clearTimeout(reactionTimer);
  const sequence = ++reactionSequence;
  const motion = correct ? "jump" : "encourage";
  reactionTimer = setTimeout(() => {
    void preloadReactionAsset(motion).then((ready) => {
      if (!ready || !actor.isConnected || sequence !== reactionSequence) return;
      actor.dataset.motion = motion;
      if (status) status.textContent = correct
        ? "答對了！Eddy 開心地跳起來。"
        : "再試一次！Eddy 為你做出加油手勢。";
      const reactionDuration = reducedMotion() ? 520 : correct ? 980 : 1120;
      reactionTimer = setTimeout(() => {
        if (actor.isConnected && sequence === reactionSequence) actor.dataset.motion = "idle";
      }, reactionDuration);
    });
  }, travel + 70);
}
