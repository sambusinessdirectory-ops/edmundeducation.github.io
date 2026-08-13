const ROOT = document.documentElement;
const BODY = document.body;
const CONFIG = window.EDMUND_COMMON_EXPRESSION_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const CATALOGUE = window.EDMUND_COMMON_EXPRESSION_DATA || { systems: {} };
const SYSTEM_KEY = String(BODY.dataset.commonExpressionSystem || "").trim();
const SYSTEM = CATALOGUE.systems?.[SYSTEM_KEY];

if (!SYSTEM) throw new Error(`Unknown Common Expression system: ${SYSTEM_KEY || "missing"}`);

const SESSION_KEY = `edmund-common-expression-${SYSTEM_KEY}-session-v1`;
const LOCAL_STATE_KEY = `edmund-common-expression-${SYSTEM_KEY}-local-v1`;
const PROGRESS_PANEL_PREFERENCE_KEY = `edmund-common-expression-${SYSTEM_KEY}-progress-panel-v1`;
const CUMULATIVE_PROGRESS_PREFERENCE_KEY = `edmund-common-expression-${SYSTEM_KEY}-cumulative-progress-v1`;
const PROGRESS_RANGES = Object.freeze([
  ["week", "Week"],
  ["month", "Month"],
  ["half-year", "Half a Year"],
  ["ytd", "Year to Date"],
  ["year", "1 Year"],
  ["all", "All Time"]
]);
const TABS = Object.freeze([
  ["examples", "例句轉換", "Examples"],
  ["benefits", "學習好處", "Benefits"],
  ["reminders", "重要規則", "Reminders"],
  ["usage", "完整用法", "Usage"],
  ["summary", "總結＋練習", "Practice"]
]);

const state = {
  supabase: null,
  user: null,
  token: "",
  currentView: "login",
  lessonId: "",
  lessonTab: "examples",
  states: new Map(),
  dirtyLessonIds: new Set(),
  bookmarks: new Set(),
  questionActivity: [],
  timeActivity: [],
  progressPanelExpanded: false,
  progressRange: "month",
  timeProgressRange: "month",
  showCumulativeProgress: false,
  selectedProgressDay: "",
  selectedTimeProgressDay: "",
  lessonClockStartedAt: 0,
  saveQueue: Promise.resolve(),
  draftTimer: 0,
  toastTimer: 0
};

let lessonClockWasRunningBeforeIdleBreak = false;

function idleBreakIsPaused() {
  return window.EdmundIdleBreak?.isPaused?.() === true;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeAnswer(value) {
  return window.EdmundAnswerComparison.normalize(value);
}

function answerComparison(studentAnswer, expectedAnswers) {
  return window.EdmundAnswerComparison.best(studentAnswer, expectedAnswers);
}

function dialogueParts(value, { allowMissingA = false } = {}) {
  const text = String(value || "").normalize("NFKC").replace(/\r\n?/g, "\n");
  // Source material uses both `A: ...\nB: ...` and `A: ... B: ...` layouts.
  // Treat B as a speaker label only when it is followed by a colon, so an
  // ordinary capital B inside A's words cannot split the dialogue.
  const complete = text.match(/^\s*A\s*[:：]\s*([\s\S]*?)(?:\s*\n+\s*|\s+)B\s*[:：]\s*([\s\S]*?)\s*$/i);
  if (complete) return { a: complete[1].trim(), b: complete[2].trim() };
  if (allowMissingA) {
    const bOnly = text.match(/^\s*B\s*[:：]\s*([\s\S]*?)\s*$/i);
    if (bOnly) return { a: "", b: bOnly[1].trim() };
  }
  return null;
}

function dialogueQuestionParts(question) {
  const prompt = dialogueParts(question?.promptEn);
  const answer = dialogueParts(question?.answerEn);
  return prompt && answer ? { prompt, answer } : null;
}

function storedDialogueValues(value) {
  const parsed = dialogueParts(value, { allowMissingA: true });
  if (parsed) return parsed;
  const raw = String(value || "").trim();
  if (!raw) return { a: "", b: "" };
  const aOnly = raw.match(/^\s*A\s*[:：]\s*([\s\S]*?)\s*$/i);
  if (aOnly) return { a: aOnly[1].trim(), b: "" };
  // Before the dialogue UI was introduced, drafts were stored as one plain
  // answer. For dialogue questions that legacy value represented B's reply.
  return { a: "", b: raw };
}

function combinedDialogueValue(a, b) {
  const first = String(a || "").trim();
  const second = String(b || "").trim();
  if (!first && !second) return "";
  return `${first ? `A: ${first}\n` : ""}B: ${second}`;
}

function acceptedAnswersForQuestion(question) {
  return [...new Set([question?.answerEn, ...(Array.isArray(question?.acceptedAnswers) ? question.acceptedAnswers : [])]
    .filter((answer) => String(answer || "").trim()))];
}

function questionAnswerComparison(answer, question) {
  const dialogue = dialogueQuestionParts(question);
  if (!dialogue) return answerComparison(answer, acceptedAnswersForQuestion(question));
  const submitted = storedDialogueValues(answer);
  const expectedB = acceptedAnswersForQuestion(question)
    .map((candidate) => dialogueParts(candidate))
    .filter(Boolean)
    .map((candidate) => candidate.b);
  if (!submitted.b) {
    const invalid = answerComparison("", expectedB);
    return { ...invalid, correct: false, missingRequiredB: true };
  }
  return answerComparison(submitted.b, expectedB);
}

function answerIsPresent(answer, question) {
  const dialogue = dialogueQuestionParts(question);
  return dialogue ? Boolean(storedDialogueValues(answer).b) : Boolean(String(answer || "").trim());
}

function feedbackAnswerMarkup(question, answer) {
  const comparison = questionAnswerComparison(answer, question);
  const dialogue = dialogueQuestionParts(question);
  const studentAnswer = dialogue ? storedDialogueValues(answer).b : answer;
  return {
    comparison,
    html: window.EdmundAnswerComparison.expectedMarkup(
      comparison.expectedAnswer || (dialogue ? dialogue.answer.b : question.answerEn),
      studentAnswer,
      escapeHtml
    ).html
  };
}

function getLesson(lessonId) {
  return SYSTEM.lessons.find((lesson) => lesson.id === lessonId) || null;
}

function normalizeTimestamp(value) {
  if (!value) return "";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function timestampValue(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function blankLessonState(lessonId) {
  return {
    lessonId,
    answers: {},
    durationMs: 0,
    completedAt: "",
    updatedAt: ""
  };
}

function normalizeLessonState(row) {
  const raw = row?.state && typeof row.state === "object" && !Array.isArray(row.state) ? row.state : {};
  const lessonId = String(row?.lesson_id || raw.lessonId || "");
  const lesson = getLesson(lessonId);
  if (!lesson) return null;
  const answers = {};
  for (const question of lesson.questions) {
    const source = raw.answers?.[question.id];
    if (!source || typeof source !== "object") continue;
    answers[question.id] = {
      answer: String(source.answer || "").slice(0, 6000),
      checkedAnswer: String(source.checkedAnswer ?? (Number(source.attempts) > 0 ? source.answer : "")).slice(0, 6000),
      correct: source.correct === true,
      attempts: Math.max(0, Math.min(100, Number(source.attempts) || 0)),
      updatedAt: normalizeTimestamp(source.updatedAt)
    };
  }
  return {
    lessonId,
    answers,
    durationMs: Math.max(0, Number(row?.duration_ms ?? raw.durationMs) || 0),
    completedAt: normalizeTimestamp(row?.completed_at || raw.completedAt),
    updatedAt: normalizeTimestamp(row?.updated_at || raw.updatedAt)
  };
}

function normalizeQuestionActivity(rows) {
  const unique = new Map();
  for (const raw of Array.isArray(rows) ? rows : []) {
    const lessonId = String(raw?.lessonId || raw?.lesson_id || "");
    const questionId = String(raw?.questionId || raw?.question_id || "");
    const completedAt = normalizeTimestamp(raw?.completedAt || raw?.completed_at);
    if (!getLesson(lessonId)?.questions.some((question) => question.id === questionId) || !completedAt) continue;
    const key = `${lessonId}\u0000${questionId}`;
    const existing = unique.get(key);
    if (!existing || timestampValue(completedAt) < timestampValue(existing.completedAt)) {
      unique.set(key, { lessonId, questionId, completedAt });
    }
  }
  return [...unique.values()].sort((a, b) => timestampValue(a.completedAt) - timestampValue(b.completedAt));
}

function normalizeTimeActivity(rows) {
  const unique = new Map();
  for (const raw of Array.isArray(rows) ? rows : []) {
    const lessonId = String(raw?.lessonId || raw?.lesson_id || "");
    const date = String(raw?.date || raw?.activity_date || "");
    const durationMs = Math.max(0, Number(raw?.durationMs ?? raw?.duration_ms) || 0);
    if (!getLesson(lessonId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !durationMs) continue;
    const key = `${lessonId}\u0000${date}`;
    const existing = unique.get(key);
    unique.set(key, { lessonId, date, durationMs: Math.max(durationMs, Number(existing?.durationMs || 0)) });
  }
  return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date) || a.lessonId.localeCompare(b.lessonId));
}

function mergeLessonStates(server, local) {
  if (!server) return local;
  if (!local) return server;
  const answers = { ...server.answers };
  for (const [questionId, localAnswer] of Object.entries(local.answers || {})) {
    const serverAnswer = answers[questionId];
    if (!serverAnswer
      || timestampValue(localAnswer.updatedAt) > timestampValue(serverAnswer.updatedAt)
      || (timestampValue(localAnswer.updatedAt) === timestampValue(serverAnswer.updatedAt)
        && Number(localAnswer.attempts || 0) > Number(serverAnswer.attempts || 0))) {
      answers[questionId] = localAnswer;
    }
  }
  return {
    lessonId: server.lessonId,
    answers,
    durationMs: Math.max(server.durationMs, local.durationMs),
    completedAt: server.completedAt || local.completedAt,
    updatedAt: timestampValue(local.updatedAt) > timestampValue(server.updatedAt)
      ? local.updatedAt
      : server.updatedAt
  };
}

function localRecordNeedsSync(server, local) {
  if (!local) return false;
  if (!server) return true;
  if (local.durationMs > server.durationMs || (local.completedAt && !server.completedAt)) return true;
  return Object.entries(local.answers || {}).some(([questionId, localAnswer]) => {
    const serverAnswer = server.answers?.[questionId];
    return !serverAnswer
      || timestampValue(localAnswer.updatedAt) > timestampValue(serverAnswer.updatedAt)
      || (timestampValue(localAnswer.updatedAt) === timestampValue(serverAnswer.updatedAt)
        && Number(localAnswer.attempts || 0) > Number(serverAnswer.attempts || 0));
  });
}

function lessonState(lessonId) {
  if (!state.states.has(lessonId)) state.states.set(lessonId, blankLessonState(lessonId));
  return state.states.get(lessonId);
}

function completedCount(lessonId) {
  return Object.values(lessonState(lessonId).answers).filter((answer) => answer.correct).length;
}

function totalCompletedQuestions() {
  return SYSTEM.lessons.reduce((sum, lesson) => sum + completedCount(lesson.id), 0);
}

function isLessonComplete(lesson) {
  return lesson.questions.length > 0 && completedCount(lesson.id) === lesson.questions.length;
}

function currentDurationMs(lessonId = state.lessonId) {
  const stored = lessonState(lessonId).durationMs;
  if (!state.lessonClockStartedAt || state.lessonId !== lessonId || idleBreakIsPaused()) return stored;
  return stored + Math.max(0, Math.round(performance.now() - state.lessonClockStartedAt));
}

function formatDuration(durationMs) {
  const seconds = Math.max(0, Math.round(Number(durationMs) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes} 分 ${String(seconds % 60).padStart(2, "0")} 秒`;
}

function localDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const valueFor = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
}

function dateFromDayKey(key) {
  const match = String(key || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)) : new Date(NaN);
}

function shiftDay(key, amount) {
  const date = dateFromDayKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function addLocalTimeActivity(lessonId, durationMs, date = localDayKey()) {
  const amount = Math.max(0, Math.round(Number(durationMs) || 0));
  if (!amount || !getLesson(lessonId) || !date) return;
  const row = state.timeActivity.find((item) => item.lessonId === lessonId && item.date === date);
  if (row) row.durationMs += amount;
  else state.timeActivity.push({ lessonId, date, durationMs: amount });
  state.timeActivity = normalizeTimeActivity(state.timeActivity);
}

function addLocalQuestionCompletion(lessonId, questionId, completedAt = new Date().toISOString()) {
  if (state.questionActivity.some((row) => row.lessonId === lessonId && row.questionId === questionId)) return;
  state.questionActivity = normalizeQuestionActivity([
    ...state.questionActivity,
    { lessonId, questionId, completedAt }
  ]);
}

function captureClockElapsed({ restart = false } = {}) {
  if (!state.lessonClockStartedAt || !state.lessonId) return;
  const elapsed = Math.max(0, Math.round(performance.now() - state.lessonClockStartedAt));
  const record = lessonState(state.lessonId);
  if (elapsed > 0) {
    record.durationMs += elapsed;
    record.updatedAt = new Date().toISOString();
    addLocalTimeActivity(state.lessonId, elapsed);
    markLessonDirty(state.lessonId);
  }
  state.lessonClockStartedAt = restart && !idleBreakIsPaused() ? performance.now() : 0;
}

function pauseClock() {
  captureClockElapsed();
}

function startClock() {
  if (state.lessonId && !state.lessonClockStartedAt && !idleBreakIsPaused()) state.lessonClockStartedAt = performance.now();
}

function renderAppShell() {
  document.title = `Common Expression 常用語 · ${SYSTEM.titleZh} ${SYSTEM.titleEn}｜EdmundEducation`;
  const description = `${SYSTEM.descriptionZh} ${SYSTEM.descriptionEn}`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);

  document.querySelector("[data-system-title-small]").innerHTML = `Common Expression<br>常用語${escapeHtml(SYSTEM.titleZh)} ${escapeHtml(SYSTEM.titleEn)}`;
  document.querySelector("[data-edmund-system-switcher]").dataset.system = SYSTEM.navId;

  const app = document.querySelector("[data-common-expression-app]");
  app.innerHTML = `
    <section class="view" data-view="login">
      <div class="login-layout">
        <article class="login-hero glass-panel">
          <div class="hero-copy">
            <p class="eyebrow">${escapeHtml(SYSTEM.eyebrow)}</p>
            <p class="student-label">(學生使用)</p>
            <h1>Common Expression<br><span>常用語${escapeHtml(SYSTEM.titleZh)} ${escapeHtml(SYSTEM.titleEn)}</span></h1>
            <p>${escapeHtml(SYSTEM.descriptionZh)}<br>${escapeHtml(SYSTEM.descriptionEn)}</p>
          </div>
        </article>
        <section class="login-panel glass-panel" aria-labelledby="common-expression-login-title">
          <div class="login-heading">
            <span class="section-number">01</span>
            <div>
              <p class="eyebrow">STUDENT LOGIN</p>
              <h2 id="common-expression-login-title">登入學習系統</h2>
              <p>請輸入您的學生帳戶資料。</p>
            </div>
          </div>
          <form class="login-form" data-login-form novalidate>
            <label class="field"><span>用戶名稱</span><input name="username" type="text" autocomplete="username" maxlength="100" required placeholder="輸入用戶名稱"></label>
            <label class="field"><span>密碼</span><span class="password-field"><input name="password" type="password" autocomplete="current-password" maxlength="200" required placeholder="輸入密碼"><button type="button" data-password-toggle aria-pressed="false">顯示</button></span></label>
            <p class="form-status" data-login-status role="status" aria-live="polite"></p>
            <button class="primary-button login-button" type="submit" data-login-button>登入並開始學習</button>
          </form>
          <p class="account-note">請輸入您的學生帳戶資料。</p>
        </section>
      </div>
    </section>

    <section class="view" data-view="dashboard" hidden>
      <section class="dashboard-hero glass-panel">
        <div>
          <p class="eyebrow">${escapeHtml(SYSTEM.eyebrow)}</p>
          <h1>Common Expression<br><span class="common-expression-title-secondary">常用語${escapeHtml(SYSTEM.titleZh)} ${escapeHtml(SYSTEM.titleEn)}</span></h1>
          <p data-dashboard-welcome></p>
        </div>
        <div class="dashboard-metrics">
          <article class="metric-card"><strong data-lesson-count>0</strong><span>已開放課題</span></article>
          <article class="metric-card"><strong data-question-total>0</strong><span>已完成題目</span></article>
          <article class="metric-card"><strong data-time-total>0 分 00 秒</strong><span>累計練習時間</span></article>
        </div>
      </section>
      <section class="dashboard-toolbar glass-panel">
        <p>每個課題包括雙語概念、完整用法、重要規則及改寫練習；記錄會跟隨您的學生帳戶。</p>
        <div class="dashboard-toolbar-actions"><button class="secondary-button" type="button" data-open-bookmarks>☆ 我的書簽</button><button class="secondary-button" type="button" data-toggle-progress aria-expanded="false">查看練習進展</button></div>
      </section>
      <section class="common-progress-panel glass-panel" data-progress-panel hidden>
        <div class="common-progress-heading"><div><p class="eyebrow">LEARNING PROGRESS</p><h2>練習進展</h2><p>查看每日完成題數及練習時間。按圖表上的日期可查看當日詳情。</p></div><a class="secondary-button common-progress-full-link" href="student-progress.html">全面英文能力發展進度表 →</a></div>
        <article class="common-progress-card">
          <div class="common-progress-card-heading"><div><h3>每日完成題數</h3><p>Questions completed by date</p></div><button class="secondary-button common-cumulative-toggle" type="button" data-toggle-cumulative aria-pressed="false">顯示累積總數</button></div>
          <div class="common-progress-range" data-question-range-buttons></div>
          <div class="common-progress-stats"><span><strong data-question-period-total>0</strong>本時段完成</span><span><strong data-question-all-total>0</strong>累計完成</span><span><strong data-question-active-days>0</strong>活躍日數</span></div>
          <div class="common-chart-scroll"><svg class="common-progress-chart" data-question-chart viewBox="0 0 900 320" role="img" aria-label="每日完成題數圖表"></svg></div>
          <div class="common-progress-day-panel" data-question-day-panel hidden><div class="common-progress-day-heading"><h4 data-question-day-title></h4><button class="text-button" type="button" data-close-question-day>關閉</button></div><div data-question-day-list></div></div>
        </article>
        <article class="common-progress-card">
          <div class="common-progress-card-heading"><div><h3>每日練習時間</h3><p>Time spent by date</p></div></div>
          <div class="common-progress-range" data-time-range-buttons></div>
          <div class="common-progress-stats"><span><strong data-time-period-total>0 分 00 秒</strong>本時段時間</span><span><strong data-time-all-total>0 分 00 秒</strong>累計時間</span><span><strong data-time-active-days>0</strong>活躍日數</span></div>
          <div class="common-chart-scroll"><svg class="common-progress-chart" data-time-chart viewBox="0 0 900 320" role="img" aria-label="每日練習時間圖表"></svg></div>
          <div class="common-progress-day-panel" data-time-day-panel hidden><div class="common-progress-day-heading"><h4 data-time-day-title></h4><button class="text-button" type="button" data-close-time-day>關閉</button></div><div data-time-day-list></div></div>
        </article>
      </section>
      <div class="lesson-grid" data-lesson-grid></div>
    </section>

    <section class="view" data-view="lesson" hidden>
      <div class="lesson-shell">
        <section class="lesson-heading glass-panel">
          <div class="lesson-heading-top">
            <div><p class="eyebrow" data-lesson-kicker></p><h1 data-lesson-title></h1><p data-lesson-summary></p><div class="lesson-meta" data-lesson-meta></div></div>
            <div class="lesson-card-actions"><button class="star-button" type="button" data-current-lesson-bookmark aria-label="收藏課題">☆</button><button class="secondary-button" type="button" data-back-dashboard>返回學習首頁</button></div>
          </div>
        </section>
        <nav class="lesson-tabs glass-panel" data-lesson-tabs aria-label="課題內容"></nav>
        <section class="lesson-content glass-panel" data-lesson-content></section>
      </div>
    </section>

    <section class="view" data-view="exercise" hidden>
      <div class="exercise-shell">
        <section class="exercise-heading glass-panel">
          <div class="exercise-heading-top"><div><p class="eyebrow">COMMON EXPRESSION PRACTICE</p><h1 data-exercise-title></h1><p data-exercise-instruction></p></div><button class="secondary-button" type="button" data-back-lesson>返回課題內容</button></div>
          <div class="exercise-progress"><div class="progress-track"><i data-exercise-progress-bar></i></div><strong data-exercise-progress-label></strong></div>
        </section>
        <section class="question-list" data-question-list></section>
        <section class="exercise-submit-bar glass-panel"><div><strong data-exercise-draft-status>答案會先保存在此裝置</strong><p>您可提交已填寫的答案，或完成全部題目後一次提交。</p></div><div class="exercise-submit-actions"><button class="secondary-button" type="button" data-save-drafts>儲存草稿</button><button class="secondary-button" type="button" data-submit-partial>提交已填答案</button><button class="primary-button" type="button" data-submit-all>提交全部答案</button></div></section>
      </div>
    </section>

    <section class="view" data-view="bookmarks" hidden>
      <section class="bookmark-panel glass-panel">
        <div class="lesson-heading-top"><div><p class="eyebrow">SAVED LESSONS</p><h1>我的書簽</h1><p>收藏的 Common Expression 課題會跟隨您的帳戶同步。</p></div><button class="secondary-button" type="button" data-bookmarks-back>返回學習首頁</button></div>
        <div class="bookmark-list" data-bookmark-list></div>
      </section>
    </section>`;
}

renderAppShell();

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  dashboardButton: document.querySelector("[data-dashboard-button]"),
  logoutButton: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginStatus: document.querySelector("[data-login-status]"),
  loginButton: document.querySelector("[data-login-button]"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  dashboardWelcome: document.querySelector("[data-dashboard-welcome]"),
  lessonCount: document.querySelector("[data-lesson-count]"),
  questionTotal: document.querySelector("[data-question-total]"),
  timeTotal: document.querySelector("[data-time-total]"),
  progressPanel: document.querySelector("[data-progress-panel]"),
  progressToggle: document.querySelector("[data-toggle-progress]"),
  questionRangeButtons: document.querySelector("[data-question-range-buttons]"),
  timeRangeButtons: document.querySelector("[data-time-range-buttons]"),
  cumulativeToggle: document.querySelector("[data-toggle-cumulative]"),
  questionChart: document.querySelector("[data-question-chart]"),
  timeChart: document.querySelector("[data-time-chart]"),
  questionPeriodTotal: document.querySelector("[data-question-period-total]"),
  questionAllTotal: document.querySelector("[data-question-all-total]"),
  questionActiveDays: document.querySelector("[data-question-active-days]"),
  timePeriodTotal: document.querySelector("[data-time-period-total]"),
  timeAllTotal: document.querySelector("[data-time-all-total]"),
  timeActiveDays: document.querySelector("[data-time-active-days]"),
  questionDayPanel: document.querySelector("[data-question-day-panel]"),
  questionDayTitle: document.querySelector("[data-question-day-title]"),
  questionDayList: document.querySelector("[data-question-day-list]"),
  timeDayPanel: document.querySelector("[data-time-day-panel]"),
  timeDayTitle: document.querySelector("[data-time-day-title]"),
  timeDayList: document.querySelector("[data-time-day-list]"),
  lessonGrid: document.querySelector("[data-lesson-grid]"),
  lessonKicker: document.querySelector("[data-lesson-kicker]"),
  lessonTitle: document.querySelector("[data-lesson-title]"),
  lessonSummary: document.querySelector("[data-lesson-summary]"),
  lessonMeta: document.querySelector("[data-lesson-meta]"),
  lessonTabs: document.querySelector("[data-lesson-tabs]"),
  lessonContent: document.querySelector("[data-lesson-content]"),
  currentBookmark: document.querySelector("[data-current-lesson-bookmark]"),
  exerciseTitle: document.querySelector("[data-exercise-title]"),
  exerciseInstruction: document.querySelector("[data-exercise-instruction]"),
  exerciseProgressBar: document.querySelector("[data-exercise-progress-bar]"),
  exerciseProgressLabel: document.querySelector("[data-exercise-progress-label]"),
  questionList: document.querySelector("[data-question-list]"),
  exerciseDraftStatus: document.querySelector("[data-exercise-draft-status]"),
  bookmarkList: document.querySelector("[data-bookmark-list]"),
  toast: document.querySelector("[data-toast]")
};

function setConnection(label, status) {
  elements.connection.textContent = label;
  elements.connection.dataset.state = status;
}

function setFormStatus(message = "", status = "") {
  elements.loginStatus.textContent = message;
  elements.loginStatus.dataset.state = status;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

function showView(viewName, { scroll = true } = {}) {
  if (state.currentView === "exercise" && viewName !== "exercise") {
    window.clearTimeout(state.draftTimer);
    updateDraftsFromFields();
    pauseClock();
  }
  state.currentView = viewName;
  for (const view of elements.views) view.hidden = view.dataset.view !== viewName;
  const loggedIn = Boolean(state.user && state.token);
  elements.userPill.hidden = !loggedIn;
  elements.dashboardButton.hidden = !loggedIn || viewName === "dashboard";
  elements.logoutButton.hidden = !loggedIn;
  if (loggedIn) elements.userPill.textContent = state.user.name;
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function initialiseSupabaseClient() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  let storage;
  try { storage = window.sessionStorage; } catch { storage = undefined; }
  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: Boolean(storage), ...(storage ? { storage } : {}), autoRefreshToken: true, detectSessionInUrl: false }
  });
  return state.supabase;
}

async function ensureSupabaseSession() {
  const client = initialiseSupabaseClient();
  const current = await client.auth.getSession();
  if (current.error) throw current.error;
  if (current.data?.session?.user?.id) return client;
  const signIn = await client.auth.signInAnonymously();
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全登入連線。");
  return client;
}

async function rpc(name, args) {
  const client = await ensureSupabaseSession();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function saveSession() {
  try {
    if (!state.user || !state.token) sessionStorage.removeItem(SESSION_KEY);
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token, role: "student" }));
  } catch { /* Storage is a convenience, not the authority. */ }
}

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function clearSession() {
  pauseClock();
  state.user = null;
  state.token = "";
  state.lessonId = "";
  state.states.clear();
  state.dirtyLessonIds.clear();
  state.bookmarks.clear();
  state.questionActivity = [];
  state.timeActivity = [];
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore unavailable storage. */ }
}

function localSnapshotKey() {
  return `${LOCAL_STATE_KEY}:${state.user?.id || state.user?.name || "unknown"}`;
}

function userPreferenceKey(baseKey) {
  return `${baseKey}:${state.user?.id || state.user?.name || "unknown"}`;
}

function loadProgressPreferences() {
  try {
    state.progressPanelExpanded = localStorage.getItem(userPreferenceKey(PROGRESS_PANEL_PREFERENCE_KEY)) === "true";
    state.showCumulativeProgress = localStorage.getItem(userPreferenceKey(CUMULATIVE_PROGRESS_PREFERENCE_KEY)) === "true";
  } catch {
    state.progressPanelExpanded = false;
    state.showCumulativeProgress = false;
  }
}

function saveProgressPreference(baseKey, value) {
  try { localStorage.setItem(userPreferenceKey(baseKey), String(Boolean(value))); } catch { /* Optional UI preference. */ }
}

function writeLocalSnapshot() {
  if (!state.user) return;
  try {
    localStorage.setItem(localSnapshotKey(), JSON.stringify({
      states: [...state.states.values()],
      dirtyLessonIds: [...state.dirtyLessonIds],
      bookmarks: [...state.bookmarks],
      questionActivity: state.questionActivity,
      timeActivity: state.timeActivity,
      savedAt: new Date().toISOString()
    }));
  } catch { /* Server persistence remains authoritative. */ }
}

function readLocalSnapshot() {
  if (!state.user) return null;
  try { return JSON.parse(localStorage.getItem(localSnapshotKey()) || "null"); } catch { return null; }
}

function markLessonDirty(lessonId) {
  if (getLesson(lessonId)) state.dirtyLessonIds.add(lessonId);
}

function clearLessonDirty(lessonId, expectedUpdatedAt) {
  const current = state.states.get(lessonId);
  if (!current || current.updatedAt === expectedUpdatedAt) state.dirtyLessonIds.delete(lessonId);
}

function applySnapshot(payload) {
  state.states.clear();
  state.dirtyLessonIds.clear();
  state.bookmarks.clear();
  state.questionActivity = normalizeQuestionActivity(payload?.questionActivity || payload?.question_activity);
  state.timeActivity = normalizeTimeActivity(payload?.timeActivity || payload?.time_activity);
  for (const row of Array.isArray(payload?.states) ? payload.states : []) {
    const normalized = normalizeLessonState(row);
    if (normalized) state.states.set(normalized.lessonId, normalized);
  }
  for (const lessonId of Array.isArray(payload?.bookmarks) ? payload.bookmarks : []) {
    if (getLesson(String(lessonId))) state.bookmarks.add(String(lessonId));
  }
  const local = readLocalSnapshot();
  state.questionActivity = normalizeQuestionActivity([
    ...state.questionActivity,
    ...(Array.isArray(local?.questionActivity) ? local.questionActivity : [])
  ]);
  state.timeActivity = normalizeTimeActivity([
    ...state.timeActivity,
    ...(Array.isArray(local?.timeActivity) ? local.timeActivity : [])
  ]);
  const recoveredDirtyIds = new Set(Array.isArray(local?.dirtyLessonIds) ? local.dirtyLessonIds : []);
  for (const row of Array.isArray(local?.states) ? local.states : []) {
    const normalized = normalizeLessonState({ lesson_id: row.lessonId, state: row, duration_ms: row.durationMs });
    const server = normalized && state.states.get(normalized.lessonId);
    if (!normalized) continue;
    if (recoveredDirtyIds.has(normalized.lessonId) || localRecordNeedsSync(server, normalized)) {
      state.dirtyLessonIds.add(normalized.lessonId);
    }
    state.states.set(normalized.lessonId, mergeLessonStates(server, normalized));
  }
  for (const record of state.states.values()) {
    for (const [questionId, answer] of Object.entries(record.answers || {})) {
      if (Number(answer.attempts || 0) > 0 && !state.questionActivity.some((row) => row.lessonId === record.lessonId && row.questionId === questionId)) {
        addLocalQuestionCompletion(record.lessonId, questionId, answer.updatedAt || record.updatedAt || new Date().toISOString());
      }
    }
    if (record.durationMs > 0 && !state.timeActivity.some((row) => row.lessonId === record.lessonId)) {
      state.timeActivity = normalizeTimeActivity([
        ...state.timeActivity,
        { lessonId: record.lessonId, date: localDayKey(record.updatedAt || new Date()), durationMs: record.durationMs }
      ]);
    }
  }
  if (state.dirtyLessonIds.size) retryDirtyLessonStates().catch((error) => console.warn("Common Expression recovery sync failed", error));
}

async function loadSnapshot(token = state.token) {
  const payload = await rpc(String(CONFIG.snapshotRpc), { p_token: token, p_system_key: SYSTEM_KEY });
  if (!payload?.student?.id || !payload?.student?.name) throw new Error("登入時段已失效，請重新登入。");
  state.user = { id: String(payload.student.id), name: String(payload.student.name), role: "student" };
  state.token = String(token);
  loadProgressPreferences();
  applySnapshot(payload);
  saveSession();
  writeLocalSnapshot();
  return payload;
}

async function studentLogin(username, password) {
  const data = await rpc(String(CONFIG.studentLoginRpc || "flashcard_student_login"), { p_name: username, p_password: password });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.session_token) return false;
  state.token = String(row.session_token);
  state.user = { id: String(row.id || ""), name: String(row.name || username), role: "student" };
  window.EdmundSystemNav?.rememberStudentSession({ token: state.token, id: state.user.id, name: state.user.name, role: "student" });
  await loadSnapshot(state.token);
  return true;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(elements.loginForm);
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  if (!username || !password) return setFormStatus("請輸入用戶名稱及密碼。", "error");
  elements.loginButton.disabled = true;
  setFormStatus("正在核對帳戶…");
  try {
    if (!await studentLogin(username, password)) throw new Error("用戶名稱或密碼不正確。");
    elements.loginForm.reset();
    setFormStatus("");
    setConnection("已安全連接", "online");
    if (!openRequestedLesson()) openDashboard();
    showToast(`您好，${state.user.name}！`);
  } catch (error) {
    console.warn("Common Expression login failed", error);
    setFormStatus(error.message || "登入失敗，請稍後再試。", "error");
    setConnection("連線失敗", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function restoreSession() {
  const universal = window.EdmundSystemNav?.getStudentSession?.();
  const stored = readSession();
  const candidate = universal?.role === "student" ? universal : stored?.role === "student" ? stored : null;
  if (!candidate?.token) return false;
  try {
    await loadSnapshot(String(candidate.token));
    window.EdmundSystemNav?.rememberStudentSession({ token: state.token, id: state.user.id, name: state.user.name, role: "student" });
    setConnection("已安全連接", "online");
    if (!openRequestedLesson()) openDashboard();
    return true;
  } catch (error) {
    console.warn("Common Expression session restore failed", error);
    clearSession();
    return false;
  }
}

async function logout() {
  try { await flushCurrentState(); } catch { /* Local snapshot already contains the newest answer. */ }
  window.EdmundSystemNav?.forgetStudentSession();
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Anonymous Auth cleanup is best-effort. */ }
  setConnection("已連線", "online");
  showView("login");
}

function rangeStartKey(rangeKey, datedRows) {
  const today = localDayKey();
  if (rangeKey === "week") return shiftDay(today, -6);
  if (rangeKey === "month") return shiftDay(today, -29);
  if (rangeKey === "half-year") return shiftDay(today, -181);
  if (rangeKey === "year") return shiftDay(today, -364);
  if (rangeKey === "ytd") return `${today.slice(0, 4)}-01-01`;
  const earliest = datedRows.map((row) => row.date).filter(Boolean).sort()[0];
  return rangeKey === "all" && earliest ? earliest : shiftDay(today, -6);
}

function dayKeysBetween(start, end) {
  const keys = [];
  for (let key = start; key <= end && keys.length < 3700; key = shiftDay(key, 1)) keys.push(key);
  return keys;
}

function questionProgressSeries(rangeKey = state.progressRange) {
  const rows = state.questionActivity.map((row) => ({ ...row, date: localDayKey(row.completedAt) })).filter((row) => row.date);
  const today = localDayKey();
  const start = rangeStartKey(rangeKey, rows);
  const buckets = new Map();
  let before = 0;
  for (const row of rows) {
    if (row.date < start) before += 1;
    else if (row.date <= today) buckets.set(row.date, (buckets.get(row.date) || 0) + 1);
  }
  let cumulative = before;
  const points = dayKeysBetween(start, today).map((date) => {
    const total = buckets.get(date) || 0;
    cumulative += total;
    return { date, total, cumulative };
  });
  return {
    rows,
    points,
    periodTotal: points.reduce((sum, point) => sum + point.total, 0),
    allTotal: rows.filter((row) => row.date <= today).length,
    activeDays: points.filter((point) => point.total > 0).length
  };
}

function timeProgressSeries(rangeKey = state.timeProgressRange) {
  const rows = state.timeActivity.map((row) => ({ ...row, date: String(row.date || "") })).filter((row) => row.date);
  const today = localDayKey();
  const start = rangeStartKey(rangeKey, rows);
  const buckets = new Map();
  for (const row of rows) {
    if (row.date >= start && row.date <= today) buckets.set(row.date, (buckets.get(row.date) || 0) + row.durationMs);
  }
  const points = dayKeysBetween(start, today).map((date) => ({ date, total: buckets.get(date) || 0 }));
  return {
    rows,
    points,
    periodTotal: points.reduce((sum, point) => sum + point.total, 0),
    allTotal: rows.filter((row) => row.date <= today).reduce((sum, row) => sum + row.durationMs, 0),
    activeDays: points.filter((point) => point.total > 0).length
  };
}

function compactChartDate(key) {
  const date = dateFromDayKey(key);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-HK", { timeZone: "UTC", month: "short", day: "numeric" })
    : key;
}

function progressChartSvg(series, { type = "question", cumulative = false } = {}) {
  const width = 900;
  const height = 320;
  const edge = { left: 62, right: 28, top: 30, bottom: 54 };
  const chartWidth = width - edge.left - edge.right;
  const chartHeight = height - edge.top - edge.bottom;
  const dailyValue = (point) => type === "time" ? point.total / 60000 : point.total;
  const maximum = Math.max(5, ...series.points.flatMap((point) => [dailyValue(point), ...(cumulative ? [point.cumulative || 0] : [])]));
  const yMax = Math.max(5, Math.ceil(maximum / 5) * 5);
  const xFor = (index) => edge.left + (chartWidth * index / Math.max(series.points.length - 1, 1));
  const yFor = (value) => edge.top + chartHeight - chartHeight * value / yMax;
  const dailyCoordinates = series.points.map((point, index) => ({ point, x: xFor(index), y: yFor(dailyValue(point)) }));
  const cumulativeCoordinates = cumulative ? series.points.map((point, index) => ({ point, x: xFor(index), y: yFor(point.cumulative || 0) })) : [];
  const polyline = (rows) => rows.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const gridValues = [...new Set([0, Math.round(yMax / 2), yMax])];
  const grid = gridValues.map((value) => `<line x1="${edge.left}" y1="${yFor(value)}" x2="${width - edge.right}" y2="${yFor(value)}" class="common-chart-grid"/><text x="${edge.left - 12}" y="${yFor(value) + 4}" text-anchor="end" class="common-chart-axis-label">${value}</text>`).join("");
  const labelIndexes = series.points.length ? [...new Set([0, Math.floor((series.points.length - 1) / 2), series.points.length - 1])] : [];
  const labels = labelIndexes.map((index) => `<text x="${xFor(index)}" y="${height - 18}" text-anchor="middle" class="common-chart-axis-label">${escapeHtml(compactChartDate(series.points[index].date))}</text>`).join("");
  const hoverRows = dailyCoordinates.map(({ point, x, y }) => {
    const valueLabel = type === "time" ? formatDuration(point.total) : `${point.total} 題`;
    const attrs = point.total > 0 ? `tabindex="0" role="button" data-common-${type}-day="${point.date}" aria-label="${point.date}，${escapeHtml(valueLabel)}"` : 'aria-hidden="true"';
    const boxX = Math.min(Math.max(x - 72, edge.left), width - edge.right - 144);
    const boxY = Math.max(edge.top + 4, y - 55);
    return `<g class="common-chart-hover" ${attrs}><circle class="common-chart-hit" cx="${x}" cy="${y}" r="16"/><circle class="common-chart-dot" cx="${x}" cy="${y}" r="4.5"/><g class="common-chart-tooltip"><line x1="${x}" y1="${edge.top}" x2="${x}" y2="${height - edge.bottom}"/><rect x="${boxX}" y="${boxY}" width="144" height="42" rx="8"/><text x="${boxX + 10}" y="${boxY + 17}">${escapeHtml(valueLabel)}</text><text x="${boxX + 10}" y="${boxY + 32}">${point.date}</text></g></g>`;
  }).join("");
  const cumulativeRows = cumulativeCoordinates.map(({ point, x, y }) => `<circle class="common-chart-cumulative-dot" cx="${x}" cy="${y}" r="3.5"><title>${escapeHtml(point.date)}：累積 ${escapeHtml(point.cumulative)} 題</title></circle>`).join("");
  const emptyLabel = series.periodTotal ? "" : `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="common-chart-empty">這個時段暫時未有紀錄</text>`;
  return `<rect width="${width}" height="${height}" class="common-chart-background"/>${grid}<line x1="${edge.left}" y1="${edge.top}" x2="${edge.left}" y2="${height - edge.bottom}" class="common-chart-axis"/><line x1="${edge.left}" y1="${height - edge.bottom}" x2="${width - edge.right}" y2="${height - edge.bottom}" class="common-chart-axis"/><polyline class="common-chart-daily-line common-chart-${type}-line" points="${polyline(dailyCoordinates)}"/>${cumulative ? `<polyline class="common-chart-cumulative-line" points="${polyline(cumulativeCoordinates)}"/>${cumulativeRows}` : ""}${hoverRows}${labels}<text x="${edge.left}" y="20" class="common-chart-title">${type === "time" ? "分鐘" : "完成題數"}</text>${emptyLabel}`;
}

function progressRangeButtons(selected, attribute) {
  return PROGRESS_RANGES.map(([key, label]) => `<button type="button" data-${attribute}="${key}" aria-pressed="${selected === key}">${label}</button>`).join("");
}

function renderQuestionDayPanel() {
  const date = state.selectedProgressDay;
  elements.questionDayPanel.hidden = !date;
  if (!date) return;
  const rows = state.questionActivity.filter((row) => localDayKey(row.completedAt) === date);
  elements.questionDayTitle.textContent = `${date} 完成題目（${rows.length} 題）`;
  elements.questionDayList.innerHTML = rows.length ? rows.map((row) => {
    const lesson = getLesson(row.lessonId);
    const question = lesson?.questions.find((item) => item.id === row.questionId);
    const number = Math.max(1, lesson?.questions.findIndex((item) => item.id === row.questionId) + 1);
    const correct = lessonState(row.lessonId).answers[row.questionId]?.correct === true;
    return `<div class="common-progress-day-row"><strong>${escapeHtml(lesson?.titleEn || row.lessonId)} · Question ${number}</strong><span>${escapeHtml(question?.promptEn || row.questionId)}</span><em class="${correct ? "is-correct" : ""}">${correct ? "答對" : "待改正"}</em></div>`;
  }).join("") : `<p>這一天暫時未有完成題目。</p>`;
}

function renderTimeDayPanel() {
  const date = state.selectedTimeProgressDay;
  elements.timeDayPanel.hidden = !date;
  if (!date) return;
  const rows = state.timeActivity.filter((row) => row.date === date);
  const total = rows.reduce((sum, row) => sum + row.durationMs, 0);
  elements.timeDayTitle.textContent = `${date} 練習時間（${formatDuration(total)}）`;
  elements.timeDayList.innerHTML = rows.length ? rows.map((row) => `<div class="common-progress-day-row"><strong>${escapeHtml(getLesson(row.lessonId)?.titleEn || row.lessonId)}</strong><span>${escapeHtml(getLesson(row.lessonId)?.titleZh || "Common Expression 練習")}</span><em class="is-time">${escapeHtml(formatDuration(row.durationMs))}</em></div>`).join("") : `<p>這一天暫時未有練習時間紀錄。</p>`;
}

function renderProgressDashboard() {
  elements.progressPanel.hidden = !state.progressPanelExpanded;
  elements.progressToggle.textContent = state.progressPanelExpanded ? "收起練習進展" : "查看練習進展";
  elements.progressToggle.setAttribute("aria-expanded", String(state.progressPanelExpanded));
  elements.cumulativeToggle.textContent = state.showCumulativeProgress ? "隱藏累積總數" : "顯示累積總數";
  elements.cumulativeToggle.setAttribute("aria-pressed", String(state.showCumulativeProgress));
  elements.questionRangeButtons.innerHTML = progressRangeButtons(state.progressRange, "question-progress-range");
  elements.timeRangeButtons.innerHTML = progressRangeButtons(state.timeProgressRange, "time-progress-range");
  if (!state.progressPanelExpanded) return;
  const questions = questionProgressSeries();
  const time = timeProgressSeries();
  elements.questionPeriodTotal.textContent = String(questions.periodTotal);
  elements.questionAllTotal.textContent = String(questions.allTotal);
  elements.questionActiveDays.textContent = String(questions.activeDays);
  elements.timePeriodTotal.textContent = formatDuration(time.periodTotal);
  elements.timeAllTotal.textContent = formatDuration(time.allTotal);
  elements.timeActiveDays.textContent = String(time.activeDays);
  elements.questionChart.innerHTML = progressChartSvg(questions, { type: "question", cumulative: state.showCumulativeProgress });
  elements.timeChart.innerHTML = progressChartSvg(time, { type: "time" });
  renderQuestionDayPanel();
  renderTimeDayPanel();
}

function renderDashboard() {
  const questionCount = totalCompletedQuestions();
  const duration = SYSTEM.lessons.reduce((sum, lesson) => sum + currentDurationMs(lesson.id), 0);
  elements.dashboardWelcome.textContent = `${state.user.name}，請選擇一個課題開始學習。`;
  elements.lessonCount.textContent = String(SYSTEM.lessons.length);
  elements.questionTotal.textContent = String(questionCount);
  elements.timeTotal.textContent = formatDuration(duration);
  renderProgressDashboard();
  if (!SYSTEM.lessons.length) {
    elements.lessonGrid.innerHTML = `<article class="empty-library"><div class="empty-library-inner"><span class="empty-library-mark" aria-hidden="true">✦</span><p class="eyebrow">REVIEWED CONTENT LIBRARY</p><h2>${escapeHtml(SYSTEM.titleZh)}課題庫骨架已完成</h2><p>目前尚未加入課題。新教材完成內容整理及審核後，會使用同一個學習、書簽及雲端進度架構在此顯示。</p></div></article>`;
    return;
  }
  elements.lessonGrid.innerHTML = SYSTEM.lessons.map((lesson) => {
    const completed = completedCount(lesson.id);
    const percent = Math.round((completed / lesson.questions.length) * 100);
    const bookmarked = state.bookmarks.has(lesson.id);
    const complete = isLessonComplete(lesson);
    return `<article class="lesson-card${complete ? " is-complete" : ""}" data-lesson-id="${escapeHtml(lesson.id)}">
      <span class="lesson-card-number">COMMON EXPRESSION ${String(lesson.order).padStart(2, "0")}</span>
      <h2>${escapeHtml(lesson.titleEn)}</h2><h3>${escapeHtml(lesson.titleZh)}</h3>
      <p>${escapeHtml(lesson.summaryZh)}</p>
      <div class="lesson-card-footer"><div class="progress-track" title="${completed} / ${lesson.questions.length}"><i style="--progress:${percent}%"></i></div><strong>${complete ? "已完成" : `${completed}/${lesson.questions.length}`}</strong><div class="lesson-card-actions"><button class="star-button" type="button" data-toggle-bookmark="${escapeHtml(lesson.id)}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? "移除課題書簽" : "收藏課題"}">${bookmarked ? "★" : "☆"}</button><button class="round-button" type="button" data-open-lesson="${escapeHtml(lesson.id)}" aria-label="開啟 ${escapeHtml(lesson.titleEn)}">→</button></div></div>
    </article>`;
  }).join("");
}

function openDashboard() {
  pauseClock();
  renderDashboard();
  const url = new URL(location.href);
  url.searchParams.delete("lesson");
  history.replaceState(null, "", url);
  showView("dashboard");
}

function openRequestedLesson() {
  const lessonId = new URLSearchParams(location.search).get("lesson");
  if (!lessonId || !getLesson(lessonId)) return false;
  openLesson(lessonId);
  return true;
}

function renderLessonHeader(lesson) {
  elements.lessonKicker.textContent = `COMMON EXPRESSION ${String(lesson.order).padStart(2, "0")} · ${lesson.lessonTypeEn}`;
  elements.lessonTitle.textContent = `${lesson.titleEn} · ${lesson.titleZh}`;
  elements.lessonSummary.textContent = lesson.summaryZh;
  elements.lessonMeta.innerHTML = `<span class="tag">${escapeHtml(lesson.level)}</span><span class="tag">${escapeHtml(lesson.lessonTypeZh)}</span><span class="tag">${lesson.questions.length} 題練習</span><span class="tag">來源 ${lesson.source.pageCount} 頁</span>`;
  const bookmarked = state.bookmarks.has(lesson.id);
  elements.currentBookmark.textContent = bookmarked ? "★" : "☆";
  elements.currentBookmark.setAttribute("aria-pressed", String(bookmarked));
  elements.currentBookmark.dataset.lessonId = lesson.id;
}

function renderTabs() {
  elements.lessonTabs.innerHTML = TABS.map(([id, zh, en]) => `<button type="button" role="tab" data-lesson-tab="${id}" aria-selected="${state.lessonTab === id}">${zh}<small>${en}</small></button>`).join("");
}

function renderExamples(lesson) {
  return `<div class="content-intro"><article class="content-card"><p class="eyebrow">MEANING · 意思</p><h3>${escapeHtml(lesson.titleZh)}</h3><p>${escapeHtml(lesson.summaryZh)}</p></article><article class="content-card"><p class="eyebrow">CORE EXPRESSION</p><h3>${escapeHtml(lesson.titleEn)}</h3><p>${escapeHtml(lesson.summaryEn)}</p></article></div><div style="margin-top:18px">${lesson.examples.map((example) => `<div class="example-transform"><div class="example-side"><strong>Original · 原句</strong>${escapeHtml(example.originalEn)}<br><small>${escapeHtml(example.originalZh)}</small></div><span class="example-arrow" aria-hidden="true">→</span><div class="example-side"><strong>Target · 目標句</strong>${escapeHtml(example.targetEn)}<br><small>${escapeHtml(example.targetZh)}</small></div></div>`).join("")}</div>`;
}

function renderBilingualList(rows, label) {
  return `<p class="eyebrow">${escapeHtml(label)}</p><ul class="bilingual-list">${rows.map(([zh, en], index) => `<li><strong>${index + 1}. ${escapeHtml(zh)}</strong><span>${escapeHtml(en)}</span></li>`).join("")}</ul>`;
}

function renderLessonContent() {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  const content = {
    examples: () => renderExamples(lesson),
    benefits: () => renderBilingualList(lesson.benefits, "BENEFITS · 學習好處"),
    reminders: () => renderBilingualList(lesson.reminders, "IMPORTANT REMINDERS · 重要規則"),
    usage: () => `<p class="eyebrow">FULL PRACTICAL USAGE LIST · 完整實用用法</p><div class="usage-list">${lesson.usageGroups.map(([title, example, explanation]) => `<article class="usage-card"><div><h3>${escapeHtml(title)}</h3><p class="usage-example">${escapeHtml(example)}</p><p>${escapeHtml(explanation)}</p></div></article>`).join("")}</div>`,
    summary: () => `<p class="eyebrow">BEST TEACHING SUMMARY · 教學總結</p><ul class="summary-list">${lesson.summaryPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul><div class="exercise-invite" style="margin-top:24px"><div><strong>${completedCount(lesson.id)} / ${lesson.questions.length} 題已完成</strong><p>${escapeHtml(lesson.exerciseInstructionZh)}</p></div><button class="primary-button" type="button" data-start-exercise>${completedCount(lesson.id) ? "繼續練習" : "開始練習"} →</button></div>`
  };
  elements.lessonContent.innerHTML = (content[state.lessonTab] || content.examples)();
}

function openLesson(lessonId, tab = state.lessonTab || "examples") {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  pauseClock();
  state.lessonId = lesson.id;
  state.lessonTab = TABS.some(([id]) => id === tab) ? tab : "examples";
  renderLessonHeader(lesson);
  renderTabs();
  renderLessonContent();
  const url = new URL(location.href);
  url.searchParams.set("lesson", lesson.id);
  history.replaceState(null, "", url);
  showView("lesson");
}

function openExercise() {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  elements.exerciseTitle.textContent = `${lesson.titleEn} · 句子練習`;
  elements.exerciseInstruction.textContent = lesson.exerciseInstructionZh;
  renderQuestionList();
  showView("exercise");
  startClock();
}

function answerHasCurrentFeedback(saved) {
  if (!saved?.attempts) return false;
  if (saved.correct) return true;
  return normalizeAnswer(saved.answer) === normalizeAnswer(saved.checkedAnswer);
}

function feedbackMarkup(correct, question, answer) {
  const reviewed = feedbackAnswerMarkup(question, answer);
  const answerLabel = dialogueQuestionParts(question) ? "參考 B 回應" : "參考答案";
  return `<div class="feedback-panel" data-state="${correct ? "correct" : "incorrect"}">${correct
    ? `<h3>✓ 答案正確</h3><p>${reviewed.comparison.typoCount === 1 ? "句式正確；一個輕微拼寫已獲接納，請留意黃色部分。" : "您已保留原句意思，並自然使用本課目標表達。"}</p>${reviewed.comparison.typoCount === 1 ? `<p class="answer-key">${answerLabel}：${reviewed.html}</p>` : ""}`
    : `<h3>請再留意目標句式</h3><p>您的答案：${escapeHtml(answer || "（未輸入）")}</p><p class="answer-key">${answerLabel}：${reviewed.html}</p><p>${escapeHtml(question.answerZh)}</p>`}</div>`;
}

function renderQuestionList({ preserveScroll = false } = {}) {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  const scrollPosition = preserveScroll ? window.scrollY : null;
  const complete = completedCount(lesson.id);
  const percent = Math.round((complete / lesson.questions.length) * 100);
  elements.exerciseProgressBar.style.setProperty("--progress", `${percent}%`);
  elements.exerciseProgressLabel.textContent = `${complete} / ${lesson.questions.length} 已完成`;
  elements.questionList.innerHTML = lesson.questions.map((question, index) => {
    const saved = lessonState(lesson.id).answers[question.id] || {};
    const dialogue = dialogueQuestionParts(question);
    const dialogueValues = dialogue ? storedDialogueValues(saved.answer) : null;
    const feedback = answerHasCurrentFeedback(saved) ? feedbackMarkup(saved.correct, question, saved.checkedAnswer || saved.answer) : "";
    const answerFields = dialogue
      ? `<fieldset class="dialogue-answer-fields"><legend>您的改寫答案${saved.correct ? " · 已完成" : ""}</legend><label class="dialogue-answer-row"><strong>A:</strong><textarea class="answer-field" data-answer-field data-dialogue-speaker="a" data-question-id="${escapeHtml(question.id)}" spellcheck="true" autocomplete="off" ${saved.correct ? "readonly" : ""} placeholder="A 回應（可選填）">${escapeHtml(dialogueValues.a)}</textarea></label><label class="dialogue-answer-row"><strong>B:</strong><textarea class="answer-field" data-answer-field data-dialogue-speaker="b" data-question-id="${escapeHtml(question.id)}" spellcheck="true" autocomplete="off" ${saved.correct ? "readonly" : ""} placeholder="B 回應（必須填寫及評核）">${escapeHtml(dialogueValues.b)}</textarea></label><p class="dialogue-answer-note">B 為主要改寫答案；只填 B 亦可提交。只填 A 不會視為已作答。</p></fieldset>`
      : `<label class="field"><span>您的改寫答案${saved.correct ? " · 已完成" : ""}</span><textarea class="answer-field" data-answer-field data-question-id="${escapeHtml(question.id)}" spellcheck="true" autocomplete="off" ${saved.correct ? "readonly" : ""} placeholder="輸入完整的改寫句子…">${escapeHtml(saved.answer || "")}</textarea></label>`;
    return `<article class="question-card glass-panel${saved.correct ? " is-correct" : ""}" data-question-id="${escapeHtml(question.id)}"><div class="question-meta"><span class="question-number">QUESTION ${String(index + 1).padStart(2, "0")} / ${lesson.questions.length}</span>${index === 0 ? `<button class="star-button" type="button" data-question-lesson-bookmark aria-pressed="${state.bookmarks.has(lesson.id)}" aria-label="收藏本課題">${state.bookmarks.has(lesson.id) ? "★" : "☆"}</button>` : ""}</div><p class="prompt-en">${escapeHtml(question.promptEn)}</p><p class="prompt-zh">${escapeHtml(question.promptZh)}</p>${answerFields}<div class="question-inline-actions"><button class="text-button" type="button" data-clear-answer="${escapeHtml(question.id)}" ${saved.correct ? "disabled" : ""}>清除答案</button></div>${feedback}</article>`;
  }).join("");
  elements.exerciseDraftStatus.textContent = state.dirtyLessonIds.has(lesson.id) ? "有尚未同步的答案" : "答案已同步";
  if (scrollPosition !== null) requestAnimationFrame(() => window.scrollTo({ top: scrollPosition }));
}

function updateDraftsFromFields() {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return 0;
  const record = lessonState(lesson.id);
  let changes = 0;
  const now = new Date().toISOString();
  for (const question of lesson.questions) {
    const fields = [...elements.questionList.querySelectorAll(`[data-answer-field][data-question-id="${CSS.escape(question.id)}"]`)];
    if (!fields.length) continue;
    const dialogue = dialogueQuestionParts(question);
    const answer = (dialogue
      ? combinedDialogueValue(
          fields.find((field) => field.dataset.dialogueSpeaker === "a")?.value,
          fields.find((field) => field.dataset.dialogueSpeaker === "b")?.value
        )
      : String(fields[0].value || "")).slice(0, 6000);
    const questionId = question.id;
    const existing = record.answers[questionId] || {};
    if (answer === String(existing.answer || "")) continue;
    record.answers[questionId] = {
      answer,
      checkedAnswer: String(existing.checkedAnswer || ""),
      correct: false,
      attempts: Math.max(0, Number(existing.attempts || 0)),
      updatedAt: now
    };
    changes += 1;
  }
  if (changes) {
    record.updatedAt = now;
    record.completedAt = isLessonComplete(lesson) ? record.completedAt : "";
    markLessonDirty(lesson.id);
    writeLocalSnapshot();
    elements.exerciseDraftStatus.textContent = "草稿已保存在此裝置，尚待雲端同步";
  }
  return changes;
}

async function saveDrafts() {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  updateDraftsFromFields();
  captureClockElapsed({ restart: true });
  try {
    await persistLessonState(lesson.id);
    elements.exerciseDraftStatus.textContent = "草稿已同步";
    showToast("草稿及練習時間已儲存。");
  } catch (error) {
    console.warn("Common Expression draft save failed", error);
    showToast("草稿已保留在此裝置；雲端同步稍後重試。");
  }
}

async function submitAnswers({ all = false } = {}) {
  const lesson = getLesson(state.lessonId);
  if (!lesson) return;
  updateDraftsFromFields();
  const record = lessonState(lesson.id);
  if (all) {
    const firstBlank = lesson.questions.find((question) => record.answers[question.id]?.correct !== true && !answerIsPresent(record.answers[question.id]?.answer, question));
    if (firstBlank) {
      const selector = dialogueQuestionParts(firstBlank)
        ? `[data-answer-field][data-question-id="${CSS.escape(firstBlank.id)}"][data-dialogue-speaker="b"]`
        : `[data-answer-field][data-question-id="${CSS.escape(firstBlank.id)}"]`;
      elements.questionList.querySelector(selector)?.focus();
      showToast(dialogueQuestionParts(firstBlank) ? "提交全部答案前，請先填寫每題的 B 回應。" : "提交全部答案前，請先完成所有未答題目。");
      return;
    }
  }
  const now = new Date().toISOString();
  const targets = lesson.questions.filter((question) => {
    const saved = record.answers[question.id];
    if (!answerIsPresent(saved?.answer, question) || saved?.correct) return false;
    return !saved.attempts || normalizeAnswer(saved.answer) !== normalizeAnswer(saved.checkedAnswer);
  });
  if (!targets.length) {
    showToast(all && isLessonComplete(lesson) ? "本課全部答案已完成。" : "未有新的已填答案需要提交。");
    return;
  }
  let correctCount = 0;
  for (const question of targets) {
    const existing = record.answers[question.id];
    const answer = String(existing.answer || "").trim();
    const correct = questionAnswerComparison(answer, question).correct;
    record.answers[question.id] = {
      answer,
      checkedAnswer: answer,
      correct,
      attempts: Math.min(100, Number(existing.attempts || 0) + 1),
      updatedAt: now
    };
    addLocalQuestionCompletion(lesson.id, question.id, now);
    if (correct) correctCount += 1;
  }
  record.updatedAt = now;
  if (isLessonComplete(lesson) && !record.completedAt) record.completedAt = new Date().toISOString();
  captureClockElapsed({ restart: true });
  markLessonDirty(lesson.id);
  writeLocalSnapshot();
  renderQuestionList({ preserveScroll: true });
  try {
    await persistLessonState(lesson.id);
    showToast(`已提交 ${targets.length} 題；其中 ${correctCount} 題正確，進度已儲存。`);
  } catch (error) {
    console.warn("Common Expression state save failed", error);
    showToast("提交結果已保留在此裝置；雲端同步稍後重試。");
  }
}

async function checkAnswer() {
  return submitAnswers({ all: false });
}

function persistLessonState(lessonId) {
  const record = lessonState(lessonId);
  const clockIsRunning = state.lessonId === lessonId && Boolean(state.lessonClockStartedAt);
  if (clockIsRunning) captureClockElapsed({ restart: true });
  markLessonDirty(lessonId);
  writeLocalSnapshot();
  const snapshot = JSON.parse(JSON.stringify(record));
  const expectedUpdatedAt = snapshot.updatedAt;
  const write = () => rpc(String(CONFIG.saveStateRpc), {
    p_token: state.token,
    p_system_key: SYSTEM_KEY,
    p_lesson_id: lessonId,
    p_state: snapshot,
    p_duration_ms: Math.max(0, Math.round(snapshot.durationMs || 0))
  });
  const pending = state.saveQueue.then(write, write);
  state.saveQueue = pending.catch(() => undefined);
  return pending.then((payload) => {
    const normalized = normalizeLessonState(payload?.state_row || payload);
    clearLessonDirty(lessonId, expectedUpdatedAt);
    if (normalized) {
      const current = state.states.get(lessonId);
      state.states.set(lessonId, mergeLessonStates(normalized, current));
    }
    setConnection(state.dirtyLessonIds.size ? "等待同步" : "已安全連接", state.dirtyLessonIds.size ? "checking" : "online");
    writeLocalSnapshot();
    return payload;
  }, (error) => {
    setConnection("等待同步", "checking");
    writeLocalSnapshot();
    throw error;
  });
}

async function retryDirtyLessonStates() {
  if (!state.user || !state.token || !state.dirtyLessonIds.size) return;
  const lessonIds = [...state.dirtyLessonIds].filter((lessonId) => getLesson(lessonId));
  if (!lessonIds.length) return;
  setConnection("正在同步", "checking");
  const results = await Promise.allSettled(lessonIds.map((lessonId) => persistLessonState(lessonId)));
  const failed = results.find((result) => result.status === "rejected");
  if (failed) throw failed.reason;
}

async function flushCurrentState() {
  if (state.currentView === "exercise") {
    window.clearTimeout(state.draftTimer);
    updateDraftsFromFields();
  }
  pauseClock();
  if (!state.lessonId || !state.user || !state.token) return;
  return persistLessonState(state.lessonId);
}

async function toggleBookmark(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  const shouldBookmark = !state.bookmarks.has(lessonId);
  if (shouldBookmark) state.bookmarks.add(lessonId); else state.bookmarks.delete(lessonId);
  writeLocalSnapshot();
  if (state.currentView === "dashboard") renderDashboard();
  else if (state.currentView === "lesson") renderLessonHeader(lesson);
  else if (state.currentView === "exercise") renderQuestionList({ preserveScroll: true });
  try {
    const payload = await rpc(String(CONFIG.setBookmarkRpc), { p_token: state.token, p_system_key: SYSTEM_KEY, p_lesson_id: lessonId, p_bookmarked: shouldBookmark });
    if (payload?.bookmarked === true) state.bookmarks.add(lessonId);
    if (payload?.bookmarked === false) state.bookmarks.delete(lessonId);
    writeLocalSnapshot();
    showToast(shouldBookmark ? "已加入課題書簽。" : "已移除課題書簽。");
  } catch (error) {
    console.warn("Common Expression bookmark sync failed", error);
    if (shouldBookmark) state.bookmarks.delete(lessonId); else state.bookmarks.add(lessonId);
    writeLocalSnapshot();
    if (state.currentView === "dashboard") renderDashboard();
    showToast("未能同步書簽，請稍後再試。");
  }
}

function renderBookmarks() {
  const rows = SYSTEM.lessons.filter((lesson) => state.bookmarks.has(lesson.id));
  elements.bookmarkList.innerHTML = rows.length ? rows.map((lesson) => `<article class="bookmark-row"><div><h3>${escapeHtml(lesson.titleEn)}</h3><p>${escapeHtml(lesson.titleZh)} · ${completedCount(lesson.id)}/${lesson.questions.length} 題完成</p></div><div class="lesson-card-actions"><button class="secondary-button" type="button" data-open-lesson="${escapeHtml(lesson.id)}">開啟</button><button class="danger-button" type="button" data-toggle-bookmark="${escapeHtml(lesson.id)}">移除</button></div></article>`).join("") : `<div class="empty-library-inner"><span class="empty-library-mark" aria-hidden="true">☆</span><h2>尚未收藏課題</h2><p>在課題卡或課題頁按星號即可加入書簽。</p></div>`;
}

function openBookmarks() {
  renderBookmarks();
  showView("bookmarks");
}

document.addEventListener("click", (event) => {
  const questionDay = event.target.closest("[data-common-question-day]")?.dataset.commonQuestionDay;
  if (questionDay) {
    state.selectedProgressDay = questionDay;
    renderQuestionDayPanel();
    elements.questionDayPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const timeDay = event.target.closest("[data-common-time-day]")?.dataset.commonTimeDay;
  if (timeDay) {
    state.selectedTimeProgressDay = timeDay;
    renderTimeDayPanel();
    elements.timeDayPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const target = event.target.closest("button");
  if (!target) return;
  if (target.matches("[data-password-toggle]")) {
    const input = elements.loginForm.elements.password;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    target.textContent = show ? "隱藏" : "顯示";
    target.setAttribute("aria-pressed", String(show));
  } else if (target.matches("[data-dashboard-button], [data-back-dashboard], [data-bookmarks-back]")) {
    flushCurrentState()
      .then(() => retryDirtyLessonStates())
      .catch((error) => console.warn("Common Expression navigation sync failed", error));
    openDashboard();
  } else if (target.matches("[data-logout]")) {
    logout();
  } else if (target.matches("[data-open-bookmarks]")) {
    openBookmarks();
  } else if (target.matches("[data-toggle-progress]")) {
    state.progressPanelExpanded = !state.progressPanelExpanded;
    saveProgressPreference(PROGRESS_PANEL_PREFERENCE_KEY, state.progressPanelExpanded);
    renderProgressDashboard();
    if (state.progressPanelExpanded) elements.progressPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (target.dataset.questionProgressRange) {
    state.progressRange = PROGRESS_RANGES.some(([key]) => key === target.dataset.questionProgressRange) ? target.dataset.questionProgressRange : "month";
    state.selectedProgressDay = "";
    renderProgressDashboard();
  } else if (target.dataset.timeProgressRange) {
    state.timeProgressRange = PROGRESS_RANGES.some(([key]) => key === target.dataset.timeProgressRange) ? target.dataset.timeProgressRange : "month";
    state.selectedTimeProgressDay = "";
    renderProgressDashboard();
  } else if (target.matches("[data-toggle-cumulative]")) {
    state.showCumulativeProgress = !state.showCumulativeProgress;
    saveProgressPreference(CUMULATIVE_PROGRESS_PREFERENCE_KEY, state.showCumulativeProgress);
    renderProgressDashboard();
  } else if (target.matches("[data-close-question-day]")) {
    state.selectedProgressDay = "";
    renderQuestionDayPanel();
  } else if (target.matches("[data-close-time-day]")) {
    state.selectedTimeProgressDay = "";
    renderTimeDayPanel();
  } else if (target.dataset.openLesson) {
    openLesson(target.dataset.openLesson);
  } else if (target.dataset.toggleBookmark) {
    toggleBookmark(target.dataset.toggleBookmark);
  } else if (target.matches("[data-current-lesson-bookmark], [data-question-lesson-bookmark]")) {
    toggleBookmark(state.lessonId);
  } else if (target.dataset.lessonTab) {
    state.lessonTab = target.dataset.lessonTab;
    renderTabs();
    renderLessonContent();
  } else if (target.matches("[data-start-exercise]")) {
    openExercise();
  } else if (target.matches("[data-back-lesson]")) {
    flushCurrentState().then(() => retryDirtyLessonStates()).catch(() => undefined);
    openLesson(state.lessonId, "summary");
  } else if (target.matches("[data-save-drafts]")) {
    saveDrafts();
  } else if (target.matches("[data-submit-partial]")) {
    checkAnswer();
  } else if (target.matches("[data-submit-all]")) {
    submitAnswers({ all: true });
  } else if (target.dataset.clearAnswer) {
    const fields = [...elements.questionList.querySelectorAll(`[data-answer-field][data-question-id="${CSS.escape(target.dataset.clearAnswer)}"]`)];
    if (fields.length) {
      fields.forEach((field) => { field.value = ""; });
      updateDraftsFromFields();
      (fields.find((field) => field.dataset.dialogueSpeaker === "b") || fields[0]).focus();
    }
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.matches("[data-answer-field]") || state.currentView !== "exercise") return;
  window.clearTimeout(state.draftTimer);
  state.draftTimer = window.setTimeout(() => updateDraftsFromFields(), 180);
});

document.addEventListener("keydown", (event) => {
  if (!(["Enter", " "].includes(event.key))) return;
  const interactive = event.target.closest("[data-common-question-day], [data-common-time-day]");
  if (!interactive) return;
  event.preventDefault();
  interactive.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});

elements.loginForm.addEventListener("submit", handleLogin);
document.addEventListener("edmund:idle-break-start", () => {
  lessonClockWasRunningBeforeIdleBreak = Boolean(state.lessonClockStartedAt) || state.currentView === "exercise";
  if (state.currentView === "exercise") updateDraftsFromFields();
  pauseClock();
  writeLocalSnapshot();
});
document.addEventListener("edmund:idle-break-resume", () => {
  const shouldResume = lessonClockWasRunningBeforeIdleBreak;
  lessonClockWasRunningBeforeIdleBreak = false;
  if (shouldResume && state.currentView === "exercise" && state.user && state.token) startClock();
});
document.addEventListener("edmund:idle-break-logout", () => {
  lessonClockWasRunningBeforeIdleBreak = false;
  pauseClock();
  writeLocalSnapshot();
});
window.addEventListener("pagehide", () => {
  if (state.currentView === "exercise") updateDraftsFromFields();
  pauseClock();
  writeLocalSnapshot();
  retryDirtyLessonStates().catch(() => undefined);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (state.currentView === "exercise") updateDraftsFromFields();
    pauseClock();
    writeLocalSnapshot();
    retryDirtyLessonStates().catch(() => undefined);
  } else {
    retryDirtyLessonStates().catch(() => undefined);
    if (state.currentView === "exercise") startClock();
  }
});

async function initialise() {
  setConnection("正在連接", "checking");
  try {
    await ensureSupabaseSession();
    setConnection("已連線", "online");
  } catch (error) {
    console.warn("Common Expression data initialization failed", error);
    setConnection("連線失敗", "error");
  }
  if (!await restoreSession()) showView("login", { scroll: false });
}

initialise();
