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
} from "./writing-submission-core.js?v=20260820-manual-topics1";
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
  feedbackFormattingCommandFromEvent,
  normalizeFeedbackEnhancementParts,
  normalizeGrammarFeedbackPoints,
  normalizeSentenceStructureDeepLink,
  normalizeSentenceStructureMethods,
  parseNumberedFeedbackBlocks,
  sliceFeedbackFormattingRuns
} from "./writing-submission-feedback-tools.mjs?v=20260816-feedback-structure1";
import { filterHomeworkResources } from "./schedule-homework-links.mjs?v=20260814-2";
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
const TOPIC_CATALOG_VERSION = "20260818-hkfsd-ir3";
const TOPIC_REFERENCE_VERSION = "20260818-hkfsd-ir3";
const MAX_FEEDBACK_SENTENCE_LINKS = 100;
const MAX_FEEDBACK_BODY_BYTES = 512 * 1024;
const FEEDBACK_ENHANCEMENT_KINDS = Object.freeze({
  sentence: Object.freeze({
    sectionKey: "sentence-structure",
    dataKey: "sentenceStructureParts",
    singular: "句子結構",
    title: "句子結構提升區",
    copyTitle: "句子結構提升 - 抄寫",
    className: "is-sentence-structure"
  }),
  rhetorical: Object.freeze({
    sectionKey: "rhetorical-technique",
    dataKey: "rhetoricalParts",
    singular: "修辭技巧",
    title: "修辭技巧提升區",
    copyTitle: "修辭技巧提升 - 抄寫",
    className: "is-rhetorical"
  }),
  phrasal: Object.freeze({
    sectionKey: "phrasal-verb",
    dataKey: "phrasalVerbParts",
    singular: "動詞片語",
    title: "動詞片語 (Phrasal Verb) 提升區",
    copyTitle: "動詞片語 (Phrasal Verb) 提升 - 抄寫",
    className: "is-phrasal-verb"
  }),
  writingExpression: Object.freeze({
    sectionKey: "writing-common-expression",
    dataKey: "writingCommonExpressionParts",
    singular: "Writing - Common Expression",
    title: "Writing - Common Expression 提升區",
    copyTitle: "Writing - Common Expression 提升 - 抄寫",
    className: "is-writing-common-expression"
  }),
  rhetoricalExpression: Object.freeze({
    sectionKey: "rhetorical-common-expression",
    dataKey: "rhetoricalCommonExpressionParts",
    singular: "修辭 Common Expression",
    title: "修辭 Common Expression 提升區",
    copyTitle: "修辭 Common Expression 提升 - 抄寫",
    className: "is-rhetorical-common-expression"
  })
});
const FEEDBACK_ENHANCEMENT_BY_SECTION_KEY = Object.freeze(Object.fromEntries(
  Object.entries(FEEDBACK_ENHANCEMENT_KINDS)
    .map(([kind, value]) => [value.sectionKey, Object.freeze({ ...value, kind })])
));
const WRITING_PROOFREADING_SECONDS = 5 * 60;
const DIRECT_PASTE_WORD_THRESHOLD = 50;
const HARPER_VERSION = "2.7.0";
const ESL_RULESET_VERSION = "2.0.0";
const VOCABULARY_TEXT_SCALE_VALUES = Object.freeze([0.5, 1, 2, 3, 4, 5, 7]);
const FEEDBACK_FONT_SCALE_VALUES = Object.freeze([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]);
const FEEDBACK_FONT_SCALE_KEY = "edmund-writing-feedback-font-scale-v1";
const FEEDBACK_HIGHLIGHT_COLORS = Object.freeze({
  yellow: "#fff1a8",
  orange: "#ffd3a1",
  blue: "#cfe6ff",
  green: "#d5f2d5",
  red: "#ffc7c7"
});
const FEEDBACK_HIGHLIGHT_NAMES = Object.freeze(Object.keys(FEEDBACK_HIGHLIGHT_COLORS));
const SPELLING_AND_SPACING_HINTS = Object.freeze([
  { pattern: "recieve", suggestion: "receive" },
  { pattern: "seperate", suggestion: "separate" },
  { pattern: "occured", suggestion: "occurred" },
  { pattern: "calender", suggestion: "calendar" },
  { pattern: "writting", suggestion: "writing" },
  { pattern: "adress", suggestion: "address" },
  { pattern: "definately", suggestion: "definitely" },
  { pattern: "teh", suggestion: "the" },
  { pattern: "thier", suggestion: "their" },
  { pattern: "becuase", suggestion: "because" },
  { pattern: "throught", suggestion: "thought" },
  { pattern: "comming", suggestion: "coming" },
  { pattern: "alot", suggestion: "a lot" },
  { pattern: "happend", suggestion: "happened" },
  { pattern: "freind", suggestion: "friend" },
  { pattern: "managment", suggestion: "management" }
]);
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
  floatingTopic: document.querySelector("[data-floating-writing-topic]"),
  floatingTopicToggle: document.querySelector("[data-floating-writing-topic-toggle]"),
  floatingTopicPreview: document.querySelector("[data-floating-writing-topic-preview]"),
  floatingTopicContent: document.querySelector("[data-floating-writing-topic-content]"),
  floatingTopicText: document.querySelector("[data-floating-writing-topic-text]"),
  floatingTopicImages: document.querySelector("[data-floating-writing-topic-images]"),
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
  removeWritingTopic: document.querySelector("[data-remove-writing-topic]"),
  selectedTopicPreview: document.querySelector("[data-selected-topic-preview]"),
  topicReferenceArea: document.querySelector("[data-topic-reference-area]"),
  writingInput: document.querySelector("[data-writing-input]"),
  proofreadingLabel: document.querySelector("[data-proofreading-label]"),
  writingEditorStack: document.querySelector("[data-writing-editor-stack]"),
  writingEssayOverlay: document.querySelector("[data-model-essay-overlay]"),
  modelEssayToggle: document.querySelector("[data-model-essay-toggle]"),
  modelEssayToggleLabel: document.querySelector("[data-model-essay-toggle-label]"),
  modelEssayMiniPanel: document.querySelector("[data-model-essay-mini-panel]"),
  modelEssayMiniChips: document.querySelector("[data-model-essay-mini-chips]"),
  modelEssayParagraphDialogOpen: document.querySelector("[data-model-essay-paragraph-open]"),
  modelEssayDialog: document.querySelector("[data-model-essay-paragraph-dialog]"),
  modelEssayDialogClose: document.querySelector("[data-model-essay-paragraph-dialog-close]"),
  modelEssayDialogApply: document.querySelector("[data-model-essay-paragraph-apply]"),
  modelEssayParagraphList: document.querySelector("[data-model-essay-paragraph-list]"),
  modelEssaySelectAll: document.querySelector("[data-model-essay-select-all]"),
  modelEssayOpenCount: document.querySelector("[data-model-essay-open-count]"),
  proofreadStatus: document.querySelector("[data-writing-proofread-status]"),
  directPasteDialog: document.querySelector("[data-direct-paste-duration-dialog]"),
  directPasteDialogIntro: document.querySelector("[data-direct-paste-intro]"),
  directPasteDialogMinutes: document.querySelector("[data-direct-paste-minutes]"),
  directPasteDialogSeconds: document.querySelector("[data-direct-paste-seconds]"),
  directPasteDialogStatus: document.querySelector("[data-direct-paste-status]"),
  directPasteDialogConfirm: document.querySelector("[data-direct-paste-confirm]"),
  directPasteDialogCancel: document.querySelector("[data-direct-paste-cancel]"),
  proofreadWarningDialog: document.querySelector("[data-proofread-warning-dialog]"),
  proofreadWarningYes: document.querySelector("[data-proofread-warning-yes]"),
  proofreadWarningNo: document.querySelector("[data-proofread-warning-no]"),
  proofreadIssuesDialog: document.querySelector("[data-proofread-issues-dialog]"),
  proofreadIssuesClose: document.querySelector("[data-proofread-issues-close]"),
  proofreadIssuesSubmit: document.querySelector("[data-proofread-issues-submit]"),
  proofreadIssuesCorrect: document.querySelector("[data-proofread-issues-correct]"),
  proofreadIssuesTable: document.querySelector("[data-proofread-issues-table]"),
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
  adminManualTopicSlots: document.querySelector("[data-admin-manual-topic-slots]"),
  adminManualTopicCreate: document.querySelector("[data-admin-manual-topic-create]"),
  adminManualTopicStatus: document.querySelector("[data-admin-manual-topic-status]"),
  adminManualTopicCount: document.querySelector("[data-admin-manual-topic-count]"),
  adminManualTopicList: document.querySelector("[data-admin-manual-topic-list]"),
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
  writingAreaFocused: false,
  writingClockTimer: null,
  selectedTopicResource: null,
  modelEssayReference: null,
  modelEssayParagraphs: [],
  modelEssayParagraphSelection: [],
  modelEssayOverlayVisible: false,
  modelEssayRouteKey: "",
  modelEssayRouteLoad: 0,
  directPaste: false,
  directPasteWordCount: 0,
  proofreadStartedAt: 0,
  proofreadIssueSignature: "",
  directPastePromptResolver: null,
  proofreadWarningResolver: null,
  proofreadDetailsResolver: null,
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
  homeworkResourceCatalog: null,
  homeworkResourceCatalogPromise: null,
  randomTopicGeneration: 0,
  topicReferenceCatalog: null,
  topicReferencePromise: null,
  topicReferenceImportAttempt: 0,
  floatingTopicSignature: "",
  floatingTopicFrame: 0,
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
  adminManualTopics: [],
  adminManualTopicsBusy: false,
  selectedAdminSubmissionId: "",
  adminSubmissionRequestGeneration: 0,
  selectedAdminFeedback: null,
  adminFeedbackSuggestedFragments: [],
  feedbackFontScale: 1,
  feedbackFontScaleInitialized: false,
  activeFeedbackRichEditor: null,
  feedbackSelectionRanges: [],
  feedbackSelectionOverlays: [],
  feedbackSelectionOverlayFrame: 0,
  feedbackMultiSelectPending: null,
  feedbackApplyingFormat: false,
  feedbackDraggedSentenceLink: null,
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
    scheduleFloatingWritingTopicSync();
  };
  sync();
  window.addEventListener("resize", sync, { passive: true });
  if (typeof ResizeObserver === "function") new ResizeObserver(sync).observe(header);
}

function floatingWritingTopicImages() {
  const resource = canonicalWritingTopicResource(state.selectedTopicResource);
  return Array.isArray(resource?.questionImages) ? resource.questionImages : [];
}

function syncFloatingWritingTopicContent() {
  if (!elements.floatingTopic) return;
  const topic = String(elements.topicInput?.value || "").trim();
  const images = floatingWritingTopicImages();
  const signature = JSON.stringify([topic, ...images.map(image => [image.src, image.alt])]);
  if (state.floatingTopicSignature === signature) return;
  state.floatingTopicSignature = signature;
  elements.floatingTopicPreview.textContent = topic.replace(/\s+/gu, " ");
  elements.floatingTopicText.textContent = topic;
  elements.floatingTopicImages.replaceChildren();
  for (const image of images) {
    const viewport = createElement("div", "floating-writing-topic-image-viewport");
    const node = document.createElement("img");
    node.src = image.src;
    node.alt = image.alt;
    node.loading = "lazy";
    node.decoding = "async";
    viewport.append(node);
    elements.floatingTopicImages.append(viewport);
  }
  elements.floatingTopicImages.hidden = images.length === 0;
}

function setFloatingWritingTopicExpanded(expanded) {
  if (!elements.floatingTopic || !elements.floatingTopicContent || !elements.floatingTopicToggle) return;
  const next = Boolean(expanded && !elements.floatingTopic.hidden);
  elements.floatingTopic.dataset.expanded = String(next);
  elements.floatingTopicToggle.setAttribute("aria-expanded", String(next));
  elements.floatingTopicToggle.setAttribute(
    "aria-label",
    next ? "收合浮動寫作題目" : "展開完整寫作題目"
  );
  elements.floatingTopicContent.hidden = !next;
}

function syncFloatingWritingTopicVisibility() {
  state.floatingTopicFrame = 0;
  if (!elements.floatingTopic || !elements.topicInput || !elements.writingForm) return;
  syncFloatingWritingTopicContent();
  const topic = elements.topicInput.value.trim();
  const header = document.querySelector(".edmund-system-header");
  const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0);
  const topicBottom = elements.topicInput.getBoundingClientRect().bottom;
  const formBottom = elements.writingForm.getBoundingClientRect().bottom;
  const visible = Boolean(
    state.currentView === "workspace"
    && state.user?.role !== "admin"
    && topic
    && topicBottom <= headerBottom + 8
    && formBottom > headerBottom + 62
  );
  elements.floatingTopic.hidden = !visible;
  if (!visible) setFloatingWritingTopicExpanded(false);
}

function scheduleFloatingWritingTopicSync() {
  if (state.floatingTopicFrame) return;
  state.floatingTopicFrame = window.requestAnimationFrame(syncFloatingWritingTopicVisibility);
}

function safeDialogOpen(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function safeDialogClose(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else dialog.removeAttribute("open");
}

function formatProofreadRemaining(secondsValue) {
  const numeric = Math.max(0, Math.round(Number(secondsValue || 0)));
  const minutes = Math.floor(numeric / 60);
  const seconds = numeric % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function proofreadRemainingSeconds(now = Date.now()) {
  if (!state.proofreadStartedAt) return WRITING_PROOFREADING_SECONDS;
  return Math.max(0, WRITING_PROOFREADING_SECONDS - Math.floor((now - state.proofreadStartedAt) / 1000));
}

function proofreadReady() {
  return state.proofreadStartedAt > 0 && proofreadRemainingSeconds() <= 0;
}

function resetProofreadState() {
  state.proofreadStartedAt = 0;
  state.proofreadIssueSignature = "";
}

function isProofreadingTextLikelyRequired() {
  return Boolean(elements.writingInput?.value.trim());
}

function modelEssayRouteKey(route = selectedTopicReferenceRoute()) {
  return route ? `${route.exerciseId}|${route.essayKey || "default"}` : "";
}

function normalizeModelEssayParagraphSelection(value, length = 0) {
  if (!Array.isArray(value)) return Array.from({ length }, () => true);
  const normalized = value.map(valueItem => valueItem === true || valueItem === "true");
  if (normalized.length !== length) return Array.from({ length }, () => true);
  return normalized.map(Boolean);
}

function selectedModelEssayParagraphs(reference = state.modelEssayReference, value = state.modelEssayParagraphSelection) {
  const paragraphs = Array.isArray(reference?.paragraphs)
    ? reference.paragraphs
    : state.modelEssayParagraphs;
  const selection = Array.isArray(value) && value.length === paragraphs.length ? value : Array.from({ length: paragraphs.length }, () => true);
  return paragraphs
    .map((paragraph, index) => ({ paragraph, index, selected: selection[index] !== false }))
    .filter(item => item.selected)
    .map(item => item.paragraph);
}

function modelEssayOverlayText() {
  const selected = selectedModelEssayParagraphs();
  return selected
    .map((paragraph) => String(paragraph?.english || ""))
    .filter(Boolean)
    .join("\n\n");
}

function syncModelEssayOpenCount() {
  if (!elements.modelEssayOpenCount) return;
  if (!state.modelEssayParagraphs.length) {
    elements.modelEssayOpenCount.textContent = "";
    return;
  }
  const total = state.modelEssayParagraphs.length;
  const selected = state.modelEssayParagraphSelection.filter(Boolean).length || 0;
  elements.modelEssayOpenCount.textContent = `(${selected}/${total})`;
}

function syncModelEssayOverlay() {
  const paragraphsAvailable = Boolean(state.modelEssayParagraphs.length);
  const hasSelection = state.modelEssayParagraphSelection.some(value => value);
  const overlayText = hasSelection ? modelEssayOverlayText() : "";
  if (elements.writingEssayOverlay) {
    const typedText = elements.writingInput?.value || "";
    const prefixText = typedText && !/\s$/u.test(typedText) ? `${typedText} ` : typedText;
    const prefix = createElement("span", "writing-essay-overlay-prefix", prefixText);
    const guide = createElement("span", "writing-essay-overlay-guide", overlayText);
    elements.writingEssayOverlay.replaceChildren(prefix, guide);
    elements.writingEssayOverlay.hidden = !state.modelEssayOverlayVisible || !overlayText;
  }
  if (elements.writingEditorStack) {
    elements.writingEditorStack.dataset.modelEssayVisible = String(
      state.modelEssayOverlayVisible && paragraphsAvailable && hasSelection
    );
  }
  const isOverlayActive = state.modelEssayOverlayVisible && paragraphsAvailable && hasSelection;
  if (elements.writingInput) {
    if (isOverlayActive) elements.writingInput.classList.add("writing-input-with-model-essay");
    else elements.writingInput.classList.remove("writing-input-with-model-essay");
  }
  syncModelEssayOpenCount();
  syncModelEssayOverlayScroll();
}

function renderModelEssayMiniPanel() {
  if (!elements.modelEssayMiniPanel || !elements.modelEssayMiniChips) return;
  const paragraphs = state.modelEssayParagraphs;
  const visible = state.modelEssayOverlayVisible && paragraphs.length > 0;
  elements.modelEssayMiniPanel.hidden = !visible;
  if (elements.modelEssayParagraphDialogOpen) elements.modelEssayParagraphDialogOpen.hidden = !visible;
  if (!visible) {
    elements.modelEssayMiniChips.replaceChildren();
    return;
  }
  const fragment = document.createDocumentFragment();
  const allSelected = state.modelEssayParagraphSelection.length === paragraphs.length
    && state.modelEssayParagraphSelection.every(Boolean);
  const addChip = (label, pressed, onClick) => {
    const button = createElement("button", "model-essay-mini-chip", label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(pressed));
    button.addEventListener("click", onClick);
    fragment.append(button);
  };
  addChip("全文", allSelected, () => {
    applyModelEssaySelection(Array.from({ length: paragraphs.length }, () => true));
    persistDraft();
  });
  paragraphs.forEach((paragraph, index) => {
    addChip(`P${index + 1}`, state.modelEssayParagraphSelection[index] !== false, () => {
      const next = [...state.modelEssayParagraphSelection];
      next[index] = !next[index];
      if (!next.some(Boolean)) {
        showToast("請至少保留一個範文段落。", "error");
        return;
      }
      applyModelEssaySelection(next);
      persistDraft();
    });
  });
  elements.modelEssayMiniChips.replaceChildren(fragment);
}

function syncModelEssayControls() {
  if (elements.modelEssayToggle) {
    elements.modelEssayToggle.disabled = !state.modelEssayParagraphs.length;
    elements.modelEssayToggle.hidden = !state.modelEssayParagraphs.length;
    elements.modelEssayToggleLabel.textContent = state.modelEssayOverlayVisible
      ? "關閉範文底字"
      : "顯示範文底字";
  }
  renderModelEssayMiniPanel();
}

function syncModelEssayOverlayScroll() {
  if (!elements.writingInput || !elements.writingEssayOverlay) return;
  elements.writingEssayOverlay.scrollTop = elements.writingInput.scrollTop;
  elements.writingEssayOverlay.scrollLeft = elements.writingInput.scrollLeft;
}

function ensureProofreadTimerStarted() {
  if (!elements.writingInput?.value.trim()) return;
  if (state.proofreadStartedAt > 0) return;
  state.proofreadStartedAt = Date.now();
}

function syncProofreadStatus() {
  if (!elements.proofreadStatus) return;
  if (!elements.writingInput?.value.trim()) {
    elements.proofreadStatus.textContent = "未開始校對：請開始輸入文章後 5 分鐘後再交稿";
    return;
  }
  if (!state.proofreadStartedAt) {
    elements.proofreadStatus.textContent = "校對倒數尚未開始（請先輸入至少一次）";
    return;
  }
  const remaining = proofreadRemainingSeconds();
  if (remaining <= 0) elements.proofreadStatus.textContent = "可交稿：校對倒數已完成";
  else elements.proofreadStatus.textContent = `尚需 ${formatProofreadRemaining(remaining)} 後才能交稿（校對）`;
}

function clearModelEssayState() {
  state.modelEssayReference = null;
  state.modelEssayParagraphs = [];
  state.modelEssayParagraphSelection = [];
  state.modelEssayOverlayVisible = false;
  state.modelEssayRouteKey = "";
  syncModelEssayOverlay();
  syncModelEssayControls();
}

function applyModelEssaySelection(nextSelection) {
  state.modelEssayParagraphSelection = normalizeModelEssayParagraphSelection(nextSelection, state.modelEssayParagraphs.length);
  if (!state.modelEssayParagraphSelection.length) state.modelEssayOverlayVisible = false;
  syncModelEssayOverlay();
  syncModelEssayControls();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDialogMinutesSeconds(minutesValue, secondsValue) {
  const minutes = Math.max(0, Math.round(Number(minutesValue || 0)));
  const seconds = Math.max(0, Math.round(Number(secondsValue || 0)));
  const boundedMinutes = Math.min(720, minutes);
  const boundedSeconds = Math.min(59, seconds);
  return boundedMinutes * 60 + boundedSeconds;
}

function normalizeFeedbackFormattingRuns(value, textValue = "") {
  const text = String(textValue || "");
  if (!Array.isArray(value) || !text.length) return [];
  const sorted = value.map(run => ({
    start: Number(run?.start),
    end: Number(run?.end),
    bold: run?.bold === true,
    italic: run?.italic === true,
    strikethrough: run?.strikethrough === true,
    highlight: FEEDBACK_HIGHLIGHT_NAMES.includes(String(run?.highlight || ""))
      ? String(run.highlight)
      : ""
  })).filter(run => (
    Number.isSafeInteger(run.start)
    && Number.isSafeInteger(run.end)
    && run.start >= 0
    && run.end > run.start
    && run.end <= text.length
    && (run.bold || run.italic || run.strikethrough || run.highlight)
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
      && previous.italic === run.italic
      && previous.strikethrough === run.strikethrough
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
    if (run.italic) {
      const emphasis = document.createElement("em");
      emphasis.append(node);
      node = emphasis;
    }
    if (run.strikethrough) {
      const strike = document.createElement("s");
      strike.append(node);
      node = strike;
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

function refreshFeedbackStructuredLivePreview(editor, preview) {
  const count = preview?.querySelector("[data-feedback-structured-preview-count]");
  const content = preview?.querySelector("[data-feedback-structured-preview-content]");
  if (!editor || !preview || !count || !content) return;
  try {
    const value = readFeedbackRichEditor(editor);
    const blocks = parseNumberedFeedbackBlocks(value.text);
    const cardCount = blocks.reduce(
      (total, block) => total + (block.type === "numbered" ? block.items.length : 0),
      0
    );
    content.classList.remove("is-error");
    if (!cardCount) {
      preview.hidden = true;
      count.textContent = "";
      content.replaceChildren();
      return;
    }
    preview.hidden = false;
    count.textContent = `${cardCount} 張卡片`;
    appendStructuredFeedbackRichText(content, value.text, value.formatting);
  } catch (error) {
    preview.hidden = false;
    count.textContent = "未能預覽";
    content.classList.add("is-error");
    content.replaceChildren(createElement(
      "p",
      "feedback-structured-paragraph",
      error?.message || "格式預覽暫時不可用。"
    ));
  }
}

function createFeedbackStructuredLivePreview(editor) {
  const preview = createElement("section", "teacher-feedback-live-preview");
  preview.dataset.feedbackStructuredPreview = editor.dataset.feedbackRichEditor || "feedback";
  preview.setAttribute("aria-label", "學生版面即時預覽");
  preview.hidden = true;

  const head = createElement("div", "teacher-feedback-live-preview-head");
  const title = createElement("strong", "", "學生版面即時預覽");
  const count = createElement("span");
  count.dataset.feedbackStructuredPreviewCount = "true";
  head.append(title, count);

  const content = createElement(
    "div",
    "teacher-feedback-rich-content teacher-feedback-live-preview-content"
  );
  content.dataset.feedbackStructuredPreviewContent = "true";
  preview.append(head, content);

  let pendingFrame = 0;
  editor.addEventListener("input", () => {
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      if (!editor.isConnected || !preview.isConnected) return;
      refreshFeedbackStructuredLivePreview(editor, preview);
    });
  });
  refreshFeedbackStructuredLivePreview(editor, preview);
  return preview;
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
    "#d5f2d5": "green",
    "rgb(255,199,199)": "red",
    "#ffc7c7": "red"
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
    if (style.bold || style.italic || style.strikethrough || style.highlight) {
      const previous = runs[runs.length - 1];
      if (
        previous
        && previous.end === start
        && previous.bold === style.bold
        && previous.italic === style.italic
        && previous.strikethrough === style.strikethrough
        && previous.highlight === style.highlight
      ) previous.end = end;
      else runs.push({
        start,
        end,
        bold: style.bold,
        italic: style.italic,
        strikethrough: style.strikethrough,
        highlight: style.highlight
      });
    }
  };
  const appendBreak = () => {
    if (text && !text.endsWith("\n")) appendText("\n", {
      bold: false,
      italic: false,
      strikethrough: false,
      highlight: ""
    });
  };
  const visit = (node, inherited = {
    bold: false,
    italic: false,
    strikethrough: false,
    highlight: ""
  }) => {
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
    const decoration = String(element.style?.textDecoration || element.style?.textDecorationLine || "");
    const style = {
      bold: inherited.bold || tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= 600,
      italic: inherited.italic || tag === "I" || tag === "EM" || element.style?.fontStyle === "italic",
      strikethrough: inherited.strikethrough || tag === "S" || tag === "STRIKE" || tag === "DEL" || decoration.includes("line-through"),
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
    italic: run.italic,
    strikethrough: run.strikethrough,
    highlight: run.highlight
  })).filter(run => run.end > run.start);
  const maxLength = Math.max(1, Number(editor.dataset.feedbackMaxLength || 20000));
  if (trimmed.length > maxLength) {
    throw new Error(`${editor.getAttribute("aria-label") || "評語內容"}不可超過 ${maxLength.toLocaleString()} 個字元。`);
  }
  return { text: trimmed, formatting: normalizeFeedbackFormattingRuns(adjusted, trimmed) };
}

function cloneFeedbackRanges(ranges) {
  return (Array.isArray(ranges) ? ranges : []).flatMap((range) => {
    try { return [range.cloneRange()]; } catch { return []; }
  });
}

function feedbackRangeBelongsToEditor(range, editor) {
  if (!range || !editor) return false;
  const start = range.startContainer?.nodeType === Node.ELEMENT_NODE
    ? range.startContainer
    : range.startContainer?.parentElement;
  const end = range.endContainer?.nodeType === Node.ELEMENT_NODE
    ? range.endContainer
    : range.endContainer?.parentElement;
  return Boolean(start && end && editor.contains(start) && editor.contains(end) && !range.collapsed);
}

function feedbackRangesEqual(left, right) {
  try {
    return left.compareBoundaryPoints(Range.START_TO_START, right) === 0
      && left.compareBoundaryPoints(Range.END_TO_END, right) === 0;
  } catch {
    return false;
  }
}

function clearFeedbackSelectionOverlays() {
  state.feedbackSelectionOverlays.forEach(element => element.remove());
  state.feedbackSelectionOverlays = [];
}

function syncFeedbackMultiSelectionHelp(count = 0) {
  document.querySelectorAll(".teacher-feedback-multiselect-help").forEach((label) => {
    label.textContent = count > 0
      ? `已選 ${count} 段 · ⌘／Ctrl + 拖選可繼續累加`
      : "⌘／Ctrl + 拖選可累加多段文字";
  });
}

function refreshFeedbackMultiSelectionHighlight() {
  clearFeedbackSelectionOverlays();
  if (globalThis.CSS?.highlights) CSS.highlights.delete("writing-feedback-multi-selection");
  const editor = state.activeFeedbackRichEditor;
  const ranges = state.feedbackSelectionRanges.filter(range => feedbackRangeBelongsToEditor(range, editor));
  syncFeedbackMultiSelectionHelp(ranges.length);
  if (ranges.length < 2) return;
  if (globalThis.CSS?.highlights && typeof globalThis.Highlight === "function") {
    CSS.highlights.set("writing-feedback-multi-selection", new Highlight(...ranges));
    return;
  }
  const overlays = [];
  ranges.forEach((range) => {
    [...range.getClientRects()].forEach((rect) => {
      if (rect.width < 1 || rect.height < 1) return;
      const overlay = createElement("span", "teacher-feedback-multi-selection-overlay");
      Object.assign(overlay.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
      document.body.append(overlay);
      overlays.push(overlay);
    });
  });
  state.feedbackSelectionOverlays = overlays;
}

function scheduleFeedbackMultiSelectionHighlight() {
  if (state.feedbackSelectionOverlayFrame || state.feedbackSelectionRanges.length < 2) return;
  state.feedbackSelectionOverlayFrame = requestAnimationFrame(() => {
    state.feedbackSelectionOverlayFrame = 0;
    refreshFeedbackMultiSelectionHighlight();
  });
}

function clearFeedbackSelectionRanges({ keepEditor = false } = {}) {
  state.feedbackSelectionRanges = [];
  state.feedbackMultiSelectPending = null;
  if (!keepEditor) state.activeFeedbackRichEditor = null;
  if (globalThis.CSS?.highlights) CSS.highlights.delete("writing-feedback-multi-selection");
  clearFeedbackSelectionOverlays();
  syncFeedbackMultiSelectionHelp();
}

function rememberFeedbackSelection(editor, ranges, { append = false } = {}) {
  if (!editor?.isConnected) return;
  const next = append && state.activeFeedbackRichEditor === editor
    ? cloneFeedbackRanges(state.feedbackSelectionRanges)
    : [];
  cloneFeedbackRanges(ranges).forEach((range) => {
    if (!feedbackRangeBelongsToEditor(range, editor)) return;
    if (!next.some(saved => feedbackRangesEqual(saved, range))) next.push(range);
  });
  state.activeFeedbackRichEditor = editor;
  state.feedbackSelectionRanges = next.slice(0, 40);
  refreshFeedbackMultiSelectionHighlight();
}

function currentFeedbackSelection(editor) {
  const selection = window.getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  return feedbackRangeBelongsToEditor(range, editor) ? range.cloneRange() : null;
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
  editor.addEventListener("input", () => {
    if (!state.feedbackApplyingFormat && state.activeFeedbackRichEditor === editor) {
      clearFeedbackSelectionRanges({ keepEditor: true });
    }
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
    const command = feedbackFormattingCommandFromEvent(event);
    if (!command) return;
    event.preventDefault();
    state.activeFeedbackRichEditor = editor;
    const range = currentFeedbackSelection(editor);
    if (range && !state.feedbackSelectionRanges.length) rememberFeedbackSelection(editor, [range]);
    applyFeedbackFormatting(command);
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
  bold.setAttribute("aria-label", "粗體（Command 或 Control + Shift + B）");
  bold.title = "粗體：⌘⇧B（Windows 使用 Ctrl+Shift+B）";
  const italic = createElement("button", "teacher-feedback-format-button teacher-feedback-format-italic", "I");
  italic.type = "button";
  italic.dataset.feedbackFormat = "italic";
  italic.setAttribute("aria-label", "斜體");
  italic.title = "斜體";
  const strike = createElement("button", "teacher-feedback-format-button teacher-feedback-format-strike", "S");
  strike.type = "button";
  strike.dataset.feedbackFormat = "strikethrough";
  strike.setAttribute("aria-label", "刪除線");
  strike.title = "刪除線";
  toolbar.append(bold, italic, strike);
  FEEDBACK_HIGHLIGHT_NAMES.forEach(name => {
    const labels = { yellow: "黃色", orange: "橙色", blue: "藍色", green: "綠色", red: "紅色" };
    const shortcuts = { yellow: "⌘Y", orange: "⌘O", blue: "⌘B", green: "⌘G", red: "⌘R" };
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
  const multi = createElement("span", "teacher-feedback-multiselect-help", "⌘／Ctrl + 拖選可累加多段文字");
  toolbar.append(clear, multi);
  return toolbar;
}

function applyFeedbackFormatting(command) {
  const editor = state.activeFeedbackRichEditor;
  if (!editor?.isConnected) {
    showToast("請先在原句、Edmund 評語或建議寫法中選取文字。", "error");
    return;
  }
  const selection = window.getSelection();
  const current = currentFeedbackSelection(editor);
  if (current && !state.feedbackSelectionRanges.length) rememberFeedbackSelection(editor, [current]);
  const ranges = cloneFeedbackRanges(state.feedbackSelectionRanges)
    .filter(range => feedbackRangeBelongsToEditor(range, editor))
    .sort((left, right) => {
      try { return -left.compareBoundaryPoints(Range.START_TO_START, right); } catch { return 0; }
    });
  if (!selection || !ranges.length) {
    showToast("請先選取要設定格式的文字。", "error");
    return;
  }
  state.feedbackApplyingFormat = true;
  try {
    ranges.forEach((range) => {
      selection.removeAllRanges();
      selection.addRange(range);
      if (command === "bold") document.execCommand("bold", false);
      else if (command === "italic") document.execCommand("italic", false);
      else if (command === "strikethrough") document.execCommand("strikeThrough", false);
      else if (command === "clear") document.execCommand("removeFormat", false);
      else if (FEEDBACK_HIGHLIGHT_NAMES.includes(command)) {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("hiliteColor", false, FEEDBACK_HIGHLIGHT_COLORS[command]);
      }
    });
  } finally {
    state.feedbackApplyingFormat = false;
    selection.removeAllRanges();
    clearFeedbackSelectionRanges({ keepEditor: true });
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

function writingClockEligible({ ignoreIdleBreak = false, allowHiddenTransition = false } = {}) {
  return Boolean(
    state.user?.role === "student"
    && state.currentView === "workspace"
    && (allowHiddenTransition || document.visibilityState !== "hidden")
    && state.documentId
    && state.writingAreaFocused
    && (ignoreIdleBreak || !idleBreakIsPaused())
  );
}

function accrueWritingTime(now = Date.now(), {
  ignoreIdleBreak = false,
  allowHiddenTransition = false
} = {}) {
  if (!state.writingClockLastAt) {
    state.writingClockLastAt = now;
    return;
  }
  const elapsedMs = Math.max(0, Math.min(15000, now - state.writingClockLastAt));
  if (writingClockEligible({ ignoreIdleBreak, allowHiddenTransition })) {
    state.draftDurationSeconds += elapsedMs / 1000;
  }
  state.writingClockLastAt = now;
}

function markWritingActivity() {
  const now = Date.now();
  if (idleBreakIsPaused()) {
    state.writingClockLastAt = now;
    return;
  }
  accrueWritingTime(now);
  state.writingClockLastAt = now;
}

function resumeWritingClockForEditor() {
  const now = Date.now();
  if (state.writingAreaFocused) {
    accrueWritingTime(now);
    return;
  }
  state.writingAreaFocused = true;
  state.writingClockLastAt = now;
}

function pauseWritingClockOutsideEditor({ allowHiddenTransition = false } = {}) {
  const now = Date.now();
  accrueWritingTime(now, { allowHiddenTransition });
  state.writingAreaFocused = false;
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
  if (name !== "workspace") state.writingAreaFocused = false;
  clearFeedbackSelectionRanges();
  state.currentView = name;
  state.writingClockLastAt = Date.now();
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
  scheduleFloatingWritingTopicSync();
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
  state.adminManualTopics = [];
  state.adminManualTopicsBusy = false;
  state.selectedAdminSubmissionId = "";
  state.adminSubmissionRequestGeneration += 1;
  state.selectedAdminFeedback = null;
  state.adminFeedbackSuggestedFragments = [];
  state.adminExplanationReviews = [];
  state.adminExplanationReviewPage = 0;
  state.adminExplanationReviewHasMore = false;
  state.entryLinkHandled = false;
  state.topicCatalog = [];
  state.topicCatalogPromise = null;
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
  state.writingAreaFocused = false;
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
  if (resource?.type === "manual-writing-topic") {
    return state.user?.role === "student" && UUID_RE.test(String(resource.manualTopicId || ""));
  }
  return writingTopicAccessAllows(
    resource,
    state.studentAccess,
    state.studentAccessReady
  );
}

function canonicalWritingTopicResource(resource = state.selectedTopicResource) {
  const manualId = typeof resource === "string" ? resource : resource?.id;
  if (String(manualId || "").startsWith("manual:")) {
    const match = state.topicCatalog.find((item) => item.id === manualId && item.type === "manual-writing-topic");
    return canAccessWritingTopic(match) ? match : null;
  }
  return canonicalAccessibleWritingTopic(
    state.topicCatalog,
    resource,
    state.studentAccess,
    state.studentAccessReady
  );
}

function canonicalWritingTopicResourceForTransport(resource = state.selectedTopicResource) {
  const canonical = canonicalWritingTopicResource(resource);
  return canonical?.type === "manual-writing-topic" ? null : writingTopicResourceForTransport(canonical);
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
  const hkfsdIncidentReportMatch = /^hkfsd-incident-report-(\d+)$/i.exec(exerciseId);
  const flashDeckId = essayKey && essayPortals.hasFlashcards(essayKey)
    ? essayPortals.flashDeckId(essayKey)
    : dsePartAMatch
      ? `dse/writing/part-a/${dsePartAMatch[1]}`
      : hkpfCompositionMatch
        ? `government/hkpf/writing-composition/composition-${hkpfCompositionMatch[1]}`
        : hkfsdIncidentReportMatch
          ? `government/hkfsd/incident-reports/incident-report-${hkfsdIncidentReportMatch[1]}`
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
  const ariaLabels = {
    flashcards: "前往相關 Flash Card",
    writing: "前往相關 Fill In The Blanks 練習",
    "manual-flashcards": "前往管理員提供的 Flash Card",
    "manual-writing": "前往管理員提供的 Writing Practice",
    "manual-model-essay": "前往管理員提供的 Model Essay"
  };
  link.setAttribute("aria-label", ariaLabels[kind] || "開啟相關學習資源");
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
  const resource = canonicalWritingTopicResource();
  const route = selectedTopicReferenceRoute(resource);
  elements.topicReferenceArea.replaceChildren();
  elements.topicReferenceArea.hidden = true;
  if (resource?.type === "manual-writing-topic") {
    const references = createElement("div", "topic-reference-links manual-topic-reference-links");
    const links = [
      ["重溫 Flash Card 請按這裡：", resource.flashcardUrl, "manual-flashcards"],
      ["前往 Writing Practice 請按這裡：", resource.writingPracticeUrl, "manual-writing"],
      ["參考 Edmund 範文 Model Essay 請按這裡：", resource.modelEssayUrl, "manual-model-essay"]
    ];
    for (const [label, href, kind] of links) {
      if (href) references.append(topicReferenceLinkRow(label, href, kind));
    }
    if (resource.wordList) {
      const words = createElement("section", "manual-topic-word-list");
      words.append(
        createElement("strong", "", "題目詞彙及提示 · Words & Notes"),
        createElement("p", "", resource.wordList)
      );
      references.append(words);
    }
    if (references.childElementCount) {
      elements.topicReferenceArea.append(references);
      elements.topicReferenceArea.hidden = false;
    }
    return;
  }
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

async function loadModelEssayReference({ force = false } = {}) {
  const route = selectedTopicReferenceRoute();
  const nextRouteKey = modelEssayRouteKey(route);
  const loadTicket = state.modelEssayRouteLoad + 1;
  state.modelEssayRouteLoad = loadTicket;
  if (!route) {
    clearModelEssayState();
    return null;
  }
  if (!force && state.modelEssayRouteKey === nextRouteKey && state.modelEssayParagraphs.length) return state.modelEssayReference;
  state.modelEssayRouteKey = nextRouteKey;
  try {
    const catalog = await loadTopicReferenceCatalog();
    if (state.modelEssayRouteLoad !== loadTicket) return null;
    const reference = catalog?.[route.exerciseId];
    if (!reference || !Array.isArray(reference?.paragraphs)) {
      clearModelEssayState();
      return null;
    }
    const paragraphs = reference.paragraphs
      .map((paragraph) => ({
        label: String(paragraph?.label || ""),
        english: String(paragraph?.english || "").trim(),
        chinese: String(paragraph?.chinese || "").trim()
      }))
      .filter(paragraph => paragraph.english || paragraph.chinese);
    state.modelEssayReference = { ...reference, paragraphs };
    state.modelEssayParagraphs = paragraphs;
    state.modelEssayParagraphSelection = normalizeModelEssayParagraphSelection(
      state.modelEssayParagraphSelection,
      paragraphs.length
    );
    if (!state.modelEssayParagraphSelection.length) {
      state.modelEssayParagraphSelection = paragraphs.map(() => true);
    }
    if (!state.modelEssayParagraphSelection.some(Boolean)) {
      state.modelEssayParagraphSelection = paragraphs.map(() => true);
    }
    if (!state.modelEssayOverlayVisible) state.modelEssayOverlayVisible = false;
    syncModelEssayControls();
    syncModelEssayOpenCount();
    syncModelEssayOverlay();
    return state.modelEssayReference;
  } catch (error) {
    if (state.modelEssayRouteLoad === loadTicket) {
      console.warn("Model essay overlay catalog failed", error);
      clearModelEssayState();
    }
    return null;
  }
}

function renderModelEssayParagraphDialog() {
  if (!elements.modelEssayParagraphList) return;
  if (!state.modelEssayParagraphs.length) {
    elements.modelEssayParagraphList.replaceChildren(emptyState("目前未有可顯示的 Model Essay 段落。"));
    if (elements.modelEssaySelectAll) elements.modelEssaySelectAll.checked = false;
    return;
  }
  const fragment = document.createDocumentFragment();
  state.modelEssayParagraphs.forEach((paragraph, index) => {
    const row = createElement("label", "model-essay-paragraph-row");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.modelEssayParagraphIndex = String(index);
    checkbox.checked = Boolean(state.modelEssayParagraphSelection[index]);
    const title = createElement("strong", "", paragraph.label || `Paragraph ${index + 1}`);
    const preview = createElement("p", "model-essay-paragraph-row-preview", paragraph.english);
    row.append(checkbox, title, preview);
    fragment.append(row);
  });
  elements.modelEssayParagraphList.replaceChildren(fragment);
  const allChecked = state.modelEssayParagraphSelection.every(Boolean);
  const anyChecked = state.modelEssayParagraphSelection.some(Boolean);
  if (elements.modelEssaySelectAll) {
    elements.modelEssaySelectAll.checked = allChecked;
    elements.modelEssaySelectAll.indeterminate = anyChecked && !allChecked;
  }
  syncModelEssayOpenCount();
}

function applyModelEssaySelectionFromDialog() {
  if (!elements.modelEssayParagraphList) return;
  const selections = [];
  elements.modelEssayParagraphList.querySelectorAll("[data-model-essay-paragraph-index]").forEach((checkbox) => {
    const index = Number(checkbox.dataset.modelEssayParagraphIndex);
    if (!Number.isSafeInteger(index) || index < 0 || index >= state.modelEssayParagraphs.length) return;
    selections[index] = checkbox.checked;
  });
  if (!selections.length) selections.push(...state.modelEssayParagraphs.map(() => true));
  applyModelEssaySelection(normalizeModelEssayParagraphSelection(selections, state.modelEssayParagraphs.length));
  persistDraft();
}

function setAllModelEssayParagraphSelection(nextChecked = true) {
  if (!state.modelEssayParagraphs.length) return;
  state.modelEssayParagraphSelection = state.modelEssayParagraphs.map(() => Boolean(nextChecked));
  renderModelEssayParagraphDialog();
  syncModelEssayOpenCount();
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
      const normalizedParagraphs = Array.isArray(reference?.paragraphs)
        ? reference.paragraphs
          .map((paragraph) => ({
            label: String(paragraph?.label || ""),
            english: String(paragraph?.english || "").trim(),
            chinese: String(paragraph?.chinese || "").trim()
          }))
          .filter((paragraph) => paragraph.english || paragraph.chinese)
        : [];
      state.modelEssayReference = { ...reference, paragraphs: normalizedParagraphs };
      state.modelEssayParagraphs = normalizedParagraphs;
      state.modelEssayParagraphSelection = normalizeModelEssayParagraphSelection(
        state.modelEssayParagraphSelection,
        normalizedParagraphs.length
      );
      if (!state.modelEssayParagraphSelection.length) {
        state.modelEssayParagraphSelection = normalizedParagraphs.map(() => true);
      }
      syncModelEssayControls();
      syncModelEssayOverlay();
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

async function loadHomeworkResourceCatalog() {
  if (state.homeworkResourceCatalog) return state.homeworkResourceCatalog;
  if (!state.homeworkResourceCatalogPromise) {
    state.homeworkResourceCatalogPromise = import(`./homework-resource-catalog.mjs?v=${TOPIC_CATALOG_VERSION}`)
      .then((module) => {
        const catalog = Array.isArray(module.HOMEWORK_RESOURCE_CATALOG)
          ? module.HOMEWORK_RESOURCE_CATALOG
          : [];
        state.homeworkResourceCatalog = catalog;
        return catalog;
      })
      .catch((error) => {
        state.homeworkResourceCatalogPromise = null;
        throw error;
      });
  }
  return state.homeworkResourceCatalogPromise;
}

function manualWritingTopicResource(value) {
  const id = String(value?.id || "").trim().toLowerCase();
  const title = String(value?.title || "").trim().slice(0, 300);
  const prompt = String(value?.prompt || "").trim().slice(0, 4000);
  const referenceUrl = (candidate, allowedPaths) => {
    try {
      const parsed = new URL(String(candidate || ""));
      return parsed.protocol === "https:"
        && parsed.hostname === "edmundeducation.com"
        && allowedPaths.includes(parsed.pathname)
        ? parsed.href
        : "";
    } catch {
      return "";
    }
  };
  if (!UUID_RE.test(id) || !title || !prompt) return null;
  return Object.freeze({
    id: `manual:${id}`,
    manualTopicId: id,
    type: "manual-writing-topic",
    label: title,
    detail: "手動創作題目",
    url: `writing-submission.html?manualTopic=${encodeURIComponent(id)}`,
    sectionKey: "manual-writing-topic",
    questionPrompt: [prompt],
    questionImages: [],
    flashcardUrl: referenceUrl(value?.flashcardUrl, ["/flashcards.html"]),
    writingPracticeUrl: referenceUrl(value?.writingPracticeUrl, ["/writing-practice.html"]),
    modelEssayUrl: referenceUrl(value?.modelEssayUrl, ["/model-essay-downloads.html", "/writing-practice.html"]),
    wordList: String(value?.wordList || "").trim().slice(0, 4000)
  });
}

async function loadStudentManualWritingTopics() {
  if (state.user?.role !== "student" || !state.authToken) return [];
  const payload = await apiJson("/v1/manual-topics");
  return (Array.isArray(payload?.topics) ? payload.topics : [])
    .map(manualWritingTopicResource)
    .filter(Boolean);
}

async function loadWritingTopicCatalog() {
  if (state.topicCatalog.length) return state.topicCatalog;
  if (!state.topicCatalogPromise) {
    state.topicCatalogPromise = Promise.all([loadHomeworkResourceCatalog(), loadStudentManualWritingTopics()])
      .then(([source, manualTopics]) => {
        const catalog = source
          .filter(resource => resource?.type === "fill-blanks")
          .map(normalizeWritingTopicResource)
          .filter(Boolean);
        catalog.push(...manualTopics);
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
  state.floatingTopicSignature = "";
  syncFloatingWritingTopicContent();
  clearModelEssayState();
  if (elements.removeWritingTopic) elements.removeWritingTopic.hidden = !resource;
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
  const remove = createElement("button", "", "移除題目及資源");
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
  loadModelEssayReference().catch((error) => {
    console.warn("Model essay reference load failed", error);
  });
}

function removeSelectedWritingTopic() {
  state.selectedTopicResource = null;
  elements.topicInput.value = "";
  clearModelEssayState();
  renderSelectedTopicPreview();
  updateEditorMetrics();
  persistDraft();
  showToast("已移除題目、Flash Card、Fill In The Blanks、範文及 Glossary；現在可重新選擇或自行輸入。", "success");
  elements.topicInput.focus();
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
      directPaste: Boolean(value.directPaste),
      directPasteWordCount: Number.isSafeInteger(Number(value.directPasteWordCount))
        ? Number(value.directPasteWordCount)
        : 0,
      proofreadStartedAt: Number.isSafeInteger(Number(value.proofreadStartedAt))
        ? Number(value.proofreadStartedAt)
        : 0,
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
      directPaste: state.directPaste,
      directPasteWordCount: state.directPasteWordCount,
      proofreadStartedAt: state.proofreadStartedAt,
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
  syncProofreadStatus();
  syncModelEssayOverlayScroll();
  syncFloatingWritingTopicContent();
  scheduleFloatingWritingTopicSync();
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
      ? "倒數進行中；時間到後先進入五分鐘校對，完成後才會自動提交。"
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
  syncProofreadStatus();
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
  state.proofreadingGate = normalizeWritingProofreadingGate(state.proofreadingGate);
  if (!isWritingProofreadingReady(state.proofreadingGate)) {
    state.writingTimer.autoSubmitAttemptedAt = 0;
    if (!isWritingProofreadingActive(state.proofreadingGate)) {
      try {
        beginWritingProofreading();
      } catch (error) {
        state.writingTimer.autoSubmitError = `時間已到，但未能開始校對：${error.message || "請先補充文章內容。"}`;
        persistDraft();
        syncWritingTimerUi();
        return false;
      }
    }
    state.writingTimer.autoSubmitError = "寫作時間已到；文章已進入五分鐘校對，校對完成後才會自動提交。";
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
  state.directPaste = false;
  state.directPasteWordCount = 0;
  resetProofreadState();
  state.writingTimer = emptyWritingTimer();
  state.writingStopwatch = emptyWritingStopwatch();
  state.proofreadingGate = resetWritingProofreadingGate();
  state.writingImageZoom = 1;
  state.timerAutoSubmitLock = false;
  state.writingClockLastAt = Date.now();
  state.writingAreaFocused = false;
  state.previousWriting = "";
  state.activeIssues = [];
  state.appliedCorrections = [];
  state.dismissedIssueIds.clear();
  elements.topicInput.value = "";
  elements.writingInput.value = "";
  state.selectedTopicResource = null;
  clearModelEssayState();
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
  state.directPaste = Boolean(draft?.directPaste);
  state.directPasteWordCount = Number.isSafeInteger(draft?.directPasteWordCount)
    ? Math.max(0, Number(draft.directPasteWordCount))
    : 0;
  state.proofreadStartedAt = Number.isSafeInteger(draft?.proofreadStartedAt) && draft.proofreadStartedAt > 0
    ? Math.max(0, Math.round(draft.proofreadStartedAt))
    : 0;
  state.writingTimer = normalizeWritingTimer(draft?.writingTimer);
  state.writingStopwatch = normalizeWritingStopwatch(draft?.writingStopwatch);
  state.proofreadingGate = normalizeWritingProofreadingGate(draft?.proofreadingGate);
  state.writingImageZoom = draft?.writingImageZoom || 1;
  state.timerAutoSubmitLock = false;
  state.writingClockLastAt = Date.now();
  state.writingAreaFocused = false;
  state.appliedCorrections = [];
  elements.topicInput.value = draft?.topic || "";
  elements.writingInput.value = draft?.answer || "";
  state.selectedTopicResource = selectedTopicResource;
  renderSelectedTopicPreview();
  await loadModelEssayReference({ force: true });
  state.previousWriting = elements.writingInput.value;
  updateEditorMetrics();
  syncProofreadStatus();
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

function normalizeIssueText(value) {
  return String(value || "").replace(/\s+/gu, " ").trim();
}

function preserveCaseForReplacement(original, replacement) {
  const source = String(original || "");
  const target = String(replacement || "");
  if (source.toUpperCase() === source) return target.toUpperCase();
  if (source.toLowerCase() === source) return target.toLowerCase();
  if (source[0]?.toUpperCase() === source[0]) return `${target[0]?.toUpperCase() || ""}${target.slice(1).toLowerCase()}`;
  return target;
}

function isProofreadRelevantGrammarIssue(issue) {
  const labels = `${issue?.title || ""} ${issue?.message || ""} ${issue?.ruleId || ""} ${issue?.sentenceText || ""}`.toLowerCase();
  return [
    "spelling",
    "spelling_or_spacing",
    "punctuation",
    "spacing",
    "拼字",
    "標點",
    "空格"
  ].some(token => labels.includes(token));
}

function buildProofreadIssueList(answer) {
  const unique = new Set();
  const candidates = [];
  const raw = String(answer || "");
  for (const issue of state.activeIssues) {
    if (!isProofreadRelevantGrammarIssue(issue)) continue;
    const before = normalizeIssueText(issue.originalText || issue.sentenceText || "");
    const after = normalizeIssueText(issue.correctedSentence || issue.message || issue.sentenceText || "");
    if (!before || !after || before === after) continue;
    if (isLikelyBritishAmericanSpellingVariant(before, after)) continue;
    const key = `${before}|||${after}`;
    if (unique.has(key)) continue;
    unique.add(key);
    candidates.push({ incorrect: before, suggestion: after, reason: issue.title || "spelling_or_spacing" });
  }
  for (const hint of SPELLING_AND_SPACING_HINTS) {
    const typo = String(hint.pattern || "");
    const correct = String(hint.suggestion || "");
    const pattern = new RegExp(`\\b${escapeRegex(typo)}\\b`, "gi");
    let match = null;
    while ((match = pattern.exec(raw)) !== null) {
      const incorrect = match[0];
      const replacement = preserveCaseForReplacement(incorrect, correct);
      const key = `${incorrect.toLowerCase()}|||${replacement.toLowerCase()}`;
      if (unique.has(key)) continue;
      unique.add(key);
      candidates.push({
        incorrect: incorrect,
        suggestion: replacement,
        reason: "spelling"
      });
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
  }

  const spacingPatterns = [
    { regex: /,([A-Za-z])/g, replacement: ", $1", reason: "spacing" },
    { regex: /([.!?;:])([A-Za-z])/g, replacement: "$1 $2", reason: "punctuation" },
    { regex: /(\d+)(years?|months?|weeks?|days?|hours?|minutes?|seconds?)(?!\s)/gi, replacement: "$1 $2", reason: "spacing" }
  ];
  for (const item of spacingPatterns) {
    let match = null;
    while ((match = item.regex.exec(raw)) !== null) {
      const full = match[0];
      if (full.length < 2) continue;
      let replacement = full.replace(item.regex, item.replacement || full);
      const key = `${full.toLowerCase()}|||${replacement.toLowerCase()}`;
      if (unique.has(key)) continue;
      unique.add(key);
      candidates.push({
        incorrect: full,
        suggestion: replacement,
        reason: item.reason
      });
      if (match.index === item.regex.lastIndex) item.regex.lastIndex += 1;
    }
  }
  return candidates;
}

function isLikelyBritishAmericanSpellingVariant(left, right) {
  const normalizedLeft = String(left || "").trim().toLowerCase();
  const normalizedRight = String(right || "").trim().toLowerCase();
  const pairs = [
    ["colour", "color"],
    ["favour", "favor"],
    ["fibre", "fiber"],
    ["centre", "center"],
    ["theatre", "theater"],
    ["realise", "realize"],
    ["organise", "organize"],
    ["licence", "license"],
    ["defence", "defense"],
    ["analyse", "analyze"],
    ["programme", "program"],
    ["travelling", "traveling"]
  ];
  return pairs.some((pair) => {
    const [british, american] = pair;
    return (
      (normalizedLeft === british && normalizedRight === american)
      || (normalizedLeft === american && normalizedRight === british)
    );
  });
}

function proofreadingIssueSignature(issues) {
  return issues
    .map((issue) => `${normalizeIssueText(issue.incorrect)}=>${normalizeIssueText(issue.suggestion)}`)
    .filter((line) => line)
    .sort()
    .join("||");
}

function renderProofreadingIssuesTable(issues) {
  if (!elements.proofreadIssuesTable) return;
  const body = elements.proofreadIssuesTable.querySelector("tbody");
  if (!body) return;
  if (!issues.length) {
    body.replaceChildren(createElement("tr", "", createElement("td", "", "未發現可補正的拼字/標點問題。")));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const issue of issues) {
    const row = document.createElement("tr");
    row.append(
      createElement("td", "", issue.incorrect),
      createElement("td", "", issue.suggestion),
      createElement("td", "", issue.reason || "spelling_or_spacing")
    );
    fragment.append(row);
  }
  body.replaceChildren(fragment);
}

function requestDirectPasteDuration() {
  return new Promise((resolve) => {
    const finalize = (value) => {
      state.directPastePromptResolver = null;
      if (elements.directPasteDialogStatus) elements.directPasteDialogStatus.textContent = "";
      if (elements.directPasteDialogIntro) elements.directPasteDialogIntro.textContent = "";
      if (elements.directPasteDialogMinutes) elements.directPasteDialogMinutes.value = "";
      if (elements.directPasteDialogSeconds) elements.directPasteDialogSeconds.value = "";
      safeDialogClose(elements.directPasteDialog);
      resolve(value);
    };
    if (elements.directPasteDialogMinutes) elements.directPasteDialogMinutes.value = "";
    if (elements.directPasteDialogSeconds) elements.directPasteDialogSeconds.value = "";
    state.directPastePromptResolver = finalize;
    const pastedWordCount = Number.isSafeInteger(Number(state.directPasteWordCount))
      ? Math.max(0, Math.round(Number(state.directPasteWordCount)))
      : 0;
    const intro = pastedWordCount > 0
      ? `It seems the text is pasted, how much time was spent on the writing? （系統偵測到約 ${pastedWordCount} 字為貼上內容，請輸入實際寫作時間）`
      : "It seems the text is pasted, how much time was spent on the writing?（請輸入實際寫作時間）";
    if (elements.directPasteDialogIntro) {
      elements.directPasteDialogIntro.textContent = intro;
    }
    if (elements.directPasteDialogStatus) {
      elements.directPasteDialogStatus.textContent = "";
    }
    safeDialogOpen(elements.directPasteDialog);
    window.setTimeout(() => elements.directPasteDialogMinutes?.focus(), 0);
  });
}

function requestProofreadWarningConfirmation() {
  return new Promise((resolve) => {
    state.proofreadWarningResolver = (value) => {
      state.proofreadWarningResolver = null;
      safeDialogClose(elements.proofreadWarningDialog);
      resolve(value);
    };
    safeDialogOpen(elements.proofreadWarningDialog);
  });
}

function requestProofreadIssueReview(issues) {
  return new Promise((resolve) => {
    renderProofreadingIssuesTable(issues);
    state.proofreadDetailsResolver = (value) => {
      state.proofreadDetailsResolver = null;
      safeDialogClose(elements.proofreadIssuesDialog);
      resolve(value);
    };
    safeDialogOpen(elements.proofreadIssuesDialog);
  });
}

async function promptDirectPasteDuration() {
  const result = await requestDirectPasteDuration();
  if (typeof result !== "number" || !Number.isFinite(result)) return null;
  return result;
}

async function ensureDirectPasteSubmissionDuration() {
  if (!state.directPaste) return state.submissionDurationSeconds;
  const answer = await promptDirectPasteDuration();
  if (!Number.isFinite(answer) || answer < 0) {
    throw new Error("尚未提交：請輸入實際貼上文章的撰寫時間。");
  }
  state.submissionDurationSeconds = Math.max(0, Math.round(answer));
  persistDraft();
  return state.submissionDurationSeconds;
}

async function enforceProofreadSubmissionChecks() {
  if (!elements.writingInput?.value.trim()) return;
  ensureProofreadTimerStarted();
  if (!proofreadReady()) {
    const remaining = proofreadRemainingSeconds();
    syncProofreadStatus();
    throw new Error(`尚未完成 5 分鐘校對（剩餘 ${formatProofreadRemaining(remaining)}），請先等到時間到。`);
  }
  const issues = buildProofreadIssueList(elements.writingInput.value);
  if (!issues.length) {
    state.proofreadIssueSignature = "";
    return;
  }
  const issueSignature = proofreadingIssueSignature(issues);
  if (state.proofreadIssueSignature && state.proofreadIssueSignature !== issueSignature) {
    state.proofreadIssueSignature = issueSignature;
  } else if (!state.proofreadIssueSignature) {
    state.proofreadIssueSignature = issueSignature;
  }
  const stillSubmit = await requestProofreadWarningConfirmation();
  if (!stillSubmit) {
    throw new Error("尚未提交：請回到校對與修正後再試。");
  }
  const confirmSubmit = await requestProofreadIssueReview(issues);
  if (!confirmSubmit) {
    throw new Error("尚未提交：請回到校對與修正後再試。");
  }
}

function handleWritingInput() {
  const nextValue = elements.writingInput.value;
  const previousValue = state.previousWriting;
  markWritingActivity();
  ensureProofreadTimerStarted();
  if (!state.grammarDetectionEnabled) {
    state.previousWriting = nextValue;
    updateEditorMetrics();
    refreshVocabularyUsage();
    scheduleDraftSave();
    renderGrammarIssues();
    syncProofreadStatus();
    syncModelEssayOverlay();
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
  syncProofreadStatus();
  syncModelEssayOverlay();
  if (immediateSegments.length) {
    window.clearTimeout(state.manualRecheckTimer);
    state.manualRecheckTimer = null;
    enqueueSegmentsForCheck(immediateSegments);
  } else {
    scheduleManualGrammarRecheck(previousValue, nextValue);
  }
}

function handleWritingPaste(event) {
  const clipboard = event.clipboardData?.getData("text/plain") || "";
  if (!clipboard.trim()) return;
  const pastedWordCount = countEnglishWords(clipboard);
  if (pastedWordCount > DIRECT_PASTE_WORD_THRESHOLD) {
    const currentPasteWordCount = Number.isSafeInteger(Number(state.directPasteWordCount))
      ? Math.max(0, Math.round(Number(state.directPasteWordCount)))
      : 0;
    state.directPaste = true;
    state.directPasteWordCount = currentPasteWordCount + pastedWordCount;
    syncProofreadStatus();
    if (elements.proofreadStatus) {
      elements.proofreadStatus.textContent = "已偵測到大量貼上，請於提交時填寫實際寫作時間。";
    }
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

async function fetchSubmissionExportBundle(id, role) {
  const normalizedId = String(id || "");
  const admin = role === "admin";
  const source = admin ? state.adminSubmissions : state.submissions;
  const visibleInRole = source.some(item => item.id === normalizedId)
    || (admin && state.selectedAdminSubmissionId === normalizedId);
  if (
    !UUID_RE.test(normalizedId)
    || !visibleInRole
    || state.user?.role !== role
  ) {
    throw new Error(admin ? "文章不屬於目前的管理員檢視。" : "文章不屬於目前登入帳戶。");
  }
  const encodedId = encodeURIComponent(normalizedId);
  const basePath = admin ? `/v1/admin/submissions/${encodedId}` : `/v1/submissions/${encodedId}`;
  const [submissionPayload, feedbackPayload] = await Promise.all([
    apiJson(basePath),
    apiJson(`${basePath}/feedback`)
  ]);
  const submission = normalizeSubmission(submissionPayload?.submission || submissionPayload);
  if (submission.id !== normalizedId) throw new Error("文章服務回應無效。");
  const normalizedFeedback = normalizeTeacherFeedback(feedbackPayload?.feedback);
  const feedback = !admin && normalizedFeedback?.status !== "published" ? null : normalizedFeedback;
  if (feedback && feedback.submissionId && feedback.submissionId !== normalizedId) {
    throw new Error("評語服務回應無效。");
  }
  return { submission, feedback };
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

function feedbackPrintRichHtml(textValue, formattingValue, { structured = false, emptyText = "" } = {}) {
  const container = createElement("div", "print-rich-content");
  const append = structured ? appendStructuredFeedbackRichText : appendFeedbackRichText;
  append(container, textValue, formattingValue, { emptyText });
  if (!String(textValue || "").trim()) container.classList.add("is-empty");
  return container.outerHTML;
}

function feedbackPrintTextSection(title, value, className = "") {
  const text = String(value || "");
  if (!text.trim()) return "";
  return `<section class="print-feedback-text ${escapePrintHtml(className)}">
    <h3>${escapePrintHtml(title)}</h3><div>${escapePrintHtml(text)}</div>
  </section>`;
}

function feedbackPrintLearningCards(title, values) {
  const items = normalizeGrammarFeedbackPoints(values);
  if (!items.length) return "";
  return `<section class="print-feedback-section print-learning-section">
    <h3>${escapePrintHtml(title)}</h3>
    <div class="print-learning-list">${items.map((item, index) => `
      <article class="print-learning-card">
        <strong>文法重點 ${index + 1}</strong>
        ${feedbackPrintRichHtml(item.text, item.formatting, { structured: true })}
      </article>`).join("")}</div>
  </section>`;
}

function feedbackPrintEnhancementCards(title, values, kind) {
  const items = normalizeFeedbackEnhancementParts(values);
  if (!items.length) return "";
  const kindCopy = feedbackEnhancementKindCopy(kind);
  const prefix = kindCopy.singular;
  const fields = [
    ["originalSentence", "Original Sentence 原句", "is-original"],
    ["enhancement", "Enhancement 改良寫法", "is-enhancement"],
    ["benefit", "Benefit 好處／作用", "is-benefit"]
  ];
  return `<section class="print-feedback-section print-enhancement-section ${escapePrintHtml(kindCopy.className)}">
    <h3>${escapePrintHtml(title)}</h3>
    <div class="print-enhancement-list">${items.map((item, index) => `
      <article class="print-enhancement-card">
        <strong class="print-card-title">${prefix} ${index + 1}</strong>
        ${fields.map(([field, label, className]) => `
          <section class="print-enhancement-band ${className}">
            <span>${escapePrintHtml(label)}</span>
            ${feedbackPrintRichHtml(item[field]?.text, item[field]?.formatting, {
              structured: true,
              emptyText: "未填寫"
            })}
          </section>`).join("")}
      </article>`).join("")}</div>
  </section>`;
}

function feedbackPrintSentenceLinks(values) {
  const links = normalizeFeedbackSentencePickerLinks(values).map((link, index) => {
    const absoluteUrl = new URL(link.url, "https://edmundeducation.com/").href;
    return `<div class="print-sentence-link-row">
      <span aria-hidden="true">${index + 1}</span>
      <a href="${escapePrintHtml(absoluteUrl)}" aria-label="前往 ${escapePrintHtml(link.label || `句子結構練習 ${index + 1}`)}">${escapePrintHtml(link.label || `句子結構練習 ${index + 1}`)}</a>
    </div>`;
  });
  if (!links.length) return "";
  return `<section class="print-sentence-panel">
    <header><strong>選擇 Sentence Structure 練習</strong><span>已加入的句子結構練習（${links.length}）</span></header>
    <div class="print-sentence-link-list">${links.join("")}</div>
  </section>`;
}

function feedbackPrintTranscriptions(feedback) {
  const improved = String(feedback?.transcriptionImproved || "");
  const model = String(feedback?.transcriptionModel || "");
  if (!improved.trim() && !model.trim()) return "";
  return `<section class="print-feedback-section print-transcriptions">
    <h3>謄文內容</h3>
    ${improved.trim() ? `<article><strong>謄文區 - 1 Edmund 改良版</strong><div>${escapePrintHtml(improved)}</div></article>` : ""}
    ${model.trim() ? `<article><strong>謄文區 - 範文</strong><div>${escapePrintHtml(model)}</div></article>` : ""}
  </section>`;
}

function feedbackPrintHtml(feedback) {
  if (!feedback) return `<section class="print-feedback-empty"><h2>Edmund Sir 寫作評語</h2><p>這篇文章尚未有可匯出的評語。</p></section>`;
  const fragments = feedback.fragments.map((fragment, index) => `
    <article class="print-feedback-pair">
      <section class="print-feedback-band is-original">
        <span>原句 ${index + 1}</span>
        ${feedbackPrintRichHtml(fragment.originalFragment, fragment.originalFormatting, { emptyText: "未填寫" })}
      </section>
      <section class="print-feedback-band is-comment">
        <span>Edmund 評語</span>
        ${feedbackPrintRichHtml(fragment.edmundComment, fragment.commentFormatting, { structured: true, emptyText: "未填寫" })}
      </section>
      <section class="print-feedback-band is-suggestion">
        <span>建議寫法</span>
        ${feedbackPrintRichHtml(fragment.suggestedWriting, fragment.suggestionFormatting, { emptyText: "尚未提供建議寫法。" })}
      </section>
    </article>`).join("");
  const improvedVersion = feedbackPrintTextSection(
    "保留原意改良版",
    feedback.improvedVersion,
    "print-improved-version"
  );
  return `<section class="print-feedback">
    <header class="print-feedback-head">
      <p>EDMUND SIR FEEDBACK</p><h2>Edmund Sir 寫作評語</h2>
      <div>${feedback.isAdminPreview
        ? "目前編輯器預覽（可能尚未儲存）"
        : feedback.status === "published" ? "已發佈" : "管理員草稿"}${feedback.updatedAt ? ` · 更新：${escapePrintHtml(formatSubmissionDate(feedback.updatedAt))}` : ""}</div>
    </header>
    ${feedbackPrintTextSection("整體評語", feedback.overallComment, "print-overall-comment")}
    ${fragments ? `<div class="print-feedback-pairs">${fragments}</div>` : ""}
    ${feedbackPrintTextSection("最後評語", feedback.finalComment, "print-final-comment")}
    ${feedbackPrintLearningCards("文法評語站", feedback.grammarPoints)}
    ${improvedVersion}
    ${feedbackPrintTranscriptions(feedback)}
    ${feedbackPrintEnhancementCards("句子結構提升區", feedback.sentenceStructureParts, "sentence")}
    ${feedbackPrintSentenceLinks(feedback.sentenceStructureLinks)}
    ${feedbackPrintEnhancementCards("修辭技巧提升區", feedback.rhetoricalParts, "rhetorical")}
    ${feedbackPrintEnhancementCards("動詞片語 (Phrasal Verb) 提升區", feedback.phrasalVerbParts, "phrasal")}
    ${feedbackPrintEnhancementCards("Writing - Common Expression 提升區", feedback.writingCommonExpressionParts, "writingExpression")}
    ${feedbackPrintEnhancementCards("修辭 Common Expression 提升區", feedback.rhetoricalCommonExpressionParts, "rhetoricalExpression")}
  </section>`;
}

function writingExportHtml(bundles, { failedCount = 0, role = "student" } = {}) {
  const generatedAt = new Intl.DateTimeFormat("zh-HK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Hong_Kong"
  }).format(new Date());
  const admin = role === "admin";
  const baseHref = new URL(".", window.location.href).href;
  const articles = bundles.map(({ submission, feedback }, index) => `
    <article class="composition">
      <a class="export-header" href="https://edmundeducation.com/index.html" aria-label="返回 EdmundEducation 網站首頁">
        <span class="brand">EdmundEducation</span>
        <img class="elearning" src="https://edmundeducation.com/E-Learning.png" alt="E-Learning">
      </a>
      <header class="article-head">
        <p class="sequence">WRITING SUBMISSION ${index + 1} / ${bundles.length}</p>
        <h1>${escapePrintHtml(admin && submission.studentName ? `${submission.studentName}－寫作文章` : `我的文章 ${index + 1}`)}</h1>
        <div class="meta">
          ${admin && submission.studentName ? `<span>${escapePrintHtml(`學生：${submission.studentName}`)}</span>` : ""}
          <span>${escapePrintHtml(formatSubmissionDate(submission.submittedAt))}</span>
          <span>${escapePrintHtml(`${submission.wordCount} words`)}</span>
          <span>${escapePrintHtml(`寫作用時：${formatCompactDuration(submission.durationSeconds)}`)}</span>
          ${admin && submission.deletedAt ? "<span>學生已從個人文章列表刪除</span>" : ""}
        </div>
      </header>
      <section class="topic"><strong>寫作題目</strong><p>${escapePrintHtml(submission.topic)}</p></section>
      <section class="answer"><strong>學生原文</strong><div>${escapePrintHtml(submission.answer || "（文章內容為空）")}</div></section>
      ${feedbackPrintHtml(feedback)}
    </article>`).join("");
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${escapePrintHtml(baseHref)}">
<title>EdmundEducation－寫作文章與評語</title>
<style>
  :root{color-scheme:light}*{box-sizing:border-box}html,body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  body{margin:0;color:#242342;background:#ececf2;font-family:Georgia,"Times New Roman","Noto Serif TC",serif}
  .print-toolbar{position:sticky;top:0;z-index:5;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;background:#272757;font-family:system-ui,sans-serif}
  .print-toolbar p{margin:0;font-size:13px}.print-toolbar button{border:0;border-radius:999px;padding:10px 16px;color:#272757;background:#fff;cursor:pointer;font-weight:800}
  main{width:min(940px,calc(100% - 28px));margin:26px auto}.composition{margin:0 0 28px;padding:38px 42px;background:#fff;box-shadow:0 12px 38px rgba(20,20,50,.12);break-after:page;page-break-after:always}
  .export-header{margin:0 0 24px;padding:15px 18px;border:1px solid rgba(47,128,237,.14);border-radius:18px;display:flex;align-items:center;justify-content:center;gap:34px;color:#050505;background:#f7faff;text-decoration:none;break-inside:avoid;page-break-inside:avoid}.export-header .brand{font-size:27px;letter-spacing:.1em;font-weight:500}.export-header .elearning{width:auto;height:36px;object-fit:contain}
  .composition:last-child{break-after:auto;page-break-after:auto}.article-head{padding-bottom:14px;border-bottom:2px solid #e6e5ef}.sequence{margin:0 0 8px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.13em}
  h1{margin:0 0 14px;font-size:27px;line-height:1.35}h2,h3,.print-card-title{break-after:avoid;page-break-after:avoid}.meta{display:flex;flex-wrap:wrap;gap:7px 14px;color:#66637c;font:12px system-ui,sans-serif}
  .topic,.answer{margin-top:22px}.topic{border-left:5px solid #e87b2c;padding:14px 18px;background:#fff6e8;break-inside:avoid;page-break-inside:avoid}.topic strong,.answer>strong{display:block;margin-bottom:8px;color:#bd571b;font:800 11px system-ui,sans-serif;letter-spacing:.08em}
  .topic p{margin:0;font-size:15px;line-height:1.65;white-space:pre-wrap}.answer>div{font-size:16px;line-height:1.78;white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3}
  .print-feedback,.print-feedback-empty{margin-top:30px}.print-feedback-head{margin-bottom:18px;border-radius:16px;padding:18px 20px;color:#fff;background:#272757;break-inside:avoid;page-break-inside:avoid}.print-feedback-head p{margin:0;color:#f6b263;font:800 10px system-ui,sans-serif;letter-spacing:.14em}.print-feedback-head h2{margin:4px 0 6px;font-size:22px}.print-feedback-head div{color:#deddf0;font:12px system-ui,sans-serif}
  .print-feedback-empty{border:1px dashed #b9b7ca;border-radius:14px;padding:18px;color:#66637c;background:#fafafd;break-inside:avoid;page-break-inside:avoid}.print-feedback-empty h2{margin:0 0 7px;font-size:20px}.print-feedback-empty p{margin:0}
  .print-feedback-text,.print-feedback-section,.print-sentence-panel{margin-top:18px}.print-feedback-text{border:1px solid #e4dfef;border-radius:14px;padding:16px 18px;background:#fffdf9;break-inside:avoid;page-break-inside:avoid}.print-feedback-text h3,.print-feedback-section>h3{margin:0 0 10px;color:#272757;font:850 17px system-ui,sans-serif}.print-feedback-text>div{font-size:15px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
  .print-feedback-pairs,.print-learning-list,.print-enhancement-list{display:grid;gap:14px;margin-top:18px}.print-feedback-pair{overflow:hidden;border:1px solid #deddea;border-radius:15px;break-inside:avoid;page-break-inside:avoid}.print-feedback-band{margin:0;padding:13px 16px}.print-feedback-band>span,.print-enhancement-band>span{display:block;margin-bottom:6px;font:850 11px system-ui,sans-serif;letter-spacing:.03em}.print-feedback-band.is-original{background:#f5f6fa}.print-feedback-band.is-original>span{color:#52516d}.print-feedback-band.is-comment{border-top:1px solid #e8d3bb;background:#fff6e8}.print-feedback-band.is-comment>span{color:#a95416}.print-feedback-band.is-suggestion{border-top:1px solid #d4e7d6;background:#f1fbf3}.print-feedback-band.is-suggestion>span{color:#21703a}
  .print-rich-content{font-size:15px;line-height:1.68;white-space:pre-wrap;overflow-wrap:anywhere}.print-rich-content.is-empty{color:#827f94;font-style:italic}.print-rich-content p{margin:0}.print-rich-content p+p{margin-top:8px}.feedback-numbered-card{display:grid;grid-template-columns:32px 1fr;gap:9px;align-items:start;margin-top:8px;break-inside:avoid;page-break-inside:avoid}.feedback-number-badge{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:#fff;background:#184d78;font:850 12px system-ui,sans-serif}.feedback-numbered-body{min-height:30px;border-left:3px solid #dc7a18;padding:5px 9px;background:#fff1d2}
  .print-learning-card{border:1px solid #d8e1f1;border-radius:13px;padding:14px 16px;background:#f5f8ff;break-inside:avoid;page-break-inside:avoid}.print-learning-card>strong{display:block;margin-bottom:7px;color:#304794;font:850 12px system-ui,sans-serif}
  .print-enhancement-card{overflow:hidden;border:1px solid #d9dceb;border-radius:15px;background:#fff;break-inside:avoid;page-break-inside:avoid}.print-card-title{display:block;padding:11px 15px;color:#fff;background:#304794;font:850 13px system-ui,sans-serif}.is-rhetorical .print-card-title{background:#7a3c78}.is-phrasal-verb .print-card-title{background:#276848}.is-writing-common-expression .print-card-title{background:#28617d}.is-rhetorical-common-expression .print-card-title{background:#98631d}.print-enhancement-band{margin:0;padding:12px 15px}.print-enhancement-band.is-original{background:#f7f7fa}.print-enhancement-band.is-original>span{color:#55536d}.print-enhancement-band.is-enhancement{border-top:1px solid #d7e7da;background:#f1fbf3}.print-enhancement-band.is-enhancement>span{color:#21703a}.print-enhancement-band.is-benefit{border-top:1px solid #eadbbc;background:#fff8e8}.print-enhancement-band.is-benefit>span{color:#9d5b16}
  .print-sentence-panel{overflow:hidden;border:1px solid #d9dceb;border-radius:15px;background:#f7f8ff;break-inside:avoid;page-break-inside:avoid}.print-sentence-panel>header{padding:13px 15px;display:flex;justify-content:space-between;gap:12px;color:#272757;background:#e9edff;font:12px system-ui,sans-serif}.print-sentence-panel>header strong{font-weight:850}.print-sentence-link-list{display:grid;gap:7px;padding:12px}.print-sentence-link-row{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:center;border:1px solid #e0e2ed;border-radius:10px;padding:8px 10px;background:#fff;break-inside:avoid;page-break-inside:avoid}.print-sentence-link-row>span{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;color:#fff;background:#304794;font:800 11px system-ui,sans-serif}.print-sentence-link-row a{color:#145c91;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px;font:750 12px/1.45 system-ui,sans-serif}
  .print-transcriptions article{margin-top:10px;border:1px solid #dfe0ea;border-radius:13px;padding:14px 16px;break-inside:avoid;page-break-inside:avoid}.print-transcriptions article>strong{display:block;margin-bottom:8px;color:#304794;font:850 12px system-ui,sans-serif}.print-transcriptions article>div{font-size:15px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}.print-improved-version{border-color:#cfe4d3;background:#f2fbf3}
  mark{border-radius:.2em;padding:.03em .08em;color:inherit;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}mark[data-highlight="yellow"]{background:#fff1a8}mark[data-highlight="orange"]{background:#ffd3a1}mark[data-highlight="blue"]{background:#cfe6ff}mark[data-highlight="green"]{background:#d5f2d5}mark[data-highlight="red"]{background:#ffc7c7}em{font-style:italic}s{text-decoration:line-through}strong{font-weight:800}
  @media(max-width:600px){.composition{padding:27px 22px}.export-header{gap:16px}.export-header .brand{font-size:20px}.export-header .elearning{height:30px}h1{font-size:22px}.print-sentence-panel>header{display:grid}}
  @media print{@page{size:A4;margin:10mm 9mm}.print-toolbar{display:none!important}body{background:#fff}main{width:auto;margin:0}.composition{margin:0;padding:0;box-shadow:none}}
</style></head><body>
<div class="print-toolbar"><p>已準備 ${bundles.length} 篇文章及評語${failedCount ? `；${failedCount} 篇未能載入` : ""} · ${escapePrintHtml(generatedAt)}</p><button type="button" id="print-compositions">列印／儲存為 PDF</button></div>
<main>${articles}</main></body></html>`;
}

async function exportSubmissionBundles(ids, role) {
  if (!["student", "admin"].includes(role) || state.user?.role !== role || state.exportInFlight) return;
  const admin = role === "admin";
  const source = admin ? state.adminSubmissions : state.submissions;
  const availableIds = new Set(source.map(item => item.id));
  if (admin && UUID_RE.test(state.selectedAdminSubmissionId)) {
    availableIds.add(state.selectedAdminSubmissionId);
  }
  const requestedIds = [...new Set(ids.map(id => String(id || "")))]
    .filter(id => UUID_RE.test(id) && availableIds.has(id));
  if (!requestedIds.length) {
    showToast(admin ? "未能找到這篇管理員文章。" : "請先選擇最少一篇文章。", "error");
    return;
  }
  const adminFeedbackPreviews = new Map();
  if (admin) {
    try {
      for (const id of requestedIds) {
        const editor = elements.adminDetail?.querySelector("[data-feedback-editor]");
        if (editor?.dataset.feedbackEditor !== id) continue;
        adminFeedbackPreviews.set(id, {
          ...(state.selectedAdminFeedback || {}),
          ...readAdminFeedbackEditor(editor, { allowEmpty: true }),
          submissionId: id,
          status: state.selectedAdminFeedback?.status === "published" ? "published" : "draft",
          isAdminPreview: true
        });
      }
    } catch (error) {
      showToast(error.message || "目前的評語內容未能匯出。", "error");
      return;
    }
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("瀏覽器已封鎖匯出視窗；請允許彈出式視窗後再試。", "error");
    return;
  }
  try { printWindow.opener = null; } catch { /* Some browsers make opener read-only. */ }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html lang=\"zh-Hant\"><meta charset=\"utf-8\"><title>正在準備文章與評語</title><body style=\"font-family:system-ui;padding:32px\">正在安全載入文章與評語……</body></html>");
  printWindow.document.close();
  state.exportInFlight = true;
  syncSubmissionExportControls();
  try {
    const results = await mapWithConcurrency(
      requestedIds,
      id => fetchSubmissionExportBundle(id, role),
      4
    );
    const bundles = results.filter(result => result.status === "fulfilled").map(result => {
      const bundle = result.value;
      const preview = adminFeedbackPreviews.get(bundle.submission.id);
      return preview ? { ...bundle, feedback: preview } : bundle;
    });
    const failedCount = results.length - bundles.length;
    if (!bundles.length) throw new Error("未能載入所選文章與評語。");
    if (!admin) {
      const publishedFeedbackIds = new Set(bundles
        .filter(bundle => bundle.feedback?.status === "published")
        .map(bundle => bundle.submission.id));
      if (publishedFeedbackIds.size) {
        state.submissions = state.submissions.map(submission => (
          publishedFeedbackIds.has(submission.id)
            ? { ...submission, hasPublishedFeedback: true, feedbackUnread: false }
            : submission
        ));
        renderSubmissionList();
      }
    }
    if (printWindow.closed) throw new Error("匯出視窗已關閉。");
    printWindow.document.open();
    printWindow.document.write(writingExportHtml(bundles, { failedCount, role }));
    printWindow.document.close();
    const printButton = printWindow.document.querySelector("#print-compositions");
    printButton?.addEventListener("click", () => printWindow.print());
    const autoPrint = () => window.setTimeout(() => {
      try { printWindow.focus(); printWindow.print(); } catch { /* The visible print button remains available. */ }
    }, 350);
    if (printWindow.document.readyState === "complete") autoPrint();
    else printWindow.addEventListener("load", autoPrint, { once: true });
    showToast(failedCount
      ? `已準備 ${bundles.length} 篇文章與評語；${failedCount} 篇暫時未能載入。`
      : `已準備 ${bundles.length} 篇文章與評語供列印或儲存 PDF。`, failedCount ? "error" : "success");
  } catch (error) {
    console.warn("Writing submission export failed", error);
    if (!printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:32px"><h1>暫時未能匯出文章與評語</h1><p>${escapePrintHtml(error.message || "請稍後再試。")}</p></body>`);
      printWindow.document.close();
    }
    showToast(error.message || "暫時未能匯出文章與評語。", "error");
  } finally {
    state.exportInFlight = false;
    syncSubmissionExportControls();
  }
}

function exportStudentSubmissions(ids) {
  return exportSubmissionBundles(ids, "student");
}

function exportAdminSubmission(id) {
  return exportSubmissionBundles([id], "admin");
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
  state.directPaste = false;
  state.directPasteWordCount = 0;
  resetProofreadState();
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
  await loadModelEssayReference({ force: true });
  renderSelectedTopicPreview();
  updateEditorMetrics();
  syncProofreadStatus();
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
  if (admin) {
    const exportButton = createElement("button", "export-submission-button", "匯出文章與評語");
    exportButton.type = "button";
    exportButton.dataset.exportAdminSubmission = submission.id;
    actions.append(exportButton);
    if (!submission.deletedAt) {
      const copyButton = createElement("button", "copy-submission-notice-button", "複製已改好通知");
      copyButton.type = "button";
      copyButton.dataset.copySubmissionNotice = submission.id;
      actions.append(copyButton);
    }
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

function normalizeFeedbackEnhancementCopies(value) {
  const output = [];
  const seen = new Set();
  for (const item of Array.isArray(value) ? value : []) {
    const sectionKey = String(item?.sectionKey || item?.section_key || "");
    const itemPosition = Number(item?.itemPosition ?? item?.item_position ?? 0);
    if (
      !FEEDBACK_ENHANCEMENT_BY_SECTION_KEY[sectionKey]
      || !Number.isSafeInteger(itemPosition)
      || itemPosition < 1
      || itemPosition > 100
    ) continue;
    const identity = `${sectionKey}:${itemPosition}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    output.push({
      sectionKey,
      itemPosition,
      text: String(item?.text || item?.copyText || item?.copy_text || ""),
      version: Math.max(0, Number(item?.version || 0)),
      updatedAt: String(item?.updatedAt || item?.updated_at || "")
    });
  }
  return output;
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
  const sentenceStructureMethods = normalizeSentenceStructureMethods(
    value.sentenceStructureMethods || value.sentence_structure_methods
  );
  const sentenceStructureParts = normalizeFeedbackEnhancementParts(
    value.sentenceStructureParts || value.sentence_structure_parts
  );
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
    sentenceStructureMethods,
    sentenceStructureParts: sentenceStructureParts.length
      ? sentenceStructureParts
      : normalizeFeedbackEnhancementParts(sentenceStructureMethods),
    rhetoricalParts: normalizeFeedbackEnhancementParts(
      value.rhetoricalParts || value.rhetorical_parts
    ),
    phrasalVerbParts: normalizeFeedbackEnhancementParts(
      value.phrasalVerbParts || value.phrasal_verb_parts
    ),
    writingCommonExpressionParts: normalizeFeedbackEnhancementParts(
      value.writingCommonExpressionParts || value.writing_common_expression_parts
    ),
    rhetoricalCommonExpressionParts: normalizeFeedbackEnhancementParts(
      value.rhetoricalCommonExpressionParts || value.rhetorical_common_expression_parts
    ),
    enhancementCopies: normalizeFeedbackEnhancementCopies(
      value.enhancementCopies || value.enhancement_copies
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

  const improvedVersion = feedbackTextSection(
    "保留原意改良版",
    feedback.improvedVersion,
    "teacher-feedback-improved teacher-feedback-transcription-improved"
  );
  if (improvedVersion) section.append(improvedVersion);

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

function renderStudentSentenceExercisePanel(value) {
  const links = normalizeFeedbackSentencePickerLinks(value);
  if (!links.length) return null;
  const panel = createElement(
    "section",
    "teacher-feedback-sentence-picker teacher-feedback-sentence-picker-readonly"
  );
  panel.setAttribute("aria-label", "已加入的句子結構練習");
  const head = createElement("div", "teacher-feedback-sentence-picker-head");
  head.append(
    createElement("strong", "", "選擇 Sentence Structure 練習"),
    createElement(
      "span",
      "teacher-feedback-sentence-selected-label",
      `已加入的句子結構練習（${links.length}）`
    )
  );
  const list = createElement("div", "teacher-feedback-sentence-selected");
  links.forEach((link, index) => {
    const row = createElement("div", "teacher-feedback-sentence-chip teacher-feedback-sentence-readonly-row");
    const position = createElement("span", "teacher-feedback-sentence-position", String(index + 1));
    position.setAttribute("aria-hidden", "true");
    const anchor = createElement("a", "", link.label || `句子結構練習 ${index + 1}`);
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.title = link.label || `句子結構練習 ${index + 1}`;
    row.append(position, anchor);
    list.append(row);
  });
  panel.append(head, list);
  return panel;
}

function feedbackEnhancementCopy(feedback, kind, itemPosition) {
  const sectionKey = feedbackEnhancementKindCopy(kind).sectionKey;
  return feedback?.enhancementCopies?.find(item => (
    item.sectionKey === sectionKey && item.itemPosition === itemPosition
  )) || { sectionKey, itemPosition, text: "", version: 0, updatedAt: "" };
}

function renderEnhancementCopyArea(feedback, kind, itemPosition) {
  if (!feedback?.submissionId) return null;
  const copy = feedbackEnhancementKindCopy(kind);
  const saved = feedbackEnhancementCopy(feedback, kind, itemPosition);
  const section = createElement(
    "div",
    "teacher-feedback-suggestion-copy teacher-feedback-enhancement-copy"
  );
  section.dataset.enhancementCopyKind = copy.sectionKey;
  section.dataset.enhancementCopyPosition = String(itemPosition);
  const field = createElement("label");
  field.append(createElement("span", "", copy.copyTitle));
  const textarea = document.createElement("textarea");
  textarea.rows = 5;
  textarea.maxLength = 20000;
  textarea.value = saved.text;
  textarea.dataset.enhancementCopyText = "true";
  textarea.placeholder = `在這裡抄寫${copy.singular}的改良內容，完成後按儲存。`;
  field.append(textarea);
  const actions = createElement("div", "teacher-feedback-suggestion-copy-actions");
  const status = createElement("p", "form-status", "");
  status.dataset.enhancementCopyStatus = "true";
  status.setAttribute("role", "status");
  const save = createElement("button", "small-button", "儲存抄寫");
  save.type = "button";
  save.dataset.enhancementCopySave = "true";
  actions.append(status, save);
  section.append(field, actions);
  return section;
}

function renderStudentFeedbackEnhancementArea(
  title,
  itemsValue,
  { kind = "sentence", links = [], feedback = null } = {}
) {
  const parts = normalizeFeedbackEnhancementParts(itemsValue);
  const sentenceLinks = kind === "sentence" ? normalizeFeedbackSentencePickerLinks(links) : [];
  if (!parts.length && !sentenceLinks.length) return null;
  const kindCopy = feedbackEnhancementKindCopy(kind);
  const section = createElement(
    "section",
    `teacher-feedback-enhancement-read ${kindCopy.className}`
  );
  section.append(createElement("h3", "", title));
  if (parts.length) {
    const list = createElement("div", "teacher-feedback-enhancement-read-list");
    const fields = [
      ["originalSentence", "Original Sentence 原句", "is-original"],
      ["enhancement", "Enhancement 改良寫法", "is-enhancement"],
      ["benefit", "Benefit 好處／作用", "is-benefit"]
    ];
    parts.forEach((part, index) => {
      const card = createElement("article", "teacher-feedback-enhancement-card");
      card.append(createElement(
        "strong",
        "teacher-feedback-enhancement-card-title",
        `${kindCopy.singular} ${index + 1}`
      ));
      fields.forEach(([field, label, className]) => {
        const band = createElement("section", `teacher-feedback-enhancement-band ${className}`);
        band.append(createElement("span", "", label));
        const content = createElement("div", "teacher-feedback-rich-content");
        appendStructuredFeedbackRichText(
          content,
          part[field]?.text,
          part[field]?.formatting,
          { emptyText: "未填寫" }
        );
        if (!part[field]?.text) content.classList.add("is-empty");
        band.append(content);
        card.append(band);
      });
      const copyArea = renderEnhancementCopyArea(feedback, kind, index + 1);
      if (copyArea) card.append(copyArea);
      list.append(card);
    });
    section.append(list);
  }
  const exercisePanel = renderStudentSentenceExercisePanel(sentenceLinks);
  if (exercisePanel) section.append(exercisePanel);
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
  const grammarArea = renderStudentFeedbackLearningArea("文法評語站", feedback.grammarPoints);
  if (grammarArea) panel.append(grammarArea);
  // Students copy the improved/model versions before moving into the more
  // detailed sentence, rhetoric and expression enhancement sections.
  panel.append(renderStudentTranscriptions(feedback));
  const sentenceArea = renderStudentFeedbackEnhancementArea(
    "句子結構提升區",
    feedback.sentenceStructureParts,
    { kind: "sentence", links: feedback.sentenceStructureLinks, feedback }
  );
  if (sentenceArea) panel.append(sentenceArea);
  const rhetoricalArea = renderStudentFeedbackEnhancementArea(
    "修辭技巧提升區",
    feedback.rhetoricalParts,
    { kind: "rhetorical", feedback }
  );
  if (rhetoricalArea) panel.append(rhetoricalArea);
  for (const kind of ["phrasal", "writingExpression", "rhetoricalExpression"]) {
    const copy = feedbackEnhancementKindCopy(kind);
    const area = renderStudentFeedbackEnhancementArea(
      copy.title,
      feedback[copy.dataKey],
      { kind, feedback }
    );
    if (area) panel.append(area);
  }
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
  commentBand.append(comment, createFeedbackStructuredLivePreview(comment));

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
  row.append(head, editor, createFeedbackStructuredLivePreview(editor));
  return row;
}

function feedbackEnhancementKindCopy(kind) {
  return FEEDBACK_ENHANCEMENT_KINDS[kind] || FEEDBACK_ENHANCEMENT_KINDS.sentence;
}

function createFeedbackEnhancementRow(kind, index, value = {}) {
  const copy = feedbackEnhancementKindCopy(kind);
  const row = createElement(
    "article",
    `teacher-feedback-learning-row teacher-feedback-enhancement-row ${copy.className}`
  );
  row.dataset.feedbackLearningRow = kind;
  const head = createElement("div", "teacher-feedback-learning-row-head");
  const label = createElement("strong", "", `${copy.singular} ${index + 1}`);
  label.dataset.feedbackLearningLabel = "true";
  const remove = createElement("button", "teacher-feedback-clear", "清除此項");
  remove.type = "button";
  remove.dataset.feedbackLearningRemove = "true";
  head.append(label, remove);
  row.append(head);
  const fields = [
    ["originalSentence", "Original Sentence 原句", "original"],
    ["enhancement", "Enhancement 改良寫法", "enhancement"],
    ["benefit", "Benefit 好處／作用", "benefit"]
  ];
  const grid = createElement("div", "teacher-feedback-enhancement-fields");
  fields.forEach(([field, fieldLabel, datasetSuffix]) => {
    const wrapper = createElement("section", `teacher-feedback-enhancement-field is-${datasetSuffix}`);
    wrapper.append(createElement("span", "", fieldLabel));
    const editor = createFeedbackRichEditor({
      label: `${copy.singular} ${index + 1}：${fieldLabel}`,
      value: value[field]?.text || "",
      formatting: value[field]?.formatting,
      maxLength: 20000,
      datasetName: `${kind}-${datasetSuffix}`
    });
    wrapper.append(editor, createFeedbackStructuredLivePreview(editor));
    grid.append(wrapper);
  });
  row.append(grid);
  return row;
}

function renumberFeedbackLearningRows(list, kind) {
  const grammar = kind === "grammar";
  const copy = feedbackEnhancementKindCopy(kind);
  list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).forEach((row, index) => {
    const title = `${grammar ? "文法重點" : copy.singular} ${index + 1}`;
    const label = row.querySelector("[data-feedback-learning-label]");
    if (label) label.textContent = title;
    if (grammar) {
      row.querySelector("[data-feedback-rich-editor]")?.setAttribute("aria-label", title);
      return;
    }
    const names = {
      original: "Original Sentence 原句",
      enhancement: "Enhancement 改良寫法",
      benefit: "Benefit 好處／作用"
    };
    Object.entries(names).forEach(([field, fieldLabel]) => {
      row.querySelector(`[data-feedback-rich-editor="${kind}-${field}"]`)
        ?.setAttribute("aria-label", `${title}：${fieldLabel}`);
    });
  });
}

function appendFeedbackLearningRows(list, kind, count, values = []) {
  const start = list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).length;
  const maximum = 100;
  const amount = Math.min(Math.max(0, Number(count) || 0), Math.max(0, maximum - start));
  for (let offset = 0; offset < amount; offset += 1) {
    const value = values[start + offset] || {};
    list.append(kind === "grammar"
      ? createFeedbackLearningRow(kind, start + offset, value)
      : createFeedbackEnhancementRow(kind, start + offset, value));
  }
  renumberFeedbackLearningRows(list, kind);
}

function feedbackSentencePickerLinks(picker) {
  if (!picker) return [];
  const links = [];
  const seen = new Set();
  for (const item of picker.querySelectorAll("[data-feedback-sentence-selected-item]")) {
    const url = normalizeSentenceStructureDeepLink(item.dataset.feedbackSentenceUrl);
    if (!url || seen.has(url)) continue;
    const label = String(item.dataset.feedbackSentenceLabel || "").replace(/\s+/gu, " ").trim();
    seen.add(url);
    links.push({
      label: label.slice(0, 200) || `句子結構練習 ${links.length + 1}`,
      url
    });
  }
  return links;
}

function normalizeFeedbackSentencePickerLinks(value) {
  const links = [];
  const seen = new Set();
  for (const item of Array.isArray(value) ? value : []) {
    const url = normalizeSentenceStructureDeepLink(item?.url);
    if (!url || seen.has(url)) continue;
    const label = String(item?.label || "").replace(/\s+/gu, " ").trim();
    seen.add(url);
    links.push({
      label: label.slice(0, 200) || `句子結構練習 ${links.length + 1}`,
      url
    });
  }
  return links.slice(0, MAX_FEEDBACK_SENTENCE_LINKS);
}

function syncFeedbackSentencePickerSelectedOrder(picker) {
  const list = picker?.querySelector("[data-feedback-sentence-selected]");
  const label = picker?.querySelector("[data-feedback-sentence-selected-label]");
  if (!list || !label) return;
  const rows = [...list.querySelectorAll("[data-feedback-sentence-selected-item]")];
  label.textContent = rows.length
    ? `已加入的句子結構練習（${rows.length}）`
    : "已加入的句子結構練習";
  rows.forEach((row, index) => {
    row.dataset.feedbackSentencePosition = String(index + 1);
    row.setAttribute("aria-label", `第 ${index + 1} 項：${row.dataset.feedbackSentenceLabel || "句子結構練習"}`);
    const position = row.querySelector("[data-feedback-sentence-position]");
    if (position) position.textContent = String(index + 1);
    const up = row.querySelector('[data-feedback-sentence-move="up"]');
    const down = row.querySelector('[data-feedback-sentence-move="down"]');
    if (up) {
      up.disabled = index === 0;
      up.setAttribute("aria-label", `將第 ${index + 1} 項向上移`);
    }
    if (down) {
      down.disabled = index === rows.length - 1;
      down.setAttribute("aria-label", `將第 ${index + 1} 項向下移`);
    }
  });
}

function moveFeedbackSentencePickerItem(item, direction) {
  const picker = item?.closest("[data-feedback-sentence-picker]");
  if (!picker || !item) return;
  if (direction === "up") {
    const previous = item.previousElementSibling;
    if (previous?.matches("[data-feedback-sentence-selected-item]")) previous.before(item);
  } else if (direction === "down") {
    const next = item.nextElementSibling;
    if (next?.matches("[data-feedback-sentence-selected-item]")) next.after(item);
  }
  syncFeedbackSentencePickerSelectedOrder(picker);
  item.querySelector(`[data-feedback-sentence-move="${direction}"]`)?.focus();
}

function renderFeedbackSentencePickerSelected(picker, value) {
  const list = picker?.querySelector("[data-feedback-sentence-selected]");
  const label = picker?.querySelector("[data-feedback-sentence-selected-label]");
  if (!list || !label) return;
  const links = normalizeFeedbackSentencePickerLinks(value);
  label.textContent = links.length
    ? `已加入的句子結構練習（${links.length}）`
    : "已加入的句子結構練習";
  list.replaceChildren();
  if (!links.length) {
    list.append(createElement("p", "teacher-feedback-sentence-empty", "尚未選擇練習。可直接從下方清單加入。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  links.forEach((link, index) => {
    const row = createElement("div", "teacher-feedback-sentence-chip");
    row.dataset.feedbackSentenceSelectedItem = "true";
    row.dataset.feedbackSentenceUrl = link.url;
    row.dataset.feedbackSentenceLabel = link.label;
    row.draggable = true;
    row.setAttribute("aria-grabbed", "false");
    const drag = createElement("span", "teacher-feedback-sentence-drag", "⋮⋮");
    drag.title = "拖曳改變次序";
    drag.setAttribute("aria-hidden", "true");
    const position = createElement("span", "teacher-feedback-sentence-position", String(index + 1));
    position.dataset.feedbackSentencePosition = "true";
    position.setAttribute("aria-hidden", "true");
    const anchor = createElement("a", "", `↗ ${link.label}`);
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.title = link.label;
    const controls = createElement("div", "teacher-feedback-sentence-order-controls");
    const up = createElement("button", "teacher-feedback-sentence-move", "↑");
    up.type = "button";
    up.dataset.feedbackSentenceMove = "up";
    up.title = "向上移";
    const down = createElement("button", "teacher-feedback-sentence-move", "↓");
    down.type = "button";
    down.dataset.feedbackSentenceMove = "down";
    down.title = "向下移";
    const remove = createElement("button", "teacher-feedback-sentence-remove", "×");
    remove.type = "button";
    remove.dataset.feedbackSentenceRemove = "true";
    remove.setAttribute("aria-label", `移除 ${link.label} 連結`);
    controls.append(up, down, remove);
    row.append(drag, position, anchor, controls);
    row.addEventListener("dragstart", (event) => {
      state.feedbackDraggedSentenceLink = row;
      row.classList.add("is-dragging");
      row.setAttribute("aria-grabbed", "true");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", row.dataset.feedbackSentenceUrl || "");
      }
    });
    row.addEventListener("dragover", (event) => {
      const dragged = state.feedbackDraggedSentenceLink;
      if (!dragged || dragged === row || dragged.parentElement !== row.parentElement) return;
      event.preventDefault();
      const bounds = row.getBoundingClientRect();
      const insertAfter = event.clientY >= bounds.top + bounds.height / 2;
      if (insertAfter) row.after(dragged);
      else row.before(dragged);
      syncFeedbackSentencePickerSelectedOrder(picker);
    });
    row.addEventListener("drop", (event) => {
      if (!state.feedbackDraggedSentenceLink) return;
      event.preventDefault();
      syncFeedbackSentencePickerSelectedOrder(picker);
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("is-dragging");
      row.setAttribute("aria-grabbed", "false");
      state.feedbackDraggedSentenceLink = null;
      syncFeedbackSentencePickerSelectedOrder(picker);
    });
    fragment.append(row);
  });
  list.append(fragment);
  syncFeedbackSentencePickerSelectedOrder(picker);
}

function renderFeedbackSentencePickerResults(picker) {
  if (!picker) return;
  const results = picker.querySelector("[data-feedback-sentence-results]");
  const count = picker.querySelector("[data-feedback-sentence-count]");
  const search = picker.querySelector("[data-feedback-sentence-search]");
  if (!results || !count || !search) return;
  if (!state.homeworkResourceCatalog) {
    count.textContent = "正在載入練習清單…";
    results.replaceChildren(createElement(
      "p",
      "teacher-feedback-sentence-count",
      "正在準備 345 項 Sentence Structure 練習。"
    ));
    return;
  }
  const result = filterHomeworkResources(
    state.homeworkResourceCatalog,
    "sentence-structure",
    search.value,
    60
  );
  count.textContent = result.total > result.items.length
    ? `找到 ${result.total} 項；請輸入關鍵字縮窄結果（目前顯示首 ${result.items.length} 項）。`
    : `找到 ${result.total} 項練習。`;
  results.replaceChildren();
  if (!result.items.length) {
    results.append(createElement("p", "teacher-feedback-sentence-count", "找不到相符練習。"));
    return;
  }
  const selectedUrls = new Set(feedbackSentencePickerLinks(picker).map(link => link.url));
  const fragment = document.createDocumentFragment();
  result.items.forEach((resource) => {
    const button = createElement("button", "teacher-feedback-sentence-result");
    button.type = "button";
    button.dataset.feedbackSentenceResourceId = resource.id;
    button.setAttribute("role", "option");
    const url = normalizeSentenceStructureDeepLink(resource.url);
    const selected = Boolean(url && selectedUrls.has(url));
    button.disabled = selected;
    button.setAttribute("aria-selected", selected ? "true" : "false");
    if (selected) button.classList.add("is-selected");
    button.append(
      createElement("strong", "", resource.label),
      createElement("small", "", resource.detail || "Sentence Structure 練習")
    );
    if (selected) button.append(createElement("span", "teacher-feedback-sentence-added", "已加入"));
    fragment.append(button);
  });
  results.append(fragment);
}

async function initializeFeedbackSentencePicker(picker, { retry = false } = {}) {
  if (!picker) return;
  const count = picker.querySelector("[data-feedback-sentence-count]");
  const results = picker.querySelector("[data-feedback-sentence-results]");
  renderFeedbackSentencePickerResults(picker);
  try {
    if (retry) state.homeworkResourceCatalogPromise = null;
    await loadHomeworkResourceCatalog();
    if (picker.isConnected) renderFeedbackSentencePickerResults(picker);
  } catch (error) {
    console.warn("Sentence Structure catalogue failed to load", error);
    if (!picker.isConnected || !count || !results) return;
    count.textContent = "未能載入練習清單，請稍後再試。";
    const retryButton = createElement("button", "secondary-button teacher-feedback-sentence-retry", "重新載入練習清單");
    retryButton.type = "button";
    retryButton.dataset.feedbackSentenceRetry = "true";
    results.replaceChildren(retryButton);
  }
}

function createFeedbackSentencePicker(links = []) {
  const picker = createElement("section", "teacher-feedback-sentence-picker");
  picker.dataset.feedbackSentencePicker = "true";
  picker.setAttribute("aria-label", "選擇 Sentence Structure 練習");
  const head = createElement("div", "teacher-feedback-sentence-picker-head");
  head.append(createElement("strong", "", "選擇 Sentence Structure 練習"));
  const search = document.createElement("input");
  search.className = "teacher-feedback-sentence-search";
  search.dataset.feedbackSentenceSearch = "true";
  search.type = "search";
  search.autocomplete = "off";
  search.placeholder = "搜尋題目、年份或卡組…";
  search.setAttribute("aria-label", "搜尋 Sentence Structure 練習");
  const count = createElement("span", "teacher-feedback-sentence-count");
  count.dataset.feedbackSentenceCount = "true";
  count.setAttribute("role", "status");
  count.setAttribute("aria-live", "polite");
  const results = createElement("div", "teacher-feedback-sentence-results");
  results.dataset.feedbackSentenceResults = "true";
  results.setAttribute("role", "listbox");
  const selectedLabel = createElement("span", "teacher-feedback-sentence-selected-label", "已加入的句子結構練習");
  selectedLabel.dataset.feedbackSentenceSelectedLabel = "true";
  const selected = createElement("div", "teacher-feedback-sentence-selected");
  selected.dataset.feedbackSentenceSelected = "true";
  selected.setAttribute("aria-label", "已加入的句子結構練習");
  picker.append(head, selectedLabel, selected, search, count, results);
  renderFeedbackSentencePickerSelected(picker, links);
  queueMicrotask(() => initializeFeedbackSentencePicker(picker));
  return picker;
}

function addFeedbackSentencePickerLink(picker, resourceId) {
  if (!picker || !state.homeworkResourceCatalog) return;
  const resource = state.homeworkResourceCatalog.find(item => (
    item?.type === "sentence-structure" && item.id === resourceId
  ));
  const url = normalizeSentenceStructureDeepLink(resource?.url);
  if (!url) return;
  const links = feedbackSentencePickerLinks(picker);
  if (links.some(link => link.url === url)) return;
  if (links.length >= MAX_FEEDBACK_SENTENCE_LINKS) {
    showToast(`每份評語最多可加入 ${MAX_FEEDBACK_SENTENCE_LINKS} 個句子結構練習。`, "error");
    return;
  }
  links.push({
    label: String(resource.label || "").replace(/\s+/gu, " ").trim().slice(0, 200) || `句子結構練習 ${links.length + 1}`,
    url
  });
  renderFeedbackSentencePickerSelected(picker, links);
  renderFeedbackSentencePickerResults(picker);
  picker.querySelector("[data-feedback-sentence-search]")?.focus();
}

function renderFeedbackLearningEditor({ kind, title, description, values = [], links = [] }) {
  const grammar = kind === "grammar";
  const kindClass = grammar ? "" : ` ${feedbackEnhancementKindCopy(kind).className}`;
  const section = createElement(
    "section",
    `teacher-feedback-learning-editor${kindClass}`
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
  if (kind === "sentence") {
    section.append(createFeedbackSentencePicker(links));
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
    createElement("p", "", "每組依次顯示原句、Edmund 評語及建議寫法。可選取文字使用粗體、斜體、刪除線或五色螢光筆；未填評語的預備原句不會送出。")
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
  panel.append(renderFeedbackLearningEditor({
    kind: "grammar",
    title: "文法評語站",
    description: "每個欄位是一個獨立文法重點；最少預留 10 個，可逐次增加 10 個。數字清單可用 Shift + Enter 留空行後退出編號格式。",
    values: feedback?.grammarPoints || []
  }));
  panel.append(feedbackTextarea(
    "保留原意改良版",
    feedback?.improvedVersion || "",
    "feedbackImproved",
    { rows: 12, maxLength: 100000 }
  ));
  panel.append(renderFeedbackLearningEditor({
    kind: "sentence",
    title: "句子結構提升區",
    description: "每項分開記錄 Original Sentence 原句、Enhancement 改良寫法及 Benefit 好處／作用，並可從最下方選擇指定課堂連結。",
    values: feedback?.sentenceStructureParts || [],
    links: feedback?.sentenceStructureLinks || []
  }));
  panel.append(renderFeedbackLearningEditor({
    kind: "rhetorical",
    title: "修辭技巧提升區",
    description: "在文法與句子結構之後，分開記錄 Original Sentence 原句、Enhancement 改良寫法及 Benefit 好處／作用。",
    values: feedback?.rhetoricalParts || []
  }));
  for (const kind of ["phrasal", "writingExpression", "rhetoricalExpression"]) {
    const kindCopy = feedbackEnhancementKindCopy(kind);
    panel.append(renderFeedbackLearningEditor({
      kind,
      title: kindCopy.title,
      description: "每項分開記錄 Original Sentence 原句、Enhancement 改良寫法及 Benefit 好處／作用。",
      values: feedback?.[kindCopy.dataKey] || []
    }));
  }
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

function readAdminFeedbackEditor(editor, { allowEmpty = false } = {}) {
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
  const readEnhancementParts = kind => normalizeFeedbackEnhancementParts(
    [...editor.querySelectorAll(`[data-feedback-learning-row="${kind}"]`)]
      .map(row => ({
        originalSentence: readFeedbackRichEditor(
          row.querySelector(`[data-feedback-rich-editor="${kind}-original"]`)
        ),
        enhancement: readFeedbackRichEditor(
          row.querySelector(`[data-feedback-rich-editor="${kind}-enhancement"]`)
        ),
        benefit: readFeedbackRichEditor(
          row.querySelector(`[data-feedback-rich-editor="${kind}-benefit"]`)
        )
      }))
  );
  const sentenceStructureParts = readEnhancementParts("sentence");
  const rhetoricalParts = readEnhancementParts("rhetorical");
  const phrasalVerbParts = readEnhancementParts("phrasal");
  const writingCommonExpressionParts = readEnhancementParts("writingExpression");
  const rhetoricalCommonExpressionParts = readEnhancementParts("rhetoricalExpression");
  const sentenceStructureMethods = normalizeSentenceStructureMethods(
    sentenceStructureParts.map(part => part.enhancement)
  );
  const sentenceStructureLinks = feedbackSentencePickerLinks(
    editor.querySelector("[data-feedback-sentence-picker]")
  );
  if (
    !allowEmpty
    &&
    !overallComment && !finalComment && !improvedVersion && !fragments.length
    && !grammarPoints.length && !sentenceStructureParts.length && !rhetoricalParts.length
    && !phrasalVerbParts.length && !writingCommonExpressionParts.length
    && !rhetoricalCommonExpressionParts.length
    && !sentenceStructureLinks.length
  ) {
    throw new Error("請先填寫至少一項評語內容。");
  }
  return {
    overallComment,
    finalComment,
    improvedVersion,
    grammarPoints,
    sentenceStructureMethods,
    sentenceStructureParts,
    rhetoricalParts,
    phrasalVerbParts,
    writingCommonExpressionParts,
    rhetoricalCommonExpressionParts,
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

async function saveEnhancementCopy(section) {
  if (!section || state.user?.role !== "student") return;
  const feedback = state.selectedStudentFeedback;
  const sectionKey = String(section.dataset.enhancementCopyKind || "");
  const itemPosition = Number(section.dataset.enhancementCopyPosition || 0);
  const kind = FEEDBACK_ENHANCEMENT_BY_SECTION_KEY[sectionKey];
  if (
    !feedback
    || !UUID_RE.test(feedback.submissionId)
    || !kind
    || !Number.isSafeInteger(itemPosition)
    || itemPosition < 1
    || itemPosition > 100
  ) return;
  const current = feedbackEnhancementCopy(feedback, kind.kind, itemPosition);
  const textarea = section.querySelector("[data-enhancement-copy-text]");
  const button = section.querySelector("[data-enhancement-copy-save]");
  const status = section.querySelector("[data-enhancement-copy-status]");
  if (button) button.disabled = true;
  setStatus(status, "正在儲存抄寫內容……");
  try {
    const payload = await apiJson(
      `/v1/submissions/${encodeURIComponent(feedback.submissionId)}/feedback/enhancements/${encodeURIComponent(sectionKey)}/${itemPosition}/copy`,
      {
        method: "PUT",
        body: JSON.stringify({
          text: textarea?.value || "",
          expectedVersion: current.version
        })
      }
    );
    const saved = payload?.enhancementCopy || payload?.enhancement_copy;
    const version = Number(saved?.version || 0);
    if (!Number.isSafeInteger(version) || version < 1) throw new Error("抄寫服務回應無效。");
    const normalized = {
      sectionKey,
      itemPosition,
      text: String(saved?.text || ""),
      version,
      updatedAt: String(saved?.updatedAt || saved?.updated_at || "")
    };
    feedback.enhancementCopies = [
      ...feedback.enhancementCopies.filter(item => !(
        item.sectionKey === sectionKey && item.itemPosition === itemPosition
      )),
      normalized
    ];
    setStatus(status, "抄寫內容已儲存。", "success");
    showToast(`${kind.copyTitle}已儲存。`, "success");
  } catch (error) {
    setStatus(
      status,
      error?.code === "ENHANCEMENT_COPY_VERSION_CONFLICT"
        ? "內容已在另一個視窗更新，或老師已修改這一項；請重新開啟文章後再儲存。"
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
  const requestBody = JSON.stringify({
    ...payload,
    status,
    expectedFeedbackId,
    expectedVersion
  });
  if (new TextEncoder().encode(requestBody).byteLength > MAX_FEEDBACK_BODY_BYTES) {
    setStatus(statusNode, "整份評語內容超出安全儲存上限；請縮短部分內容後再試。", "error");
    return;
  }
  editor.querySelectorAll("[data-feedback-save], [data-feedback-delete]").forEach(button => { button.disabled = true; });
  setStatus(statusNode, status === "published" ? "正在發送評語給學生……" : "正在儲存評語草稿……");
  try {
    const response = await apiJson(`/v1/admin/submissions/${encodeURIComponent(submissionId)}/feedback`, {
      method: "PUT",
      body: requestBody
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

  if (entryLink.type === "manual-topic") {
    try {
      await loadWritingTopicCatalog();
      const resource = canonicalWritingTopicResource(`manual:${entryLink.manualTopicId}`);
      if (!resource) throw new Error("這項手動創作題目不存在，或已被管理員移除。");
      const storedDraft = readDraft();
      const archivedPreviousDraft = await archiveStoredDraftBeforeEntryLink(storedDraft);
      startNewDraft({ preserveView: true });
      selectWritingTopic(resource.id, { persist: true, close: false, toast: false });
      showView("workspace");
      showToast(
        archivedPreviousDraft
          ? "舊草稿已儲存至「我的文章」；現已載入指定創作題目。"
          : "已載入功課指定的創作題目。",
        "success"
      );
    } catch (error) {
      state.entryLinkHandled = false;
      await restoreDraft();
      showView("workspace");
      showToast(error.message || "暫時未能載入指定創作題目。", "error");
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
  if (!isWritingProofreadingReady(state.proofreadingGate)) {
    throw new Error("請先完成五分鐘校對時間，再正式提交文章。");
  }
  const topic = elements.topicInput.value.trim();
  const answer = elements.writingInput.value.trim();
  if (!topic || !answer) throw new Error("請先輸入寫作題目及文章內容。");
  accrueWritingTime();
  await enforceProofreadSubmissionChecks();
  await ensureDirectPasteSubmissionDuration();
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

function initializeAdminManualTopicSlots() {
  if (!elements.adminManualTopicSlots || elements.adminManualTopicSlots.children.length) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 10; index += 1) {
    const label = createElement("label", "admin-manual-topic-slot");
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 300;
    input.autocomplete = "off";
    input.dataset.adminManualTopicTitle = String(index + 1);
    input.placeholder = `題目 ${index + 1} 名稱`;
    input.setAttribute("aria-label", `手動創作題目 ${index + 1} 名稱`);
    label.append(input);
    fragment.append(label);
  }
  elements.adminManualTopicSlots.append(fragment);
}

function normalizeAdminManualTopic(value) {
  const resource = manualWritingTopicResource(value);
  if (!resource) return null;
  return {
    id: resource.manualTopicId,
    title: resource.label,
    prompt: resource.questionPrompt[0],
    flashcardUrl: String(value?.flashcardUrl || ""),
    writingPracticeUrl: String(value?.writingPracticeUrl || ""),
    modelEssayUrl: String(value?.modelEssayUrl || ""),
    wordList: String(value?.wordList || ""),
    createdAt: value?.createdAt ? String(value.createdAt) : "",
    updatedAt: value?.updatedAt ? String(value.updatedAt) : ""
  };
}

function adminManualTopicField(labelText, value, key, { textarea = false, placeholder = "" } = {}) {
  const label = document.createElement("label");
  label.append(createElement("span", "", labelText));
  const input = textarea ? document.createElement("textarea") : document.createElement("input");
  if (!textarea) input.type = "text";
  input.value = value;
  input.placeholder = placeholder;
  input.dataset.adminManualTopicField = key;
  input.maxLength = key === "title" ? 300 : 4000;
  label.append(input);
  return label;
}

function renderAdminManualTopics() {
  if (!elements.adminManualTopicList) return;
  elements.adminManualTopicCount.textContent = String(state.adminManualTopics.length);
  elements.adminManualTopicList.replaceChildren();
  if (!state.adminManualTopics.length) {
    elements.adminManualTopicList.append(emptyState("尚未建立手動創作題目。"));
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const topic of state.adminManualTopics) {
    const details = createElement("details", "admin-manual-topic-card");
    details.dataset.adminManualTopicId = topic.id;
    const summary = document.createElement("summary");
    summary.append(
      createElement("strong", "", topic.title),
      createElement("small", "", topic.updatedAt ? `最後更新：${formatSubmissionDate(topic.updatedAt)}` : "手動創作題目"),
      createElement("span", "", "Details 詳情")
    );
    const form = createElement("div", "admin-manual-topic-detail");
    form.append(
      adminManualTopicField("題目標題", topic.title, "title"),
      adminManualTopicField("完整寫作題目", topic.prompt, "prompt", { textarea: true })
    );
    const grid = createElement("div", "admin-manual-topic-detail-grid");
    grid.append(
      adminManualTopicField("Flash Card Link", topic.flashcardUrl, "flashcardUrl", { placeholder: "https://edmundeducation.com/flashcards.html?deck=…" }),
      adminManualTopicField("Writing Practice Link", topic.writingPracticeUrl, "writingPracticeUrl", { placeholder: "https://edmundeducation.com/writing-practice.html?exercise=…" }),
      adminManualTopicField("Model Essay Link", topic.modelEssayUrl, "modelEssayUrl", { placeholder: "https://edmundeducation.com/model-essay-downloads.html?…" }),
      adminManualTopicField("Vocabulary / List of Words", topic.wordList, "wordList", { textarea: true })
    );
    const actions = createElement("div", "admin-manual-topic-detail-actions");
    const remove = createElement("button", "secondary-button admin-manual-topic-delete", "永久刪除");
    remove.type = "button";
    remove.dataset.adminManualTopicDelete = topic.id;
    const save = createElement("button", "primary-button", "儲存修改");
    save.type = "button";
    save.dataset.adminManualTopicSave = topic.id;
    actions.append(remove, save);
    form.append(grid, actions);
    details.append(summary, form);
    fragment.append(details);
  }
  elements.adminManualTopicList.append(fragment);
}

async function loadAdminManualTopics() {
  initializeAdminManualTopicSlots();
  if (!elements.adminManualTopicList) return;
  elements.adminManualTopicList.replaceChildren(loadingState("正在載入手動創作題目……"));
  try {
    const payload = await apiJson("/v1/admin/manual-topics");
    state.adminManualTopics = (Array.isArray(payload?.topics) ? payload.topics : [])
      .map(normalizeAdminManualTopic)
      .filter(Boolean);
    renderAdminManualTopics();
  } catch (error) {
    elements.adminManualTopicList.replaceChildren(emptyState(error.message || "未能載入手動創作題目。"));
    throw error;
  }
}

function setAdminManualTopicBusy(busy) {
  state.adminManualTopicsBusy = busy;
  if (elements.adminManualTopicCreate) elements.adminManualTopicCreate.disabled = busy;
  elements.adminManualTopicList?.querySelectorAll("button,input,textarea").forEach((element) => { element.disabled = busy; });
}

async function createAdminManualTopics() {
  if (state.adminManualTopicsBusy) return;
  const inputs = [...elements.adminManualTopicSlots.querySelectorAll("[data-admin-manual-topic-title]")];
  const titles = inputs.map((input) => input.value.trim()).filter(Boolean);
  if (!titles.length) {
    setStatus(elements.adminManualTopicStatus, "請先輸入至少一個題目名稱。", "error");
    return;
  }
  setAdminManualTopicBusy(true);
  setStatus(elements.adminManualTopicStatus, "正在建立題目及安全連結……");
  try {
    await apiJson("/v1/admin/manual-topics", { method: "POST", body: JSON.stringify({ titles }) });
    inputs.forEach((input) => { input.value = ""; });
    setStatus(elements.adminManualTopicStatus, `已建立 ${titles.length} 個題目及 Homework Hyperlink。`, "success");
    await loadAdminManualTopics();
    showToast("手動創作題目已加入學生題目目錄。", "success");
  } catch (error) {
    setStatus(elements.adminManualTopicStatus, error.message || "未能建立手動創作題目。", "error");
  } finally {
    setAdminManualTopicBusy(false);
  }
}

function adminManualTopicPayload(details) {
  const value = (key) => String(details.querySelector(`[data-admin-manual-topic-field="${key}"]`)?.value || "").trim();
  return {
    title: value("title"), prompt: value("prompt"), flashcardUrl: value("flashcardUrl"),
    writingPracticeUrl: value("writingPracticeUrl"), modelEssayUrl: value("modelEssayUrl"), wordList: value("wordList")
  };
}

async function saveAdminManualTopic(id) {
  if (state.adminManualTopicsBusy || !UUID_RE.test(id)) return;
  const details = elements.adminManualTopicList.querySelector(`[data-admin-manual-topic-id="${id}"]`);
  if (!details) return;
  const payload = adminManualTopicPayload(details);
  if (!payload.title || !payload.prompt) {
    showToast("題目標題及完整寫作題目不可留空。", "error");
    return;
  }
  setAdminManualTopicBusy(true);
  try {
    await apiJson(`/v1/admin/manual-topics/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
    await loadAdminManualTopics();
    showToast("題目詳情及參考連結已更新。", "success");
  } catch (error) {
    showToast(error.message || "未能更新手動創作題目。", "error");
  } finally {
    setAdminManualTopicBusy(false);
  }
}

async function deleteAdminManualTopic(id) {
  if (state.adminManualTopicsBusy || !UUID_RE.test(id)) return;
  const topic = state.adminManualTopics.find((item) => item.id === id);
  if (!window.confirm(`確定要永久刪除「${topic?.title || "這個題目"}」嗎？Homework 舊連結會變成不可使用。`)) return;
  setAdminManualTopicBusy(true);
  try {
    await apiJson(`/v1/admin/manual-topics/${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadAdminManualTopics();
    showToast("手動創作題目已永久刪除。", "success");
  } catch (error) {
    showToast(error.message || "未能刪除手動創作題目。", "error");
  } finally {
    setAdminManualTopicBusy(false);
  }
}

async function openAdminDashboard() {
  showView("admin");
  elements.adminStudentList.replaceChildren(loadingState("正在載入學生帳戶……"));
  const [payload] = await Promise.all([apiJson("/v1/admin/students"), loadAdminManualTopics()]);
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
  elements.adminManualTopicCreate?.addEventListener("click", () => createAdminManualTopics().catch(handleViewError));
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
  if (elements.modelEssayToggle) {
    elements.modelEssayToggle.addEventListener("click", async () => {
      await loadModelEssayReference({ force: true });
      if (!state.modelEssayParagraphs.length) {
        showToast("此題目尚未設定可供參考的 Model Essay 段落。", "error");
        return;
      }
      state.modelEssayOverlayVisible = !state.modelEssayOverlayVisible;
      syncModelEssayOverlay();
      syncModelEssayControls();
      persistDraft();
      syncProofreadStatus();
    });
  }
  elements.removeWritingTopic?.addEventListener("click", removeSelectedWritingTopic);
  if (elements.modelEssayParagraphDialogOpen) {
    elements.modelEssayParagraphDialogOpen.addEventListener("click", async () => {
      await loadModelEssayReference({ force: true });
      if (!state.modelEssayParagraphs.length) {
        showToast("此題目尚未設定可參考段落。", "error");
        return;
      }
      renderModelEssayParagraphDialog();
      safeDialogOpen(elements.modelEssayDialog);
    });
  }
  if (elements.modelEssayDialogClose) {
    elements.modelEssayDialogClose.addEventListener("click", () => safeDialogClose(elements.modelEssayDialog));
  }
  if (elements.modelEssayDialogApply) {
    elements.modelEssayDialogApply.addEventListener("click", () => {
      applyModelEssaySelectionFromDialog();
      syncProofreadStatus();
      persistDraft();
      safeDialogClose(elements.modelEssayDialog);
    });
  }
  if (elements.modelEssaySelectAll) {
    elements.modelEssaySelectAll.addEventListener("change", (event) => {
      setAllModelEssayParagraphSelection(event.target.checked);
      persistDraft();
    });
  }
  if (elements.directPasteDialogConfirm) {
    elements.directPasteDialogConfirm.addEventListener("click", () => {
      const total = normalizeDialogMinutesSeconds(
        elements.directPasteDialogMinutes?.value,
        elements.directPasteDialogSeconds?.value
      );
      if (!Number.isFinite(total) || total <= 0) {
        if (elements.directPasteDialogStatus) {
          elements.directPasteDialogStatus.textContent = "請輸入大於 0 分鐘，或至少 1 秒。";
        }
        return;
      }
      const resolver = state.directPastePromptResolver;
      if (resolver) resolver(total);
    });
  }
  if (elements.directPasteDialogCancel) {
    elements.directPasteDialogCancel.addEventListener("click", () => {
      const resolver = state.directPastePromptResolver;
      if (resolver) resolver(null);
    });
  }
  if (elements.directPasteDialog) {
    elements.directPasteDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      const resolver = state.directPastePromptResolver;
      if (resolver) resolver(null);
      safeDialogClose(elements.directPasteDialog);
    });
  }
  if (elements.proofreadWarningYes) {
    elements.proofreadWarningYes.addEventListener("click", () => {
      const resolver = state.proofreadWarningResolver;
      if (resolver) resolver(true);
    });
  }
  if (elements.proofreadWarningNo) {
    elements.proofreadWarningNo.addEventListener("click", () => {
      const resolver = state.proofreadWarningResolver;
      if (resolver) resolver(false);
    });
  }
  if (elements.proofreadWarningDialog) {
    elements.proofreadWarningDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      const resolver = state.proofreadWarningResolver;
      if (resolver) resolver(false);
      safeDialogClose(elements.proofreadWarningDialog);
    });
  }
  if (elements.proofreadIssuesClose) {
    elements.proofreadIssuesClose.addEventListener("click", () => {
      const resolver = state.proofreadDetailsResolver;
      if (resolver) resolver(false);
    });
  }
  if (elements.proofreadIssuesCorrect) {
    elements.proofreadIssuesCorrect.addEventListener("click", () => {
      const resolver = state.proofreadDetailsResolver;
      if (resolver) resolver(false);
    });
  }
  if (elements.proofreadIssuesSubmit) {
    elements.proofreadIssuesSubmit.addEventListener("click", () => {
      const resolver = state.proofreadDetailsResolver;
      if (resolver) resolver(true);
    });
  }
  if (elements.proofreadIssuesDialog) {
    elements.proofreadIssuesDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      const resolver = state.proofreadDetailsResolver;
      if (resolver) resolver(false);
      safeDialogClose(elements.proofreadIssuesDialog);
    });
  }
  if (elements.modelEssayDialog) {
    elements.modelEssayDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      safeDialogClose(elements.modelEssayDialog);
    });
  }

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
  elements.floatingTopicToggle?.addEventListener("click", () => {
    setFloatingWritingTopicExpanded(
      elements.floatingTopicToggle.getAttribute("aria-expanded") !== "true"
    );
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
  elements.writingInput.addEventListener("paste", handleWritingPaste);
  elements.writingInput.addEventListener("scroll", syncModelEssayOverlayScroll);
  elements.writingInput.addEventListener("focus", resumeWritingClockForEditor);
  elements.writingInput.addEventListener("pointerdown", resumeWritingClockForEditor);
  elements.writingInput.addEventListener("blur", () => pauseWritingClockOutsideEditor());
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
    if (state.feedbackApplyingFormat || state.feedbackMultiSelectPending) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return;
    const editor = selection.anchorNode?.parentElement?.closest?.("[data-feedback-rich-editor]")
      || (selection.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode.closest?.("[data-feedback-rich-editor]")
        : null);
    if (!editor || !editor.contains(selection.focusNode)) return;
    rememberFeedbackSelection(editor, [selection.getRangeAt(0)]);
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.("[data-feedback-format]")) {
      event.preventDefault();
      return;
    }
    const editor = event.target.closest?.("[data-feedback-rich-editor]");
    if (!editor) {
      clearFeedbackSelectionRanges();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && state.activeFeedbackRichEditor === editor) {
      state.feedbackMultiSelectPending = {
        editor,
        ranges: cloneFeedbackRanges(state.feedbackSelectionRanges)
      };
    } else {
      state.feedbackMultiSelectPending = null;
      clearFeedbackSelectionRanges({ keepEditor: true });
      state.activeFeedbackRichEditor = editor;
    }
  });
  document.addEventListener("pointerup", () => {
    const pending = state.feedbackMultiSelectPending;
    if (!pending) return;
    state.feedbackMultiSelectPending = null;
    const range = currentFeedbackSelection(pending.editor);
    rememberFeedbackSelection(pending.editor, [...pending.ranges, ...(range ? [range] : [])]);
  });
  document.addEventListener("scroll", scheduleFeedbackMultiSelectionHighlight, { capture: true, passive: true });
  window.addEventListener("resize", scheduleFeedbackMultiSelectionHighlight, { passive: true });
  window.addEventListener("resize", scheduleFloatingWritingTopicSync, { passive: true });
  window.addEventListener("scroll", scheduleFloatingWritingTopicSync, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape"
      && !document.querySelector("dialog[open]")
      && elements.floatingTopicToggle?.getAttribute("aria-expanded") === "true"
    ) {
      setFloatingWritingTopicExpanded(false);
      elements.floatingTopicToggle.focus({ preventScroll: true });
    }
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
    const enhancementCopySave = event.target.closest("[data-enhancement-copy-save]");
    if (enhancementCopySave) {
      return saveEnhancementCopy(
        enhancementCopySave.closest("[data-enhancement-copy-kind]")
      ).catch(handleViewError);
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
      if (list) {
        const maximum = 100;
        const before = list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).length;
        appendFeedbackLearningRows(list, kind, 10);
        const after = list.querySelectorAll(`[data-feedback-learning-row="${kind}"]`).length;
        if (after < before + 10) showToast(`每份評語最多可建立 ${maximum} 項。`, "error");
      }
      return;
    }
    const sentenceResource = event.target.closest("[data-feedback-sentence-resource-id]");
    if (sentenceResource) {
      addFeedbackSentencePickerLink(
        sentenceResource.closest("[data-feedback-sentence-picker]"),
        sentenceResource.dataset.feedbackSentenceResourceId
      );
      return;
    }
    const moveSentenceLink = event.target.closest("[data-feedback-sentence-move]");
    if (moveSentenceLink) {
      moveFeedbackSentencePickerItem(
        moveSentenceLink.closest("[data-feedback-sentence-selected-item]"),
        moveSentenceLink.dataset.feedbackSentenceMove
      );
      return;
    }
    const removeSentenceLink = event.target.closest("[data-feedback-sentence-remove]");
    if (removeSentenceLink) {
      const picker = removeSentenceLink.closest("[data-feedback-sentence-picker]");
      const item = removeSentenceLink.closest("[data-feedback-sentence-selected-item]");
      item?.remove();
      if (picker) {
        renderFeedbackSentencePickerSelected(picker, feedbackSentencePickerLinks(picker));
        renderFeedbackSentencePickerResults(picker);
      }
      return;
    }
    const retrySentencePicker = event.target.closest("[data-feedback-sentence-retry]");
    if (retrySentencePicker) {
      initializeFeedbackSentencePicker(
        retrySentencePicker.closest("[data-feedback-sentence-picker]"),
        { retry: true }
      );
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
    const exportAdminSubmissionButton = event.target.closest("[data-export-admin-submission]");
    if (exportAdminSubmissionButton) {
      return exportAdminSubmission(exportAdminSubmissionButton.dataset.exportAdminSubmission);
    }
    const exportSubmission = event.target.closest("[data-export-submission]");
    if (exportSubmission) return exportStudentSubmissions([exportSubmission.dataset.exportSubmission]);
    const writingTopic = event.target.closest("[data-select-writing-topic]");
    if (writingTopic) return selectWritingTopic(writingTopic.dataset.selectWritingTopic);
    const saveManualTopic = event.target.closest("[data-admin-manual-topic-save]");
    if (saveManualTopic) return saveAdminManualTopic(saveManualTopic.dataset.adminManualTopicSave).catch(handleViewError);
    const deleteManualTopic = event.target.closest("[data-admin-manual-topic-delete]");
    if (deleteManualTopic) return deleteAdminManualTopic(deleteManualTopic.dataset.adminManualTopicDelete).catch(handleViewError);
    const randomTopic = event.target.closest("[data-random-topic-category]");
    if (randomTopic) return assignRandomWritingTopic(randomTopic.dataset.randomTopicCategory).catch(handleViewError);
    if (event.target.closest("[data-remove-topic-preview]")) {
      removeSelectedWritingTopic();
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
    const sentenceSearch = event.target.closest("[data-feedback-sentence-search]");
    if (sentenceSearch) {
      renderFeedbackSentencePickerResults(sentenceSearch.closest("[data-feedback-sentence-picker]"));
      return;
    }
    const feedbackTextarea = event.target.closest("[data-feedback-editor] textarea");
    if (feedbackTextarea) autosizeTextarea(feedbackTextarea, feedbackTextarea.hasAttribute("data-feedback-comment") ? 130 : 72);
  });
  window.addEventListener("pagehide", () => {
    pauseWritingClockOutsideEditor({ allowHiddenTransition: true });
    persistDraft();
    if (state.pendingOccurrences.size) {
      flushGrammarOccurrences({ keepalive: true }).catch(() => {});
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      pauseWritingClockOutsideEditor({ allowHiddenTransition: true });
    } else {
      accrueWritingTime();
    }
    state.writingClockLastAt = Date.now();
    if (document.visibilityState === "visible") {
      tickWritingTimer();
      syncWritingStopwatchUi();
      syncWritingProofreadingUi();
    }
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
  initializeAdminManualTopicSlots();
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
