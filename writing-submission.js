import {
  completedWritingSegments,
  completedWritingSegmentsAffectedByEdit,
  completedWritingSegmentsOverlappingRange,
  countEnglishWords,
  formatSubmissionDate,
  grammarOccurrenceIdentity,
  insertedRange,
  isLiveCompletedWritingSegment,
  newlyCompletedWritingSegments,
  normalizeWritingSubmissionEntryLink,
  vocabularyEntryUsed,
  writingSubmissionNotificationMessage,
  writingTopicResourceForTransport
} from "./writing-submission-core.js?v=20260812-topic-transport1";
import {
  classifyRemoteGrammarFailure,
  hasWritingGrammarIssuesForSentence,
  isBlockedInverseWritingGrammarIssue,
  mergeWritingGrammarIssues,
  normalizeWritingAiResponse,
  REMOTE_GRAMMAR_FAILURE_KINDS,
  REMOTE_GRAMMAR_REQUEST_TIMEOUT_MS,
  rebaseWritingGrammarIssuesAfterAppliedCorrection,
  remoteGrammarRetryDelayMs,
  writingGrammarReviewNotice
} from "./writing-submission-ai.js?v=20260810-drafts-admin2";
import {
  emptyWritingTimer,
  expireWritingTimer,
  formatWritingTimer,
  normalizeWritingTimer,
  pauseWritingTimer,
  resumeWritingTimer,
  startWritingTimer,
  timerInputSeconds,
  writingTimerRemaining
} from "./writing-submission-timer.js?v=20260810-timer-export1";
import {
  emptyWritingStopwatch,
  formatWritingStopwatch,
  normalizeWritingStopwatch,
  pauseWritingStopwatch,
  resetWritingStopwatch,
  startWritingStopwatch
} from "./writing-submission-stopwatch.js?v=20260810-drafts-admin2";
import {
  canonicalAccessibleWritingTopic,
  normalizeWritingTopicAccess,
  writingTopicAccessAllows
} from "./writing-submission-topic-access.js?v=20260810-topic-access1";
import {
  unbiasedRandomIndex,
  WRITING_RANDOM_TOPIC_CATEGORIES,
  writingRandomTopicCandidates
} from "./writing-submission-random-topic.js?v=20260813-1";
import {
  feedbackHighlightCommandFromEvent,
  normalizeGrammarFeedbackPoints,
  normalizeSentenceStructureDeepLink,
  normalizeSentenceStructureMethods,
  parseNumberedFeedbackBlocks,
  sliceFeedbackFormattingRuns
} from "./writing-submission-feedback-tools.mjs?v=20260814-1";
import {
  createWritingProofreadingGate,
  formatWritingProofreading,
  isWritingProofreadingActive,
  isWritingProofreadingReady,
  normalizeWritingProofreadingGate,
  resetWritingProofreadingGate,
  startWritingProofreadingGate,
  writingProofreadingRemaining
} from "./writing-submission-proofreading.mjs?v=20260814-1";

const CONFIG = window.EDMUND_WRITING_SUBMISSION_CONFIG || {};
const SUPABASE_CONFIG = window.EDMUND_SUPABASE || {};
const SESSION_KEY = "edmund-writing-submission-session-v1";
const DRAFT_KEY_PREFIX = "edmund-writing-submission-draft-v1";
const ISSUE_QUEUE_KEY_PREFIX = "edmund-writing-submission-issue-queue-v1";
const TOPIC_CATALOG_VERSION = "20260812-submission-links1";
const TOPIC_REFERENCE_VERSION = "20260811-2";
const WRITING_IDLE_LIMIT_MS = 3 * 60 * 1000;
const HARPER_VERSION = "2.7.0";
const ESL_RULESET_VERSION = "2.0.0";
const VOCABULARY_TEXT_SCALE_VALUES = Object.freeze([0.5, 1, 2, 3, 4, 5, 7]);
const FEEDBACK_FONT_SCALE_VALUES = Object.freeze([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]);
const FEEDBACK_FONT_SCALE_KEY = "edmund-writing-feedback-font-scale-v1";
const FEEDBACK_HIGHLIGHT_COLORS = Object.freeze({
  yellow: "#fff1a8",
  orange: "#ffd3a1",
  blue: "#cfe6ff",
  green: "#d5f2d5"
});
const FEEDBACK_HIGHLIGHT_NAMES = Object.freeze(Object.keys(FEEDBACK_HIGHLIGHT_COLORS));
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const essayPortals = window.EDMUND_ESSAY_PORTALS || null;
const entryLink = normalizeWritingSubmissionEntryLink(window.location.search);

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  workspaceButton: document.querySelector("[data-workspace-button]"),
  submissionsButton: document.querySelector("[data-submissions-button]"),
  grammarLogButton: document.querySelector("[data-grammar-log-button]"),
  feedbackBookmarksButton: document.querySelector("[data-feedback-bookmarks-button]"),
  adminButton: document.querySelector("[data-admin-button]"),
  adminReviewButton: document.querySelector("[data-admin-review-button]"),
  logout: document.querySelector("[data-logout]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  username: document.querySelector("#writing-submission-username"),
  password: document.querySelector("#writing-submission-password"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  workspaceWelcome: document.querySelector("[data-workspace-welcome]"),
  harperStatus: document.querySelector("[data-harper-status]"),
  writingForm: document.querySelector("[data-writing-form]"),
  topicInput: document.querySelector("[data-topic-input]"),
  randomTopicOpen: document.querySelector("[data-random-topic-open]"),
  randomTopicDialog: document.querySelector("[data-random-topic-dialog]"),
  randomTopicClose: document.querySelector("[data-random-topic-close]"),
  randomTopicStatus: document.querySelector("[data-random-topic-status]"),
  randomTopicChoices: [...document.querySelectorAll("[data-random-topic-category]")],
  topicPickerOpen: document.querySelector("[data-topic-picker-open]"),
  topicPicker: document.querySelector("[data-topic-picker]"),
  topicPickerClose: document.querySelector("[data-topic-picker-close]"),
  topicPickerSearch: document.querySelector("[data-topic-picker-search]"),
  topicPickerResults: document.querySelector("[data-topic-picker-results]"),
  selectedTopicPreview: document.querySelector("[data-selected-topic-preview]"),
  topicReferenceArea: document.querySelector("[data-topic-reference-area]"),
  writingInput: document.querySelector("[data-writing-input]"),
  proofreadingLabel: document.querySelector("[data-proofreading-label]"),
  wordCount: document.querySelector("[data-word-count]"),
  writingTimerToggle: document.querySelector("[data-writing-timer-toggle]"),
  writingTimerToggleDisplay: document.querySelector("[data-writing-timer-toggle-display]"),
  writingTimerPanel: document.querySelector("[data-writing-timer-panel]"),
  writingTimerDisplay: document.querySelector("[data-writing-timer-display]"),
  writingTimerHours: document.querySelector("[data-writing-timer-hours]"),
  writingTimerMinutes: document.querySelector("[data-writing-timer-minutes]"),
  writingTimerSeconds: document.querySelector("[data-writing-timer-seconds]"),
  writingTimerForce: document.querySelector("[data-writing-timer-force]"),
  writingTimerStart: document.querySelector("[data-writing-timer-start]"),
  writingTimerPause: document.querySelector("[data-writing-timer-pause]"),
  writingTimerReset: document.querySelector("[data-writing-timer-reset]"),
  writingTimerRetry: document.querySelector("[data-writing-timer-retry]"),
  writingTimerStatus: document.querySelector("[data-writing-timer-status]"),
  writingStopwatch: document.querySelector("[data-writing-stopwatch]"),
  writingStopwatchDisplay: document.querySelector("[data-writing-stopwatch-display]"),
  writingStopwatchStart: document.querySelector("[data-writing-stopwatch-start]"),
  writingStopwatchPause: document.querySelector("[data-writing-stopwatch-pause]"),
  writingStopwatchReset: document.querySelector("[data-writing-stopwatch-reset]"),
  draftState: document.querySelector("[data-draft-state]"),
  submissionStatus: document.querySelector("[data-submission-status]"),
  submitWriting: document.querySelector("[data-submit-writing]"),
  saveProgress: document.querySelector("[data-save-progress]"),
  grammarList: document.querySelector("[data-grammar-list]"),
  issueCount: document.querySelector("[data-issue-count]"),
  grammarPanel: document.querySelector(".grammar-panel"),
  grammarToggle: document.querySelector("[data-grammar-toggle]"),
  grammarToggleLabel: document.querySelector("[data-grammar-toggle-label]"),
  newWriting: document.querySelector("[data-new-writing]"),
  refreshSubmissions: document.querySelector("[data-refresh-submissions]"),
  refreshWritingProgress: document.querySelector("[data-refresh-writing-progress]"),
  writingArticleTotal: document.querySelector("[data-writing-article-total]"),
  writingTimeTotal: document.querySelector("[data-writing-time-total]"),
  writingAverageTime: document.querySelector("[data-writing-average-time]"),
  writingArticlesChart: document.querySelector("[data-writing-articles-chart]"),
  writingTimeChart: document.querySelector("[data-writing-time-chart]"),
  writingAverageChart: document.querySelector("[data-writing-average-chart]"),
  submissionList: document.querySelector("[data-submission-list]"),
  submissionDetail: document.querySelector("[data-submission-detail]"),
  exportSelectAll: document.querySelector("[data-export-select-all]"),
  exportSelectedCount: document.querySelector("[data-export-selected-count]"),
  exportSelectedSubmissions: document.querySelector("[data-export-selected-submissions]"),
  exportAllSubmissions: document.querySelector("[data-export-all-submissions]"),
  draftCount: document.querySelector("[data-draft-count]"),
  draftList: document.querySelector("[data-draft-list]"),
  refreshDrafts: document.querySelector("[data-refresh-drafts]"),
  refreshGrammarLog: document.querySelector("[data-refresh-grammar-log]"),
  exportGrammarLog: document.querySelector("[data-export-grammar-log]"),
  uniqueRuleCount: document.querySelector("[data-unique-rule-count]"),
  totalIssueCount: document.querySelector("[data-total-issue-count]"),
  grammarSummaryList: document.querySelector("[data-grammar-summary-list]"),
  refreshFeedbackBookmarks: document.querySelector("[data-refresh-feedback-bookmarks]"),
  feedbackBookmarkCount: document.querySelector("[data-feedback-bookmark-count]"),
  feedbackBookmarkList: document.querySelector("[data-feedback-bookmark-list]"),
  adminSearch: document.querySelector("[data-admin-search]"),
  adminNameSort: document.querySelector("[data-admin-name-sort]"),
  adminCount: document.querySelector("[data-admin-count]"),
  adminList: document.querySelector("[data-admin-list]"),
  adminDetail: document.querySelector("[data-admin-detail]"),
  adminStudentCount: document.querySelector("[data-admin-student-count]"),
  adminStudentList: document.querySelector("[data-admin-student-list]"),
  adminGrammarCount: document.querySelector("[data-admin-grammar-count]"),
  adminGrammarList: document.querySelector("[data-admin-grammar-list]"),
  refreshAdminReview: document.querySelector("[data-refresh-admin-review]"),
  adminReviewCount: document.querySelector("[data-admin-review-count]"),
  adminReviewList: document.querySelector("[data-admin-review-list]"),
  adminReviewMore: document.querySelector("[data-admin-review-more]"),
  toast: document.querySelector("[data-toast]")
};

const state = {
  supabase: null,
  user: null,
  authToken: "",
  studentAccess: Object.create(null),
  studentAccessReady: false,
  currentView: "login",
  grammarDetectionEnabled: true,
  preferenceSavePromise: null,
  checker: null,
  checkerState: "idle",
  checkerPromise: null,
  checkQueue: Promise.resolve(),
  pendingChecks: 0,
  checkGeneration: 0,
  segmentChecks: new Map(),
  latestSegmentRecords: new Map(),
  nextSegmentRevision: 0,
  remoteGrammarQueue: [],
  remoteGrammarInFlight: 0,
  remoteGrammarControllers: new Set(),
  remoteGrammarPromises: new Set(),
  remoteGrammarBackoffUntil: 0,
  remoteGrammarBackoffFailure: null,
  remoteGrammarWarnings: new Map(),
  activeIssues: [],
  appliedCorrections: [],
  dismissedIssueIds: new Set(),
  documentId: "",
  previousWriting: "",
  pendingOccurrences: new Map(),
  reportedFingerprints: new Set(),
  occurrenceFlushTimer: null,
  occurrenceFlushPromise: null,
  draftSaveTimer: null,
  draftDurationSeconds: 0,
  submissionDurationSeconds: null,
  writingClockLastAt: 0,
  lastWritingActivityAt: 0,
  writingClockTimer: null,
  selectedTopicResource: null,
  writingTimer: emptyWritingTimer(),
  writingStopwatch: emptyWritingStopwatch(),
  proofreadingGate: createWritingProofreadingGate(),
  proofreadingClock: null,
  writingImageZoom: 1,
  writingTimerPanelOpen: false,
  writingTimerClock: null,
  idleBreakTimerWasRunning: false,
  idleBreakStopwatchWasRunning: false,
  timerAutoSubmitLock: false,
  submissionPromise: null,
  topicCatalog: [],
  topicCatalogPromise: null,
  randomTopicGeneration: 0,
  topicReferenceCatalog: null,
  topicReferencePromise: null,
  topicReferenceImportAttempt: 0,
  manualRecheckTimer: null,
  toastTimer: null,
  submissions: [],
  drafts: [],
  selectedExportSubmissionIds: new Set(),
  exportInFlight: false,
  writingProgress: [],
  selectedSubmissionId: "",
  selectedStudentFeedback: null,
  feedbackBookmarks: [],
  feedbackBookmarksLoading: false,
  submissionRequestGeneration: 0,
  grammarProblems: [],
  adminSubmissions: [],
  adminStudents: [],
  selectedAdminStudentId: "",
  adminStudentSort: "asc",
  adminGrammarProblems: [],
  selectedAdminSubmissionId: "",
  adminSubmissionRequestGeneration: 0,
  selectedAdminFeedback: null,
  adminFeedbackSuggestedFragments: [],
  feedbackFontScale: 1,
  feedbackFontScaleInitialized: false,
  activeFeedbackRichEditor: null,
  feedbackSelectionRange: null,
  adminExplanationReviews: [],
  adminExplanationReviewPage: 0,
  adminExplanationReviewHasMore: false,
  entryLinkHandled: false
};

function createElement(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== "") node.textContent = String(text);
  return node;
}

function normalizeFeedbackFontScale(value) {
  const numeric = Number(value);
  return FEEDBACK_FONT_SCALE_VALUES.includes(numeric) ? numeric : 1;
}

function initializeFeedbackFontScale() {
  if (state.feedbackFontScaleInitialized) return;
  state.feedbackFontScaleInitialized = true;
  try {
    state.feedbackFontScale = normalizeFeedbackFontScale(window.localStorage.getItem(FEEDBACK_FONT_SCALE_KEY));
  } catch {
    state.feedbackFontScale = 1;
  }
}

function applyFeedbackFontScale({ persist = false } = {}) {
  initializeFeedbackFontScale();
  const value = normalizeFeedbackFontScale(state.feedbackFontScale);
  state.feedbackFontScale = value;
  document.querySelectorAll("[data-submission-detail], [data-admin-detail]").forEach(container => {
    container.style.setProperty("--submission-text-scale", String(value));
  });
  document.querySelectorAll("[data-feedback-font-scale]").forEach(select => {
    select.value = String(value);
  });
  document.querySelectorAll("[data-feedback-font-smaller]").forEach(button => {
    button.disabled = value === FEEDBACK_FONT_SCALE_VALUES[0];
  });
  document.querySelectorAll("[data-feedback-font-larger]").forEach(button => {
    button.disabled = value === FEEDBACK_FONT_SCALE_VALUES[FEEDBACK_FONT_SCALE_VALUES.length - 1];
  });
  if (persist) {
    try { window.localStorage.setItem(FEEDBACK_FONT_SCALE_KEY, String(value)); }
    catch { /* Font scaling still works for the current page when storage is unavailable. */ }
  }
}

function changeFeedbackFontScale(direction) {
  initializeFeedbackFontScale();
  const currentIndex = Math.max(0, FEEDBACK_FONT_SCALE_VALUES.indexOf(state.feedbackFontScale));
  const nextIndex = Math.min(
    FEEDBACK_FONT_SCALE_VALUES.length - 1,
    Math.max(0, currentIndex + direction)
  );
  state.feedbackFontScale = FEEDBACK_FONT_SCALE_VALUES[nextIndex];
  applyFeedbackFontScale({ persist: true });
}

function feedbackFontScaleControl() {
  initializeFeedbackFontScale();
  const control = createElement("div", "feedback-font-scale-control");
  control.setAttribute("role", "group");
  control.setAttribute("aria-label", "調整文章及評語字體大小");
  const smaller = createElement("button", "feedback-font-scale-button", "A−");
  smaller.type = "button";
  smaller.dataset.feedbackFontSmaller = "true";
  smaller.title = "縮小字體";
  const label = createElement("label", "feedback-font-scale-select");
  label.append(createElement("span", "", "字體大小"));
  const select = document.createElement("select");
  select.dataset.feedbackFontScale = "true";
  select.setAttribute("aria-label", "文章及評語字體大小");
  FEEDBACK_FONT_SCALE_VALUES.forEach(value => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = `${Math.round(value * 100)}%`;
    select.append(option);
  });
  select.value = String(state.feedbackFontScale);
  label.append(select);
  const larger = createElement("button", "feedback-font-scale-button", "A＋");
  larger.type = "button";
  larger.dataset.feedbackFontLarger = "true";
  larger.title = "放大字體";
  control.append(smaller, label, larger);
  return control;
}

function initializeFeedbackStickyOffset() {
  const header = document.querySelector(".edmund-system-header");
  if (!header) return;
  const sync = () => {
    const height = Math.max(0, Math.ceil(header.getBoundingClientRect().height));
    document.documentElement.style.setProperty("--writing-feedback-sticky-top", `${height}px`);
  };
  sync();
  window.addEventListener("resize", sync, { passive: true });
  if (typeof ResizeObserver === "function") new ResizeObserver(sync).observe(header);
}

function normalizeFeedbackFormattingRuns(value, textValue = "") {
  const text = String(textValue || "");
  if (!Array.isArray(value) || !text.length) return [];
  const sorted = value.map(run => ({
    start: Number(run?.start),
    end: Number(run?.end),
    bold: run?.bold === true,
    highlight: FEEDBACK_HIGHLIGHT_NAMES.includes(String(run?.highlight || ""))
      ? String(run.highlight)
      : ""
  })).filter(run => (
    Number.isSafeInteger(run.start)
    && Number.isSafeInteger(run.end)
    && run.start >= 0
    && run.end > run.start
    && run.end <= text.length
    && (run.bold || run.highlight)
  )).sort((left, right) => left.start - right.start || left.end - right.end);
  const output = [];
  let cursor = 0;
  for (const run of sorted) {
    if (run.start < cursor) continue;
    const previous = output[output.length - 1];
    if (
      previous
      && previous.end === run.start
      && previous.bold === run.bold
      && previous.highlight === run.highlight
    ) previous.end = run.end;
    else output.push(run);
    cursor = run.end;
  }
  return output.slice(0, 500);
}

function appendFeedbackRichText(container, textValue, formattingValue, { emptyText = "" } = {}) {
  const text = String(textValue || "");
  const runs = normalizeFeedbackFormattingRuns(formattingValue, text);
  container.replaceChildren();
  if (!text) {
    if (emptyText) container.append(document.createTextNode(emptyText));
    return;
  }
  let cursor = 0;
  for (const run of runs) {
    if (run.start > cursor) container.append(document.createTextNode(text.slice(cursor, run.start)));
    let node = document.createTextNode(text.slice(run.start, run.end));
    if (run.bold) {
      const strong = document.createElement("strong");
      strong.append(node);
      node = strong;
    }
    if (run.highlight) {
      const mark = document.createElement("mark");
      mark.dataset.highlight = run.highlight;
      mark.append(node);
      node = mark;
    }
    container.append(node);
    cursor = run.end;
  }
  if (cursor < text.length) container.append(document.createTextNode(text.slice(cursor)));
}

function appendStructuredFeedbackRichText(container, textValue, formattingValue, { emptyText = "" } = {}) {
  const text = String(textValue || "");
  const blocks = parseNumberedFeedbackBlocks(text);
  container.replaceChildren();
  container.classList.add("feedback-structured-flow");
  if (!blocks.length) {
    if (emptyText) container.append(createElement("p", "feedback-structured-paragraph", emptyText));
    return;
  }
  blocks.forEach((block) => {
    if (block.type === "text") {
      const paragraph = createElement("p", "feedback-structured-paragraph");
      appendFeedbackRichText(
        paragraph,
        block.text,
        sliceFeedbackFormattingRuns(formattingValue, block.start, block.end)
      );
      container.append(paragraph);
      return;
    }
    block.items.forEach((item) => {
      const card = createElement("div", "feedback-numbered-card");
      const badge = createElement("span", "feedback-number-badge", item.number);
      badge.setAttribute("aria-label", `第 ${item.number} 點`);
      const body = createElement("div", "feedback-numbered-body");
      appendFeedbackRichText(
        body,
        item.text,
        sliceFeedbackFormattingRuns(formattingValue, item.start, item.end)
      );
      card.append(badge, body);
      container.append(card);
    });
  });
}

function feedbackHighlightName(element) {
  const explicit = String(element?.dataset?.highlight || "");
  if (FEEDBACK_HIGHLIGHT_NAMES.includes(explicit)) return explicit;
  const color = String(element?.style?.backgroundColor || "").replace(/\s+/gu, "").toLowerCase();
  const aliases = {
    "rgb(255,241,168)": "yellow",
    "#fff1a8": "yellow",
    "rgb(255,211,161)": "orange",
    "#ffd3a1": "orange",
    "rgb(207,230,255)": "blue",
    "#cfe6ff": "blue",
    "rgb(213,242,213)": "green",
    "#d5f2d5": "green"
  };
  return aliases[color] || "";
}

function readFeedbackRichEditor(editor) {
  const runs = [];
  let text = "";
  const appendText = (value, style) => {
    const normalized = String(value || "").replace(/\u00a0/gu, " ");
    if (!normalized) return;
    const start = text.length;
    text += normalized;
    const end = text.length;
    if (style.bold || style.highlight) {
      const previous = runs[runs.length - 1];
      if (
        previous
        && previous.end === start
        && previous.bold === style.bold
        && previous.highlight === style.highlight
      ) previous.end = end;
      else runs.push({ start, end, bold: style.bold, highlight: style.highlight });
    }
  };
  const appendBreak = () => {
    if (text && !text.endsWith("\n")) appendText("\n", { bold: false, highlight: "" });
  };
  const visit = (node, inherited = { bold: false, highlight: "" }) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.nodeValue, inherited);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node;
    const tag = element.tagName;
    if (tag === "BR") {
      appendBreak();
      return;
    }
    const block = tag === "DIV" || tag === "P" || tag === "LI";
    if (block) appendBreak();
    const weight = String(element.style?.fontWeight || "");
    const style = {
      bold: inherited.bold || tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= 600,
      highlight: feedbackHighlightName(element) || inherited.highlight
    };
    element.childNodes.forEach(child => visit(child, style));
    if (block) appendBreak();
  };
  editor.childNodes.forEach(child => visit(child));
  const trimmed = text.trim();
  if (!trimmed) return { text: "", formatting: [] };
  const startOffset = text.indexOf(trimmed);
  const endOffset = startOffset + trimmed.length;
  const adjusted = runs.map(run => ({
    start: Math.max(run.start, startOffset) - startOffset,
    end: Math.min(run.end, endOffset) - startOffset,
    bold: run.bold,
    highlight: run.highlight
  })).filter(run => run.end > run.start);
  const maxLength = Math.max(1, Number(editor.dataset.feedbackMaxLength || 20000));
  if (trimmed.length > maxLength) {
    throw new Error(`${editor.getAttribute("aria-label") || "評語內容"}不可超過 ${maxLength.toLocaleString()} 個字元。`);
  }
  return { text: trimmed, formatting: normalizeFeedbackFormattingRuns(adjusted, trimmed) };
}

function createFeedbackRichEditor({ label, value = "", formatting = [], maxLength = 20000, datasetName }) {
  const editor = createElement("div", "teacher-feedback-rich-editor");
  editor.contentEditable = "true";
  editor.spellcheck = true;
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  editor.setAttribute("aria-label", label);
  editor.dataset.feedbackRichEditor = datasetName;
  editor.dataset.feedbackMaxLength = String(maxLength);
  editor.dataset.placeholder = `輸入${label}`;
  appendFeedbackRichText(editor, value, formatting);
  editor.addEventListener("focus", () => {
    state.activeFeedbackRichEditor = editor;
  });
  editor.addEventListener("paste", event => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
  });
  editor.addEventListener("drop", event => {
    event.preventDefault();
    const text = event.dataTransfer?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
  });
  editor.addEventListener("keydown", event => {
    if (event.shiftKey && event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      state.activeFeedbackRichEditor = editor;
      document.execCommand("insertText", false, "\n\n");
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    const highlight = feedbackHighlightCommandFromEvent(event);
    if (!highlight) return;
    event.preventDefault();
    state.activeFeedbackRichEditor = editor;
    const selection = window.getSelection();
    if (selection?.rangeCount && !selection.isCollapsed && editor.contains(selection.anchorNode)) {
      state.feedbackSelectionRange = selection.getRangeAt(0).cloneRange();
    }
    applyFeedbackFormatting(highlight);
  });
  return editor;
}

function feedbackFormattingToolbar() {
  const toolbar = createElement("div", "teacher-feedback-format-toolbar");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "評語文字格式");
  toolbar.append(createElement("span", "teacher-feedback-format-label", "選取文字後套用："));
  const bold = createElement("button", "teacher-feedback-format-button teacher-feedback-format-bold", "B");
  bold.type = "button";
  bold.dataset.feedbackFormat = "bold";
  bold.setAttribute("aria-label", "粗體");
  bold.title = "粗體（按此按鈕；⌘B 已指定為藍色螢光筆）";
  toolbar.append(bold);
  FEEDBACK_HIGHLIGHT_NAMES.forEach(name => {
    const labels = { yellow: "黃色", orange: "橙色", blue: "藍色", green: "綠色" };
    const shortcuts = { yellow: "⌘Y", orange: "⌘O", blue: "⌘B", green: "⌘G" };
    const button = createElement("button", `teacher-feedback-highlight-button is-${name}`, `${labels[name]} ${shortcuts[name]}`);
    button.type = "button";
    button.dataset.feedbackFormat = name;
    button.setAttribute("aria-label", `${labels[name]}螢光筆（Command 或 Control + ${shortcuts[name].slice(-1)}）`);
    button.title = `${labels[name]}螢光筆：${shortcuts[name]}（Windows 使用 Ctrl）`;
    toolbar.append(button);
  });
  const clear = createElement("button", "teacher-feedback-format-button", "清除格式");
  clear.type = "button";
  clear.dataset.feedbackFormat = "clear";
  toolbar.append(clear);
  return toolbar;
}

function applyFeedbackFormatting(command) {
  const editor = state.activeFeedbackRichEditor;
  if (!editor?.isConnected) {
    showToast("請先在原句、Edmund 評語或建議寫法中選取文字。", "error");
    return;
  }
  editor.focus({ preventScroll: true });
  const selection = window.getSelection();
  if (state.feedbackSelectionRange && selection) {
    selection.removeAllRanges();
    selection.addRange(state.feedbackSelectionRange);
  }
  if (!selection?.rangeCount || selection.isCollapsed || !editor.contains(selection.anchorNode)) {
    showToast("請先選取要設定格式的文字。", "error");
    return;
  }
  if (command === "bold") document.execCommand("bold", false);
  else if (command === "clear") document.execCommand("removeFormat", false);
  else if (FEEDBACK_HIGHLIGHT_NAMES.includes(command)) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("hiliteColor", false, FEEDBACK_HIGHLIGHT_COLORS[command]);
  }
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

function loadingState(label = "正在載入…") {
  const wrapper = createElement("div", "loading-state");
  wrapper.append(createElement("span", "loading-spinner"), createElement("p", "", label));
  return wrapper;
}

function emptyState(label) {
  return createElement("p", "empty-state", label);
}

function setConnection(text, status = "checking") {
  if (!elements.connection) return;
  elements.connection.textContent = text;
  elements.connection.dataset.state = status;
}

function setStatus(element, text = "", status = "") {
  if (!element) return;
  element.textContent = text;
  if (status) element.dataset.state = status;
  else delete element.dataset.state;
}

function showToast(message, status = "success") {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = String(message || "");
  elements.toast.dataset.state = status;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3400);
}

async function copyPlainText(value) {
  const text = String(value || "");
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch { /* Fall back to the temporary-textarea method below. */ }

  let textarea = null;
  try {
    textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    if (document.execCommand("copy")) return true;
  } catch { /* Continue to the visible manual-copy prompt. */ }
  finally {
    textarea?.remove();
  }

  try {
    window.prompt("請複製以下通知：", text);
  } catch { /* A blocked prompt must not break the admin article view. */ }
  return false;
}

async function copySubmissionNotification(submissionId) {
  const message = writingSubmissionNotificationMessage(
    submissionId,
    `${window.location.origin}/`
  );
  if (!message) throw new Error("文章連結無效，請重新載入後再試。");
  const copied = await copyPlainText(message);
  showToast(copied ? "作文已改好通知已複製。" : "通知已顯示，請手動複製。", copied ? "success" : "error");
}

function idleBreakIsPaused() {
  return window.EdmundIdleBreak?.isPaused?.() === true;
}

function writingClockEligible(now = Date.now(), { ignoreIdleBreak = false } = {}) {
  return Boolean(
    state.user?.role === "student"
    && state.currentView === "workspace"
    && document.visibilityState !== "hidden"
    && state.documentId
    && (ignoreIdleBreak || !idleBreakIsPaused())
    && now - state.lastWritingActivityAt <= WRITING_IDLE_LIMIT_MS
  );
}

function accrueWritingTime(now = Date.now(), { ignoreIdleBreak = false } = {}) {
  if (!state.writingClockLastAt) {
    state.writingClockLastAt = now;
    return;
  }
  const elapsedMs = Math.max(0, Math.min(15000, now - state.writingClockLastAt));
  if (writingClockEligible(now, { ignoreIdleBreak })) state.draftDurationSeconds += elapsedMs / 1000;
  state.writingClockLastAt = now;
}

function markWritingActivity() {
  const now = Date.now();
  if (idleBreakIsPaused()) {
    state.writingClockLastAt = now;
    return;
  }
  accrueWritingTime(now);
  state.lastWritingActivityAt = now;
  state.writingClockLastAt = now;
}

function startWritingClock() {
  if (state.writingClockTimer) return;
  state.writingClockLastAt = Date.now();
  state.writingClockTimer = window.setInterval(() => {
    accrueWritingTime();
    if (state.currentView === "workspace") persistDraft();
  }, 5000);
}

function formatCompactDuration(secondsValue) {
  const seconds = Math.max(0, Number(secondsValue || 0));
  if (seconds < 60) return `${Math.round(seconds)} 秒`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)} 分鐘`;
  const hours = minutes / 60;
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} 小時`;
}

function showView(name) {
  accrueWritingTime();
  state.currentView = name;
  state.writingClockLastAt = Date.now();
  if (name === "workspace" && state.user?.role === "student") markWritingActivity();
  for (const view of elements.views) view.hidden = view.dataset.view !== name;
  const loggedIn = Boolean(state.user && state.authToken);
  const admin = state.user?.role === "admin";
  elements.userPill.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  elements.workspaceButton.hidden = !loggedIn || admin || name === "workspace";
  elements.submissionsButton.hidden = !loggedIn || admin || name === "submissions";
  elements.grammarLogButton.hidden = !loggedIn || admin || name === "grammar-log";
  elements.feedbackBookmarksButton.hidden = !loggedIn || admin || name === "feedback-bookmarks";
  elements.adminButton.hidden = !loggedIn || !admin || name === "admin";
  elements.adminReviewButton.hidden = !loggedIn || !admin || name === "admin-review";
  if (loggedIn) {
    elements.userPill.textContent = admin
      ? `${state.user.name} · 管理員`
      : state.user.name;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function workerBaseUrl() {
  const value = String(CONFIG.workerBaseUrl || "").trim().replace(/\/+$/u, "");
  if (!value.startsWith("https://")) throw new Error("交文服務尚未完成設定。");
  return value;
}

async function parseApiError(response) {
  let message = `服務回應錯誤（${response.status}）`;
  let code = "";
  try {
    const payload = await response.clone().json();
    message = String(payload?.error || payload?.message || message);
    code = String(payload?.code || "");
  } catch {
    // Keep the status fallback when the service did not return JSON.
  }
  const error = new Error(message);
  error.status = response.status;
  error.code = code;
  const retryAfter = String(response.headers.get("Retry-After") || "").trim();
  if (retryAfter) {
    const seconds = Number(retryAfter);
    const retryAt = Number.isFinite(seconds)
      ? Date.now() + (Math.max(0, seconds) * 1000)
      : Date.parse(retryAfter);
    if (Number.isFinite(retryAt)) error.retryAfterMs = Math.max(0, retryAt - Date.now());
  }
  return error;
}

async function apiJson(path, options = {}, includeAuth = true, authToken = state.authToken) {
  const headers = new Headers(options.headers || {});
  if (includeAuth && authToken) headers.set("Authorization", `Bearer ${authToken}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(`${workerBaseUrl()}/${String(path || "").replace(/^\/+/, "")}`, {
      ...options,
      headers,
      credentials: "omit"
    });
  } catch (cause) {
    if (cause?.name === "AbortError") throw cause;
    const error = new Error("暫時未能連接交文服務，請檢查網絡後再試。");
    error.cause = cause;
    throw error;
  }
  if (!response.ok) {
    const error = await parseApiError(response);
    if (includeAuth && response.status === 401 && authToken === state.authToken) {
      if (state.user?.role === "student") window.EdmundSystemNav?.forgetStudentSession();
      clearSession();
      setStatus(elements.loginStatus, "登入時段已結束，請重新登入。", "error");
      showView("login");
    }
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

function initialiseSupabaseClient() {
  if (state.supabase) return state.supabase;
  if (!window.supabase?.createClient || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  }
  let authStorage;
  try { authStorage = window.sessionStorage; } catch { authStorage = undefined; }
  state.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: Boolean(authStorage),
      ...(authStorage ? { storage: authStorage } : {}),
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
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

function saveSession() {
  if (!state.user || !state.authToken) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      token: state.authToken,
      id: state.user.id || "",
      name: state.user.name || "",
      role: state.user.role,
      access: state.user.role === "student" ? state.studentAccess : undefined
    }));
  } catch {
    // The authenticated session can continue in memory.
  }
}

function readSession() {
  try {
    const own = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (own?.token && own?.role) return own;
  } catch {
    // Continue to the shared student session candidate.
  }
  const shared = window.EdmundSystemNav?.getStudentSession?.();
  return shared?.token && shared?.role === "student" ? shared : null;
}

function clearSession() {
  window.clearTimeout(state.occurrenceFlushTimer);
  window.clearTimeout(state.draftSaveTimer);
  window.clearTimeout(state.manualRecheckTimer);
  state.occurrenceFlushTimer = null;
  state.occurrenceFlushPromise = null;
  state.draftSaveTimer = null;
  state.manualRecheckTimer = null;
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.user = null;
  state.authToken = "";
  state.studentAccess = Object.create(null);
  state.studentAccessReady = false;
  state.grammarDetectionEnabled = true;
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  state.pendingOccurrences.clear();
  state.reportedFingerprints.clear();
  state.submissions = [];
  state.drafts = [];
  state.writingProgress = [];
  state.selectedSubmissionId = "";
  state.selectedStudentFeedback = null;
  state.feedbackBookmarks = [];
  state.feedbackBookmarksLoading = false;
  state.submissionRequestGeneration += 1;
  state.grammarProblems = [];
  state.adminSubmissions = [];
  state.adminStudents = [];
  state.selectedAdminStudentId = "";
  state.adminGrammarProblems = [];
  state.selectedAdminSubmissionId = "";
  state.adminSubmissionRequestGeneration += 1;
  state.selectedAdminFeedback = null;
  state.adminFeedbackSuggestedFragments = [];
  state.adminExplanationReviews = [];
  state.adminExplanationReviewPage = 0;
  state.adminExplanationReviewHasMore = false;
  state.entryLinkHandled = false;
  state.selectedTopicResource = null;
  state.randomTopicGeneration += 1;
  state.writingTimer = emptyWritingTimer();
  state.writingStopwatch = emptyWritingStopwatch();
  state.proofreadingGate = resetWritingProofreadingGate();
  state.writingImageZoom = 1;
  state.writingTimerPanelOpen = false;
  state.timerAutoSubmitLock = false;
  state.submissionPromise = null;
  state.selectedExportSubmissionIds.clear();
  state.exportInFlight = false;
  state.draftDurationSeconds = 0;
  state.submissionDurationSeconds = null;
  state.writingClockLastAt = 0;
  state.lastWritingActivityAt = 0;
  syncWritingTimerUi();
  syncWritingStopwatchUi();
  syncWritingProofreadingUi();
  syncSubmissionExportControls();
  elements.submissionDetail.replaceChildren(emptyState("請先選擇一篇文章。"));
  elements.adminDetail.replaceChildren(emptyState("請先選擇學生及文章。"));
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage may be unavailable. */ }
  closeWritingTopicPicker();
  closeRandomWritingTopicPicker();
}

async function studentLogin(username, password) {
  const client = await ensureSupabaseSession();
  const { data, error } = await client.rpc(String(CONFIG.studentLoginRpc || "flashcard_student_login"), {
    p_name: username,
    p_password: password
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.session_token) return null;
  const access = normalizeWritingTopicAccess(row.access);
  if (!access) throw new Error("暫時未能核對寫作題目權限，請稍後再試。");
  return {
    token: String(row.session_token),
    access,
    user: {
      id: String(row.id || ""),
      name: String(row.name || username),
      role: "student"
    }
  };
}

async function adminLogin(username, password) {
  const payload = await apiJson("/v1/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  }, false);
  const admin = payload?.admin;
  if (!admin?.adminToken) return null;
  return {
    token: String(admin.adminToken),
    user: {
      id: String(admin.id || "writing-submission-admin"),
      name: String(admin.name || username),
      role: "admin"
    }
  };
}

async function validateRestoredSession() {
  const saved = readSession();
  if (!saved?.token || !["student", "admin"].includes(saved.role)) return false;
  state.authToken = String(saved.token);
  state.user = {
    id: String(saved.id || ""),
    name: String(saved.name || ""),
    role: saved.role
  };
  // Browser storage is identity continuity only. Permissions may have changed
  // since the previous page/session and are restored from the canonical
  // database-backed profile below.
  state.studentAccess = Object.create(null);
  state.studentAccessReady = false;
  try {
    const payload = await apiJson(saved.role === "admin" ? "/v1/admin/me" : "/v1/student/me");
    const profile = saved.role === "admin" ? payload?.admin : payload?.student;
    if (!profile?.id || !profile?.name) throw new Error("Invalid restored profile");
    if (saved.role === "student") {
      const access = normalizeWritingTopicAccess(profile.access);
      if (!access) throw new Error("Invalid restored topic access");
      state.studentAccess = access;
      state.studentAccessReady = true;
    }
    state.user = { id: String(profile.id), name: String(profile.name), role: saved.role };
    saveSession();
    if (saved.role === "student") {
      window.EdmundSystemNav?.rememberStudentSession({
        token: state.authToken,
        id: state.user.id,
        name: state.user.name,
        role: "student"
      });
    }
    return true;
  } catch (error) {
    console.warn("Writing Submission session restore failed", error);
    clearSession();
    return false;
  }
}

function draftStorageKey() {
  return state.user?.id ? `${DRAFT_KEY_PREFIX}:${state.user.id}` : "";
}

function newDocumentId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto.getRandomValues !== "function") {
    throw new Error("這個瀏覽器未能建立安全文件編號，請更新瀏覽器後再試。");
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-");
}

function safeWritingPromptImage(value) {
  const source = String(value || "").trim();
  if (
    !source
    || source.length > 500
    || source.includes("://")
    || source.startsWith("//")
    || source.includes("\\")
    || source.startsWith("data:")
  ) return "";
  if (source.startsWith("/") || source.startsWith("./") || /^[a-z0-9][a-z0-9_./%()' -]*$/i.test(source)) {
    return source;
  }
  return "";
}

function normalizeWritingTopicResource(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const id = String(value.id || "").slice(0, 240);
  const label = String(value.label || "").trim().slice(0, 500);
  const exerciseId = writingExerciseIdFromTopicResource({ id });
  if (!id || !label || !exerciseId || (value.type && value.type !== "fill-blanks")) return null;
  const questionPrompt = (Array.isArray(value.questionPrompt) ? value.questionPrompt : [])
    .map(line => String(line || "").trim().slice(0, 4000))
    .filter(Boolean)
    .slice(0, 30);
  const questionImages = (Array.isArray(value.questionImages) ? value.questionImages : [])
    .map((image) => {
      const source = safeWritingPromptImage(typeof image === "string" ? image : image?.src);
      if (!source) return null;
      return {
        src: source,
        alt: String(typeof image === "string" ? "Writing question image" : image?.alt || "Writing question image").slice(0, 300)
      };
    })
    .filter(Boolean)
    .slice(0, 8);
  return {
    id,
    type: "fill-blanks",
    label,
    detail: String(value.detail || "Writing Practice").slice(0, 300),
    // Build this from the canonical exercise id instead of trusting a saved
    // resource URL. Apart from keeping restored drafts safe, the expandable
    // reference catalogue uses this exact route as its integrity check.
    url: `writing-practice.html?exercise=${encodeURIComponent(exerciseId)}`,
    sectionKey: String(value.sectionKey || "").slice(0, 100),
    questionPrompt,
    questionImages
  };
}

function writingTopicSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[’]/g, "'")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, " ")
    .trim();
}

function writingTopicSearchTokens(value) {
  return writingTopicSearchText(value).split(/\s+/u).filter(Boolean);
}

function canAccessWritingTopic(resource) {
  return writingTopicAccessAllows(
    resource,
    state.studentAccess,
    state.studentAccessReady
  );
}

function canonicalWritingTopicResource(resource = state.selectedTopicResource) {
  return canonicalAccessibleWritingTopic(
    state.topicCatalog,
    resource,
    state.studentAccess,
    state.studentAccessReady
  );
}

function canonicalWritingTopicResourceForTransport(resource = state.selectedTopicResource) {
  return writingTopicResourceForTransport(canonicalWritingTopicResource(resource));
}

async function resolvePersistedWritingTopicResource(resource) {
  const normalized = normalizeWritingTopicResource(resource);
  if (!normalized?.id) return null;
  try {
    await loadWritingTopicCatalog();
  } catch (error) {
    console.warn("Writing topic permission catalogue failed", error);
    return null;
  }
  return canonicalWritingTopicResource(normalized);
}

function writingExerciseIdFromTopicResource(resource) {
  const id = String(resource?.id || "");
  return id.startsWith("fill:") ? id.slice(5) : "";
}

function selectedTopicReferenceRoute(resource = state.selectedTopicResource) {
  const canonical = canonicalWritingTopicResource(resource);
  if (!canonical) return null;
  const exerciseId = writingExerciseIdFromTopicResource(canonical);
  if (!exerciseId) return null;
  const essayKey = essayPortals?.fromWritingExerciseId(exerciseId) || "";
  if (essayKey && !essayPortals.hasWritingPractice(essayKey)) return null;
  const dsePartAMatch = /^dse-writing-(20(?:1[2-9]|2[0-5]))-part-a(?:-argument-(?:for|against))?$/i.exec(exerciseId);
  const hkpfCompositionMatch = /^hkpf-civic-composition-([4-6])$/i.exec(exerciseId);
  const flashDeckId = essayKey && essayPortals.hasFlashcards(essayKey)
    ? essayPortals.flashDeckId(essayKey)
    : dsePartAMatch
      ? `dse/writing/part-a/${dsePartAMatch[1]}`
      : hkpfCompositionMatch
        ? `government/hkpf/writing-composition/composition-${hkpfCompositionMatch[1]}`
        : "";
  const hasFlashcards = Boolean(flashDeckId);
  const writingHref = `writing-practice.html?exercise=${encodeURIComponent(exerciseId)}`;
  return {
    exerciseId,
    essayKey,
    flashDeckId,
    hasFlashcards,
    flashcardsHref: essayKey && hasFlashcards
      ? essayPortals.href("flashcards", essayKey)
      : hasFlashcards
        ? `flashcards.html?deck=${encodeURIComponent(flashDeckId)}`
        : "",
    writingHref
  };
}

function topicReferenceLinkRow(label, href, kind) {
  const row = createElement("p", "topic-reference-link-row");
  row.append(createElement("span", "", label));
  const link = createElement("a", "topic-reference-clip", "📎");
  link.href = href;
  link.dataset.topicReferenceLink = kind;
  link.setAttribute("aria-label", kind === "flashcards"
    ? "前往相關 Flash Card"
    : "前往相關 Fill In The Blanks 練習");
  link.title = link.getAttribute("aria-label");
  row.append(link);
  return row;
}

function topicReferenceDetails(kind, label, exerciseId) {
  const details = createElement("details", "topic-reference-details");
  details.dataset.topicReferenceKind = kind;
  details.dataset.topicReferenceExercise = exerciseId;
  const summary = createElement("summary", "topic-reference-summary");
  summary.append(
    createElement("span", "topic-reference-book", "Open Book"),
    createElement("strong", "", label),
    createElement("span", "topic-reference-chevron", "+")
  );
  const content = createElement("div", "topic-reference-content");
  content.dataset.topicReferenceContent = kind;
  content.setAttribute("aria-live", "polite");
  details.append(summary, content);
  return details;
}

function renderSelectedTopicReferences() {
  if (!elements.topicReferenceArea) return;
  const route = selectedTopicReferenceRoute();
  elements.topicReferenceArea.replaceChildren();
  elements.topicReferenceArea.hidden = true;
  if (!route) return;

  const links = createElement("div", "topic-reference-links");
  if (route.flashcardsHref) {
    links.append(topicReferenceLinkRow(
      "重溫 Flash Card 請按這裡：",
      route.flashcardsHref,
      "flashcards"
    ));
  }
  if (route.writingHref) {
    links.append(topicReferenceLinkRow(
      "重溫 Fill In The Blanks 請按這裡：",
      route.writingHref,
      "writing"
    ));
  }

  const disclosures = createElement("div", "topic-reference-disclosures");
  disclosures.append(topicReferenceDetails(
    "model-essay",
    "展開以 Open Book 參考 Edmund 範文 Model Essay",
    route.exerciseId
  ));
  if (route.hasFlashcards) {
    disclosures.append(topicReferenceDetails(
      "vocabulary",
      "展開以 Open Book 參考 Edmund 主題性生字 Thematic Vocabulary",
      route.exerciseId
    ));
  }
  elements.topicReferenceArea.append(links, disclosures);
  elements.topicReferenceArea.hidden = false;
}

async function loadTopicReferenceCatalog({ retry = false } = {}) {
  if (state.topicReferenceCatalog && !retry) return state.topicReferenceCatalog;
  if (retry) {
    state.topicReferenceCatalog = null;
    state.topicReferencePromise = null;
    state.topicReferenceImportAttempt += 1;
  }
  if (!state.topicReferencePromise) {
    const retryKey = state.topicReferenceImportAttempt
      ? `&retry=${state.topicReferenceImportAttempt}`
      : "";
    state.topicReferencePromise = import(
      `./writing-submission-reference-data.mjs?v=${TOPIC_REFERENCE_VERSION}${retryKey}`
    )
      .then((module) => {
        const catalog = module.WRITING_SUBMISSION_REFERENCE_DATA;
        if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
          throw new Error("Writing reference catalogue is invalid");
        }
        state.topicReferenceCatalog = catalog;
        return catalog;
      })
      .catch((error) => {
        state.topicReferencePromise = null;
        throw error;
      });
  }
  return state.topicReferencePromise;
}

function topicReferenceError(content) {
  const error = createElement("div", "topic-reference-error");
  error.append(createElement("p", "", "暫時未能載入參考內容。您仍可使用上方連結前往相關練習。"));
  const retry = createElement("button", "small-button topic-reference-retry", "重新載入");
  retry.type = "button";
  retry.dataset.topicReferenceRetry = "true";
  error.append(retry);
  content.replaceChildren(error);
}

function renderModelEssayReference(content, reference) {
  const paragraphs = Array.isArray(reference?.paragraphs) ? reference.paragraphs : [];
  if (!paragraphs.length) throw new Error("Model essay reference is empty");
  const hasChinese = paragraphs.some((paragraph) => String(paragraph?.chinese || "").trim());
  const toolbar = createElement("div", "topic-reference-toolbar");
  toolbar.append(createElement("strong", "", "Edmund 範文 Model Essay"));
  const toggle = createElement("label", "topic-reference-translation-toggle");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.topicReferenceTranslationToggle = "true";
  checkbox.disabled = !hasChinese;
  toggle.append(checkbox, createElement("span", "", "中文翻譯"));
  toolbar.append(toggle);

  const essay = createElement("div", "topic-reference-model-essay");
  for (const [index, paragraph] of paragraphs.entries()) {
    const card = createElement("article", "topic-reference-paragraph");
    card.append(
      createElement("h4", "", paragraph?.label || `Paragraph ${index + 1}`),
      createElement("p", "topic-reference-english", paragraph?.english || "")
    );
    if (paragraph?.chinese) {
      const chinese = createElement("p", "topic-reference-chinese", paragraph.chinese);
      chinese.dataset.topicReferenceChinese = "true";
      chinese.hidden = true;
      card.append(chinese);
    }
    essay.append(card);
  }
  content.replaceChildren(toolbar, essay);
}

function renderVocabularyReference(content, reference) {
  const vocabulary = Array.isArray(reference?.vocabulary) ? reference.vocabulary : [];
  if (!vocabulary.length) throw new Error("Thematic vocabulary reference is empty");
  const head = createElement("div", "topic-reference-vocabulary-head");
  head.append(createElement("strong", "", "Edmund 主題性生字 Thematic Vocabulary"));
  const controls = createElement("div", "topic-reference-vocabulary-controls");
  controls.append(createElement("span", "", `${vocabulary.length} 組`));
  const scaleLabel = createElement("label", "topic-reference-vocabulary-scale");
  scaleLabel.append(createElement("span", "", "文字大小"));
  const scale = document.createElement("select");
  scale.dataset.topicReferenceVocabularyScale = "true";
  scale.setAttribute("aria-label", "調整主題性生字表字體大小");
  for (const value of VOCABULARY_TEXT_SCALE_VALUES) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = `${value}×`;
    option.selected = value === 1;
    scale.append(option);
  }
  scaleLabel.append(scale);
  controls.append(scaleLabel);
  head.append(controls);
  const scroller = createElement("div", "topic-reference-table-scroll");
  const table = createElement("table", "topic-reference-table");
  const caption = createElement("caption", "sr-only", "Thematic Vocabulary English and Chinese glossary");
  const tableHead = document.createElement("thead");
  const headingRow = document.createElement("tr");
  headingRow.append(
    createElement("th", "", "English"),
    createElement("th", "", "中文翻譯")
  );
  tableHead.append(headingRow);
  const tableBody = document.createElement("tbody");
  for (const row of vocabulary) {
    const tableRow = document.createElement("tr");
    tableRow.dataset.topicReferenceVocabulary = String(row?.english || "");
    const englishCell = createElement("td", "", row?.english || "");
    const usageStatus = createElement("span", "sr-only", "，尚未在文章使用");
    usageStatus.dataset.topicReferenceVocabularyUsageStatus = "true";
    englishCell.append(usageStatus);
    tableRow.append(englishCell, createElement("td", "", row?.chinese || ""));
    tableBody.append(tableRow);
  }
  table.append(caption, tableHead, tableBody);
  scroller.append(table);
  content.replaceChildren(head, scroller);
  refreshVocabularyUsage(content);
}

function refreshVocabularyUsage(root = elements.topicReferenceArea) {
  if (!root) return;
  const answer = elements.writingInput?.value || "";
  root.querySelectorAll("[data-topic-reference-vocabulary]").forEach((row) => {
    const used = vocabularyEntryUsed(answer, row.dataset.topicReferenceVocabulary);
    row.classList.toggle("is-used", used);
    const status = row.querySelector("[data-topic-reference-vocabulary-usage-status]");
    if (status) status.textContent = used ? "，已在文章使用" : "，尚未在文章使用";
  });
}

async function loadTopicReferenceDetails(details, { retry = false } = {}) {
  if (!details?.open || details.dataset.topicReferenceLoaded === "true" && !retry) return;
  const route = selectedTopicReferenceRoute();
  if (!route || details.dataset.topicReferenceExercise !== route.exerciseId) return;
  const content = details.querySelector("[data-topic-reference-content]");
  if (!content) return;
  content.replaceChildren(loadingState("正在載入 Edmund 參考內容…"));
  try {
    const catalog = await loadTopicReferenceCatalog({ retry });
    const currentRoute = selectedTopicReferenceRoute();
    if (
      !details.isConnected
      || !currentRoute
      || currentRoute.exerciseId !== route.exerciseId
      || details.dataset.topicReferenceExercise !== currentRoute.exerciseId
    ) return;
    const reference = catalog[route.exerciseId];
    if (
      !reference
      || reference.exerciseId !== route.exerciseId
      || reference.essayKey !== route.essayKey
      || reference.writingHref !== route.writingHref
      || reference.flashDeckId !== route.flashDeckId
    ) {
      throw new Error(`Writing reference is missing for ${route.exerciseId}`);
    }
    if (details.dataset.topicReferenceKind === "model-essay") {
      renderModelEssayReference(content, reference);
    } else if (details.dataset.topicReferenceKind === "vocabulary") {
      renderVocabularyReference(content, reference);
    } else {
      throw new Error("Unknown writing reference type");
    }
    details.dataset.topicReferenceLoaded = "true";
  } catch (error) {
    console.warn("Writing topic reference failed", error);
    details.dataset.topicReferenceLoaded = "false";
    if (details.isConnected) topicReferenceError(content);
  }
}

async function loadWritingTopicCatalog() {
  if (state.topicCatalog.length) return state.topicCatalog;
  if (!state.topicCatalogPromise) {
    state.topicCatalogPromise = import(`./homework-resource-catalog.mjs?v=${TOPIC_CATALOG_VERSION}`)
      .then((module) => {
        const source = Array.isArray(module.HOMEWORK_RESOURCE_CATALOG)
          ? module.HOMEWORK_RESOURCE_CATALOG
          : [];
        const catalog = source
          .filter(resource => resource?.type === "fill-blanks")
          .map(normalizeWritingTopicResource)
          .filter(Boolean);
        const ids = new Set();
        for (const resource of catalog) {
          if (ids.has(resource.id)) throw new Error(`Duplicate writing topic resource: ${resource.id}`);
          ids.add(resource.id);
        }
        state.topicCatalog = catalog;
        return state.topicCatalog;
      })
      .finally(() => { state.topicCatalogPromise = null; });
  }
  return state.topicCatalogPromise;
}

function renderSelectedTopicPreview() {
  const resource = canonicalWritingTopicResource(state.selectedTopicResource);
  state.selectedTopicResource = resource;
  if (!elements.selectedTopicPreview) return;
  if (!resource?.questionImages.length) {
    elements.selectedTopicPreview.hidden = true;
    elements.selectedTopicPreview.replaceChildren();
    renderSelectedTopicReferences();
    return;
  }
  const head = createElement("div", "selected-topic-preview-head");
  head.append(createElement("strong", "", resource.label));
  const controls = createElement("div", "selected-topic-preview-controls");
  const zoomLabel = createElement("label", "selected-topic-zoom");
  zoomLabel.append(createElement("span", "", "圖片大小"));
  const zoom = document.createElement("select");
  zoom.dataset.topicImageZoom = "true";
  for (const value of [0.5, 1, 2, 3, 4, 5, 7]) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = `${value}×`;
    option.selected = value === state.writingImageZoom;
    zoom.append(option);
  }
  zoomLabel.append(zoom);
  const remove = createElement("button", "", "移除附圖");
  remove.type = "button";
  remove.dataset.removeTopicPreview = "true";
  controls.append(zoomLabel, remove);
  head.append(controls);
  const images = createElement("div", "selected-topic-images");
  for (const image of resource.questionImages) {
    const viewport = createElement("div", "selected-topic-image-viewport");
    const node = document.createElement("img");
    node.src = image.src;
    node.alt = image.alt;
    node.loading = "lazy";
    node.decoding = "async";
    node.style.width = `${Math.round(340 * state.writingImageZoom)}px`;
    viewport.append(node);
    images.append(viewport);
  }
  elements.selectedTopicPreview.replaceChildren(head, images);
  elements.selectedTopicPreview.hidden = false;
  renderSelectedTopicReferences();
}

function writingTopicResultHaystack(resource) {
  return writingTopicSearchText([
    resource.label,
    resource.detail,
    resource.sectionKey,
    ...resource.questionPrompt
  ].join(" "));
}

function renderWritingTopicResults(query = "") {
  if (!elements.topicPickerResults) return;
  const tokens = writingTopicSearchTokens(query);
  const matches = state.topicCatalog
    .filter(canAccessWritingTopic)
    .filter((resource) => {
      if (!tokens.length) return true;
      const haystack = writingTopicResultHaystack(resource);
      return tokens.every(token => haystack.includes(token));
    })
    .slice(0, 30);
  if (!matches.length) {
    elements.topicPickerResults.replaceChildren(emptyState("找不到符合關鍵字而且已開放的寫作題目。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const resource of matches) {
    const button = createElement("button", "topic-picker-result");
    button.type = "button";
    button.dataset.selectWritingTopic = resource.id;
    button.append(
      createElement("strong", "", resource.label),
      createElement("small", "", resource.detail || "Writing Practice"),
      createElement("em", "", "選擇")
    );
    if (resource.questionPrompt.length || resource.questionImages.length) {
      const preview = createElement("div", "topic-picker-result-preview");
      for (const line of resource.questionPrompt.slice(0, 3)) preview.append(createElement("p", "", line));
      if (resource.questionImages.length) {
        const images = createElement("div", "topic-picker-result-images");
        for (const image of resource.questionImages.slice(0, 3)) {
          const node = document.createElement("img");
          node.src = image.src;
          node.alt = image.alt;
          node.loading = "lazy";
          node.decoding = "async";
          images.append(node);
        }
        preview.append(images);
      }
      button.append(preview);
    }
    fragment.append(button);
  }
  elements.topicPickerResults.replaceChildren(fragment);
}

async function openWritingTopicPicker() {
  elements.topicPickerResults.replaceChildren(loadingState("正在載入寫作練習題目…"));
  if (typeof elements.topicPicker.showModal === "function") elements.topicPicker.showModal();
  else elements.topicPicker.setAttribute("open", "");
  try {
    await loadWritingTopicCatalog();
    renderWritingTopicResults(elements.topicPickerSearch.value);
    window.setTimeout(() => elements.topicPickerSearch.focus(), 0);
  } catch (error) {
    console.warn("Writing topic catalog failed", error);
    elements.topicPickerResults.replaceChildren(emptyState("暫時未能載入寫作練習題目。您仍可自行輸入題目。"));
  }
}

function closeWritingTopicPicker() {
  if (typeof elements.topicPicker.close === "function") elements.topicPicker.close();
  else elements.topicPicker.removeAttribute("open");
}

function randomTopicCategory(categoryId) {
  return WRITING_RANDOM_TOPIC_CATEGORIES.find((category) => category.id === categoryId) || null;
}

function accessibleRandomWritingTopics(categoryId) {
  return writingRandomTopicCandidates(
    state.topicCatalog,
    categoryId,
    (resource) => Boolean(canonicalWritingTopicResource(resource.id))
  );
}

function refreshRandomTopicChoices({ loading = false } = {}) {
  let availableCategories = 0;
  for (const button of elements.randomTopicChoices) {
    const category = randomTopicCategory(button.dataset.randomTopicCategory);
    const count = button.querySelector("[data-random-topic-count]");
    const candidates = category && !loading ? accessibleRandomWritingTopics(category.id) : [];
    button.disabled = loading || !category || candidates.length === 0;
    if (count) count.textContent = loading
      ? "正在檢查權限…"
      : candidates.length
        ? `${candidates.length} 題已開放`
        : "此類別尚未開放";
    if (candidates.length) availableCategories += 1;
  }
  return availableCategories;
}

function randomTopicDialogOpen() {
  return Boolean(elements.randomTopicDialog?.open || elements.randomTopicDialog?.hasAttribute("open"));
}

async function openRandomWritingTopicPicker() {
  if (!elements.randomTopicDialog) return;
  const generation = state.randomTopicGeneration + 1;
  state.randomTopicGeneration = generation;
  refreshRandomTopicChoices({ loading: true });
  setStatus(elements.randomTopicStatus, "正在核對可用題目…");
  if (typeof elements.randomTopicDialog.showModal === "function") elements.randomTopicDialog.showModal();
  else elements.randomTopicDialog.setAttribute("open", "");

  if (state.user?.role !== "student" || !state.studentAccessReady) {
    setStatus(elements.randomTopicStatus, "暫時未能核對你的題目權限，請重新登入後再試。", "error");
    return;
  }
  try {
    await loadWritingTopicCatalog();
    if (generation !== state.randomTopicGeneration || !randomTopicDialogOpen()) return;
    const availableCategories = refreshRandomTopicChoices();
    setStatus(
      elements.randomTopicStatus,
      availableCategories ? "請選擇一個類別。" : "你的帳戶目前沒有已開放的隨機題目。",
      availableCategories ? "" : "error"
    );
    elements.randomTopicChoices.find((button) => !button.disabled)?.focus();
  } catch (error) {
    console.warn("Random writing topic catalog failed", error);
    if (generation !== state.randomTopicGeneration || !randomTopicDialogOpen()) return;
    refreshRandomTopicChoices({ loading: true });
    setStatus(elements.randomTopicStatus, "暫時未能載入寫作題目，請稍後再試。", "error");
  }
}

function closeRandomWritingTopicPicker() {
  state.randomTopicGeneration += 1;
  if (!elements.randomTopicDialog) return;
  if (typeof elements.randomTopicDialog.close === "function" && elements.randomTopicDialog.open) {
    elements.randomTopicDialog.close();
  } else {
    elements.randomTopicDialog.removeAttribute("open");
  }
}

async function assignRandomWritingTopic(categoryId) {
  const category = randomTopicCategory(String(categoryId || ""));
  if (!category || !randomTopicDialogOpen()) return;
  const generation = state.randomTopicGeneration;
  refreshRandomTopicChoices({ loading: true });
  setStatus(elements.randomTopicStatus, `正在從 ${category.label} 派送題目…`);
  try {
    await loadWritingTopicCatalog();
    if (generation !== state.randomTopicGeneration || !randomTopicDialogOpen()) return;
    const candidates = accessibleRandomWritingTopics(category.id);
    if (!candidates.length) throw new Error("這個類別目前沒有你可使用的題目。");
    const selected = candidates[unbiasedRandomIndex(candidates.length)];
    const canonical = canonicalWritingTopicResource(selected?.id);
    if (!canonical) throw new Error("這條題目的權限已更新，請重新選擇類別。");
    selectWritingTopic(canonical.id, { persist: true, close: false, toast: false });
    closeRandomWritingTopicPicker();
    showToast(`已從 ${category.label} 隨機派送一條題目；你仍可自行修改。`, "success");
  } catch (error) {
    if (generation !== state.randomTopicGeneration || !randomTopicDialogOpen()) return;
    refreshRandomTopicChoices();
    setStatus(elements.randomTopicStatus, error.message || "暫時未能派送題目，請稍後再試。", "error");
  }
}

function selectWritingTopic(resourceId, { persist = true, close = true, toast = true } = {}) {
  const resource = canonicalWritingTopicResource(resourceId);
  if (!resource) return;
  const topic = resource.questionPrompt.length
    ? resource.questionPrompt.join("\n\n")
    : resource.label;
  elements.topicInput.value = topic.slice(0, 4000);
  state.selectedTopicResource = resource;
  renderSelectedTopicPreview();
  markWritingActivity();
  updateEditorMetrics();
  if (persist) persistDraft();
  if (close) closeWritingTopicPicker();
  if (toast) showToast("已貼上寫作練習題目；您仍可自行修改。", "success");
}

function readDraft() {
  const key = draftStorageKey();
  if (!key) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!UUID_RE.test(String(value?.documentId || ""))) return null;
    const rawSubmissionDuration = value?.submissionDurationSeconds;
    const submissionDurationSeconds = rawSubmissionDuration === null || rawSubmissionDuration === undefined
      ? Number.NaN
      : Number(rawSubmissionDuration);
    return {
      documentId: String(value.documentId),
      topic: String(value.topic || ""),
      answer: String(value.answer || ""),
      durationSeconds: Math.max(0, Math.min(31536000, Number(value.durationSeconds || 0))),
      submissionDurationSeconds: Number.isSafeInteger(submissionDurationSeconds)
        && submissionDurationSeconds >= 0
        && submissionDurationSeconds <= 31536000
        ? submissionDurationSeconds
        : null,
      writingTimer: normalizeWritingTimer(value.writingTimer),
      writingStopwatch: normalizeWritingStopwatch(value.writingStopwatch),
      proofreadingGate: normalizeWritingProofreadingGate(value.proofreadingGate),
      writingImageZoom: [0.5, 1, 2, 3, 4, 5, 7].includes(Number(value.writingImageZoom))
        ? Number(value.writingImageZoom)
        : 1,
      selectedTopicResource: normalizeWritingTopicResource(value.selectedTopicResource)
    };
  } catch {
    return null;
  }
}

function persistDraft() {
  const key = draftStorageKey();
  if (!key || !state.documentId) return;
  try {
    accrueWritingTime();
    sessionStorage.setItem(key, JSON.stringify({
      documentId: state.documentId,
      topic: elements.topicInput.value,
      answer: elements.writingInput.value,
      durationSeconds: Math.round(state.draftDurationSeconds),
      submissionDurationSeconds: state.submissionDurationSeconds,
      writingTimer: normalizeWritingTimer(state.writingTimer),
      writingStopwatch: normalizeWritingStopwatch(state.writingStopwatch),
      proofreadingGate: normalizeWritingProofreadingGate(state.proofreadingGate),
      writingImageZoom: state.writingImageZoom,
      selectedTopicResource: canonicalWritingTopicResource(state.selectedTopicResource),
      savedAt: new Date().toISOString()
    }));
  } catch {
    // Draft persistence is a convenience; submission remains available.
  }
}

function scheduleDraftSave() {
  window.clearTimeout(state.draftSaveTimer);
  state.draftSaveTimer = window.setTimeout(persistDraft, 280);
}

function clearStoredDraft() {
  const key = draftStorageKey();
  if (!key) return;
  try { sessionStorage.removeItem(key); } catch { /* Ignore unavailable storage. */ }
}

function issueQueueStorageKey(userId = state.user?.id) {
  return userId ? `${ISSUE_QUEUE_KEY_PREFIX}:${userId}` : "";
}

function persistIssueQueue() {
  const key = issueQueueStorageKey();
  if (!key) return;
  try {
    const values = [...state.pendingOccurrences.values()].slice(-100);
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // The live queue still retries during this page session.
  }
}

function restoreIssueQueue() {
  const key = issueQueueStorageKey();
  state.pendingOccurrences.clear();
  if (!key) return;
  try {
    const values = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(values)) return;
    for (const value of values.slice(-100)) {
      const occurrence = value?.occurrence;
      if (
        !UUID_RE.test(String(value?.documentId || ""))
        || !/^[0-9a-f]{64}$/u.test(String(occurrence?.fingerprint || ""))
        || !UUID_RE.test(String(occurrence?.id || ""))
      ) continue;
      state.pendingOccurrences.set(String(occurrence.fingerprint), {
        documentId: String(value.documentId),
        occurrence
      });
    }
    if (state.pendingOccurrences.size) scheduleOccurrenceFlush();
  } catch {
    // Ignore a corrupt convenience queue; the server remains authoritative.
  }
}

function autosizeTextarea(textarea, minimum = 0) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(minimum, textarea.scrollHeight)}px`;
}

function updateEditorMetrics() {
  elements.wordCount.textContent = String(countEnglishWords(elements.writingInput.value));
  const changed = Boolean(elements.topicInput.value.trim() || elements.writingInput.value.trim());
  elements.draftState.textContent = changed ? "正在編輯" : "尚未提交";
  autosizeTextarea(elements.topicInput, 108);
  autosizeTextarea(elements.writingInput, 480);
}

function syncWritingProofreadingUi(now = Date.now()) {
  const previousStatus = state.proofreadingGate?.status || "idle";
  const gate = normalizeWritingProofreadingGate(state.proofreadingGate, now);
  state.proofreadingGate = gate;
  const remaining = writingProofreadingRemaining(gate, now);
  const active = isWritingProofreadingActive(gate, now);
  const ready = isWritingProofreadingReady(gate, now);
  const field = elements.writingInput.closest(".writing-field-main");
  field?.classList.toggle("is-proofreading", active);
  if (elements.proofreadingLabel) {
    elements.proofreadingLabel.hidden = !active && !ready;
    elements.proofreadingLabel.textContent = active
      ? `校對時間 · ${formatWritingProofreading(remaining)}`
      : ready
        ? "校對完成"
        : "校對時間";
  }
  if (active) {
    elements.submitWriting.textContent = `校對文章再提交 (${formatWritingProofreading(remaining)})`;
    elements.submitWriting.disabled = true;
  } else {
    elements.submitWriting.textContent = "提交文章";
    elements.submitWriting.disabled = Boolean(state.submissionPromise);
  }
  if (previousStatus === "active" && ready) {
    persistDraft();
    setStatus(elements.submissionStatus, "五分鐘校對時間已完成；現在可再次按「提交文章」。", "success");
    showToast("校對時間完成，現在可以提交文章。", "success");
    if (
      state.writingTimer.status === "expired"
      && state.writingTimer.forceSubmit
      && !state.writingTimer.autoSubmitAttemptedAt
    ) window.setTimeout(() => attemptTimerForceSubmission(), 0);
  }
}

function startWritingProofreadingClock() {
  window.clearInterval(state.proofreadingClock);
  state.proofreadingClock = window.setInterval(() => syncWritingProofreadingUi(), 500);
  syncWritingProofreadingUi();
}

function beginWritingProofreading() {
  const topic = elements.topicInput.value.trim();
  const answer = elements.writingInput.value.trim();
  if (!topic || !answer) throw new Error("請先輸入寫作題目及文章內容。");
  state.proofreadingGate = startWritingProofreadingGate();
  persistDraft();
  syncWritingProofreadingUi();
  setStatus(elements.submissionStatus, "校對時間已開始。請用五分鐘檢查內容，倒數完成後即可正式提交。", "success");
  showToast("已進入五分鐘校對時間。", "success");
  elements.writingInput.focus({ preventScroll: true });
}

function setWritingTimerInputs(durationSeconds) {
  const seconds = Math.max(0, Math.round(Number(durationSeconds || 0)));
  elements.writingTimerHours.value = String(Math.floor(seconds / 3600));
  elements.writingTimerMinutes.value = String(Math.floor((seconds % 3600) / 60));
  elements.writingTimerSeconds.value = String(seconds % 60);
}

function writingTimerStatusText(timer) {
  if (timer.status === "running") {
    return timer.forceSubmit
      ? "倒數進行中；時間到後會自動提交目前文章。"
      : "倒數進行中；時間到後只會提示，不會自動提交。";
  }
  if (timer.status === "paused") return "倒數已暫停；按「繼續倒數」即可恢復。";
  if (timer.status === "expired") {
    if (state.timerAutoSubmitLock || state.submissionPromise) return "時間已到，正在安全提交文章……";
    if (timer.autoSubmitError) return timer.autoSubmitError;
    if (timer.forceSubmit && timer.autoSubmitAttemptedAt) return "上次自動提交的結果未能確認；如文章仍在，請按「重試自動提交」。";
    return timer.forceSubmit ? "時間已到，正準備自動提交。" : "時間已到；文章不會自動提交。";
  }
  return "尚未開始倒數。";
}

function syncWritingTimerUi() {
  if (!elements.writingTimerPanel) return;
  const previousStatus = state.writingTimer.status;
  const timer = normalizeWritingTimer(state.writingTimer);
  state.writingTimer = timer;
  const remaining = writingTimerRemaining(timer);
  const display = formatWritingTimer(remaining);
  elements.writingTimerPanel.hidden = !state.writingTimerPanelOpen;
  elements.writingTimerToggle.setAttribute("aria-expanded", String(state.writingTimerPanelOpen));
  elements.writingTimerPanel.dataset.status = timer.status;
  elements.writingTimerDisplay.textContent = display;
  elements.writingTimerToggleDisplay.textContent = display;
  elements.writingTimerForce.checked = timer.forceSubmit;
  elements.writingTimerForce.disabled = state.timerAutoSubmitLock || Boolean(state.submissionPromise);
  elements.writingTimerStart.textContent = timer.status === "paused"
    ? "繼續倒數"
    : timer.status === "expired"
      ? "重新開始"
      : timer.status === "running"
        ? "倒數中"
        : "開始倒數";
  elements.writingTimerStart.disabled = timer.status === "running" || Boolean(state.submissionPromise);
  elements.writingTimerPause.disabled = timer.status !== "running" || Boolean(state.submissionPromise);
  elements.writingTimerReset.disabled = timer.status === "idle" || Boolean(state.submissionPromise);
  elements.writingTimerRetry.hidden = !(
    timer.status === "expired"
    && timer.forceSubmit
    && !state.timerAutoSubmitLock
    && (timer.autoSubmitError || timer.autoSubmitAttemptedAt)
  );
  elements.writingTimerRetry.disabled = state.timerAutoSubmitLock || Boolean(state.submissionPromise);
  const durationLocked = timer.status !== "idle";
  elements.writingTimerHours.disabled = durationLocked;
  elements.writingTimerMinutes.disabled = durationLocked;
  elements.writingTimerSeconds.disabled = durationLocked;
  elements.writingTimerStatus.textContent = writingTimerStatusText(timer);
  if (previousStatus === "running" && timer.status === "expired") {
    persistDraft();
    if (timer.forceSubmit) window.setTimeout(() => attemptTimerForceSubmission(), 0);
    else showToast("寫作時間已到。", "error");
  }
}

function handleWritingTimerExpiry() {
  if (state.writingTimer.status === "expired") return;
  state.writingTimer = expireWritingTimer(state.writingTimer);
  persistDraft();
  syncWritingTimerUi();
  if (state.writingTimer.forceSubmit) {
    window.setTimeout(() => attemptTimerForceSubmission(), 0);
  } else {
    showToast("寫作時間已到。", "error");
  }
}

function tickWritingTimer() {
  if (idleBreakIsPaused()) return;
  if (state.writingTimer.status === "running") {
    const remaining = writingTimerRemaining(state.writingTimer);
    if (remaining <= 0) {
      handleWritingTimerExpiry();
    } else {
      state.writingTimer.remainingSeconds = remaining;
      elements.writingTimerDisplay.textContent = formatWritingTimer(remaining);
      elements.writingTimerToggleDisplay.textContent = formatWritingTimer(remaining);
    }
  }
  tickWritingStopwatch();
}

function pauseWritingTimersForIdleBreak(event) {
  const pausedAt = Number(event.detail?.pausedAt) || Date.now();
  accrueWritingTime(pausedAt, { ignoreIdleBreak: true });
  state.idleBreakTimerWasRunning = state.writingTimer.status === "running";
  state.idleBreakStopwatchWasRunning = state.writingStopwatch.status === "running";
  if (state.idleBreakTimerWasRunning) state.writingTimer = pauseWritingTimer(state.writingTimer, pausedAt);
  if (state.idleBreakStopwatchWasRunning) {
    state.writingStopwatch = pauseWritingStopwatch(state.writingStopwatch, pausedAt);
  }
  state.writingClockLastAt = pausedAt;
  persistDraft();
  syncWritingTimerUi();
  syncWritingStopwatchUi();
}

function resumeWritingTimersAfterIdleBreak(event) {
  const resumedAt = Number(event.detail?.resumedAt) || Date.now();
  const resumeTimer = state.idleBreakTimerWasRunning;
  const resumeStopwatch = state.idleBreakStopwatchWasRunning;
  state.idleBreakTimerWasRunning = false;
  state.idleBreakStopwatchWasRunning = false;
  if (resumeTimer && state.writingTimer.status === "paused") {
    state.writingTimer = resumeWritingTimer(state.writingTimer, resumedAt);
  }
  if (resumeStopwatch && state.writingStopwatch.status === "paused") {
    state.writingStopwatch = startWritingStopwatch(state.writingStopwatch, resumedAt);
  }
  state.lastWritingActivityAt = resumedAt;
  state.writingClockLastAt = resumedAt;
  persistDraft();
  syncWritingTimerUi();
  syncWritingStopwatchUi();
}

function keepWritingTimersPausedForIdleLogout() {
  state.idleBreakTimerWasRunning = false;
  state.idleBreakStopwatchWasRunning = false;
  persistDraft();
}

function syncWritingStopwatchUi() {
  if (!elements.writingStopwatch) return;
  state.writingStopwatch = normalizeWritingStopwatch(state.writingStopwatch);
  const running = state.writingStopwatch.status === "running";
  const idle = state.writingStopwatch.status === "idle";
  elements.writingStopwatch.dataset.status = state.writingStopwatch.status;
  elements.writingStopwatchDisplay.textContent = formatWritingStopwatch(state.writingStopwatch);
  elements.writingStopwatchStart.textContent = state.writingStopwatch.status === "paused" ? "繼續" : running ? "計時中" : "開始";
  elements.writingStopwatchStart.disabled = running;
  elements.writingStopwatchPause.disabled = !running;
  elements.writingStopwatchReset.disabled = idle;
}

function tickWritingStopwatch() {
  if (state.writingStopwatch.status !== "running") return;
  elements.writingStopwatchDisplay.textContent = formatWritingStopwatch(state.writingStopwatch);
}

function handleWritingStopwatchStart() {
  state.writingStopwatch = startWritingStopwatch(state.writingStopwatch);
  persistDraft();
  syncWritingStopwatchUi();
}

function handleWritingStopwatchPause() {
  state.writingStopwatch = pauseWritingStopwatch(state.writingStopwatch);
  persistDraft();
  syncWritingStopwatchUi();
}

function handleWritingStopwatchReset() {
  state.writingStopwatch = resetWritingStopwatch();
  persistDraft();
  syncWritingStopwatchUi();
}

function startWritingTimerClock() {
  if (state.writingTimerClock) return;
  state.writingTimerClock = window.setInterval(tickWritingTimer, 250);
}

function openWritingTimerPanel(open = !state.writingTimerPanelOpen) {
  state.writingTimerPanelOpen = Boolean(open);
  syncWritingTimerUi();
  if (state.writingTimerPanelOpen) {
    window.setTimeout(() => elements.writingTimerPanel.scrollIntoView({ block: "nearest", behavior: "smooth" }), 0);
  }
}

function handleWritingTimerStart() {
  try {
    state.writingTimer = state.writingTimer.status === "paused"
      ? resumeWritingTimer(state.writingTimer)
      : startWritingTimer(
        timerInputSeconds(
          elements.writingTimerHours.value,
          elements.writingTimerMinutes.value,
          elements.writingTimerSeconds.value
        ),
        elements.writingTimerForce.checked
      );
    state.writingTimer.autoSubmitAttemptedAt = 0;
    state.writingTimer.autoSubmitError = "";
    persistDraft();
    syncWritingTimerUi();
  } catch {
    elements.writingTimerStatus.textContent = "請設定最少 1 秒的倒數時間。";
    elements.writingTimerSeconds.focus();
  }
}

function handleWritingTimerPause() {
  state.writingTimer = pauseWritingTimer(state.writingTimer);
  persistDraft();
  syncWritingTimerUi();
}

function handleWritingTimerReset() {
  state.writingTimer = emptyWritingTimer();
  state.timerAutoSubmitLock = false;
  setWritingTimerInputs(40 * 60);
  persistDraft();
  syncWritingTimerUi();
}

function handleWritingTimerForceChange() {
  state.writingTimer.forceSubmit = elements.writingTimerForce.checked;
  state.writingTimer.autoSubmitError = "";
  state.writingTimer.autoSubmitAttemptedAt = 0;
  persistDraft();
  syncWritingTimerUi();
  if (state.writingTimer.status === "expired" && state.writingTimer.forceSubmit) {
    attemptTimerForceSubmission();
  }
}

async function attemptTimerForceSubmission({ retry = false } = {}) {
  if (
    state.user?.role !== "student"
    || state.writingTimer.status !== "expired"
    || !state.writingTimer.forceSubmit
    || state.timerAutoSubmitLock
    || state.submissionPromise
  ) return false;
  if (isWritingProofreadingActive(state.proofreadingGate)) {
    state.writingTimer.autoSubmitError = "寫作時間已到；系統會在目前五分鐘校對時間結束後自動提交。";
    persistDraft();
    syncWritingTimerUi();
    return false;
  }
  if (state.writingTimer.autoSubmitAttemptedAt && !retry) {
    syncWritingTimerUi();
    return false;
  }
  if (!navigator.onLine) {
    state.writingTimer.autoSubmitError = "時間已到，但目前沒有網絡。文章草稿仍安全保留；連線後可重試自動提交。";
    persistDraft();
    syncWritingTimerUi();
    return false;
  }
  if (!elements.topicInput.value.trim() || !elements.writingInput.value.trim()) {
    state.writingTimer.autoSubmitError = "時間已到，但寫作題目或文章內容仍未填寫，因此未能自動提交。補充內容後請按「重試自動提交」。";
    persistDraft();
    syncWritingTimerUi();
    return false;
  }
  state.timerAutoSubmitLock = true;
  state.writingTimer.autoSubmitAttemptedAt = Date.now();
  state.writingTimer.autoSubmitError = "";
  persistDraft();
  syncWritingTimerUi();
  try {
    await submitCurrentWriting({ source: "timer" });
    return true;
  } catch (error) {
    state.writingTimer.autoSubmitError = `時間已到，但自動提交未成功：${error.message || "請稍後重試。"}`;
    persistDraft();
    syncWritingTimerUi();
    return false;
  } finally {
    state.timerAutoSubmitLock = false;
    syncWritingTimerUi();
  }
}

function startNewDraft({ preserveView = false } = {}) {
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  clearStoredDraft();
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.documentId = newDocumentId();
  state.draftDurationSeconds = 0;
  state.submissionDurationSeconds = null;
  state.writingTimer = emptyWritingTimer();
  state.writingStopwatch = emptyWritingStopwatch();
  state.proofreadingGate = resetWritingProofreadingGate();
  state.writingImageZoom = 1;
  state.timerAutoSubmitLock = false;
  state.writingClockLastAt = Date.now();
  state.lastWritingActivityAt = Date.now();
  state.previousWriting = "";
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  elements.topicInput.value = "";
  elements.writingInput.value = "";
  state.selectedTopicResource = null;
  renderSelectedTopicPreview();
  setStatus(elements.submissionStatus, "");
  renderGrammarIssues();
  updateEditorMetrics();
  setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  syncWritingStopwatchUi();
  syncWritingProofreadingUi();
  persistDraft();
  if (!preserveView) showView("workspace");
  window.setTimeout(() => elements.topicInput.focus(), 0);
}

async function restoreDraft() {
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  restoreIssueQueue();
  const draft = readDraft();
  const selectedTopicResource = await resolvePersistedWritingTopicResource(
    draft?.selectedTopicResource
  );
  state.documentId = draft?.documentId || newDocumentId();
  state.draftDurationSeconds = draft?.durationSeconds || 0;
  state.submissionDurationSeconds = draft?.submissionDurationSeconds ?? null;
  state.writingTimer = normalizeWritingTimer(draft?.writingTimer);
  state.writingStopwatch = normalizeWritingStopwatch(draft?.writingStopwatch);
  state.proofreadingGate = normalizeWritingProofreadingGate(draft?.proofreadingGate);
  state.writingImageZoom = draft?.writingImageZoom || 1;
  state.timerAutoSubmitLock = false;
  state.writingClockLastAt = Date.now();
  state.lastWritingActivityAt = Date.now();
  state.appliedCorrections = [];
  elements.topicInput.value = draft?.topic || "";
  elements.writingInput.value = draft?.answer || "";
  state.selectedTopicResource = selectedTopicResource;
  renderSelectedTopicPreview();
  state.previousWriting = elements.writingInput.value;
  updateEditorMetrics();
  if (state.writingTimer.durationSeconds) setWritingTimerInputs(state.writingTimer.durationSeconds);
  else setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  syncWritingStopwatchUi();
  syncWritingProofreadingUi();
  renderGrammarIssues();
  persistDraft();
  const completedSegments = completedWritingSegments(elements.writingInput.value);
  if (state.grammarDetectionEnabled && completedSegments.length) {
    enqueueSegmentsForCheck(completedSegments, { remote: false });
  }
  if (
    state.writingTimer.status === "expired"
    && state.writingTimer.forceSubmit
    && !state.writingTimer.autoSubmitAttemptedAt
  ) {
    window.setTimeout(() => attemptTimerForceSubmission(), 0);
  }
}

function updateHarperStatus(status, title, detail) {
  state.checkerState = status;
  elements.harperStatus.dataset.state = status;
  const strong = elements.harperStatus.querySelector("strong");
  const small = elements.harperStatus.querySelector("small");
  if (strong) strong.textContent = title;
  if (small) small.textContent = detail;
}

async function prepareGrammarChecker() {
  if (!state.grammarDetectionEnabled) return null;
  if (state.checkerPromise) return state.checkerPromise;
  updateHarperStatus("loading", "正在準備文法偵測", "本機後備檢查首次載入約需數秒");
  state.checkerPromise = (async () => {
    const module = await import("./writing-submission-harper.js?v=20260803-grammar6");
    const checker = module.createWritingGrammarChecker();
    state.checker = checker;
    try {
      await checker.setup();
      const corpusRuleCount = Number(module.CORPUS_COMPILED_RULE_COUNT) || 0;
      const executableFamilyCount = Number(module.EXECUTABLE_COMPILED_FAMILY_COUNT) || 0;
      updateHarperStatus(
        "ready",
        "文法偵測已準備",
        `${corpusRuleCount} 條語料規則 + ${executableFamilyCount} 個可執行規則家族 + 通用文法 ${ESL_RULESET_VERSION} + Harper ${HARPER_VERSION} 後備校對`
      );
    } catch (error) {
      console.warn("Local Harper setup failed", error);
      updateHarperStatus("ready", "文法偵測已準備", "Edmund 本機規則仍可使用；Harper 暫時不可用");
    }
    return checker;
  })();
  return state.checkerPromise;
}

function syncGrammarDetectionControls() {
  if (elements.grammarToggle) elements.grammarToggle.checked = state.grammarDetectionEnabled;
  if (elements.grammarToggleLabel) {
    elements.grammarToggleLabel.textContent = state.grammarDetectionEnabled ? "開啟" : "關閉";
  }
  if (elements.grammarPanel) {
    elements.grammarPanel.dataset.detectionEnabled = String(state.grammarDetectionEnabled);
  }
}

function stopGrammarDetection() {
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.activeIssues = [];
  state.dismissedIssueIds.clear();
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  updateHarperStatus("ready", "文法偵測已關閉", "不會把句子傳送至文法服務；重新開啟後會由文章開首重新檢查");
  renderGrammarIssues();
}

function startGrammarDetection({ scanCurrentWriting = false } = {}) {
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.activeIssues = [];
  state.dismissedIssueIds.clear();
  prepareGrammarChecker()
    .then(() => {
      if (state.grammarDetectionEnabled) {
        updateHarperStatus("ready", "文法偵測已準備", `文法偵測 + 本機 ESL ${ESL_RULESET_VERSION} + Harper ${HARPER_VERSION} 後備校對`);
      }
    })
    .catch((error) => console.warn("Grammar checker setup failed", error));
  if (scanCurrentWriting) {
    const segments = completedWritingSegments(elements.writingInput.value);
    if (segments.length) enqueueSegmentsForCheck(segments, { remote: true });
  }
  renderGrammarIssues();
}

function setGrammarDetectionEnabled(enabled, { scanCurrentWriting = false } = {}) {
  const next = enabled !== false;
  const changed = state.grammarDetectionEnabled !== next;
  state.grammarDetectionEnabled = next;
  syncGrammarDetectionControls();
  if (!changed) {
    renderGrammarIssues();
    return;
  }
  if (next) startGrammarDetection({ scanCurrentWriting });
  else stopGrammarDetection();
}

async function loadWritingPreferences() {
  state.grammarDetectionEnabled = true;
  syncGrammarDetectionControls();
  try {
    const payload = await apiJson("/v1/preferences");
    setGrammarDetectionEnabled(payload?.preferences?.grammarDetectionEnabled !== false);
  } catch (error) {
    console.warn("Writing preferences could not be loaded", error);
    setGrammarDetectionEnabled(true);
  }
}

async function persistGrammarDetectionPreference(enabled) {
  const payload = await apiJson("/v1/preferences", {
    method: "PUT",
    body: JSON.stringify({ grammarDetectionEnabled: enabled })
  });
  return payload?.preferences?.grammarDetectionEnabled !== false;
}

async function handleGrammarDetectionToggle() {
  const enabled = Boolean(elements.grammarToggle?.checked);
  setGrammarDetectionEnabled(enabled, { scanCurrentWriting: enabled });
  elements.grammarToggle.disabled = true;
  try {
    const savedEnabled = await persistGrammarDetectionPreference(enabled);
    if (savedEnabled !== enabled) setGrammarDetectionEnabled(savedEnabled, { scanCurrentWriting: savedEnabled });
    showToast(enabled ? "文法偵測已開啟，正由文章開首檢查。" : "文法偵測已關閉並已保存。", "success");
  } catch (error) {
    console.warn("Writing preference save failed", error);
    showToast("偏好暫時未能同步；本頁仍會使用目前設定。", "error");
  } finally {
    elements.grammarToggle.disabled = false;
  }
}

function rebaseActiveIssues(previousValue, nextValue) {
  if (!state.activeIssues.length || previousValue === nextValue) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const liveSegments = completedWritingSegments(nextValue);
  const rebased = [];
  for (const issue of state.activeIssues) {
    if (issue.sentenceEnd <= change.start) {
      rebased.push(issue);
      continue;
    }
    if (issue.sentenceStart >= previousEnd) {
      const shifted = {
        ...issue,
        sentenceStart: issue.sentenceStart + delta,
        sentenceEnd: issue.sentenceEnd + delta,
        absoluteStart: issue.absoluteStart + delta,
        absoluteEnd: issue.absoluteEnd + delta
      };
      const liveSegment = liveSegments.find((segment) => (
        segment.start === shifted.sentenceStart
        && segment.end === shifted.sentenceEnd
        && segment.text === shifted.sentenceText
      ));
      if (liveSegment && isLiveCompletedWritingSegment(nextValue, liveSegment)) {
        rebased.push({
          ...shifted,
          id: `${shifted.fingerprint}:${liveSegment.ordinal}:${shifted.start}:${shifted.end}`,
          segmentOrdinal: liveSegment.ordinal
        });
      }
    }
    // A change inside the checked sentence invalidates that suggestion.
  }
  state.activeIssues = rebased;
}

function rebaseAppliedCorrections(previousValue, nextValue) {
  if (!state.appliedCorrections.length || previousValue === nextValue) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const rebased = [];
  for (const correction of state.appliedCorrections) {
    if (correction.absoluteEnd <= change.start) {
      rebased.push(correction);
      continue;
    }
    if (correction.absoluteStart >= previousEnd) {
      rebased.push({
        ...correction,
        absoluteStart: correction.absoluteStart + delta,
        absoluteEnd: correction.absoluteEnd + delta
      });
    }
    // A manual or accepted edit touching this exact correction clears the
    // lock so that a genuinely stronger correction may be considered later.
  }
  state.appliedCorrections = rebased;
}

function rememberAppliedCorrection(issue) {
  const before = String(issue.originalText || "");
  const after = String(issue.suggestedText || "");
  if (!before || !after || before === after) return;
  state.appliedCorrections.push({
    generation: state.checkGeneration,
    documentId: state.documentId,
    absoluteStart: issue.absoluteStart,
    absoluteEnd: issue.absoluteStart + after.length,
    before,
    after,
    categoryId: String(issue.categoryId || issue.category || ""),
    engineId: String(issue.engineId || issue.engine?.name || "")
  });
  if (state.appliedCorrections.length > 100) state.appliedCorrections.shift();
}

async function sha256Hex(value) {
  if (crypto.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
    return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  throw new Error("這個瀏覽器未能安全記錄文法問題，請更新瀏覽器後再試。");
}

function captureCheckContext() {
  return Object.freeze({
    generation: state.checkGeneration,
    userId: String(state.user?.id || ""),
    documentId: state.documentId
  });
}

function isCurrentCheckContext(context) {
  return Boolean(
    context
    && context.generation === state.checkGeneration
    && context.userId === String(state.user?.id || "")
    && context.documentId === state.documentId
    && state.user?.role === "student"
  );
}

async function decorateIssue(rawIssue, segment, context) {
  const rawStart = Number(rawIssue.start || 0);
  const rawEnd = Number(rawIssue.end || rawStart);
  const start = Math.max(0, Math.min(segment.text.length, Number.isFinite(rawStart) ? rawStart : 0));
  const end = Math.max(start, Math.min(segment.text.length, Number.isFinite(rawEnd) ? rawEnd : start));
  const ruleId = String(rawIssue.ruleId || "UnknownRule").slice(0, 120) || "UnknownRule";
  const engineIdentity = `${rawIssue.engine?.name || "harper.js"}@${rawIssue.engine?.version || HARPER_VERSION}`;
  const originalText = String(rawIssue.originalText || segment.text.slice(start, end)).slice(0, 2000);
  const suggestedText = String(rawIssue.suggestedText || "").slice(0, 2000);
  const correctedSentence = String(rawIssue.correctedSentence || segment.text).slice(0, 10000);
  // The identity represents one concrete card, not merely one rule. An
  // unchanged rescan remains idempotent, while two errors of the same rule in
  // the same composition retain separate records.
  const fingerprint = await sha256Hex(grammarOccurrenceIdentity({
    engineIdentity,
    documentId: context.documentId,
    ruleId,
    segmentOrdinal: segment.ordinal,
    sentenceText: segment.text,
    start,
    end,
    originalText,
    suggestedText,
    correctedSentence
  }));
  return {
    ...rawIssue,
    id: `${fingerprint}:${segment.ordinal}:${start}:${end}`,
    fingerprint,
    ruleId,
    title: String(rawIssue.title || rawIssue.category || ruleId).slice(0, 200),
    message: String(rawIssue.message || "請檢查這部分的文法。").slice(0, 2000),
    originalText,
    suggestedText,
    correctedSentence,
    start,
    end,
    documentId: context.documentId,
    userId: context.userId,
    generation: context.generation,
    sentenceText: segment.text,
    sentenceStart: segment.start,
    sentenceEnd: segment.end,
    segmentOrdinal: segment.ordinal,
    absoluteStart: segment.start + start,
    absoluteEnd: segment.start + end
  };
}

function scheduleOccurrenceFlush() {
  window.clearTimeout(state.occurrenceFlushTimer);
  state.occurrenceFlushTimer = window.setTimeout(() => {
    flushGrammarOccurrences().catch((error) => console.warn("Grammar occurrence flush failed", error));
  }, 900);
}

function queueOccurrence(issue) {
  if (
    !isCurrentCheckContext(issue)
    || issue.sentenceText.length > 10000
    || state.reportedFingerprints.has(issue.fingerprint)
    || state.pendingOccurrences.has(issue.fingerprint)
  ) return;
  state.pendingOccurrences.set(issue.fingerprint, {
    documentId: issue.documentId,
    occurrence: {
      id: newDocumentId(),
      fingerprint: issue.fingerprint,
      ruleId: issue.ruleId,
      title: issue.title,
      message: issue.message,
      originalText: issue.originalText,
      suggestedText: issue.suggestedText,
      sentenceText: issue.sentenceText,
      correctedSentence: issue.correctedSentence,
      detectedAt: new Date().toISOString()
    }
  });
  persistIssueQueue();
  scheduleOccurrenceFlush();
}

async function performGrammarOccurrenceFlush({ keepalive = false } = {}) {
  window.clearTimeout(state.occurrenceFlushTimer);
  state.occurrenceFlushTimer = null;
  if (state.user?.role !== "student" || !state.pendingOccurrences.size) return;
  const groups = new Map();
  for (const entry of state.pendingOccurrences.values()) {
    if (!groups.has(entry.documentId)) groups.set(entry.documentId, []);
    groups.get(entry.documentId).push(entry.occurrence);
  }
  const maximumBodyBytes = keepalive ? 52 * 1024 : 500000;
  for (const [documentId, occurrences] of groups) {
    const batches = [];
    let batch = [];
    for (const occurrence of occurrences) {
      const candidate = [...batch, occurrence];
      const candidateBody = JSON.stringify({ documentId, occurrences: candidate });
      const candidateBytes = new TextEncoder().encode(candidateBody).byteLength;
      if (batch.length && (candidate.length > 50 || candidateBytes > maximumBodyBytes)) {
        batches.push(batch);
        batch = [occurrence];
      } else {
        batch = candidate;
      }
    }
    if (batch.length) batches.push(batch);

    for (const currentBatch of batches) {
      const body = JSON.stringify({ documentId, occurrences: currentBatch });
      const bodyBytes = new TextEncoder().encode(body).byteLength;
      if (bodyBytes > maximumBodyBytes) {
        // A very large diagnostic remains in durable local storage and the
        // normal synchronization path will retry it after the page opens.
        if (keepalive) continue;
        throw new Error("文法記錄超出同步限制。");
      }
      await apiJson("/v1/grammar-occurrences/batch", { method: "POST", body, keepalive });
      for (const occurrence of currentBatch) {
        state.pendingOccurrences.delete(occurrence.fingerprint);
        state.reportedFingerprints.add(occurrence.fingerprint);
      }
      persistIssueQueue();
    }
  }
}

async function flushGrammarOccurrences(options = {}) {
  if (state.occurrenceFlushPromise) return state.occurrenceFlushPromise;
  state.occurrenceFlushPromise = performGrammarOccurrenceFlush(options)
    .finally(() => { state.occurrenceFlushPromise = null; });
  return state.occurrenceFlushPromise;
}

function cancelRemoteGrammarChecks() {
  for (const record of state.latestSegmentRecords.values()) record.superseded = true;
  for (const controller of state.remoteGrammarControllers) controller.abort();
  state.remoteGrammarControllers.clear();
  const cancelled = remoteGrammarFailureResult(
    classifyRemoteGrammarFailure({ name: "AbortError" })
  );
  for (const job of state.remoteGrammarQueue.splice(0)) job.resolve(cancelled);
  state.segmentChecks.clear();
  state.latestSegmentRecords.clear();
  state.remoteGrammarWarnings.clear();
  state.remoteGrammarBackoffUntil = 0;
  state.remoteGrammarBackoffFailure = null;
}

function segmentSlotKey(segment, context) {
  return [context.generation, context.documentId, segment.start].join("|");
}

function segmentCheckKey(segment, context, revision) {
  return [context.generation, context.documentId, segment.start, segment.end, revision, segment.text].join("|");
}

function isLatestSegmentRecord(record) {
  return Boolean(
    record
    && !record.superseded
    && isCurrentCheckContext(record.context)
    && state.latestSegmentRecords.get(record.slotKey) === record
  );
}

function supersedeSegmentRecordsAffectedByEdit(previousValue, nextValue) {
  if (previousValue === nextValue || !state.latestSegmentRecords.size) return;
  const change = insertedRange(previousValue, nextValue);
  const suffixLength = nextValue.length - change.end;
  const previousEnd = previousValue.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const liveSegments = completedWritingSegments(nextValue);
  for (const [slotKey, record] of [...state.latestSegmentRecords.entries()]) {
    if (record.segment.end <= change.start) continue;

    // An edit strictly before an unchanged sentence only shifts its offsets.
    // Keep its in-flight analysis and move the slot identity with the text.
    // Mutate the segment object in place: decorateIssue may be awaiting
    // WebCrypto with this same reference, and replacing it would let stale
    // absolute offsets publish after the await.
    if (record.segment.start >= previousEnd) {
      const shiftedStart = record.segment.start + delta;
      const liveSegment = liveSegments.find((segment) => (
        segment.start === shiftedStart && segment.text === record.segment.text
      ));
      if (!liveSegment) {
        record.superseded = true;
        record.remoteController?.abort();
        if (state.latestSegmentRecords.get(slotKey) === record) state.latestSegmentRecords.delete(slotKey);
        if (state.segmentChecks.get(record.key) === record) state.segmentChecks.delete(record.key);
        continue;
      }
      const existingAtNewSlot = state.latestSegmentRecords.get(
        segmentSlotKey(liveSegment, record.context)
      );
      if (existingAtNewSlot && existingAtNewSlot !== record) {
        record.superseded = true;
        record.remoteController?.abort();
        if (state.latestSegmentRecords.get(slotKey) === record) state.latestSegmentRecords.delete(slotKey);
        if (state.segmentChecks.get(record.key) === record) state.segmentChecks.delete(record.key);
        continue;
      }
      const nextSlotKey = segmentSlotKey(liveSegment, record.context);
      if (state.latestSegmentRecords.get(slotKey) === record) state.latestSegmentRecords.delete(slotKey);
      Object.assign(record.segment, liveSegment);
      record.slotKey = nextSlotKey;
      state.latestSegmentRecords.set(nextSlotKey, record);
      continue;
    }

    // An edit inside the sentence invalidates its exact analysis, even if the
    // student later restores the same text (the A-B-A race).
    record.superseded = true;
    record.remoteController?.abort();
    if (state.latestSegmentRecords.get(slotKey) === record) {
      state.latestSegmentRecords.delete(slotKey);
    }
    if (state.segmentChecks.get(record.key) === record) {
      state.segmentChecks.delete(record.key);
    }
  }
}

function remoteGrammarSuccessResult(issues) {
  return { issues, failure: null, skipped: false };
}

function remoteGrammarFailureResult(failure, { skipped = false } = {}) {
  return { issues: null, failure, skipped };
}

function cancelledRemoteGrammarResult() {
  return remoteGrammarFailureResult(
    classifyRemoteGrammarFailure({ name: "AbortError" })
  );
}

function inconclusiveRemoteGrammarResult() {
  return remoteGrammarFailureResult(classifyRemoteGrammarFailure({
    status: 502,
    code: "GRAMMAR_CHECK_INCONCLUSIVE"
  }));
}

async function performRemoteGrammarRequest(record) {
  if (!state.grammarDetectionEnabled) return cancelledRemoteGrammarResult();
  if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  const controller = new AbortController();
  record.remoteController = controller;
  state.remoteGrammarControllers.add(controller);
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REMOTE_GRAMMAR_REQUEST_TIMEOUT_MS);
  try {
    const response = await apiJson("/v1/grammar-check", {
      method: "POST",
      body: JSON.stringify({ sentence: record.segment.text }),
      signal: controller.signal
    });
    const issues = normalizeWritingAiResponse(record.segment.text, response);
    if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
    return remoteGrammarSuccessResult(issues);
  } catch (error) {
    if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
    const failure = classifyRemoteGrammarFailure(error, { timedOut });
    if (failure.kind !== REMOTE_GRAMMAR_FAILURE_KINDS.cancelled) {
      console.warn(
        "Advanced grammar check did not complete",
        error?.code || error?.status || failure.kind
      );
    }
    return remoteGrammarFailureResult(failure);
  } finally {
    window.clearTimeout(timeout);
    state.remoteGrammarControllers.delete(controller);
    if (record.remoteController === controller) record.remoteController = null;
  }
}

async function requestRemoteGrammarIssues(record) {
  if (!state.grammarDetectionEnabled) return cancelledRemoteGrammarResult();
  if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  if (record.segment.text.length > 2000) return inconclusiveRemoteGrammarResult();
  if (Date.now() < state.remoteGrammarBackoffUntil) {
    return remoteGrammarFailureResult(
      state.remoteGrammarBackoffFailure || classifyRemoteGrammarFailure(new TypeError("Network backoff")),
      { skipped: true }
    );
  }

  let completedRetries = 0;
  while (true) {
    const result = await performRemoteGrammarRequest(record);
    if (!result?.failure || !isLatestSegmentRecord(record)) return result;
    const retryDelayMs = remoteGrammarRetryDelayMs(result.failure, completedRetries);
    if (retryDelayMs === null) return result;
    completedRetries += 1;
    await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
    if (!isLatestSegmentRecord(record)) return cancelledRemoteGrammarResult();
  }
}

function drainRemoteGrammarQueue() {
  while (state.remoteGrammarInFlight < 2 && state.remoteGrammarQueue.length) {
    const job = state.remoteGrammarQueue.shift();
    if (!isLatestSegmentRecord(job.record)) {
      job.resolve(cancelledRemoteGrammarResult());
      continue;
    }
    state.remoteGrammarInFlight += 1;
    requestRemoteGrammarIssues(job.record)
      .then(job.resolve, (error) => job.resolve(remoteGrammarFailureResult(
        classifyRemoteGrammarFailure(error)
      )))
      .finally(() => {
        state.remoteGrammarInFlight = Math.max(0, state.remoteGrammarInFlight - 1);
        drainRemoteGrammarQueue();
      });
  }
}

function scheduleRemoteGrammarCheck(record) {
  const promise = new Promise((resolve) => {
    state.remoteGrammarQueue.push({ record, resolve });
    drainRemoteGrammarQueue();
  });
  state.remoteGrammarPromises.add(promise);
  promise.finally(() => state.remoteGrammarPromises.delete(promise));
  return promise;
}

function publishSegmentRecord(record) {
  record.publishQueue = record.publishQueue.then(async () => {
    if (
      !record.localDone
      || !isLatestSegmentRecord(record)
      || !isLiveCompletedWritingSegment(elements.writingInput.value, record.segment)
    ) return;
    let rawIssues;
    try {
      rawIssues = mergeWritingGrammarIssues(
        record.segment.text,
        record.localIssues,
        record.remoteDone && Array.isArray(record.remoteIssues) ? record.remoteIssues : []
      );
    } catch (error) {
      console.warn("Grammar issue merge failed", error?.name || "unknown");
      rawIssues = mergeWritingGrammarIssues(record.segment.text, record.localIssues, []);
    }
    rawIssues = rawIssues.filter((issue) => !isBlockedInverseWritingGrammarIssue(
      issue,
      record.segment,
      record.context,
      state.appliedCorrections
    ));
    const issues = await Promise.all(rawIssues.map((issue) => (
      decorateIssue(issue, record.segment, record.context)
    )));
    if (
      !isLatestSegmentRecord(record)
      || !isLiveCompletedWritingSegment(elements.writingInput.value, record.segment)
    ) return;
    // A completed analysis is authoritative for this exact sentence revision.
    // Never carry cards forward from an older revision merely because their
    // ranges do not overlap: those cards may depend on grammar that an accepted
    // sibling correction has already changed.
    state.activeIssues = state.activeIssues.filter((issue) => !(
      issue.sentenceStart === record.segment.start && issue.sentenceEnd === record.segment.end
    ));
    state.activeIssues.push(...issues);
    state.activeIssues.sort((left, right) => (
      left.absoluteStart - right.absoluteStart || left.ruleId.localeCompare(right.ruleId)
    ));
    for (const issue of issues) queueOccurrence(issue);
    renderGrammarIssues();
  }).catch((error) => {
    console.warn("Grammar suggestions could not be displayed", error?.name || "unknown");
  });
  return record.publishQueue;
}

function finishSegmentRecord(record) {
  if (!record.localDone || !record.remoteDone || record.finished) return;
  record.finished = true;
  record.publishQueue.finally(() => {
    if (state.segmentChecks.get(record.key) === record) state.segmentChecks.delete(record.key);
    if (state.latestSegmentRecords.get(record.slotKey) === record) {
      state.latestSegmentRecords.delete(record.slotKey);
    }
    if (record.context.generation !== state.checkGeneration) return;
    state.pendingChecks = Math.max(0, state.pendingChecks - 1);
    renderGrammarIssues();
  });
}

async function runLocalSegmentCheck(record) {
  let localIssues = [];
  try {
    const checker = isLatestSegmentRecord(record) ? await prepareGrammarChecker() : null;
    if (checker && isLatestSegmentRecord(record)) {
      localIssues = await checker.check(record.segment.text);
    }
  } catch (error) {
    console.warn("Local sentence check failed", error?.name || "unknown");
  }
  record.localIssues = Array.isArray(localIssues) ? localIssues : [];
  record.localDone = true;
  await publishSegmentRecord(record);
  finishSegmentRecord(record);
}

function applyRemoteGrammarOutcome(record, result) {
  if (!isLatestSegmentRecord(record)) return;
  const failure = result?.failure;
  if (!failure) {
    state.remoteGrammarWarnings.delete(record.slotKey);
    state.remoteGrammarBackoffUntil = 0;
    state.remoteGrammarBackoffFailure = null;
    updateHarperStatus(
      "ready",
      "文法偵測已連線",
      "只傳送已完成的單句；題目、整篇草稿及學生身份不會送出"
    );
    return;
  }
  if (failure.kind === REMOTE_GRAMMAR_FAILURE_KINDS.cancelled) return;

  if (failure.shouldWarn) {
    state.remoteGrammarWarnings.set(record.slotKey, {
      kind: failure.kind,
      segment: {
        start: record.segment.start,
        end: record.segment.end,
        text: record.segment.text
      }
    });
  }
  if (failure.backoffMs > 0 && !result?.skipped) {
    state.remoteGrammarBackoffUntil = Date.now() + failure.backoffMs;
    state.remoteGrammarBackoffFailure = failure;
  }

  if (failure.globalStatus === "network") {
    updateHarperStatus(
      "error",
      "文法偵測暫時未能連線",
      "本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "timeout") {
    updateHarperStatus(
      "error",
      "文法偵測回應逾時",
      "為免重複計算，本次不會自動重試；本機後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "provider_failure") {
    updateHarperStatus(
      "error",
      "文法偵測服務暫時故障",
      "系統只會在安全情況下重試一次；本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "rate_limited") {
    updateHarperStatus(
      "ready",
      "文法偵測稍後重試",
      "本機提示仍可使用；請稍候再完成下一次進階檢查"
    );
  } else if (failure.globalStatus === "quota_exhausted") {
    updateHarperStatus(
      "error",
      "文法偵測今日額度已用完",
      "額度會於香港時間 08:00 重設；本機 ESL 規則及 Harper 後備檢查仍可使用"
    );
  } else if (failure.globalStatus === "inconclusive") {
    updateHarperStatus(
      "ready",
      "未能安全判定這句文法",
      "沒有把未能確認的結果當作正確；本機提示仍然會保留"
    );
  }
}

async function runRemoteSegmentCheck(record) {
  const result = await scheduleRemoteGrammarCheck(record);
  record.remoteIssues = Array.isArray(result?.issues) ? result.issues : null;
  record.remoteFailure = result?.failure || null;
  record.remoteDone = true;
  applyRemoteGrammarOutcome(record, result);
  await publishSegmentRecord(record);
  finishSegmentRecord(record);
}

function enqueueSegmentsForCheck(segments, { remote = true } = {}) {
  if (!state.grammarDetectionEnabled) return;
  const validSegments = Array.isArray(segments) ? segments.filter(Boolean) : [];
  if (!validSegments.length) return;
  const context = captureCheckContext();
  for (const segment of validSegments) {
    if (segment.text.length > 10000) continue;
    const slotKey = segmentSlotKey(segment, context);
    const previousRecord = state.latestSegmentRecords.get(slotKey);
    if (
      previousRecord
      && !previousRecord.finished
      && previousRecord.segment.end === segment.end
      && previousRecord.segment.text === segment.text
    ) continue;
    if (previousRecord) {
      previousRecord.superseded = true;
      previousRecord.remoteController?.abort();
      if (state.segmentChecks.get(previousRecord.key) === previousRecord) {
        state.segmentChecks.delete(previousRecord.key);
      }
    }
    const revision = ++state.nextSegmentRevision;
    const key = segmentCheckKey(segment, context, revision);
    const record = {
      key,
      slotKey,
      revision,
      context,
      segment,
      superseded: false,
      remoteController: null,
      localDone: false,
      localIssues: [],
      remoteDone: !remote,
      remoteIssues: null,
      remoteFailure: null,
      publishQueue: Promise.resolve(),
      finished: false
    };
    state.segmentChecks.set(key, record);
    state.latestSegmentRecords.set(slotKey, record);
    state.pendingChecks += 1;
    state.checkQueue = state.checkQueue
      .then(() => runLocalSegmentCheck(record))
      .catch((error) => {
        console.warn("Queued local grammar check failed", error?.name || "unknown");
        record.localDone = true;
        finishSegmentRecord(record);
      });
    if (remote) runRemoteSegmentCheck(record).catch(() => {
      record.remoteDone = true;
      finishSegmentRecord(record);
    });
  }
  renderGrammarIssues();
}

function currentRemoteGrammarWarnings() {
  for (const [key, warning] of state.remoteGrammarWarnings) {
    if (!isLiveCompletedWritingSegment(elements.writingInput.value, warning.segment)) {
      state.remoteGrammarWarnings.delete(key);
    }
  }
  return [...state.remoteGrammarWarnings.values()];
}

function grammarReviewWarningContent(warnings, hasVisibleIssues) {
  const notice = writingGrammarReviewNotice(
    warnings.map((warning) => warning.kind),
    hasVisibleIssues ? 1 : 0
  );
  const wrapper = createElement("div", "grammar-empty");
  wrapper.dataset.state = notice.state;
  wrapper.append(createElement("span", "", "!"));
  wrapper.append(createElement("strong", "", notice.title));
  wrapper.append(createElement("p", "", notice.detail));
  return wrapper;
}

function grammarEmptyContent() {
  const wrapper = createElement("div", "grammar-empty");
  if (!state.grammarDetectionEnabled) {
    wrapper.append(createElement("span", "", "○"));
    wrapper.append(createElement("strong", "", "文法偵測已關閉"));
    wrapper.append(createElement("p", "", "不會傳送或檢查句子。重新開啟後，系統會由目前文章的第一句開始掃描。"));
    return wrapper;
  }
  const icon = state.pendingChecks > 0 || state.checkerState === "loading"
    ? "…"
    : state.checkerState === "error" ? "!" : "i";
  wrapper.append(createElement("span", "", icon));
  if (state.pendingChecks > 0) {
    wrapper.append(createElement("strong", "", "正在檢查完整句子"));
    wrapper.append(createElement("p", "", "文法偵測及本機後備規則正在整理建議，請稍候。"));
  } else if (state.checkerState === "loading") {
    wrapper.append(createElement("strong", "", "正在準備文法偵測"));
    wrapper.append(createElement("p", "", "您可以先開始寫作；完整句子會排隊檢查。"));
  } else if (state.checkerState === "error") {
    wrapper.append(createElement("strong", "", "文法偵測暫時未能連線"));
    wrapper.append(createElement("p", "", "本機後備檢查、寫作及提交功能不受影響。"));
  } else {
    wrapper.append(createElement("strong", "", "暫未偵測到高信心文法問題"));
    wrapper.append(createElement("p", "", "這不代表句子完全正確；文法偵測可能遺漏問題。"));
  }
  return wrapper;
}

function grammarIssueSourceLabel(issue) {
  if (issue.reviewRequired) return "需老師覆核";
  if (issue.engine?.name === "edmund-approved-grammar-corpus") return "Edmund Sir 已審核文法庫";
  if (issue.engine?.name === "edmund-advanced-grammar") return "Edmund 文法偵測";
  if (issue.engine?.name === "edmund-esl-basics") return "Edmund 本機規則";
  if (issue.engine?.name === "harper.js") return "Harper 額外校對";
  return "文法偵測";
}

function renderGrammarIssues() {
  syncGrammarDetectionControls();
  const visible = state.activeIssues.filter((issue) => !state.dismissedIssueIds.has(issue.id));
  const warnings = currentRemoteGrammarWarnings();
  elements.issueCount.textContent = String(visible.length);
  if (!visible.length) {
    elements.grammarList.replaceChildren(
      warnings.length && state.pendingChecks === 0
        ? grammarReviewWarningContent(warnings, false)
        : grammarEmptyContent()
    );
    return;
  }
  const fragment = document.createDocumentFragment();
  if (warnings.length) fragment.append(grammarReviewWarningContent(warnings, true));
  for (const issue of visible) {
    const card = createElement("article", "grammar-card");
    if (issue.reviewRequired) card.dataset.review = "true";
    const head = createElement("div", "grammar-card-head");
    const sourceLabel = grammarIssueSourceLabel(issue);
    head.append(createElement("strong", "", issue.title), createElement("span", "", sourceLabel));
    const body = createElement("div", "grammar-card-body");

    const problem = createElement("p", "grammar-fragment");
    problem.append(document.createTextNode(issue.sentenceText.slice(0, issue.start)));
    problem.append(createElement("mark", "", issue.sentenceText.slice(issue.start, issue.end) || issue.originalText));
    problem.append(document.createTextNode(issue.sentenceText.slice(issue.end)));

    const replacement = createElement("div", "grammar-replacement");
    if (issue.reviewRequired) {
      replacement.append(
        createElement("small", "", "需要人工覆核"),
        createElement("p", "", "此句不適合自動改寫，請交由老師確認。")
      );
    } else {
      replacement.append(
        createElement("small", "", "此項局部修正後（句內仍可能有其他問題）"),
        createElement("p", "", issue.correctedSentence)
      );
    }
    const explanation = createElement("div", "grammar-explanation");
    explanation.append(createElement("small", "", "Explanation"), createElement("p", "", issue.message));
    const actions = createElement("div", "grammar-actions");
    const apply = createElement("button", "apply-suggestion", "套用建議");
    apply.type = "button";
    apply.dataset.applyIssue = issue.id;
    if (!issue.suggestedText || issue.correctedSentence === issue.sentenceText) apply.disabled = true;
    const dismiss = createElement("button", "dismiss-suggestion", "暫時略過");
    dismiss.type = "button";
    dismiss.dataset.dismissIssue = issue.id;
    actions.append(apply, dismiss);
    body.append(problem, replacement, explanation, actions);
    card.append(head, body);
    fragment.append(card);
  }
  elements.grammarList.replaceChildren(fragment);
}

function scheduleManualGrammarRecheck(previousValue, nextValue) {
  if (!state.grammarDetectionEnabled) return;
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  const change = insertedRange(previousValue, nextValue);
  const rangeEnd = Math.min(nextValue.length, Math.max(change.end, change.start + 1));
  const affected = completedWritingSegmentsOverlappingRange(nextValue, change.start, rangeEnd);
  if (!affected.length) return;
  const context = captureCheckContext();
  state.manualRecheckTimer = window.setTimeout(() => {
    state.manualRecheckTimer = null;
    if (!isCurrentCheckContext(context)) return;
    const live = affected.filter((segment) => (
      isLiveCompletedWritingSegment(elements.writingInput.value, segment)
    ));
    if (live.length) enqueueSegmentsForCheck(live);
  }, 650);
}

function handleWritingInput() {
  const nextValue = elements.writingInput.value;
  const previousValue = state.previousWriting;
  markWritingActivity();
  if (!state.grammarDetectionEnabled) {
    state.previousWriting = nextValue;
    updateEditorMetrics();
    refreshVocabularyUsage();
    scheduleDraftSave();
    renderGrammarIssues();
    return;
  }
  supersedeSegmentRecordsAffectedByEdit(previousValue, nextValue);
  rebaseAppliedCorrections(previousValue, nextValue);
  rebaseActiveIssues(previousValue, nextValue);
  const segments = newlyCompletedWritingSegments(previousValue, nextValue);
  const immediateSegments = segments.length
    ? [...new Map([
      ...segments,
      ...completedWritingSegmentsAffectedByEdit(previousValue, nextValue)
    ].map((segment) => [`${segment.start}:${segment.end}:${segment.text}`, segment])).values()]
    : [];
  state.previousWriting = nextValue;
  updateEditorMetrics();
  refreshVocabularyUsage();
  scheduleDraftSave();
  renderGrammarIssues();
  if (immediateSegments.length) {
    window.clearTimeout(state.manualRecheckTimer);
    state.manualRecheckTimer = null;
    enqueueSegmentsForCheck(immediateSegments);
  } else {
    scheduleManualGrammarRecheck(previousValue, nextValue);
  }
}

function applyGrammarIssue(issueId) {
  const issue = state.activeIssues.find((candidate) => candidate.id === issueId);
  if (!issue) return;
  const current = elements.writingInput.value;
  if (current.slice(issue.sentenceStart, issue.sentenceEnd) !== issue.sentenceText) {
    showToast("文章已經改動；請在句尾再輸入句號或分號重新檢查。", "error");
    state.activeIssues = state.activeIssues.filter((candidate) => candidate.id !== issueId);
    renderGrammarIssues();
    return;
  }
  const next = `${current.slice(0, issue.sentenceStart)}${issue.correctedSentence}${current.slice(issue.sentenceEnd)}`;
  supersedeSegmentRecordsAffectedByEdit(current, next);
  rebaseAppliedCorrections(current, next);
  rememberAppliedCorrection(issue);
  state.activeIssues = rebaseWritingGrammarIssuesAfterAppliedCorrection(state.activeIssues, issue);
  const hasRemainingSentenceIssues = hasWritingGrammarIssuesForSentence(
    state.activeIssues,
    issue.sentenceStart,
    issue.correctedSentence
  );
  state.dismissedIssueIds.clear();
  elements.writingInput.value = next;
  state.previousWriting = next;
  updateEditorMetrics();
  refreshVocabularyUsage();
  scheduleDraftSave();
  renderGrammarIssues();
  // The remote grammar checker returns one coherent correction batch. Let the student finish that
  // batch before checking the resulting sentence again; otherwise responses
  // for intermediate sentence versions can mix with the still-visible cards.
  if (!hasRemainingSentenceIssues) {
    const replacementEnd = issue.sentenceStart + issue.correctedSentence.length;
    const updatedSegments = completedWritingSegmentsOverlappingRange(next, issue.sentenceStart, replacementEnd);
    if (updatedSegments.length) enqueueSegmentsForCheck(updatedSegments);
  }
  showToast("已套用建議；原有問題種類已保留在您的記錄。", "success");
}

function dismissGrammarIssue(issueId) {
  state.dismissedIssueIds.add(issueId);
  renderGrammarIssues();
}

function normalizeSubmission(value) {
  return {
    id: String(value?.id || value?.submissionId || ""),
    studentId: String(value?.studentId || value?.student_id || ""),
    studentName: String(value?.studentName || value?.student_name || ""),
    topic: String(value?.topic || "未命名題目"),
    answer: String(value?.answer || value?.content || ""),
    wordCount: Number(value?.wordCount ?? value?.word_count ?? countEnglishWords(value?.answer || value?.content || "")),
    durationSeconds: Number(value?.durationSeconds ?? value?.duration_seconds ?? 0),
    submittedAt: String(value?.submittedAt || value?.submitted_at || value?.createdAt || value?.created_at || ""),
    occurrenceCount: Number(value?.occurrenceCount ?? value?.occurrence_count ?? 0),
    deletedAt: value?.deletedAt || value?.deleted_at ? String(value.deletedAt || value.deleted_at) : "",
    topicResource: normalizeWritingTopicResource(value?.topicResource || value?.topic_resource),
    hasPublishedFeedback: value?.hasPublishedFeedback === true || value?.has_published_feedback === true,
    feedbackUnread: value?.feedbackUnread === true || value?.feedback_unread === true
  };
}

function submissionArray(payload) {
  const source = Array.isArray(payload) ? payload : payload?.submissions;
  return Array.isArray(source) ? source.map(normalizeSubmission).filter((item) => item.id) : [];
}

function normalizeWritingProgressRow(value) {
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(value?.date || "")) ? String(value.date) : "",
    articlesWritten: Math.max(0, Number(value?.articlesWritten || 0)),
    timeSpentSeconds: Math.max(0, Number(value?.timeSpentSeconds || 0)),
    averageSeconds: Math.max(0, Number(value?.averageSeconds || 0)),
    cumulativeArticles: Math.max(0, Number(value?.cumulativeArticles || 0)),
    cumulativeTimeSeconds: Math.max(0, Number(value?.cumulativeTimeSeconds || 0))
  };
}

function createSvgElement(tag, attributes = {}, text = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  if (text !== "") node.textContent = String(text);
  return node;
}

function renderWritingProgressChart(container, rows, valueKey, formatValue) {
  if (!container) return;
  if (!rows.length) {
    container.replaceChildren(createElement("p", "submission-progress-empty", "提交第一篇文章後，進度會在這裡出現。"));
    return;
  }
  const width = 720;
  const height = 180;
  const left = 48;
  const right = 18;
  const top = 14;
  const bottom = 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = rows.map(row => Math.max(0, Number(row[valueKey] || 0)));
  const maximum = Math.max(1, ...values);
  const x = index => left + (rows.length === 1 ? plotWidth / 2 : (index / (rows.length - 1)) * plotWidth);
  const y = value => top + plotHeight - (value / maximum) * plotHeight;
  const svg = createSvgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });
  const title = createSvgElement("title", {}, `${rows[0].date} 至 ${rows.at(-1).date} 的進度`);
  svg.append(title);
  for (let step = 0; step <= 4; step += 1) {
    const value = maximum * (step / 4);
    const yPosition = y(value);
    svg.append(
      createSvgElement("line", { x1: left, y1: yPosition, x2: width - right, y2: yPosition, class: "chart-grid" }),
      createSvgElement("text", { x: left - 7, y: yPosition + 3, "text-anchor": "end" }, formatValue(value))
    );
  }
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const areaPoints = `${left},${top + plotHeight} ${points} ${width - right},${top + plotHeight}`;
  svg.append(
    createSvgElement("polygon", { points: areaPoints, class: "chart-area" }),
    createSvgElement("polyline", { points, class: "chart-line" })
  );
  values.forEach((value, index) => {
    const point = createSvgElement("circle", { cx: x(index), cy: y(value), r: 4, class: "chart-point", tabindex: 0 });
    point.append(createSvgElement("title", {}, `${rows[index].date}：${formatValue(value)}`));
    svg.append(point);
  });
  const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  for (const index of labelIndexes) {
    svg.append(createSvgElement("text", {
      x: x(index),
      y: height - 8,
      "text-anchor": index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle"
    }, rows[index].date.slice(5)));
  }
  container.replaceChildren(svg);
}

function renderWritingProgress() {
  const rows = state.writingProgress;
  const latest = rows.at(-1);
  const totalArticles = latest?.cumulativeArticles || 0;
  const totalSeconds = latest?.cumulativeTimeSeconds || 0;
  elements.writingArticleTotal.textContent = String(totalArticles);
  elements.writingTimeTotal.textContent = formatCompactDuration(totalSeconds);
  elements.writingAverageTime.textContent = formatCompactDuration(totalArticles ? totalSeconds / totalArticles : 0);
  renderWritingProgressChart(elements.writingArticlesChart, rows, "cumulativeArticles", value => String(Math.round(value)));
  renderWritingProgressChart(elements.writingTimeChart, rows, "cumulativeTimeSeconds", formatCompactDuration);
  renderWritingProgressChart(elements.writingAverageChart, rows, "averageSeconds", formatCompactDuration);
}

async function loadWritingProgress() {
  const payload = await apiJson("/v1/progress");
  const source = Array.isArray(payload) ? payload : payload?.progress;
  state.writingProgress = Array.isArray(source)
    ? source.map(normalizeWritingProgressRow).filter(row => row.date)
    : [];
  renderWritingProgress();
}

async function fetchAllSubmissionPages(path, { pageSize = 100, maximumPages = 20 } = {}) {
  const submissions = [];
  for (let page = 1; page <= maximumPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const payload = await apiJson(`${path}${separator}page=${page}&pageSize=${pageSize}`);
    submissions.push(...submissionArray(payload));
    if (!payload?.hasMore) return submissions;
  }
  showToast("文章記錄很多；目前先顯示最近一批。", "error");
  return submissions;
}

function syncSubmissionExportControls() {
  if (!elements.exportSelectAll) return;
  const availableIds = new Set(state.submissions.map(item => item.id));
  for (const id of state.selectedExportSubmissionIds) {
    if (!availableIds.has(id)) state.selectedExportSubmissionIds.delete(id);
  }
  const selectedCount = state.selectedExportSubmissionIds.size;
  elements.exportSelectedCount.textContent = `已選 ${selectedCount} 篇`;
  elements.exportSelectAll.checked = Boolean(state.submissions.length && selectedCount === state.submissions.length);
  elements.exportSelectAll.indeterminate = selectedCount > 0 && selectedCount < state.submissions.length;
  elements.exportSelectAll.disabled = state.exportInFlight || !state.submissions.length;
  elements.exportSelectedSubmissions.disabled = state.exportInFlight || selectedCount < 1;
  elements.exportAllSubmissions.disabled = state.exportInFlight || !state.submissions.length;
}

function escapePrintHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

async function fetchOwnSubmissionDetail(id) {
  const normalizedId = String(id || "");
  if (!UUID_RE.test(normalizedId) || !state.submissions.some(item => item.id === normalizedId)) {
    throw new Error("文章不屬於目前登入帳戶。");
  }
  const payload = await apiJson(`/v1/submissions/${encodeURIComponent(normalizedId)}`);
  return normalizeSubmission(payload?.submission || payload);
}

async function mapWithConcurrency(values, mapper, concurrency = 4) {
  const results = new Array(values.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: "fulfilled", value: await mapper(values[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function writingExportHtml(submissions, { failedCount = 0 } = {}) {
  const generatedAt = new Intl.DateTimeFormat("zh-HK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Hong_Kong"
  }).format(new Date());
  const articles = submissions.map((submission, index) => `
    <article class="composition">
      <header>
        <p class="sequence">ARTICLE ${index + 1} / ${submissions.length}</p>
        <h1>我的文章 ${index + 1}</h1>
        <div class="meta">
          <span>${escapePrintHtml(formatSubmissionDate(submission.submittedAt))}</span>
          <span>${escapePrintHtml(`${submission.wordCount} words`)}</span>
          <span>${escapePrintHtml(`寫作用時：${formatCompactDuration(submission.durationSeconds)}`)}</span>
        </div>
      </header>
      <section class="topic"><strong>寫作題目</strong><p>${escapePrintHtml(submission.topic)}</p></section>
      <section class="answer"><strong>文章內容</strong><div>${escapePrintHtml(submission.answer || "（文章內容為空）")}</div></section>
    </article>`).join("");
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EdmundEducation－我的文章</title>
<style>
  *{box-sizing:border-box} body{margin:0;color:#242342;background:#eee;font-family:Georgia,"Times New Roman","Noto Serif TC",serif}
  .print-toolbar{position:sticky;top:0;z-index:5;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;background:#272757;font-family:system-ui,sans-serif}
  .print-toolbar p{margin:0;font-size:13px}.print-toolbar button{border:0;border-radius:999px;padding:10px 16px;color:#272757;background:#fff;cursor:pointer;font-weight:800}
  main{width:min(900px,calc(100% - 28px));margin:26px auto}.composition{margin:0 0 28px;padding:44px 48px;background:#fff;box-shadow:0 12px 38px rgba(20,20,50,.12);break-after:page}
  .composition:last-child{break-after:auto}.sequence{margin:0 0 8px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.13em}
  h1{margin:0 0 14px;font-size:27px;line-height:1.35}.meta{display:flex;flex-wrap:wrap;gap:7px 14px;color:#66637c;font:12px system-ui,sans-serif}
  section{margin-top:26px}.topic{border-left:5px solid #e87b2c;padding:14px 18px;background:#fff6e8}.topic strong,.answer>strong{display:block;margin-bottom:8px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.08em}
  .topic p{margin:0;font-size:16px;line-height:1.65;white-space:pre-wrap}.answer div{font-size:17px;line-height:1.85;white-space:pre-wrap;overflow-wrap:anywhere}
  @media(max-width:600px){.composition{padding:27px 22px}h1{font-size:22px}}
  @media print{@page{size:A4;margin:16mm}.print-toolbar{display:none!important}body{background:#fff}main{width:auto;margin:0}.composition{margin:0;padding:0;box-shadow:none}.composition header{padding-bottom:12px;border-bottom:1px solid #ddd}}
</style></head><body>
<div class="print-toolbar"><p>已準備 ${submissions.length} 篇文章${failedCount ? `；${failedCount} 篇未能載入` : ""} · ${escapePrintHtml(generatedAt)}</p><button type="button" id="print-compositions">列印／儲存為 PDF</button></div>
<main>${articles}</main></body></html>`;
}

async function exportStudentSubmissions(ids) {
  if (state.user?.role !== "student" || state.exportInFlight) return;
  const availableIds = new Set(state.submissions.map(item => item.id));
  const requestedIds = [...new Set(ids.map(id => String(id || "")))]
    .filter(id => UUID_RE.test(id) && availableIds.has(id));
  if (!requestedIds.length) {
    showToast("請先選擇最少一篇文章。", "error");
    return;
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("瀏覽器已封鎖匯出視窗；請允許彈出式視窗後再試。", "error");
    return;
  }
  try { printWindow.opener = null; } catch { /* Some browsers make opener read-only. */ }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html lang=\"zh-Hant\"><meta charset=\"utf-8\"><title>正在準備文章</title><body style=\"font-family:system-ui;padding:32px\">正在安全載入您的文章……</body></html>");
  printWindow.document.close();
  state.exportInFlight = true;
  syncSubmissionExportControls();
  try {
    const results = await mapWithConcurrency(requestedIds, fetchOwnSubmissionDetail, 4);
    const submissions = results.filter(result => result.status === "fulfilled").map(result => result.value);
    const failedCount = results.length - submissions.length;
    if (!submissions.length) throw new Error("未能載入所選文章。");
    if (printWindow.closed) throw new Error("匯出視窗已關閉。");
    printWindow.document.open();
    printWindow.document.write(writingExportHtml(submissions, { failedCount }));
    printWindow.document.close();
    const printButton = printWindow.document.querySelector("#print-compositions");
    printButton?.addEventListener("click", () => printWindow.print());
    window.setTimeout(() => {
      try { printWindow.focus(); printWindow.print(); } catch { /* The visible print button remains available. */ }
    }, 350);
    showToast(failedCount
      ? `已準備 ${submissions.length} 篇文章；${failedCount} 篇暫時未能載入。`
      : `已準備 ${submissions.length} 篇文章供列印或儲存 PDF。`, failedCount ? "error" : "success");
  } catch (error) {
    console.warn("Writing submission export failed", error);
    if (!printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:32px"><h1>暫時未能匯出文章</h1><p>${escapePrintHtml(error.message || "請稍後再試。")}</p></body>`);
      printWindow.document.close();
    }
    showToast(error.message || "暫時未能匯出文章。", "error");
  } finally {
    state.exportInFlight = false;
    syncSubmissionExportControls();
  }
}

function renderSubmissionList() {
  if (!state.submissions.length) {
    elements.submissionList.replaceChildren(emptyState("尚未有已提交文章。"));
    syncSubmissionExportControls();
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const submission of state.submissions) {
    const row = createElement("article", "submission-list-item");
    if (submission.hasPublishedFeedback) row.classList.add("has-feedback");
    if (submission.feedbackUnread) row.classList.add("has-unread-feedback");
    if (state.selectedSubmissionId === submission.id) row.classList.add("is-current");
    const selection = createElement("label", "submission-export-checkbox");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.exportSubmissionId = submission.id;
    checkbox.checked = state.selectedExportSubmissionIds.has(submission.id);
    const selectionLabel = createElement("span", "sr-only", `選取文章：${submission.topic}`);
    selection.append(checkbox, selectionLabel);
    const button = createElement("button", "submission-row");
    button.type = "button";
    button.dataset.submissionId = submission.id;
    button.setAttribute("aria-current", String(state.selectedSubmissionId === submission.id));
    const titleRow = createElement("span", "submission-row-title");
    titleRow.append(createElement("strong", "", submission.topic));
    if (submission.feedbackUnread) {
      const bell = createElement("span", "submission-feedback-bell");
      bell.setAttribute("aria-label", "1 則未讀 Edmund 評語");
      bell.append(createElement("span", "submission-feedback-bell-icon", "🔔"), createElement("b", "", "1"));
      titleRow.append(bell);
    }
    button.append(
      titleRow,
      createElement("span", "submission-row-meta", `${formatSubmissionDate(submission.submittedAt)} · ${submission.wordCount} words · ${formatCompactDuration(submission.durationSeconds)}`)
    );
    row.append(selection, button);
    fragment.append(row);
  }
  elements.submissionList.replaceChildren(fragment);
  syncSubmissionExportControls();
}

function normalizeServerDraft(value) {
  const draft = value && typeof value === "object" ? value : {};
  return {
    id: String(draft.id || ""),
    topic: String(draft.topic || ""),
    answer: String(draft.answer || ""),
    answerPreview: String(draft.answerPreview || ""),
    wordCount: Number(draft.wordCount || 0),
    durationSeconds: Math.max(0, Number(draft.durationSeconds || 0)),
    imageZoom: [0.5, 1, 2, 3, 4, 5, 7].includes(Number(draft.imageZoom)) ? Number(draft.imageZoom) : 1,
    topicResource: normalizeWritingTopicResource(draft.topicResource),
    countdown: normalizeWritingTimer(draft.countdown),
    stopwatch: normalizeWritingStopwatch(draft.stopwatch),
    createdAt: String(draft.createdAt || ""),
    updatedAt: String(draft.updatedAt || "")
  };
}

function currentServerDraftPayload() {
  accrueWritingTime();
  return {
    topic: elements.topicInput.value,
    answer: elements.writingInput.value,
    topicResource: canonicalWritingTopicResourceForTransport(state.selectedTopicResource),
    imageZoom: state.writingImageZoom,
    countdown: normalizeWritingTimer(state.writingTimer),
    stopwatch: normalizeWritingStopwatch(state.writingStopwatch),
    durationSeconds: Math.max(0, Math.min(31536000, Math.round(state.draftDurationSeconds)))
  };
}

function storedDraftServerPayload(draft) {
  const rawDurationSeconds = Number(draft?.durationSeconds || 0);
  const durationSeconds = Number.isFinite(rawDurationSeconds)
    ? Math.max(0, Math.min(31536000, Math.round(rawDurationSeconds)))
    : 0;
  return {
    topic: String(draft?.topic || ""),
    answer: String(draft?.answer || ""),
    topicResource: canonicalWritingTopicResourceForTransport(draft?.selectedTopicResource),
    imageZoom: [0.5, 1, 2, 3, 4, 5, 7].includes(Number(draft?.writingImageZoom))
      ? Number(draft.writingImageZoom)
      : 1,
    countdown: normalizeWritingTimer(draft?.writingTimer),
    stopwatch: normalizeWritingStopwatch(draft?.writingStopwatch),
    durationSeconds
  };
}

async function archiveStoredDraftBeforeEntryLink(draft) {
  if (!UUID_RE.test(String(draft?.documentId || ""))) return false;
  const payload = storedDraftServerPayload(draft);
  if (!payload.topic.trim() && !payload.answer.trim()) return false;
  const response = await apiJson(`/v1/drafts/${encodeURIComponent(draft.documentId)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  const savedDraft = normalizeServerDraft(response?.draft || response);
  if (!UUID_RE.test(savedDraft.id)) throw new Error("舊草稿未能安全儲存，已停止開啟新功課。");
  const existingIndex = state.drafts.findIndex(item => item.id === savedDraft.id);
  if (existingIndex >= 0) state.drafts[existingIndex] = savedDraft;
  else state.drafts.unshift(savedDraft);
  return true;
}

async function saveCurrentProgress() {
  if (state.user?.role !== "student" || !UUID_RE.test(state.documentId)) return;
  const payload = currentServerDraftPayload();
  if (!payload.topic.trim() && !payload.answer.trim()) {
    setStatus(elements.submissionStatus, "請先輸入寫作題目或文章內容。", "error");
    return;
  }
  elements.saveProgress.disabled = true;
  setStatus(elements.submissionStatus, "正在安全儲存未完成草稿……");
  persistDraft();
  try {
    const response = await apiJson(`/v1/drafts/${encodeURIComponent(state.documentId)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    const draft = normalizeServerDraft(response?.draft || response);
    if (!UUID_RE.test(draft.id)) throw new Error("草稿服務回應無效。");
    const index = state.drafts.findIndex(item => item.id === draft.id);
    if (index >= 0) state.drafts[index] = draft;
    else state.drafts.unshift(draft);
    elements.draftState.textContent = "已儲存草稿";
    setStatus(elements.submissionStatus, "目前進度已儲存；可稍後在「我的文章」繼續。", "success");
    showToast("目前寫作進度已儲存。", "success");
  } catch (error) {
    console.warn("Writing draft save failed", error);
    setStatus(elements.submissionStatus, error.message || "暫時未能儲存草稿。", "error");
  } finally {
    elements.saveProgress.disabled = false;
  }
}

function renderDraftList() {
  elements.draftCount.textContent = String(state.drafts.length);
  if (!state.drafts.length) {
    elements.draftList.replaceChildren(emptyState("尚未有已儲存的未完成草稿。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const draft of state.drafts) {
    const row = createElement("article", "draft-row");
    const copy = createElement("div", "draft-row-copy");
    copy.append(
      createElement("strong", "", draft.topic.trim() || "未命名草稿"),
      createElement("span", "", `${formatSubmissionDate(draft.updatedAt)} · ${draft.wordCount} words · ${formatCompactDuration(draft.durationSeconds)}`),
      createElement("p", "", draft.answerPreview || "（尚未輸入文章內容）")
    );
    const actions = createElement("div", "draft-row-actions");
    const resume = createElement("button", "small-button", "繼續寫作");
    resume.type = "button";
    resume.dataset.resumeDraft = draft.id;
    const remove = createElement("button", "small-button draft-delete-button", "刪除草稿");
    remove.type = "button";
    remove.dataset.deleteDraft = draft.id;
    actions.append(resume, remove);
    row.append(copy, actions);
    fragment.append(row);
  }
  elements.draftList.replaceChildren(fragment);
}

async function loadDrafts() {
  elements.draftList.replaceChildren(loadingState("正在載入未完成草稿……"));
  const payload = await apiJson("/v1/drafts?page=1&pageSize=100");
  state.drafts = Array.isArray(payload?.drafts)
    ? payload.drafts.map(normalizeServerDraft).filter(item => UUID_RE.test(item.id))
    : [];
  renderDraftList();
}

async function loadDraftIntoWorkspace(draft) {
  const selectedTopicResource = await resolvePersistedWritingTopicResource(draft.topicResource);
  window.clearTimeout(state.manualRecheckTimer);
  state.manualRecheckTimer = null;
  state.checkGeneration += 1;
  cancelRemoteGrammarChecks();
  state.checkQueue = Promise.resolve();
  state.pendingChecks = 0;
  state.documentId = draft.id;
  state.draftDurationSeconds = draft.durationSeconds;
  state.submissionDurationSeconds = null;
  state.writingTimer = normalizeWritingTimer(draft.countdown);
  state.writingStopwatch = normalizeWritingStopwatch(draft.stopwatch);
  state.proofreadingGate = resetWritingProofreadingGate();
  state.writingImageZoom = draft.imageZoom;
  state.timerAutoSubmitLock = false;
  state.previousWriting = draft.answer;
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  elements.topicInput.value = draft.topic;
  elements.writingInput.value = draft.answer;
  state.selectedTopicResource = selectedTopicResource;
  renderSelectedTopicPreview();
  updateEditorMetrics();
  if (state.writingTimer.durationSeconds) setWritingTimerInputs(state.writingTimer.durationSeconds);
  else setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  syncWritingStopwatchUi();
  syncWritingProofreadingUi();
  renderGrammarIssues();
  persistDraft();
  showView("workspace");
  const completedSegments = completedWritingSegments(draft.answer);
  if (state.grammarDetectionEnabled && completedSegments.length) {
    enqueueSegmentsForCheck(completedSegments, { remote: false });
  }
  window.setTimeout(() => elements.writingInput.focus(), 0);
}

async function resumeServerDraft(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  const payload = await apiJson(`/v1/drafts/${encodeURIComponent(id)}`);
  const draft = normalizeServerDraft(payload?.draft || payload);
  if (!UUID_RE.test(draft.id)) throw new Error("未能載入草稿。");
  await loadDraftIntoWorkspace(draft);
}

async function deleteServerDraft(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  const draft = state.drafts.find(item => item.id === id);
  if (!window.confirm(`確定要刪除「${draft?.topic || "這份未完成草稿"}」嗎？刪除後不能復原。`)) return;
  await apiJson(`/v1/drafts/${encodeURIComponent(id)}`, { method: "DELETE" });
  state.drafts = state.drafts.filter(item => item.id !== id);
  renderDraftList();
  showToast("未完成草稿已刪除。", "success");
}

function renderSubmissionDetail(submission, container = elements.submissionDetail, admin = false) {
  const header = createElement("header", "submission-detail-head");
  header.append(createElement("h2", "", submission.topic));
  const meta = createElement("div", "submission-meta");
  if (admin && submission.studentName) meta.append(createElement("span", "", `學生：${submission.studentName}`));
  meta.append(
    createElement("span", "", formatSubmissionDate(submission.submittedAt)),
    createElement("span", "", `${submission.wordCount} words`),
    createElement("span", "", `寫作用時：${formatCompactDuration(submission.durationSeconds)}`)
  );
  if (submission.occurrenceCount) meta.append(createElement("span", "", `${submission.occurrenceCount} 個文法偵測結果`));
  if (admin && submission.deletedAt) meta.append(createElement("span", "deleted-submission-badge", "學生已從個人文章列表刪除"));
  header.append(meta);
  const actions = createElement("div", "submission-detail-actions");
  actions.append(feedbackFontScaleControl());
  if (admin && !submission.deletedAt) {
    const copyButton = createElement("button", "copy-submission-notice-button", "複製已改好通知");
    copyButton.type = "button";
    copyButton.dataset.copySubmissionNotice = submission.id;
    actions.append(copyButton);
  } else if (!admin) {
    const exportButton = createElement("button", "export-submission-button", "匯出這篇文章");
    exportButton.type = "button";
    exportButton.dataset.exportSubmission = submission.id;
    const remove = createElement("button", "delete-submission-button", "刪除這篇文章");
    remove.type = "button";
    remove.dataset.deleteSubmission = submission.id;
    actions.append(exportButton, remove);
  }
  header.append(actions);
  const content = createElement("div", "submission-content", submission.answer || "（文章內容為空）");
  container.replaceChildren(header, content);
  applyFeedbackFontScale();
}

function normalizeTeacherFeedback(value) {
  if (!value || typeof value !== "object") return null;
  const fragments = Array.isArray(value.fragments)
    ? value.fragments.map((fragment, index) => ({
      id: String(fragment?.id || fragment?.fragmentId || fragment?.fragment_id || ""),
      position: Math.max(1, Number(fragment?.position || index + 1)),
      originalFragment: String(fragment?.originalFragment || fragment?.original_fragment || ""),
      edmundComment: String(fragment?.edmundComment || fragment?.edmund_comment || ""),
      suggestedWriting: String(fragment?.suggestedWriting || fragment?.suggested_writing || ""),
      originalFormatting: normalizeFeedbackFormattingRuns(
        fragment?.originalFormatting || fragment?.original_formatting,
        fragment?.originalFragment || fragment?.original_fragment
      ),
      commentFormatting: normalizeFeedbackFormattingRuns(
        fragment?.commentFormatting || fragment?.comment_formatting,
        fragment?.edmundComment || fragment?.edmund_comment
      ),
      suggestionFormatting: normalizeFeedbackFormattingRuns(
        fragment?.suggestionFormatting || fragment?.suggestion_formatting,
        fragment?.suggestedWriting || fragment?.suggested_writing
      ),
      suggestionCopyText: String(fragment?.suggestionCopyText || fragment?.suggestion_copy_text || ""),
      suggestionCopyVersion: Math.max(0, Number(fragment?.suggestionCopyVersion ?? fragment?.suggestion_copy_version ?? 0)),
      suggestionCopyUpdatedAt: String(fragment?.suggestionCopyUpdatedAt || fragment?.suggestion_copy_updated_at || ""),
      bookmarked: fragment?.bookmarked === true || fragment?.isBookmarked === true || fragment?.is_bookmarked === true,
      bookmarkVersion: Math.max(0, Number(fragment?.bookmarkVersion ?? fragment?.bookmark_version ?? 0))
    })).filter(fragment => (
      fragment.originalFragment.trim()
      || fragment.edmundComment.trim()
      || fragment.suggestedWriting.trim()
    ))
    : [];
  const sentenceStructureLinks = (Array.isArray(value.sentenceStructureLinks || value.sentence_structure_links)
    ? value.sentenceStructureLinks || value.sentence_structure_links
    : []).map((item, index) => {
      const rawUrl = typeof item === "string" ? item : item?.url;
      const url = normalizeSentenceStructureDeepLink(rawUrl);
      if (!url) return null;
      return {
        label: String(typeof item === "object" && item?.label ? item.label : `句子結構練習 ${index + 1}`).trim().slice(0, 200),
        url
      };
    }).filter(Boolean);
  return {
    id: String(value.id || ""),
    submissionId: String(value.submissionId || value.submission_id || ""),
    overallComment: String(value.overallComment || value.overall_comment || ""),
    finalComment: String(value.finalComment || value.final_comment || ""),
    improvedVersion: String(value.improvedVersion || value.improved_version || ""),
    status: value.status === "published" ? "published" : "draft",
    version: Math.max(1, Number(value.version || 1)),
    publishedAt: String(value.publishedAt || value.published_at || ""),
    updatedAt: String(value.updatedAt || value.updated_at || ""),
    transcriptionImproved: String(value.transcriptionImproved || value.transcription_improved || ""),
    transcriptionModel: String(value.transcriptionModel || value.transcription_model || ""),
    transcriptionVersion: Math.max(0, Number(value.transcriptionVersion ?? value.transcription_version ?? 0)),
    topicResource: normalizeWritingTopicResource(value.topicResource || value.topic_resource),
    grammarPoints: normalizeGrammarFeedbackPoints(value.grammarPoints || value.grammar_points),
    sentenceStructureMethods: normalizeSentenceStructureMethods(
      value.sentenceStructureMethods || value.sentence_structure_methods
    ),
    sentenceStructureLinks,
    fragments
  };
}

function submissionOriginalFragments(answerValue) {
  const output = [];
  for (const rawLine of String(answerValue || "").split(/\n+/u)) {
    const line = rawLine.trim();
    if (!line) continue;
    const fragments = line.match(/[^.!?;。！？；]+(?:\.{1,3}|[!?;。！？；]+|$)/gu)
      ?.map(fragment => fragment.trim())
      .filter(Boolean) || [];
    output.push(...(fragments.length ? fragments : [line]));
  }
  return output;
}

function feedbackTextSection(title, value, className = "") {
  if (!String(value || "").trim()) return null;
  const section = createElement("section", `teacher-feedback-text ${className}`.trim());
  section.append(createElement("h3", "", title), createElement("div", "", value));
  return section;
}

function feedbackModelEssayDetails(feedback) {
  const resource = normalizeWritingTopicResource(feedback?.topicResource);
  if (!resource || !writingExerciseIdFromTopicResource(resource)) return null;
  const details = createElement("details", "topic-reference-details teacher-feedback-model-reference");
  details.dataset.feedbackModelReference = feedback.submissionId;
  details.dataset.feedbackReferenceExercise = writingExerciseIdFromTopicResource(resource);
  const summary = createElement("summary", "topic-reference-summary");
  summary.append(
    createElement("span", "topic-reference-book", "Open Book"),
    createElement("strong", "", "展開參考 Edmund 範文 Model Essay"),
    createElement("span", "topic-reference-chevron", "+")
  );
  const content = createElement("div", "topic-reference-content");
  content.dataset.topicReferenceContent = "feedback-model-essay";
  content.setAttribute("aria-live", "polite");
  details.append(summary, content);
  return details;
}

function renderStudentTranscriptions(feedback) {
  const section = createElement("section", "teacher-feedback-transcriptions");
  section.dataset.feedbackTranscriptions = feedback.submissionId;
  const heading = createElement("div", "teacher-feedback-transcription-head");
  heading.append(
    createElement("h3", "", "謄文練習"),
    createElement("p", "", "兩個謄文區會獨立儲存在你的帳戶；按下儲存後才會更新。")
  );
  section.append(heading);

  const improvedField = createElement("label", "teacher-feedback-transcription-field");
  improvedField.append(createElement("span", "", "謄文區 - 1 Edmund 改良版"));
  const improvedCopy = document.createElement("textarea");
  improvedCopy.rows = 10;
  improvedCopy.maxLength = 100000;
  improvedCopy.value = feedback.transcriptionImproved;
  improvedCopy.dataset.transcriptionImproved = "true";
  improvedField.append(improvedCopy);
  section.append(improvedField);

  const modelReference = feedbackModelEssayDetails(feedback);
  if (modelReference) section.append(modelReference);
  else section.append(createElement("p", "teacher-feedback-model-unavailable", "這篇文章沒有連結的 Edmund 範文。"));

  const modelField = createElement("label", "teacher-feedback-transcription-field");
  modelField.append(createElement("span", "", "謄文區 - 範文"));
  const modelCopy = document.createElement("textarea");
  modelCopy.rows = 10;
  modelCopy.maxLength = 100000;
  modelCopy.value = feedback.transcriptionModel;
  modelCopy.dataset.transcriptionModel = "true";
  modelField.append(modelCopy);
  section.append(modelField);

  const footer = createElement("div", "teacher-feedback-transcription-actions");
  const status = createElement("p", "form-status", "");
  status.dataset.transcriptionStatus = "true";
  status.setAttribute("role", "status");
  const save = createElement("button", "primary-button", "儲存謄文內容");
  save.type = "button";
  save.dataset.transcriptionSave = feedback.submissionId;
  footer.append(status, save);
  section.append(footer);
  return section;
}

async function loadFeedbackModelEssayDetails(details, { retry = false } = {}) {
  if (!details?.open || details.dataset.feedbackReferenceLoaded === "true" && !retry) return;
  const feedback = state.selectedStudentFeedback;
  const submissionId = String(details.dataset.feedbackModelReference || "");
  if (
    !feedback
    || feedback.submissionId !== submissionId
    || state.selectedSubmissionId !== submissionId
  ) return;
  const content = details.querySelector("[data-topic-reference-content]");
  if (!content) return;
  content.replaceChildren(loadingState("正在載入 Edmund 範文……"));
  try {
    await loadWritingTopicCatalog();
    const route = selectedTopicReferenceRoute(feedback.topicResource);
    if (!route || route.exerciseId !== details.dataset.feedbackReferenceExercise) {
      throw new Error("Model essay is unavailable for this submission");
    }
    const catalog = await loadTopicReferenceCatalog({ retry });
    if (
      !details.isConnected
      || state.selectedStudentFeedback !== feedback
      || state.selectedSubmissionId !== submissionId
    ) return;
    const reference = catalog[route.exerciseId];
    if (
      !reference
      || reference.exerciseId !== route.exerciseId
      || reference.essayKey !== route.essayKey
      || reference.writingHref !== route.writingHref
    ) throw new Error(`Writing reference is missing for ${route.exerciseId}`);
    renderModelEssayReference(content, reference);
    details.dataset.feedbackReferenceLoaded = "true";
  } catch (error) {
    console.warn("Writing feedback model essay reference failed", error);
    details.dataset.feedbackReferenceLoaded = "false";
    const fallback = createElement("div", "topic-reference-error");
    fallback.append(createElement("p", "", "暫時未能載入範文；你的謄文內容不受影響。"));
    const retryButton = createElement("button", "small-button topic-reference-retry", "重新載入");
    retryButton.type = "button";
    retryButton.dataset.feedbackReferenceRetry = "true";
    fallback.append(retryButton);
    if (details.isConnected) content.replaceChildren(fallback);
  }
}

function renderStudentFeedbackLearningArea(title, itemsValue, { sentenceStructure = false, links = [] } = {}) {
  const items = sentenceStructure
    ? normalizeSentenceStructureMethods(itemsValue)
    : normalizeGrammarFeedbackPoints(itemsValue);
  if (!items.length && !links.length) return null;
  const section = createElement(
    "section",
    `teacher-feedback-learning-read${sentenceStructure ? " is-sentence-structure" : ""}`
  );
  section.append(createElement("h3", "", title));
  if (items.length) {
    const list = createElement("div", "teacher-feedback-learning-point-list");
    items.forEach((item, index) => {
      const row = createElement("article", "teacher-feedback-learning-point");
      row.append(createElement(
        "strong",
        "",
        `${sentenceStructure ? "句子結構方法" : "文法重點"} ${index + 1}`
      ));
      const content = createElement("div", "teacher-feedback-rich-content");
      appendStructuredFeedbackRichText(content, item.text, item.formatting);
      row.append(content);
      list.append(row);
    });
    section.append(list);
  }
  if (links.length) {
    const linkList = createElement("div", "teacher-feedback-learning-links");
    links.forEach((link, index) => {
      const anchor = createElement("a", "", link.label || `句子結構練習 ${index + 1}`);
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener";
      linkList.append(anchor);
    });
    section.append(linkList);
  }
  return section;
}

function renderSuggestionCopyArea(fragment) {
  if (!fragment.id || !fragment.suggestedWriting.trim()) return null;
  const section = createElement("div", "teacher-feedback-suggestion-copy");
  section.dataset.suggestionCopyFragment = fragment.id;
  const field = createElement("label");
  field.append(createElement("span", "", "建議寫法 - 抄寫"));
  const textarea = document.createElement("textarea");
  textarea.rows = 5;
  textarea.maxLength = 100000;
  textarea.value = fragment.suggestionCopyText;
  textarea.dataset.suggestionCopyText = fragment.id;
  textarea.placeholder = "在這裡抄寫 Edmund 的建議句子，完成後按儲存。";
  field.append(textarea);
  const actions = createElement("div", "teacher-feedback-suggestion-copy-actions");
  const status = createElement("p", "form-status", "");
  status.dataset.suggestionCopyStatus = fragment.id;
  status.setAttribute("role", "status");
  const save = createElement("button", "small-button", "儲存抄寫");
  save.type = "button";
  save.dataset.suggestionCopySave = fragment.id;
  actions.append(status, save);
  section.append(field, actions);
  return section;
}

function renderStudentFeedback(feedback, container) {
  if (!feedback || feedback.status !== "published") return;
  state.selectedStudentFeedback = feedback;
  const panel = createElement("section", "teacher-feedback-view");
  const head = createElement("header", "teacher-feedback-view-head");
  head.append(
    createElement("div", "", "EDMUND SIR FEEDBACK"),
    createElement("h2", "", "Edmund Sir 寫作評語")
  );
  if (feedback.updatedAt) head.append(createElement("time", "", `更新：${formatSubmissionDate(feedback.updatedAt)}`));
  panel.append(head);
  const overall = feedbackTextSection("整體評語", feedback.overallComment, "teacher-feedback-overall");
  if (overall) panel.append(overall);
  const fragments = createElement("div", "teacher-feedback-fragments");
  feedback.fragments.forEach((fragment, index) => {
    const pair = createElement("article", "teacher-feedback-read-pair");
    const original = createElement("section", "teacher-feedback-original");
    const originalHead = createElement("div", "teacher-feedback-original-head");
    originalHead.append(createElement("span", "", `原句 ${index + 1}`));
    if (fragment.id) {
      const bookmark = createElement(
        "button",
        "feedback-bookmark-button",
        fragment.bookmarked ? "★ 已收藏" : "☆ 收藏原句"
      );
      bookmark.type = "button";
      bookmark.dataset.feedbackBookmarkFragment = fragment.id;
      bookmark.setAttribute("aria-pressed", String(fragment.bookmarked));
      originalHead.append(bookmark);
    }
    const originalText = createElement("p", "teacher-feedback-rich-content");
    appendFeedbackRichText(originalText, fragment.originalFragment, fragment.originalFormatting);
    original.append(originalHead, originalText);
    const comment = createElement("section", "teacher-feedback-comment");
    const commentText = createElement("div", "teacher-feedback-rich-content");
    appendStructuredFeedbackRichText(commentText, fragment.edmundComment, fragment.commentFormatting);
    comment.append(createElement("span", "", "Edmund 評語"), commentText);
    const suggestion = createElement("section", "teacher-feedback-suggestion");
    const suggestionText = createElement("div", "teacher-feedback-rich-content");
    appendFeedbackRichText(
      suggestionText,
      fragment.suggestedWriting,
      fragment.suggestionFormatting,
      { emptyText: "尚未提供建議寫法。" }
    );
    if (!fragment.suggestedWriting.trim()) suggestionText.classList.add("is-empty");
    suggestion.append(createElement("span", "", "建議寫法"), suggestionText);
    const copyArea = renderSuggestionCopyArea(fragment);
    if (copyArea) suggestion.append(copyArea);
    pair.append(original, comment, suggestion);
    fragments.append(pair);
  });
  if (feedback.fragments.length) panel.append(fragments);
  const finalComment = feedbackTextSection("最後評語", feedback.finalComment, "teacher-feedback-final");
  if (finalComment) panel.append(finalComment);
  const improvedVersion = feedbackTextSection("保留原意改良版", feedback.improvedVersion, "teacher-feedback-improved");
  if (improvedVersion) panel.append(improvedVersion);
  const grammarArea = renderStudentFeedbackLearningArea("文法評語站", feedback.grammarPoints);
  if (grammarArea) panel.append(grammarArea);
  const sentenceArea = renderStudentFeedbackLearningArea(
    "句子結構提升區",
    feedback.sentenceStructureMethods,
    { sentenceStructure: true, links: feedback.sentenceStructureLinks }
  );
  if (sentenceArea) panel.append(sentenceArea);
  panel.append(renderStudentTranscriptions(feedback));
  container.append(panel);
}

function feedbackTextarea(label, value, datasetName, { rows = 3, maxLength = 20000 } = {}) {
  const wrapper = createElement("label", "teacher-feedback-field");
  wrapper.append(createElement("span", "", label));
  const textarea = document.createElement("textarea");
  textarea.rows = rows;
  textarea.maxLength = maxLength;
  textarea.value = value || "";
  textarea.dataset[datasetName] = "true";
  wrapper.append(textarea);
  return wrapper;
}

function renumberFeedbackEditorRows(list) {
  list.querySelectorAll("[data-feedback-pair]").forEach((pair, index) => {
    pair.dataset.feedbackPosition = String(index + 1);
    const label = pair.querySelector("[data-feedback-row-label]");
    if (label) label.textContent = `原句 ${index + 1}`;
    pair.querySelectorAll("[data-feedback-rich-editor]").forEach(editor => {
      const field = editor.dataset.feedbackRichEditor;
      const names = { original: "原句", comment: "Edmund 評語", suggestion: "建議寫法" };
      editor.setAttribute("aria-label", `${names[field] || "評語內容"} ${index + 1}`);
    });
  });
}

function nextFeedbackSuggestionIndex(list) {
  const indexes = [...list.querySelectorAll("[data-feedback-source-index]")]
    .map(pair => Number(pair.dataset.feedbackSourceIndex))
    .filter(Number.isSafeInteger);
  return indexes.length ? Math.max(...indexes) + 1 : 0;
}

function createFeedbackEditorRow({ index, value = {}, suggestedOriginal = "", sourceIndex = null, prefilledOnly = false }) {
  const pair = createElement("article", "teacher-feedback-edit-pair");
  pair.dataset.feedbackPair = "true";
  if (UUID_RE.test(String(value.id || ""))) pair.dataset.feedbackFragmentId = String(value.id);
  if (Number.isSafeInteger(sourceIndex)) pair.dataset.feedbackSourceIndex = String(sourceIndex);
  if (prefilledOnly) pair.dataset.feedbackPrefilledOnly = "true";

  const originalBand = createElement("section", "teacher-feedback-original");
  const originalHead = createElement("div", "teacher-feedback-edit-head");
  const rowLabel = createElement("strong", "", `原句 ${index + 1}`);
  rowLabel.dataset.feedbackRowLabel = "true";
  const rowActions = createElement("div", "teacher-feedback-row-actions");
  const insert = createElement("button", "teacher-feedback-insert", "中間插入新一般句");
  insert.type = "button";
  insert.dataset.feedbackInsertAfter = "true";
  const remove = createElement("button", "teacher-feedback-clear", "刪除此組");
  remove.type = "button";
  remove.dataset.feedbackRemovePair = "true";
  rowActions.append(insert, remove);
  originalHead.append(rowLabel, rowActions);
  const original = createFeedbackRichEditor({
    label: `原句 ${index + 1}`,
    value: value.originalFragment || suggestedOriginal,
    formatting: value.originalFormatting,
    maxLength: 10000,
    datasetName: "original"
  });
  if (prefilledOnly) {
    original.addEventListener("input", () => { delete pair.dataset.feedbackPrefilledOnly; }, { once: true });
  }
  originalBand.append(originalHead, original);

  const commentBand = createElement("section", "teacher-feedback-comment");
  commentBand.append(createElement("strong", "", "Edmund 評語"));
  const comment = createFeedbackRichEditor({
    label: `Edmund 評語 ${index + 1}`,
    value: value.edmundComment,
    formatting: value.commentFormatting,
    maxLength: 20000,
    datasetName: "comment"
  });
  commentBand.append(comment);

  const suggestionBand = createElement("section", "teacher-feedback-suggestion");
  suggestionBand.append(createElement("strong", "", "建議寫法"));
  const suggestion = createFeedbackRichEditor({
    label: `建議寫法 ${index + 1}`,
    value: value.suggestedWriting,
    formatting: value.suggestionFormatting,
    maxLength: 20000,
    datasetName: "suggestion"
  });
  suggestionBand.append(suggestion);
  pair.append(originalBand, commentBand, suggestionBand);
  return pair;
}

function appendFeedbackEditorRows(list, count, values = [], suggestions = []) {
  const start = list.querySelectorAll("[data-feedback-pair]").length;
  const available = Math.max(0, 200 - start);
  const amount = Math.min(Math.max(0, Number(count) || 0), available);
  const suggestionStart = nextFeedbackSuggestionIndex(list);
  for (let offset = 0; offset < amount; offset += 1) {
    const index = start + offset;
    const sourceIndex = suggestionStart + offset;
    const savedValue = values[index];
    const suggestedOriginal = savedValue ? "" : suggestions[sourceIndex] || "";
    list.append(createFeedbackEditorRow({
      index,
      value: savedValue || {},
      suggestedOriginal,
      sourceIndex,
      prefilledOnly: !savedValue && Boolean(suggestedOriginal)
    }));
  }
  renumberFeedbackEditorRows(list);
}

function createFeedbackLearningRow(kind, index, value = {}) {
  const grammar = kind === "grammar";
  const row = createElement("article", "teacher-feedback-learning-row");
  row.dataset.feedbackLearningRow = kind;
  const head = createElement("div", "teacher-feedback-learning-row-head");
  const label = createElement("strong", "", `${grammar ? "文法重點" : "句子結構方法"} ${index + 1}`);
  label.dataset.feedbackLearningLabel = "true";
  const remove = createElement("button", "teacher-feedback-clear", "清除此項");
  remove.type = "button";
  remove.dataset.feedbackLearningRemove = "true";
  head.append(label, remove);
  const editor = createFeedbackRichEditor({
    label: `${grammar ? "文法重點" : "句子結構方法"} ${index + 1}`,
    value: value.text || "",
    formatting: value.formatting,
    maxLength: 20000,
    datasetName: grammar ? "grammar-point" : "sentence-method"
  });
  row.append(head, editor);
  return row;
}

function renumberFeedbackLearningRows(list, kind) {
  const grammar = kind === "grammar";
  list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).forEach((row, index) => {
    const title = `${grammar ? "文法重點" : "句子結構方法"} ${index + 1}`;
    const label = row.querySelector("[data-feedback-learning-label]");
    if (label) label.textContent = title;
    row.querySelector("[data-feedback-rich-editor]")?.setAttribute("aria-label", title);
  });
}

function appendFeedbackLearningRows(list, kind, count, values = []) {
  const start = list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).length;
  const amount = Math.min(Math.max(0, Number(count) || 0), Math.max(0, 200 - start));
  for (let offset = 0; offset < amount; offset += 1) {
    list.append(createFeedbackLearningRow(kind, start + offset, values[start + offset] || {}));
  }
  renumberFeedbackLearningRows(list, kind);
}

function renderFeedbackLearningEditor({ kind, title, description, values = [], links = [] }) {
  const grammar = kind === "grammar";
  const section = createElement(
    "section",
    `teacher-feedback-learning-editor${grammar ? "" : " is-sentence-structure"}`
  );
  section.dataset.feedbackLearningEditor = kind;
  const head = createElement("div", "teacher-feedback-learning-head");
  head.append(createElement("h3", "", title), createElement("p", "", description));
  section.append(head, feedbackFormattingToolbar());
  const list = createElement("div", "teacher-feedback-learning-list");
  list.dataset.feedbackLearningList = kind;
  const initialCount = Math.max(10, Math.ceil(values.length / 10) * 10);
  appendFeedbackLearningRows(list, kind, initialCount, values);
  section.append(list);
  const add = createElement("button", "secondary-button teacher-feedback-add", "＋ 增加 10 項");
  add.type = "button";
  add.dataset.feedbackLearningAddTen = kind;
  section.append(add);
  if (!grammar) {
    const linkField = createElement("label", "teacher-feedback-links-editor");
    linkField.append(createElement("span", "", "句子結構練習連結（每行一條；可用「顯示名稱 | 連結」）"));
    const textarea = document.createElement("textarea");
    textarea.dataset.feedbackSentenceLinks = "true";
    textarea.placeholder = "進階倒裝句 | sentence-structure.html?lesson=lesson-id";
    textarea.value = links.map(link => `${link.label || "句子結構練習"} | ${link.url}`).join("\n");
    linkField.append(textarea);
    section.append(linkField);
  }
  return section;
}

function renderAdminFeedbackEditor(submission, feedback, container) {
  state.selectedAdminFeedback = feedback;
  state.adminFeedbackSuggestedFragments = submissionOriginalFragments(submission.answer);
  const panel = createElement("section", "teacher-feedback-editor");
  panel.dataset.feedbackEditor = submission.id;
  const heading = createElement("header", "teacher-feedback-editor-head");
  const copy = createElement("div");
  copy.append(createElement("p", "eyebrow", "STRUCTURED WRITING FEEDBACK"), createElement("h2", "", "撰寫 Edmund 評語"));
  const badge = createElement("span", "teacher-feedback-status", feedback?.status === "published" ? "已發送給學生" : feedback ? "評語草稿" : "尚未建立評語");
  badge.dataset.feedbackStatus = "true";
  heading.append(copy, badge);
  panel.append(heading);
  panel.append(feedbackTextarea("整體評語", feedback?.overallComment || "", "feedbackOverall"));
  const fragmentHeading = createElement("div", "teacher-feedback-fragment-heading");
  fragmentHeading.append(
    createElement("div", "", "逐句／逐段評語"),
    createElement("p", "", "每組依次顯示原句、Edmund 評語及建議寫法。可選取文字使用粗體或四色螢光筆；未填評語的預備原句不會送出。")
  );
  panel.append(fragmentHeading, feedbackFormattingToolbar());
  const list = createElement("div", "teacher-feedback-editor-list");
  list.dataset.feedbackPairs = "true";
  const saved = feedback?.fragments || [];
  const initialCount = Math.max(20, Math.ceil(saved.length / 10) * 10);
  appendFeedbackEditorRows(list, initialCount, saved, state.adminFeedbackSuggestedFragments);
  panel.append(list);
  const add = createElement("button", "secondary-button teacher-feedback-add", "＋ 增加 10 組");
  add.type = "button";
  add.dataset.feedbackAddTen = "true";
  panel.append(add);
  panel.append(feedbackTextarea("最後評語", feedback?.finalComment || "", "feedbackFinal"));
  panel.append(feedbackTextarea(
    "保留原意改良版",
    feedback?.improvedVersion || "",
    "feedbackImproved",
    { rows: 12, maxLength: 100000 }
  ));
  panel.append(renderFeedbackLearningEditor({
    kind: "grammar",
    title: "文法評語站",
    description: "每個欄位是一個獨立文法重點；最少預留 10 個，可逐次增加 10 個。數字清單可用 Shift + Enter 留空行後退出編號格式。",
    values: feedback?.grammarPoints || []
  }));
  panel.append(renderFeedbackLearningEditor({
    kind: "sentence",
    title: "句子結構提升區",
    description: "記錄進階改寫方法，並在最下方貼上句子結構系統的指定課堂連結。",
    values: feedback?.sentenceStructureMethods || [],
    links: feedback?.sentenceStructureLinks || []
  }));
  const status = createElement("p", "form-status teacher-feedback-save-status", "");
  status.dataset.feedbackSaveStatus = "true";
  status.setAttribute("role", "status");
  const actions = createElement("div", "teacher-feedback-actions");
  const saveDraft = createElement("button", "secondary-button", "儲存評語草稿");
  saveDraft.type = "button";
  saveDraft.dataset.feedbackSave = "draft";
  const publish = createElement("button", "primary-button", feedback?.status === "published" ? "更新並發送給學生" : "發送給學生");
  publish.type = "button";
  publish.dataset.feedbackSave = "published";
  const remove = createElement("button", "delete-submission-button teacher-feedback-delete", "刪除整份評語");
  remove.type = "button";
  remove.dataset.feedbackDelete = "true";
  remove.hidden = !feedback;
  actions.append(saveDraft, publish, remove);
  panel.append(status, actions);
  container.append(panel);
}

function readAdminFeedbackEditor(editor) {
  const fragments = [];
  for (const pair of editor.querySelectorAll("[data-feedback-pair]")) {
    const original = readFeedbackRichEditor(pair.querySelector('[data-feedback-rich-editor="original"]'));
    const comment = readFeedbackRichEditor(pair.querySelector('[data-feedback-rich-editor="comment"]'));
    const suggestion = readFeedbackRichEditor(pair.querySelector('[data-feedback-rich-editor="suggestion"]'));
    if (pair.dataset.feedbackPrefilledOnly === "true" && !comment.text && !suggestion.text) continue;
    if (!original.text && !comment.text && !suggestion.text) continue;
    fragments.push({
      id: UUID_RE.test(String(pair.dataset.feedbackFragmentId || ""))
        ? String(pair.dataset.feedbackFragmentId)
        : null,
      originalFragment: original.text,
      edmundComment: comment.text,
      suggestedWriting: suggestion.text,
      originalFormatting: original.formatting,
      commentFormatting: comment.formatting,
      suggestionFormatting: suggestion.formatting
    });
  }
  const overallComment = editor.querySelector("[data-feedback-overall]")?.value.trim() || "";
  const finalComment = editor.querySelector("[data-feedback-final]")?.value.trim() || "";
  const improvedVersion = editor.querySelector("[data-feedback-improved]")?.value.trim() || "";
  const grammarPoints = normalizeGrammarFeedbackPoints(
    [...editor.querySelectorAll('[data-feedback-learning-row="grammar"]')]
      .map(row => readFeedbackRichEditor(row.querySelector('[data-feedback-rich-editor="grammar-point"]')))
  );
  const sentenceStructureMethods = normalizeSentenceStructureMethods(
    [...editor.querySelectorAll('[data-feedback-learning-row="sentence"]')]
      .map(row => readFeedbackRichEditor(row.querySelector('[data-feedback-rich-editor="sentence-method"]')))
  );
  const sentenceStructureLinks = String(editor.querySelector("[data-feedback-sentence-links]")?.value || "")
    .split(/\r?\n/u)
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const divider = trimmed.indexOf("|");
      const label = divider >= 0 ? trimmed.slice(0, divider).trim() : `句子結構練習 ${index + 1}`;
      const rawUrl = divider >= 0 ? trimmed.slice(divider + 1).trim() : trimmed;
      const url = normalizeSentenceStructureDeepLink(rawUrl);
      if (!url) throw new Error(`第 ${index + 1} 行不是有效的句子結構課堂連結。`);
      return { label: label.slice(0, 200) || `句子結構練習 ${index + 1}`, url };
    })
    .filter(Boolean);
  if (
    !overallComment && !finalComment && !improvedVersion && !fragments.length
    && !grammarPoints.length && !sentenceStructureMethods.length && !sentenceStructureLinks.length
  ) {
    throw new Error("請先填寫至少一項評語內容。");
  }
  return {
    overallComment,
    finalComment,
    improvedVersion,
    grammarPoints,
    sentenceStructureMethods,
    sentenceStructureLinks,
    fragments
  };
}

async function saveStudentTranscriptions(submissionId) {
  if (!UUID_RE.test(String(submissionId || "")) || state.user?.role !== "student") return;
  const feedback = state.selectedStudentFeedback;
  const section = elements.submissionDetail.querySelector(`[data-feedback-transcriptions="${submissionId}"]`);
  if (!feedback || feedback.submissionId !== submissionId || !section) return;
  const save = section.querySelector("[data-transcription-save]");
  const status = section.querySelector("[data-transcription-status]");
  const improvedVersionCopy = section.querySelector("[data-transcription-improved]")?.value || "";
  const modelEssayCopy = section.querySelector("[data-transcription-model]")?.value || "";
  if (save) save.disabled = true;
  setStatus(status, "正在儲存謄文內容……");
  try {
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(submissionId)}/transcriptions`, {
      method: "PUT",
      body: JSON.stringify({
        improvedVersionCopy,
        modelEssayCopy,
        expectedVersion: feedback.transcriptionVersion
      })
    });
    if (state.selectedStudentFeedback !== feedback || state.selectedSubmissionId !== submissionId) return;
    const saved = payload?.transcriptions;
    const version = Number(saved?.version || 0);
    if (!Number.isSafeInteger(version) || version < 1) throw new Error("謄文服務回應無效。");
    feedback.transcriptionImproved = String(saved.improvedVersionCopy || "");
    feedback.transcriptionModel = String(saved.modelEssayCopy || "");
    feedback.transcriptionVersion = version;
    setStatus(status, "謄文內容已儲存。", "success");
    showToast("謄文內容已儲存。", "success");
  } catch (error) {
    setStatus(
      status,
      error?.code === "TRANSCRIPTION_VERSION_CONFLICT"
        ? "內容已在另一個視窗更新；請重新開啟文章後再儲存。"
        : error?.message || "暫時未能儲存謄文內容。",
      "error"
    );
  } finally {
    if (save?.isConnected) save.disabled = false;
  }
}

function selectedFeedbackFragment(fragmentId) {
  return state.selectedStudentFeedback?.fragments?.find(fragment => fragment.id === fragmentId) || null;
}

async function saveSuggestionCopy(fragmentId) {
  if (!UUID_RE.test(String(fragmentId || "")) || state.user?.role !== "student") return;
  const feedback = state.selectedStudentFeedback;
  const fragment = selectedFeedbackFragment(fragmentId);
  const section = elements.submissionDetail.querySelector(`[data-suggestion-copy-fragment="${fragmentId}"]`);
  if (!feedback || !fragment || !section || !UUID_RE.test(feedback.submissionId)) return;
  const textarea = section.querySelector(`[data-suggestion-copy-text="${fragmentId}"]`);
  const button = section.querySelector(`[data-suggestion-copy-save="${fragmentId}"]`);
  const status = section.querySelector(`[data-suggestion-copy-status="${fragmentId}"]`);
  if (button) button.disabled = true;
  setStatus(status, "正在儲存抄寫內容……");
  try {
    const payload = await apiJson(
      `/v1/submissions/${encodeURIComponent(feedback.submissionId)}/feedback/fragments/${encodeURIComponent(fragmentId)}/suggestion-copy`,
      {
        method: "PUT",
        body: JSON.stringify({
          text: textarea?.value || "",
          expectedVersion: fragment.suggestionCopyVersion
        })
      }
    );
    const saved = payload?.suggestionCopy || payload?.suggestion_copy;
    const version = Number(saved?.version || 0);
    if (!Number.isSafeInteger(version) || version < 1) throw new Error("抄寫服務回應無效。");
    fragment.suggestionCopyText = String(saved?.text || "");
    fragment.suggestionCopyVersion = version;
    fragment.suggestionCopyUpdatedAt = String(saved?.updatedAt || saved?.updated_at || "");
    setStatus(status, "抄寫內容已儲存。", "success");
    showToast("建議寫法抄寫已儲存。", "success");
  } catch (error) {
    setStatus(
      status,
      error?.code === "SUGGESTION_COPY_VERSION_CONFLICT"
        ? "內容已在另一個視窗更新；請重新開啟文章後再儲存。"
        : error?.message || "暫時未能儲存抄寫內容。",
      "error"
    );
  } finally {
    if (button?.isConnected) button.disabled = false;
  }
}

function normalizeFeedbackBookmark(value) {
  const source = value?.fragment && typeof value.fragment === "object"
    ? { ...value, ...value.fragment }
    : value || {};
  const fragmentId = String(source.fragmentId || source.fragment_id || source.id || "");
  const submissionId = String(source.submissionId || source.submission_id || "");
  const originalFragment = String(source.originalFragment || source.original_fragment || "");
  const edmundComment = String(source.edmundComment || source.edmund_comment || "");
  const suggestedWriting = String(source.suggestedWriting || source.suggested_writing || "");
  return {
    fragmentId,
    submissionId,
    topic: String(source.topic || source.submissionTopic || source.submission_topic || "未命名文章"),
    originalFragment,
    edmundComment,
    suggestedWriting,
    originalFormatting: normalizeFeedbackFormattingRuns(
      source.originalFormatting || source.original_formatting,
      originalFragment
    ),
    commentFormatting: normalizeFeedbackFormattingRuns(
      source.commentFormatting || source.comment_formatting,
      edmundComment
    ),
    suggestionFormatting: normalizeFeedbackFormattingRuns(
      source.suggestionFormatting || source.suggestion_formatting,
      suggestedWriting
    ),
    bookmarkVersion: Math.max(0, Number(source.bookmarkVersion ?? source.bookmark_version ?? source.version ?? 0)),
    bookmarkedAt: String(source.bookmarkedAt || source.bookmarked_at || source.updatedAt || source.updated_at || "")
  };
}

function renderFeedbackBookmarks() {
  elements.feedbackBookmarkCount.textContent = String(state.feedbackBookmarks.length);
  if (!state.feedbackBookmarks.length) {
    elements.feedbackBookmarkList.replaceChildren(emptyState("尚未收藏任何原句。開啟已收到評語的文章，按「收藏原句」即可加入。"));
    return;
  }
  const output = document.createDocumentFragment();
  state.feedbackBookmarks.forEach((bookmark) => {
    const card = createElement("article", "feedback-bookmark-card");
    const head = createElement("header", "feedback-bookmark-card-head");
    head.append(createElement("strong", "", bookmark.topic));
    const remove = createElement("button", "", "移除收藏");
    remove.type = "button";
    remove.dataset.feedbackBookmarkRemove = bookmark.fragmentId;
    head.append(remove);
    const original = createElement("section", "feedback-bookmark-card-original");
    original.append(createElement("strong", "", "原句"));
    const originalText = createElement("div", "teacher-feedback-rich-content");
    appendFeedbackRichText(originalText, bookmark.originalFragment, bookmark.originalFormatting);
    original.append(originalText);
    const comment = createElement("section", "feedback-bookmark-card-comment");
    comment.append(createElement("strong", "", "Edmund 評語"));
    const commentText = createElement("div", "teacher-feedback-rich-content");
    appendStructuredFeedbackRichText(commentText, bookmark.edmundComment, bookmark.commentFormatting);
    comment.append(commentText);
    card.append(head, original, comment);
    if (bookmark.suggestedWriting.trim()) {
      const suggestion = createElement("section", "feedback-bookmark-card-suggestion");
      suggestion.append(createElement("strong", "", "建議寫法"));
      const suggestionText = createElement("div", "teacher-feedback-rich-content");
      appendFeedbackRichText(suggestionText, bookmark.suggestedWriting, bookmark.suggestionFormatting);
      suggestion.append(suggestionText);
      card.append(suggestion);
    }
    const footer = createElement("footer", "feedback-bookmark-card-footer");
    const open = createElement("button", "feedback-bookmark-open", "開啟原文 →");
    open.type = "button";
    open.dataset.feedbackBookmarkOpen = bookmark.submissionId;
    footer.append(open);
    card.append(footer);
    output.append(card);
  });
  elements.feedbackBookmarkList.replaceChildren(output);
}

async function loadFeedbackBookmarks() {
  if (state.user?.role !== "student" || state.feedbackBookmarksLoading) return;
  state.feedbackBookmarksLoading = true;
  elements.feedbackBookmarkList.replaceChildren(loadingState("正在載入評語書籤……"));
  try {
    const bookmarks = [];
    for (let page = 1; page <= 20; page += 1) {
      const payload = await apiJson(`/v1/feedback-bookmarks?page=${page}&pageSize=100`);
      const rows = Array.isArray(payload?.bookmarks) ? payload.bookmarks : [];
      bookmarks.push(...rows.map(normalizeFeedbackBookmark).filter(item => (
        UUID_RE.test(item.fragmentId) && UUID_RE.test(item.submissionId)
      )));
      if (!payload?.hasMore) break;
    }
    state.feedbackBookmarks = bookmarks;
    renderFeedbackBookmarks();
  } catch (error) {
    elements.feedbackBookmarkList.replaceChildren(emptyState(error.message || "暫時未能載入評語書籤。"));
    throw error;
  } finally {
    state.feedbackBookmarksLoading = false;
  }
}

async function openFeedbackBookmarks() {
  showView("feedback-bookmarks");
  await loadFeedbackBookmarks();
}

async function setFeedbackBookmark(fragmentId, bookmarked) {
  if (!UUID_RE.test(String(fragmentId || "")) || state.user?.role !== "student") return;
  const currentFragment = selectedFeedbackFragment(fragmentId);
  const savedBookmark = state.feedbackBookmarks.find(item => item.fragmentId === fragmentId);
  const expectedVersion = currentFragment?.bookmarkVersion ?? savedBookmark?.bookmarkVersion ?? 0;
  const buttons = [...document.querySelectorAll(`[data-feedback-bookmark-fragment="${fragmentId}"], [data-feedback-bookmark-remove="${fragmentId}"]`)];
  buttons.forEach(button => { button.disabled = true; });
  try {
    const payload = await apiJson(`/v1/feedback-bookmarks/${encodeURIComponent(fragmentId)}`, {
      method: "PUT",
      body: JSON.stringify({ bookmarked, expectedVersion })
    });
    const saved = payload?.bookmark || payload;
    const version = Number(saved?.version || 0);
    if (!Number.isSafeInteger(version) || version < 1) throw new Error("書籤服務回應無效。");
    if (currentFragment) {
      currentFragment.bookmarked = bookmarked;
      currentFragment.bookmarkVersion = version;
    }
    if (bookmarked) {
      showToast("原句已加入評語書籤。", "success");
      if (currentFragment && state.selectedStudentFeedback) {
        const existing = state.feedbackBookmarks.findIndex(item => item.fragmentId === fragmentId);
        const provisional = normalizeFeedbackBookmark({
          ...currentFragment,
          fragmentId,
          submissionId: state.selectedStudentFeedback.submissionId,
          topic: state.submissions.find(item => item.id === state.selectedStudentFeedback.submissionId)?.topic,
          bookmarkVersion: version
        });
        if (existing >= 0) state.feedbackBookmarks[existing] = provisional;
        else state.feedbackBookmarks.unshift(provisional);
      }
    } else {
      state.feedbackBookmarks = state.feedbackBookmarks.filter(item => item.fragmentId !== fragmentId);
      showToast("已移除評語書籤。", "success");
    }
    document.querySelectorAll(`[data-feedback-bookmark-fragment="${fragmentId}"]`).forEach((button) => {
      button.setAttribute("aria-pressed", String(bookmarked));
      button.textContent = bookmarked ? "★ 已收藏" : "☆ 收藏原句";
      button.disabled = false;
    });
    if (state.currentView === "feedback-bookmarks") renderFeedbackBookmarks();
  } catch (error) {
    showToast(
      error?.code === "BOOKMARK_VERSION_CONFLICT"
        ? "書籤已在另一個視窗更新；請重新載入後再試。"
        : error?.message || "暫時未能更新書籤。",
      "error"
    );
    buttons.forEach(button => { if (button.isConnected) button.disabled = false; });
  }
}

async function loadStudentFeedback(submissionId, container, requestGeneration) {
  try {
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(submissionId)}/feedback`);
    if (
      state.submissionRequestGeneration !== requestGeneration
      || state.selectedSubmissionId !== submissionId
      || container !== elements.submissionDetail
    ) return;
    const feedback = normalizeTeacherFeedback(payload?.feedback);
    renderStudentFeedback(feedback, container);
    if (feedback?.status === "published") {
      const index = state.submissions.findIndex(item => item.id === submissionId);
      if (index >= 0) {
        state.submissions[index] = {
          ...state.submissions[index],
          hasPublishedFeedback: true,
          feedbackUnread: false
        };
        renderSubmissionList();
      }
    }
  } catch (error) {
    console.warn("Student writing feedback could not be loaded", error);
    if (
      state.submissionRequestGeneration !== requestGeneration
      || state.selectedSubmissionId !== submissionId
      || container !== elements.submissionDetail
    ) return;
    const note = createElement("p", "form-status teacher-feedback-unavailable", "Edmund 評語暫時未能載入；您的文章內容並未受影響。");
    note.dataset.tone = "error";
    container.append(note);
  }
}

async function loadAdminFeedback(submission, container, requestGeneration) {
  try {
    const payload = await apiJson(`/v1/admin/submissions/${encodeURIComponent(submission.id)}/feedback`);
    const feedback = normalizeTeacherFeedback(payload?.feedback);
    if (
      state.adminSubmissionRequestGeneration !== requestGeneration
      || state.selectedAdminSubmissionId !== submission.id
      || container !== elements.adminDetail
    ) return;
    renderAdminFeedbackEditor(submission, feedback, container);
  } catch (error) {
    console.warn("Admin writing feedback could not be loaded", error);
    if (
      state.adminSubmissionRequestGeneration !== requestGeneration
      || state.selectedAdminSubmissionId !== submission.id
      || container !== elements.adminDetail
    ) return;
    const note = createElement("p", "form-status teacher-feedback-unavailable", "評語服務暫時未能載入。為免覆蓋既有評語，現時不會開啟編輯器，請稍後重試。");
    note.dataset.tone = "error";
    container.append(note);
  }
}

function isCurrentAdminFeedbackEditor(submissionId, requestGeneration, editor) {
  return state.adminSubmissionRequestGeneration === requestGeneration
    && state.selectedAdminSubmissionId === submissionId
    && editor?.isConnected
    && editor.parentElement === elements.adminDetail;
}

async function saveAdminFeedback(status) {
  const submissionId = state.selectedAdminSubmissionId;
  const editor = elements.adminDetail.querySelector(`[data-feedback-editor="${submissionId}"]`);
  if (!editor || !UUID_RE.test(submissionId)) return;
  const requestGeneration = state.adminSubmissionRequestGeneration;
  const expectedFeedbackId = state.selectedAdminFeedback?.id || null;
  const expectedVersion = state.selectedAdminFeedback?.version || 0;
  const statusNode = editor.querySelector("[data-feedback-save-status]");
  let payload;
  try {
    payload = readAdminFeedbackEditor(editor);
    if (
      status === "published"
      && payload.fragments.some(fragment => !fragment.originalFragment || !fragment.edmundComment)
    ) {
      throw new Error("發送前，每一組評語都必須同時填寫原句及 Edmund 評語。未完成的組別可先儲存為草稿。");
    }
  } catch (error) {
    setStatus(statusNode, error.message, "error");
    return;
  }
  editor.querySelectorAll("[data-feedback-save], [data-feedback-delete]").forEach(button => { button.disabled = true; });
  setStatus(statusNode, status === "published" ? "正在發送評語給學生……" : "正在儲存評語草稿……");
  try {
    const response = await apiJson(`/v1/admin/submissions/${encodeURIComponent(submissionId)}/feedback`, {
      method: "PUT",
      body: JSON.stringify({
        ...payload,
        status,
        expectedFeedbackId,
        expectedVersion
      })
    });
    const savedFeedback = normalizeTeacherFeedback(response?.feedback);
    if (!savedFeedback) throw new Error("評語服務回應無效。");
    const submissionIndex = state.adminSubmissions.findIndex(item => item.id === submissionId);
    if (submissionIndex >= 0) {
      state.adminSubmissions[submissionIndex] = {
        ...state.adminSubmissions[submissionIndex],
        hasPublishedFeedback: savedFeedback.status === "published"
      };
      renderAdminSubmissions();
    }
    showToast(status === "published" ? "評語已發送給學生。" : "評語草稿已儲存。", "success");
    if (isCurrentAdminFeedbackEditor(submissionId, requestGeneration, editor)) {
      await openAdminSubmission(submissionId);
    }
  } catch (error) {
    if (!isCurrentAdminFeedbackEditor(submissionId, requestGeneration, editor)) {
      showToast(
        error?.code === "FEEDBACK_VERSION_CONFLICT"
          ? "先前開啟的評語已在另一個視窗更新，請重新載入後再編輯。"
          : error?.message || "先前開啟的評語暫時未能儲存。",
        "error"
      );
      return;
    }
    setStatus(
      statusNode,
      error?.code === "FEEDBACK_VERSION_CONFLICT"
        ? "評語已在另一個視窗更新，請重新載入後再編輯。"
        : error?.message || "暫時未能儲存評語。",
      "error"
    );
    editor.querySelectorAll("[data-feedback-save], [data-feedback-delete]").forEach(button => { button.disabled = false; });
  }
}

async function deleteAdminFeedback() {
  const submissionId = state.selectedAdminSubmissionId;
  const editor = elements.adminDetail.querySelector(`[data-feedback-editor="${submissionId}"]`);
  if (!editor || !UUID_RE.test(submissionId) || !window.confirm("確定要刪除這篇文章的整份評語嗎？學生將不能再看到，刪除後不能復原。")) return;
  const requestGeneration = state.adminSubmissionRequestGeneration;
  const expectedFeedbackId = state.selectedAdminFeedback?.id || null;
  const expectedVersion = state.selectedAdminFeedback?.version || 0;
  try {
    await apiJson(`/v1/admin/submissions/${encodeURIComponent(submissionId)}/feedback`, {
      method: "DELETE",
      body: JSON.stringify({
        expectedFeedbackId,
        expectedVersion
      })
    });
    const submissionIndex = state.adminSubmissions.findIndex(item => item.id === submissionId);
    if (submissionIndex >= 0) {
      state.adminSubmissions[submissionIndex] = {
        ...state.adminSubmissions[submissionIndex],
        hasPublishedFeedback: false
      };
      renderAdminSubmissions();
    }
    showToast("整份評語已刪除。", "success");
    if (isCurrentAdminFeedbackEditor(submissionId, requestGeneration, editor)) {
      await openAdminSubmission(submissionId);
    }
  } catch (error) {
    showToast(
      error?.code === "FEEDBACK_VERSION_CONFLICT"
        ? "評語已在另一個視窗更新，請重新載入後再刪除。"
        : error?.message || "暫時未能刪除評語。",
      "error"
    );
  }
}

async function loadSubmissions({ selectId = "" } = {}) {
  elements.submissionList.replaceChildren(loadingState("正在載入文章…"));
  state.submissions = await fetchAllSubmissionPages("/v1/submissions");
  const availableIds = new Set(state.submissions.map(item => item.id));
  for (const id of state.selectedExportSubmissionIds) {
    if (!availableIds.has(id)) state.selectedExportSubmissionIds.delete(id);
  }
  renderSubmissionList();
  if (selectId) await openSubmission(selectId);
}

async function openSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  const requestedId = String(id);
  const requestGeneration = state.submissionRequestGeneration + 1;
  state.submissionRequestGeneration = requestGeneration;
  state.selectedSubmissionId = requestedId;
  state.selectedStudentFeedback = null;
  renderSubmissionList();
  elements.submissionDetail.replaceChildren(loadingState("正在載入文章內容…"));
  try {
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(requestedId)}`);
    if (
      state.submissionRequestGeneration !== requestGeneration
      || state.selectedSubmissionId !== requestedId
    ) return;
    const submission = normalizeSubmission(payload?.submission || payload);
    if (Array.isArray(payload?.grammarOccurrences)) submission.occurrenceCount = payload.grammarOccurrences.length;
    renderSubmissionDetail(submission);
    await loadStudentFeedback(submission.id, elements.submissionDetail, requestGeneration);
  } catch (error) {
    if (
      state.submissionRequestGeneration !== requestGeneration
      || state.selectedSubmissionId !== requestedId
    ) return;
    elements.submissionDetail.replaceChildren(emptyState(error.message || "未能載入文章。"));
  }
}

async function openSubmissions({ selectId = "" } = {}) {
  showView("submissions");
  const submissionsPromise = loadSubmissions({ selectId });
  const auxiliaryResultsPromise = Promise.allSettled([loadWritingProgress(), loadDrafts()]);
  await submissionsPromise;
  const auxiliaryResults = await auxiliaryResultsPromise;
  if (auxiliaryResults[0].status === "rejected") {
    console.warn("Writing progress load failed", auxiliaryResults[0].reason);
  }
  if (auxiliaryResults[1].status === "rejected") {
    console.warn("Writing draft list load failed", auxiliaryResults[1].reason);
    elements.draftList.replaceChildren(emptyState("未完成草稿列表暫時未能載入；本機草稿仍然安全保留。"));
  }
}

async function openStudentEntryLink() {
  if (!entryLink || state.entryLinkHandled || state.user?.role !== "student") return false;
  state.entryLinkHandled = true;
  if (entryLink.type === "submission") {
    await restoreDraft();
    try {
      await openSubmissions({ selectId: entryLink.submissionId });
      showToast("已開啟老師批改完成的作文。", "success");
    } catch (error) {
      console.warn("Writing submission entry link failed", error);
      state.entryLinkHandled = false;
      showView("submissions");
      elements.submissionList.replaceChildren(emptyState("文章列表暫時未能載入。"));
      await openSubmission(entryLink.submissionId);
      showToast(error.message || "文章列表暫時未能載入；正嘗試直接開啟指定作文。", "error");
    }
    return true;
  }

  try {
    await loadWritingTopicCatalog();
    const resource = canonicalWritingTopicResource(`fill:${entryLink.exerciseId}`);
    if (!resource) throw new Error("這項寫作練習不存在，或您的帳戶尚未獲准使用。");
    const storedDraft = readDraft();
    if (storedDraft?.selectedTopicResource?.id === resource.id) {
      await restoreDraft();
      showView("workspace");
      showToast("已繼續上次未完成的功課寫作。", "success");
      return true;
    }
    const archivedPreviousDraft = await archiveStoredDraftBeforeEntryLink(storedDraft);
    startNewDraft({ preserveView: true });
    selectWritingTopic(resource.id, { persist: true, close: false, toast: false });
    showView("workspace");
    showToast(
      archivedPreviousDraft
        ? "舊草稿已儲存至「我的文章」；現已載入功課指定的寫作題目。"
        : "已載入功課指定的寫作題目及溫習資源。",
      "success"
    );
  } catch (error) {
    state.entryLinkHandled = false;
    await restoreDraft();
    showView("workspace");
    showToast(error.message || "暫時未能載入功課指定的寫作題目。", "error");
  }
  return true;
}

async function openGrammarSourceSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  showView("submissions");
  await Promise.all([loadSubmissions({ selectId: id }), loadWritingProgress()]);
}

async function deleteStudentSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  const submission = state.submissions.find(item => item.id === id);
  const confirmed = window.confirm(`確定要從「我的文章」刪除「${submission?.topic || "這篇文章"}」嗎？文法問題記錄仍會保留給管理員。`);
  if (!confirmed) return;
  try {
    await apiJson(`/v1/submissions/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.selectedExportSubmissionIds.delete(id);
    if (state.selectedSubmissionId === id) {
      state.selectedSubmissionId = "";
      state.submissionRequestGeneration += 1;
      elements.submissionDetail.replaceChildren(emptyState("文章已從您的個人列表刪除；管理員仍可查看保存記錄。"));
    }
    await Promise.all([loadSubmissions(), loadWritingProgress()]);
    showToast("文章已從您的個人列表刪除。", "success");
  } catch (error) {
    console.warn("Writing submission deletion failed", error);
    showToast(error.message || "暫時未能刪除文章。", "error");
  }
}

async function submitCurrentWriting({ source = "manual" } = {}) {
  if (state.submissionPromise) return state.submissionPromise;
  if (source === "manual" && !isWritingProofreadingReady(state.proofreadingGate)) {
    throw new Error("請先完成五分鐘校對時間，再正式提交文章。");
  }
  const topic = elements.topicInput.value.trim();
  const answer = elements.writingInput.value.trim();
  if (!topic || !answer) throw new Error("請先輸入寫作題目及文章內容。");
  accrueWritingTime();
  if (!UUID_RE.test(state.documentId)) state.documentId = newDocumentId();
  const submittedDocumentId = state.documentId;
  if (!Number.isSafeInteger(state.submissionDurationSeconds)) {
    state.submissionDurationSeconds = Math.max(0, Math.round(state.draftDurationSeconds));
    persistDraft();
  }
  const submittedDurationSeconds = state.submissionDurationSeconds;
  const submissionTask = (async () => {
    if (source === "timer") {
      setStatus(elements.submissionStatus, "時間已到，正在自動提交文章…");
      await Promise.race([
        state.checkQueue,
        new Promise((resolve) => window.setTimeout(resolve, 2000))
      ]);
    } else {
      setStatus(elements.submissionStatus, "正在安全保存文章…");
      await state.checkQueue;
    }
    const remoteChecks = [...state.remoteGrammarPromises];
    if (remoteChecks.length) {
      await Promise.race([
        Promise.allSettled(remoteChecks),
        new Promise((resolve) => window.setTimeout(resolve, source === "timer" ? 900 : 1500))
      ]);
    }
    const payload = await apiJson(`/v1/submissions/${encodeURIComponent(submittedDocumentId)}`, {
      method: "PUT",
      body: JSON.stringify({
        topic,
        answer,
        durationSeconds: submittedDurationSeconds,
        topicResource: canonicalWritingTopicResourceForTransport(state.selectedTopicResource)
      })
    });
    const saved = normalizeSubmission(payload?.submission || payload);
    const submittedId = saved.id || submittedDocumentId;
    clearStoredDraft();
    setStatus(elements.submissionStatus, source === "timer" ? "時間已到；文章已自動提交及保存。" : "文章已提交及保存。", "success");
    showToast(source === "timer" ? "時間已到，文章已自動提交。" : "文章已成功提交。", "success");
    flushGrammarOccurrences().catch((error) => {
      console.warn("Grammar history will retry after submission", error);
      scheduleOccurrenceFlush();
    });
    startNewDraft({ preserveView: true });
    await openSubmissions();
    await openSubmission(submittedId);
    return submittedId;
  })();
  state.submissionPromise = submissionTask;
  elements.submitWriting.disabled = true;
  syncWritingTimerUi();
  try {
    return await submissionTask;
  } finally {
    state.submissionPromise = null;
    syncWritingTimerUi();
    syncWritingProofreadingUi();
    if (
      state.writingTimer.status === "expired"
      && state.writingTimer.forceSubmit
      && !state.writingTimer.autoSubmitAttemptedAt
    ) {
      window.setTimeout(() => attemptTimerForceSubmission(), 0);
    }
  }
}

async function submitWriting(event) {
  event.preventDefault();
  try {
    state.proofreadingGate = normalizeWritingProofreadingGate(state.proofreadingGate);
    if (!isWritingProofreadingReady(state.proofreadingGate)) {
      if (!isWritingProofreadingActive(state.proofreadingGate)) beginWritingProofreading();
      return;
    }
    await submitCurrentWriting({ source: "manual" });
  } catch (error) {
    console.warn("Writing submission failed", error);
    setStatus(elements.submissionStatus, error.message || "未能保存文章，請再試一次。", "error");
  }
}

function normalizeGrammarProblem(value) {
  return {
    ruleId: String(value?.ruleId || value?.rule_id || "UnknownRule"),
    title: String(value?.title || value?.ruleTitle || value?.rule_title || value?.ruleId || value?.rule_id || "文法問題"),
    message: String(value?.message || value?.lastMessage || value?.last_message || ""),
    count: Number(value?.count ?? value?.occurrenceCount ?? value?.occurrence_count ?? 0),
    firstSeenAt: String(value?.firstSeenAt || value?.first_seen_at || ""),
    lastSeenAt: String(value?.lastSeenAt || value?.last_seen_at || ""),
    occurrences: [],
    occurrencePage: 0,
    occurrenceHasMore: false,
    occurrencesLoaded: false,
    occurrencesLoading: false,
    open: false
  };
}

function correctedHistorySentence(value) {
  const explicit = String(value?.correctedSentence || value?.corrected_sentence || "");
  if (explicit) return explicit;
  const sentence = String(value?.sentenceText || value?.sentence_text || "");
  const original = String(value?.originalText || value?.original_text || "");
  const suggested = String(value?.suggestedText || value?.suggested_text || "");
  const index = original ? sentence.indexOf(original) : -1;
  if (index < 0) return sentence;
  return `${sentence.slice(0, index)}${suggested}${sentence.slice(index + original.length)}`;
}

function normalizeGrammarOccurrence(value) {
  return {
    id: String(value?.id || ""),
    documentId: String(value?.documentId || value?.document_id || ""),
    submissionId: String(value?.submissionId || value?.submission_id || ""),
    ruleId: String(value?.ruleId || value?.rule_id || "UnknownRule"),
    title: String(value?.title || value?.ruleTitle || value?.rule_title || "文法問題"),
    message: String(value?.message || ""),
    originalText: String(value?.originalText || value?.original_text || ""),
    suggestedText: String(value?.suggestedText || value?.suggested_text || ""),
    sentenceText: String(value?.sentenceText || value?.sentence_text || ""),
    correctedSentence: correctedHistorySentence(value),
    detectedAt: String(value?.detectedAt || value?.detected_at || ""),
    sourceTopic: String(value?.sourceTopic || value?.source_topic || ""),
    sourceSubmittedAt: String(value?.sourceSubmittedAt || value?.source_submitted_at || ""),
    sourceDeletedAt: String(value?.sourceDeletedAt || value?.source_deleted_at || ""),
    studentId: String(value?.studentId || value?.student_id || ""),
    studentName: String(value?.studentName || value?.student_name || "")
  };
}

function appendHighlightedOccurrenceSentence(container, sentence, fragment) {
  const fullSentence = String(sentence || "");
  const issueFragment = String(fragment || "");
  const index = issueFragment ? fullSentence.indexOf(issueFragment) : -1;
  if (index < 0) {
    container.textContent = fullSentence;
    return;
  }
  container.append(
    document.createTextNode(fullSentence.slice(0, index)),
    createElement("mark", "", issueFragment),
    document.createTextNode(fullSentence.slice(index + issueFragment.length))
  );
}

function createGrammarHistoryCard(occurrence, { admin = false } = {}) {
  const card = createElement("article", "grammar-history-card");
  const head = createElement("header", "grammar-history-card-head");
  head.append(
    createElement("strong", "", occurrence.title),
    createElement("time", "", formatSubmissionDate(occurrence.detectedAt))
  );
  if (admin && occurrence.studentName) {
    head.append(createElement("span", "grammar-history-student", occurrence.studentName));
  }
  if (admin && occurrence.ruleId) {
    head.append(createElement("span", "grammar-history-rule", occurrence.ruleId));
  }

  const original = createElement("p", "grammar-history-original");
  appendHighlightedOccurrenceSentence(original, occurrence.sentenceText, occurrence.originalText);

  const replacement = createElement("div", "grammar-history-replacement");
  replacement.append(
    createElement("small", "", "此項局部修正後（句內仍可能有其他問題）"),
    createElement("p", "", occurrence.correctedSentence || occurrence.sentenceText)
  );

  const explanation = createElement("div", "grammar-history-explanation");
  explanation.append(
    createElement("small", "", "Explanation"),
    createElement("p", "", occurrence.message || "（未有解釋）")
  );

  const source = createElement("footer", "grammar-history-source");
  const sourceLabel = occurrence.sourceTopic
    ? `來源文章：${occurrence.sourceTopic}${occurrence.sourceDeletedAt ? "（已從我的文章刪除）" : ""}`
    : "來源：尚未提交的寫作草稿";
  const sourceMeta = createElement("span", "", occurrence.sourceSubmittedAt
    ? `${sourceLabel} · ${formatSubmissionDate(occurrence.sourceSubmittedAt)}`
    : sourceLabel);
  source.append(sourceMeta);
  if (occurrence.submissionId && (admin || !occurrence.sourceDeletedAt)) {
    const sourceButton = createElement("button", "grammar-history-source-button", "開啟來源文章");
    sourceButton.type = "button";
    if (admin) sourceButton.dataset.adminGrammarSourceSubmission = occurrence.submissionId;
    else sourceButton.dataset.grammarSourceSubmission = occurrence.submissionId;
    source.append(sourceButton);
  }

  card.append(head, original, replacement, explanation, source);
  return card;
}

function grammarProblemOccurrenceContainer(index) {
  return document.querySelector(`[data-grammar-problem-occurrences="${index}"]`);
}

function renderGrammarProblemOccurrences(problem, index) {
  const container = grammarProblemOccurrenceContainer(index);
  if (!container) return;
  if (problem.occurrencesLoading && !problem.occurrences.length) {
    container.replaceChildren(loadingState("正在載入每次問題的完整記錄…"));
    return;
  }
  if (!problem.occurrences.length) {
    container.replaceChildren(emptyState("這個舊有分類暫時只有總數，未有可顯示的完整句子記錄。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const occurrence of problem.occurrences) {
    fragment.append(createGrammarHistoryCard(occurrence));
  }
  if (problem.occurrenceHasMore) {
    const more = createElement("button", "secondary-button grammar-history-more", "顯示更多記錄");
    more.type = "button";
    more.dataset.loadGrammarProblem = String(index);
    more.disabled = problem.occurrencesLoading;
    fragment.append(more);
  }
  container.replaceChildren(fragment);
}

async function loadGrammarProblemOccurrences(index, { reset = false } = {}) {
  const problem = state.grammarProblems[index];
  if (!problem || problem.occurrencesLoading) return;
  problem.occurrencesLoading = true;
  if (reset) {
    problem.occurrences = [];
    problem.occurrencePage = 0;
    problem.occurrenceHasMore = false;
  }
  renderGrammarProblemOccurrences(problem, index);
  try {
    const page = problem.occurrencePage + 1;
    const query = new URLSearchParams({
      ruleId: problem.ruleId,
      page: String(page),
      pageSize: "25"
    });
    const payload = await apiJson(`/v1/grammar-problem-occurrences?${query}`);
    const source = Array.isArray(payload) ? payload : payload?.grammarOccurrences;
    const next = Array.isArray(source) ? source.map(normalizeGrammarOccurrence) : [];
    const known = new Set(problem.occurrences.map(item => item.id));
    problem.occurrences.push(...next.filter(item => item.id && !known.has(item.id)));
    problem.occurrencePage = page;
    problem.occurrenceHasMore = Boolean(payload?.hasMore);
    problem.occurrencesLoaded = true;
  } finally {
    problem.occurrencesLoading = false;
    renderGrammarProblemOccurrences(problem, index);
  }
}

function renderGrammarSummary() {
  const total = state.grammarProblems.reduce((sum, problem) => sum + problem.count, 0);
  elements.uniqueRuleCount.textContent = String(state.grammarProblems.length);
  elements.totalIssueCount.textContent = String(total);
  if (!state.grammarProblems.length) {
    elements.grammarSummaryList.replaceChildren(emptyState("尚未有文法問題記錄。完成句子後，本機檢查結果會在這裡累積。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  state.grammarProblems.forEach((problem, index) => {
    const row = createElement("details", "grammar-summary-row");
    row.dataset.grammarProblemIndex = String(index);
    row.open = problem.open;
    const summary = createElement("summary", "grammar-summary-head");
    const copy = createElement("span", "grammar-summary-copy");
    copy.append(
      createElement("h3", "", problem.title),
      createElement("p", "", problem.message || problem.ruleId),
      createElement("small", "", `規則：${problem.ruleId} · 最近：${formatSubmissionDate(problem.lastSeenAt)}`)
    );
    summary.append(copy, createElement("strong", "", `${problem.count} 次`));
    const occurrences = createElement("div", "grammar-history-list");
    occurrences.dataset.grammarProblemOccurrences = String(index);
    row.append(summary, occurrences);
    fragment.append(row);
  });
  elements.grammarSummaryList.replaceChildren(fragment);
  state.grammarProblems.forEach((problem, index) => {
    if (problem.open) renderGrammarProblemOccurrences(problem, index);
  });
}

async function openGrammarLog() {
  showView("grammar-log");
  elements.grammarSummaryList.replaceChildren(loadingState("正在整理文法問題…"));
  const payload = await apiJson("/v1/grammar-problems");
  const source = Array.isArray(payload) ? payload : payload?.grammarProblems;
  state.grammarProblems = Array.isArray(source)
    ? source.map(normalizeGrammarProblem).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    : [];
  renderGrammarSummary();
}

async function fetchAllGrammarOccurrencesForRule(ruleId) {
  const occurrences = [];
  for (let page = 1; page <= 10000; page += 1) {
    const query = new URLSearchParams({ ruleId, page: String(page), pageSize: "100" });
    const payload = await apiJson(`/v1/grammar-problem-occurrences?${query}`);
    const rows = Array.isArray(payload?.grammarOccurrences)
      ? payload.grammarOccurrences.map(normalizeGrammarOccurrence)
      : [];
    occurrences.push(...rows);
    if (!payload?.hasMore) return occurrences;
  }
  throw new Error("文法記錄超出目前可匯出的頁數上限。");
}

function grammarExportHtml(problems) {
  const generatedAt = new Intl.DateTimeFormat("zh-HK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Hong_Kong"
  }).format(new Date());
  const sections = problems.map((problem, index) => {
    const instances = problem.occurrences.map((occurrence, occurrenceIndex) => `
      <article class="instance">
        <h3>實例 ${occurrenceIndex + 1}</h3>
        <p><strong>原句</strong>${escapePrintHtml(occurrence.sentenceText || "（沒有原句）")}</p>
        <p><strong>建議修正</strong>${escapePrintHtml(occurrence.correctedSentence || occurrence.suggestedText || "（沒有建議）")}</p>
        <p><strong>解釋</strong>${escapePrintHtml(occurrence.message || "（沒有解釋）")}</p>
        <small>${escapePrintHtml(formatSubmissionDate(occurrence.detectedAt))}${occurrence.sourceTopic ? ` · ${escapePrintHtml(occurrence.sourceTopic)}` : ""}</small>
      </article>`).join("");
    return `<section class="problem">
      <header><p>GRAMMAR CATEGORY ${index + 1}</p><h2>${escapePrintHtml(problem.title)}</h2><div><span>規則：${escapePrintHtml(problem.ruleId)}</span><span>${problem.count} 次</span></div></header>
      ${instances || "<p>沒有可顯示的完整實例。</p>"}
    </section>`;
  }).join("");
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EdmundEducation－我的文法問題</title>
  <style>*{box-sizing:border-box}body{margin:0;color:#242342;background:#eee;font-family:Georgia,"Times New Roman","Noto Serif TC",serif}.toolbar{position:sticky;top:0;z-index:5;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:14px;color:#fff;background:#272757;font-family:system-ui,sans-serif}.toolbar p{margin:0;font-size:13px}.toolbar button{border:0;border-radius:999px;padding:10px 16px;color:#272757;background:#fff;font-weight:800}main{width:min(920px,calc(100% - 28px));margin:26px auto}.cover,.problem{margin-bottom:24px;padding:38px 42px;background:#fff;box-shadow:0 12px 38px rgba(20,20,50,.11)}.cover h1{margin:0 0 8px;font-size:34px}.cover p{color:#66637c}.problem{break-before:page}.problem header{padding-bottom:16px;border-bottom:2px solid #f0dfd1}.problem header>p{margin:0 0 7px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.13em}.problem h2{margin:0 0 10px}.problem header div{display:flex;flex-wrap:wrap;gap:8px 16px;color:#66637c;font:12px system-ui,sans-serif}.instance{margin-top:20px;padding:18px;border:1px solid #ddd7e4;border-radius:14px;break-inside:avoid}.instance h3{margin:0 0 12px;color:#bd571b;font-size:15px}.instance p{margin:9px 0;line-height:1.65;white-space:pre-wrap}.instance strong{display:block;margin-bottom:3px;color:#66637c;font:800 10px system-ui,sans-serif;letter-spacing:.08em}.instance small{color:#777;font:11px system-ui,sans-serif}@media(max-width:600px){.cover,.problem{padding:26px 20px}}@media print{@page{size:A4;margin:15mm}.toolbar{display:none!important}body{background:#fff}main{width:auto;margin:0}.cover,.problem{padding:0;box-shadow:none}.cover{break-after:page}}</style></head><body>
  <div class="toolbar"><p>${problems.length} 種文法問題 · ${escapePrintHtml(generatedAt)}</p><button type="button" id="print-grammar">列印／儲存為 PDF</button></div>
  <main><section class="cover"><h1>我的文法問題總覽</h1><p>包括所有文法問題種類及每次偵測實例。</p></section>${sections}</main></body></html>`;
}

async function exportGrammarProblems() {
  if (state.user?.role !== "student") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("瀏覽器已封鎖匯出視窗；請允許彈出式視窗後再試。", "error");
    return;
  }
  try { printWindow.opener = null; } catch { /* Read-only in some browsers. */ }
  printWindow.document.write("<!doctype html><meta charset=\"utf-8\"><body style=\"font-family:system-ui;padding:32px\">正在整理所有文法問題實例……</body>");
  printWindow.document.close();
  try {
    if (!state.grammarProblems.length) await openGrammarLog();
    const results = await mapWithConcurrency(
      state.grammarProblems,
      async problem => ({ ...problem, occurrences: await fetchAllGrammarOccurrencesForRule(problem.ruleId) }),
      3
    );
    const problems = results.filter(item => item.status === "fulfilled").map(item => item.value);
    if (!problems.length) throw new Error("尚未有可匯出的文法問題記錄。");
    printWindow.document.open();
    printWindow.document.write(grammarExportHtml(problems));
    printWindow.document.close();
    printWindow.document.querySelector("#print-grammar")?.addEventListener("click", () => printWindow.print());
    window.setTimeout(() => { try { printWindow.focus(); printWindow.print(); } catch { /* Visible button remains. */ } }, 350);
  } catch (error) {
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:32px"><h1>暫時未能匯出文法問題</h1><p>${escapePrintHtml(error.message || "請稍後再試。")}</p></body>`);
    printWindow.document.close();
  }
}

function filteredAdminSubmissions() {
  const query = String(elements.adminSearch.value || "").trim().toLocaleLowerCase();
  if (!query) return state.adminSubmissions;
  return state.adminSubmissions.filter((item) => (
    item.topic.toLocaleLowerCase().includes(query)
    || item.studentName.toLocaleLowerCase().includes(query)
  ));
}

function filteredAdminStudents() {
  const query = String(elements.adminSearch.value || "").trim().toLocaleLowerCase();
  const students = query
    ? state.adminStudents.filter(student => student.name.toLocaleLowerCase().includes(query))
    : [...state.adminStudents];
  const direction = state.adminStudentSort === "desc" ? -1 : 1;
  return students.sort((left, right) => direction * String(left.name || "").localeCompare(
    String(right.name || ""),
    ["zh-Hant", "en"],
    { sensitivity: "base", numeric: true }
  ));
}

function renderAdminStudents() {
  const students = filteredAdminStudents();
  elements.adminStudentCount.textContent = String(students.length);
  if (!students.length) {
    elements.adminStudentList.replaceChildren(emptyState("找不到符合名稱的學生帳戶。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const student of students) {
    const button = createElement("button", "admin-student-row");
    button.type = "button";
    button.dataset.adminStudentId = student.id;
    button.setAttribute("aria-current", String(student.id === state.selectedAdminStudentId));
    const copy = createElement("span");
    copy.append(
      createElement("strong", "", student.name),
      createElement("small", "", `${student.submissionCount} 篇文章 · ${student.grammarOccurrenceCount} 次文法問題`)
    );
    button.append(copy, createElement("em", "", "查看"));
    fragment.append(button);
  }
  elements.adminStudentList.replaceChildren(fragment);
}

function renderAdminSubmissions() {
  const submissions = filteredAdminSubmissions();
  elements.adminCount.textContent = String(submissions.length);
  if (!submissions.length) {
    elements.adminList.replaceChildren(emptyState("找不到符合條件的學生文章。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const submission of submissions) {
    const button = createElement(
      "button",
      `submission-row${submission.hasPublishedFeedback ? " has-feedback" : ""}`
    );
    button.type = "button";
    button.dataset.adminSubmissionId = submission.id;
    button.setAttribute("aria-current", String(state.selectedAdminSubmissionId === submission.id));
    button.append(
      createElement("strong", "", submission.topic),
      createElement("span", "", `${submission.studentName || "學生"} · ${formatSubmissionDate(submission.submittedAt)}${submission.deletedAt ? " · 學生已刪除" : ""}`)
    );
    fragment.append(button);
  }
  elements.adminList.replaceChildren(fragment);
}

async function openAdminSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  const requestedId = String(id);
  const requestGeneration = state.adminSubmissionRequestGeneration + 1;
  state.adminSubmissionRequestGeneration = requestGeneration;
  state.selectedAdminSubmissionId = requestedId;
  state.selectedAdminFeedback = null;
  state.adminFeedbackSuggestedFragments = [];
  renderAdminSubmissions();
  elements.adminDetail.replaceChildren(loadingState("正在載入學生文章…"));
  try {
    const payload = await apiJson(`/v1/admin/submissions/${encodeURIComponent(requestedId)}`);
    if (
      state.adminSubmissionRequestGeneration !== requestGeneration
      || state.selectedAdminSubmissionId !== requestedId
    ) return;
    const submission = normalizeSubmission(payload?.submission || payload);
    if (Array.isArray(payload?.grammarOccurrences)) submission.occurrenceCount = payload.grammarOccurrences.length;
    renderSubmissionDetail(submission, elements.adminDetail, true);
    await loadAdminFeedback(submission, elements.adminDetail, requestGeneration);
  } catch (error) {
    if (
      state.adminSubmissionRequestGeneration !== requestGeneration
      || state.selectedAdminSubmissionId !== requestedId
    ) return;
    elements.adminDetail.replaceChildren(emptyState(error.message || "未能載入學生文章。"));
  }
}

function renderAdminGrammarProblems() {
  const total = state.adminGrammarProblems.reduce((sum, problem) => sum + problem.count, 0);
  elements.adminGrammarCount.textContent = String(total);
  if (!state.selectedAdminStudentId) {
    elements.adminGrammarList.replaceChildren(emptyState("請先選擇學生帳戶。"));
    return;
  }
  if (!state.adminGrammarProblems.length) {
    elements.adminGrammarList.replaceChildren(emptyState("這位學生尚未有文法問題記錄。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  state.adminGrammarProblems.forEach((problem, index) => {
    const details = createElement("details", "admin-grammar-problem");
    details.dataset.adminGrammarProblemIndex = String(index);
    details.open = problem.open;
    const summary = createElement("summary");
    const copy = createElement("span");
    copy.append(
      createElement("strong", "", problem.title),
      createElement("small", "", `${problem.ruleId} · ${problem.count} 次`)
    );
    const remove = createElement("button", "admin-grammar-delete-category", "刪除整個分類");
    remove.type = "button";
    remove.dataset.adminDeleteGrammarCategory = String(index);
    summary.append(copy, remove);
    const occurrences = createElement("div", "admin-grammar-occurrences");
    occurrences.dataset.adminGrammarOccurrences = String(index);
    details.append(summary, occurrences);
    fragment.append(details);
  });
  elements.adminGrammarList.replaceChildren(fragment);
  state.adminGrammarProblems.forEach((problem, index) => {
    if (problem.open) renderAdminGrammarOccurrences(problem, index);
  });
}

function renderAdminGrammarOccurrences(problem, index) {
  const container = elements.adminGrammarList.querySelector(`[data-admin-grammar-occurrences="${index}"]`);
  if (!container) return;
  if (problem.occurrencesLoading && !problem.occurrences.length) {
    container.replaceChildren(loadingState("正在載入完整實例……"));
    return;
  }
  if (!problem.occurrences.length) {
    container.replaceChildren(emptyState("沒有可顯示的完整實例。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const occurrence of problem.occurrences) {
    const wrapper = createElement("article", "admin-grammar-occurrence");
    wrapper.append(createGrammarHistoryCard(occurrence, { admin: true }));
    const remove = createElement("button", "admin-grammar-delete-occurrence", "刪除這次偵測實例");
    remove.type = "button";
    remove.dataset.adminDeleteGrammarOccurrence = occurrence.id;
    remove.dataset.adminGrammarProblemIndex = String(index);
    wrapper.append(remove);
    fragment.append(wrapper);
  }
  if (problem.occurrenceHasMore) {
    const more = createElement("button", "secondary-button grammar-history-more", "顯示更多實例");
    more.type = "button";
    more.dataset.loadAdminGrammarProblem = String(index);
    fragment.append(more);
  }
  container.replaceChildren(fragment);
}

async function loadAdminGrammarProblemOccurrences(index, { reset = false } = {}) {
  const problem = state.adminGrammarProblems[index];
  if (!problem || problem.occurrencesLoading || !state.selectedAdminStudentId) return;
  problem.occurrencesLoading = true;
  if (reset) {
    problem.occurrences = [];
    problem.occurrencePage = 0;
    problem.occurrenceHasMore = false;
  }
  renderAdminGrammarOccurrences(problem, index);
  try {
    const page = problem.occurrencePage + 1;
    const query = new URLSearchParams({
      studentId: state.selectedAdminStudentId,
      ruleId: problem.ruleId,
      page: String(page),
      pageSize: "25"
    });
    const payload = await apiJson(`/v1/admin/grammar-problem-occurrences?${query}`);
    const next = Array.isArray(payload?.grammarOccurrences)
      ? payload.grammarOccurrences.map(normalizeGrammarOccurrence)
      : [];
    const known = new Set(problem.occurrences.map(item => item.id));
    problem.occurrences.push(...next.filter(item => item.id && !known.has(item.id)));
    problem.occurrencePage = page;
    problem.occurrenceHasMore = Boolean(payload?.hasMore);
    problem.occurrencesLoaded = true;
  } finally {
    problem.occurrencesLoading = false;
    renderAdminGrammarOccurrences(problem, index);
  }
}

async function selectAdminStudent(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  state.selectedAdminStudentId = String(id);
  state.selectedAdminSubmissionId = "";
  state.adminSubmissionRequestGeneration += 1;
  state.selectedAdminFeedback = null;
  state.adminFeedbackSuggestedFragments = [];
  renderAdminStudents();
  elements.adminList.replaceChildren(loadingState("正在載入學生文章……"));
  elements.adminGrammarList.replaceChildren(loadingState("正在載入文法問題……"));
  elements.adminDetail.replaceChildren(emptyState("請選擇一篇學生文章，或在文法問題中查看實例。"));
  const submissionPath = `/v1/admin/submissions?studentId=${encodeURIComponent(id)}`;
  const grammarPath = `/v1/admin/grammar-problems?studentId=${encodeURIComponent(id)}`;
  const [submissions, grammarPayload] = await Promise.all([
    fetchAllSubmissionPages(submissionPath, { maximumPages: 100 }),
    apiJson(grammarPath)
  ]);
  if (state.selectedAdminStudentId !== id) return;
  state.adminSubmissions = submissions;
  state.adminGrammarProblems = Array.isArray(grammarPayload?.grammarProblems)
    ? grammarPayload.grammarProblems.map(normalizeGrammarProblem)
    : [];
  renderAdminSubmissions();
  renderAdminGrammarProblems();
}

async function deleteAdminGrammarOccurrence(occurrenceId, index) {
  const problem = state.adminGrammarProblems[index];
  const occurrence = problem?.occurrences.find(item => item.id === occurrenceId);
  if (!problem || !occurrence || !state.selectedAdminStudentId) return;
  const student = state.adminStudents.find(item => item.id === state.selectedAdminStudentId);
  if (!window.confirm(`確定要刪除 ${student?.name || "這位學生"} 的這次「${problem.title}」偵測實例嗎？\n\n原句：${occurrence.sentenceText}\n\n刪除後不能復原。`)) return;
  await apiJson(`/v1/admin/grammar-occurrences/${encodeURIComponent(occurrenceId)}`, {
    method: "DELETE",
    body: JSON.stringify({ studentId: state.selectedAdminStudentId, confirmation: "DELETE" })
  });
  problem.occurrences = problem.occurrences.filter(item => item.id !== occurrenceId);
  problem.count = Math.max(0, problem.count - 1);
  if (!problem.count) state.adminGrammarProblems.splice(index, 1);
  renderAdminGrammarProblems();
  showToast("文法偵測實例已刪除。", "success");
}

async function deleteAdminGrammarCategory(index) {
  const problem = state.adminGrammarProblems[index];
  if (!problem || !state.selectedAdminStudentId) return;
  const student = state.adminStudents.find(item => item.id === state.selectedAdminStudentId);
  if (!window.confirm(`確定要刪除 ${student?.name || "這位學生"} 的整個「${problem.title}」分類及全部 ${problem.count} 次實例嗎？\n\n刪除後不能復原。`)) return;
  await apiJson("/v1/admin/grammar-problem-category", {
    method: "DELETE",
    body: JSON.stringify({
      studentId: state.selectedAdminStudentId,
      ruleId: problem.ruleId,
      confirmation: "DELETE"
    })
  });
  state.adminGrammarProblems.splice(index, 1);
  renderAdminGrammarProblems();
  showToast("整個文法問題分類已刪除。", "success");
}

async function openAdminDashboard() {
  showView("admin");
  elements.adminStudentList.replaceChildren(loadingState("正在載入學生帳戶……"));
  const payload = await apiJson("/v1/admin/students");
  state.adminStudents = Array.isArray(payload?.students)
    ? payload.students.map(student => ({
      id: String(student.id || ""),
      name: String(student.name || ""),
      submissionCount: Number(student.submissionCount || 0),
      grammarOccurrenceCount: Number(student.grammarOccurrenceCount || 0),
      grammarRuleCount: Number(student.grammarRuleCount || 0),
      lastSubmissionAt: student.lastSubmissionAt ? String(student.lastSubmissionAt) : ""
    })).filter(student => UUID_RE.test(student.id)).sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
    : [];
  renderAdminStudents();
  const selected = state.adminStudents.some(student => student.id === state.selectedAdminStudentId)
    ? state.selectedAdminStudentId
    : state.adminStudents[0]?.id;
  if (selected) await selectAdminStudent(selected);
  else {
    elements.adminList.replaceChildren(emptyState("尚未有學生帳戶。"));
    elements.adminGrammarList.replaceChildren(emptyState("尚未有學生帳戶。"));
  }
}

async function openAdminGrammarSourceSubmission(id) {
  if (!UUID_RE.test(String(id || ""))) return;
  if (!state.adminSubmissions.length) {
    await openAdminDashboard();
  } else {
    showView("admin");
    renderAdminSubmissions();
  }
  await openAdminSubmission(id);
}

function renderAdminExplanationReviews() {
  elements.adminReviewCount.textContent = state.adminExplanationReviewHasMore
    ? `${state.adminExplanationReviews.length}+`
    : String(state.adminExplanationReviews.length);
  elements.adminReviewMore.hidden = !state.adminExplanationReviewHasMore;
  if (!state.adminExplanationReviews.length) {
    elements.adminReviewList.replaceChildren(emptyState("目前沒有使用通用說明、需要補充專屬解釋的記錄。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const occurrence of state.adminExplanationReviews) {
    fragment.append(createGrammarHistoryCard(occurrence, { admin: true }));
  }
  elements.adminReviewList.replaceChildren(fragment);
}

async function loadAdminExplanationReviews({ reset = false } = {}) {
  if (reset) {
    state.adminExplanationReviews = [];
    state.adminExplanationReviewPage = 0;
    state.adminExplanationReviewHasMore = false;
  }
  const page = state.adminExplanationReviewPage + 1;
  elements.adminReviewMore.disabled = true;
  if (!state.adminExplanationReviews.length) {
    elements.adminReviewList.replaceChildren(loadingState("正在整理待補解釋的實際句子…"));
  }
  try {
    const payload = await apiJson(`/v1/admin/explanation-review?page=${page}&pageSize=50`);
    const source = Array.isArray(payload) ? payload : payload?.grammarOccurrences;
    const next = Array.isArray(source) ? source.map(normalizeGrammarOccurrence) : [];
    const known = new Set(state.adminExplanationReviews.map(item => item.id));
    state.adminExplanationReviews.push(...next.filter(item => item.id && !known.has(item.id)));
    state.adminExplanationReviewPage = page;
    state.adminExplanationReviewHasMore = Boolean(payload?.hasMore);
    renderAdminExplanationReviews();
  } finally {
    elements.adminReviewMore.disabled = false;
  }
}

async function openAdminExplanationReview() {
  showView("admin-review");
  await loadAdminExplanationReviews({ reset: true });
}

async function handleLogin(event) {
  event.preventDefault();
  const username = elements.username.value.trim();
  const password = elements.password.value;
  if (!username || !password) {
    setStatus(elements.loginStatus, "請輸入用戶名稱及密碼。", "error");
    return;
  }
  elements.loginButton.disabled = true;
  setStatus(elements.loginStatus, "正在核對帳戶…");
  try {
    const isAdmin = username.toLocaleLowerCase() === String(CONFIG.adminUsername || "").toLocaleLowerCase();
    const result = isAdmin ? await adminLogin(username, password) : await studentLogin(username, password);
    if (!result) throw new Error("用戶名稱或密碼不正確。");
    state.authToken = result.token;
    state.user = result.user;
    state.studentAccess = !isAdmin ? result.access : Object.create(null);
    state.studentAccessReady = !isAdmin;
    if (!isAdmin) {
      window.EdmundSystemNav?.rememberStudentSession({
        token: result.token,
        id: result.user.id,
        name: result.user.name,
        role: "student",
        access: result.access
      });
    }
    saveSession();
    elements.loginForm.reset();
    setStatus(elements.loginStatus, "");
    setConnection("已安全連接", "online");
    if (isAdmin) {
      await openAdminDashboard();
      showToast("管理員登入成功。", "success");
    } else {
      await loadWritingPreferences();
      elements.workspaceWelcome.textContent = `您好，${state.user.name}！先輸入寫作題目，再專心完成文章。`;
      const openedEntryLink = await openStudentEntryLink();
      if (!openedEntryLink) {
        await restoreDraft();
        showView("workspace");
      }
      if (state.grammarDetectionEnabled) prepareGrammarChecker();
      if (!openedEntryLink) showToast(`您好，${state.user.name}！`, "success");
    }
  } catch (error) {
    console.warn("Writing Submission login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  const role = state.user?.role;
  persistDraft();
  try { await flushGrammarOccurrences(); } catch { /* Retry is unnecessary after explicit logout. */ }
  if (role === "student") window.EdmundSystemNav?.forgetStudentSession();
  try {
    if (role === "admin" && state.authToken) await apiJson("/v1/admin/logout", { method: "POST" });
  } catch (error) {
    console.warn("Writing Submission logout cleanup failed", error);
  }
  clearSession();
  try { await state.supabase?.auth.signOut(); } catch { /* Ignore anonymous auth cleanup failures. */ }
  setStatus(elements.loginStatus, "");
  setConnection("已連線", "online");
  showView("login");
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.passwordToggle.addEventListener("click", () => {
    const showing = elements.password.type === "text";
    elements.password.type = showing ? "password" : "text";
    elements.passwordToggle.textContent = showing ? "顯示" : "隱藏";
    elements.passwordToggle.setAttribute("aria-label", showing ? "顯示密碼" : "隱藏密碼");
    elements.passwordToggle.setAttribute("aria-pressed", String(!showing));
  });
  elements.logout.addEventListener("click", logout);
  elements.workspaceButton.addEventListener("click", () => showView("workspace"));
  elements.submissionsButton.addEventListener("click", () => openSubmissions().catch(handleViewError));
  elements.grammarLogButton.addEventListener("click", () => openGrammarLog().catch(handleViewError));
  elements.feedbackBookmarksButton.addEventListener("click", () => openFeedbackBookmarks().catch(handleViewError));
  elements.adminButton.addEventListener("click", () => openAdminDashboard().catch(handleViewError));
  elements.adminReviewButton.addEventListener("click", () => openAdminExplanationReview().catch(handleViewError));
  elements.newWriting.addEventListener("click", () => startNewDraft());
  elements.refreshSubmissions.addEventListener("click", () => loadSubmissions().catch(handleViewError));
  elements.refreshDrafts.addEventListener("click", () => loadDrafts().catch(handleViewError));
  elements.refreshWritingProgress.addEventListener("click", () => loadWritingProgress().catch(handleViewError));
  elements.refreshGrammarLog.addEventListener("click", () => openGrammarLog().catch(handleViewError));
  elements.refreshFeedbackBookmarks.addEventListener("click", () => loadFeedbackBookmarks().catch(handleViewError));
  elements.exportGrammarLog.addEventListener("click", () => exportGrammarProblems().catch(handleViewError));
  elements.refreshAdminReview.addEventListener("click", () => openAdminExplanationReview().catch(handleViewError));
  elements.adminReviewMore.addEventListener("click", () => loadAdminExplanationReviews().catch(handleViewError));
  elements.writingForm.addEventListener("submit", submitWriting);
  elements.writingTimerToggle.addEventListener("click", () => openWritingTimerPanel());
  elements.writingTimerStart.addEventListener("click", handleWritingTimerStart);
  elements.writingTimerPause.addEventListener("click", handleWritingTimerPause);
  elements.writingTimerReset.addEventListener("click", handleWritingTimerReset);
  elements.writingTimerRetry.addEventListener("click", () => attemptTimerForceSubmission({ retry: true }));
  elements.writingTimerForce.addEventListener("change", handleWritingTimerForceChange);
  elements.writingStopwatchStart.addEventListener("click", handleWritingStopwatchStart);
  elements.writingStopwatchPause.addEventListener("click", handleWritingStopwatchPause);
  elements.writingStopwatchReset.addEventListener("click", handleWritingStopwatchReset);
  elements.saveProgress.addEventListener("click", () => saveCurrentProgress());
  document.addEventListener("edmund:idle-break-start", pauseWritingTimersForIdleBreak);
  document.addEventListener("edmund:idle-break-resume", resumeWritingTimersAfterIdleBreak);
  document.addEventListener("edmund:idle-break-logout", keepWritingTimersPausedForIdleLogout);
  elements.exportSelectAll.addEventListener("change", () => {
    state.selectedExportSubmissionIds.clear();
    if (elements.exportSelectAll.checked) {
      for (const submission of state.submissions) state.selectedExportSubmissionIds.add(submission.id);
    }
    renderSubmissionList();
  });
  elements.exportSelectedSubmissions.addEventListener("click", () => {
    const ids = state.submissions
      .map(submission => submission.id)
      .filter(id => state.selectedExportSubmissionIds.has(id));
    exportStudentSubmissions(ids);
  });
  elements.exportAllSubmissions.addEventListener("click", () => {
    exportStudentSubmissions(state.submissions.map(submission => submission.id));
  });
  elements.submissionList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-export-submission-id]");
    if (!checkbox) return;
    const id = String(checkbox.dataset.exportSubmissionId || "");
    if (!UUID_RE.test(id)) return;
    if (checkbox.checked) state.selectedExportSubmissionIds.add(id);
    else state.selectedExportSubmissionIds.delete(id);
    syncSubmissionExportControls();
  });
  elements.topicInput.addEventListener("input", () => {
    markWritingActivity();
    updateEditorMetrics();
    scheduleDraftSave();
  });
  elements.randomTopicOpen?.addEventListener("click", () => openRandomWritingTopicPicker());
  elements.randomTopicClose?.addEventListener("click", closeRandomWritingTopicPicker);
  elements.randomTopicDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeRandomWritingTopicPicker();
  });
  elements.randomTopicDialog?.addEventListener("click", (event) => {
    if (event.target === elements.randomTopicDialog) closeRandomWritingTopicPicker();
  });
  elements.topicPickerOpen.addEventListener("click", () => openWritingTopicPicker());
  elements.topicPickerClose.addEventListener("click", closeWritingTopicPicker);
  elements.topicPickerSearch.addEventListener("input", () => renderWritingTopicResults(elements.topicPickerSearch.value));
  elements.topicPicker.addEventListener("click", (event) => {
    if (event.target === elements.topicPicker) closeWritingTopicPicker();
  });
  elements.grammarToggle.addEventListener("change", () => handleGrammarDetectionToggle());
  elements.writingInput.addEventListener("input", handleWritingInput);
  elements.writingInput.addEventListener("focus", markWritingActivity);
  elements.topicInput.addEventListener("focus", markWritingActivity);
  elements.adminSearch.addEventListener("input", () => {
    renderAdminStudents();
    renderAdminSubmissions();
  });
  elements.adminNameSort.addEventListener("click", () => {
    state.adminStudentSort = state.adminStudentSort === "asc" ? "desc" : "asc";
    const ascending = state.adminStudentSort === "asc";
    elements.adminNameSort.textContent = ascending ? "姓名 A → Z" : "姓名 Z → A";
    elements.adminNameSort.setAttribute(
      "aria-label",
      `學生姓名目前由 ${ascending ? "A 至 Z" : "Z 至 A"} 排列`
    );
    renderAdminStudents();
  });
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return;
    const editor = selection.anchorNode?.parentElement?.closest?.("[data-feedback-rich-editor]")
      || (selection.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode.closest?.("[data-feedback-rich-editor]")
        : null);
    if (!editor || !editor.contains(selection.focusNode)) return;
    state.activeFeedbackRichEditor = editor;
    state.feedbackSelectionRange = selection.getRangeAt(0).cloneRange();
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.("[data-feedback-format]")) event.preventDefault();
  });
  document.addEventListener("toggle", (event) => {
    const feedbackModelReference = event.target.closest?.("[data-feedback-model-reference]");
    if (feedbackModelReference?.open) {
      loadFeedbackModelEssayDetails(feedbackModelReference).catch((error) => {
        console.warn("Writing feedback model essay toggle failed", error);
      });
      return;
    }
    const topicReference = event.target.closest?.("[data-topic-reference-kind]");
    if (topicReference?.open) {
      loadTopicReferenceDetails(topicReference).catch((error) => {
        console.warn("Writing topic reference toggle failed", error);
      });
    }
    const details = event.target.closest?.("[data-grammar-problem-index]");
    if (details) {
      const index = Number(details.dataset.grammarProblemIndex);
      const problem = state.grammarProblems[index];
      if (problem) {
        problem.open = details.open;
        if (details.open && !problem.occurrencesLoaded) {
          loadGrammarProblemOccurrences(index, { reset: true }).catch(handleViewError);
        }
      }
    }
    const adminDetails = event.target.closest?.("[data-admin-grammar-problem-index]");
    if (!adminDetails) return;
    const adminIndex = Number(adminDetails.dataset.adminGrammarProblemIndex);
    const adminProblem = state.adminGrammarProblems[adminIndex];
    if (!adminProblem) return;
    adminProblem.open = adminDetails.open;
    if (adminDetails.open && !adminProblem.occurrencesLoaded) {
      loadAdminGrammarProblemOccurrences(adminIndex, { reset: true }).catch(handleViewError);
    }
  }, true);
  document.addEventListener("click", (event) => {
    const smallerFeedbackFont = event.target.closest("[data-feedback-font-smaller]");
    if (smallerFeedbackFont) {
      changeFeedbackFontScale(-1);
      return;
    }
    const largerFeedbackFont = event.target.closest("[data-feedback-font-larger]");
    if (largerFeedbackFont) {
      changeFeedbackFontScale(1);
      return;
    }
    const feedbackFormat = event.target.closest("[data-feedback-format]");
    if (feedbackFormat) {
      applyFeedbackFormatting(feedbackFormat.dataset.feedbackFormat);
      return;
    }
    const transcriptionSave = event.target.closest("[data-transcription-save]");
    if (transcriptionSave) {
      return saveStudentTranscriptions(transcriptionSave.dataset.transcriptionSave).catch(handleViewError);
    }
    const suggestionCopySave = event.target.closest("[data-suggestion-copy-save]");
    if (suggestionCopySave) {
      return saveSuggestionCopy(suggestionCopySave.dataset.suggestionCopySave).catch(handleViewError);
    }
    const bookmarkToggle = event.target.closest("[data-feedback-bookmark-fragment]");
    if (bookmarkToggle) {
      const bookmarked = bookmarkToggle.getAttribute("aria-pressed") === "true";
      return setFeedbackBookmark(bookmarkToggle.dataset.feedbackBookmarkFragment, !bookmarked).catch(handleViewError);
    }
    const bookmarkRemove = event.target.closest("[data-feedback-bookmark-remove]");
    if (bookmarkRemove) {
      return setFeedbackBookmark(bookmarkRemove.dataset.feedbackBookmarkRemove, false).catch(handleViewError);
    }
    const bookmarkOpen = event.target.closest("[data-feedback-bookmark-open]");
    if (bookmarkOpen) {
      return openSubmissions({ selectId: bookmarkOpen.dataset.feedbackBookmarkOpen }).catch(handleViewError);
    }
    const feedbackReferenceRetry = event.target.closest("[data-feedback-reference-retry]");
    if (feedbackReferenceRetry) {
      const details = feedbackReferenceRetry.closest("[data-feedback-model-reference]");
      if (details) loadFeedbackModelEssayDetails(details, { retry: true }).catch(handleViewError);
      return;
    }
    const addFeedbackRows = event.target.closest("[data-feedback-add-ten]");
    if (addFeedbackRows) {
      const list = addFeedbackRows.closest("[data-feedback-editor]")?.querySelector("[data-feedback-pairs]");
      if (list) {
        const before = list.querySelectorAll("[data-feedback-pair]").length;
        appendFeedbackEditorRows(list, 10, [], state.adminFeedbackSuggestedFragments);
        if (before >= 200) showToast("每份評語最多可建立 200 組。", "error");
      }
      return;
    }
    const addLearningRows = event.target.closest("[data-feedback-learning-add-ten]");
    if (addLearningRows) {
      const kind = addLearningRows.dataset.feedbackLearningAddTen;
      const list = addLearningRows.closest("[data-feedback-learning-editor]")
        ?.querySelector(`[data-feedback-learning-list="${kind}"]`);
      if (list) appendFeedbackLearningRows(list, kind, 10);
      return;
    }
    const removeLearningRow = event.target.closest("[data-feedback-learning-remove]");
    if (removeLearningRow) {
      const row = removeLearningRow.closest("[data-feedback-learning-row]");
      const list = row?.closest("[data-feedback-learning-list]");
      const kind = row?.dataset.feedbackLearningRow;
      row?.remove();
      if (list && kind) {
        const count = list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).length;
        if (count < 10) appendFeedbackLearningRows(list, kind, 10 - count);
        else renumberFeedbackLearningRows(list, kind);
      }
      return;
    }
    const insertFeedbackPair = event.target.closest("[data-feedback-insert-after]");
    if (insertFeedbackPair) {
      const pair = insertFeedbackPair.closest("[data-feedback-pair]");
      const list = pair?.closest("[data-feedback-pairs]");
      if (!pair || !list) return;
      if (list.querySelectorAll("[data-feedback-pair]").length >= 200) {
        showToast("每份評語最多可建立 200 組。", "error");
        return;
      }
      const inserted = createFeedbackEditorRow({ index: 0 });
      pair.after(inserted);
      renumberFeedbackEditorRows(list);
      inserted.querySelector('[data-feedback-rich-editor="original"]')?.focus();
      return;
    }
    const removeFeedbackPair = event.target.closest("[data-feedback-remove-pair]");
    if (removeFeedbackPair) {
      const pair = removeFeedbackPair.closest("[data-feedback-pair]");
      const list = pair?.closest("[data-feedback-pairs]");
      pair?.remove();
      if (list) renumberFeedbackEditorRows(list);
      return;
    }
    const saveFeedback = event.target.closest("[data-feedback-save]");
    if (saveFeedback) return saveAdminFeedback(saveFeedback.dataset.feedbackSave).catch(handleViewError);
    if (event.target.closest("[data-feedback-delete]")) return deleteAdminFeedback().catch(handleViewError);
    const copyNotice = event.target.closest("[data-copy-submission-notice]");
    if (copyNotice) return copySubmissionNotification(copyNotice.dataset.copySubmissionNotice).catch(handleViewError);
    const topicReferenceRetry = event.target.closest("[data-topic-reference-retry]");
    if (topicReferenceRetry) {
      const details = topicReferenceRetry.closest("[data-topic-reference-kind]");
      if (details) loadTopicReferenceDetails(details, { retry: true }).catch(handleViewError);
      return;
    }
    const apply = event.target.closest("[data-apply-issue]");
    if (apply) return applyGrammarIssue(apply.dataset.applyIssue);
    const dismiss = event.target.closest("[data-dismiss-issue]");
    if (dismiss) return dismissGrammarIssue(dismiss.dataset.dismissIssue);
    const submission = event.target.closest("[data-submission-id]");
    if (submission) return openSubmission(submission.dataset.submissionId);
    const deleteSubmission = event.target.closest("[data-delete-submission]");
    if (deleteSubmission) return deleteStudentSubmission(deleteSubmission.dataset.deleteSubmission);
    const exportSubmission = event.target.closest("[data-export-submission]");
    if (exportSubmission) return exportStudentSubmissions([exportSubmission.dataset.exportSubmission]);
    const writingTopic = event.target.closest("[data-select-writing-topic]");
    if (writingTopic) return selectWritingTopic(writingTopic.dataset.selectWritingTopic);
    const randomTopic = event.target.closest("[data-random-topic-category]");
    if (randomTopic) return assignRandomWritingTopic(randomTopic.dataset.randomTopicCategory).catch(handleViewError);
    if (event.target.closest("[data-remove-topic-preview]")) {
      state.selectedTopicResource = null;
      renderSelectedTopicPreview();
      scheduleDraftSave();
      return;
    }
    const resumeDraft = event.target.closest("[data-resume-draft]");
    if (resumeDraft) return resumeServerDraft(resumeDraft.dataset.resumeDraft).catch(handleViewError);
    const deleteDraft = event.target.closest("[data-delete-draft]");
    if (deleteDraft) return deleteServerDraft(deleteDraft.dataset.deleteDraft).catch(handleViewError);
    const adminStudent = event.target.closest("[data-admin-student-id]");
    if (adminStudent) return selectAdminStudent(adminStudent.dataset.adminStudentId).catch(handleViewError);
    const adminSubmission = event.target.closest("[data-admin-submission-id]");
    if (adminSubmission) return openAdminSubmission(adminSubmission.dataset.adminSubmissionId);
    const moreGrammar = event.target.closest("[data-load-grammar-problem]");
    if (moreGrammar) {
      return loadGrammarProblemOccurrences(Number(moreGrammar.dataset.loadGrammarProblem)).catch(handleViewError);
    }
    const grammarSource = event.target.closest("[data-grammar-source-submission]");
    if (grammarSource) {
      return openGrammarSourceSubmission(grammarSource.dataset.grammarSourceSubmission).catch(handleViewError);
    }
    const adminGrammarSource = event.target.closest("[data-admin-grammar-source-submission]");
    if (adminGrammarSource) {
      return openAdminGrammarSourceSubmission(adminGrammarSource.dataset.adminGrammarSourceSubmission).catch(handleViewError);
    }
    const loadAdminGrammar = event.target.closest("[data-load-admin-grammar-problem]");
    if (loadAdminGrammar) {
      return loadAdminGrammarProblemOccurrences(Number(loadAdminGrammar.dataset.loadAdminGrammarProblem)).catch(handleViewError);
    }
    const deleteAdminOccurrence = event.target.closest("[data-admin-delete-grammar-occurrence]");
    if (deleteAdminOccurrence) {
      return deleteAdminGrammarOccurrence(
        deleteAdminOccurrence.dataset.adminDeleteGrammarOccurrence,
        Number(deleteAdminOccurrence.dataset.adminGrammarProblemIndex)
      ).catch(handleViewError);
    }
    const deleteAdminCategory = event.target.closest("[data-admin-delete-grammar-category]");
    if (deleteAdminCategory) {
      event.preventDefault();
      event.stopPropagation();
      return deleteAdminGrammarCategory(Number(deleteAdminCategory.dataset.adminDeleteGrammarCategory)).catch(handleViewError);
    }
  });
  document.addEventListener("change", (event) => {
    const feedbackScale = event.target.closest("[data-feedback-font-scale]");
    if (feedbackScale) {
      const value = normalizeFeedbackFontScale(feedbackScale.value);
      state.feedbackFontScale = value;
      applyFeedbackFontScale({ persist: true });
      return;
    }
    const vocabularyScale = event.target.closest("[data-topic-reference-vocabulary-scale]");
    if (vocabularyScale) {
      const value = Number(vocabularyScale.value);
      if (!VOCABULARY_TEXT_SCALE_VALUES.includes(value)) return;
      const content = vocabularyScale.closest("[data-topic-reference-content]");
      content?.style.setProperty("--vocabulary-text-scale", String(value));
      return;
    }
    const translationToggle = event.target.closest("[data-topic-reference-translation-toggle]");
    if (translationToggle) {
      const content = translationToggle.closest("[data-topic-reference-content]");
      content?.querySelectorAll("[data-topic-reference-chinese]").forEach((paragraph) => {
        paragraph.hidden = !translationToggle.checked;
      });
      return;
    }
    const zoom = event.target.closest("[data-topic-image-zoom]");
    if (!zoom) return;
    const value = Number(zoom.value);
    if (![0.5, 1, 2, 3, 4, 5, 7].includes(value)) return;
    state.writingImageZoom = value;
    renderSelectedTopicPreview();
    scheduleDraftSave();
  });
  document.addEventListener("input", (event) => {
    const feedbackTextarea = event.target.closest("[data-feedback-editor] textarea");
    if (feedbackTextarea) autosizeTextarea(feedbackTextarea, feedbackTextarea.hasAttribute("data-feedback-comment") ? 130 : 72);
  });
  window.addEventListener("pagehide", () => {
    accrueWritingTime();
    persistDraft();
    if (state.pendingOccurrences.size) {
      flushGrammarOccurrences({ keepalive: true }).catch(() => {});
    }
  });
  document.addEventListener("visibilitychange", () => {
    accrueWritingTime();
    state.writingClockLastAt = Date.now();
    if (document.visibilityState === "visible") {
      tickWritingTimer();
      syncWritingStopwatchUi();
      syncWritingProofreadingUi();
    }
    if (document.visibilityState === "visible" && state.currentView === "workspace") markWritingActivity();
  });
  window.addEventListener("online", () => {
    if (state.writingTimer.status === "expired" && state.writingTimer.forceSubmit && state.writingTimer.autoSubmitError) {
      attemptTimerForceSubmission({ retry: true });
    }
  });
}

function handleViewError(error) {
  console.warn("Writing Submission view failed", error);
  showToast(error.message || "暫時未能載入資料。", "error");
}

async function checkHealth() {
  try {
    const response = await fetch(`${workerBaseUrl()}/v1/health`, { credentials: "omit" });
    if (!response.ok) throw new Error("Health unavailable");
    setConnection("已連線", "online");
  } catch {
    setConnection("服務連接中", "checking");
  }
}

async function initialise() {
  bindEvents();
  initializeFeedbackStickyOffset();
  startWritingClock();
  startWritingTimerClock();
  startWritingProofreadingClock();
  setWritingTimerInputs(40 * 60);
  syncWritingTimerUi();
  syncWritingStopwatchUi();
  syncSubmissionExportControls();
  syncGrammarDetectionControls();
  updateEditorMetrics();
  renderGrammarIssues();
  checkHealth();
  const restored = await validateRestoredSession();
  if (!restored) {
    showView("login");
    return;
  }
  setConnection("已安全連接", "online");
  if (state.user.role === "admin") {
    await openAdminDashboard();
  } else {
    await loadWritingPreferences();
    elements.workspaceWelcome.textContent = `您好，${state.user.name}！先輸入寫作題目，再專心完成文章。`;
    const openedEntryLink = await openStudentEntryLink();
    if (!openedEntryLink) {
      await restoreDraft();
      showView("workspace");
    }
    if (state.grammarDetectionEnabled) prepareGrammarChecker();
  }
}

initialise().catch((error) => {
  console.error("Writing Submission initialisation failed", error);
  clearSession();
  setConnection("服務暫時離線", "error");
  setStatus(elements.loginStatus, "系統未能完成載入，請重新整理頁面。", "error");
  showView("login");
});
