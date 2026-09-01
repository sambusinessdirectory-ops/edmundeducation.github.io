import {
  SCHEDULE_MAX_DATE,
  SCHEDULE_MIN_DATE,
  WEEKDAY_LABELS,
  addDays,
  defaultWeekStart,
  firstWeekStart,
  formatDayDate,
  formatWeekRange,
  hongKongDayKey,
  isDateInScheduleRange,
  lastWeekStart,
  parseISODate,
  toISODate,
  weekDates
} from "./schedule-calendar.mjs";
import {
  moveQuoteHistoryDay,
  quoteHistoryState
} from "./schedule-quotes.mjs?v=20260820-1";
import {
  COUNTDOWN_BATCH_SIZE,
  COUNTDOWN_INITIAL_CAPACITY,
  COUNTDOWN_MAX_CAPACITY,
  countdownBreakdownFromHongKongNow,
  formatEstimatedMinutes,
  isAdjacentSpanTarget,
  planCountdownCapacityChange,
  spanBounds,
  spanLaneLayout,
  studyHoursFromHongKongNow
} from "./schedule-enhancements.mjs?v=20260810-3";
import {
  buildScheduleWeekUrl,
  scheduleWeekShareMessage,
  scheduleWeekStartFromUrl
} from "./schedule-share.mjs?v=20260810-1";
import {
  HOMEWORK_ENTRY_TAGS,
  HOMEWORK_RESOURCE_TYPES,
  MAX_HOMEWORK_RESOURCES,
  SCHEDULE_MESSAGE_MAX_LENGTH,
  acceptHomeworkAutocomplete,
  filterHomeworkResources,
  fullHomeworkTriggerAtCursor,
  homeworkAutocomplete,
  homeworkResourceDisplayTitle,
  insertHomeworkResourceTitle,
  normalizeHomeworkHref,
  normalizeHomeworkResource,
  parseScheduleMessage,
  serializeScheduleMessage
} from "./schedule-homework-links.mjs?v=20260901-reading-comprehension1";
import {
  ScheduleGroupShiftError,
  planScheduleGroupShift
} from "./schedule-mass-edit.mjs?v=20260803-1";
import {
  ScheduleClipboardError,
  createScheduleClipboardPayload,
  parseScheduleClipboard,
  planScheduleClipboardPaste,
  serializeScheduleClipboard
} from "./schedule-clipboard.mjs?v=20260727-1";
import {
  MOTIVATION_SAVE_DELAY_MS,
  motivationRatingsByDate,
  normalizeMotivationRating
} from "./schedule-motivation.mjs?v=20260812-1";
import {
  SELF_EVALUATION_DEFINITIONS,
  WELLBEING_METRIC_KEYS,
  WELLBEING_SAVE_DELAY_MS,
  normalizeLearningPurposePayload,
  normalizeRatingCollapsePreferences,
  normalizeWellbeingMetric,
  selfEvaluationDefinition,
  shouldLimitHomeworkSlots,
  wellbeingRatingsByMetricAndDate
} from "./schedule-wellbeing.mjs?v=20260820-gradient-labels1";
import {
  learningDaySummary,
  normalizePurposeFontSize
} from "./schedule-learning-experience.mjs?v=20260821-shared-pomodoro1";

const ADMIN_NAME = "Sam Admind Schedule";
const SESSION_KEY = "edmund-schedule-session-v1";
const MOTIVATION_PENDING_STORAGE_KEY = "edmund-schedule-motivation-pending-v1";
const MOTIVATION_HIDDEN_STORAGE_PREFIX = "edmund-schedule-motivation-hidden-v1";
const WELLBEING_PENDING_STORAGE_KEY = "edmund-schedule-wellbeing-pending-v1";
const TABLE_HIDDEN_KEY = "edmund-schedule-table-hidden-v1";
const COUNTDOWN_COLLAPSED_KEY = "edmund-schedule-countdown-collapsed-v1";
const SCHEDULE_CLIPBOARD_SESSION_KEY = "edmund-schedule-clipboard-v1";
const SCHEDULE_CLIPBOARD_MIME = "application/x-edmund-schedule-slots+json";
const MAX_SLOTS_PER_DAY = 100;
const MIN_COUNTDOWNS = COUNTDOWN_INITIAL_CAPACITY;
const MAX_COUNTDOWNS = COUNTDOWN_MAX_CAPACITY;
const COUNTDOWN_STEP = COUNTDOWN_BATCH_SIZE;
// 10px grid gap + 10px inner padding on both columns + two 1px column borders.
const SPAN_COLUMN_BRIDGE_PX = 32;
const LONG_PRESS_MS = 2000;
const MARQUEE_START_DISTANCE = 6;
const HOMEWORK_CATALOG_URL = "./homework-resource-catalog.mjs?v=20260901-reading-comprehension1";
const VIDEO_CLASS_HOMEWORK_CATALOG_URL = "https://edmund-video-class.edmundeducation.workers.dev/v1/homework-resources";
const STUDENT_PROGRESS_WORKER_URL = "https://edmund-student-progress.edmundeducation.workers.dev";
const STUDENT_ACCOUNT_PAGE_SIZE = 100;
const STUDENT_AUDIT_PAGE_SIZE = 10;
const STUDENT_ACCESS_SECTIONS = [
  { key: "dse", label: "DSE", group: "考試範疇" },
  { key: "ielts", label: "IELTS", group: "考試範疇" },
  { key: "toeic", label: "TOEIC", group: "考試範疇" },
  { key: "toefl", label: "TOEFL", group: "考試範疇" },
  { key: "sat", label: "SAT", group: "考試範疇" },
  { key: "cre", label: "CRE", group: "考試範疇" },
  { key: "ap-english", label: "AP English 考試", group: "考試範疇" },
  { key: "ib", label: "IB 課程／國際學校", group: "考試範疇" },
  { key: "cambridge", label: "Cambridge IGCSE", group: "考試範疇" },
  { key: "pte", label: "Pearson Test of English (PTE)", group: "考試範疇" },
  { key: "government", label: "政府機構", group: "考試範疇" },
  { key: "student-custom", label: "自製 Flashcards", group: "考試範疇" },
  { key: "custom-setup", label: "客製 Setup", group: "考試範疇" },
  { key: "sentence-structure", label: "句子結構 Sentence Structure", group: "考試範疇" },
  { key: "error-identification", label: "錯句剖析 Error Identification", group: "考試範疇" },
  { key: "business-english", label: "商務英語 Business English", group: "考試範疇" },
  { key: "spelling-exercise", label: "Spelling Exercise 串字練習", group: "考試範疇" },
  { key: "irregular-verbs", label: "Irregular Verbs 不規則動詞", group: "考試範疇" },
  { key: "logic-exercise", label: "Logic Exercise 邏輯訓練", group: "考試範疇" },
  { key: "exam-skills", label: "Exam Skills 考試技巧", group: "考試範疇" },
  { key: "spaced-repetition", label: "間隔重複記憶法 Spaced Repetition", group: "考試範疇" },
  { key: "daily-english", label: "日常英語", group: "學習資源" },
  { key: "conversational-english", label: "對話英語 Conversational English", group: "學習資源" },
  { key: "bookmarks", label: "書簽 My Private Bookmarks", group: "學習資源" },
  { key: "pop-songs", label: "英文流行曲", group: "學習資源" },
  { key: "news-analysis", label: "新聞分析", group: "學習資源" },
  { key: "power-words", label: "Power Words", group: "學習資源" },
  { key: "idioms", label: "Idioms", group: "學習資源" },
  { key: "phrasal-verbs", label: "Phrasal Verbs", group: "學習資源" },
  { key: "synonyms", label: "Synonyms 同義詞", group: "學習資源" },
  { key: "movie-lines", label: "Movie Lines 電影對白分析", group: "學習資源" },
  { key: "speech", label: "Speech 偉人英文演講分析", group: "學習資源" },
  { key: "ted-talk", label: "TED Talk 公開演講分析", group: "學習資源" },
  { key: "poem", label: "Poem 英文詩句分析", group: "學習資源" }
];
const STUDENT_ACCESS_CHILDREN = {
  dse: [
    { key: "dse-reading", label: "Reading" },
    { key: "dse-writing", label: "Writing" },
    { key: "dse-paper3", label: "Paper 3" },
    { key: "dse-speaking", label: "Speaking" }
  ],
  ielts: [
    { key: "ielts-reading", label: "Reading" },
    { key: "ielts-writing", label: "Writing" },
    { key: "ielts-listening", label: "Listening" },
    { key: "ielts-speaking", label: "Speaking" }
  ],
  government: [
    { key: "government-concept-vocabulary", label: "概念詞彙" },
    { key: "government-hkfsd", label: "HKFSD" },
    { key: "government-hkpf", label: "HKPF" },
    { key: "government-csd", label: "CSD" },
    { key: "government-c-and-ed", label: "C&ED" },
    { key: "government-immd", label: "ImmD" }
  ],
  synonyms: [
    { key: "synonyms/noun", label: "Noun" },
    { key: "synonyms/verb", label: "Verb" },
    { key: "synonyms/adjectives", label: "Adjectives" },
    { key: "synonyms/adverbs", label: "Adverbs" }
  ],
  "spaced-repetition": [
    { key: "spaced-repetition-days|3", label: "3 日後重溫" },
    { key: "spaced-repetition-days|7", label: "7 日後重溫" },
    { key: "spaced-repetition-days|14", label: "14 日後重溫" }
  ]
};
const WEEKDAY_MASCOTS = [
  "assets/schedule/weekdays/monday-walking-to-school.webp",
  "assets/schedule/weekdays/tuesday-basketball.webp",
  "assets/schedule/weekdays/wednesday-piano.webp",
  "assets/schedule/weekdays/thursday-reading.webp",
  "assets/schedule/weekdays/friday-pizza.webp",
  "assets/schedule/weekdays/saturday-sleeping.webp",
  "assets/schedule/weekdays/sunday-side-sleeping.webp"
];

const supabaseSettings = window.EDMUND_SUPABASE || {};
const scheduleSettings = window.EDMUND_SCHEDULE_CONFIG || {};
const supabaseClient = window.supabase?.createClient && supabaseSettings.url && supabaseSettings.anonKey
  ? window.supabase.createClient(supabaseSettings.url, supabaseSettings.anonKey)
  : null;

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  connection: document.querySelector("[data-connection-status]"),
  userPill: document.querySelector("[data-user-pill]"),
  changePassword: document.querySelector("[data-change-password]"),
  logout: document.querySelector("[data-logout]"),
  adminStudentsButton: document.querySelector("[data-admin-students]"),
  adminMotivationResults: document.querySelector("[data-admin-motivation-results]"),
  adminReminderEmails: document.querySelector("[data-admin-reminder-emails]"),
  adminEmailContent: document.querySelector("[data-admin-email-content]"),
  adminEmailLog: document.querySelector("[data-admin-email-log]"),
  adminHomeworkHotkeys: document.querySelector("[data-admin-homework-hotkeys]"),
  announcementForm: document.querySelector("[data-announcement-form]"),
  announcementMessage: document.querySelector("[data-announcement-message]"),
  announcementImage: document.querySelector("[data-announcement-image]"),
  announcementImageActionField: document.querySelector("[data-announcement-image-action-field]"),
  announcementImageAction: document.querySelector("[data-announcement-image-action]"),
  announcementActive: document.querySelector("[data-announcement-active]"),
  announcementActiveLabel: document.querySelector("[data-announcement-active-label]"),
  announcementSubmit: document.querySelector("[data-announcement-submit]"),
  announcementCancelEdit: document.querySelector("[data-announcement-cancel-edit]"),
  announcementList: document.querySelector("[data-announcement-list]"),
  announcementStatus: document.querySelector("[data-announcement-status]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  username: document.querySelector("#schedule-username"),
  password: document.querySelector("#schedule-password"),
  studentSearch: document.querySelector("[data-student-search]"),
  studentList: document.querySelector("[data-student-list]"),
  studentCount: document.querySelector("[data-student-count]"),
  adminStatus: document.querySelector("[data-admin-status]"),
  homeworkLinkForm: document.querySelector("[data-homework-link-form]"),
  homeworkLinkStudentA: document.querySelector("[data-homework-link-student-a]"),
  homeworkLinkStudentB: document.querySelector("[data-homework-link-student-b]"),
  homeworkLinkStatus: document.querySelector("[data-homework-link-status]"),
  homeworkLinkList: document.querySelector("[data-homework-link-list]"),
  createStudentForm: document.querySelector("[data-create-student-form]"),
  createStudentStatus: document.querySelector("[data-create-student-status]"),
  createParentForm: document.querySelector("[data-create-parent-form]"),
  createParentStatus: document.querySelector("[data-create-parent-status]"),
  parentList: document.querySelector("[data-parent-list]"),
  parentCount: document.querySelector("[data-parent-count]"),
  parentSearch: document.querySelector("[data-parent-search]"),
  parentStudentSearch: document.querySelector("[data-parent-student-search]"),
  parentAdminStatus: document.querySelector("[data-parent-admin-status]"),
  studentSortButtons: [...document.querySelectorAll("[data-student-sort-mode]")],
  studentStatusFilter: document.querySelector("[data-student-status-filter]"),
  studentProfileDialog: document.querySelector("[data-student-profile-dialog]"),
  studentProfileTitle: document.querySelector("[data-student-profile-title]"),
  studentProfileStatus: document.querySelector("[data-student-profile-status]"),
  studentProfileFacts: document.querySelector("[data-student-profile-facts]"),
  studentAccessGrid: document.querySelector("[data-student-access-grid]"),
  studentAuditList: document.querySelector("[data-student-audit-list]"),
  studentAuditSummary: document.querySelector("[data-student-audit-summary]"),
  studentAuditPrevious: document.querySelector("[data-student-audit-previous]"),
  studentAuditNext: document.querySelector("[data-student-audit-next]"),
  studentProfileActions: document.querySelector("[data-student-profile-actions]"),
  closeStudentProfile: document.querySelector("[data-close-student-profile]"),
  permanentDeleteDialog: document.querySelector("[data-permanent-delete-dialog]"),
  permanentDeleteForm: document.querySelector("[data-permanent-delete-form]"),
  permanentDeleteTarget: document.querySelector("[data-permanent-delete-target]"),
  permanentDeleteImpact: document.querySelector("[data-permanent-delete-impact]"),
  permanentDeleteStatus: document.querySelector("[data-permanent-delete-status]"),
  closePermanentDelete: document.querySelector("[data-close-permanent-delete]"),
  viewingLabel: document.querySelector("[data-viewing-label]"),
  viewingStudent: document.querySelector("[data-viewing-student]"),
  learningDayCounters: document.querySelector("[data-learning-day-counters]"),
  dayStreak: document.querySelector("[data-day-streak]"),
  learningDays: document.querySelector("[data-learning-days]"),
  weekRange: document.querySelector("[data-week-range]"),
  previousWeek: document.querySelector("[data-previous-week]"),
  nextWeek: document.querySelector("[data-next-week]"),
  currentWeek: document.querySelector("[data-current-week]"),
  copyWeekLink: document.querySelector("[data-copy-week-link]"),
  exportPdf: document.querySelector("[data-export-pdf]"),
  toggleTable: document.querySelector("[data-toggle-table]"),
  toggleUnused: document.querySelector("[data-toggle-unused]"),
  toggleMascots: document.querySelector("[data-toggle-mascots]"),
  toggleMotivation: document.querySelector("[data-toggle-motivation]"),
  toggleDailyQuote: document.querySelector("[data-toggle-daily-quote]"),
  toggleEncouragement: document.querySelector("[data-toggle-encouragement]"),
  toggleReminderEmail: document.querySelector("[data-toggle-reminder-email]"),
  dailyQuote: document.querySelector("[data-daily-quote]"),
  quotePrevious: document.querySelector("[data-quote-previous]"),
  quoteNext: document.querySelector("[data-quote-next]"),
  quoteToday: document.querySelector("[data-quote-today]"),
  quoteDate: document.querySelector("[data-quote-date]"),
  quoteEnglish: document.querySelector("[data-quote-english]"),
  quoteEnglishAttribution: document.querySelector("[data-quote-english-attribution]"),
  quoteChinese: document.querySelector("[data-quote-chinese]"),
  quoteChineseAttribution: document.querySelector("[data-quote-chinese-attribution]"),
  weeklyEncouragement: document.querySelector("[data-weekly-encouragement]"),
  encouragementMessage: document.querySelector("[data-encouragement-message]"),
  saveEncouragement: document.querySelector("[data-save-encouragement]"),
  useLastEncouragement: document.querySelector("[data-use-last-encouragement]"),
  encouragementStatus: document.querySelector("[data-encouragement-status]"),
  reminderEmailPanel: document.querySelector("[data-reminder-email]"),
  reminderEmailInput: document.querySelector("[data-reminder-email-input]"),
  updateReminderEmail: document.querySelector("[data-update-reminder-email]"),
  removeReminderEmail: document.querySelector("[data-remove-reminder-email]"),
  reminderEmailStatus: document.querySelector("[data-reminder-email-status]"),
  toggleSelection: document.querySelector("[data-toggle-selection]"),
  selectionActions: document.querySelector("[data-selection-actions]"),
  selectionCount: document.querySelector("[data-selection-count]"),
  batchComplete: document.querySelector("[data-batch-complete]"),
  batchProgress: document.querySelector("[data-batch-progress]"),
  batchMoreThanHalfCompleted: document.querySelector("[data-batch-more-than-half-completed]"),
  batchPreviousIncomplete: document.querySelector("[data-batch-previous-incomplete]"),
  moveSelected: document.querySelector("[data-move-selected]"),
  batchDelete: document.querySelector("[data-batch-delete]"),
  cancelSelection: document.querySelector("[data-cancel-selection]"),
  toggleMassEdit: document.querySelector("[data-toggle-mass-edit]"),
  massEditActions: document.querySelector("[data-mass-edit-actions]"),
  massEditCount: document.querySelector("[data-mass-edit-count]"),
  massEditSave: document.querySelector("[data-save-mass-edit]"),
  massEditCancel: document.querySelector("[data-cancel-mass-edit]"),
  massEditStatus: document.querySelector("[data-mass-edit-status]"),
  toggleClipboardSelection: document.querySelector("[data-toggle-clipboard-selection]"),
  clipboardSelectionCount: document.querySelector("[data-clipboard-selection-count]"),
  copyClipboardSelection: document.querySelector("[data-copy-clipboard-selection]"),
  pasteClipboardSelection: document.querySelector("[data-paste-clipboard-selection]"),
  pasteAnchorDialog: document.querySelector("[data-paste-anchor-dialog]"),
  pasteAnchorForm: document.querySelector("[data-paste-anchor-form]"),
  pasteAnchorDay: document.querySelector("[data-paste-anchor-day]"),
  pasteAnchorSlot: document.querySelector("[data-paste-anchor-slot]"),
  pasteAnchorStatus: document.querySelector("[data-paste-anchor-status]"),
  pasteAnchorCancel: document.querySelector("[data-paste-anchor-cancel]"),
  clearClipboardSelection: document.querySelector("[data-clear-clipboard-selection]"),
  tableRegion: document.querySelector("[data-table-region]"),
  learningPurpose: document.querySelector("[data-learning-purpose]"),
  learningPurposeMessage: document.querySelector("[data-learning-purpose-message]"),
  learningPurposeSave: document.querySelector("[data-save-learning-purpose]"),
  learningPurposeDelete: document.querySelector("[data-delete-learning-purpose]"),
  learningPurposeOlder: document.querySelector("[data-learning-purpose-older]"),
  learningPurposeNewer: document.querySelector("[data-learning-purpose-newer]"),
  learningPurposeLatest: document.querySelector("[data-learning-purpose-latest]"),
  learningPurposePosition: document.querySelector("[data-learning-purpose-position]"),
  learningPurposeUpdated: document.querySelector("[data-learning-purpose-updated]"),
  learningPurposeStatus: document.querySelector("[data-learning-purpose-status]"),
  purposeFontButtons: [...document.querySelectorAll("[data-purpose-font-size]")],
  languageOpportunities: document.querySelector("[data-language-opportunities]"),
  languageOpportunitiesMessage: document.querySelector("[data-language-opportunities-message]"),
  languageOpportunitiesSave: document.querySelector("[data-save-language-opportunities]"),
  languageOpportunitiesStatus: document.querySelector("[data-language-opportunities-status]"),
  calendarScroll: document.querySelector("[data-calendar-scroll]"),
  weekGrid: document.querySelector("[data-week-grid]"),
  calendarStatus: document.querySelector("[data-calendar-status]"),
  metricWeekGoals: document.querySelector("[data-metric-week-goals]"),
  metricTotalGoals: document.querySelector("[data-metric-total-goals]"),
  metricWeekCompleted: document.querySelector("[data-metric-week-completed]"),
  metricTotalCompleted: document.querySelector("[data-metric-total-completed]"),
  homeworkTypeTotal: document.querySelector("[data-homework-type-total]"),
  homeworkTypePie: document.querySelector("[data-homework-type-pie]"),
  homeworkTypeLegend: document.querySelector("[data-homework-type-legend]"),
  homeworkTypeNote: document.querySelector("[data-homework-type-note]"),
  countdownGrid: document.querySelector("[data-countdown-grid]"),
  countdownStatus: document.querySelector("[data-countdown-status]"),
  addCountdowns: document.querySelector("[data-add-countdowns]"),
  removeCountdowns: document.querySelector("[data-remove-countdowns]"),
  entryDialog: document.querySelector("[data-entry-dialog]"),
  celebrationDialog: document.querySelector("[data-celebration-dialog]"),
  celebrationName: document.querySelector("[data-celebration-name]"),
  closeCelebration: document.querySelector("[data-close-celebration]"),
  entryForm: document.querySelector("[data-entry-form]"),
  entryTitle: document.querySelector("[data-entry-title]"),
  entryMeta: document.querySelector("[data-entry-meta]"),
  entryMessage: document.querySelector("#schedule-message"),
  homeworkAutocomplete: document.querySelector("[data-homework-autocomplete]"),
  homeworkAutocompleteText: document.querySelector("[data-homework-autocomplete-text]"),
  homeworkPicker: document.querySelector("[data-homework-picker]"),
  homeworkPickerTitle: document.querySelector("[data-homework-picker-title]"),
  homeworkPickerSearch: document.querySelector("[data-homework-picker-search]"),
  homeworkPickerCount: document.querySelector("[data-homework-picker-count]"),
  homeworkPickerResults: document.querySelector("[data-homework-picker-results]"),
  homeworkPickerClose: document.querySelector("[data-close-homework-picker]"),
  homeworkAttachments: document.querySelector("[data-homework-attachments]"),
  entryTags: document.querySelector("[data-entry-tags]"),
  entryEstimatedMinutes: document.querySelector("#schedule-estimated-minutes"),
  entryHint: document.querySelector("[data-entry-hint]"),
  entryStatus: document.querySelector("[data-entry-status]"),
  closeEntry: document.querySelector("[data-close-entry]"),
  deleteEntry: document.querySelector("[data-delete-entry]"),
  toggleComplete: document.querySelector("[data-toggle-complete]"),
  toggleProgress: document.querySelector("[data-toggle-progress]"),
  toggleMoreThanHalfCompleted: document.querySelector("[data-toggle-more-than-half-completed]"),
  togglePreviousIncomplete: document.querySelector("[data-toggle-previous-incomplete]"),
  saveEntry: document.querySelector("[data-save-entry]"),
  deleteDialog: document.querySelector("[data-delete-dialog]"),
  cancelDelete: document.querySelector("[data-cancel-delete]"),
  confirmDelete: document.querySelector("[data-confirm-delete]"),
  passwordDialog: document.querySelector("[data-password-dialog]"),
  passwordForm: document.querySelector("[data-password-form]"),
  passwordStatus: document.querySelector("[data-password-status]"),
  closePassword: document.querySelector("[data-close-password]"),
  adminPasswordDialog: document.querySelector("[data-admin-password-dialog]"),
  adminPasswordForm: document.querySelector("[data-admin-password-form]"),
  adminPasswordTarget: document.querySelector("[data-admin-password-target]"),
  adminPasswordStatus: document.querySelector("[data-admin-password-status]"),
  closeAdminPassword: document.querySelector("[data-close-admin-password]"),
  toast: document.querySelector("[data-toast]"),
  printSheet: document.querySelector("[data-print-sheet]"),
  printRange: document.querySelector("[data-print-range]"),
  printStudent: document.querySelector("[data-print-student]"),
  printGrid: document.querySelector("[data-print-grid]")
};


const state = {
  currentUser: null,
  selectedStudent: null,
  adminStudents: [],
  adminParents: [],
  parentAssignmentDrafts: new Map(),
  studentSortMode: "asc",
  studentOrder: [],
  studentStatusFilter: "active",
  draggingStudentId: null,
  adminTeacherAssignmentStudentIds: new Set(),
  adminHomeworkLinks: [],
  homeworkResourceUsage: new Map(),
  selectedStudentProfileId: null,
  studentAuditRows: [],
  studentAuditPage: 1,
  studentAuditTotal: 0,
  permanentDeleteSnapshot: null,
  weekStart: scheduleWeekStartFromUrl(window.location.href, defaultWeekStart()),
  weekPayload: emptyWeekPayload(),
  editing: null,
  weekRequestId: 0,
  toastTimer: null,
  tableHidden: readDisplayPreference(TABLE_HIDDEN_KEY),
  hideUnused: false,
  hideMascots: false,
  hideMotivation: false,
  motivationVisibilityOwner: "",
  hideDailyQuote: false,
  hideEncouragement: false,
  hideReminderEmail: false,
  reminderEmail: { email: "", updatedAt: null },
  reminderEmailBusy: false,
  ratingCollapsed: normalizeRatingCollapsePreferences(null),
  learningPurpose: normalizeLearningPurposePayload(null),
  learningPurposeBusy: false,
  learningPurposeRequestId: 0,
  purposeFontSize: 2,
  languageOpportunitiesMessage: "",
  languageOpportunitiesBusy: false,
  learningDaySummary: { streak: 0, total: 0 },
  encouragementBusy: false,
  encouragementRequestId: 0,
  showUnusedTemporarily: false,
  selectionMode: false,
  selectedEntryIds: new Set(),
  moveEntryId: null,
  draggingEntryId: null,
  touchActionEntryId: null,
  draggingMassEditGroup: null,
  longPressTimer: null,
  longPressPointerId: null,
  longPressOrigin: null,
  mutationInFlight: false,
  displayPreferenceRequestId: 0,
  suppressClickUntil: 0,
  countdownDraftOwner: "",
  countdownDrafts: new Map(),
  countdownCollapsedOwner: "",
  countdownCollapsedPositions: new Set(),
  massEditMode: false,
  massEditOriginalEntries: [],
  massEditChanges: new Map(),
  massEditPreviousShowUnusedTemporarily: false,
  clipboardSelectionMode: false,
  clipboardSelectedEntryIds: new Set(),
  clipboardMarquee: null,
  scheduleClipboardSerialized: "",
  scheduleClipboardPayload: null,
  homeworkCompletion: null,
  homeworkPickerType: "",
  homeworkPickerReplacement: null,
  motivationSaveTimers: new Map(),
  motivationPendingSaves: new Map(),
  motivationSavePromises: new Set(),
  motivationSaveChains: new Map(),
  motivationSaveGenerations: new Map(),
  wellbeingSaveTimers: new Map(),
  wellbeingPendingSaves: new Map(),
  wellbeingSavePromises: new Set(),
  wellbeingSaveChains: new Map(),
  wellbeingSaveGenerations: new Map(),
  announcements: [],
  editingAnnouncementId: null,
  editingAnnouncementVersion: null,
  announcementMutationInFlight: false
};

let homeworkResourceCatalog = null;
let homeworkCatalogPromise = null;
let videoClassHomeworkCatalogError = null;
let supabaseAuthPromise = null;
let dailyQuoteRefreshTimer = null;
let dailyQuoteSelectedDayKey = "";
let dailyQuoteTodayDayKey = "";

async function loadVideoClassHomeworkResources() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(VIDEO_CLASS_HOMEWORK_CATALOG_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Video Class catalogue returned ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload?.resources) ? payload.resources : [];
    videoClassHomeworkCatalogError = null;
    return rows.map((resource) => {
      const normalized = normalizeHomeworkResource(resource);
      return normalized ? Object.freeze({ ...resource, ...normalized }) : null;
    }).filter(Boolean);
  } catch (error) {
    videoClassHomeworkCatalogError = error;
    console.warn("Video Class homework catalogue failed to load", error);
    return [];
  } finally {
    window.clearTimeout(timer);
  }
}

async function loadManualWritingHomeworkResources() {
  if (state.currentUser?.role !== "admin" || !state.currentUser.adminToken) return [];
  const rows = await callRpc("schedule_admin_list_manual_writing_resources", {
    p_admin_token: state.currentUser.adminToken
  });
  return (Array.isArray(rows) ? rows : []).map((resource) => {
    const normalized = normalizeHomeworkResource(resource);
    return normalized ? Object.freeze({ ...resource, ...normalized }) : null;
  }).filter(Boolean);
}

function mergeHomeworkCatalog(baseCatalog, { videoClassResources = null, manualWritingResources = null } = {}) {
  const byId = new Map((Array.isArray(baseCatalog) ? baseCatalog : [])
    .filter((resource) => videoClassResources === null || !String(resource?.type || "").startsWith("video-class-"))
    .filter((resource) => manualWritingResources === null || !String(resource?.id || "").startsWith("writing-submission:manual:"))
    .map((resource) => [resource.id, resource]));
  (videoClassResources || []).forEach((resource) => byId.set(resource.id, resource));
  (manualWritingResources || []).forEach((resource) => byId.set(resource.id, resource));
  return Object.freeze([...byId.values()]);
}

function ensureHomeworkCatalog({ retryVideoClass = false, refreshManualWriting = false } = {}) {
  if (homeworkResourceCatalog) {
    if (retryVideoClass || refreshManualWriting) {
      return Promise.all([
        retryVideoClass ? loadVideoClassHomeworkResources() : Promise.resolve(null),
        refreshManualWriting ? loadManualWritingHomeworkResources() : Promise.resolve(null)
      ]).then(([videoClassResources, manualWritingResources]) => {
        homeworkResourceCatalog = mergeHomeworkCatalog(homeworkResourceCatalog, { videoClassResources, manualWritingResources });
        return homeworkResourceCatalog;
      });
    }
    return Promise.resolve(homeworkResourceCatalog);
  }
  if (!homeworkCatalogPromise) {
    homeworkCatalogPromise = Promise.all([
      import(HOMEWORK_CATALOG_URL),
      loadVideoClassHomeworkResources(),
      loadManualWritingHomeworkResources()
    ])
      .then(([module, videoClassResources, manualWritingResources]) => {
        homeworkResourceCatalog = mergeHomeworkCatalog(module.HOMEWORK_RESOURCE_CATALOG, { videoClassResources, manualWritingResources });
        return homeworkResourceCatalog;
      })
      .catch((error) => {
        homeworkCatalogPromise = null;
        throw error;
      });
  }
  return homeworkCatalogPromise;
}

function emptyWeekPayload() {
  return {
    capacities: {},
    capacityVersions: {},
    entries: [],
    metrics: {
      weekGoals: 0,
      totalGoals: 0,
      weekCompleted: 0,
      totalCompleted: 0,
      homeworkTypeCounts: Object.fromEntries(HOMEWORK_RESOURCE_TYPES.map((definition) => [definition.type, 0]))
    },
    countdownCapacity: MIN_COUNTDOWNS,
    countdowns: [],
    encouragement: {
      message: "",
      updatedAt: null,
      previousMessage: "",
      canUsePrevious: false
    },
    reminderEmail: { email: "", updatedAt: null },
    motivationRatings: {},
    wellbeingRatings: wellbeingRatingsByMetricAndDate([])
  };
}

function renderEntryTagOptions() {
  if (!elements.entryTags) return;
  const fragment = document.createDocumentFragment();
  for (const tag of HOMEWORK_ENTRY_TAGS) {
    const label = document.createElement("label");
    label.className = "entry-tag-option";
    label.style.setProperty("--entry-tag-colour", tag.color);
    label.style.setProperty("--entry-tag-text", tag.textColor);
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `schedule-homework-tag-${tag.key}`;
    input.value = tag.key;
    input.dataset.homeworkTag = "true";
    label.htmlFor = input.id;
    const text = document.createElement("span");
    text.textContent = tag.label;
    label.append(input, text);
    fragment.append(label);
  }
  elements.entryTags.replaceChildren(fragment);
}

function isStudentTagOnlyEntry(entry = state.editing?.entry) {
  return Boolean(entry?.source === "admin" && state.currentUser?.role === "student");
}

function readDisplayPreference(key) {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function saveDisplayPreference(key, value) {
  try {
    localStorage.setItem(key, String(Boolean(value)));
  } catch {
    // Display preferences can remain in memory when storage is unavailable.
  }
}

function motivationHiddenStorageKey(studentId) {
  return `${MOTIVATION_HIDDEN_STORAGE_PREFIX}:${String(studentId || "").toLowerCase()}`;
}

function motivationVisibilityOwner(student) {
  if (!student?.id || !state.currentUser?.role) return "";
  return state.currentUser.role === "admin"
    ? `admin:${student.id}`
    : String(student.id);
}

function syncMotivationVisibilityPreference(student) {
  const owner = motivationVisibilityOwner(student);
  if (state.motivationVisibilityOwner === owner) return;
  state.motivationVisibilityOwner = owner;
  if (!owner) {
    state.hideMotivation = false;
    return;
  }
  try {
    state.hideMotivation = localStorage.getItem(motivationHiddenStorageKey(owner)) === "true";
  } catch {
    state.hideMotivation = false;
  }
}

function saveMotivationVisibilityPreference(owner, hidden) {
  try {
    localStorage.setItem(motivationHiddenStorageKey(owner), String(Boolean(hidden)));
  } catch {
    // This visual-only preference may remain in memory if device storage is unavailable.
  }
}

function setConnection(text, status = "online") {
  elements.connection.textContent = text;
  elements.connection.dataset.state = status;
}

function setStatus(element, text = "", status = "") {
  element.textContent = text;
  if (status) element.dataset.state = status;
  else delete element.dataset.state;
}

function showToast(message, status = "success") {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.dataset.state = status;
  elements.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 3200);
}

function showCompletionCelebration() {
  if (state.currentUser?.role !== "student" || !elements.celebrationDialog) return;
  if (elements.celebrationName) {
    elements.celebrationName.textContent = activeStudent()?.name || state.currentUser.name || "同學";
  }
  if (!elements.celebrationDialog.open) elements.celebrationDialog.showModal();
}

function homeworkTypeDefinition(type) {
  return HOMEWORK_RESOURCE_TYPES.find((item) => item.type === type) || null;
}

function closeHomeworkPicker({ keepSearch = false } = {}) {
  state.homeworkPickerType = "";
  state.homeworkPickerReplacement = null;
  elements.homeworkPicker.hidden = true;
  if (!keepSearch) elements.homeworkPickerSearch.value = "";
}

function renderHomeworkPickerResults() {
  const type = state.homeworkPickerType;
  if (!type) {
    elements.homeworkPickerResults.replaceChildren();
    elements.homeworkPickerCount.textContent = "";
    return;
  }
  if (!homeworkResourceCatalog) {
    elements.homeworkPickerCount.textContent = "正在載入練習清單…";
    const loading = document.createElement("p");
    loading.className = "homework-picker-count";
    loading.textContent = "練習目錄只會在需要時載入，日程及登入可先正常使用。";
    elements.homeworkPickerResults.replaceChildren(loading);
    return;
  }
  if (type.startsWith("video-class-") && videoClassHomeworkCatalogError) {
    elements.homeworkPickerCount.textContent = "未能載入 Video Class 清單，請稍後重新開啟選擇器再試。";
    elements.homeworkPickerResults.replaceChildren();
    return;
  }
  const result = filterHomeworkResources(
    homeworkResourceCatalog,
    type,
    elements.homeworkPickerSearch.value,
    60
  );
  const pickerNoun = homeworkTypeDefinition(type)?.pickerNoun || "練習";
  elements.homeworkPickerCount.textContent = result.total > result.items.length
    ? `找到 ${result.total} 項；請輸入關鍵字縮窄結果（目前顯示首 ${result.items.length} 項）。`
    : `找到 ${result.total} 項${pickerNoun}。`;
  elements.homeworkPickerResults.replaceChildren();
  if (!result.items.length) {
    const empty = document.createElement("p");
    empty.className = "homework-picker-count";
    empty.textContent = `找不到相符${pickerNoun}。`;
    elements.homeworkPickerResults.append(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const resource of result.items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "homework-picker-result";
    button.dataset.homeworkResourceId = resource.id;
    const history = state.homeworkResourceUsage.get(resource.id) || state.homeworkResourceUsage.get(resource.url);
    if (history) button.dataset.history = history.status;
    const selected = Array.isArray(state.editing?.resources) && state.editing.resources.some((item) => item.id === resource.id);
    if (selected) button.dataset.selected = "true";
    button.setAttribute("role", "option");
    const title = document.createElement("strong");
    title.textContent = resource.label;
    const detail = document.createElement("small");
    detail.textContent = resource.detail || homeworkTypeDefinition(type)?.label || "練習";
    button.append(title, detail);
    fragment.append(button);
  }
  elements.homeworkPickerResults.append(fragment);
}

async function openHomeworkPicker(type, { focusSearch = false, replacement = null } = {}) {
  const definition = homeworkTypeDefinition(type);
  if (!definition || elements.entryMessage.readOnly) return;
  const changed = state.homeworkPickerType !== type;
  state.homeworkPickerType = type;
  state.homeworkPickerReplacement = replacement;
  elements.homeworkPicker.hidden = false;
  elements.homeworkPickerTitle.textContent = definition.pickerTitle || `選擇 ${definition.label} 練習`;
  if (changed) elements.homeworkPickerSearch.value = "";
  renderHomeworkPickerResults();
  if (focusSearch) window.setTimeout(() => elements.homeworkPickerSearch.focus(), 0);
  try {
    const student = activeStudent();
    const [, usageRows] = await Promise.all([
      ensureHomeworkCatalog({
        retryVideoClass: type.startsWith("video-class-"),
        refreshManualWriting: type === "writing-submission"
      }),
      state.currentUser?.role === "admin" && student
        ? callRpc("schedule_admin_resource_usage", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id
          }).catch(() => [])
        : Promise.resolve([])
    ]);
    state.homeworkResourceUsage = new Map();
    const usageRank = Object.freeze({ unengaged: 1, partial: 2, completed: 3 });
    (Array.isArray(usageRows) ? usageRows : []).forEach((row) => {
      const status = ["unengaged", "partial", "completed"].includes(String(row.usage_status))
        ? String(row.usage_status)
        : "unengaged";
      const value = { status, date: row.last_schedule_date || null };
      for (const rawKey of [row.resource_id, row.resource_url]) {
        if (!rawKey) continue;
        const key = String(rawKey);
        const previous = state.homeworkResourceUsage.get(key);
        if (!previous || usageRank[value.status] > usageRank[previous.status]) {
          state.homeworkResourceUsage.set(key, value);
        }
      }
    });
    if (state.homeworkPickerType === type && !elements.homeworkPicker.hidden) {
      renderHomeworkPickerResults();
    }
  } catch (error) {
    console.warn("Homework catalogue failed to load", error);
    if (state.homeworkPickerType === type && !elements.homeworkPicker.hidden) {
      elements.homeworkPickerCount.textContent = "未能載入練習清單，請稍後再試。";
      elements.homeworkPickerResults.replaceChildren();
    }
  }
}

function renderHomeworkAttachments() {
  const resources = Array.isArray(state.editing?.resources) ? state.editing.resources : [];
  elements.homeworkAttachments.replaceChildren();
  elements.homeworkAttachments.hidden = resources.length === 0;
  if (!resources.length) return;
  const label = document.createElement("span");
  label.className = "homework-attachments-label";
  label.textContent = "已加入的功課連結";
  elements.homeworkAttachments.append(label);
  resources.forEach((resource) => {
    const row = document.createElement("div");
    row.className = "homework-attachment-chip";
    const link = document.createElement("a");
    link.href = resource.url;
    const isDownload = resource.type === "download-material" || resource.type === "model-essay-download";
    link.textContent = `${isDownload ? "↓" : "↗"} ${resource.label}`;
    link.title = resource.label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "homework-attachment-remove";
    remove.dataset.removeHomeworkResource = resource.id;
    remove.textContent = "×";
    remove.hidden = elements.entryMessage.readOnly;
    remove.setAttribute("aria-label", `移除 ${resource.label} 連結`);
    row.append(link, remove);
    elements.homeworkAttachments.append(row);
  });
}

function addHomeworkResource(resourceId) {
  if (!state.editing || elements.entryMessage.readOnly) return;
  const raw = homeworkResourceCatalog?.find((resource) => resource.id === resourceId);
  const resource = normalizeHomeworkResource(raw);
  if (!resource) return;
  const resources = Array.isArray(state.editing.resources) ? state.editing.resources : [];
  if (resources.some((item) => item.id === resource.id)) {
    showToast("這個功課連結已經加入。", "success");
    return;
  }
  if (resources.length >= MAX_HOMEWORK_RESOURCES) {
    const message = `每格最多可加入 ${MAX_HOMEWORK_RESOURCES} 個功課連結；請先移除其他連結。`;
    setStatus(elements.entryStatus, message, "error");
    showToast(message, "error");
    return;
  }
  const nextResources = [...resources, resource];
  const visibleMessage = insertHomeworkResourceTitle(
    elements.entryMessage.value,
    state.homeworkPickerReplacement,
    homeworkResourceDisplayTitle(resource)
  );
  const nextMessage = serializeScheduleMessage(visibleMessage.value.trim(), nextResources);
  if (nextMessage.length > SCHEDULE_MESSAGE_MAX_LENGTH) {
    const message = "未能加入連結：功課內容連同連結最多 2,000 個字元。請縮短內容或移除其他連結。";
    setStatus(elements.entryStatus, message, "error");
    showToast(message, "error");
    return;
  }
  state.editing.resources = nextResources;
  elements.entryMessage.value = visibleMessage.value;
  renderHomeworkAttachments();
  state.homeworkPickerReplacement = null;
  renderHomeworkPickerResults();
  elements.homeworkPickerSearch.focus();
  setStatus(elements.entryStatus, "");
  showToast("功課連結已加入；儲存本格後學生即可開啟。", "success");
}

function removeHomeworkResource(resourceId) {
  if (!state.editing || elements.entryMessage.readOnly) return;
  state.editing.resources = (state.editing.resources || []).filter((resource) => resource.id !== resourceId);
  renderHomeworkAttachments();
  setStatus(elements.entryStatus, "");
}

function updateHomeworkAutocomplete() {
  if (elements.entryMessage.readOnly || !elements.entryDialog.open) {
    state.homeworkCompletion = null;
    elements.homeworkAutocomplete.hidden = true;
    closeHomeworkPicker();
    return;
  }
  const cursor = elements.entryMessage.selectionStart;
  const completion = homeworkAutocomplete(elements.entryMessage.value, cursor);
  state.homeworkCompletion = completion?.remainder ? completion : null;
  elements.homeworkAutocomplete.hidden = !state.homeworkCompletion;
  elements.homeworkAutocompleteText.textContent = state.homeworkCompletion?.trigger || "";
  const fullTrigger = fullHomeworkTriggerAtCursor(elements.entryMessage.value, cursor);
  if (fullTrigger) openHomeworkPicker(fullTrigger.type, { replacement: fullTrigger });
  else closeHomeworkPicker();
}

function showView(name) {
  for (const view of elements.views) view.hidden = view.dataset.view !== name;
  const loggedIn = Boolean(state.currentUser);
  elements.userPill.hidden = !loggedIn;
  elements.changePassword.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  elements.adminStudentsButton.hidden = !(
    state.currentUser?.role === "admin" && name === "calendar"
  );
  if (elements.adminMotivationResults) {
    elements.adminMotivationResults.hidden = state.currentUser?.role !== "admin";
  }
  if (elements.adminReminderEmails) {
    elements.adminReminderEmails.hidden = state.currentUser?.role !== "admin";
  }
  if (elements.adminEmailContent) {
    elements.adminEmailContent.hidden = state.currentUser?.role !== "admin";
  }
  if (elements.adminEmailLog) {
    elements.adminEmailLog.hidden = state.currentUser?.role !== "admin";
  }
  if (elements.adminHomeworkHotkeys) {
    elements.adminHomeworkHotkeys.hidden = state.currentUser?.role !== "admin";
  }
  if (loggedIn) {
    elements.userPill.textContent = state.currentUser.role === "admin"
      ? `${state.currentUser.name} · 管理員`
      : state.currentUser.name;
  }
  if (name === "calendar") {
    applyDisplayPreferences();
    renderDailyQuote();
  } else {
    window.clearTimeout(dailyQuoteRefreshTimer);
    dailyQuoteRefreshTimer = null;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextHongKongMidnightTimestamp(now = new Date()) {
  const [year, month, day] = hongKongDayKey(now).split("-").map(Number);
  return Date.UTC(year, month - 1, day + 1) - (8 * 60 * 60 * 1000);
}

function scheduleDailyQuoteRefresh() {
  window.clearTimeout(dailyQuoteRefreshTimer);
  const now = new Date();
  const delay = Math.max(1000, nextHongKongMidnightTimestamp(now) - now.getTime() + 250);
  dailyQuoteRefreshTimer = window.setTimeout(() => {
    const nextTodayDayKey = hongKongDayKey();
    if (!dailyQuoteSelectedDayKey || dailyQuoteSelectedDayKey === dailyQuoteTodayDayKey) {
      dailyQuoteSelectedDayKey = nextTodayDayKey;
    }
    renderDailyQuote();
  }, delay);
}

function quoteAttributionWithTitleBreak(prefix, rawAttribution) {
  const attribution = String(rawAttribution || "").trim();
  if (!attribution) return "";
  const separatorIndex = attribution.search(/[,，]/);
  if (separatorIndex < 0) return `${prefix} ${attribution}`;
  const author = attribution.slice(0, separatorIndex).trim();
  const separator = attribution[separatorIndex];
  const title = attribution.slice(separatorIndex + 1).trim();
  return title ? `${prefix} ${author}${separator}\n${title}` : `${prefix} ${author}`;
}

function renderDailyQuote() {
  if (!elements.dailyQuote) return;
  const todayDayKey = hongKongDayKey();
  const history = quoteHistoryState(dailyQuoteSelectedDayKey || todayDayKey, todayDayKey);
  dailyQuoteTodayDayKey = todayDayKey;
  dailyQuoteSelectedDayKey = history.dayKey;
  const quote = history.quote;
  elements.dailyQuote.dataset.quoteDay = history.dayKey;
  if (elements.quoteDate) {
    const date = new Date(`${history.dayKey}T00:00:00Z`);
    const formatted = new Intl.DateTimeFormat("zh-HK", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    }).format(date);
    elements.quoteDate.dateTime = history.dayKey;
    elements.quoteDate.textContent = `${formatted}${history.isToday ? " · 今日" : ""}`;
  }
  if (elements.quotePrevious) {
    elements.quotePrevious.disabled = !history.canPrevious;
    elements.quotePrevious.title = history.canPrevious ? "查看上一日已發布的名人語錄" : "已到第一篇已發布的名人語錄";
  }
  if (elements.quoteNext) {
    elements.quoteNext.disabled = !history.canNext;
    elements.quoteNext.title = history.canNext ? "查看下一日已發布的名人語錄" : "未來語錄尚未公開";
  }
  if (elements.quoteToday) {
    elements.quoteToday.disabled = history.isToday;
    elements.quoteToday.hidden = history.isToday;
  }
  elements.quoteEnglish.textContent = quote?.englishQuote || "今日語錄暫時未能載入。";
  elements.quoteEnglishAttribution.textContent = quote
    ? quoteAttributionWithTitleBreak("—", quote.englishAttribution)
    : "";
  elements.quoteChinese.textContent = quote?.chineseQuote || "";
  elements.quoteChineseAttribution.textContent = quote
    ? quoteAttributionWithTitleBreak("——", quote.chineseAttribution)
    : "";
  scheduleDailyQuoteRefresh();
}

function changeDailyQuoteDay(delta) {
  const todayDayKey = hongKongDayKey();
  const history = moveQuoteHistoryDay(
    dailyQuoteSelectedDayKey || todayDayKey,
    delta,
    todayDayKey
  );
  if (history.dayKey === dailyQuoteSelectedDayKey) return;
  dailyQuoteSelectedDayKey = history.dayKey;
  renderDailyQuote();
}

function showTodayDailyQuote() {
  const todayDayKey = hongKongDayKey();
  if (dailyQuoteSelectedDayKey === todayDayKey) return;
  dailyQuoteSelectedDayKey = todayDayKey;
  renderDailyQuote();
}

function cloneScheduleEntries(entries = []) {
  return entries.map((entry) => ({ ...entry }));
}

function clipboardSelectedEntries() {
  return state.weekPayload.entries.filter((entry) => state.clipboardSelectedEntryIds.has(entry.id));
}

function removeClipboardMarquee() {
  state.clipboardMarquee?.element?.remove();
  state.clipboardMarquee = null;
}

function applyClipboardSelectionClasses() {
  elements.weekGrid?.querySelectorAll("[data-entry-id]").forEach((slot) => {
    const selected = state.clipboardSelectedEntryIds.has(slot.dataset.entryId);
    const entry = findEntryById(slot.dataset.entryId);
    slot.classList.toggle("is-clipboard-selected", selected);
    if (state.massEditMode) {
      const groupDraggable = canDragMassEditGroup(entry);
      slot.draggable = groupDraggable;
      slot.classList.toggle("can-group-drag", groupDraggable);
      slot.title = groupDraggable
        ? "拖到另一個日期欄可整組移動；按住 Option／Alt 拖動可整組複製"
        : "";
    }
    if (state.massEditMode && state.clipboardSelectionMode) {
      slot.setAttribute("aria-pressed", String(selected));
    } else if (!state.selectionMode) {
      slot.removeAttribute("aria-pressed");
    }
  });
}

function clearClipboardSelection({ deactivate = false, render = false } = {}) {
  removeClipboardMarquee();
  state.clipboardSelectedEntryIds.clear();
  if (deactivate) state.clipboardSelectionMode = false;
  if (render) renderWeek();
  else {
    applyClipboardSelectionClasses();
    updateClipboardControls();
  }
}

function updateClipboardControls() {
  const active = state.massEditMode;
  const selecting = active && state.clipboardSelectionMode;
  const selectedCount = clipboardSelectedEntries().length;
  const storedCount = readStoredScheduleClipboardPayload()?.items?.length || 0;
  elements.weekGrid.classList.toggle("is-clipboard-selection-mode", selecting);
  for (const toggle of [elements.toggleSelection, elements.toggleClipboardSelection]) {
    if (!toggle || !active) continue;
    toggle.setAttribute("aria-pressed", String(selecting));
    toggle.textContent = selecting ? "退出複製選取" : "選取以複製";
    toggle.disabled = state.mutationInFlight;
  }
  elements.clipboardSelectionCount.textContent = selectedCount
    ? `已選取 ${selectedCount} 項供複製`
    : selecting
      ? "請框選或點選已有安排"
      : "電腦可直接拖曳框選；手機請先按「選取以複製」";
  elements.copyClipboardSelection.disabled = !active || state.mutationInFlight || selectedCount === 0;
  elements.pasteClipboardSelection.disabled = !active || state.mutationInFlight;
  elements.pasteClipboardSelection.textContent = storedCount ? `貼上 ${storedCount} 項` : "貼上";
  elements.clearClipboardSelection.disabled = !active || state.mutationInFlight || selectedCount === 0;
}

function toggleClipboardSelectionMode() {
  if (!state.massEditMode || state.mutationInFlight) return;
  state.clipboardSelectionMode = !state.clipboardSelectionMode;
  if (!state.clipboardSelectionMode) state.clipboardSelectedEntryIds.clear();
  applyClipboardSelectionClasses();
  updateClipboardControls();
  if (state.clipboardSelectionMode) {
    elements.calendarScroll?.focus({ preventScroll: true });
    showToast("複製選取已開啟：電腦可拖曳框選；手機或平板可逐項點選。");
  }
}

function toggleClipboardEntrySelection(entry) {
  if (!state.massEditMode || !state.clipboardSelectionMode || !entry) return;
  if (entry.spanGroupId) {
    showToast("跨日項目暫不可複製；請選取一般安排。", "error");
    return;
  }
  if (state.clipboardSelectedEntryIds.has(entry.id)) state.clipboardSelectedEntryIds.delete(entry.id);
  else state.clipboardSelectedEntryIds.add(entry.id);
  applyClipboardSelectionClasses();
  updateClipboardControls();
  elements.calendarScroll?.focus({ preventScroll: true });
}

function clipboardShouldRemainNative(target) {
  if (document.querySelector("dialog[open]")) return true;
  return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
}

function storeScheduleClipboardPayload(payload) {
  const serialized = serializeScheduleClipboard(payload);
  state.scheduleClipboardSerialized = serialized;
  state.scheduleClipboardPayload = payload;
  try {
    sessionStorage.setItem(SCHEDULE_CLIPBOARD_SESSION_KEY, serialized);
  } catch {
    // The in-memory fallback still survives switching students in this page.
  }
  return serialized;
}

function readStoredScheduleClipboardPayload() {
  if (state.scheduleClipboardPayload) return state.scheduleClipboardPayload;
  let serialized = state.scheduleClipboardSerialized;
  if (!serialized) {
    try {
      serialized = sessionStorage.getItem(SCHEDULE_CLIPBOARD_SESSION_KEY) || "";
    } catch {
      serialized = "";
    }
  }
  if (!serialized) return null;
  try {
    const payload = parseScheduleClipboard(serialized);
    state.scheduleClipboardSerialized = serialized;
    state.scheduleClipboardPayload = payload;
    return payload;
  } catch {
    clearStoredScheduleClipboard();
    return null;
  }
}

function clearStoredScheduleClipboard() {
  state.scheduleClipboardSerialized = "";
  state.scheduleClipboardPayload = null;
  try {
    sessionStorage.removeItem(SCHEDULE_CLIPBOARD_SESSION_KEY);
  } catch {
    // Nothing else is required when session storage is unavailable.
  }
}

function createCurrentScheduleClipboardPayload() {
  return createScheduleClipboardPayload({
    entries: state.weekPayload.entries,
    selectedEntryIds: state.clipboardSelectedEntryIds,
    weekStart: state.weekStart
  });
}

function clipboardErrorMessage(error, fallback = "未能複製所選安排。") {
  return error instanceof ScheduleClipboardError ? error.message : fallback;
}

async function copyClipboardSelectionFromButton() {
  if (!state.massEditMode || state.mutationInFlight) return;
  try {
    const payload = createCurrentScheduleClipboardPayload();
    const serialized = storeScheduleClipboardPayload(payload);
    updateClipboardControls();
    showToast(`已複製 ${payload.items.length} 項安排；可切換學生後貼上。`);
    // The same-tab/session buffer is authoritative. The OS clipboard is only a
    // best-effort convenience and must never delay or block Schedule copying.
    navigator.clipboard?.writeText?.(serialized).catch(() => {});
  } catch (error) {
    showToast(clipboardErrorMessage(error), "error");
  }
}

function pasteCollisionEntries() {
  const entries = cloneScheduleEntries(state.weekPayload.entries);
  const visibleKeys = new Set(entries.map((entry) => `${entry.scheduleDate}:${Number(entry.slotIndex)}`));
  for (const original of state.massEditOriginalEntries) {
    const key = `${original.scheduleDate}:${Number(original.slotIndex)}`;
    if (!visibleKeys.has(key)) entries.push({ ...original, pendingDelete: true });
  }
  return entries;
}

function pasteConflictSummary(plan) {
  const reasonLabels = {
    occupied: "已有安排",
    protected: "老師安排受保護",
    "span-occupied": "跨日項目佔用",
    "outside-capacity": "超出當日格數",
    "outside-range": "超出支援日期"
  };
  const counts = new Map();
  for (const conflict of plan.conflicts) {
    counts.set(conflict.reason, (counts.get(conflict.reason) || 0) + 1);
  }
  return [...counts.entries()].map(([reason, count]) => `${reasonLabels[reason] || "不可貼上"} ${count} 項`).join("、");
}

function stageScheduleClipboardPaste(payload, anchor = {}) {
  if (!state.massEditMode || state.mutationInFlight) {
    showToast("請先開啟 Mass Edit 才可貼上安排。", "error");
    return false;
  }
  let plan;
  try {
    plan = planScheduleClipboardPaste({
      payload,
      targetWeekStart: state.weekStart,
      targetDayOffset: anchor.dayOffset,
      targetSlotIndex: anchor.slotIndex,
      entries: pasteCollisionEntries(),
      capacities: state.weekPayload.capacities,
      currentRole: state.currentUser?.role
    });
  } catch (error) {
    showToast(clipboardErrorMessage(error, "剪貼簿內並非有效的日程安排。"), "error");
    return false;
  }

  const conflictText = pasteConflictSummary(plan);
  if (!plan.ready.length) {
    const detail = conflictText || (plan.unchanged.length ? `${plan.unchanged.length} 項與現有安排相同` : "沒有可貼上的安排");
    setStatus(elements.massEditStatus, `沒有作出修改：${detail}。`, "error");
    showToast(`沒有可貼上的新安排：${detail}。`, "error");
    return false;
  }
  if (plan.conflicts.length) {
    const confirmed = window.confirm(
      `有 ${plan.conflicts.length} 項未能貼到原位（${conflictText}）。\n系統不會移動或覆蓋任何現有安排。\n\n是否只貼上其餘 ${plan.ready.length} 項空白原位？`
    );
    if (!confirmed) return false;
  }

  const source = state.currentUser?.role === "admin" ? "admin" : "student";
  for (const item of plan.ready) {
    const key = massEditChangeKey(item.scheduleDate, item.slotIndex, null);
    state.massEditChanges.set(key, {
      action: "upsert",
      scheduleDate: item.scheduleDate,
      slotIndex: item.slotIndex,
      message: item.message,
      estimatedMinutes: item.estimatedMinutes,
      expectedUpdatedAt: null,
      spanGroupId: null,
      source,
      isCompleted: false,
      isInProgress: false,
      isMoreThanHalfCompleted: false,
      isPreviousIncomplete: false
    });
  }
  rebuildMassEditPreview();
  clearClipboardSelection({ deactivate: false });
  renderWeek();
  const skipped = plan.conflicts.length + plan.unchanged.length;
  setStatus(
    elements.massEditStatus,
    skipped
      ? `已暫存貼上 ${plan.ready.length} 項；另有 ${skipped} 項未更改或未能貼到原位。`
      : `已暫存貼上 ${plan.ready.length} 項；完成後請按「一次儲存全部」。`
  );
  showToast(`已貼上 ${plan.ready.length} 項至空白原位；尚未上傳至雲端。`);
  return true;
}

function openPasteAnchorDialog(payload) {
  if (!payload || !elements.pasteAnchorDialog) return false;
  storeScheduleClipboardPayload(payload);
  const sourceDay = Math.min(...payload.items.map((item) => item.dayOffset));
  const sourceSlot = Math.min(...payload.items.map((item) => item.slotIndex));
  elements.pasteAnchorDay.value = String(sourceDay);
  elements.pasteAnchorSlot.value = String(sourceSlot);
  elements.pasteAnchorStatus.textContent = `${payload.items.length} 項將以所選位置作為整組起點。`;
  elements.pasteAnchorDialog.showModal();
  return true;
}

async function pasteScheduleClipboardFromButton() {
  if (!state.massEditMode || state.mutationInFlight) return;
  let payload = readStoredScheduleClipboardPayload();
  if (!payload && navigator.clipboard?.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (text) payload = parseScheduleClipboard(text);
    } catch {
      payload = null;
    }
  }
  if (!payload) {
    showToast("找不到已複製的日程安排；請先在 Mass Edit 選取並複製。", "error");
    return;
  }
  openPasteAnchorDialog(payload);
}

elements.pasteAnchorForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = readStoredScheduleClipboardPayload();
  if (!payload) return;
  const accepted = stageScheduleClipboardPaste(payload, {
    dayOffset: Number(elements.pasteAnchorDay.value),
    slotIndex: Number(elements.pasteAnchorSlot.value)
  });
  if (accepted) elements.pasteAnchorDialog.close();
});
elements.pasteAnchorCancel?.addEventListener("click", () => elements.pasteAnchorDialog.close());

function clearMassEditGroupDropClasses() {
  elements.weekGrid?.querySelectorAll(".is-group-drop-target, .is-group-drop-blocked, .is-group-dragging")
    .forEach((element) => element.classList.remove("is-group-drop-target", "is-group-drop-blocked", "is-group-dragging"));
}

function planCurrentMassEditGroupShift(anchorEntryId, targetDate, copy) {
  return planScheduleGroupShift({
    entries: state.weekPayload.entries,
    selectedEntryIds: state.clipboardSelectedEntryIds,
    anchorEntryId,
    targetDate,
    weekStart: state.weekStart,
    capacities: state.weekPayload.capacities,
    copy,
    currentRole: state.currentUser?.role || "student"
  });
}

function stageMassEditGroupShift(plan) {
  if (!state.massEditMode || !plan?.items?.length) return false;
  const sourceByKey = new Map(plan.items.map(({ sourceEntry }) => [
    `${sourceEntry.scheduleDate}:${Number(sourceEntry.slotIndex)}`,
    sourceEntry
  ]));
  const targetByKey = new Map(plan.items.map((item) => [
    `${item.scheduleDate}:${Number(item.slotIndex)}`,
    item
  ]));
  const affectedKeys = new Set(plan.copy
    ? targetByKey.keys()
    : [...sourceByKey.keys(), ...targetByKey.keys()]);

  for (const key of affectedKeys) {
    const target = targetByKey.get(key);
    const source = sourceByKey.get(key);
    const [scheduleDate, rawSlotIndex] = key.split(":");
    const slotIndex = Number(rawSlotIndex);
    const originalEntry = massEditOriginalEntry(scheduleDate, slotIndex, source || null);
    const changeKey = massEditChangeKey(scheduleDate, slotIndex, originalEntry);
    if (target) {
      state.massEditChanges.set(changeKey, {
        action: "upsert",
        scheduleDate,
        slotIndex,
        message: target.message,
        estimatedMinutes: target.estimatedMinutes,
        expectedUpdatedAt: originalEntry?.updatedAt || null,
        spanGroupId: null,
        source: target.source,
        isCompleted: target.isCompleted,
        isInProgress: target.isInProgress,
        isMoreThanHalfCompleted: target.isMoreThanHalfCompleted,
        isPreviousIncomplete: target.isPreviousIncomplete
      });
    } else if (source && originalEntry) {
      state.massEditChanges.set(changeKey, {
        action: "delete",
        scheduleDate,
        slotIndex,
        message: null,
        estimatedMinutes: null,
        expectedUpdatedAt: originalEntry.updatedAt,
        spanGroupId: originalEntry.spanGroupId || null,
        source: originalEntry.source,
        isCompleted: null,
        isInProgress: null,
        isMoreThanHalfCompleted: null,
        isPreviousIncomplete: null
      });
    } else if (source) {
      state.massEditChanges.delete(changeKey);
    }
  }

  rebuildMassEditPreview();
  clearClipboardSelection({ deactivate: false });
  renderWeek();
  setStatus(
    elements.massEditStatus,
    `${plan.copy ? "整組複製" : "整組移動"} ${plan.items.length} 項已暫存；完成後請按「一次儲存全部」。`
  );
  showToast(`${plan.items.length} 項已整組${plan.copy ? "複製" : "移動"}；尚未上傳至雲端。`);
  return true;
}

function massEditOriginalEntry(date, slotIndex, entry = null) {
  const exact = state.massEditOriginalEntries.find((candidate) => (
    candidate.scheduleDate === date && Number(candidate.slotIndex) === Number(slotIndex)
  ));
  if (exact) return exact;
  if (entry?.spanGroupId) {
    return state.massEditOriginalEntries
      .filter((candidate) => candidate.spanGroupId === entry.spanGroupId)
      .sort((left, right) => left.scheduleDate.localeCompare(right.scheduleDate))[0] || null;
  }
  return null;
}

function massEditChangeKey(date, slotIndex, originalEntry = null) {
  return originalEntry?.spanGroupId
    ? `span:${originalEntry.spanGroupId}`
    : `cell:${date}:${Number(slotIndex)}`;
}

function rebuildMassEditPreview() {
  if (!state.massEditMode) return;
  let entries = cloneScheduleEntries(state.massEditOriginalEntries);

  for (const change of state.massEditChanges.values()) {
    const target = entries.find((entry) => (
      entry.scheduleDate === change.scheduleDate
      && Number(entry.slotIndex) === Number(change.slotIndex)
    ));
    const targetGroupId = target?.spanGroupId || change.spanGroupId || null;

    if (change.action === "delete") {
      entries = targetGroupId
        ? entries.filter((entry) => entry.spanGroupId !== targetGroupId)
        : entries.filter((entry) => !(
            entry.scheduleDate === change.scheduleDate
            && Number(entry.slotIndex) === Number(change.slotIndex)
          ));
      continue;
    }

    if (target) {
      entries = entries.map((entry) => {
        const matches = targetGroupId
          ? entry.spanGroupId === targetGroupId
          : entry.scheduleDate === change.scheduleDate
            && Number(entry.slotIndex) === Number(change.slotIndex);
        if (!matches) return entry;
        return {
          ...entry,
          message: change.message,
          estimatedMinutes: change.estimatedMinutes,
          source: change.source,
          isCompleted: Boolean(change.isCompleted),
          isInProgress: Boolean(change.isInProgress),
          isMoreThanHalfCompleted: Boolean(change.isMoreThanHalfCompleted),
          isPreviousIncomplete: Boolean(change.isPreviousIncomplete),
          massEditDraft: true
        };
      });
    } else {
      entries.push({
        id: `draft:${change.scheduleDate}:${change.slotIndex}`,
        scheduleDate: change.scheduleDate,
        slotIndex: change.slotIndex,
        message: change.message,
        estimatedMinutes: change.estimatedMinutes,
        source: change.source,
        isCompleted: Boolean(change.isCompleted),
        isInProgress: Boolean(change.isInProgress),
        isMoreThanHalfCompleted: Boolean(change.isMoreThanHalfCompleted),
        isPreviousIncomplete: Boolean(change.isPreviousIncomplete),
        spanGroupId: null,
        updatedAt: null,
        massEditDraft: true
      });
    }
  }

  state.weekPayload.entries = entries;
}

function updateMassEditControls() {
  if (!elements.toggleMassEdit) return;
  const active = state.massEditMode;
  const changeCount = state.massEditChanges.size;
  const weekIsLoading = elements.weekGrid.getAttribute("aria-busy") === "true";
  elements.toggleMassEdit.setAttribute("aria-pressed", String(active));
  elements.toggleMassEdit.textContent = active ? "退出批量編輯" : "批量編輯（Mass Edit）";
  elements.toggleMassEdit.disabled = state.mutationInFlight
    || weekIsLoading
    || !activeStudent()
    || elements.weekGrid.childElementCount === 0;
  elements.massEditActions.hidden = !active;
  elements.massEditCount.textContent = changeCount
    ? `已暫存 ${changeCount} 項修改`
    : "尚未有待儲存修改";
  elements.massEditSave.disabled = state.mutationInFlight || changeCount === 0;
  elements.massEditCancel.disabled = state.mutationInFlight;
  elements.toggleUnused.disabled = active || state.mutationInFlight || Boolean(state.moveEntryId);
  elements.exportPdf.disabled = active
    || elements.weekGrid.getAttribute("aria-busy") === "true"
    || !activeStudent()
    || elements.weekGrid.childElementCount === 0;
  elements.adminStudentsButton.disabled = state.mutationInFlight || (active && changeCount > 0);
  elements.adminStudentsButton.title = active && changeCount > 0
    ? "請先一次儲存全部或取消修改，再切換學生。"
    : "";
  elements.currentWeek.disabled = state.mutationInFlight;
  const countdownCapacity = Math.max(
    MIN_COUNTDOWNS,
    Math.min(MAX_COUNTDOWNS, Number(state.weekPayload.countdownCapacity) || MIN_COUNTDOWNS)
  );
  elements.addCountdowns.disabled = active || state.mutationInFlight || countdownCapacity >= MAX_COUNTDOWNS;
  elements.removeCountdowns.disabled = active || state.mutationInFlight || countdownCapacity <= MIN_COUNTDOWNS;
  if (elements.countdownGrid) elements.countdownGrid.inert = active;
  updateClipboardControls();
}

function leaveMassEdit({ restoreOriginal = true } = {}) {
  if (restoreOriginal) state.weekPayload.entries = cloneScheduleEntries(state.massEditOriginalEntries);
  state.massEditMode = false;
  state.massEditOriginalEntries = [];
  state.massEditChanges.clear();
  state.showUnusedTemporarily = state.massEditPreviousShowUnusedTemporarily;
  state.massEditPreviousShowUnusedTemporarily = false;
  state.draggingMassEditGroup = null;
  clearClipboardSelection({ deactivate: true });
  setStatus(elements.massEditStatus, "");
  updateMassEditControls();
}

function discardMassEdit({ requireConfirmation = true } = {}) {
  if (!state.massEditMode) return true;
  if (
    requireConfirmation
    && state.massEditChanges.size
    && !window.confirm("您確定要放棄所有尚未儲存的 Mass Edit 修改嗎？")
  ) {
    return false;
  }
  leaveMassEdit({ restoreOriginal: true });
  renderWeek();
  showToast("已取消所有未儲存修改。");
  return true;
}

function guardMassEditNavigation() {
  if (!state.massEditMode) return true;
  return discardMassEdit({ requireConfirmation: true });
}

function beginMassEdit() {
  if (
    state.massEditMode
    || state.mutationInFlight
    || elements.weekGrid.getAttribute("aria-busy") === "true"
    || !activeStudent()
    || elements.weekGrid.childElementCount === 0
  ) return;
  if (state.selectionMode) {
    if (state.moveEntryId) state.showUnusedTemporarily = false;
    resetSelectionMode();
  }
  leaveTouchActionMode();
  state.draggingEntryId = null;
  state.massEditMode = true;
  state.massEditOriginalEntries = cloneScheduleEntries(state.weekPayload.entries);
  state.massEditChanges.clear();
  clearClipboardSelection({ deactivate: true });
  state.massEditPreviousShowUnusedTemporarily = state.showUnusedTemporarily;
  state.showUnusedTemporarily = true;
  setStatus(elements.massEditStatus, "Mass Edit 已開啟：修改會先暫存在本頁。");
  renderWeek();
  elements.toggleSelection?.focus({ preventScroll: true });
  showToast("批量編輯已開啟：電腦可直接拖曳框選，或按「選取以複製」。");
}

function toggleMassEdit() {
  if (state.massEditMode) discardMassEdit({ requireConfirmation: true });
  else beginMassEdit();
}

function clearRenderedSchedule() {
  cancelPendingMotivationSaves();
  state.weekRequestId += 1;
  state.displayPreferenceRequestId += 1;
  state.mutationInFlight = false;
  state.weekPayload = emptyWeekPayload();
  state.hideUnused = false;
  state.hideMascots = false;
  state.hideMotivation = false;
  state.motivationVisibilityOwner = "";
  state.hideDailyQuote = false;
  state.hideEncouragement = false;
  state.hideReminderEmail = false;
  state.reminderEmail = { email: "", updatedAt: null };
  state.reminderEmailBusy = false;
  state.ratingCollapsed = normalizeRatingCollapsePreferences(null);
  state.learningPurpose = normalizeLearningPurposePayload(null);
  state.learningPurposeBusy = false;
  state.learningPurposeRequestId += 1;
  state.encouragementBusy = false;
  state.encouragementRequestId += 1;
  state.showUnusedTemporarily = false;
  state.editing = null;
  clearLongPress();
  state.touchActionEntryId = null;
  state.countdownDraftOwner = "";
  state.countdownDrafts.clear();
  state.countdownCollapsedOwner = "";
  state.countdownCollapsedPositions.clear();
  state.announcements = [];
  resetAnnouncementForm();
  state.massEditMode = false;
  state.massEditOriginalEntries = [];
  state.massEditChanges.clear();
  state.massEditPreviousShowUnusedTemporarily = false;
  state.draggingMassEditGroup = null;
  clearClipboardSelection({ deactivate: true });
  resetSelectionMode();
  elements.weekGrid.replaceChildren();
  elements.exportPdf.disabled = true;
  if (elements.deleteDialog.open) elements.deleteDialog.close();
  if (elements.entryDialog.open) elements.entryDialog.close();
  elements.entryMessage.value = "";
  elements.entryEstimatedMinutes.value = "";
  elements.entryMessage.readOnly = false;
  elements.saveEntry.hidden = false;
  elements.deleteEntry.hidden = true;
  elements.toggleComplete.hidden = true;
  elements.toggleComplete.dataset.completed = "false";
  elements.toggleComplete.setAttribute("aria-pressed", "false");
  elements.toggleComplete.textContent = "標記完成";
  elements.toggleProgress.hidden = true;
  elements.toggleProgress.dataset.inProgress = "false";
  elements.toggleProgress.setAttribute("aria-pressed", "false");
  elements.toggleProgress.textContent = "標記進行中";
  elements.toggleMoreThanHalfCompleted.hidden = true;
  elements.toggleMoreThanHalfCompleted.dataset.moreThanHalfCompleted = "false";
  elements.toggleMoreThanHalfCompleted.setAttribute("aria-pressed", "false");
  elements.toggleMoreThanHalfCompleted.textContent = "標記已完成超過一半";
  elements.togglePreviousIncomplete.hidden = true;
  elements.togglePreviousIncomplete.dataset.previousIncomplete = "false";
  elements.togglePreviousIncomplete.setAttribute("aria-pressed", "false");
  elements.togglePreviousIncomplete.textContent = "標記之前功課未完成";
  elements.countdownGrid?.replaceChildren();
  setStatus(elements.countdownStatus, "");
  renderEncouragementFromPayload();
  renderReminderEmail();
  renderLearningPurpose();
  setMetricsUnavailable();
  applyDisplayPreferences();
  setStatus(elements.entryStatus, "");
  setStatus(elements.massEditStatus, "");
  setStatus(elements.calendarStatus, "");
  updateMassEditControls();
}

function applyDisplayPreferences() {
  const hideUnusedNow = unusedSlotsAreHidden();
  const canHideMotivation = Boolean(state.currentUser && activeStudent());
  elements.tableRegion.hidden = state.tableHidden;
  elements.toggleTable.textContent = state.tableHidden ? "顯示日程表" : "隱藏日程表";
  elements.toggleTable.setAttribute("aria-expanded", String(!state.tableHidden));
  elements.toggleUnused.textContent = hideUnusedNow ? "顯示所有格" : "隱藏未使用格";
  elements.toggleUnused.setAttribute("aria-pressed", String(hideUnusedNow));
  elements.toggleMascots.textContent = state.hideMascots ? "顯示吉祥物" : "隱藏吉祥物";
  elements.toggleMascots.setAttribute("aria-pressed", String(state.hideMascots));
  elements.weekGrid.classList.toggle("mascots-hidden", state.hideMascots);
  elements.toggleMotivation.hidden = !canHideMotivation;
  elements.toggleMotivation.disabled = state.mutationInFlight || !canHideMotivation;
  elements.toggleMotivation.textContent = state.hideMotivation ? "顯示動力指數" : "隱藏動力指數";
  elements.toggleMotivation.setAttribute("aria-pressed", String(state.hideMotivation));
  elements.weekGrid.querySelectorAll(".daily-self-rating.rating-motivation").forEach((panel) => {
    panel.hidden = canHideMotivation && state.hideMotivation;
  });
  elements.dailyQuote.hidden = state.hideDailyQuote;
  elements.toggleDailyQuote.textContent = state.hideDailyQuote ? "顯示名人語錄" : "隱藏名人語錄";
  elements.toggleDailyQuote.setAttribute("aria-pressed", String(state.hideDailyQuote));
  elements.weeklyEncouragement.hidden = state.hideEncouragement;
  elements.toggleEncouragement.textContent = state.hideEncouragement ? "顯示打氣說話" : "隱藏打氣說話";
  elements.toggleEncouragement.setAttribute("aria-pressed", String(state.hideEncouragement));
  const reminderEmailAvailable = state.currentUser?.role === "student";
  elements.toggleReminderEmail.hidden = !reminderEmailAvailable;
  elements.toggleReminderEmail.disabled = state.mutationInFlight || !reminderEmailAvailable;
  elements.reminderEmailPanel.hidden = !reminderEmailAvailable || state.hideReminderEmail;
  elements.toggleReminderEmail.textContent = state.hideReminderEmail ? "顯示電郵列" : "隱藏電郵列";
  elements.toggleReminderEmail.setAttribute("aria-pressed", String(state.hideReminderEmail));
  updateEncouragementControls();
  updateReminderEmailControls();
  updateSelectionControls();
  updateMassEditControls();
}

function unusedSlotsAreHidden() {
  return state.hideUnused && !state.showUnusedTemporarily;
}

function normalizeDisplayPreferences(value) {
  return {
    hideUnused: value?.hideUnused === true,
    hideMascots: value?.hideMascots === true,
    hideDailyQuote: value?.hideDailyQuote === true,
    hideEncouragement: value?.hideEncouragement === true,
    hideReminderEmail: value?.hideReminderEmail === true,
    ratingCollapsed: normalizeRatingCollapsePreferences(value),
    purposeFontSize: normalizePurposeFontSize(value?.purposeFontSize)
  };
}

function restoreDisplayPreferences(preferences) {
  state.hideUnused = preferences.hideUnused;
  state.hideMascots = preferences.hideMascots;
  state.hideDailyQuote = preferences.hideDailyQuote;
  state.hideEncouragement = preferences.hideEncouragement;
  state.hideReminderEmail = preferences.hideReminderEmail;
  state.ratingCollapsed = { ...preferences.ratingCollapsed };
  state.purposeFontSize = preferences.purposeFontSize;
}

function displayPreferenceOwner() {
  const student = activeStudent();
  if (!student || !state.currentUser) return "";
  return state.currentUser.role === "admin"
    ? `admin:${state.currentUser.adminToken || ""}:${student.id}`
    : `student:${state.currentUser.studentToken || ""}:${student.id}`;
}

function applySavedDisplayPreferences(value) {
  const preferences = normalizeDisplayPreferences(value);
  restoreDisplayPreferences(preferences);
  applyDisplayPreferences();
}

function applyPurposeFontSize() {
  if (!elements.learningPurposeMessage) return;
  const sizes = { 1: 19, 2: 24, 3: 30 };
  const size = normalizePurposeFontSize(state.purposeFontSize);
  elements.learningPurposeMessage.style.setProperty("--purpose-font-size", `${sizes[size]}px`);
  elements.purposeFontButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.purposeFontSize) === size));
  });
}

async function setPurposeFontSize(rawSize) {
  if (!activeStudent() || state.mutationInFlight) return;
  const previous = state.purposeFontSize;
  state.purposeFontSize = normalizePurposeFontSize(rawSize);
  applyPurposeFontSize();
  try {
    const saved = await saveDisplayPreferences({ purposeFontSize: state.purposeFontSize });
    state.purposeFontSize = normalizePurposeFontSize(saved?.purposeFontSize);
    applyPurposeFontSize();
    showToast("已儲存初心文字大小。", "success");
  } catch (error) {
    state.purposeFontSize = previous;
    applyPurposeFontSize();
    setStatus(elements.learningPurposeStatus, error.message || "未能儲存文字大小。", "error");
  }
}

function selectedEntries() {
  return state.weekPayload.entries.filter((entry) => state.selectedEntryIds.has(entry.id));
}

function canMoveEntry(entry) {
  return Boolean(entry) && !state.massEditMode && !(
    state.currentUser?.role === "student" && entry.source === "admin"
  );
}

function canDragMassEditGroup(entry) {
  return Boolean(
    state.massEditMode
    && entry
    && !entry.spanGroupId
    && state.clipboardSelectedEntryIds.has(entry.id)
    && state.clipboardSelectedEntryIds.size > 0
  );
}

function spanMemberIds(entry) {
  if (!entry) return new Set();
  return new Set(state.weekPayload.entries
    .filter((candidate) => entry.spanGroupId
      ? candidate.spanGroupId === entry.spanGroupId
      : candidate.id === entry.id)
    .map((candidate) => candidate.id));
}

function clearLongPress() {
  window.clearTimeout(state.longPressTimer);
  state.longPressTimer = null;
  state.longPressPointerId = null;
  state.longPressOrigin = null;
}

function leaveTouchActionMode() {
  clearLongPress();
  state.touchActionEntryId = null;
  elements.weekGrid?.querySelectorAll(".is-touch-action, .is-span-target, .is-swap-target, .is-drop-target")
    .forEach((element) => element.classList.remove("is-touch-action", "is-span-target", "is-swap-target", "is-drop-target"));
}

function resetSelectionMode() {
  state.selectionMode = false;
  state.selectedEntryIds.clear();
  state.moveEntryId = null;
  state.draggingEntryId = null;
  state.draggingMassEditGroup = null;
  clearLongPress();
  state.touchActionEntryId = null;
  updateSelectionControls();
}

function updateSelectionControls() {
  if (!elements.toggleSelection) return;
  elements.weekGrid.classList.toggle("is-selection-mode", state.selectionMode && !state.massEditMode);
  elements.toggleDailyQuote.disabled = state.mutationInFlight;
  elements.toggleEncouragement.disabled = state.mutationInFlight;
  if (state.massEditMode) {
    elements.selectionActions.hidden = true;
    elements.toggleSelection.setAttribute("aria-pressed", String(state.clipboardSelectionMode));
    elements.toggleSelection.textContent = state.clipboardSelectionMode ? "退出複製選取" : "選取以複製";
    elements.toggleSelection.disabled = state.mutationInFlight;
    elements.toggleUnused.disabled = true;
    elements.toggleMascots.disabled = state.mutationInFlight;
    return;
  }
  const entries = selectedEntries();
  const protectedCount = entries.filter((entry) => !canMoveEntry(entry)).length;
  const moving = Boolean(state.moveEntryId);
  elements.toggleSelection.setAttribute("aria-pressed", String(state.selectionMode));
  elements.toggleSelection.textContent = state.selectionMode ? "退出選取" : "選取多項";
  elements.selectionActions.hidden = !state.selectionMode;
  elements.selectionCount.textContent = moving
    ? "請按一下要移到的空白格"
    : `已選取 ${entries.length} 項`;
  elements.batchComplete.disabled = state.mutationInFlight || moving || entries.length === 0;
  elements.batchComplete.textContent = entries.length && entries.every((entry) => entry.isCompleted)
    ? "取消完成"
    : "標記完成";
  elements.batchProgress.disabled = state.mutationInFlight || moving || entries.length === 0;
  elements.batchProgress.textContent = entries.length && entries.every((entry) => entry.isInProgress)
    ? "取消進行中"
    : "標記進行中";
  elements.batchMoreThanHalfCompleted.disabled = state.mutationInFlight || moving || entries.length === 0;
  elements.batchMoreThanHalfCompleted.textContent = entries.length && entries.every((entry) => entry.isMoreThanHalfCompleted)
    ? "取消已完成超過一半"
    : "標記已完成超過一半";
  elements.batchPreviousIncomplete.disabled = state.mutationInFlight || moving || entries.length === 0;
  elements.batchPreviousIncomplete.textContent = entries.length && entries.every((entry) => entry.isPreviousIncomplete)
    ? "取消上週未完成"
    : "標記上週未完成";
  elements.moveSelected.disabled = state.mutationInFlight || moving || entries.length !== 1 || !canMoveEntry(entries[0]);
  elements.moveSelected.textContent = moving ? "請選擇空白格" : "移動所選";
  elements.batchDelete.disabled = state.mutationInFlight || moving || entries.length === 0 || protectedCount > 0;
  elements.batchDelete.title = protectedCount > 0
    ? "老師安排只可由管理員刪除。"
    : "刪除所有已選取安排";
  elements.cancelSelection.disabled = state.mutationInFlight;
  elements.toggleUnused.disabled = state.mutationInFlight || moving;
  elements.toggleMascots.disabled = state.mutationInFlight;
  elements.toggleSelection.disabled = state.mutationInFlight;
}

function setMutationInFlight(busy) {
  state.mutationInFlight = Boolean(busy);
  elements.toggleUnused.disabled = busy;
  elements.toggleMascots.disabled = busy;
  elements.toggleMotivation.disabled = busy || !state.currentUser || !activeStudent();
  elements.toggleDailyQuote.disabled = busy;
  elements.toggleEncouragement.disabled = busy;
  elements.toggleReminderEmail.disabled = busy || state.currentUser?.role !== "student";
  elements.toggleSelection.disabled = busy;
  updateSelectionControls();
  updateMassEditControls();
}

function toggleTableVisibility() {
  state.tableHidden = !state.tableHidden;
  saveDisplayPreference(TABLE_HIDDEN_KEY, state.tableHidden);
  applyDisplayPreferences();
}

function toggleMotivationVisibility() {
  const student = activeStudent();
  if (state.mutationInFlight || !state.currentUser || !student) return;
  syncMotivationVisibilityPreference(student);
  state.hideMotivation = !state.hideMotivation;
  saveMotivationVisibilityPreference(motivationVisibilityOwner(student), state.hideMotivation);
  applyDisplayPreferences();
  showToast(state.hideMotivation
    ? "已在這部裝置隱藏動力指數。"
    : "已在這部裝置顯示動力指數。");
}

async function toggleSelfRatingCollapse(rawMetric, scheduleDate) {
  const definition = selfEvaluationDefinition(rawMetric);
  const student = activeStudent();
  if (!definition || !student || !state.currentUser || state.mutationInFlight) return;
  const previous = state.ratingCollapsed[definition.key] === true;
  const next = !previous;
  state.ratingCollapsed[definition.key] = next;
  renderWeek();
  restoreRatingCollapseFocus(definition.key, scheduleDate);
  setMutationInFlight(true);
  try {
    const saved = await saveDisplayPreferences({ [definition.preferenceKey]: next });
    state.ratingCollapsed = normalizeRatingCollapsePreferences(saved);
    renderWeek();
    restoreRatingCollapseFocus(definition.key, scheduleDate);
    showToast(next ? `已收起${definition.label}。` : `已展開${definition.label}。`);
  } catch (error) {
    state.ratingCollapsed[definition.key] = previous;
    renderWeek();
    restoreRatingCollapseFocus(definition.key, scheduleDate);
    setStatus(elements.calendarStatus, error.message || "未能儲存自評顯示設定。", "error");
  } finally {
    setMutationInFlight(false);
  }
}

async function saveDisplayPreferences(patch) {
  const student = activeStudent();
  if (!student || !state.currentUser) throw new Error("請先登入學生帳戶。");
  const result = state.currentUser.role === "admin"
    ? await callRpc("schedule_admin_set_display_preferences", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: student.id,
        p_patch: patch
      })
    : await callRpc("schedule_student_set_display_preferences", {
        p_token: state.currentUser.studentToken,
        p_patch: patch
      });
  if (!result || typeof result !== "object") throw new Error("未能儲存顯示設定。");
  return result;
}

async function toggleUnusedSlots() {
  if (state.mutationInFlight || !activeStudent()) return;
  const owner = displayPreferenceOwner();
  const requestId = state.displayPreferenceRequestId + 1;
  state.displayPreferenceRequestId = requestId;
  const isCurrentRequest = () => (
    state.displayPreferenceRequestId === requestId && displayPreferenceOwner() === owner
  );
  const previous = normalizeDisplayPreferences(state);
  const next = !unusedSlotsAreHidden();
  state.hideUnused = next;
  state.showUnusedTemporarily = false;
  applyDisplayPreferences();
  renderWeek();
  setMutationInFlight(true);
  try {
    const saved = await saveDisplayPreferences({ hideUnused: next });
    if (!isCurrentRequest()) return;
    applySavedDisplayPreferences(saved);
    renderWeek();
    showToast(next ? "已記住：登入後隱藏未使用格。" : "已記住：登入後顯示所有格。");
  } catch (error) {
    if (!isCurrentRequest()) return;
    console.warn("Schedule display preference save failed", error);
    restoreDisplayPreferences(previous);
    state.showUnusedTemporarily = false;
    applyDisplayPreferences();
    renderWeek();
    setStatus(elements.calendarStatus, error.message || "未能儲存顯示設定。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (isCurrentRequest()) setMutationInFlight(false);
  }
}

async function toggleMascots() {
  if (state.mutationInFlight || !activeStudent()) return;
  const owner = displayPreferenceOwner();
  const requestId = state.displayPreferenceRequestId + 1;
  state.displayPreferenceRequestId = requestId;
  const isCurrentRequest = () => (
    state.displayPreferenceRequestId === requestId && displayPreferenceOwner() === owner
  );
  const previous = normalizeDisplayPreferences(state);
  const next = !state.hideMascots;
  state.hideMascots = next;
  applyDisplayPreferences();
  setMutationInFlight(true);
  try {
    const saved = await saveDisplayPreferences({ hideMascots: next });
    if (!isCurrentRequest()) return;
    applySavedDisplayPreferences(saved);
    showToast(next ? "已隱藏吉祥物並收起日期標題。" : "已顯示吉祥物。");
  } catch (error) {
    if (!isCurrentRequest()) return;
    console.warn("Schedule mascot preference save failed", error);
    restoreDisplayPreferences(previous);
    applyDisplayPreferences();
    setStatus(elements.calendarStatus, error.message || "未能儲存吉祥物設定。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (isCurrentRequest()) setMutationInFlight(false);
  }
}

async function toggleStoredPanelPreference({ stateKey, patchKey, hiddenLabel, visibleLabel }) {
  if (state.mutationInFlight || !activeStudent()) return;
  const owner = displayPreferenceOwner();
  const requestId = state.displayPreferenceRequestId + 1;
  state.displayPreferenceRequestId = requestId;
  const isCurrentRequest = () => (
    state.displayPreferenceRequestId === requestId && displayPreferenceOwner() === owner
  );
  const previous = normalizeDisplayPreferences(state);
  const next = !state[stateKey];
  state[stateKey] = next;
  applyDisplayPreferences();
  setMutationInFlight(true);
  try {
    const saved = await saveDisplayPreferences({ [patchKey]: next });
    if (!isCurrentRequest()) return;
    applySavedDisplayPreferences(saved);
    showToast(next ? hiddenLabel : visibleLabel);
  } catch (error) {
    if (!isCurrentRequest()) return;
    console.warn("Schedule panel preference save failed", error);
    restoreDisplayPreferences(previous);
    applyDisplayPreferences();
    setStatus(elements.calendarStatus, error.message || "未能儲存顯示設定。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (isCurrentRequest()) setMutationInFlight(false);
  }
}

function toggleDailyQuoteVisibility() {
  return toggleStoredPanelPreference({
    stateKey: "hideDailyQuote",
    patchKey: "hideDailyQuote",
    hiddenLabel: "已隱藏每日名人語錄。",
    visibleLabel: "已顯示每日名人語錄。"
  });
}

function toggleEncouragementVisibility() {
  return toggleStoredPanelPreference({
    stateKey: "hideEncouragement",
    patchKey: "hideEncouragement",
    hiddenLabel: "已隱藏本週打氣說話。",
    visibleLabel: "已顯示本週打氣說話。"
  });
}

function toggleReminderEmailVisibility() {
  return toggleStoredPanelPreference({
    stateKey: "hideReminderEmail",
    patchKey: "hideReminderEmail",
    hiddenLabel: "已隱藏電郵列。",
    visibleLabel: "已顯示電郵列。"
  });
}

function normalizeEncouragement(value) {
  return {
    message: typeof value?.message === "string" ? value.message : "",
    updatedAt: value?.updatedAt || null,
    previousMessage: typeof value?.previousMessage === "string" ? value.previousMessage : "",
    canUsePrevious: value?.canUsePrevious === true
  };
}

function updateEncouragementControls() {
  if (!elements.encouragementMessage) return;
  const encouragement = normalizeEncouragement(state.weekPayload?.encouragement);
  const unavailable = !activeStudent() || state.encouragementBusy;
  elements.encouragementMessage.disabled = unavailable;
  elements.saveEncouragement.disabled = unavailable;
  elements.useLastEncouragement.disabled = unavailable;
  elements.useLastEncouragement.hidden = !encouragement.canUsePrevious || Boolean(encouragement.message);
}

function renderEncouragementFromPayload(statusText = "", status = "") {
  if (!elements.encouragementMessage) return;
  const encouragement = normalizeEncouragement(state.weekPayload?.encouragement);
  elements.encouragementMessage.value = encouragement.message;
  setStatus(elements.encouragementStatus, statusText, status);
  updateEncouragementControls();
}

async function mutateEncouragement(action, message = "") {
  const student = activeStudent();
  if (!student || !state.currentUser || state.encouragementBusy) return;
  const owner = displayPreferenceOwner();
  const requestedWeek = state.weekStart;
  const requestId = state.encouragementRequestId + 1;
  state.encouragementRequestId = requestId;
  const isCurrentRequest = () => (
    state.encouragementRequestId === requestId
    && state.weekStart === requestedWeek
    && displayPreferenceOwner() === owner
  );

  state.encouragementBusy = true;
  updateEncouragementControls();
  setStatus(elements.encouragementStatus, action === "carry" ? "正在沿用上星期的說話…" : "正在儲存…");
  try {
    let result;
    if (state.currentUser.role === "admin") {
      result = await callRpc(
        action === "carry" ? "schedule_admin_use_previous_encouragement" : "schedule_admin_save_encouragement",
        {
          p_admin_token: state.currentUser.adminToken,
          p_student_id: student.id,
          p_week_start: requestedWeek,
          ...(action === "save" ? { p_message: message } : {})
        }
      );
    } else {
      result = await callRpc(
        action === "carry" ? "schedule_student_use_previous_encouragement" : "schedule_student_save_encouragement",
        {
          p_token: state.currentUser.studentToken,
          p_week_start: requestedWeek,
          ...(action === "save" ? { p_message: message } : {})
        }
      );
    }
    if (!isCurrentRequest()) return;
    state.weekPayload.encouragement = normalizeEncouragement(result);
    const savedMessage = state.weekPayload.encouragement.message;
    renderEncouragementFromPayload(
      savedMessage ? (action === "carry" ? "已沿用上星期的打氣說話。" : "已儲存本星期的打氣說話。") : "已清除本星期的打氣說話。",
      "success"
    );
  } catch (error) {
    if (!isCurrentRequest()) return;
    console.warn("Schedule encouragement save failed", error);
    setStatus(elements.encouragementStatus, error.message || "未能儲存打氣說話。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (isCurrentRequest()) {
      state.encouragementBusy = false;
      updateEncouragementControls();
    }
  }
}

function saveWeeklyEncouragement() {
  const message = String(elements.encouragementMessage.value || "").trim();
  return mutateEncouragement("save", message);
}

function usePreviousWeekEncouragement() {
  return mutateEncouragement("carry");
}

function normalizeReminderEmail(value) {
  return {
    email: typeof value?.email === "string" ? value.email.trim() : "",
    updatedAt: value?.updatedAt || value?.updated_at || null
  };
}

function reminderEmailIsValid(value) {
  const email = String(value || "").trim();
  if (!email || email.length > 254 || /[\s\u0000-\u001f\u007f]/u.test(email)) return false;
  elements.reminderEmailInput.value = email;
  return elements.reminderEmailInput.validity.valid;
}

function updateReminderEmailControls() {
  if (!elements.reminderEmailInput) return;
  const unavailable = state.currentUser?.role !== "student" || state.reminderEmailBusy;
  const saved = normalizeReminderEmail(state.reminderEmail);
  elements.reminderEmailInput.disabled = unavailable;
  elements.updateReminderEmail.disabled = unavailable;
  elements.removeReminderEmail.disabled = unavailable || !saved.email;
}

function renderReminderEmail(statusText = "", status = "") {
  if (!elements.reminderEmailInput) return;
  const saved = normalizeReminderEmail(state.reminderEmail);
  elements.reminderEmailInput.value = saved.email;
  const defaultStatus = saved.email
    ? `已秘密儲存 · 最後更新 ${formatAdminDateTime(saved.updatedAt)}`
    : "尚未儲存提醒電郵。";
  setStatus(elements.reminderEmailStatus, statusText || defaultStatus, status);
  updateReminderEmailControls();
}

function validateReminderEmailInput({ announce = true } = {}) {
  const email = String(elements.reminderEmailInput?.value || "").trim();
  const valid = reminderEmailIsValid(email);
  if (announce) {
    setStatus(
      elements.reminderEmailStatus,
      valid ? "電郵格式正確，可以更新。" : "電郵格式不正確，請檢查後再試。",
      valid ? "success" : "error"
    );
  }
  return valid ? email : "";
}

async function saveReminderEmail() {
  if (state.currentUser?.role !== "student" || state.reminderEmailBusy) return;
  const email = validateReminderEmailInput();
  if (!email) {
    elements.reminderEmailInput.focus();
    return;
  }
  state.reminderEmailBusy = true;
  updateReminderEmailControls();
  setStatus(elements.reminderEmailStatus, "正在以私人方式儲存…");
  try {
    const result = await callRpc("schedule_student_set_reminder_email", {
      p_token: state.currentUser.studentToken,
      p_email: email
    });
    const saved = normalizeReminderEmail(result);
    if (!saved.email) throw new Error("未能確認電郵已儲存。");
    state.reminderEmail = saved;
    renderReminderEmail("電郵格式正確，並已秘密儲存。", "success");
    showToast("每日提醒電郵已更新。", "success");
  } catch (error) {
    setStatus(elements.reminderEmailStatus, error.message || "未能儲存提醒電郵。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    state.reminderEmailBusy = false;
    updateReminderEmailControls();
  }
}

async function deleteReminderEmail() {
  if (state.currentUser?.role !== "student" || state.reminderEmailBusy) return;
  if (!normalizeReminderEmail(state.reminderEmail).email) return;
  if (!window.confirm("確定要永久移除已儲存的提醒電郵嗎？")) return;
  state.reminderEmailBusy = true;
  updateReminderEmailControls();
  setStatus(elements.reminderEmailStatus, "正在移除…");
  try {
    const removed = await callRpc("schedule_student_delete_reminder_email", {
      p_token: state.currentUser.studentToken
    });
    if (removed !== true) throw new Error("未能確認電郵已移除。");
    state.reminderEmail = { email: "", updatedAt: null };
    renderReminderEmail("已永久移除提醒電郵。", "success");
    showToast("提醒電郵已移除。", "success");
  } catch (error) {
    setStatus(elements.reminderEmailStatus, error.message || "未能移除提醒電郵。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    state.reminderEmailBusy = false;
    updateReminderEmailControls();
  }
}

function updateLearningPurposeControls() {
  if (!elements.learningPurposeMessage
    || !elements.learningPurposeSave
    || !elements.learningPurposeDelete
    || !elements.learningPurposeOlder
    || !elements.learningPurposeNewer
    || !elements.learningPurposeLatest) return;
  const purpose = normalizeLearningPurposePayload(state.learningPurpose);
  const isStudent = state.currentUser?.role === "student";
  const unavailable = !activeStudent() || state.learningPurposeBusy;
  elements.learningPurposeMessage.readOnly = !isStudent;
  elements.learningPurposeMessage.disabled = unavailable;
  elements.learningPurposeSave.hidden = !isStudent;
  elements.learningPurposeDelete.hidden = !isStudent || !purpose.id;
  elements.learningPurposeSave.disabled = unavailable;
  elements.learningPurposeDelete.disabled = unavailable || !purpose.id;
  elements.learningPurposeOlder.disabled = unavailable || !purpose.olderId;
  elements.learningPurposeNewer.disabled = unavailable || !purpose.newerId;
  elements.learningPurposeLatest.disabled = unavailable || !purpose.id || purpose.isLatest;
}

function renderLearningPurpose(statusText = "", status = "") {
  if (!elements.learningPurposeMessage
    || !elements.learningPurposePosition
    || !elements.learningPurposeUpdated
    || !elements.learningPurposeStatus) return;
  const purpose = normalizeLearningPurposePayload(state.learningPurpose);
  elements.learningPurposeMessage.value = purpose.message;
  elements.learningPurposePosition.textContent = purpose.totalCount
    ? `第 ${purpose.position} / ${purpose.totalCount} 個版本`
    : "尚未儲存初心";
  elements.learningPurposeUpdated.textContent = purpose.updatedAt
    ? `最後更新：${formatAdminDateTime(purpose.updatedAt)}`
    : "最後更新：—";
  setStatus(elements.learningPurposeStatus, statusText, status);
  applyPurposeFontSize();
  updateLearningPurposeControls();
}

function normalizeLanguageOpportunities(value) {
  const row = Array.isArray(value) ? value[0] : value;
  return {
    message: String(row?.message || ""),
    updatedAt: row?.updated_at || row?.updatedAt || null
  };
}

function renderLanguageOpportunities(statusText = "", status = "") {
  if (!elements.languageOpportunitiesMessage) return;
  elements.languageOpportunitiesMessage.value = state.languageOpportunitiesMessage;
  const isStudent = state.currentUser?.role === "student";
  elements.languageOpportunitiesMessage.readOnly = !isStudent;
  elements.languageOpportunitiesSave.hidden = !isStudent;
  elements.languageOpportunitiesSave.disabled = state.languageOpportunitiesBusy;
  setStatus(elements.languageOpportunitiesStatus, statusText, status);
}

async function saveLanguageOpportunities() {
  if (state.currentUser?.role !== "student" || state.languageOpportunitiesBusy) return;
  const message = String(elements.languageOpportunitiesMessage.value || "").trim();
  if (message.length > 1000) return setStatus(elements.languageOpportunitiesStatus, "內容最多 1,000 個字元。", "error");
  state.languageOpportunitiesBusy = true;
  renderLanguageOpportunities("正在儲存…");
  try {
    const result = await callRpc("schedule_student_save_language_opportunities", {
      p_token: state.currentUser.studentToken,
      p_message: message
    });
    state.languageOpportunitiesMessage = normalizeLanguageOpportunities(result).message;
    renderLanguageOpportunities(message ? "已儲存語言與機遇。" : "已清除語言與機遇。", "success");
  } catch (error) {
    renderLanguageOpportunities(error.message || "未能儲存語言與機遇。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    state.languageOpportunitiesBusy = false;
    renderLanguageOpportunities(elements.languageOpportunitiesStatus.textContent, elements.languageOpportunitiesStatus.dataset.state || "");
  }
}

function renderLearningDayCounters() {
  const show = state.currentUser?.role === "student";
  elements.learningDayCounters.hidden = !show;
  if (!show) return;
  elements.dayStreak.textContent = String(state.learningDaySummary.streak || 0);
  elements.learningDays.textContent = String(state.learningDaySummary.total || 0);
}

async function loadLearningDayCounters() {
  if (state.currentUser?.role !== "student") return;
  try {
    const response = await fetch(`${STUDENT_PROGRESS_WORKER_URL}/v1/progress`, {
      method: "GET",
      headers: { Authorization: `Bearer ${state.currentUser.studentToken}`, Accept: "application/json" },
      credentials: "omit",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Student Progress returned ${response.status}`);
    const payload = await response.json();
    state.learningDaySummary = learningDaySummary(payload?.snapshot, hongKongDayKey(new Date()));
  } catch (error) {
    console.warn("Cross-system learning-day summary failed", error);
    state.learningDaySummary = { streak: 0, total: 0 };
  }
  renderLearningDayCounters();
}

async function loadLearningPurposeVersion(versionId = null) {
  const student = activeStudent();
  if (!student || !state.currentUser || state.learningPurposeBusy) return;
  const owner = displayPreferenceOwner();
  const requestId = state.learningPurposeRequestId + 1;
  state.learningPurposeRequestId = requestId;
  state.learningPurposeBusy = true;
  updateLearningPurposeControls();
  setStatus(elements.learningPurposeStatus, "正在載入初心版本…");
  try {
    const result = state.currentUser.role === "admin"
      ? await callRpc("schedule_admin_get_learning_purpose", {
          p_admin_token: state.currentUser.adminToken,
          p_student_id: student.id,
          p_version_id: versionId || null
        })
      : await callRpc("schedule_student_get_learning_purpose", {
          p_token: state.currentUser.studentToken,
          p_version_id: versionId || null
        });
    if (requestId !== state.learningPurposeRequestId || owner !== displayPreferenceOwner()) return;
    state.learningPurpose = normalizeLearningPurposePayload(result);
    renderLearningPurpose();
  } catch (error) {
    if (requestId !== state.learningPurposeRequestId || owner !== displayPreferenceOwner()) return;
    setStatus(elements.learningPurposeStatus, error.message || "未能載入初心版本。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (requestId === state.learningPurposeRequestId) {
      state.learningPurposeBusy = false;
      updateLearningPurposeControls();
    }
  }
}

async function saveLearningPurpose() {
  if (state.currentUser?.role !== "student" || state.learningPurposeBusy) return;
  const message = String(elements.learningPurposeMessage.value || "").trim();
  if (!message || message.length > 1000) {
    setStatus(elements.learningPurposeStatus, "請輸入 1 至 1000 個字元的學習初心。", "error");
    return;
  }
  state.learningPurposeBusy = true;
  updateLearningPurposeControls();
  setStatus(elements.learningPurposeStatus, "正在儲存新版本…");
  try {
    const result = await callRpc("schedule_student_save_learning_purpose", {
      p_token: state.currentUser.studentToken,
      p_message: message
    });
    state.learningPurpose = normalizeLearningPurposePayload(result);
    renderLearningPurpose("已永久保留這個初心版本。", "success");
  } catch (error) {
    setStatus(elements.learningPurposeStatus, error.message || "未能儲存學習初心。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    state.learningPurposeBusy = false;
    updateLearningPurposeControls();
  }
}

async function deleteLearningPurpose() {
  const purpose = normalizeLearningPurposePayload(state.learningPurpose);
  if (state.currentUser?.role !== "student" || !purpose.id || state.learningPurposeBusy) return;
  if (!window.confirm("確定永久刪除目前顯示的初心版本嗎？\n刪除後無法復原。")) return;
  state.learningPurposeBusy = true;
  updateLearningPurposeControls();
  setStatus(elements.learningPurposeStatus, "正在永久刪除版本…");
  try {
    const result = await callRpc("schedule_student_delete_learning_purpose", {
      p_token: state.currentUser.studentToken,
      p_version_id: purpose.id
    });
    state.learningPurpose = normalizeLearningPurposePayload(result);
    renderLearningPurpose("已永久刪除所選版本。", "success");
  } catch (error) {
    setStatus(elements.learningPurposeStatus, error.message || "未能刪除初心版本。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    state.learningPurposeBusy = false;
    updateLearningPurposeControls();
  }
}

function renderMetrics() {
  if (!activeStudent()) {
    setMetricsUnavailable();
    return;
  }
  const metrics = state.weekPayload?.metrics || emptyWeekPayload().metrics;
  elements.metricWeekGoals.textContent = String(Number(metrics.weekGoals) || 0);
  elements.metricTotalGoals.textContent = String(Number(metrics.totalGoals) || 0);
  elements.metricWeekCompleted.textContent = String(Number(metrics.weekCompleted) || 0);
  elements.metricTotalCompleted.textContent = String(Number(metrics.totalCompleted) || 0);
  renderHomeworkTypeDashboard(metrics.homeworkTypeCounts);
}

function setMetricsUnavailable() {
  elements.metricWeekGoals.textContent = "—";
  elements.metricTotalGoals.textContent = "—";
  elements.metricWeekCompleted.textContent = "—";
  elements.metricTotalCompleted.textContent = "—";
  renderHomeworkTypeDashboard();
}

function renderHomeworkTypeDashboard(rawCounts = {}) {
  if (!elements.homeworkTypePie || !elements.homeworkTypeLegend || !elements.homeworkTypeTotal) return;
  const rows = HOMEWORK_RESOURCE_TYPES.map((definition) => ({
    ...definition,
    count: Math.max(0, Number(rawCounts?.[definition.type]) || 0)
  }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  elements.homeworkTypeTotal.textContent = String(total);
  elements.homeworkTypeLegend.replaceChildren();

  let consumed = 0;
  const segments = [];
  rows.forEach((row) => {
    const percentage = total ? row.count / total * 100 : 0;
    if (row.count) {
      segments.push(`${row.color} ${consumed.toFixed(3)}% ${(consumed + percentage).toFixed(3)}%`);
      consumed += percentage;
    }
    const item = document.createElement("li");
    const identity = document.createElement("span");
    identity.className = "homework-type-identity";
    const swatch = document.createElement("i");
    swatch.className = "homework-type-swatch";
    swatch.style.backgroundColor = row.color;
    swatch.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = row.label;
    identity.append(swatch, label);
    const value = document.createElement("strong");
    value.textContent = `${row.count} · ${percentage.toFixed(total ? 1 : 0)}%`;
    item.append(identity, value);
    elements.homeworkTypeLegend.append(item);
  });

  elements.homeworkTypePie.style.background = total
    ? `conic-gradient(${segments.join(", ")})`
    : "conic-gradient(#ded8cf 0 100%)";
  elements.homeworkTypePie.setAttribute(
    "aria-label",
    total
      ? `累計 ${total} 項已分類功課：${rows.map((row) => `${row.label} ${row.count} 項`).join("；")}`
      : "暫未有附上系統連結的已分類功課"
  );
  if (elements.homeworkTypeNote) {
    elements.homeworkTypeNote.textContent = total
      ? `按所有已儲存安排內的功課連結累計，共 ${total} 項；圓形圖合計為 100%。`
      : "加入系統功課連結後，這裡會按類型顯示累計分佈。";
  }
}

function todayISO() {
  return hongKongDayKey();
}

function displayedWeekUrl() {
  return buildScheduleWeekUrl(window.location.href, state.weekStart);
}

function syncDisplayedWeekUrl() {
  try {
    const url = displayedWeekUrl();
    if (url !== window.location.href) window.history.replaceState(null, "", url);
  } catch {
    // A URL-sync failure must never stop a student from opening the timetable.
  }
}

async function copyTextWithFallback(text) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "clipboard";
    } catch {
      // Continue to the selection-based fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.setAttribute("aria-hidden", "true");
  Object.assign(textarea.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    opacity: "0"
  });
  document.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    textarea.remove();
  }
  if (copied) return "fallback";

  window.prompt("請複製以下訊息：", text);
  return "manual";
}

async function copyDisplayedWeekLink() {
  try {
    const message = scheduleWeekShareMessage(displayedWeekUrl());
    const method = await copyTextWithFallback(message);
    showToast(method === "manual" ? "已顯示本週訊息，請手動複製。" : "已複製本週功課連結。", "success");
  } catch {
    showToast("暫時未能建立本週連結，請重新整理後再試。", "error");
  }
}

function refreshCountdownCards() {
  if (!elements.countdownGrid || document.hidden) return;
  elements.countdownGrid.querySelectorAll("[data-countdown-position]").forEach(updateCountdownCard);
}

function countdownByPosition(position) {
  return state.weekPayload.countdowns.find((countdown) => Number(countdown.position) === Number(position)) || null;
}

function countdownOwnerKey() {
  const student = activeStudent();
  return student?.id ? String(student.id) : "";
}

function countdownCollapseStorageKey(owner) {
  return `${COUNTDOWN_COLLAPSED_KEY}:${owner}`;
}

function ensureCountdownCollapseOwner() {
  const owner = countdownOwnerKey();
  if (owner === state.countdownCollapsedOwner) return owner;
  state.countdownCollapsedOwner = owner;
  state.countdownCollapsedPositions.clear();
  if (!owner) return "";
  try {
    const saved = JSON.parse(localStorage.getItem(countdownCollapseStorageKey(owner)) || "[]");
    if (Array.isArray(saved)) {
      saved.forEach((position) => {
        const normalized = Number(position);
        if (Number.isInteger(normalized) && normalized >= 1 && normalized <= MAX_COUNTDOWNS) {
          state.countdownCollapsedPositions.add(normalized);
        }
      });
    }
  } catch {
    // A malformed or unavailable local preference should never block the clocks.
  }
  return owner;
}

function saveCountdownCollapsePreferences() {
  const owner = ensureCountdownCollapseOwner();
  if (!owner) return;
  try {
    localStorage.setItem(
      countdownCollapseStorageKey(owner),
      JSON.stringify([...state.countdownCollapsedPositions].sort((left, right) => left - right))
    );
  } catch {
    // Collapse controls still work for the current page when storage is unavailable.
  }
}

function setCountdownCardCollapsed(card, collapsed, { persist = true } = {}) {
  if (!card) return;
  const position = Number(card.dataset.countdownPosition);
  const body = card.querySelector("[data-countdown-card-body]");
  const toggle = card.querySelector("[data-toggle-countdown-collapse]");
  if (!body || !toggle || !Number.isInteger(position)) return;
  body.hidden = Boolean(collapsed);
  card.classList.toggle("is-collapsed", Boolean(collapsed));
  toggle.textContent = collapsed ? "+" : "−";
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.setAttribute("aria-label", `${collapsed ? "展開" : "收起"} Clock ${position}`);
  toggle.title = `${collapsed ? "展開" : "收起"} Clock ${position}`;
  if (collapsed) state.countdownCollapsedPositions.add(position);
  else state.countdownCollapsedPositions.delete(position);
  if (persist) saveCountdownCollapsePreferences();
}

function ensureCountdownDraftOwner() {
  const owner = countdownOwnerKey();
  if (owner !== state.countdownDraftOwner) {
    state.countdownDraftOwner = owner;
    state.countdownDrafts.clear();
  }
  return owner;
}

function rememberCountdownDraft(card, { dirty = true } = {}) {
  if (!card || !ensureCountdownDraftOwner()) return;
  const position = Number(card.dataset.countdownPosition);
  if (!Number.isInteger(position)) return;
  const existing = state.countdownDrafts.get(position);
  const isDirty = dirty || existing?.dirty === true || card.dataset.countdownDirty === "true";
  card.dataset.countdownDirty = String(isDirty);
  if (isDirty) {
    const note = card.querySelector("[data-countdown-note]");
    if (note) note.textContent = "尚未儲存的草稿已保留。";
    const discard = card.querySelector("[data-delete-countdown]");
    if (discard && !card.dataset.countdownId) {
      discard.hidden = false;
      discard.textContent = "捨棄草稿";
    }
  }
  state.countdownDrafts.set(position, {
    values: countdownCardValues(card),
    expanded: !card.querySelector("[data-countdown-study-breakdown]")?.hidden,
    dirty: isDirty
  });
}

function captureCountdownDrafts() {
  if (!elements.countdownGrid || !ensureCountdownDraftOwner()) return;
  elements.countdownGrid.querySelectorAll("[data-countdown-position]").forEach((card) => {
    const position = Number(card.dataset.countdownPosition);
    if (card.dataset.countdownDirty === "true" || state.countdownDrafts.has(position)) {
      rememberCountdownDraft(card, { dirty: card.dataset.countdownDirty === "true" });
    }
  });
}

function discardCountdownDraft(position) {
  state.countdownDrafts.delete(Number(position));
  const card = elements.countdownGrid?.querySelector(`[data-countdown-position="${Number(position)}"]`);
  if (card) card.dataset.countdownDirty = "false";
}

function renderCountdowns() {
  if (!elements.countdownGrid) return;
  ensureCountdownDraftOwner();
  ensureCountdownCollapseOwner();
  elements.countdownGrid.replaceChildren();
  const persistedCapacity = Math.max(MIN_COUNTDOWNS, Math.min(MAX_COUNTDOWNS, Number(state.weekPayload.countdownCapacity) || MIN_COUNTDOWNS));
  const furthestDraft = Math.max(0, ...state.countdownDrafts.keys());
  const draftCapacity = furthestDraft <= MIN_COUNTDOWNS
    ? MIN_COUNTDOWNS
    : MIN_COUNTDOWNS + Math.ceil((furthestDraft - MIN_COUNTDOWNS) / COUNTDOWN_STEP) * COUNTDOWN_STEP;
  const capacity = Math.min(MAX_COUNTDOWNS, Math.max(persistedCapacity, draftCapacity));
  elements.addCountdowns.disabled = state.mutationInFlight || persistedCapacity >= MAX_COUNTDOWNS;
  elements.removeCountdowns.disabled = state.mutationInFlight || persistedCapacity <= MIN_COUNTDOWNS;

  for (let position = 1; position <= capacity; position += 1) {
    const card = createCountdownCard(position, countdownByPosition(position), state.countdownDrafts.get(position));
    if (position > persistedCapacity) card.classList.add("is-draft-beyond-capacity");
    elements.countdownGrid.append(card);
  }
}

function createCountdownCard(position, countdown, draft = null) {
  const initial = draft?.values || countdown || {};
  const card = document.createElement("article");
  card.className = "countdown-card";
  card.dataset.countdownPosition = String(position);
  card.dataset.countdownDirty = String(draft?.dirty === true);
  if (countdown?.id) card.dataset.countdownId = countdown.id;

  const cardHeader = document.createElement("header");
  cardHeader.className = "countdown-card-header";
  const heading = document.createElement("h3");
  heading.textContent = `Clock ${position}`;
  const collapse = document.createElement("button");
  collapse.type = "button";
  collapse.className = "countdown-collapse-toggle";
  collapse.dataset.toggleCountdownCollapse = "";
  const body = document.createElement("div");
  body.className = "countdown-card-body";
  body.dataset.countdownCardBody = "";
  body.id = `schedule-countdown-body-${position}`;
  collapse.setAttribute("aria-controls", body.id);
  cardHeader.append(heading, collapse);
  const fields = document.createElement("div");
  fields.className = "countdown-form-grid";

  const makeField = (labelText, input) => {
    const label = document.createElement("label");
    label.append(labelText, input);
    return label;
  };
  const title = document.createElement("input");
  title.type = "text";
  title.maxLength = 160;
  title.placeholder = "Title／事件名稱";
  title.dataset.countdownTitle = "";
  title.value = initial.title || "";

  const start = document.createElement("input");
  start.type = "date";
  start.min = SCHEDULE_MIN_DATE;
  start.max = SCHEDULE_MAX_DATE;
  start.dataset.countdownStart = "";
  start.value = initial.startDate || todayISO();
  const end = document.createElement("input");
  end.type = "date";
  end.min = SCHEDULE_MIN_DATE;
  end.max = SCHEDULE_MAX_DATE;
  end.dataset.countdownEnd = "";
  end.value = initial.endDate || todayISO();
  fields.append(makeField("事件名稱", title), makeField("開始日期（可更改）", start), makeField("結束日期", end));

  const days = document.createElement("p");
  days.className = "countdown-days";
  days.dataset.countdownDays = "";
  const detailGrid = document.createElement("div");
  detailGrid.className = "countdown-details-grid";
  ["months", "weeks", "hours", "minutes"].forEach((key) => {
    const value = document.createElement("span");
    value.dataset.countdownBreakdown = key;
    detailGrid.append(value);
  });

  const calculator = document.createElement("div");
  calculator.className = "study-calculator";
  const studyMain = document.createElement("div");
  studyMain.className = "study-main";
  const studyPrefix = document.createElement("span");
  studyPrefix.textContent = "如果我每天溫習";
  const daily = document.createElement("input");
  daily.type = "number";
  daily.min = "0";
  daily.max = "24";
  daily.step = "0.25";
  daily.inputMode = "decimal";
  daily.dataset.countdownDailyHours = "";
  daily.value = String(Number(initial.dailyHours) || 0);
  const result = document.createElement("span");
  result.className = "study-result";
  result.dataset.countdownStudyResult = "";
  studyMain.append(studyPrefix, daily, result);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "countdown-detail-toggle";
  toggle.dataset.countdownDetailToggle = "";
  toggle.textContent = "詳細設定：早上／下午／晚上";
  toggle.setAttribute("aria-expanded", "false");
  const breakdown = document.createElement("div");
  breakdown.className = "study-breakdown";
  breakdown.dataset.countdownStudyBreakdown = "";
  breakdown.hidden = draft?.expanded !== true;
  for (const [key, labelText] of [["morning", "早上"], ["afternoon", "下午"], ["evening", "晚上"]]) {
    const label = document.createElement("label");
    const copy = document.createElement("span");
    copy.textContent = `如果我每天${labelText}溫習`;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "24";
    input.step = "0.25";
    input.inputMode = "decimal";
    input.dataset.countdownPart = key;
    input.value = String(Number(initial[`${key}Hours`]) || 0);
    const suffix = document.createElement("span");
    suffix.textContent = "小時";
    const partResult = document.createElement("span");
    partResult.className = "study-part-result";
    partResult.dataset.countdownPartResult = key;
    label.append(copy, input, suffix, partResult);
    breakdown.append(label);
  }
  calculator.append(studyMain, toggle, breakdown);

  const actions = document.createElement("div");
  actions.className = "countdown-actions";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "secondary-button";
  remove.dataset.deleteCountdown = "";
  remove.textContent = countdown ? "清除" : "捨棄草稿";
  remove.hidden = !countdown && !draft?.dirty;
  const save = document.createElement("button");
  save.type = "button";
  save.className = "primary-button";
  save.dataset.saveCountdown = "";
  save.textContent = "儲存倒數鐘";
  actions.append(remove, save);

  const note = document.createElement("p");
  note.className = "countdown-empty-note";
  note.dataset.countdownNote = "";
  note.textContent = draft?.dirty
    ? "尚未儲存的草稿已保留。"
    : countdown
      ? "已儲存於雲端"
      : "尚未設定；填寫後按儲存。";
  body.append(fields, days, detailGrid, calculator, actions, note);
  card.append(cardHeader, body);

  const update = () => updateCountdownCard(card);
  card.addEventListener("input", (event) => {
    if (event.target === daily && breakdown.hidden) {
      breakdown.querySelectorAll("[data-countdown-part]").forEach((input) => { input.value = "0"; });
    }
    update();
    rememberCountdownDraft(card);
  });
  card.addEventListener("change", () => {
    update();
    rememberCountdownDraft(card);
  });
  toggle.addEventListener("click", () => {
    breakdown.hidden = !breakdown.hidden;
    toggle.setAttribute("aria-expanded", String(!breakdown.hidden));
    if (!breakdown.hidden) {
      const sum = [...breakdown.querySelectorAll("[data-countdown-part]")]
        .reduce((total, input) => total + (Number(input.value) || 0), 0);
      if (sum > 0) daily.value = String(Math.round(sum * 100) / 100);
    }
    update();
    rememberCountdownDraft(card, { dirty: card.dataset.countdownDirty === "true" });
  });
  collapse.addEventListener("click", () => {
    setCountdownCardCollapsed(card, !body.hidden);
  });
  toggle.setAttribute("aria-expanded", String(!breakdown.hidden));
  update();
  setCountdownCardCollapsed(card, state.countdownCollapsedPositions.has(position), { persist: false });
  return card;
}

function updateCountdownCard(card) {
  const end = card.querySelector("[data-countdown-end]").value;
  const title = card.querySelector("[data-countdown-title]").value.trim() || "此事件";
  const now = new Date();
  const detail = countdownBreakdownFromHongKongNow(end, now);
  card.querySelector("[data-countdown-days]").textContent = `${detail.days} 日剩餘`;
  card.querySelector('[data-countdown-breakdown="months"]').textContent = `${detail.months} 個月 ${detail.monthWeeks} 星期`;
  card.querySelector('[data-countdown-breakdown="weeks"]').textContent = `${detail.weeks} 星期 ${detail.weekDays} 日`;
  card.querySelector('[data-countdown-breakdown="hours"]').textContent = `${detail.hours} 小時 ${detail.hourMinutes} 分鐘`;
  card.querySelector('[data-countdown-breakdown="minutes"]').textContent = `${detail.minutes.toLocaleString()} 分鐘`;

  const breakdown = card.querySelector("[data-countdown-study-breakdown]");
  const daily = card.querySelector("[data-countdown-daily-hours]");
  if (!breakdown.hidden) {
    const total = [...breakdown.querySelectorAll("[data-countdown-part]")]
      .reduce((sum, input) => sum + (Number(input.value) || 0), 0);
    daily.value = String(Math.round(total * 100) / 100);
  }
  const studyHours = studyHoursFromHongKongNow(end, daily.value, now);
  card.querySelector("[data-countdown-study-result]").textContent = `小時，每天累計可在「${title}」前溫習 ${studyHours.toLocaleString()} 小時`;
  breakdown.querySelectorAll("[data-countdown-part]").forEach((input) => {
    const partResult = breakdown.querySelector(`[data-countdown-part-result="${input.dataset.countdownPart}"]`);
    partResult.textContent = `可在「${title}」前溫習 ${studyHoursFromHongKongNow(end, input.value, now).toLocaleString()} 小時`;
  });
}

function countdownCardValues(card) {
  const parts = Object.fromEntries([...card.querySelectorAll("[data-countdown-part]")]
    .map((input) => [input.dataset.countdownPart, Math.max(0, Number(input.value) || 0)]));
  return {
    position: Number(card.dataset.countdownPosition),
    title: card.querySelector("[data-countdown-title]").value.trim(),
    startDate: card.querySelector("[data-countdown-start]").value,
    endDate: card.querySelector("[data-countdown-end]").value,
    dailyHours: Math.max(0, Number(card.querySelector("[data-countdown-daily-hours]").value) || 0),
    morningHours: parts.morning || 0,
    afternoonHours: parts.afternoon || 0,
    eveningHours: parts.evening || 0
  };
}

function setCountdownCardBusy(card, busy) {
  if (!card) return;
  card.setAttribute("aria-busy", String(Boolean(busy)));
  card.querySelectorAll("input, button").forEach((control) => {
    control.disabled = Boolean(busy);
  });
}

async function saveCountdown(card) {
  if (state.massEditMode) return;
  if (state.mutationInFlight) return;
  const values = countdownCardValues(card);
  const persistedCapacity = Math.max(MIN_COUNTDOWNS, Number(state.weekPayload.countdownCapacity) || MIN_COUNTDOWNS);
  if (values.position > persistedCapacity) {
    setStatus(elements.countdownStatus, `Clock ${values.position} 的草稿仍在；請先按「增加 5 個倒數鐘」再儲存。`, "error");
    return;
  }
  if (!values.title) {
    setStatus(elements.countdownStatus, `Clock ${values.position} 請輸入事件名稱。`, "error");
    return;
  }
  if (!values.startDate || !values.endDate || values.endDate < values.startDate) {
    setStatus(elements.countdownStatus, `Clock ${values.position} 的結束日期不可早於開始日期。`, "error");
    return;
  }
  if ([values.dailyHours, values.morningHours, values.afternoonHours, values.eveningHours]
    .some((hours) => hours < 0 || hours > 24)) {
    setStatus(elements.countdownStatus, `Clock ${values.position} 的每日時數須為 0 至 24 小時。`, "error");
    return;
  }
  setMutationInFlight(true);
  setCountdownCardBusy(card, true);
  setStatus(elements.countdownStatus, `正在儲存 Clock ${values.position}…`);
  try {
    const common = {
      p_position: values.position,
      p_title: values.title,
      p_start_date: values.startDate,
      p_end_date: values.endDate,
      p_daily_hours: values.dailyHours,
      p_morning_hours: values.morningHours,
      p_afternoon_hours: values.afternoonHours,
      p_evening_hours: values.eveningHours,
      p_expected_updated_at: countdownByPosition(values.position)?.updatedAt || null
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_upsert_countdown", { ...common, p_admin_token: state.currentUser.adminToken, p_student_id: activeStudent().id });
    } else {
      await callRpc("schedule_student_upsert_countdown", { ...common, p_token: state.currentUser.studentToken });
    }
    discardCountdownDraft(values.position);
    showToast(`Clock ${values.position} 已儲存。`);
    await loadWeek();
  } catch (error) {
    if (isConcurrencyError(error)) {
      showToast("倒數鐘已在另一個頁面更新；草稿會保留並重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.countdownStatus, error.message || "未能儲存倒數鐘。", "error");
      if (isExpiredSessionError(error)) await logout();
    }
  } finally {
    setCountdownCardBusy(card, false);
    setMutationInFlight(false);
  }
}

async function deleteCountdown(card) {
  if (state.massEditMode) return;
  const position = Number(card.dataset.countdownPosition);
  const countdown = countdownByPosition(position);
  if (state.mutationInFlight) return;
  if (!countdown) {
    if (card.dataset.countdownDirty !== "true") return;
    if (!window.confirm(`確定要捨棄 Clock ${position} 的未儲存草稿嗎？`)) return;
    discardCountdownDraft(position);
    renderCountdowns();
    showToast(`Clock ${position} 的草稿已捨棄。`);
    return;
  }
  if (!window.confirm(`確定要清除 Clock ${countdown.position}「${countdown.title}」嗎？`)) return;
  setMutationInFlight(true);
  setCountdownCardBusy(card, true);
  try {
    const common = { p_countdown_id: countdown.id, p_expected_updated_at: countdown.updatedAt };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_delete_countdown", { ...common, p_admin_token: state.currentUser.adminToken, p_student_id: activeStudent().id });
    } else {
      await callRpc("schedule_student_delete_countdown", { ...common, p_token: state.currentUser.studentToken });
    }
    discardCountdownDraft(countdown.position);
    showToast(`Clock ${countdown.position} 已清除。`);
    await loadWeek();
  } catch (error) {
    if (isConcurrencyError(error)) {
      showToast("倒數鐘已在另一個頁面更新；已重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.countdownStatus, error.message || "未能清除倒數鐘。", "error");
    }
  } finally {
    setCountdownCardBusy(card, false);
    setMutationInFlight(false);
  }
}

async function changeCountdownCapacity(delta) {
  if (state.massEditMode) return;
  if (state.mutationInFlight || ![-COUNTDOWN_STEP, COUNTDOWN_STEP].includes(delta)) return;
  captureCountdownDrafts();
  const current = Math.max(MIN_COUNTDOWNS, Number(state.weekPayload.countdownCapacity) || MIN_COUNTDOWNS);
  const plan = planCountdownCapacityChange(current, delta, {
    savedPositions: state.weekPayload.countdowns.map((countdown) => countdown.position),
    dirtyPositions: [...state.countdownDrafts.entries()]
      .filter(([, draft]) => draft?.dirty)
      .map(([position]) => position),
    maximum: MAX_COUNTDOWNS
  });
  if (!plan.allowed && plan.reason === "dirty") {
    setStatus(
      elements.countdownStatus,
      `Clock ${Math.min(...plan.blockedPositions)}–${Math.max(...plan.blockedPositions)} 仍有未儲存草稿，請先儲存或清除。`,
      "error"
    );
    return;
  }
  if (!plan.allowed && plan.reason === "saved") {
    setStatus(elements.countdownStatus, "最後 5 個倒數鐘仍有資料，請先清除。", "error");
    return;
  }
  if (!plan.allowed) return;
  const { target } = plan;
  setMutationInFlight(true);
  try {
    const common = { p_expected_count: current, p_delta: delta };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_change_countdown_capacity_checked", { ...common, p_admin_token: state.currentUser.adminToken, p_student_id: activeStudent().id });
    } else {
      await callRpc("schedule_student_change_countdown_capacity_checked", { ...common, p_token: state.currentUser.studentToken });
    }
    if (delta < 0) {
      [...state.countdownDrafts.keys()].forEach((position) => {
        if (position > target) state.countdownDrafts.delete(position);
      });
    }
    showToast(delta > 0 ? "已增加 5 個倒數鐘。" : "已減少 5 個空白倒數鐘。");
    await loadWeek();
  } catch (error) {
    if (isConcurrencyError(error)) {
      showToast("倒數鐘數目已在另一個頁面更新；草稿會保留並重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.countdownStatus, error.message || "未能調整倒數鐘數目。", "error");
    }
  } finally {
    setMutationInFlight(false);
  }
}

function saveSession() {
  if (!state.currentUser) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  const session = state.currentUser.role === "admin"
    ? {
        role: "admin",
        name: state.currentUser.name,
        adminToken: state.currentUser.adminToken,
        expiresAt: state.currentUser.expiresAt
      }
    : {
        role: "student",
        id: state.currentUser.id,
        name: state.currentUser.name,
        studentToken: state.currentUser.studentToken
      };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function ensureSupabaseAuth() {
  if (!supabaseClient) throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  if (!supabaseAuthPromise) {
    supabaseAuthPromise = (async () => {
      const current = await supabaseClient.auth.getSession();
      if (current.error) throw current.error;
      if (current.data?.session?.user?.id) return current.data.session;

      const signIn = await supabaseClient.auth.signInAnonymously();
      if (signIn.error) throw signIn.error;
      if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全連線。");
      return signIn.data.session;
    })().catch((error) => {
      supabaseAuthPromise = null;
      throw error;
    });
  }
  return supabaseAuthPromise;
}

async function callRpc(name, args = {}) {
  await ensureSupabaseAuth();
  const { data, error } = await supabaseClient.rpc(name, args);
  if (error) throw error;
  return data;
}

async function announcementApi(path, options = {}) {
  if (state.currentUser?.role !== "admin" || !state.currentUser.adminToken) {
    throw new Error("管理員登入已失效，請重新登入。");
  }
  const baseUrl = String(scheduleSettings.workerBaseUrl || "").replace(/\/+$/, "");
  if (!baseUrl.startsWith("https://")) throw new Error("公告服務暫時未能載入。");
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${state.currentUser.adminToken}`,
      ...(options.headers || {})
    }
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "公告服務暫時未能完成操作。");
  return payload;
}

function announcementBeingEdited() {
  return state.announcements.find((announcement) => announcement.id === state.editingAnnouncementId) || null;
}

function syncAnnouncementImageControls() {
  const announcement = announcementBeingEdited();
  const editing = Boolean(announcement);
  elements.announcementImageActionField.hidden = !editing;
  if (!editing) {
    elements.announcementImage.disabled = state.announcementMutationInFlight;
    elements.announcementImage.required = false;
    return;
  }
  const keepOption = elements.announcementImageAction.querySelector('option[value="keep"]');
  const removeOption = elements.announcementImageAction.querySelector('option[value="remove"]');
  keepOption.textContent = announcement.hasImage ? "保留目前圖片" : "維持沒有圖片";
  removeOption.disabled = !announcement.hasImage;
  if (!announcement.hasImage && elements.announcementImageAction.value === "remove") {
    elements.announcementImageAction.value = "keep";
  }
  const replacing = elements.announcementImageAction.value === "replace";
  elements.announcementImage.disabled = state.announcementMutationInFlight || !replacing;
  elements.announcementImage.required = replacing;
  if (!replacing) elements.announcementImage.value = "";
}

function setAnnouncementMutationInFlight(busy) {
  state.announcementMutationInFlight = Boolean(busy);
  elements.announcementForm?.querySelectorAll("textarea, input, select, button").forEach((control) => {
    control.disabled = state.announcementMutationInFlight;
  });
  elements.announcementList?.querySelectorAll("button").forEach((button) => {
    button.disabled = state.announcementMutationInFlight;
  });
  syncAnnouncementImageControls();
}

function announcementEditHasUnsavedChanges() {
  const announcement = announcementBeingEdited();
  if (!announcement) return false;
  return elements.announcementMessage.value.trim() !== announcement.message
    || elements.announcementActive.checked !== announcement.isActive
    || elements.announcementImageAction.value !== "keep"
    || Boolean(elements.announcementImage.files?.length);
}

function resetAnnouncementForm() {
  state.editingAnnouncementId = null;
  state.editingAnnouncementVersion = null;
  elements.announcementForm.reset();
  elements.announcementActive.checked = true;
  elements.announcementImageAction.value = "keep";
  elements.announcementActiveLabel.textContent = "建立後立即顯示";
  elements.announcementSubmit.textContent = "建立公告";
  elements.announcementCancelEdit.hidden = true;
  syncAnnouncementImageControls();
}

function beginAnnouncementEdit(id) {
  if (state.announcementMutationInFlight) return;
  const announcement = state.announcements.find((candidate) => candidate.id === id);
  if (!announcement) {
    setStatus(elements.announcementStatus, "公告已更新，請重新載入後再試。", "error");
    return;
  }
  if (
    state.editingAnnouncementId
    && announcementEditHasUnsavedChanges()
    && !window.confirm("目前的公告修改尚未儲存。確定要捨棄修改並重新載入所選公告嗎？")
  ) return;
  elements.announcementForm.reset();
  state.editingAnnouncementId = announcement.id;
  state.editingAnnouncementVersion = announcement.version;
  elements.announcementMessage.value = announcement.message;
  elements.announcementActive.checked = announcement.isActive;
  elements.announcementImageAction.value = "keep";
  elements.announcementActiveLabel.textContent = "修改後顯示此公告";
  elements.announcementSubmit.textContent = "儲存修改";
  elements.announcementCancelEdit.hidden = false;
  syncAnnouncementImageControls();
  setStatus(elements.announcementStatus, "正在修改公告；可保留、取代或移除現有圖片。");
  elements.announcementForm.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => elements.announcementMessage.focus(), 250);
}

function renderAnnouncements() {
  if (!elements.announcementList) return;
  elements.announcementList.replaceChildren();
  if (!state.announcements.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "尚未建立全站公告。";
    elements.announcementList.append(empty);
    return;
  }
  for (const announcement of state.announcements) {
    const row = document.createElement("article");
    row.className = "announcement-admin-row";
    const copy = document.createElement("div");
    const status = document.createElement("span");
    status.className = `announcement-admin-badge${announcement.isActive ? " is-active" : ""}`;
    status.textContent = announcement.isActive ? "顯示中" : "已停用";
    const message = document.createElement("p");
    message.textContent = announcement.message;
    const meta = document.createElement("small");
    meta.textContent = `${formatAdminDateTime(announcement.updatedAt)}${announcement.hasImage ? " · 附有圖片" : ""}`;
    copy.append(status, message, meta);
    const actions = document.createElement("div");
    actions.className = "announcement-admin-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "student-card-action";
    edit.dataset.announcementEdit = announcement.id;
    edit.textContent = "修改";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "student-card-action";
    toggle.dataset.announcementToggle = announcement.id;
    toggle.dataset.announcementVersion = String(announcement.version);
    toggle.dataset.announcementNextActive = String(!announcement.isActive);
    toggle.textContent = announcement.isActive ? "停用" : "重新啟用";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "student-card-action danger";
    remove.dataset.announcementDelete = announcement.id;
    remove.dataset.announcementVersion = String(announcement.version);
    remove.textContent = "永久刪除";
    actions.append(edit, toggle, remove);
    [edit, toggle, remove].forEach((button) => {
      button.disabled = state.announcementMutationInFlight;
    });
    row.append(copy, actions);
    elements.announcementList.append(row);
  }
}

async function loadAnnouncements() {
  if (!elements.announcementList || state.currentUser?.role !== "admin") return;
  setStatus(elements.announcementStatus, "正在載入全站公告…");
  try {
    const payload = await announcementApi("/v1/admin/announcements");
    state.announcements = Array.isArray(payload?.announcements) ? payload.announcements : [];
    renderAnnouncements();
    setStatus(elements.announcementStatus, `共有 ${state.announcements.length} 則公告。`);
  } catch (error) {
    setStatus(elements.announcementStatus, error.message || "未能載入公告。", "error");
  }
}

async function saveAnnouncement(event) {
  event.preventDefault();
  if (state.currentUser?.role !== "admin") return;
  const message = elements.announcementMessage.value.trim();
  const image = elements.announcementImage.files?.[0] || null;
  const editing = announcementBeingEdited();
  if (state.editingAnnouncementId && !editing) {
    setStatus(elements.announcementStatus, "公告已在其他頁面移除；請重新載入後再試。", "error");
    return;
  }
  const imageAction = editing ? elements.announcementImageAction.value : "replace";
  if (!message) {
    setStatus(elements.announcementStatus, "請先輸入公告內容。", "error");
    return;
  }
  if (image && (!/^image\/(?:jpeg|png|webp|gif)$/i.test(image.type) || image.size > 5 * 1024 * 1024)) {
    setStatus(elements.announcementStatus, "圖片只接受 JPG、PNG、WebP 或 GIF，大小不可超過 5 MB。", "error");
    return;
  }
  if (editing && imageAction === "replace" && !image) {
    setStatus(elements.announcementStatus, "請先選擇要取代現有圖片的新圖片。", "error");
    return;
  }
  if (editing && !["keep", "replace", "remove"].includes(imageAction)) {
    setStatus(elements.announcementStatus, "請選擇如何處理現有圖片。", "error");
    return;
  }
  setAnnouncementMutationInFlight(true);
  setStatus(elements.announcementStatus, editing ? "正在儲存公告修改…" : "正在建立公告…");
  try {
    const body = new FormData();
    body.set("message", message);
    body.set("isActive", String(elements.announcementActive.checked));
    if (editing) {
      body.set("expectedVersion", String(state.editingAnnouncementVersion));
      body.set("imageAction", imageAction);
      if (imageAction === "replace" && image) body.set("image", image, image.name);
      await announcementApi(`/v1/admin/announcements/${encodeURIComponent(editing.id)}`, {
        method: "PATCH",
        body
      });
    } else {
      if (image) body.set("image", image, image.name);
      await announcementApi("/v1/admin/announcements", { method: "POST", body });
    }
    resetAnnouncementForm();
    showToast(editing ? "全站公告修改已儲存。" : "全站公告已建立。", "success");
    await loadAnnouncements();
  } catch (error) {
    setStatus(elements.announcementStatus, error.message || (editing ? "未能儲存公告修改。" : "未能建立公告。"), "error");
  } finally {
    setAnnouncementMutationInFlight(false);
  }
}

async function toggleAnnouncement(id, version, isActive) {
  if (state.announcementMutationInFlight) return;
  setAnnouncementMutationInFlight(true);
  try {
    await announcementApi(`/v1/admin/announcements/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedVersion: Number(version), isActive })
    });
    resetAnnouncementForm();
    await loadAnnouncements();
  } catch (error) {
    setStatus(elements.announcementStatus, error.message || "未能更新公告。", "error");
  } finally {
    setAnnouncementMutationInFlight(false);
  }
}

async function deleteAnnouncement(id, version) {
  if (state.announcementMutationInFlight) return;
  if (!window.confirm("確定要永久刪除這則全站公告嗎？此操作不可復原。")) return;
  setAnnouncementMutationInFlight(true);
  try {
    await announcementApi(`/v1/admin/announcements/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedVersion: Number(version), confirmation: "DELETE" })
    });
    resetAnnouncementForm();
    showToast("公告已永久刪除。", "success");
    await loadAnnouncements();
  } catch (error) {
    setStatus(elements.announcementStatus, error.message || "未能刪除公告。", "error");
  } finally {
    setAnnouncementMutationInFlight(false);
  }
}

async function restoreSession() {
  const saved = readSession();
  if (!saved?.role) return false;
  try {
    if (saved.role === "admin" && saved.adminToken) {
      state.currentUser = {
        role: "admin",
        name: saved.name || ADMIN_NAME,
        adminToken: saved.adminToken,
        expiresAt: saved.expiresAt || null
      };
      await openAdminPanel();
      return state.currentUser?.role === "admin";
    }

    if (saved.role === "student" && saved.studentToken && saved.id && saved.name) {
      state.currentUser = {
        role: "student",
        id: saved.id,
        name: saved.name,
        studentToken: saved.studentToken
      };
      state.selectedStudent = { id: saved.id, name: saved.name };
      showView("calendar");
      await loadWeek();
      return state.currentUser?.role === "student";
    }
  } catch (error) {
    console.warn("Schedule session restore failed", error);
  }
  sessionStorage.removeItem(SESSION_KEY);
  return false;
}

async function login(event) {
  event.preventDefault();
  const name = elements.username.value.trim();
  const password = elements.password.value;
  if (!name || !password) {
    setStatus(elements.loginStatus, "請輸入用戶名稱及密碼。", "error");
    return;
  }

  elements.loginButton.disabled = true;
  setStatus(elements.loginStatus, "正在核對帳戶…");

  try {
    await ensureSupabaseAuth();
    if (name.toLocaleLowerCase() === ADMIN_NAME.toLocaleLowerCase()) {
      const baseUrl = String(scheduleSettings.workerBaseUrl || "").replace(/\/+$/, "");
      if (!baseUrl.startsWith("https://")) throw new Error("管理員登入服務尚未設定。");
      const response = await fetch(`${baseUrl}/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password })
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error("登入嘗試次數過多，請稍後再試。");
      if (!response.ok) throw new Error("管理員登入暫時未能使用，請稍後再試。");
      if (!result.admin?.admin_token) throw new Error("用戶名稱或密碼不正確。");

      state.currentUser = {
        role: "admin",
        name: result.admin.name,
        adminToken: result.admin.admin_token,
        expiresAt: result.admin.expires_at
      };
      saveSession();
      elements.loginForm.reset();
      await openAdminPanel();
      showToast("管理員登入成功。");
      return;
    }

    const rows = await callRpc("flashcard_student_login", {
      p_name: name,
      p_password: password
    });
    const student = Array.isArray(rows) ? rows[0] : null;
    if (!student?.session_token) throw new Error("用戶名稱或密碼不正確。");

    state.currentUser = {
      role: "student",
      id: student.id,
      name: student.name,
      studentToken: student.session_token
    };
    window.EdmundSystemNav?.rememberStudentSession({
      token: student.session_token,
      id: student.id,
      name: student.name,
      role: "student",
      access: student.access
    });
    clearRenderedSchedule();
    state.selectedStudent = { id: student.id, name: student.name };
    saveSession();
    elements.loginForm.reset();
    showView("calendar");
    await loadWeek();
    showToast(`您好，${student.name}！`);
  } catch (error) {
    console.warn("Schedule login failed", error);
    setStatus(elements.loginStatus, error.message || "登入失敗，請再試一次。", "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function logout() {
  if (state.mutationInFlight) {
    showToast("正在儲存修改，請稍候。", "error");
    return;
  }
  if (!guardMassEditNavigation()) return;
  await flushPendingMotivationSaves();
  const user = state.currentUser;
  clearStoredScheduleClipboard();
  if (user?.role === "student") window.EdmundSystemNav?.forgetStudentSession();
  state.currentUser = null;
  state.selectedStudent = null;
  state.adminStudents = [];
  state.adminParents = [];
  clearRenderedSchedule();
  sessionStorage.removeItem(SESSION_KEY);

  try {
    if (user?.role === "admin" && user.adminToken) {
      await callRpc("schedule_admin_logout", { p_admin_token: user.adminToken });
    } else if (user?.role === "student" && user.studentToken) {
      await callRpc("schedule_student_logout", { p_token: user.studentToken });
    }
  } catch (error) {
    console.warn("Schedule logout cleanup failed", error);
  }

  try {
    await supabaseClient?.auth.signOut();
  } catch (error) {
    console.warn("Account sign out failed", error);
  } finally {
    supabaseAuthPromise = null;
  }
  setStatus(elements.loginStatus, "");
  showView("login");
  setConnection("已連線", "online");
}

function openPasswordDialog() {
  if (!state.currentUser) return;
  elements.passwordForm.reset();
  setStatus(elements.passwordStatus, "");
  elements.passwordDialog.showModal();
  window.setTimeout(() => elements.passwordForm.elements.currentPassword.focus(), 0);
}

async function changeCurrentUserPassword(event) {
  event.preventDefault();
  if (!state.currentUser) return;
  const data = new FormData(elements.passwordForm);
  const currentPassword = String(data.get("currentPassword") || "");
  const newPassword = String(data.get("newPassword") || "");
  const confirmation = String(data.get("confirmPassword") || "");
  if (!currentPassword || newPassword.length < 8 || newPassword !== confirmation) {
    setStatus(elements.passwordStatus, "請輸入目前密碼；新密碼最少 8 個字元，而且兩次輸入必須相同。", "error");
    return;
  }
  const submit = elements.passwordForm.querySelector("button[type=submit]");
  submit.disabled = true;
  setStatus(elements.passwordStatus, "正在安全地更新密碼…");
  try {
    if (state.currentUser.role === "admin") {
      const rows = await callRpc("schedule_admin_change_own_password", {
        p_admin_token: state.currentUser.adminToken,
        p_current_password: currentPassword,
        p_new_password: newPassword
      });
      const next = Array.isArray(rows) ? rows[0] : null;
      if (!next?.admin_token) throw new Error("未能建立更新後的管理員登入。");
      state.currentUser.adminToken = next.admin_token;
      state.currentUser.expiresAt = next.expires_at;
    } else {
      const rows = await callRpc("shared_student_change_password", {
        p_token: state.currentUser.studentToken,
        p_current_password: currentPassword,
        p_new_password: newPassword
      });
      const next = Array.isArray(rows) ? rows[0] : null;
      if (!next?.session_token) throw new Error("未能建立更新後的學生登入。");
      state.currentUser.studentToken = next.session_token;
      state.currentUser.id = next.id;
      state.currentUser.name = next.name;
      window.EdmundSystemNav?.rememberStudentSession({
        token: next.session_token,
        id: next.id,
        name: next.name,
        role: "student"
      });
    }
    saveSession();
    elements.passwordDialog.close();
    showToast("密碼已更新；其他裝置的舊登入已失效。", "success");
  } catch (error) {
    setStatus(elements.passwordStatus, error.message || "未能更新密碼。", "error");
  } finally {
    submit.disabled = false;
  }
}

function allStudentAccessKeys() {
  return [
    ...STUDENT_ACCESS_SECTIONS.map((section) => section.key),
    ...Object.values(STUDENT_ACCESS_CHILDREN).flat().map((child) => child.key)
  ];
}

function defaultStudentAccess() {
  const enabledByDefault = new Set(["student-custom", "conversational-english", "bookmarks"]);
  const access = Object.fromEntries(
    STUDENT_ACCESS_SECTIONS.map((section) => [section.key, enabledByDefault.has(section.key)])
  );
  Object.values(STUDENT_ACCESS_CHILDREN).flat().forEach((child) => {
    access[child.key] = true;
  });
  return access;
}

function normalizeStudentAccess(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = defaultStudentAccess();
  allStudentAccessKeys().forEach((key) => {
    if (Object.hasOwn(source, key)) normalized[key] = source[key] === true;
  });
  return normalized;
}

function formatAdminDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("zh-HK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isStudentActive(student) {
  return student?.is_active !== false && !student?.deleted_at;
}

async function loadAllStudentAccounts() {
  const rows = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const page = await callRpc("schedule_admin_list_student_accounts", {
      p_admin_token: state.currentUser.adminToken,
      p_status: "all",
      p_limit: STUDENT_ACCOUNT_PAGE_SIZE,
      p_offset: offset
    });
    const items = Array.isArray(page) ? page : [];
    rows.push(...items);
    total = Number(items[0]?.total_count ?? rows.length);
    if (!items.length || items.length < STUDENT_ACCOUNT_PAGE_SIZE) break;
    offset += items.length;
  }
  return rows.map((student) => ({
    ...student,
    access: normalizeStudentAccess(student.access)
  }));
}

async function openAdminPanel() {
  if (state.currentUser?.role !== "admin") return;
  if (!guardMassEditNavigation()) return;
  await flushPendingMotivationSaves();
  clearRenderedSchedule();
  state.selectedStudent = null;
  showView("admin");
  loadAnnouncements();
  setStatus(elements.adminStatus, "正在載入學生帳戶…");
  setStatus(elements.parentAdminStatus, "正在載入家長帳戶…");
  try {
    const [studentRows, preferenceRows, parentRows, teacherWeekRows, homeworkLinks] = await Promise.all([
      loadAllStudentAccounts(),
      callRpc("schedule_admin_get_student_list_preferences", {
        p_admin_token: state.currentUser.adminToken
      }),
      callRpc("schedule_admin_list_parents", {
        p_admin_token: state.currentUser.adminToken
      }),
      callRpc("schedule_admin_teacher_assignment_students", {
        p_admin_token: state.currentUser.adminToken,
        p_week_start: state.weekStart
      }).catch(() => []),
      callRpc("schedule_admin_list_homework_links", {
        p_admin_token: state.currentUser.adminToken
      }).catch(() => [])
    ]);
    state.adminStudents = Array.isArray(studentRows) ? studentRows : [];
    const preferences = Array.isArray(preferenceRows) ? preferenceRows[0] : preferenceRows;
    state.studentSortMode = ["asc", "desc", "custom"].includes(preferences?.sort_mode)
      ? preferences.sort_mode
      : "asc";
    state.studentOrder = Array.isArray(preferences?.student_order) ? preferences.student_order : [];
    state.adminParents = Array.isArray(parentRows) ? parentRows : [];
    state.adminTeacherAssignmentStudentIds = new Set((Array.isArray(teacherWeekRows) ? teacherWeekRows : []).map((row) => String(row.student_id || "")));
    state.adminHomeworkLinks = Array.isArray(homeworkLinks) ? homeworkLinks : [];
    state.parentAssignmentDrafts.clear();
    renderStudentList();
    renderHomeworkLinks();
    renderParentList();
    const activeCount = state.adminStudents.filter(isStudentActive).length;
    setStatus(elements.adminStatus, `已載入 ${activeCount} 個使用中及 ${state.adminStudents.length - activeCount} 個已停用學生帳戶。`);
    setStatus(elements.parentAdminStatus, `已載入 ${state.adminParents.length} 個家長帳戶。`);
  } catch (error) {
    console.warn("Admin student list failed", error);
    setStatus(elements.adminStatus, "未能載入學生帳戶，請重新登入。", "error");
    setStatus(elements.parentAdminStatus, "未能載入家長帳戶；請確認已套用家長系統資料庫更新。", "error");
    if (isExpiredSessionError(error)) await logout();
  }
}

function renderStudentList() {
  const query = elements.studentSearch.value.trim().toLocaleLowerCase();
  const students = state.adminStudents.filter((student) => (
    (state.studentStatusFilter === "all"
      || (state.studentStatusFilter === "active" && isStudentActive(student))
      || (state.studentStatusFilter === "inactive" && !isStudentActive(student)))
      && (!query || String(student.name || "").toLocaleLowerCase().includes(query))
  ));
  const activeCount = state.adminStudents.filter(isStudentActive).length;
  const inactiveCount = state.adminStudents.length - activeCount;
  elements.studentList.replaceChildren();
  elements.studentCount.textContent = `${students.length} 項 · 使用中 ${activeCount} · 已停用 ${inactiveCount}`;
  elements.studentSortButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.studentSortMode === state.studentSortMode));
  });
  if (elements.studentStatusFilter) elements.studentStatusFilter.value = state.studentStatusFilter;

  if (!students.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = query ? "找不到符合的學生。" : "尚未有學生帳戶。";
    elements.studentList.append(empty);
    return;
  }

  for (const student of students) {
    const active = isStudentActive(student);
    const card = document.createElement("article");
    card.className = `student-card${active ? "" : " is-inactive"}${state.adminTeacherAssignmentStudentIds.has(String(student.id)) ? " has-teacher-assignment" : ""}`;
    card.dataset.studentOrderId = student.id;
    card.draggable = active && state.studentSortMode === "custom" && !query;
    const copy = document.createElement("div");
    copy.className = "student-card-copy";
    const name = document.createElement("strong");
    name.textContent = student.name;
    const badge = document.createElement("span");
    badge.className = `student-status-badge${active ? "" : " inactive"}`;
    badge.textContent = active ? "使用中" : "已停用";
    copy.append(name, badge);
    const linkedGroup = state.adminHomeworkLinks.find((group) => (
      Array.isArray(group?.members) && group.members.some((member) => String(member.studentId) === String(student.id))
    ));
    if (linkedGroup) {
      const partners = linkedGroup.members
        .filter((member) => String(member.studentId) !== String(student.id))
        .map((member) => member.studentName)
        .filter(Boolean);
      const linkedNote = document.createElement("span");
      linkedNote.className = "student-linked-homework-note";
      linkedNote.textContent = `功課同步：${partners.join("、")}`;
      copy.append(linkedNote);
    }
    if (!active) {
      const note = document.createElement("span");
      note.textContent = `已停用：${formatAdminDateTime(student.deleted_at)}`;
      copy.append(note);
    }

    const actions = document.createElement("div");
    actions.className = "student-card-actions";
    if (active && state.studentSortMode === "custom") {
      const orderButtons = document.createElement("span");
      orderButtons.className = "student-order-buttons";
      const up = document.createElement("button");
      up.type = "button";
      up.className = "student-order-button";
      up.dataset.moveStudentOrder = "up";
      up.dataset.orderStudentId = student.id;
      up.setAttribute("aria-label", `把 ${student.name} 向上移`);
      up.textContent = "↑";
      const down = document.createElement("button");
      down.type = "button";
      down.className = "student-order-button";
      down.dataset.moveStudentOrder = "down";
      down.dataset.orderStudentId = student.id;
      down.setAttribute("aria-label", `把 ${student.name} 向下移`);
      down.textContent = "↓";
      orderButtons.append(up, down);
      copy.append(orderButtons);
    }
    const open = document.createElement("button");
    open.type = "button";
    open.className = "student-open-button student-card-action";
    open.textContent = "查看日程";
    open.setAttribute("aria-label", `查看 ${student.name} 的日程`);
    if (active) open.dataset.studentId = student.id;
    else {
      open.disabled = true;
      open.title = "帳戶已停用";
    }
    actions.append(open);
    const profile = document.createElement("button");
    profile.type = "button";
    profile.className = "student-card-action";
    profile.dataset.studentProfile = student.id;
    profile.textContent = "Profile／權限";
    actions.append(profile);
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "student-card-action";
    reset.dataset.resetStudentPassword = student.id;
    reset.dataset.accountName = student.name;
    reset.textContent = "重設密碼";
    if (!active) {
      delete reset.dataset.resetStudentPassword;
      reset.disabled = true;
      reset.title = "重新啟用帳戶後才可重設密碼";
    }
    actions.append(reset);
    const lifecycle = document.createElement("button");
    lifecycle.type = "button";
    lifecycle.className = active ? "student-card-action danger" : "student-card-action";
    lifecycle.dataset.accountName = student.name;
    if (active) {
      lifecycle.dataset.deactivateStudent = student.id;
      lifecycle.textContent = "停用帳戶";
    } else {
      lifecycle.dataset.reactivateStudent = student.id;
      lifecycle.textContent = "重新啟用";
    }
    actions.append(lifecycle);
    const permanentDelete = document.createElement("button");
    permanentDelete.type = "button";
    permanentDelete.className = "student-card-action danger";
    permanentDelete.textContent = "永久刪除帳戶";
    if (active) {
      permanentDelete.disabled = true;
      permanentDelete.title = "基於安全理由，必須先停用帳戶";
    } else {
      permanentDelete.dataset.permanentDeleteStudent = student.id;
      permanentDelete.dataset.accountName = student.name;
    }
    actions.append(permanentDelete);
    card.append(copy, actions);
    elements.studentList.append(card);
  }
}

function linkedHomeworkStudentIds() {
  return new Set(state.adminHomeworkLinks.flatMap((group) => (
    Array.isArray(group?.members) ? group.members.map((member) => String(member.studentId || "")) : []
  )));
}

function renderHomeworkLinks() {
  if (!elements.homeworkLinkList) return;
  const linkedIds = linkedHomeworkStudentIds();
  const available = state.adminStudents.filter((student) => isStudentActive(student) && !linkedIds.has(String(student.id)));
  const fill = (select, exclude = "") => {
    if (!select) return;
    const previous = select.value;
    select.replaceChildren(new Option("請選擇學生", ""));
    available.filter((student) => String(student.id) !== exclude).forEach((student) => {
      select.add(new Option(student.name, student.id));
    });
    if ([...select.options].some((option) => option.value === previous)) select.value = previous;
  };
  fill(elements.homeworkLinkStudentA, elements.homeworkLinkStudentB?.value || "");
  fill(elements.homeworkLinkStudentB, elements.homeworkLinkStudentA?.value || "");
  elements.homeworkLinkList.replaceChildren();
  if (!state.adminHomeworkLinks.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "目前沒有已連結的學生帳戶。";
    elements.homeworkLinkList.append(empty);
    return;
  }
  state.adminHomeworkLinks.forEach((group) => {
    const row = document.createElement("article");
    row.className = "homework-link-admin-group";
    const names = (Array.isArray(group.members) ? group.members : []).map((member) => member.studentName).filter(Boolean);
    const label = document.createElement("strong");
    label.textContent = names.join(" ⇄ ");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.unlinkHomeworkGroup = group.groupId;
    remove.textContent = "取消連結";
    row.append(label, remove);
    elements.homeworkLinkList.append(row);
  });
}

async function linkHomeworkAccounts(event) {
  event.preventDefault();
  const ids = [elements.homeworkLinkStudentA?.value, elements.homeworkLinkStudentB?.value].filter(Boolean);
  if (new Set(ids).size !== 2) {
    setStatus(elements.homeworkLinkStatus, "請選擇兩個不同的學生帳戶。", "error");
    return;
  }
  setStatus(elements.homeworkLinkStatus, "正在連結學生功課安排…");
  try {
    await callRpc("schedule_admin_link_homework_accounts", {
      p_admin_token: state.currentUser.adminToken,
      p_student_ids: ids
    });
    state.adminHomeworkLinks = await callRpc("schedule_admin_list_homework_links", {
      p_admin_token: state.currentUser.adminToken
    });
    renderHomeworkLinks();
    setStatus(elements.homeworkLinkStatus, "帳戶已連結；之後由老師建立的功課會自動同步。", "success");
  } catch (error) {
    setStatus(elements.homeworkLinkStatus, error.message || "未能連結帳戶。", "error");
  }
}

async function unlinkHomeworkAccounts(groupId) {
  if (!groupId || !window.confirm("取消連結後，兩個帳戶之後的老師功課不再同步。現有功課不會被刪除。確定繼續？")) return;
  setStatus(elements.homeworkLinkStatus, "正在取消連結…");
  try {
    const removed = await callRpc("schedule_admin_unlink_homework_accounts", {
      p_admin_token: state.currentUser.adminToken,
      p_group_id: groupId
    });
    if (!removed) throw new Error("找不到這組帳戶連結。");
    state.adminHomeworkLinks = state.adminHomeworkLinks.filter((group) => group.groupId !== groupId);
    renderHomeworkLinks();
    setStatus(elements.homeworkLinkStatus, "已取消帳戶連結。", "success");
  } catch (error) {
    setStatus(elements.homeworkLinkStatus, error.message || "未能取消連結。", "error");
  }
}

async function refreshStudentAccountState() {
  const [students, preferenceRows] = await Promise.all([
    loadAllStudentAccounts(),
    callRpc("schedule_admin_get_student_list_preferences", {
      p_admin_token: state.currentUser.adminToken
    })
  ]);
  state.adminStudents = students;
  const preferences = Array.isArray(preferenceRows) ? preferenceRows[0] : preferenceRows;
  state.studentSortMode = ["asc", "desc", "custom"].includes(preferences?.sort_mode)
    ? preferences.sort_mode
    : "asc";
  state.studentOrder = Array.isArray(preferences?.student_order) ? preferences.student_order : [];
  renderStudentList();
  renderParentList();
}

async function setStudentSortMode(sortMode) {
  if (!["asc", "desc", "custom"].includes(sortMode) || state.currentUser?.role !== "admin") return;
  elements.studentSortButtons.forEach((button) => { button.disabled = true; });
  try {
    await callRpc("schedule_admin_set_student_sort_mode", {
      p_admin_token: state.currentUser.adminToken,
      p_sort_mode: sortMode
    });
    await refreshStudentAccountState();
    showToast(sortMode === "custom" ? "已切換至自訂排序；可拖放或使用箭嘴移動。" : "學生排序已更新。", "success");
  } catch (error) {
    setStatus(elements.adminStatus, error.message || "未能更新學生排序。", "error");
  } finally {
    elements.studentSortButtons.forEach((button) => { button.disabled = false; });
  }
}

function activeStudentOrder() {
  return state.adminStudents.filter(isStudentActive).map((student) => student.id);
}

async function saveStudentOrder(studentIds) {
  if (state.currentUser?.role !== "admin") return;
  try {
    await callRpc("schedule_admin_reorder_students", {
      p_admin_token: state.currentUser.adminToken,
      p_student_ids: studentIds
    });
    await refreshStudentAccountState();
    showToast("自訂學生次序已儲存。", "success");
  } catch (error) {
    setStatus(elements.adminStatus, error.message || "未能儲存自訂次序。", "error");
  }
}

function moveStudentOrder(studentId, direction) {
  if (state.studentSortMode !== "custom") return;
  const ids = activeStudentOrder();
  const index = ids.indexOf(studentId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  saveStudentOrder(ids);
}

function selectedStudentProfile() {
  return state.adminStudents.find((student) => student.id === state.selectedStudentProfileId) || null;
}

function renderStudentProfileFacts(student) {
  const facts = [
    ["狀態", isStudentActive(student) ? "使用中" : "已停用"],
    ["建立日期", formatAdminDateTime(student.created_at)],
    ["最近登入", formatAdminDateTime(student.last_session_at)],
    ["最近更改密碼", formatAdminDateTime(student.last_password_change_at)]
  ];
  elements.studentProfileFacts.replaceChildren();
  facts.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "student-profile-fact";
    const heading = document.createElement("strong");
    heading.textContent = label;
    const content = document.createElement("span");
    content.textContent = value;
    item.append(heading, content);
    elements.studentProfileFacts.append(item);
  });
}

function renderStudentAccessControls(student) {
  elements.studentAccessGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  STUDENT_ACCESS_SECTIONS.forEach((section) => {
    const item = document.createElement("section");
    item.className = "student-access-item";
    const label = document.createElement("label");
    label.className = "student-access-main";
    const copy = document.createElement("span");
    copy.textContent = section.label;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = student.access?.[section.key] === true;
    checkbox.dataset.studentAccessKey = section.key;
    checkbox.setAttribute("aria-label", `${section.label} 使用權限`);
    label.append(copy, checkbox);
    item.append(label);
    const children = STUDENT_ACCESS_CHILDREN[section.key] || [];
    if (children.length) {
      const childList = document.createElement("div");
      childList.className = "student-access-children";
      children.forEach((child) => {
        const childLabel = document.createElement("label");
        childLabel.className = "student-access-child";
        const childCheckbox = document.createElement("input");
        childCheckbox.type = "checkbox";
        childCheckbox.checked = student.access?.[child.key] !== false;
        childCheckbox.dataset.studentAccessKey = child.key;
        childLabel.append(document.createTextNode(child.label), childCheckbox);
        childList.append(childLabel);
      });
      item.append(childList);
    }
    fragment.append(item);
  });
  elements.studentAccessGrid.append(fragment);
}

function renderStudentProfileActions(student) {
  elements.studentProfileActions.replaceChildren();
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "student-card-action";
  reset.dataset.profileResetPassword = student.id;
  reset.textContent = "重設密碼";
  if (isStudentActive(student)) {
    elements.studentProfileActions.append(reset);
    const deactivate = document.createElement("button");
    deactivate.type = "button";
    deactivate.className = "student-card-action danger";
    deactivate.dataset.profileDeactivateStudent = student.id;
    deactivate.textContent = "停用帳戶";
    elements.studentProfileActions.append(deactivate);
  } else {
    const reactivate = document.createElement("button");
    reactivate.type = "button";
    reactivate.className = "student-card-action";
    reactivate.dataset.profileReactivateStudent = student.id;
    reactivate.textContent = "重新啟用";
    const permanentlyDelete = document.createElement("button");
    permanentlyDelete.type = "button";
    permanentlyDelete.className = "student-card-action danger";
    permanentlyDelete.dataset.profilePermanentDeleteStudent = student.id;
    permanentlyDelete.textContent = "永久刪除…";
    elements.studentProfileActions.append(reactivate, permanentlyDelete);
  }
}

function auditEventLabel(eventType) {
  const labels = {
    created: "建立帳戶",
    account_created: "建立帳戶",
    password_reset: "管理員重設密碼",
    password_changed: "學生／管理員更改密碼",
    deactivated: "停用帳戶",
    account_deactivated: "停用帳戶",
    reactivated: "重新啟用帳戶",
    account_reactivated: "重新啟用帳戶",
    access_changed: "更新使用權限",
    sort_order_changed: "更新自訂次序",
    permanently_deleted: "永久刪除帳戶",
    permanent_delete: "永久刪除帳戶"
  };
  return labels[eventType] || String(eventType || "帳戶操作");
}

function renderStudentAudit() {
  elements.studentAuditList.replaceChildren();
  const totalPages = Math.max(1, Math.ceil(state.studentAuditTotal / STUDENT_AUDIT_PAGE_SIZE));
  elements.studentAuditSummary.textContent = `第 ${state.studentAuditPage} / ${totalPages} 頁 · 共 ${state.studentAuditTotal} 項`;
  elements.studentAuditPrevious.disabled = state.studentAuditPage <= 1;
  elements.studentAuditNext.disabled = state.studentAuditPage >= totalPages;
  if (!state.studentAuditRows.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "尚未有帳戶操作紀錄。";
    elements.studentAuditList.append(empty);
    return;
  }
  state.studentAuditRows.forEach((event) => {
    const row = document.createElement("article");
    row.className = "student-audit-row";
    const type = document.createElement("strong");
    type.textContent = auditEventLabel(event.event_type);
    const details = document.createElement("small");
    const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
    const safeMetadata = Object.entries(metadata).filter(([key]) => !/(?:password|hash|token|secret|credential)/i.test(key));
    details.textContent = safeMetadata.length
      ? safeMetadata.map(([key, value]) => `${key}: ${String(value)}`).join(" · ")
      : "沒有附加資料";
    const time = document.createElement("small");
    time.textContent = `${formatAdminDateTime(event.occurred_at)}\n${event.actor_label || "管理員"}`;
    row.append(type, details, time);
    elements.studentAuditList.append(row);
  });
}

async function loadStudentAudit(page = 1) {
  const student = selectedStudentProfile();
  if (!student) return;
  state.studentAuditPage = Math.max(1, Number(page) || 1);
  elements.studentAuditList.innerHTML = "<p>正在載入紀錄…</p>";
  try {
    const rows = await callRpc("schedule_admin_get_student_account_audit", {
      p_admin_token: state.currentUser.adminToken,
      p_student_id: student.id,
      p_limit: STUDENT_AUDIT_PAGE_SIZE,
      p_offset: (state.studentAuditPage - 1) * STUDENT_AUDIT_PAGE_SIZE
    });
    state.studentAuditRows = Array.isArray(rows) ? rows : [];
    state.studentAuditTotal = Number(state.studentAuditRows[0]?.total_count || 0);
    renderStudentAudit();
  } catch (error) {
    elements.studentAuditList.replaceChildren();
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = error.message || "未能載入帳戶操作紀錄。";
    elements.studentAuditList.append(message);
  }
}

function openStudentProfile(studentId) {
  const student = state.adminStudents.find((item) => item.id === studentId);
  if (!student || state.currentUser?.role !== "admin") return;
  state.selectedStudentProfileId = student.id;
  state.studentAuditPage = 1;
  state.studentAuditRows = [];
  state.studentAuditTotal = 0;
  elements.studentProfileTitle.textContent = student.name;
  elements.studentProfileStatus.textContent = isStudentActive(student)
    ? "學生帳戶 · 使用中"
    : `學生帳戶 · 已於 ${formatAdminDateTime(student.deleted_at)} 停用`;
  renderStudentProfileFacts(student);
  renderStudentAccessControls(student);
  renderStudentProfileActions(student);
  elements.studentProfileDialog.showModal();
  loadStudentAudit(1);
}

async function saveSelectedStudentAccess(nextAccess) {
  const student = selectedStudentProfile();
  if (!student || state.currentUser?.role !== "admin") return;
  [...elements.studentAccessGrid.querySelectorAll("input")].forEach((input) => { input.disabled = true; });
  try {
    const rows = await callRpc("schedule_admin_set_student_access", {
      p_admin_token: state.currentUser.adminToken,
      p_student_id: student.id,
      p_access: nextAccess,
      p_expected_updated_at: student.updated_at || null
    });
    const updated = Array.isArray(rows) ? rows[0] : rows;
    if (!updated?.id) throw new Error("未能讀取更新後的帳戶資料。");
    Object.assign(student, updated, { access: normalizeStudentAccess(updated.access) });
    renderStudentAccessControls(student);
    renderStudentProfileFacts(student);
    renderStudentList();
    await loadStudentAudit(1);
    showToast("學生使用權限已更新。", "success");
  } catch (error) {
    renderStudentAccessControls(student);
    setStatus(elements.studentProfileStatus, error.message || "未能更新學生使用權限。", "error");
  }
}

async function reactivateStudentAccount(studentId, name) {
  const student = state.adminStudents.find((item) => item.id === studentId);
  if (!student || isStudentActive(student)) return;
  if (!window.confirm(`確定要重新啟用學生帳戶「${name}」嗎？\n原有密碼、權限及學習紀錄會保留。`)) return;
  try {
    await callRpc("schedule_admin_reactivate_student", {
      p_admin_token: state.currentUser.adminToken,
      p_student_id: studentId,
      p_expected_deleted_at: student.deleted_at
    });
    elements.studentProfileDialog?.close();
    showToast(`已重新啟用 ${name}。`, "success");
    await openAdminPanel();
  } catch (error) {
    setStatus(elements.adminStatus, error.message || "未能重新啟用學生帳戶。", "error");
  }
}

function renderDeletionImpact(impact) {
  elements.permanentDeleteImpact.replaceChildren();
  const total = document.createElement("strong");
  total.textContent = `將處理 ${Number(impact.dependency_total || 0)} 項相關資料；保留 ${Number(impact.retained_audit_count || 0)} 項匿名稽核紀錄。`;
  elements.permanentDeleteImpact.append(total);
  const counts = impact.dependency_counts && typeof impact.dependency_counts === "object"
    ? impact.dependency_counts
    : {};
  Object.entries(counts).forEach(([key, value]) => {
    const row = document.createElement("span");
    const detail = value && typeof value === "object" ? value : { rowCount: value };
    row.textContent = `${detail.table || key}: ${Number(detail.rowCount || 0)} 項 · ${detail.onDelete || "UNKNOWN"}`;
    elements.permanentDeleteImpact.append(row);
  });
}

async function openPermanentDeleteDialog(studentId) {
  const student = state.adminStudents.find((item) => item.id === studentId);
  if (!student || isStudentActive(student)) return;
  elements.permanentDeleteForm.reset();
  state.permanentDeleteSnapshot = null;
  elements.permanentDeleteTarget.textContent = `帳戶：${student.name}。必須先停用，並核對即時資料影響後才可永久刪除。`;
  elements.permanentDeleteImpact.textContent = "正在計算相關資料…";
  setStatus(elements.permanentDeleteStatus, "");
  elements.permanentDeleteDialog.showModal();
  try {
    const rows = await callRpc("schedule_admin_get_student_deletion_impact", {
      p_admin_token: state.currentUser.adminToken,
      p_student_id: student.id
    });
    const impact = Array.isArray(rows) ? rows[0] : rows;
    if (!impact?.id || impact.is_active) throw new Error("帳戶狀態已改變，請重新載入學生清單。");
    state.permanentDeleteSnapshot = impact;
    renderDeletionImpact(impact);
  } catch (error) {
    setStatus(elements.permanentDeleteStatus, error.message || "未能計算刪除影響；永久刪除已鎖定。", "error");
  }
}

async function permanentlyDeleteStudent(event) {
  event.preventDefault();
  const impact = state.permanentDeleteSnapshot;
  if (!impact || state.currentUser?.role !== "admin") {
    setStatus(elements.permanentDeleteStatus, "未有有效的刪除影響快照，請關閉後重試。", "error");
    return;
  }
  const data = new FormData(elements.permanentDeleteForm);
  const typedName = String(data.get("typedName") || "");
  const studentName = impact.name;
  if (typedName !== studentName || data.get("understood") !== "on") {
    setStatus(elements.permanentDeleteStatus, "請完整輸入學生名稱，並勾選不可復原確認。", "error");
    return;
  }
  if (!window.confirm(`最後確認：永久刪除「${impact.name}」及相關資料？\n此操作不可復原。`)) return;
  const submit = elements.permanentDeleteForm.querySelector("button[type=submit]");
  submit.disabled = true;
  setStatus(elements.permanentDeleteStatus, "正在再次核對資料並永久刪除…");
  try {
    await callRpc("schedule_admin_permanently_delete_student", {
      p_admin_token: state.currentUser.adminToken,
      p_student_id: impact.id,
      p_typed_name: typedName,
      p_expected_updated_at: impact.updated_at,
      p_expected_dependency_counts: impact.dependency_counts || {},
      p_expected_audit_count: Number(impact.retained_audit_count || 0)
    });
    state.permanentDeleteSnapshot = null;
    elements.permanentDeleteDialog.close();
    elements.studentProfileDialog?.close();
    showToast(`已永久刪除 ${impact.name}；匿名稽核紀錄獲保留。`, "success");
    await openAdminPanel();
  } catch (error) {
    setStatus(elements.permanentDeleteStatus, error.message || "資料在確認後已改變，未有執行永久刪除。請關閉後重試。", "error");
  } finally {
    submit.disabled = false;
  }
}

function renderParentList() {
  elements.parentList.replaceChildren();
  const parentQuery = String(elements.parentSearch?.value || "").trim().toLocaleLowerCase();
  const studentQuery = String(elements.parentStudentSearch?.value || "").trim().toLocaleLowerCase();
  const compareNames = (left, right) => String(left?.name || "").localeCompare(String(right?.name || ""), "zh-Hant", { sensitivity: "base", numeric: true });
  const parents = [...state.adminParents]
    .sort(compareNames)
    .filter((parent) => !parentQuery || String(parent.name || "").toLocaleLowerCase().includes(parentQuery));
  const assignableStudents = state.adminStudents
    .filter(isStudentActive)
    .sort(compareNames)
    .filter((student) => !studentQuery || String(student.name || "").toLocaleLowerCase().includes(studentQuery));
  elements.parentCount.textContent = parentQuery
    ? `${parents.length} / ${state.adminParents.length} 個家長`
    : `${state.adminParents.length} 個家長`;
  if (!state.adminParents.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "尚未有家長帳戶。";
    elements.parentList.append(empty);
    return;
  }
  if (!parents.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "找不到符合的家長。";
    elements.parentList.append(empty);
    return;
  }

  for (const parent of parents) {
    const assigned = state.parentAssignmentDrafts.get(parent.id)
      || new Set(Array.isArray(parent.assigned_student_ids) ? parent.assigned_student_ids : []);
    const card = document.createElement("article");
    card.className = "student-card parent-card";
    card.style.setProperty("--parent-colour", parent.tag_colour || "#7c3aed");
    card.dataset.parentId = parent.id;

    const identity = document.createElement("div");
    identity.className = "parent-identity";
    const name = document.createElement("strong");
    name.textContent = parent.name;
    const tag = document.createElement("span");
    tag.className = "parent-tag";
    tag.textContent = "家長帳戶";
    identity.append(name, tag);

    const assignments = document.createElement("div");
    assignments.className = "parent-assignments";
    assignments.setAttribute("aria-label", `指派 ${parent.name} 可查看的學生`);
    assignableStudents.forEach((student) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = student.id;
      checkbox.checked = assigned.has(student.id);
      checkbox.dataset.parentStudent = student.id;
      label.append(checkbox, document.createTextNode(student.name));
      assignments.append(label);
    });
    if (!state.adminStudents.some(isStudentActive)) assignments.textContent = "尚未有可指派的學生帳戶。";
    else if (!assignableStudents.length) assignments.textContent = "找不到符合的學生。";

    const actions = document.createElement("div");
    actions.className = "parent-card-actions";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "student-card-action";
    save.dataset.saveParentAssignments = parent.id;
    save.textContent = "儲存子女指派";
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "student-card-action";
    reset.dataset.resetParentPassword = parent.id;
    reset.dataset.accountName = parent.name;
    reset.textContent = "重設密碼";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "student-card-action danger";
    remove.dataset.deleteParent = parent.id;
    remove.dataset.accountName = parent.name;
    remove.textContent = "刪除家長";
    actions.append(save, reset, remove);
    card.append(identity, assignments, actions);
    elements.parentList.append(card);
  }
}

async function createStudentAccount(event) {
  event.preventDefault();
  if (state.currentUser?.role !== "admin" || state.mutationInFlight) return;
  const data = new FormData(elements.createStudentForm);
  const name = String(data.get("studentName") || "").trim();
  const password = String(data.get("studentPassword") || "");
  if (!name || password.length < 8) {
    setStatus(elements.createStudentStatus, "請輸入學生名稱及最少 8 個字元的首次密碼。", "error");
    return;
  }
  setStatus(elements.createStudentStatus, "正在開設學生帳戶…");
  elements.createStudentForm.querySelector("button[type=submit]").disabled = true;
  try {
    await callRpc("schedule_admin_upsert_student_account", {
      p_admin_token: state.currentUser.adminToken,
      p_student_name: name,
      p_student_password: password,
      p_access: defaultStudentAccess()
    });
    elements.createStudentForm.reset();
    setStatus(elements.createStudentStatus, `已開設 ${name}；請安全地把首次密碼交給學生。`);
    await openAdminPanel();
  } catch (error) {
    setStatus(elements.createStudentStatus, error.message || "未能開設學生帳戶。", "error");
  } finally {
    elements.createStudentForm.querySelector("button[type=submit]").disabled = false;
  }
}

async function createParentAccount(event) {
  event.preventDefault();
  if (state.currentUser?.role !== "admin" || state.mutationInFlight) return;
  const data = new FormData(elements.createParentForm);
  const name = String(data.get("parentName") || "").trim();
  const password = String(data.get("parentPassword") || "");
  const colour = String(data.get("parentColour") || "#7c3aed");
  if (!name || password.length < 8) {
    setStatus(elements.createParentStatus, "請輸入家長名稱及最少 8 個字元的首次密碼。", "error");
    return;
  }
  setStatus(elements.createParentStatus, "正在開設家長帳戶…");
  elements.createParentForm.querySelector("button[type=submit]").disabled = true;
  try {
    await callRpc("schedule_admin_upsert_parent", {
      p_admin_token: state.currentUser.adminToken,
      p_parent_name: name,
      p_parent_password: password,
      p_tag_colour: colour
    });
    elements.createParentForm.reset();
    elements.createParentForm.elements.parentColour.value = "#7c3aed";
    setStatus(elements.createParentStatus, `已開設 ${name}；下一步請在下方指派子女帳戶。`);
    await openAdminPanel();
  } catch (error) {
    setStatus(elements.createParentStatus, error.message || "未能開設家長帳戶。", "error");
  } finally {
    elements.createParentForm.querySelector("button[type=submit]").disabled = false;
  }
}

function openAdminPasswordDialog(type, id, name) {
  elements.adminPasswordForm.reset();
  elements.adminPasswordForm.elements.accountType.value = type;
  elements.adminPasswordForm.elements.accountId.value = id;
  elements.adminPasswordTarget.textContent = `帳戶：${name}。舊密碼基於安全理由不可讀取；請設定一個新密碼。`;
  setStatus(elements.adminPasswordStatus, "");
  elements.adminPasswordDialog.showModal();
}

async function resetManagedAccountPassword(event) {
  event.preventDefault();
  if (state.currentUser?.role !== "admin") return;
  const data = new FormData(elements.adminPasswordForm);
  const password = String(data.get("newPassword") || "");
  if (password.length < 8 || password !== String(data.get("confirmPassword") || "")) {
    setStatus(elements.adminPasswordStatus, "新密碼最少 8 個字元，而且兩次輸入必須相同。", "error");
    return;
  }
  const type = String(data.get("accountType") || "");
  const rpc = type === "parent" ? "schedule_admin_reset_parent_password" : "schedule_admin_reset_student_password";
  const idKey = type === "parent" ? "p_parent_id" : "p_student_id";
  try {
    await callRpc(rpc, {
      p_admin_token: state.currentUser.adminToken,
      [idKey]: String(data.get("accountId") || ""),
      p_new_password: password
    });
    elements.adminPasswordDialog.close();
    showToast("密碼已重設；該帳戶的舊登入已失效。", "success");
    if (type === "student" && state.selectedStudentProfileId === String(data.get("accountId") || "")) {
      await loadStudentAudit(1);
    }
  } catch (error) {
    setStatus(elements.adminPasswordStatus, error.message || "未能重設密碼。", "error");
  }
}

async function saveParentAssignments(parentId) {
  const card = elements.parentList.querySelector(`[data-parent-id="${CSS.escape(parentId)}"]`);
  if (!card || state.currentUser?.role !== "admin") return;
  const assigned = state.parentAssignmentDrafts.get(parentId)
    || new Set(Array.isArray(state.adminParents.find((item) => item.id === parentId)?.assigned_student_ids)
      ? state.adminParents.find((item) => item.id === parentId).assigned_student_ids
      : []);
  const studentIds = [...assigned];
  try {
    await callRpc("schedule_admin_assign_parent_students", {
      p_admin_token: state.currentUser.adminToken,
      p_parent_id: parentId,
      p_student_ids: studentIds
    });
    const parent = state.adminParents.find((item) => item.id === parentId);
    if (parent) parent.assigned_student_ids = studentIds;
    state.parentAssignmentDrafts.delete(parentId);
    showToast(`已儲存 ${studentIds.length} 個子女指派。`, "success");
  } catch (error) {
    setStatus(elements.parentAdminStatus, error.message || "未能儲存子女指派。", "error");
  }
}

async function deactivateStudentAccount(studentId, name) {
  if (!window.confirm(`確定要停用學生帳戶「${name}」嗎？\n學習紀錄會保留，但帳戶將不能登入。`)) return;
  try {
    await callRpc("schedule_admin_deactivate_student", {
      p_admin_token: state.currentUser.adminToken,
      p_student_id: studentId
    });
    state.studentStatusFilter = "inactive";
    elements.studentProfileDialog?.close();
    showToast(`已停用 ${name}。`, "success");
    await openAdminPanel();
  } catch (error) {
    setStatus(elements.adminStatus, error.message || "未能停用學生帳戶。", "error");
  }
}

async function deleteParentAccount(parentId, name) {
  if (!window.confirm(`確定要刪除家長帳戶「${name}」嗎？\n所有子女指派及家長登入會一併移除。`)) return;
  try {
    await callRpc("schedule_admin_delete_parent", {
      p_admin_token: state.currentUser.adminToken,
      p_parent_id: parentId
    });
    showToast(`已刪除家長帳戶 ${name}。`, "success");
    await openAdminPanel();
  } catch (error) {
    setStatus(elements.parentAdminStatus, error.message || "未能刪除家長帳戶。", "error");
  }
}

async function openStudentSchedule(studentId) {
  const student = state.adminStudents.find((item) => item.id === studentId);
  if (!student || state.currentUser?.role !== "admin") return;
  if (!guardMassEditNavigation()) return;
  await flushPendingMotivationSaves();
  clearRenderedSchedule();
  state.selectedStudent = { id: student.id, name: student.name };
  showView("calendar");
  await loadWeek();
}

function activeStudent() {
  if (state.currentUser?.role === "student") {
    return { id: state.currentUser.id, name: state.currentUser.name };
  }
  return state.selectedStudent;
}

async function loadWeek(focusTarget = null) {
  await flushPendingMotivationSaves();
  const student = activeStudent();
  if (!student) return;
  syncMotivationVisibilityPreference(student);
  applyDisplayPreferences();
  await safelyReplayStoredMotivationSaves(student);
  await safelyReplayStoredWellbeingSaves(student);
  syncDisplayedWeekUrl();
  captureCountdownDrafts();
  resetSelectionMode();
  const requestedWeek = state.weekStart;
  const requestId = state.weekRequestId + 1;
  state.weekRequestId = requestId;
  state.weekPayload = emptyWeekPayload();
  elements.weekGrid.replaceChildren();
  renderEncouragementFromPayload("正在載入本星期的打氣說話…");
  setStatus(elements.learningPurposeStatus, "正在載入學習初心…");
  setMetricsUnavailable();
  elements.exportPdf.disabled = true;
  setStatus(elements.calendarStatus, "正在載入本星期安排…");
  elements.weekGrid.setAttribute("aria-busy", "true");
  updateMassEditControls();
  updateCalendarHeading();

  try {
    const [payload, encouragementPayload, motivationPayload, wellbeingPayload, learningPurposePayload, reminderEmailPayload, opportunitiesPayload] = state.currentUser.role === "admin"
      ? await Promise.all([
          callRpc("schedule_admin_get_week", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id,
            p_week_start: requestedWeek
          }),
          callRpc("schedule_admin_get_encouragement", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id,
            p_week_start: requestedWeek
          }),
          safelyLoadMotivationWeek("schedule_admin_get_motivation_week", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id,
            p_week_start: requestedWeek
          }),
          safelyLoadWellbeingWeek("schedule_admin_get_wellbeing_week", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id,
            p_week_start: requestedWeek
          }),
          safelyLoadLearningPurpose("schedule_admin_get_learning_purpose", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id,
            p_version_id: null
          }),
          Promise.resolve(null),
          callRpc("schedule_admin_get_language_opportunities", {
            p_admin_token: state.currentUser.adminToken,
            p_student_id: student.id
          }).catch(() => null)
        ])
      : await Promise.all([
          callRpc("schedule_student_get_week", {
            p_token: state.currentUser.studentToken,
            p_week_start: requestedWeek
          }),
          callRpc("schedule_student_get_encouragement", {
            p_token: state.currentUser.studentToken,
            p_week_start: requestedWeek
          }),
          safelyLoadMotivationWeek("schedule_student_get_motivation_week", {
            p_token: state.currentUser.studentToken,
            p_week_start: requestedWeek
          }),
          safelyLoadWellbeingWeek("schedule_student_get_wellbeing_week", {
            p_token: state.currentUser.studentToken,
            p_week_start: requestedWeek
          }),
          safelyLoadLearningPurpose("schedule_student_get_learning_purpose", {
            p_token: state.currentUser.studentToken,
            p_version_id: null
          }),
          safelyLoadReminderEmail(),
          callRpc("schedule_student_get_language_opportunities", {
            p_token: state.currentUser.studentToken
          }).catch(() => null)
        ]);

    if (requestId !== state.weekRequestId || requestedWeek !== state.weekStart) return;
    if (!payload || typeof payload !== "object") {
      throw new Error("登入已失效，請重新登入。");
    }
    applySavedDisplayPreferences(payload.displayPreferences);
    state.weekPayload = {
      capacities: payload.capacities && typeof payload.capacities === "object" ? payload.capacities : {},
      capacityVersions: payload.capacityVersions && typeof payload.capacityVersions === "object"
        ? payload.capacityVersions
        : {},
      entries: Array.isArray(payload.entries)
        ? payload.entries.map((entry) => ({
          ...entry,
          estimatedMinutes: Number(entry.estimatedMinutes) || null,
          isCompleted: entry.isCompleted === true,
          isInProgress: entry.isInProgress === true,
          isMoreThanHalfCompleted: entry.isMoreThanHalfCompleted === true,
          isPreviousIncomplete: entry.isPreviousIncomplete === true,
          spanGroupId: entry.spanGroupId || null
          }))
        : [],
      metrics: payload.metrics && typeof payload.metrics === "object"
        ? {
            weekGoals: Number(payload.metrics.weekGoals) || 0,
            totalGoals: Number(payload.metrics.totalGoals) || 0,
            weekCompleted: Number(payload.metrics.weekCompleted) || 0,
            totalCompleted: Number(payload.metrics.totalCompleted) || 0,
            homeworkTypeCounts: Object.fromEntries(HOMEWORK_RESOURCE_TYPES.map((definition) => [
              definition.type,
              Math.max(0, Number(payload.metrics.homeworkTypeCounts?.[definition.type]) || 0)
            ]))
          }
        : emptyWeekPayload().metrics,
      countdownCapacity: Math.max(MIN_COUNTDOWNS, Math.min(MAX_COUNTDOWNS, Number(payload.countdownCapacity) || MIN_COUNTDOWNS)),
      countdowns: Array.isArray(payload.countdowns) ? payload.countdowns : [],
      encouragement: normalizeEncouragement(encouragementPayload),
      reminderEmail: normalizeReminderEmail(reminderEmailPayload),
      motivationRatings: motivationRatingsByDate(motivationPayload),
      wellbeingRatings: wellbeingRatingsByMetricAndDate(wellbeingPayload)
    };
    state.learningPurpose = normalizeLearningPurposePayload(learningPurposePayload);
    state.languageOpportunitiesMessage = normalizeLanguageOpportunities(opportunitiesPayload).message;
    state.reminderEmail = normalizeReminderEmail(reminderEmailPayload);
    if (state.massEditMode) {
      state.massEditOriginalEntries = cloneScheduleEntries(state.weekPayload.entries);
      state.massEditChanges.clear();
      clearClipboardSelection({ deactivate: true });
      state.showUnusedTemporarily = true;
      setStatus(elements.massEditStatus, "Mass Edit 保持開啟：目前顯示的星期可直接批量編輯。");
    }
    renderWeek();
    renderEncouragementFromPayload();
    renderReminderEmail();
    renderLearningPurpose();
    renderLanguageOpportunities();
    loadLearningDayCounters();
    renderMetrics();
    renderCountdowns();
    restoreCalendarFocus(focusTarget);
    elements.exportPdf.disabled = false;
    setStatus(elements.calendarStatus, `已儲存於雲端 · ${state.weekPayload.entries.length} 項安排`);
  } catch (error) {
    if (requestId !== state.weekRequestId) return;
    console.warn("Schedule week load failed", error);
    setStatus(elements.calendarStatus, error.message || "未能載入本星期安排。", "error");
    setStatus(elements.encouragementStatus, "未能載入本星期的打氣說話。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (requestId === state.weekRequestId) {
      elements.weekGrid.removeAttribute("aria-busy");
      updateMassEditControls();
    }
  }
}

function restoreCalendarFocus(target) {
  if (!target?.date) return;
  const primarySelector = target.slotIndex
    ? `[data-slot-date="${target.date}"][data-slot-index="${Number(target.slotIndex)}"]`
    : `[data-${target.control === "remove" ? "remove" : "add"}-slots-date="${target.date}"]`;
  window.requestAnimationFrame(() => {
    const selectors = [
      primarySelector,
      `[data-add-slots-date="${target.date}"]`,
      `[data-remove-slots-date="${target.date}"]`
    ];
    const focusable = selectors
      .map((selector) => elements.weekGrid.querySelector(selector))
      .find((candidate) => candidate && !candidate.disabled && candidate.getClientRects().length > 0);
    if (focusable) focusable.focus();
    else if (state.tableHidden) elements.toggleTable.focus();
  });
}

function updateCalendarHeading() {
  const student = activeStudent();
  elements.viewingLabel.textContent = state.currentUser?.role === "admin" ? "正在查看學生" : "我的安排";
  elements.viewingStudent.textContent = student?.name || "學生";
  renderLearningDayCounters();
  elements.weekRange.textContent = formatWeekRange(state.weekStart);
  const first = toISODate(firstWeekStart());
  const last = toISODate(lastWeekStart());
  elements.previousWeek.disabled = state.weekStart <= first;
  elements.nextWeek.disabled = state.weekStart >= last;
}

function entryMap() {
  return new Map(state.weekPayload.entries.map((entry) => [
    `${entry.scheduleDate}:${entry.slotIndex}`,
    entry
  ]));
}

function motivationSaveKey(studentId, scheduleDate) {
  return `${studentId || ""}:${scheduleDate}`;
}

function readStoredPendingMotivationSaves() {
  try {
    const rows = JSON.parse(localStorage.getItem(MOTIVATION_PENDING_STORAGE_KEY) || "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter((row) => (
      UUID_RE.test(String(row?.studentId || ""))
      && isDateInScheduleRange(String(row?.scheduleDate || ""))
      && normalizeMotivationRating(row?.rating) !== null
    )).map((row) => ({
      studentId: String(row.studentId),
      scheduleDate: String(row.scheduleDate),
      rating: normalizeMotivationRating(row.rating),
      queuedAt: Number(row.queuedAt) || Date.now()
    }));
  } catch {
    return [];
  }
}

function writeStoredPendingMotivationSaves(rows) {
  try {
    if (!rows.length) localStorage.removeItem(MOTIVATION_PENDING_STORAGE_KEY);
    else localStorage.setItem(MOTIVATION_PENDING_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // The live two-second save still works when private browsing blocks localStorage.
  }
}

function rememberPendingMotivationSave(studentId, scheduleDate, rating) {
  const rows = readStoredPendingMotivationSaves().filter((row) => (
    row.studentId !== studentId || row.scheduleDate !== scheduleDate
  ));
  rows.push({ studentId, scheduleDate, rating, queuedAt: Date.now() });
  writeStoredPendingMotivationSaves(rows);
}

function forgetPendingMotivationSave(studentId, scheduleDate, savedRating) {
  const rows = readStoredPendingMotivationSaves();
  const remaining = rows.filter((row) => !(
    row.studentId === studentId
    && row.scheduleDate === scheduleDate
    && row.rating === savedRating
  ));
  if (remaining.length !== rows.length) writeStoredPendingMotivationSaves(remaining);
}

async function replayStoredMotivationSaves(student) {
  if (!student || !state.currentUser) return;
  const queued = readStoredPendingMotivationSaves().filter((row) => row.studentId === student.id);
  if (!queued.length) return;
  const actor = state.currentUser.role === "admin"
    ? { role: "admin", adminToken: state.currentUser.adminToken }
    : { role: "student", studentToken: state.currentUser.studentToken };
  await Promise.allSettled(queued.map(async (row) => {
    if (actor.role === "admin") {
      await callRpc("schedule_admin_save_motivation_rating", {
        p_admin_token: actor.adminToken,
        p_student_id: student.id,
        p_schedule_date: row.scheduleDate,
        p_rating: row.rating
      });
    } else {
      await callRpc("schedule_student_save_motivation_rating", {
        p_token: actor.studentToken,
        p_schedule_date: row.scheduleDate,
        p_rating: row.rating
      });
    }
    forgetPendingMotivationSave(student.id, row.scheduleDate, row.rating);
  }));
}

async function safelyReplayStoredMotivationSaves(student) {
  try {
    await replayStoredMotivationSaves(student);
  } catch (error) {
    // Motivation is supplementary. A transient retry failure must never stop
    // the student's actual weekly schedule from opening.
    console.warn("Stored motivation replay failed", error);
  }
}

function readStoredPendingWellbeingSaves() {
  try {
    const rows = JSON.parse(localStorage.getItem(WELLBEING_PENDING_STORAGE_KEY) || "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter((row) => (
      UUID_RE.test(String(row?.studentId || ""))
      && isDateInScheduleRange(String(row?.scheduleDate || ""))
      && normalizeWellbeingMetric(row?.metric)
      && normalizeMotivationRating(row?.rating) !== null
    )).map((row) => ({
      studentId: String(row.studentId),
      scheduleDate: String(row.scheduleDate),
      metric: normalizeWellbeingMetric(row.metric),
      rating: normalizeMotivationRating(row.rating),
      queuedAt: Number(row.queuedAt) || Date.now()
    }));
  } catch {
    return [];
  }
}

function writeStoredPendingWellbeingSaves(rows) {
  try {
    if (!rows.length) localStorage.removeItem(WELLBEING_PENDING_STORAGE_KEY);
    else localStorage.setItem(WELLBEING_PENDING_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // The live two-second save still works when private browsing blocks storage.
  }
}

function rememberPendingWellbeingSave(studentId, scheduleDate, metric, rating) {
  const rows = readStoredPendingWellbeingSaves().filter((row) => !(
    row.studentId === studentId && row.scheduleDate === scheduleDate && row.metric === metric
  ));
  rows.push({ studentId, scheduleDate, metric, rating, queuedAt: Date.now() });
  writeStoredPendingWellbeingSaves(rows);
}

function forgetPendingWellbeingSave(studentId, scheduleDate, metric, savedRating) {
  const rows = readStoredPendingWellbeingSaves();
  const remaining = rows.filter((row) => !(
    row.studentId === studentId
    && row.scheduleDate === scheduleDate
    && row.metric === metric
    && row.rating === savedRating
  ));
  if (remaining.length !== rows.length) writeStoredPendingWellbeingSaves(remaining);
}

async function replayStoredWellbeingSaves(student) {
  if (!student || !state.currentUser) return;
  const queued = readStoredPendingWellbeingSaves().filter((row) => row.studentId === student.id);
  if (!queued.length) return;
  await Promise.allSettled(queued.map(async (row) => {
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_save_wellbeing_rating", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: student.id,
        p_schedule_date: row.scheduleDate,
        p_metric: row.metric,
        p_rating: row.rating
      });
    } else {
      await callRpc("schedule_student_save_wellbeing_rating", {
        p_token: state.currentUser.studentToken,
        p_schedule_date: row.scheduleDate,
        p_metric: row.metric,
        p_rating: row.rating
      });
    }
    forgetPendingWellbeingSave(student.id, row.scheduleDate, row.metric, row.rating);
  }));
}

async function safelyReplayStoredWellbeingSaves(student) {
  try {
    await replayStoredWellbeingSaves(student);
  } catch (error) {
    console.warn("Stored wellbeing replay failed", error);
  }
}

async function safelyLoadMotivationWeek(rpcName, args) {
  try {
    return await callRpc(rpcName, args);
  } catch (error) {
    // Keep the timetable available if this optional panel is temporarily down.
    console.warn("Schedule motivation week load failed", error);
    return [];
  }
}

async function safelyLoadWellbeingWeek(rpcName, args) {
  try {
    return await callRpc(rpcName, args);
  } catch (error) {
    console.warn("Schedule wellbeing week load failed", error);
    return [];
  }
}

async function safelyLoadLearningPurpose(rpcName, args) {
  try {
    return await callRpc(rpcName, args);
  } catch (error) {
    console.warn("Schedule learning purpose load failed", error);
    return null;
  }
}

async function safelyLoadReminderEmail() {
  try {
    return await callRpc("schedule_student_get_reminder_email", {
      p_token: state.currentUser.studentToken
    });
  } catch (error) {
    console.warn("Schedule reminder email load failed", error);
    return null;
  }
}

function motivationSaveContextIsCurrent(context) {
  const student = activeStudent();
  return Boolean(
    context
    && state.currentUser?.role === context.actor.role
    && student?.id === context.studentId
    && state.weekStart === context.weekStart
  );
}

function cancelPendingMotivationSaves() {
  state.motivationSaveTimers.forEach((timerId) => window.clearTimeout(timerId));
  state.motivationSaveTimers.clear();
  state.motivationPendingSaves.clear();
  state.motivationSaveGenerations.clear();
  state.wellbeingSaveTimers.forEach((timerId) => window.clearTimeout(timerId));
  state.wellbeingSaveTimers.clear();
  state.wellbeingPendingSaves.clear();
  state.wellbeingSaveGenerations.clear();
}

function runDailyMotivationSave(context) {
  window.clearTimeout(state.motivationSaveTimers.get(context.key));
  state.motivationSaveTimers.delete(context.key);
  state.motivationPendingSaves.delete(context.key);
  // Serialize writes for one student/date. Without this chain, an older RPC
  // could finish after a newer selection and overwrite the latest rating in
  // Supabase even though the interface already showed the newer value.
  const previous = state.motivationSaveChains.get(context.key) || Promise.resolve();
  const promise = previous
    .catch(() => undefined)
    .then(() => saveDailyMotivationRating(context));
  state.motivationSaveChains.set(context.key, promise);
  state.motivationSavePromises.add(promise);
  promise.finally(() => {
    state.motivationSavePromises.delete(promise);
    if (state.motivationSaveChains.get(context.key) === promise) {
      state.motivationSaveChains.delete(context.key);
    }
  });
  return promise;
}

async function flushPendingMotivationSaves() {
  const pending = [...state.motivationPendingSaves.entries()];
  pending.forEach(([key]) => {
    window.clearTimeout(state.motivationSaveTimers.get(key));
    state.motivationSaveTimers.delete(key);
    state.motivationPendingSaves.delete(key);
  });
  const newlyStarted = pending.map(([, context]) => runDailyMotivationSave(context));
  const inFlight = [...state.motivationSavePromises];
  const wellbeingPending = [...state.wellbeingPendingSaves.entries()];
  wellbeingPending.forEach(([key]) => {
    window.clearTimeout(state.wellbeingSaveTimers.get(key));
    state.wellbeingSaveTimers.delete(key);
    state.wellbeingPendingSaves.delete(key);
  });
  const newlyStartedWellbeing = wellbeingPending.map(([, context]) => runDailyWellbeingSave(context));
  const wellbeingInFlight = [...state.wellbeingSavePromises];
  const all = [...new Set([
    ...newlyStarted,
    ...inFlight,
    ...newlyStartedWellbeing,
    ...wellbeingInFlight
  ])];
  if (all.length) await Promise.allSettled(all);
}

function motivationRecord(scheduleDate) {
  return state.weekPayload.motivationRatings?.[scheduleDate] || null;
}

function motivationStatusElement(scheduleDate) {
  return elements.weekGrid.querySelector(`[data-motivation-status="${scheduleDate}"]`);
}

function updateMotivationPanelSelection(scheduleDate, message = "") {
  const selectedRating = normalizeMotivationRating(motivationRecord(scheduleDate)?.rating);
  elements.weekGrid.querySelectorAll(`[data-motivation-date="${scheduleDate}"]`).forEach((button) => {
    const selected = Number(button.dataset.motivationRating) === selectedRating;
    button.setAttribute("aria-pressed", String(selected));
  });
  const status = motivationStatusElement(scheduleDate);
  if (status) {
    status.textContent = message || (selectedRating ? `已選擇 ${selectedRating}` : "尚未評分");
    status.dataset.state = message.includes("未能") ? "error" : "";
  }
}

function wellbeingRecord(metric, scheduleDate) {
  return state.weekPayload.wellbeingRatings?.[metric]?.[scheduleDate] || null;
}

function selfRatingRecord(metric, scheduleDate) {
  return metric === "motivation" ? motivationRecord(scheduleDate) : wellbeingRecord(metric, scheduleDate);
}

function wellbeingStatusElement(metric, scheduleDate) {
  return elements.weekGrid.querySelector(
    `[data-wellbeing-status="${metric}:${scheduleDate}"]`
  );
}

function updateWellbeingPanelSelection(metric, scheduleDate, message = "") {
  const selectedRating = normalizeMotivationRating(wellbeingRecord(metric, scheduleDate)?.rating);
  elements.weekGrid.querySelectorAll(
    `[data-wellbeing-metric="${metric}"][data-wellbeing-date="${scheduleDate}"]`
  ).forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.wellbeingRating) === selectedRating));
  });
  const status = wellbeingStatusElement(metric, scheduleDate);
  if (status) {
    status.textContent = message || (selectedRating ? `已選擇 ${selectedRating}` : "尚未評分");
    status.dataset.state = message.includes("未能") ? "error" : "";
  }
}

function restoreSelfRatingFocus(metric, scheduleDate, rating) {
  window.requestAnimationFrame(() => {
    const selector = metric === "motivation"
      ? `[data-motivation-date="${scheduleDate}"][data-motivation-rating="${rating}"]`
      : `[data-wellbeing-metric="${metric}"][data-wellbeing-date="${scheduleDate}"][data-wellbeing-rating="${rating}"]`;
    elements.weekGrid.querySelector(selector)?.focus();
  });
}

function restoreRatingCollapseFocus(metric, scheduleDate) {
  window.requestAnimationFrame(() => {
    elements.weekGrid.querySelector(
      `[data-rating-collapse="${metric}"][data-rating-collapse-date="${scheduleDate}"]`
    )?.focus({ preventScroll: true });
  });
}

function createDailySelfEvaluationPanel(definition, scheduleDate, dayIndex, active) {
  const panel = document.createElement("section");
  panel.className = `daily-motivation-rating daily-self-rating rating-${definition.key}`;
  panel.dataset.selfRatingPanel = definition.key;
  if (definition.key === "motivation") panel.hidden = state.hideMotivation;
  const collapsed = state.ratingCollapsed?.[definition.key] === true;
  panel.classList.toggle("is-collapsed", collapsed);
  panel.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}${definition.label}`);

  const heading = document.createElement("div");
  heading.className = "daily-self-rating-heading";
  const title = document.createElement("p");
  title.className = "daily-motivation-title";
  title.textContent = collapsed ? definition.shortLabel : definition.label;
  const collapse = document.createElement("button");
  collapse.type = "button";
  collapse.className = "daily-self-rating-collapse";
  collapse.dataset.ratingCollapse = definition.key;
  collapse.dataset.ratingCollapseDate = scheduleDate;
  collapse.textContent = collapsed ? "+" : "−";
  collapse.setAttribute("aria-expanded", String(!collapsed));
  collapse.setAttribute("aria-label", `${collapsed ? "展開" : "收起"}${definition.label}`);
  heading.append(title, collapse);
  panel.append(heading);
  if (collapsed) return panel;

  if (!active) {
    panel.classList.add("is-disabled");
    const unavailable = document.createElement("p");
    unavailable.className = "daily-motivation-status";
    unavailable.textContent = "不適用";
    panel.append(unavailable);
    return panel;
  }

  const selectedRating = normalizeMotivationRating(selfRatingRecord(definition.key, scheduleDate)?.rating);
  const scale = document.createElement("div");
  scale.className = "daily-motivation-scale";
  scale.setAttribute("role", "group");
  scale.setAttribute("aria-label", `${formatDayDate(scheduleDate)}${definition.label}；1 最低，5 最高`);
  for (let rating = 1; rating <= 5; rating += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "daily-motivation-circle";
    if (definition.key === "motivation") {
      button.dataset.motivationDate = scheduleDate;
      button.dataset.motivationRating = String(rating);
    } else {
      button.dataset.wellbeingMetric = definition.key;
      button.dataset.wellbeingDate = scheduleDate;
      button.dataset.wellbeingRating = String(rating);
    }
    button.textContent = String(rating);
    button.style.setProperty("--rating-strength", `${28 + (rating * 12)}%`);
    button.setAttribute("aria-label", `${definition.label} ${rating}`);
    button.setAttribute("aria-pressed", String(selectedRating === rating));
    scale.append(button);
  }
  panel.append(scale);

  const status = document.createElement("p");
  status.className = "daily-motivation-status";
  if (definition.key === "motivation") status.dataset.motivationStatus = scheduleDate;
  else status.dataset.wellbeingStatus = `${definition.key}:${scheduleDate}`;
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = selectedRating ? `已選擇 ${selectedRating}` : "尚未評分";
  panel.append(status);
  return panel;
}

function createDailyMotivationPanel(scheduleDate, dayIndex, active) {
  return createDailySelfEvaluationPanel(
    selfEvaluationDefinition("motivation"), scheduleDate, dayIndex, active
  );
}

async function saveDailyMotivationRating(context) {
  const { actor, studentId, scheduleDate, rating, key, generation } = context;
  try {
    const saved = actor.role === "admin"
      ? await callRpc("schedule_admin_save_motivation_rating", {
          p_admin_token: actor.adminToken,
          p_student_id: studentId,
          p_schedule_date: scheduleDate,
          p_rating: rating
        })
      : await callRpc("schedule_student_save_motivation_rating", {
          p_token: actor.studentToken,
          p_schedule_date: scheduleDate,
          p_rating: rating
        });
    if (state.motivationSaveGenerations.get(key) !== generation) return;
    if (!motivationSaveContextIsCurrent(context)) return;
    const normalized = normalizeMotivationRating(saved?.rating) ?? rating;
    state.weekPayload.motivationRatings[scheduleDate] = {
      rating: normalized,
      persistedRating: normalized,
      updatedAt: saved?.updatedAt || saved?.updated_at || new Date().toISOString()
    };
    forgetPendingMotivationSave(studentId, scheduleDate, rating);
    updateMotivationPanelSelection(scheduleDate, "已自動儲存");
  } catch (error) {
    if (state.motivationSaveGenerations.get(key) !== generation) return;
    if (!motivationSaveContextIsCurrent(context)) return;
    const current = motivationRecord(scheduleDate);
    const persistedRating = normalizeMotivationRating(current?.persistedRating);
    if (persistedRating === null) delete state.weekPayload.motivationRatings[scheduleDate];
    else state.weekPayload.motivationRatings[scheduleDate] = { ...current, rating: persistedRating };
    renderWeek();
    restoreSelfRatingFocus("motivation", scheduleDate, persistedRating ?? rating);
    updateMotivationPanelSelection(scheduleDate, "未能儲存，請再選一次");
    console.warn("Schedule motivation save failed", error);
  } finally {
    if (state.motivationSaveGenerations.get(key) === generation) {
      state.motivationSaveTimers.delete(key);
      state.motivationSaveGenerations.delete(key);
    }
  }
}

function stageDailyMotivationRating(scheduleDate, rawRating) {
  const rating = normalizeMotivationRating(rawRating);
  const student = activeStudent();
  if (!student || rating === null || !isDateInScheduleRange(scheduleDate) || !state.currentUser) return;

  const previous = motivationRecord(scheduleDate);
  state.weekPayload.motivationRatings[scheduleDate] = {
    rating,
    persistedRating: normalizeMotivationRating(previous?.persistedRating),
    updatedAt: previous?.updatedAt || null
  };
  rememberPendingMotivationSave(student.id, scheduleDate, rating);
  renderWeek();
  restoreSelfRatingFocus("motivation", scheduleDate, rating);
  updateMotivationPanelSelection(scheduleDate, "將於 2 秒後自動儲存…");

  const key = motivationSaveKey(student.id, scheduleDate);
  window.clearTimeout(state.motivationSaveTimers.get(key));
  const generation = (state.motivationSaveGenerations.get(key) || 0) + 1;
  state.motivationSaveGenerations.set(key, generation);
  const actor = state.currentUser.role === "admin"
    ? { role: "admin", adminToken: state.currentUser.adminToken }
    : { role: "student", studentToken: state.currentUser.studentToken };
  const context = {
    actor,
    studentId: student.id,
    scheduleDate,
    weekStart: state.weekStart,
    rating,
    key,
    generation
  };
  state.motivationPendingSaves.set(key, context);
  state.motivationSaveTimers.set(key, window.setTimeout(() => {
    runDailyMotivationSave(context);
  }, MOTIVATION_SAVE_DELAY_MS));
}

function runDailyWellbeingSave(context) {
  window.clearTimeout(state.wellbeingSaveTimers.get(context.key));
  state.wellbeingSaveTimers.delete(context.key);
  state.wellbeingPendingSaves.delete(context.key);
  const previous = state.wellbeingSaveChains.get(context.key) || Promise.resolve();
  const promise = previous
    .catch(() => undefined)
    .then(() => saveDailyWellbeingRating(context));
  state.wellbeingSaveChains.set(context.key, promise);
  state.wellbeingSavePromises.add(promise);
  promise.finally(() => {
    state.wellbeingSavePromises.delete(promise);
    if (state.wellbeingSaveChains.get(context.key) === promise) {
      state.wellbeingSaveChains.delete(context.key);
    }
  });
  return promise;
}

async function saveDailyWellbeingRating(context) {
  const { actor, studentId, scheduleDate, metric, rating, key, generation } = context;
  try {
    const saved = actor.role === "admin"
      ? await callRpc("schedule_admin_save_wellbeing_rating", {
          p_admin_token: actor.adminToken,
          p_student_id: studentId,
          p_schedule_date: scheduleDate,
          p_metric: metric,
          p_rating: rating
        })
      : await callRpc("schedule_student_save_wellbeing_rating", {
          p_token: actor.studentToken,
          p_schedule_date: scheduleDate,
          p_metric: metric,
          p_rating: rating
        });
    if (state.wellbeingSaveGenerations.get(key) !== generation) return;
    if (!motivationSaveContextIsCurrent(context)) return;
    const normalized = normalizeMotivationRating(saved?.rating) ?? rating;
    state.weekPayload.wellbeingRatings[metric][scheduleDate] = {
      rating: normalized,
      persistedRating: normalized,
      updatedAt: saved?.updatedAt || saved?.updated_at || new Date().toISOString()
    };
    forgetPendingWellbeingSave(studentId, scheduleDate, metric, rating);
    updateWellbeingPanelSelection(metric, scheduleDate, "已自動儲存");
  } catch (error) {
    if (state.wellbeingSaveGenerations.get(key) !== generation) return;
    if (!motivationSaveContextIsCurrent(context)) return;
    const current = wellbeingRecord(metric, scheduleDate);
    const persistedRating = normalizeMotivationRating(current?.persistedRating);
    if (persistedRating === null) delete state.weekPayload.wellbeingRatings[metric][scheduleDate];
    else state.weekPayload.wellbeingRatings[metric][scheduleDate] = { ...current, rating: persistedRating };
    renderWeek();
    restoreSelfRatingFocus(metric, scheduleDate, persistedRating ?? rating);
    updateWellbeingPanelSelection(metric, scheduleDate, "未能儲存，請再選一次");
    console.warn("Schedule wellbeing save failed", error);
  } finally {
    if (state.wellbeingSaveGenerations.get(key) === generation) {
      state.wellbeingSaveTimers.delete(key);
      state.wellbeingSaveGenerations.delete(key);
    }
  }
}

function stageDailyWellbeingRating(rawMetric, scheduleDate, rawRating) {
  const metric = normalizeWellbeingMetric(rawMetric);
  const rating = normalizeMotivationRating(rawRating);
  const student = activeStudent();
  if (!metric || !student || rating === null
    || !isDateInScheduleRange(scheduleDate) || !state.currentUser) return;
  const previous = wellbeingRecord(metric, scheduleDate);
  state.weekPayload.wellbeingRatings[metric][scheduleDate] = {
    rating,
    persistedRating: normalizeMotivationRating(previous?.persistedRating),
    updatedAt: previous?.updatedAt || null
  };
  rememberPendingWellbeingSave(student.id, scheduleDate, metric, rating);
  renderWeek();
  restoreSelfRatingFocus(metric, scheduleDate, rating);
  updateWellbeingPanelSelection(metric, scheduleDate, "將於 2 秒後自動儲存…");

  const key = `${student.id}:${scheduleDate}:${metric}`;
  window.clearTimeout(state.wellbeingSaveTimers.get(key));
  const generation = (state.wellbeingSaveGenerations.get(key) || 0) + 1;
  state.wellbeingSaveGenerations.set(key, generation);
  const actor = state.currentUser.role === "admin"
    ? { role: "admin", adminToken: state.currentUser.adminToken }
    : { role: "student", studentToken: state.currentUser.studentToken };
  const context = {
    actor, studentId: student.id, scheduleDate, weekStart: state.weekStart,
    metric, rating, key, generation
  };
  state.wellbeingPendingSaves.set(key, context);
  state.wellbeingSaveTimers.set(key, window.setTimeout(() => {
    runDailyWellbeingSave(context);
  }, WELLBEING_SAVE_DELAY_MS));
}

function renderWeek() {
  updateCalendarHeading();
  const entries = entryMap();
  const dates = weekDates(state.weekStart);
  const today = hongKongDayKey();
  const hideUnusedNow = unusedSlotsAreHidden();
  const spanLayout = spanLaneLayout(state.weekPayload.entries, dates);
  const spanEntriesByCell = new Map(state.weekPayload.entries
    .filter((entry) => entry.spanGroupId && spanLayout.laneByGroup[entry.spanGroupId] !== undefined)
    .map((entry) => [
      `${entry.scheduleDate}:${spanLayout.laneByGroup[entry.spanGroupId]}`,
      entry
    ]));
  elements.weekGrid.replaceChildren();

  dates.forEach((date, dayIndex) => {
    const active = isDateInScheduleRange(date);
    const focusLimited = active && shouldLimitHomeworkSlots(
      state.weekPayload.motivationRatings,
      state.weekPayload.wellbeingRatings,
      date
    );
    const rawCapacity = Number(state.weekPayload.capacities[date]);
    const capacity = active
      ? Math.max(10, Math.min(MAX_SLOTS_PER_DAY, Number.isFinite(rawCapacity) ? rawCapacity : 10))
      : 0;

    const column = document.createElement("section");
    column.className = "day-column";
    column.dataset.columnDate = date;
    column.setAttribute("aria-labelledby", `schedule-day-${date}`);
    if (dayIndex >= 5) column.classList.add("is-weekend");
    if (!active) column.classList.add("is-outside-range");
    if (date === today) column.classList.add("is-today");
    if (focusLimited) column.classList.add("is-self-rating-focus-mode");

    const header = document.createElement("header");
    header.className = "day-header";
    const mascot = document.createElement("img");
    mascot.className = "day-mascot";
    mascot.src = WEEKDAY_MASCOTS[dayIndex];
    mascot.alt = "";
    mascot.setAttribute("aria-hidden", "true");
    const weekday = document.createElement("h2");
    weekday.id = `schedule-day-${date}`;
    weekday.textContent = WEEKDAY_LABELS[dayIndex];
    const dateLabel = document.createElement("span");
    dateLabel.textContent = active ? formatDayDate(date) : `${formatDayDate(date)} · 範圍外`;
    header.append(mascot, weekday, dateLabel);

    const selfRatings = SELF_EVALUATION_DEFINITIONS.map((definition) => (
      definition.key === "motivation"
        ? createDailyMotivationPanel(date, dayIndex, active)
        : createDailySelfEvaluationPanel(definition, date, dayIndex, active)
    ));
    const selfRatingList = document.createElement("div");
    selfRatingList.className = "daily-self-rating-list";
    selfRatingList.append(...selfRatings);
    const slots = document.createElement("div");
    slots.className = "day-slots";
    if (active) {
      const ordinarySlots = document.createElement("div");
      ordinarySlots.className = "ordinary-slot-list";
      let visibleSlots = 0;
      for (let slotIndex = 1; slotIndex <= capacity; slotIndex += 1) {
        if (focusLimited && slotIndex > 1) continue;
        const entry = entries.get(`${date}:${slotIndex}`);
        if (entry?.spanGroupId) continue;
        if (hideUnusedNow && !focusLimited && !entry) continue;
        ordinarySlots.append(createSlotButton(date, dayIndex, slotIndex, entry));
        visibleSlots += 1;
      }
      slots.append(ordinarySlots);

      if (spanLayout.laneCount) {
        const spanLanes = document.createElement("div");
        spanLanes.className = "span-lane-list";
        spanLanes.dataset.spanLaneCount = String(spanLayout.laneCount);
        for (let lane = 0; lane < spanLayout.laneCount; lane += 1) {
          const entry = spanEntriesByCell.get(`${date}:${lane}`);
          if (focusLimited && (!entry || Number(entry.slotIndex) !== 1)) continue;
          if (entry) {
            const spanSlot = createSlotButton(date, dayIndex, Number(entry.slotIndex), entry);
            spanSlot.dataset.spanLane = String(lane);
            spanLanes.append(spanSlot);
            visibleSlots += 1;
          } else {
            const placeholder = document.createElement("div");
            placeholder.className = "span-lane-placeholder";
            placeholder.dataset.spanLane = String(lane);
            placeholder.setAttribute("aria-hidden", "true");
            spanLanes.append(placeholder);
          }
        }
        slots.append(spanLanes);
      }
      if (focusLimited) {
        const focusNote = document.createElement("p");
        focusNote.className = "self-rating-focus-note";
        focusNote.textContent = "專注模式已啟動：目前只顯示 Slot 1。更新自評後會即時恢復其他格。";
        slots.prepend(focusNote);
      }
      if (hideUnusedNow && visibleSlots === 0) {
        const note = document.createElement("p");
        note.className = "unused-day-note";
        note.textContent = "本日未有安排；\n未使用格已隱藏。";
        ordinarySlots.append(note);
      }
    } else {
      const note = document.createElement("p");
      note.className = "empty-state";
      note.textContent = "只提供 2026 年 1 月至 2050 年 12 月。";
      slots.append(note);
    }

    column.append(header, selfRatingList, slots);
    if (active) {
      const spanDropZone = document.createElement("button");
      spanDropZone.type = "button";
      spanDropZone.className = "span-drop-zone";
      spanDropZone.dataset.spanDropDate = date;
      spanDropZone.textContent = "拖放至此延伸多日項目";
      spanDropZone.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}：拖放或在操作模式按此延伸多日項目`);
      spanDropZone.disabled = state.massEditMode;
      column.append(spanDropZone);

      const controls = document.createElement("div");
      controls.className = "capacity-controls";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-slots-button";
      removeButton.dataset.removeSlotsDate = date;
      removeButton.textContent = capacity <= 10 ? "最少 10 格" : "－5 格";
      removeButton.disabled = state.massEditMode || capacity <= 10;
      removeButton.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}收起 5 個空白安排格`);

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-slots-button";
      addButton.dataset.addSlotsDate = date;
      addButton.textContent = capacity >= MAX_SLOTS_PER_DAY ? "已達每日上限" : "＋5 格";
      addButton.disabled = state.massEditMode || capacity >= MAX_SLOTS_PER_DAY;
      addButton.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}增加 5 個安排格`);
      controls.append(removeButton, addButton);
      column.append(controls);
    }
    elements.weekGrid.append(column);
  });
  updateSelectionControls();
  updateMassEditControls();
  applyClipboardSelectionClasses();
}

function createSlotButton(date, dayIndex, slotIndex, entry, spanBottomStart = false) {
  const parsedEntry = entry ? parseScheduleMessage(entry.message) : { text: "", resources: [], tags: [] };
  const cell = document.createElement("div");
  cell.className = "schedule-slot-cell";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "schedule-slot";
  button.dataset.slotDate = date;
  button.dataset.slotIndex = String(slotIndex);
  button.setAttribute(
    "aria-label",
    `${WEEKDAY_LABELS[dayIndex]} ${formatDayDate(date)} 第 ${slotIndex} 格${entry ? `：${parsedEntry.text}${parsedEntry.tags.length ? `，標籤：${parsedEntry.tags.map((tag) => tag.label).join("、")}` : ""}${parsedEntry.resources.length ? `，附有 ${parsedEntry.resources.length} 個功課連結` : ""}${entry.isCompleted ? "，已完成" : entry.isMoreThanHalfCompleted ? "，已完成超過一半" : entry.isInProgress ? "，進行中" : ""}${entry.isPreviousIncomplete ? "，之前功課未完成" : ""}` : "，新增安排"}`
  );

  const topLine = document.createElement("span");
  topLine.className = "slot-topline";
  const number = document.createElement("span");
  number.className = "slot-number";
  number.textContent = `SLOT ${String(slotIndex).padStart(2, "0")}`;
  topLine.append(number);
  if (entry?.isCompleted) {
    button.classList.add("is-completed");
    const completion = document.createElement("span");
    completion.className = "completion-badge";
    completion.textContent = "已完成";
    topLine.append(completion);
  } else if (entry?.isInProgress) {
    button.classList.add("is-in-progress");
    const progress = document.createElement("span");
    progress.className = "progress-badge";
    progress.textContent = "進行中";
    topLine.append(progress);
  } else if (entry?.isMoreThanHalfCompleted) {
    button.classList.add("is-more-than-half-completed");
    const moreThanHalfCompleted = document.createElement("span");
    moreThanHalfCompleted.className = "more-than-half-completed-badge";
    moreThanHalfCompleted.textContent = "已完成超過一半";
    topLine.append(moreThanHalfCompleted);
  }
  if (entry?.isPreviousIncomplete) {
    button.classList.add("is-previous-incomplete");
    const previousIncomplete = document.createElement("span");
    previousIncomplete.className = "previous-incomplete-badge";
    previousIncomplete.textContent = "之前功課未完成";
    topLine.append(previousIncomplete);
  }
  button.append(topLine);

  if (entry) {
    button.classList.add("has-entry");
    if (parsedEntry.tags.length) {
      button.classList.add("has-entry-tag-wraps");
      parsedEntry.tags.slice(0, HOMEWORK_ENTRY_TAGS.length).forEach((tag, index) => {
        button.style.setProperty(`--entry-tag-wrap-${index + 1}`, tag.color);
      });
    }
    button.dataset.entryId = entry.id;
    button.draggable = canMoveEntry(entry) || canDragMassEditGroup(entry);
    if (canMoveEntry(entry)) button.classList.add("can-touch-drag");
    if (canDragMassEditGroup(entry)) {
      button.classList.add("can-group-drag");
      button.title = "拖到另一個日期欄可整組移動；按住 Option／Alt 拖動可整組複製";
    }
    if (state.touchActionEntryId && spanMemberIds(findEntryById(state.touchActionEntryId)).has(entry.id)) {
      button.classList.add("is-touch-action");
    }
    if (entry.spanGroupId) {
      const bounds = spanBounds(state.weekPayload.entries, entry);
      cell.classList.add("is-span-project-cell");
      button.classList.add("is-span-project");
      if (spanBottomStart) button.classList.add("span-bottom-start");
      if (entry.scheduleDate === bounds.start) {
        button.classList.add("span-start");
        cell.style.setProperty(
          "--span-project-width",
          `calc(${bounds.length * 100}% + ${(bounds.length - 1) * SPAN_COLUMN_BRIDGE_PX}px)`
        );
      } else {
        button.classList.add("span-continuation");
        button.classList.add(entry.scheduleDate === bounds.end ? "span-end" : "span-middle");
        button.draggable = false;
        button.tabIndex = -1;
        button.setAttribute("aria-hidden", "true");
      }
      button.dataset.spanGroupId = entry.spanGroupId;
      const spanBadge = document.createElement("span");
      spanBadge.className = "span-badge";
      spanBadge.textContent = `${bounds.length} 日項目`;
      topLine.append(spanBadge);
    }
    if (entry.massEditDraft) {
      button.classList.add("is-mass-edit-draft");
      const draftBadge = document.createElement("span");
      draftBadge.className = "draft-badge";
      draftBadge.textContent = "未儲存";
      topLine.append(draftBadge);
    }
    if (state.clipboardSelectedEntryIds.has(entry.id)) {
      button.classList.add("is-clipboard-selected");
      if (state.massEditMode && state.clipboardSelectionMode) button.setAttribute("aria-pressed", "true");
    }
    if (state.selectedEntryIds.has(entry.id)) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    } else if (state.selectionMode) {
      button.setAttribute("aria-pressed", "false");
    }
    if (state.moveEntryId && state.moveEntryId !== entry.id) button.classList.add("is-move-blocked");
    if (entry.source === "admin") button.classList.add("is-admin-entry");
    const source = document.createElement("span");
    source.className = `entry-source ${entry.source === "admin" ? "admin" : "student"}`;
    source.textContent = entry.source === "admin" ? "老師安排" : "學生安排";
    const message = document.createElement("p");
    message.className = parsedEntry.text ? "entry-message" : "entry-message slot-placeholder";
    message.textContent = parsedEntry.text || "尚未加入功課內容";
    button.append(source, message);
    if (parsedEntry.tags.length) {
      const tags = document.createElement("span");
      tags.className = "entry-tag-list";
      for (const tag of parsedEntry.tags) {
        const badge = document.createElement("span");
        badge.className = "entry-custom-tag";
        badge.style.setProperty("--entry-tag-colour", tag.color);
        badge.style.setProperty("--entry-tag-text", tag.textColor);
        badge.textContent = tag.label;
        tags.append(badge);
      }
      button.append(tags);
    }
    if (entry.estimatedMinutes) {
      const time = document.createElement("span");
      time.className = "estimated-time";
      time.textContent = `預計需時：${formatEstimatedMinutes(entry.estimatedMinutes)}`;
      button.append(time);
    }
  } else {
    if (state.moveEntryId) button.classList.add("is-move-target");
    const placeholder = document.createElement("span");
    placeholder.className = "slot-placeholder";
    placeholder.textContent = "按此新增安排";
    button.append(placeholder);
  }
  cell.append(button);
  if (parsedEntry.resources.length && !button.classList.contains("span-continuation")) {
    const links = document.createElement("nav");
    links.className = "entry-homework-links";
    links.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}第 ${slotIndex} 格功課連結`);
    parsedEntry.resources.slice(0, 3).forEach((resource) => {
      const link = document.createElement("a");
      link.className = "entry-homework-link";
      link.href = resource.url;
      link.dataset.homeworkLinkUrl = resource.url;
      link.draggable = false;
      const isDownload = resource.type === "download-material" || resource.type === "model-essay-download";
      const linkAction = isDownload ? "下載教材" : "開啟功課";
      link.title = `${linkAction}：${resource.label}`;
      link.setAttribute("aria-label", `${linkAction}：${resource.label}`);
      link.textContent = `${isDownload ? "↓" : "↗"} ${resource.label}`;
      links.append(link);
    });
    if (entry?.spanGroupId) button.classList.add("has-homework-links");
    cell.append(links);
  }
  return cell;
}

function findEntry(date, slotIndex) {
  return state.weekPayload.entries.find((entry) => (
    entry.scheduleDate === date && Number(entry.slotIndex) === Number(slotIndex)
  )) || null;
}

function findEntryById(entryId) {
  return state.weekPayload.entries.find((entry) => entry.id === entryId) || null;
}

function toggleSelectionMode() {
  if (state.mutationInFlight || state.massEditMode) return;
  if (state.selectionMode) {
    if (state.moveEntryId) state.showUnusedTemporarily = false;
    resetSelectionMode();
  } else {
    state.selectionMode = true;
  }
  renderWeek();
}

function cancelSelectionMode() {
  if (state.mutationInFlight || state.massEditMode) return;
  if (state.moveEntryId) state.showUnusedTemporarily = false;
  resetSelectionMode();
  renderWeek();
}

function toggleEntrySelection(entry) {
  if (!entry || state.mutationInFlight || state.massEditMode) return;
  const memberIds = spanMemberIds(entry);
  const shouldSelect = ![...memberIds].every((id) => state.selectedEntryIds.has(id));
  memberIds.forEach((id) => {
    if (shouldSelect) state.selectedEntryIds.add(id);
    else state.selectedEntryIds.delete(id);
  });
  state.moveEntryId = null;
  renderWeek();
}

function batchItems(entries) {
  return entries.map((entry) => ({
    entry_id: entry.id,
    expected_updated_at: entry.updatedAt
  }));
}

async function batchSetCompletion() {
  return batchSetExclusiveStatus("completed");
}

async function batchSetExclusiveStatus(targetStatus) {
  if (state.massEditMode) return;
  const entries = selectedEntries();
  if (!entries.length || state.mutationInFlight) return;
  const definitions = {
    completed: { property: "isCompleted", label: "已完成" },
    in_progress: { property: "isInProgress", label: "進行中" },
    more_than_half_completed: { property: "isMoreThanHalfCompleted", label: "已完成超過一半" },
    previous_incomplete: { property: "isPreviousIncomplete", label: "上週未完成" }
  };
  const definition = definitions[targetStatus];
  if (!definition) return;
  const { property, label } = definition;
  const active = !entries.every((entry) => entry[property] === true);
  const nextStatus = active ? targetStatus : "none";
  setMutationInFlight(true);
  setStatus(elements.calendarStatus, active ? `正在標記所選安排為${label}…` : `正在取消所選安排的${label}標記…`);
  try {
    const common = { p_items: batchItems(entries), p_status: nextStatus };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_batch_set_entries_status", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_batch_set_entries_status", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    showToast(active
      ? `已把 ${entries.length} 項安排標記為${label}。`
      : `已取消 ${entries.length} 項安排的${label}標記。`, "success");
    await loadWeek();
    if (active && targetStatus === "completed") showCompletionCelebration();
  } catch (error) {
    console.warn("Schedule batch status update failed", error);
    if (isConcurrencyError(error)) {
      showToast("部分安排已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.calendarStatus, error.message || "未能更新所選安排。", "error");
      if (isExpiredSessionError(error)) await logout();
    }
  } finally {
    setMutationInFlight(false);
  }
}

async function batchDeleteEntries() {
  if (state.massEditMode) return;
  const entries = selectedEntries();
  if (!entries.length || state.mutationInFlight) return;
  if (state.currentUser.role === "student" && entries.some((entry) => entry.source === "admin")) {
    showToast("老師安排只可由管理員刪除。", "error");
    return;
  }
  const confirmed = window.confirm(`確定要刪除所選的 ${entries.length} 項安排嗎？\n刪除後無法復原。`);
  if (!confirmed) return;

  setMutationInFlight(true);
  setStatus(elements.calendarStatus, "正在刪除所選安排…");
  try {
    const common = { p_items: batchItems(entries) };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_batch_delete_entries", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_batch_delete_entries", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    showToast(`已刪除 ${entries.length} 項安排。`);
    await loadWeek();
  } catch (error) {
    console.warn("Schedule batch delete failed", error);
    if (isConcurrencyError(error)) {
      showToast("部分安排已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.calendarStatus, error.message || "未能刪除所選安排。", "error");
      if (isExpiredSessionError(error)) await logout();
    }
  } finally {
    setMutationInFlight(false);
  }
}

function beginMoveSelected() {
  if (state.massEditMode) return;
  const entries = selectedEntries();
  if (entries.length !== 1 || !canMoveEntry(entries[0]) || state.mutationInFlight) return;
  state.moveEntryId = entries[0].id;
  if (unusedSlotsAreHidden()) {
    state.showUnusedTemporarily = true;
    applyDisplayPreferences();
  }
  renderWeek();
  showToast("請按一下要移到的空白格；也可按取消結束。", "success");
}

async function moveEntryTo(entry, targetDate, targetSlotIndex) {
  if (state.massEditMode) return;
  if (!entry || state.mutationInFlight || !canMoveEntry(entry)) return;
  if (entry.spanGroupId) {
    showToast("多日項目已固定在各日最底；可拖到相鄰日期繼續延伸。", "error");
    return;
  }
  const targetSlot = Number(targetSlotIndex);
  if (entry.scheduleDate === targetDate && Number(entry.slotIndex) === targetSlot) {
    showToast("安排已在這一格。", "error");
    return;
  }
  const targetEntry = findEntry(targetDate, targetSlot);
  if (targetEntry && !canMoveEntry(targetEntry)) {
    showToast("老師安排只可由管理員移動或交換。", "error");
    return;
  }

  const sourceVersion = Math.max(0, Number(state.weekPayload.capacityVersions[entry.scheduleDate]) || 0);
  const targetVersion = Math.max(0, Number(state.weekPayload.capacityVersions[targetDate]) || 0);
  setMutationInFlight(true);
  setStatus(elements.calendarStatus, "正在移動安排…");
  try {
    const common = {
      p_entry_id: entry.id,
      p_expected_updated_at: entry.updatedAt,
      p_source_date: entry.scheduleDate,
      p_source_slot_index: Number(entry.slotIndex),
      p_target_date: targetDate,
      p_target_slot_index: targetSlot,
      p_source_capacity_version: sourceVersion,
      p_target_capacity_version: targetVersion,
      p_target_expected_updated_at: targetEntry?.updatedAt || null
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_move_entry_checked", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_move_entry_checked", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    state.suppressClickUntil = Date.now() + 400;
    state.showUnusedTemporarily = false;
    showToast(targetEntry
      ? `兩項安排已交換位置。`
      : `安排已移到 ${formatDayDate(targetDate)} 第 ${targetSlot} 格。`);
    await loadWeek({ date: targetDate, slotIndex: targetSlot });
  } catch (error) {
    console.warn("Schedule move failed", error);
    const message = String(error?.message || "");
    if (/protected|teacher assignment/i.test(message)) {
      showToast("老師安排只可由管理員移動或交換。", "error");
      await loadWeek();
    } else if (isConcurrencyError(error)) {
      showToast("日程已在另一個頁面更新；已重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.calendarStatus, message || "未能移動安排。", "error");
      if (isExpiredSessionError(error)) await logout();
    }
  } finally {
    state.draggingEntryId = null;
    setMutationInFlight(false);
  }
}

async function extendEntryToDay(entry, targetDate, { adjacentOnly = false } = {}) {
  if (state.massEditMode) return;
  if (!entry || state.mutationInFlight || !canMoveEntry(entry)) return;
  const bounds = spanBounds(state.weekPayload.entries, entry);
  if (adjacentOnly && !isAdjacentSpanTarget(state.weekPayload.entries, entry, targetDate)) {
    showToast("多日項目每次只可延伸至相鄰的一天。", "error");
    return;
  }
  if (!weekDates(state.weekStart).includes(targetDate)) {
    showToast("多日項目只可在目前星期內延伸。", "error");
    return;
  }
  if (targetDate >= bounds.start && targetDate <= bounds.end) {
    showToast("這一天已包括在多日項目內。", "error");
    return;
  }

  setMutationInFlight(true);
  setStatus(elements.calendarStatus, "正在延伸多日項目…");
  try {
    const common = {
      p_entry_id: entry.id,
      p_expected_updated_at: entry.updatedAt,
      p_target_date: targetDate
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_extend_entry_span", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_extend_entry_span", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    state.suppressClickUntil = Date.now() + 450;
    leaveTouchActionMode();
    showToast(`項目已延伸至 ${formatDayDate(targetDate)}，並排列在各日最底。`);
    await loadWeek({ date: targetDate });
  } catch (error) {
    console.warn("Schedule span extension failed", error);
    const message = String(error?.message || "");
    if (isConcurrencyError(error)) {
      showToast("日程已在另一個頁面更新；已重新載入。", "error");
      await loadWeek();
    } else {
      setStatus(elements.calendarStatus, message || "未能延伸多日項目。", "error");
      if (isExpiredSessionError(error)) await logout();
    }
  } finally {
    setMutationInFlight(false);
  }
}

function queueMassEditUpsert(message, estimatedMinutes, statusPatch = {}) {
  if (!state.massEditMode || !state.editing) return;
  const { date, slotIndex, entry } = state.editing;
  const originalEntry = massEditOriginalEntry(date, slotIndex, entry);
  // Editing must not transfer ownership: only a newly-created entry belongs to
  // the current actor. This keeps an administrator's correction to a student's
  // own plan from turning it into a protected teacher assignment.
  const source = originalEntry?.source
    || (state.currentUser?.role === "admin" ? "admin" : "student");
  const key = massEditChangeKey(date, slotIndex, originalEntry);
  let isCompleted = Boolean(statusPatch.isCompleted ?? entry?.isCompleted ?? originalEntry?.isCompleted ?? false);
  let isInProgress = Boolean(statusPatch.isInProgress ?? entry?.isInProgress ?? originalEntry?.isInProgress ?? false);
  let isMoreThanHalfCompleted = Boolean(
    statusPatch.isMoreThanHalfCompleted
    ?? entry?.isMoreThanHalfCompleted
    ?? originalEntry?.isMoreThanHalfCompleted
    ?? false
  );
  let isPreviousIncomplete = Boolean(
    statusPatch.isPreviousIncomplete
    ?? entry?.isPreviousIncomplete
    ?? originalEntry?.isPreviousIncomplete
    ?? false
  );
  if (statusPatch.isCompleted === true) {
    isInProgress = false;
    isMoreThanHalfCompleted = false;
    isPreviousIncomplete = false;
  } else if (statusPatch.isInProgress === true) {
    isCompleted = false;
    isMoreThanHalfCompleted = false;
    isPreviousIncomplete = false;
  } else if (statusPatch.isMoreThanHalfCompleted === true) {
    isCompleted = false;
    isInProgress = false;
    isPreviousIncomplete = false;
  } else if (statusPatch.isPreviousIncomplete === true) {
    isCompleted = false;
    isInProgress = false;
    isMoreThanHalfCompleted = false;
  }
  const unchanged = Boolean(originalEntry)
    && originalEntry.message === message
    && (Number(originalEntry.estimatedMinutes) || null) === estimatedMinutes
    && originalEntry.isCompleted === isCompleted
    && originalEntry.isInProgress === isInProgress
    && originalEntry.isMoreThanHalfCompleted === isMoreThanHalfCompleted
    && originalEntry.isPreviousIncomplete === isPreviousIncomplete;

  if (unchanged) {
    state.massEditChanges.delete(key);
  } else {
    state.massEditChanges.set(key, {
      action: "upsert",
      scheduleDate: originalEntry?.scheduleDate || date,
      slotIndex: Number(originalEntry?.slotIndex || slotIndex),
      message,
      estimatedMinutes,
      expectedUpdatedAt: originalEntry?.updatedAt || null,
      spanGroupId: originalEntry?.spanGroupId || null,
      source,
      isCompleted,
      isInProgress,
      isMoreThanHalfCompleted,
      isPreviousIncomplete
    });
  }
  rebuildMassEditPreview();
  renderWeek();
}

function queueMassEditDelete() {
  if (!state.massEditMode || !state.editing?.entry) return;
  const { date, slotIndex, entry } = state.editing;
  const originalEntry = massEditOriginalEntry(date, slotIndex, entry);
  const key = massEditChangeKey(date, slotIndex, originalEntry);

  if (!originalEntry) {
    state.massEditChanges.delete(key);
  } else {
    state.massEditChanges.set(key, {
      action: "delete",
      scheduleDate: originalEntry.scheduleDate,
      slotIndex: Number(originalEntry.slotIndex),
      message: null,
      estimatedMinutes: null,
      expectedUpdatedAt: originalEntry.updatedAt,
      spanGroupId: originalEntry.spanGroupId || null,
      source: originalEntry.source,
      isCompleted: null,
      isInProgress: null,
      isMoreThanHalfCompleted: null,
      isPreviousIncomplete: null
    });
  }
  rebuildMassEditPreview();
  renderWeek();
}

async function saveMassEdit() {
  if (!state.massEditMode || !state.massEditChanges.size || state.mutationInFlight) return;
  const student = activeStudent();
  if (!student) return;
  const changes = [...state.massEditChanges.values()].map((change) => ({
    action: change.action,
    scheduleDate: change.scheduleDate,
    slotIndex: change.slotIndex,
    message: change.message,
    estimatedMinutes: change.estimatedMinutes,
    expectedUpdatedAt: change.expectedUpdatedAt,
    source: change.source,
    isCompleted: change.isCompleted,
    isInProgress: change.isInProgress,
    isMoreThanHalfCompleted: change.isMoreThanHalfCompleted,
    isPreviousIncomplete: change.isPreviousIncomplete
  }));
  const owner = `${state.currentUser?.role || ""}:${student.id}:${state.weekStart}`;
  const changeCount = changes.length;
  let shouldLogout = false;

  setMutationInFlight(true);
  setStatus(elements.massEditStatus, `正在一次儲存 ${changeCount} 項修改…`);
  try {
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_apply_entry_batch", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: student.id,
        p_week_start: state.weekStart,
        p_changes: changes
      });
    } else {
      await callRpc("schedule_student_apply_entry_batch", {
        p_token: state.currentUser.studentToken,
        p_week_start: state.weekStart,
        p_changes: changes
      });
    }

    const currentStudent = activeStudent();
    const currentOwner = `${state.currentUser?.role || ""}:${currentStudent?.id || ""}:${state.weekStart}`;
    if (owner !== currentOwner) return;
    leaveMassEdit({ restoreOriginal: false });
    showToast(`${changeCount} 項安排已一次儲存至雲端。`);
    await loadWeek();
  } catch (error) {
    console.warn("Schedule mass edit save failed", error);
    if (isConcurrencyError(error)) {
      setStatus(
        elements.massEditStatus,
        "其中一格已在另一個頁面更新；您的草稿仍保留。請取消 Mass Edit、重新載入後再修改。",
        "error"
      );
    } else {
      setStatus(elements.massEditStatus, error.message || "未能一次儲存修改，草稿仍保留。", "error");
    }
    shouldLogout = isExpiredSessionError(error);
  } finally {
    setMutationInFlight(false);
  }
  if (shouldLogout) await logout();
}

function openEntryDialog(date, slotIndex) {
  const dayIndex = weekDates(state.weekStart).indexOf(date);
  const entry = findEntry(date, slotIndex);
  const originalEntry = state.massEditMode
    ? massEditOriginalEntry(date, slotIndex, entry)
    : entry;
  const parsedEntry = parseScheduleMessage(entry?.message || "");
  state.editing = {
    date,
    slotIndex: Number(slotIndex),
    entry,
    originalEntry,
    resources: [...parsedEntry.resources],
    tags: parsedEntry.tags.map((tag) => tag.key)
  };
  const protectedTeacherEntry = isStudentTagOnlyEntry(entry);
  elements.entryTitle.textContent = protectedTeacherEntry ? "老師安排" : entry ? "修改安排" : "新增安排";
  elements.entryMeta.textContent = `${WEEKDAY_LABELS[dayIndex] || "日期"} · ${formatDayDate(date)} · 第 ${slotIndex} 格`;
  elements.entryMessage.value = parsedEntry.text;
  elements.entryMessage.readOnly = protectedTeacherEntry;
  elements.entryEstimatedMinutes.value = entry?.estimatedMinutes || "";
  elements.entryEstimatedMinutes.readOnly = protectedTeacherEntry;
  elements.entryTags.querySelectorAll("input[data-homework-tag]").forEach((input) => {
    input.checked = state.editing.tags.includes(input.value);
    input.disabled = false;
  });
  elements.entryHint.textContent = protectedTeacherEntry
    ? "老師安排的內容及連結受到保護；你仍可選擇多個標籤，然後按「儲存標籤」。"
    : state.massEditMode
      ? "按 Enter 暫存本格；完成所有修改後，再按「一次儲存全部」。"
      : "按 Enter 儲存；如要換行請按 Shift + Enter。";
  elements.deleteEntry.hidden = !entry || protectedTeacherEntry;
  elements.saveEntry.hidden = false;
  elements.saveEntry.textContent = protectedTeacherEntry
    ? "儲存標籤"
    : state.massEditMode
      ? "暫存本格"
      : "儲存";
  elements.deleteEntry.textContent = state.massEditMode ? "加入待刪除" : "刪除";
  elements.toggleComplete.hidden = state.massEditMode || !entry;
  elements.toggleComplete.dataset.completed = String(Boolean(entry?.isCompleted));
  elements.toggleComplete.setAttribute("aria-pressed", String(Boolean(entry?.isCompleted)));
  elements.toggleComplete.textContent = entry?.isCompleted ? "取消完成" : "標記完成";
  elements.toggleProgress.hidden = state.massEditMode || !entry;
  elements.toggleProgress.dataset.inProgress = String(Boolean(entry?.isInProgress));
  elements.toggleProgress.setAttribute("aria-pressed", String(Boolean(entry?.isInProgress)));
  elements.toggleProgress.textContent = entry?.isInProgress ? "取消進行中" : "標記進行中";
  elements.toggleMoreThanHalfCompleted.hidden = !entry || (state.massEditMode && protectedTeacherEntry);
  elements.toggleMoreThanHalfCompleted.dataset.moreThanHalfCompleted = String(Boolean(entry?.isMoreThanHalfCompleted));
  elements.toggleMoreThanHalfCompleted.setAttribute("aria-pressed", String(Boolean(entry?.isMoreThanHalfCompleted)));
  elements.toggleMoreThanHalfCompleted.textContent = entry?.isMoreThanHalfCompleted
    ? "取消已完成超過一半"
    : "標記已完成超過一半";
  elements.togglePreviousIncomplete.hidden = !entry || (state.massEditMode && protectedTeacherEntry);
  elements.togglePreviousIncomplete.dataset.previousIncomplete = String(Boolean(entry?.isPreviousIncomplete));
  elements.togglePreviousIncomplete.setAttribute("aria-pressed", String(Boolean(entry?.isPreviousIncomplete)));
  elements.togglePreviousIncomplete.textContent = entry?.isPreviousIncomplete
    ? "取消之前功課未完成"
    : "標記之前功課未完成";
  setStatus(elements.entryStatus, "");
  state.homeworkCompletion = null;
  elements.homeworkAutocomplete.hidden = true;
  closeHomeworkPicker();
  renderHomeworkAttachments();
  elements.entryDialog.showModal();
  window.setTimeout(() => {
    if (protectedTeacherEntry) {
      elements.entryTags.querySelector("input[data-homework-tag]")?.focus();
    }
    else elements.entryMessage.focus();
  }, 40);
}

async function saveEntry(event) {
  event.preventDefault();
  if (!state.editing) return;
  const tagOnlyTeacherEntry = isStudentTagOnlyEntry();
  if (elements.entryMessage.readOnly && !tagOnlyTeacherEntry) return;
  const focusTarget = {
    date: state.editing.date,
    slotIndex: state.editing.slotIndex
  };
  const visibleMessage = elements.entryMessage.value.trim();
  const checkedTagKeys = new Set(
    [...elements.entryTags.querySelectorAll("input[data-homework-tag]:checked")].map((input) => input.value)
  );
  const selectedTags = state.editing.tags.filter((tagKey) => checkedTagKeys.has(tagKey));
  if (!tagOnlyTeacherEntry && !visibleMessage && !selectedTags.length) {
    setStatus(elements.entryStatus, "請輸入功課或溫習內容，或至少選擇一個功課標籤。", "error");
    return;
  }
  if (!tagOnlyTeacherEntry && (state.editing.resources || []).length > MAX_HOMEWORK_RESOURCES) {
    setStatus(elements.entryStatus, `每格最多可加入 ${MAX_HOMEWORK_RESOURCES} 個功課連結；請先移除其他連結。`, "error");
    return;
  }
  const message = tagOnlyTeacherEntry
    ? state.editing.entry.message
    : serializeScheduleMessage(visibleMessage, state.editing.resources, selectedTags);
  if (!tagOnlyTeacherEntry && message.length > SCHEDULE_MESSAGE_MAX_LENGTH) {
    setStatus(elements.entryStatus, "功課內容連同連結不可超過 2,000 字元；請縮短文字或移除部分連結。", "error");
    return;
  }
  const estimatedMinutes = tagOnlyTeacherEntry || elements.entryEstimatedMinutes.value === ""
    ? null
    : Math.round(Number(elements.entryEstimatedMinutes.value));
  if (estimatedMinutes !== null && (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 10080)) {
    setStatus(elements.entryStatus, "預計需時請輸入 1 至 10080 分鐘。", "error");
    return;
  }

  if (state.massEditMode && !tagOnlyTeacherEntry) {
    queueMassEditUpsert(message, estimatedMinutes);
    elements.entryDialog.close();
    showToast("本格已暫存；尚未上傳至雲端。");
    restoreCalendarFocus(focusTarget);
    return;
  }

  const submit = elements.entryForm.querySelector("[data-save-entry]");
  submit.disabled = true;
  setStatus(elements.entryStatus, "正在儲存…");
  try {
    if (tagOnlyTeacherEntry) {
      await callRpc("schedule_student_set_entry_tags", {
        p_token: state.currentUser.studentToken,
        p_entry_id: state.editing.entry.id,
        p_expected_updated_at: state.editing.entry.updatedAt,
        p_tag_keys: selectedTags
      });
    } else if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_upsert_entry", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id,
        p_schedule_date: state.editing.date,
        p_slot_index: state.editing.slotIndex,
        p_message: message,
        p_estimated_minutes: estimatedMinutes,
        p_expected_updated_at: state.editing.entry?.updatedAt || null
      });
    } else {
      await callRpc("schedule_student_upsert_entry", {
        p_token: state.currentUser.studentToken,
        p_schedule_date: state.editing.date,
        p_slot_index: state.editing.slotIndex,
        p_message: message,
        p_estimated_minutes: estimatedMinutes,
        p_expected_updated_at: state.editing.entry?.updatedAt || null
      });
    }
    elements.entryDialog.close();
    showToast(tagOnlyTeacherEntry ? "功課標籤已儲存。" : "安排已儲存至雲端。");
    await loadWeek(focusTarget);
  } catch (error) {
    console.warn("Schedule entry save failed", error);
    if (isConcurrencyError(error)) {
      elements.entryDialog.close();
      showToast("這一格已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek(focusTarget);
      return;
    }
    setStatus(elements.entryStatus, error.message || "未能儲存，請再試一次。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    submit.disabled = false;
  }
}

async function deleteEntry() {
  if (!state.editing?.entry) return;
  const focusTarget = {
    date: state.editing.date,
    slotIndex: state.editing.slotIndex
  };
  if (state.massEditMode) {
    queueMassEditDelete();
    elements.deleteDialog.close();
    elements.entryDialog.close();
    state.editing = null;
    showToast("刪除已加入待儲存修改；尚未上傳至雲端。");
    restoreCalendarFocus(focusTarget);
    return;
  }
  elements.confirmDelete.disabled = true;
  try {
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_delete_entry", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id,
        p_schedule_date: state.editing.date,
        p_slot_index: state.editing.slotIndex,
        p_expected_updated_at: state.editing.entry.updatedAt
      });
    } else {
      await callRpc("schedule_student_delete_entry", {
        p_token: state.currentUser.studentToken,
        p_schedule_date: state.editing.date,
        p_slot_index: state.editing.slotIndex,
        p_expected_updated_at: state.editing.entry.updatedAt
      });
    }
    elements.deleteDialog.close();
    elements.entryDialog.close();
    state.editing = null;
    showToast("安排已刪除。");
    await loadWeek(focusTarget);
  } catch (error) {
    console.warn("Schedule entry delete failed", error);
    elements.deleteDialog.close();
    if (isConcurrencyError(error)) {
      elements.entryDialog.close();
      showToast("這一格已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek(focusTarget);
      return;
    }
    setStatus(elements.entryStatus, error.message || "未能刪除，請再試一次。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    elements.confirmDelete.disabled = false;
  }
}

async function toggleEntryCompletion() {
  if (!state.editing?.entry) return;
  const entry = state.editing.entry;
  const completed = !Boolean(entry.isCompleted);
  const focusTarget = {
    date: state.editing.date,
    slotIndex: state.editing.slotIndex
  };
  elements.toggleComplete.disabled = true;
  setStatus(elements.entryStatus, completed ? "正在標記完成…" : "正在取消完成標記…");
  try {
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_set_entry_completed", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id,
        p_entry_id: entry.id,
        p_expected_updated_at: entry.updatedAt,
        p_completed: completed
      });
    } else {
      await callRpc("schedule_student_set_entry_completed", {
        p_token: state.currentUser.studentToken,
        p_entry_id: entry.id,
        p_expected_updated_at: entry.updatedAt,
        p_completed: completed
      });
    }
    elements.entryDialog.close();
    showToast(completed ? "這項安排已標記為完成。" : "已取消完成標記。");
    await loadWeek(focusTarget);
    if (completed) showCompletionCelebration();
  } catch (error) {
    console.warn("Schedule completion update failed", error);
    if (isConcurrencyError(error)) {
      elements.entryDialog.close();
      showToast("這一格已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek(focusTarget);
      return;
    }
    setStatus(elements.entryStatus, error.message || "未能更新完成狀態，請再試一次。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    elements.toggleComplete.disabled = false;
  }
}

async function toggleEntryProgress() {
  if (!state.editing?.entry) return;
  const entry = state.editing.entry;
  const inProgress = !Boolean(entry.isInProgress);
  const focusTarget = { date: state.editing.date, slotIndex: state.editing.slotIndex };
  elements.toggleProgress.disabled = true;
  setStatus(elements.entryStatus, inProgress ? "正在標記進行中…" : "正在取消進行中標記…");
  try {
    const common = {
      p_entry_id: entry.id,
      p_expected_updated_at: entry.updatedAt,
      p_in_progress: inProgress
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_set_entry_in_progress", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_set_entry_in_progress", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    elements.entryDialog.close();
    showToast(inProgress ? "這項安排已標記為進行中。" : "已取消進行中標記。");
    await loadWeek(focusTarget);
  } catch (error) {
    console.warn("Schedule progress update failed", error);
    if (isConcurrencyError(error)) {
      elements.entryDialog.close();
      showToast("這一格已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek(focusTarget);
      return;
    }
    setStatus(elements.entryStatus, error.message || "未能更新進行中狀態，請再試一次。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    elements.toggleProgress.disabled = false;
  }
}

async function toggleEntryPreviousIncomplete() {
  if (!state.editing?.entry) return;
  const entry = state.editing.entry;
  const previousIncomplete = !Boolean(entry.isPreviousIncomplete);
  const focusTarget = { date: state.editing.date, slotIndex: state.editing.slotIndex };

  if (state.massEditMode) {
    queueMassEditUpsert(entry.message, Number(entry.estimatedMinutes) || null, {
      isPreviousIncomplete: previousIncomplete
    });
    elements.entryDialog.close();
    showToast(previousIncomplete
      ? "已暫存「之前功課未完成」標記；尚未上傳至雲端。"
      : "已暫存取消「之前功課未完成」標記；尚未上傳至雲端。");
    restoreCalendarFocus(focusTarget);
    return;
  }

  elements.togglePreviousIncomplete.disabled = true;
  setStatus(elements.entryStatus, previousIncomplete ? "正在加入之前未完成標記…" : "正在取消之前未完成標記…");
  try {
    const common = {
      p_entry_id: entry.id,
      p_expected_updated_at: entry.updatedAt,
      p_previous_incomplete: previousIncomplete
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_set_entry_previous_incomplete", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_set_entry_previous_incomplete", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    elements.entryDialog.close();
    showToast(previousIncomplete
      ? "這項安排已標記為之前功課未完成。"
      : "已取消之前功課未完成標記。");
    await loadWeek(focusTarget);
  } catch (error) {
    console.warn("Schedule previous-incomplete update failed", error);
    if (isConcurrencyError(error)) {
      elements.entryDialog.close();
      showToast("這一格已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek(focusTarget);
      return;
    }
    setStatus(elements.entryStatus, error.message || "未能更新之前未完成標記，請再試一次。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    elements.togglePreviousIncomplete.disabled = false;
  }
}

async function toggleEntryMoreThanHalfCompleted() {
  if (!state.editing?.entry) return;
  const entry = state.editing.entry;
  const moreThanHalfCompleted = !Boolean(entry.isMoreThanHalfCompleted);
  const focusTarget = { date: state.editing.date, slotIndex: state.editing.slotIndex };

  if (state.massEditMode) {
    queueMassEditUpsert(entry.message, Number(entry.estimatedMinutes) || null, {
      isMoreThanHalfCompleted: moreThanHalfCompleted
    });
    elements.entryDialog.close();
    showToast(moreThanHalfCompleted
      ? "已暫存「已完成超過一半」標記；尚未上傳至雲端。"
      : "已暫存取消「已完成超過一半」標記；尚未上傳至雲端。");
    restoreCalendarFocus(focusTarget);
    return;
  }

  elements.toggleMoreThanHalfCompleted.disabled = true;
  setStatus(elements.entryStatus, moreThanHalfCompleted
    ? "正在標記為已完成超過一半…"
    : "正在取消已完成超過一半標記…");
  try {
    const memberIds = spanMemberIds(entry);
    const affectedEntries = state.weekPayload.entries.filter((candidate) => memberIds.has(candidate.id));
    const common = {
      p_items: batchItems(affectedEntries),
      p_status: moreThanHalfCompleted ? "more_than_half_completed" : "none"
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_batch_set_entries_status", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_batch_set_entries_status", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    elements.entryDialog.close();
    showToast(moreThanHalfCompleted
      ? "這項安排已標記為已完成超過一半。"
      : "已取消已完成超過一半標記。");
    await loadWeek(focusTarget);
  } catch (error) {
    console.warn("Schedule more-than-half-completed update failed", error);
    if (isConcurrencyError(error)) {
      elements.entryDialog.close();
      showToast("這一格已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek(focusTarget);
      return;
    }
    setStatus(elements.entryStatus, error.message || "未能更新已完成超過一半標記，請再試一次。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    elements.toggleMoreThanHalfCompleted.disabled = false;
  }
}

async function changeCapacity(date, delta, button) {
  if (state.mutationInFlight || state.massEditMode || ![5, -5].includes(delta)) return;
  button.disabled = true;
  const previousCapacity = Math.max(10, Number(state.weekPayload.capacities[date]) || 10);
  const expectedVersion = Math.max(0, Number(state.weekPayload.capacityVersions[date]) || 0);
  const shrinking = delta < 0;
  const targetCapacity = previousCapacity + delta;
  if (shrinking && state.weekPayload.entries.some((entry) => (
    entry.scheduleDate === date && Number(entry.slotIndex) > targetCapacity
  ))) {
    setStatus(elements.calendarStatus, "最後 5 格仍有安排，請先移動或刪除當中的內容。", "error");
    button.disabled = false;
    return;
  }
  setStatus(elements.calendarStatus, shrinking ? "正在收起 5 個空白格…" : "正在增加 5 個安排格…");
  try {
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_change_capacity", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id,
        p_schedule_date: date,
        p_expected_version: expectedVersion,
        p_delta: delta
      });
    } else {
      await callRpc("schedule_student_change_capacity", {
        p_token: state.currentUser.studentToken,
        p_schedule_date: date,
        p_expected_version: expectedVersion,
        p_delta: delta
      });
    }
    showToast(`${formatDayDate(date)} 已${shrinking ? "收起" : "增加"} 5 格。`);
    if (!shrinking && unusedSlotsAreHidden()) {
      state.showUnusedTemporarily = true;
      applyDisplayPreferences();
    }
    await loadWeek(shrinking
      ? { date, control: "remove" }
      : { date, slotIndex: Math.min(previousCapacity + 1, MAX_SLOTS_PER_DAY) });
  } catch (error) {
    console.warn("Schedule capacity update failed", error);
    const message = String(error?.message || "");
    if (isConcurrencyError(error)) {
      showToast("格數已在另一個頁面更新；日程已重新載入。", "error");
      await loadWeek({ date, control: shrinking ? "remove" : "add" });
      return;
    }
    const friendlyMessage = shrinking && /contain (?:entries|assignments)|occupied|entry|assignment/i.test(message)
      ? "最後 5 格仍有安排，請先移動或刪除當中的內容。"
      : message || (shrinking ? "未能收起格數。" : "未能增加格數。");
    setStatus(elements.calendarStatus, friendlyMessage, "error");
    button.disabled = false;
    if (isExpiredSessionError(error)) await logout();
  }
}

function prepareMassEditWeekNavigation() {
  if (!state.massEditMode) return true;
  if (
    state.massEditChanges.size
    && !window.confirm("目前星期尚有未儲存的 Mass Edit 修改。\n\n按「確定」會放棄這些修改並切換星期；按「取消」可返回後先按「一次儲存全部」。")
  ) return false;
  state.weekPayload.entries = cloneScheduleEntries(state.massEditOriginalEntries);
  state.massEditOriginalEntries = [];
  state.massEditChanges.clear();
  clearClipboardSelection({ deactivate: true });
  state.draggingMassEditGroup = null;
  setStatus(elements.massEditStatus, "正在切換星期；Mass Edit 會保持開啟。");
  return true;
}

async function changeWeek(amount) {
  if (state.mutationInFlight) return;
  const next = addDays(parseISODate(state.weekStart), amount);
  const first = firstWeekStart();
  const last = lastWeekStart();
  const clamped = next < first ? first : next > last ? last : next;
  const nextValue = toISODate(clamped);
  if (nextValue === state.weekStart) return;
  if (!prepareMassEditWeekNavigation()) return;
  await flushPendingMotivationSaves();
  state.showUnusedTemporarily = false;
  state.weekStart = nextValue;
  await loadWeek();
}

function preparePrintSheet() {
  const dates = weekDates(state.weekStart);
  elements.printStudent.textContent = activeStudent()?.name || "學生";
  elements.printRange.textContent = formatWeekRange(state.weekStart);
  elements.printGrid.replaceChildren();

  dates.forEach((date, dayIndex) => {
    const day = document.createElement("section");
    day.className = "print-day";

    const heading = document.createElement("header");
    heading.className = "print-day-heading";
    const weekday = document.createElement("strong");
    weekday.textContent = WEEKDAY_LABELS[dayIndex];
    const dateLabel = document.createElement("span");
    dateLabel.textContent = formatDayDate(date);
    heading.append(weekday, dateLabel);

    const list = document.createElement("div");
    list.className = "print-day-entries";
    const dayEntries = state.weekPayload.entries
      .filter((entry) => entry.scheduleDate === date)
      .sort((left, right) => Number(left.slotIndex) - Number(right.slotIndex));

    if (!dayEntries.length) {
      const empty = document.createElement("p");
      empty.className = "print-empty-day";
      empty.textContent = "本日未有安排";
      list.append(empty);
    } else {
      dayEntries.forEach((entry) => {
        const parsedEntry = parseScheduleMessage(entry.message);
        const card = document.createElement("article");
        card.className = `print-entry-card ${entry.source === "admin" ? "print-entry-admin" : "print-entry-student"}`;
        if (entry.isCompleted) card.classList.add("print-entry-completed");
        if (entry.isInProgress) card.classList.add("print-entry-progress");
        if (entry.isMoreThanHalfCompleted) card.classList.add("print-entry-more-than-half-completed");
        const label = document.createElement("span");
        label.className = "print-slot-label";
        label.textContent = `第 ${entry.slotIndex} 格`;
        const source = document.createElement("span");
        source.className = "print-source";
        source.textContent = `${entry.source === "admin" ? "老師安排" : "學生安排"}${entry.isCompleted ? " · 已完成" : entry.isMoreThanHalfCompleted ? " · 已完成超過一半" : entry.isInProgress ? " · 進行中" : ""}${entry.isPreviousIncomplete ? " · 之前功課未完成" : ""}`;
        const message = document.createElement("p");
        message.textContent = `${parsedEntry.text}${parsedEntry.resources.length ? `\n功課連結：${parsedEntry.resources.map((resource) => resource.label).join("、")}` : ""}${entry.estimatedMinutes ? `\n預計需時：${formatEstimatedMinutes(entry.estimatedMinutes)}` : ""}`;
        card.append(label, source, message);
        list.append(card);
      });
    }
    day.append(heading, list);
    elements.printGrid.append(day);
  });
}

function exportPdf() {
  if (!activeStudent() || !state.weekPayload || state.massEditMode) return;
  preparePrintSheet();
  const originalTitle = document.title;
  const safeName = String(activeStudent().name || "student").replace(/[\\/:*?"<>|]+/g, "-");
  document.title = `功課及溫習安排_${safeName}_${state.weekStart}`;
  elements.printSheet.setAttribute("aria-hidden", "false");

  const cleanup = () => {
    document.title = originalTitle;
    elements.printSheet.setAttribute("aria-hidden", "true");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
  window.setTimeout(cleanup, 120000);
}

function isExpiredSessionError(error) {
  const message = String(error?.message || "").toLocaleLowerCase();
  return message.includes("invalid or expired") || message.includes("登入已失效");
}

function isConcurrencyError(error) {
  return error?.code === "40001"
    || String(error?.message || "").toLocaleLowerCase().includes("another session");
}

function clipboardMarqueeViewportRect(marquee, event) {
  return {
    left: Math.min(marquee.startX, event.clientX),
    right: Math.max(marquee.startX, event.clientX),
    top: Math.min(marquee.startY, event.clientY),
    bottom: Math.max(marquee.startY, event.clientY)
  };
}

function rectsIntersect(left, right) {
  return left.left <= right.right
    && left.right >= right.left
    && left.top <= right.bottom
    && left.bottom >= right.top;
}

function beginClipboardMarquee(event) {
  const marqueeMode = state.massEditMode
    ? "clipboard"
    : (state.selectionMode ? "selection" : "");
  if (
    !marqueeMode
    || state.mutationInFlight
    || event.pointerType !== "mouse"
    || event.button !== 0
    || clipboardShouldRemainNative(event.target)
    || event.target.closest("a")
  ) return;
  const selectedDragSlot = event.target.closest("[data-entry-id]");
  if (
    selectedDragSlot
    && (marqueeMode === "clipboard"
      ? state.clipboardSelectedEntryIds
      : state.selectedEntryIds).has(selectedDragSlot.dataset.entryId)
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
  ) return;
  removeClipboardMarquee();
  const additive = event.metaKey || event.ctrlKey || event.shiftKey;
  const entryById = new Map(state.weekPayload.entries.map((entry) => [entry.id, entry]));
  const selectableSlots = [...elements.weekGrid.querySelectorAll(".schedule-slot.has-entry:not(.span-continuation)")]
    .map((slot) => ({ slot, entry: entryById.get(slot.dataset.entryId), rect: slot.getBoundingClientRect() }))
    .filter((item) => item.entry);
  state.clipboardMarquee = {
    mode: marqueeMode,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    additive,
    baseSelection: new Set(additive
      ? (marqueeMode === "clipboard" ? state.clipboardSelectedEntryIds : state.selectedEntryIds)
      : []),
    started: false,
    skippedSpan: false,
    element: null,
    selectableSlots
  };
}

function updateClipboardMarquee(event) {
  const marquee = state.clipboardMarquee;
  if (!marquee || event.pointerId !== marquee.pointerId) return;
  const distance = Math.hypot(event.clientX - marquee.startX, event.clientY - marquee.startY);
  if (!marquee.started && distance < MARQUEE_START_DISTANCE) return;
  if (!marquee.started) {
    marquee.started = true;
    if (marquee.mode === "clipboard") state.clipboardSelectionMode = true;
    marquee.element = document.createElement("div");
    marquee.element.className = "clipboard-selection-marquee";
    marquee.element.setAttribute("aria-hidden", "true");
    elements.calendarScroll.append(marquee.element);
    try {
      elements.calendarScroll.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; the window listener still tracks selection.
    }
    updateSelectionControls();
    updateClipboardControls();
  }
  event.preventDefault();
  const viewportRect = clipboardMarqueeViewportRect(marquee, event);
  const containerRect = elements.calendarScroll.getBoundingClientRect();
  marquee.element.style.left = `${viewportRect.left - containerRect.left + elements.calendarScroll.scrollLeft}px`;
  marquee.element.style.top = `${viewportRect.top - containerRect.top + elements.calendarScroll.scrollTop}px`;
  marquee.element.style.width = `${viewportRect.right - viewportRect.left}px`;
  marquee.element.style.height = `${viewportRect.bottom - viewportRect.top}px`;

  const nextSelection = new Set(marquee.baseSelection);
  marquee.skippedSpan = false;
  marquee.selectableSlots.forEach(({ entry, rect }) => {
    if (!rectsIntersect(viewportRect, rect)) return;
    if (entry?.spanGroupId && marquee.mode === "clipboard") {
      marquee.skippedSpan = true;
      return;
    }
    if (!entry) return;
    if (marquee.mode === "selection") {
      spanMemberIds(entry).forEach((entryId) => nextSelection.add(entryId));
    } else {
      nextSelection.add(entry.id);
    }
  });
  if (marquee.mode === "selection") {
    state.selectedEntryIds = nextSelection;
    elements.weekGrid.querySelectorAll("[data-entry-id]").forEach((slot) => {
      const selected = state.selectedEntryIds.has(slot.dataset.entryId);
      slot.classList.toggle("is-selected", selected);
      slot.setAttribute("aria-pressed", String(selected));
    });
    updateSelectionControls();
  } else {
    state.clipboardSelectedEntryIds = nextSelection;
    applyClipboardSelectionClasses();
    updateClipboardControls();
  }
}

function finishClipboardMarquee(event) {
  const marquee = state.clipboardMarquee;
  if (!marquee || event.pointerId !== marquee.pointerId) return;
  const started = marquee.started;
  if (started) {
    try {
      elements.calendarScroll.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }
  }
  const skippedSpan = marquee.skippedSpan;
  removeClipboardMarquee();
  if (!started) return;
  state.suppressClickUntil = Date.now() + 450;
  elements.calendarScroll.focus({ preventScroll: true });
  if (marquee.mode === "selection") updateSelectionControls();
  else updateClipboardControls();
  if (skippedSpan) showToast("已略過跨日項目；跨日項目暫不可複製。", "error");
}

function handleScheduleCopy(event) {
  if (
    !state.massEditMode
    || state.mutationInFlight
    || clipboardShouldRemainNative(event.target)
    || !clipboardSelectedEntries().length
  ) return;
  try {
    const payload = createCurrentScheduleClipboardPayload();
    const serialized = storeScheduleClipboardPayload(payload);
    updateClipboardControls();
    if (event.clipboardData) {
      event.clipboardData.setData("text/plain", serialized);
      try {
        event.clipboardData.setData(SCHEDULE_CLIPBOARD_MIME, JSON.stringify(payload));
      } catch {
        // Safari may reject custom MIME types; text/plain remains portable.
      }
      event.preventDefault();
    }
    showToast(`已複製 ${payload.items.length} 項安排；可切換學生後貼上。`);
  } catch (error) {
    showToast(clipboardErrorMessage(error), "error");
  }
}

function handleSchedulePaste(event) {
  if (!state.massEditMode || state.mutationInFlight || clipboardShouldRemainNative(event.target)) return;
  let payload = readStoredScheduleClipboardPayload();
  if (!payload) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    const custom = clipboardData.getData(SCHEDULE_CLIPBOARD_MIME);
    const plain = clipboardData.getData("text/plain");
    for (const candidate of [custom, plain]) {
      if (!candidate) continue;
      try {
        payload = parseScheduleClipboard(candidate);
        break;
      } catch {
        // Unrelated clipboard text must retain its normal browser behaviour.
      }
    }
  }
  if (!payload) return;
  event.preventDefault();
  openPasteAnchorDialog(payload);
}

elements.loginForm.addEventListener("submit", login);
elements.logout.addEventListener("click", logout);
elements.changePassword?.addEventListener("click", openPasswordDialog);
elements.passwordForm?.addEventListener("submit", changeCurrentUserPassword);
elements.closePassword?.addEventListener("click", () => elements.passwordDialog.close());
elements.createStudentForm?.addEventListener("submit", createStudentAccount);
elements.createParentForm?.addEventListener("submit", createParentAccount);
elements.adminPasswordForm?.addEventListener("submit", resetManagedAccountPassword);
elements.closeAdminPassword?.addEventListener("click", () => elements.adminPasswordDialog.close());
elements.adminStudentsButton.addEventListener("click", openAdminPanel);
elements.studentSearch.addEventListener("input", renderStudentList);
elements.parentSearch?.addEventListener("input", renderParentList);
elements.parentStudentSearch?.addEventListener("input", renderParentList);
elements.studentSortButtons.forEach((button) => {
  button.addEventListener("click", () => setStudentSortMode(button.dataset.studentSortMode));
});
elements.studentStatusFilter?.addEventListener("change", () => {
  state.studentStatusFilter = elements.studentStatusFilter.value;
  renderStudentList();
});
elements.homeworkLinkForm?.addEventListener("submit", linkHomeworkAccounts);
elements.homeworkLinkStudentA?.addEventListener("change", renderHomeworkLinks);
elements.homeworkLinkStudentB?.addEventListener("change", renderHomeworkLinks);
elements.homeworkLinkList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-unlink-homework-group]");
  if (button) unlinkHomeworkAccounts(button.dataset.unlinkHomeworkGroup);
});
elements.studentList.addEventListener("click", (event) => {
  const order = event.target.closest("[data-move-student-order]");
  if (order) {
    moveStudentOrder(order.dataset.orderStudentId, order.dataset.moveStudentOrder);
    return;
  }
  const profile = event.target.closest("[data-student-profile]");
  if (profile) {
    openStudentProfile(profile.dataset.studentProfile);
    return;
  }
  const button = event.target.closest("[data-student-id]");
  if (button) {
    openStudentSchedule(button.dataset.studentId);
    return;
  }
  const reset = event.target.closest("[data-reset-student-password]");
  if (reset) {
    openAdminPasswordDialog("student", reset.dataset.resetStudentPassword, reset.dataset.accountName);
    return;
  }
  const deactivate = event.target.closest("[data-deactivate-student]");
  if (deactivate) {
    deactivateStudentAccount(deactivate.dataset.deactivateStudent, deactivate.dataset.accountName);
    return;
  }
  const reactivate = event.target.closest("[data-reactivate-student]");
  if (reactivate) {
    reactivateStudentAccount(reactivate.dataset.reactivateStudent, reactivate.dataset.accountName);
    return;
  }
  const permanentlyDelete = event.target.closest("[data-permanent-delete-student]");
  if (permanentlyDelete) openPermanentDeleteDialog(permanentlyDelete.dataset.permanentDeleteStudent);
});
elements.studentList.addEventListener("dragstart", (event) => {
  const card = event.target.closest("[data-student-order-id]");
  if (!card?.draggable || state.studentSortMode !== "custom") {
    event.preventDefault();
    return;
  }
  state.draggingStudentId = card.dataset.studentOrderId;
  card.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", state.draggingStudentId);
});
elements.studentList.addEventListener("dragover", (event) => {
  const target = event.target.closest("[data-student-order-id]");
  if (!state.draggingStudentId || !target || !isStudentActive(state.adminStudents.find((student) => student.id === target.dataset.studentOrderId))) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  elements.studentList.querySelectorAll(".is-drop-target").forEach((card) => card.classList.remove("is-drop-target"));
  target.classList.add("is-drop-target");
});
elements.studentList.addEventListener("drop", (event) => {
  const target = event.target.closest("[data-student-order-id]");
  const sourceId = state.draggingStudentId;
  if (!sourceId || !target) return;
  event.preventDefault();
  const targetId = target.dataset.studentOrderId;
  const ids = activeStudentOrder();
  const sourceIndex = ids.indexOf(sourceId);
  const targetIndex = ids.indexOf(targetId);
  if (sourceIndex >= 0 && targetIndex >= 0 && sourceIndex !== targetIndex) {
    ids.splice(sourceIndex, 1);
    ids.splice(targetIndex, 0, sourceId);
    saveStudentOrder(ids);
  }
});
elements.studentList.addEventListener("dragend", () => {
  state.draggingStudentId = null;
  elements.studentList.querySelectorAll(".is-dragging,.is-drop-target").forEach((card) => {
    card.classList.remove("is-dragging", "is-drop-target");
  });
});
elements.closeStudentProfile?.addEventListener("click", () => elements.studentProfileDialog.close());
elements.studentAccessGrid?.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-student-access-key]");
  const student = selectedStudentProfile();
  if (!checkbox || !student) return;
  saveSelectedStudentAccess({ ...student.access, [checkbox.dataset.studentAccessKey]: checkbox.checked });
});
elements.studentProfileDialog?.addEventListener("click", (event) => {
  const setAll = event.target.closest("[data-set-student-access]");
  if (setAll) {
    const enabled = setAll.dataset.setStudentAccess === "true";
    saveSelectedStudentAccess(Object.fromEntries(allStudentAccessKeys().map((key) => [key, enabled])));
    return;
  }
  const reset = event.target.closest("[data-profile-reset-password]");
  if (reset) {
    const student = selectedStudentProfile();
    if (student) openAdminPasswordDialog("student", student.id, student.name);
    return;
  }
  const deactivate = event.target.closest("[data-profile-deactivate-student]");
  if (deactivate) {
    const student = selectedStudentProfile();
    if (student) deactivateStudentAccount(student.id, student.name);
    return;
  }
  const reactivate = event.target.closest("[data-profile-reactivate-student]");
  if (reactivate) {
    const student = selectedStudentProfile();
    if (student) reactivateStudentAccount(student.id, student.name);
    return;
  }
  const permanentlyDelete = event.target.closest("[data-profile-permanent-delete-student]");
  if (permanentlyDelete) openPermanentDeleteDialog(permanentlyDelete.dataset.profilePermanentDeleteStudent);
});
elements.studentAuditPrevious?.addEventListener("click", () => loadStudentAudit(state.studentAuditPage - 1));
elements.studentAuditNext?.addEventListener("click", () => loadStudentAudit(state.studentAuditPage + 1));
elements.permanentDeleteForm?.addEventListener("submit", permanentlyDeleteStudent);
elements.closePermanentDelete?.addEventListener("click", () => {
  state.permanentDeleteSnapshot = null;
  elements.permanentDeleteDialog.close();
});
elements.parentList?.addEventListener("click", (event) => {
  const save = event.target.closest("[data-save-parent-assignments]");
  if (save) {
    saveParentAssignments(save.dataset.saveParentAssignments);
    return;
  }
  const reset = event.target.closest("[data-reset-parent-password]");
  if (reset) {
    openAdminPasswordDialog("parent", reset.dataset.resetParentPassword, reset.dataset.accountName);
    return;
  }
  const remove = event.target.closest("[data-delete-parent]");
  if (remove) deleteParentAccount(remove.dataset.deleteParent, remove.dataset.accountName);
});
elements.parentList?.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-parent-student]");
  const card = checkbox?.closest("[data-parent-id]");
  if (!checkbox || !card) return;
  const parent = state.adminParents.find((item) => item.id === card.dataset.parentId);
  const assigned = state.parentAssignmentDrafts.get(card.dataset.parentId)
    || new Set(Array.isArray(parent?.assigned_student_ids) ? parent.assigned_student_ids : []);
  if (checkbox.checked) assigned.add(checkbox.value);
  else assigned.delete(checkbox.value);
  state.parentAssignmentDrafts.set(card.dataset.parentId, assigned);
});

elements.passwordToggle.addEventListener("click", () => {
  const showing = elements.password.type === "text";
  elements.password.type = showing ? "password" : "text";
  elements.passwordToggle.textContent = showing ? "顯示" : "隱藏";
  elements.passwordToggle.setAttribute("aria-pressed", String(!showing));
});

elements.weekGrid?.addEventListener("pointerdown", beginClipboardMarquee, { capture: true });
window.addEventListener("pointermove", updateClipboardMarquee, { passive: false });
window.addEventListener("pointerup", finishClipboardMarquee);
window.addEventListener("pointercancel", finishClipboardMarquee);

elements.weekGrid.addEventListener("click", (event) => {
  const ratingCollapse = event.target.closest("[data-rating-collapse]");
  if (ratingCollapse) {
    toggleSelfRatingCollapse(
      ratingCollapse.dataset.ratingCollapse,
      ratingCollapse.dataset.ratingCollapseDate
    );
    return;
  }
  const motivationButton = event.target.closest("[data-motivation-date][data-motivation-rating]");
  if (motivationButton) {
    if (!state.mutationInFlight) {
      stageDailyMotivationRating(
        motivationButton.dataset.motivationDate,
        motivationButton.dataset.motivationRating
      );
    }
    return;
  }
  const wellbeingButton = event.target.closest(
    "[data-wellbeing-metric][data-wellbeing-date][data-wellbeing-rating]"
  );
  if (wellbeingButton) {
    if (!state.mutationInFlight) {
      stageDailyWellbeingRating(
        wellbeingButton.dataset.wellbeingMetric,
        wellbeingButton.dataset.wellbeingDate,
        wellbeingButton.dataset.wellbeingRating
      );
    }
    return;
  }
  const homeworkLink = event.target.closest("a[data-homework-link-url]");
  if (homeworkLink) {
    const href = normalizeHomeworkHref(homeworkLink.getAttribute("href"));
    const linkModeBlocked = state.mutationInFlight
      || state.selectionMode
      || state.clipboardSelectionMode
      || state.moveEntryId
      || state.touchActionEntryId;
    if (!href || linkModeBlocked) {
      event.preventDefault();
      if (linkModeBlocked) showToast("請先退出選取或移動模式，再開啟功課連結。", "error");
    }
    return;
  }
  if (state.mutationInFlight) return;
  // A long-press release synthesizes a click on the source slot. Consume that
  // click before action-mode handling so the blue mode remains active for the
  // user's following adjacent-day tap.
  if (Date.now() < state.suppressClickUntil) return;
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  const slot = event.target.closest("[data-slot-date]");
  if (state.touchActionEntryId) {
    const actionEntry = findEntryById(state.touchActionEntryId);
    if (spanDropZone) {
      extendEntryToDay(actionEntry, spanDropZone.dataset.spanDropDate, { adjacentOnly: true });
      return;
    }
    if (slot) {
      const targetEntry = findEntry(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
      if (targetEntry && spanMemberIds(actionEntry).has(targetEntry.id)) {
        leaveTouchActionMode();
        renderWeek();
        showToast("已退出操作模式。");
      } else {
        moveEntryTo(actionEntry, slot.dataset.slotDate, Number(slot.dataset.slotIndex));
      }
      return;
    }
  }
  if (spanDropZone) {
    showToast("請先拖曳一項安排到此處；手機或平板可長按安排 2 秒。", "success");
    return;
  }
  if (slot) {
    const entry = findEntry(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    if (state.clipboardSelectionMode) {
      const selectionClick = event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.pointerType === "touch"
        || event.pointerType === "pen";
      if (!selectionClick) {
        openEntryDialog(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
      } else if (entry) {
        toggleClipboardEntrySelection(entry);
      } else {
        showToast("只可選取已有安排的格。", "error");
      }
      return;
    }
    if (state.moveEntryId) {
      if (entry?.id === state.moveEntryId) showToast("請選擇另一個安排格。", "error");
      else moveEntryTo(findEntryById(state.moveEntryId), slot.dataset.slotDate, Number(slot.dataset.slotIndex));
      return;
    }
    if (state.selectionMode) {
      if (entry) toggleEntrySelection(entry);
      else showToast("只可選取已有安排的格。", "error");
      return;
    }
    openEntryDialog(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    return;
  }
  const addButton = event.target.closest("[data-add-slots-date]");
  if (addButton) {
    changeCapacity(addButton.dataset.addSlotsDate, 5, addButton);
    return;
  }
  const removeButton = event.target.closest("[data-remove-slots-date]");
  if (removeButton) changeCapacity(removeButton.dataset.removeSlotsDate, -5, removeButton);
});

elements.weekGrid.addEventListener("dragstart", (event) => {
  const slot = event.target.closest("[data-entry-id]");
  if (!slot) return;
  const entry = findEntryById(slot.dataset.entryId);
  if (canDragMassEditGroup(entry) && !state.mutationInFlight) {
    state.draggingEntryId = null;
    state.draggingMassEditGroup = {
      anchorEntryId: entry.id,
      selectedEntryIds: new Set(state.clipboardSelectedEntryIds),
      plan: null,
      error: null,
      targetDate: null,
      copy: false
    };
    state.clipboardSelectedEntryIds.forEach((entryId) => {
      elements.weekGrid.querySelector(`[data-entry-id="${CSS.escape(entryId)}"]`)?.classList.add("is-group-dragging");
    });
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData("text/plain", `schedule-group:${entry.id}`);
    return;
  }
  if (!canMoveEntry(entry) || state.mutationInFlight) {
    event.preventDefault();
    return;
  }
  leaveTouchActionMode();
  state.draggingEntryId = entry.id;
  slot.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "copyMove";
  event.dataTransfer.setData("text/plain", entry.id);
});

elements.weekGrid.addEventListener("dragover", (event) => {
  if (state.draggingMassEditGroup && state.massEditMode && !state.mutationInFlight) {
    const column = event.target.closest("[data-column-date]");
    if (!column) return;
    event.preventDefault();
    clearMassEditGroupDropClasses();
    state.draggingMassEditGroup.selectedEntryIds.forEach((entryId) => {
      elements.weekGrid.querySelector(`[data-entry-id="${CSS.escape(entryId)}"]`)?.classList.add("is-group-dragging");
    });
    const copy = Boolean(event.altKey);
    try {
      const plan = planCurrentMassEditGroupShift(
        state.draggingMassEditGroup.anchorEntryId,
        column.dataset.columnDate,
        copy
      );
      state.draggingMassEditGroup.plan = plan;
      state.draggingMassEditGroup.error = null;
      state.draggingMassEditGroup.targetDate = column.dataset.columnDate;
      state.draggingMassEditGroup.copy = copy;
      event.dataTransfer.dropEffect = copy ? "copy" : "move";
      column.classList.add("is-group-drop-target");
    } catch (error) {
      state.draggingMassEditGroup.plan = null;
      state.draggingMassEditGroup.error = error;
      state.draggingMassEditGroup.targetDate = column.dataset.columnDate;
      state.draggingMassEditGroup.copy = copy;
      event.dataTransfer.dropEffect = "none";
      column.classList.add("is-group-drop-blocked");
    }
    return;
  }
  if (!state.draggingEntryId || state.mutationInFlight) return;
  const column = event.target.closest("[data-column-date]");
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  const slot = event.target.closest("[data-slot-date]");
  if (!slot && !spanDropZone && !column) return;
  const entry = findEntryById(state.draggingEntryId);
  const shiftExtension = event.shiftKey;
  elements.weekGrid.querySelectorAll(".day-column.is-span-target").forEach((candidate) => {
    if (!shiftExtension || candidate !== column) candidate.classList.remove("is-span-target");
  });
  if (shiftExtension && column) {
    const targetDate = column.dataset.columnDate;
    if (isAdjacentSpanTarget(state.weekPayload.entries, entry, targetDate)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      column.classList.add("is-span-target");
    }
  } else if (spanDropZone) {
    const bounds = spanBounds(state.weekPayload.entries, entry);
    const targetDate = spanDropZone.dataset.spanDropDate;
    if (targetDate < bounds.start || targetDate > bounds.end) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      spanDropZone.classList.add("is-span-target");
    }
  } else if (slot) {
    const occupied = findEntry(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    if (occupied && (!canMoveEntry(occupied) || occupied.spanGroupId)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    slot.classList.toggle("is-swap-target", Boolean(occupied && occupied.id !== entry?.id));
    slot.classList.toggle("is-drop-target", !occupied);
  }
});

elements.weekGrid.addEventListener("dragleave", (event) => {
  if (state.draggingMassEditGroup) {
    const column = event.target.closest("[data-column-date]");
    if (column && !column.contains(event.relatedTarget)) {
      column.classList.remove("is-group-drop-target", "is-group-drop-blocked");
    }
  }
  const slot = event.target.closest("[data-slot-date]");
  if (slot && !slot.contains(event.relatedTarget)) slot.classList.remove("is-drop-target", "is-swap-target");
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  if (spanDropZone && !spanDropZone.contains(event.relatedTarget)) spanDropZone.classList.remove("is-span-target");
  const column = event.target.closest("[data-column-date]");
  if (column && !column.contains(event.relatedTarget)) column.classList.remove("is-span-target");
});

elements.weekGrid.addEventListener("drop", (event) => {
  const column = event.target.closest("[data-column-date]");
  if (state.draggingMassEditGroup && state.massEditMode) {
    if (!column) return;
    event.preventDefault();
    const drag = state.draggingMassEditGroup;
    clearMassEditGroupDropClasses();
    state.draggingMassEditGroup = null;
    if (drag.plan && drag.targetDate === column.dataset.columnDate && drag.copy === Boolean(event.altKey)) {
      stageMassEditGroupShift(drag.plan);
    } else {
      try {
        stageMassEditGroupShift(planCurrentMassEditGroupShift(
          drag.anchorEntryId,
          column.dataset.columnDate,
          Boolean(event.altKey)
        ));
      } catch (error) {
        showToast(error instanceof ScheduleGroupShiftError ? error.message : "未能整組拖動所選安排。", "error");
      }
    }
    return;
  }
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  const slot = event.target.closest("[data-slot-date]");
  if ((!slot && !spanDropZone && !column) || !state.draggingEntryId) return;
  event.preventDefault();
  elements.weekGrid.querySelectorAll(".is-drop-target, .is-swap-target, .is-span-target").forEach((item) => item.classList.remove("is-drop-target", "is-swap-target", "is-span-target"));
  const entry = findEntryById(state.draggingEntryId);
  const shiftExtension = event.shiftKey;
  if (shiftExtension && column) {
    extendEntryToDay(entry, column.dataset.columnDate, { adjacentOnly: true });
  } else if (spanDropZone) extendEntryToDay(entry, spanDropZone.dataset.spanDropDate);
  else if (slot) moveEntryTo(entry, slot.dataset.slotDate, Number(slot.dataset.slotIndex));
});

elements.weekGrid.addEventListener("dragend", () => {
  state.draggingEntryId = null;
  state.draggingMassEditGroup = null;
  clearMassEditGroupDropClasses();
  elements.weekGrid.querySelectorAll(".is-dragging, .is-drop-target, .is-swap-target, .is-span-target").forEach((item) => {
    item.classList.remove("is-dragging", "is-drop-target", "is-swap-target", "is-span-target");
  });
});

elements.weekGrid.addEventListener("pointerdown", (event) => {
  if (!['touch', 'pen'].includes(event.pointerType) || state.mutationInFlight) return;
  if (state.touchActionEntryId) return;
  const slot = event.target.closest("[data-entry-id]");
  if (!slot) return;
  const entry = findEntryById(slot.dataset.entryId);
  if (!canMoveEntry(entry)) return;
  clearLongPress();
  state.longPressPointerId = event.pointerId;
  state.longPressOrigin = { x: event.clientX, y: event.clientY };
  state.longPressTimer = window.setTimeout(() => {
    state.longPressTimer = null;
    state.touchActionEntryId = entry.id;
    state.suppressClickUntil = Date.now() + 500;
    try {
      slot.setPointerCapture(event.pointerId);
    } catch {
      // Some older touch browsers do not expose pointer capture on buttons.
    }
    const memberIds = spanMemberIds(entry);
    elements.weekGrid.querySelectorAll("[data-entry-id]").forEach((candidate) => {
      if (memberIds.has(candidate.dataset.entryId)) candidate.classList.add("is-touch-action");
    });
    if (navigator.vibrate) navigator.vibrate(35);
    showToast("操作模式已開啟：拖到安排格可移動／交換；放到相鄰日期的延伸區可建立多日項目。", "success");
  }, LONG_PRESS_MS);
});

elements.weekGrid.addEventListener("pointermove", (event) => {
  if (event.pointerId !== state.longPressPointerId) return;
  if (state.longPressTimer && state.longPressOrigin) {
    const distance = Math.hypot(event.clientX - state.longPressOrigin.x, event.clientY - state.longPressOrigin.y);
    if (distance > 14) clearLongPress();
    return;
  }
  if (!state.touchActionEntryId) return;
  event.preventDefault();
  const target = document.elementFromPoint(event.clientX, event.clientY);
  elements.weekGrid.querySelectorAll(".is-drop-target, .is-swap-target, .is-span-target")
    .forEach((element) => element.classList.remove("is-drop-target", "is-swap-target", "is-span-target"));
  const spanDropZone = target?.closest?.("[data-span-drop-date]");
  const slot = target?.closest?.("[data-slot-date]");
  const actionEntry = findEntryById(state.touchActionEntryId);
  if (spanDropZone && isAdjacentSpanTarget(state.weekPayload.entries, actionEntry, spanDropZone.dataset.spanDropDate)) {
    spanDropZone.classList.add("is-span-target");
  } else if (slot) {
    const occupied = findEntry(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    slot.classList.add(occupied ? "is-swap-target" : "is-drop-target");
  }
}, { passive: false });

elements.weekGrid.addEventListener("pointerup", (event) => {
  if (event.pointerId !== state.longPressPointerId) return;
  const wasPending = Boolean(state.longPressTimer);
  try {
    event.target.releasePointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture can already be released by the browser.
  }
  clearLongPress();
  if (wasPending || !state.touchActionEntryId) return;
  state.suppressClickUntil = Date.now() + 500;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const spanDropZone = target?.closest?.("[data-span-drop-date]");
  const slot = target?.closest?.("[data-slot-date]");
  const entry = findEntryById(state.touchActionEntryId);
  if (spanDropZone && isAdjacentSpanTarget(state.weekPayload.entries, entry, spanDropZone.dataset.spanDropDate)) {
    extendEntryToDay(entry, spanDropZone.dataset.spanDropDate, { adjacentOnly: true });
  } else if (slot) {
    const targetEntry = findEntry(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    if (!targetEntry || !spanMemberIds(entry).has(targetEntry.id)) {
      moveEntryTo(entry, slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    }
  }
});

elements.weekGrid.addEventListener("pointercancel", clearLongPress);
elements.weekGrid.addEventListener("contextmenu", (event) => {
  if (state.touchActionEntryId || state.longPressTimer) event.preventDefault();
});

elements.entryForm.addEventListener("submit", saveEntry);
elements.entryMessage.addEventListener("keydown", (event) => {
  if (!elements.entryMessage.readOnly && event.key === "Tab" && state.homeworkCompletion && !event.isComposing) {
    const accepted = acceptHomeworkAutocomplete(
      elements.entryMessage.value,
      elements.entryMessage.selectionStart,
      elements.entryMessage.selectionEnd,
      state.homeworkCompletion
    );
    if (accepted) {
      event.preventDefault();
      elements.entryMessage.value = accepted.value;
      elements.entryMessage.setSelectionRange(accepted.cursor, accepted.cursor);
      state.homeworkCompletion = null;
      elements.homeworkAutocomplete.hidden = true;
      openHomeworkPicker(accepted.type, { replacement: accepted });
      return;
    }
  }
  if (!elements.entryMessage.readOnly && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.entryForm.requestSubmit();
  }
});
elements.entryMessage.addEventListener("input", updateHomeworkAutocomplete);
elements.entryMessage.addEventListener("click", updateHomeworkAutocomplete);
elements.homeworkPickerSearch?.addEventListener("input", renderHomeworkPickerResults);
elements.homeworkPickerClose?.addEventListener("click", () => {
  closeHomeworkPicker();
  elements.entryMessage.focus();
});
elements.homeworkPickerResults?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-homework-resource-id]");
  if (button) addHomeworkResource(button.dataset.homeworkResourceId);
});
elements.homeworkAttachments?.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-homework-resource]");
  if (remove) removeHomeworkResource(remove.dataset.removeHomeworkResource);
});
elements.closeEntry.addEventListener("click", () => elements.entryDialog.close());
elements.deleteEntry.addEventListener("click", () => elements.deleteDialog.showModal());
elements.toggleComplete.addEventListener("click", toggleEntryCompletion);
elements.toggleProgress.addEventListener("click", toggleEntryProgress);
elements.toggleMoreThanHalfCompleted.addEventListener("click", toggleEntryMoreThanHalfCompleted);
elements.togglePreviousIncomplete.addEventListener("click", toggleEntryPreviousIncomplete);
elements.cancelDelete.addEventListener("click", () => elements.deleteDialog.close());
elements.confirmDelete.addEventListener("click", deleteEntry);
elements.previousWeek.addEventListener("click", () => changeWeek(-7));
elements.nextWeek.addEventListener("click", () => changeWeek(7));
elements.currentWeek.addEventListener("click", async () => {
  if (state.mutationInFlight) return;
  const current = defaultWeekStart();
  if (state.weekStart === current) return;
  if (!prepareMassEditWeekNavigation()) return;
  await flushPendingMotivationSaves();
  state.showUnusedTemporarily = false;
  state.weekStart = current;
  await loadWeek();
});
elements.copyWeekLink?.addEventListener("click", copyDisplayedWeekLink);
elements.exportPdf.addEventListener("click", exportPdf);
elements.toggleTable.addEventListener("click", toggleTableVisibility);
elements.toggleUnused.addEventListener("click", toggleUnusedSlots);
elements.toggleMascots.addEventListener("click", toggleMascots);
elements.toggleMotivation.addEventListener("click", toggleMotivationVisibility);
elements.toggleDailyQuote.addEventListener("click", toggleDailyQuoteVisibility);
elements.quotePrevious?.addEventListener("click", () => changeDailyQuoteDay(-1));
elements.quoteNext?.addEventListener("click", () => changeDailyQuoteDay(1));
elements.quoteToday?.addEventListener("click", showTodayDailyQuote);
elements.toggleEncouragement.addEventListener("click", toggleEncouragementVisibility);
elements.toggleReminderEmail.addEventListener("click", toggleReminderEmailVisibility);
elements.saveEncouragement.addEventListener("click", saveWeeklyEncouragement);
elements.useLastEncouragement.addEventListener("click", usePreviousWeekEncouragement);
elements.reminderEmailInput.addEventListener("input", () => {
  const value = String(elements.reminderEmailInput.value || "").trim();
  if (!value) {
    setStatus(elements.reminderEmailStatus, "尚未輸入提醒電郵。");
    return;
  }
  validateReminderEmailInput();
});
elements.reminderEmailInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    saveReminderEmail();
  }
});
elements.updateReminderEmail.addEventListener("click", saveReminderEmail);
elements.removeReminderEmail.addEventListener("click", deleteReminderEmail);
elements.learningPurposeSave?.addEventListener("click", saveLearningPurpose);
elements.learningPurposeDelete?.addEventListener("click", deleteLearningPurpose);
elements.learningPurposeOlder?.addEventListener("click", () => {
  const purpose = normalizeLearningPurposePayload(state.learningPurpose);
  if (purpose.olderId) loadLearningPurposeVersion(purpose.olderId);
});
elements.learningPurposeNewer?.addEventListener("click", () => {
  const purpose = normalizeLearningPurposePayload(state.learningPurpose);
  if (purpose.newerId) loadLearningPurposeVersion(purpose.newerId);
});
elements.learningPurposeLatest?.addEventListener("click", () => loadLearningPurposeVersion(null));
elements.closeCelebration?.addEventListener("click", () => elements.celebrationDialog?.close());
elements.purposeFontButtons.forEach((button) => button.addEventListener("click", () => setPurposeFontSize(button.dataset.purposeFontSize)));
elements.languageOpportunitiesSave?.addEventListener("click", saveLanguageOpportunities);
elements.toggleSelection?.addEventListener("click", () => {
  if (state.massEditMode) toggleClipboardSelectionMode();
  else toggleSelectionMode();
});
elements.toggleMassEdit?.addEventListener("click", toggleMassEdit);
elements.massEditSave?.addEventListener("click", saveMassEdit);
elements.massEditCancel?.addEventListener("click", () => discardMassEdit({ requireConfirmation: true }));
elements.toggleClipboardSelection?.addEventListener("click", toggleClipboardSelectionMode);
elements.copyClipboardSelection?.addEventListener("click", copyClipboardSelectionFromButton);
elements.pasteClipboardSelection?.addEventListener("click", pasteScheduleClipboardFromButton);
elements.clearClipboardSelection?.addEventListener("click", () => clearClipboardSelection({ deactivate: false }));
elements.batchComplete?.addEventListener("click", batchSetCompletion);
elements.batchProgress?.addEventListener("click", () => batchSetExclusiveStatus("in_progress"));
elements.batchMoreThanHalfCompleted?.addEventListener("click", () => batchSetExclusiveStatus("more_than_half_completed"));
elements.batchPreviousIncomplete?.addEventListener("click", () => batchSetExclusiveStatus("previous_incomplete"));
elements.moveSelected?.addEventListener("click", beginMoveSelected);
elements.batchDelete?.addEventListener("click", batchDeleteEntries);
elements.cancelSelection?.addEventListener("click", cancelSelectionMode);
elements.addCountdowns?.addEventListener("click", () => changeCountdownCapacity(COUNTDOWN_STEP));
elements.removeCountdowns?.addEventListener("click", () => changeCountdownCapacity(-COUNTDOWN_STEP));
elements.countdownGrid?.addEventListener("click", (event) => {
  if (state.massEditMode) return;
  const card = event.target.closest("[data-countdown-position]");
  if (!card) return;
  if (event.target.closest("[data-save-countdown]")) saveCountdown(card);
  else if (event.target.closest("[data-delete-countdown]")) deleteCountdown(card);
});
elements.entryTags?.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-homework-tag]");
  if (!input || !state.editing) return;
  state.editing.tags = state.editing.tags.filter((tagKey) => tagKey !== input.value);
  if (input.checked) state.editing.tags.push(input.value);
});
elements.announcementForm?.addEventListener("submit", saveAnnouncement);
elements.announcementImageAction?.addEventListener("change", syncAnnouncementImageControls);
elements.announcementCancelEdit?.addEventListener("click", () => {
  resetAnnouncementForm();
  setStatus(elements.announcementStatus, "已取消修改公告。");
});
elements.announcementList?.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-announcement-edit]");
  if (edit) {
    beginAnnouncementEdit(edit.dataset.announcementEdit);
    return;
  }
  const toggle = event.target.closest("[data-announcement-toggle]");
  if (toggle) {
    toggleAnnouncement(
      toggle.dataset.announcementToggle,
      toggle.dataset.announcementVersion,
      toggle.dataset.announcementNextActive === "true"
    );
    return;
  }
  const remove = event.target.closest("[data-announcement-delete]");
  if (remove) deleteAnnouncement(remove.dataset.announcementDelete, remove.dataset.announcementVersion);
});

document.addEventListener("keydown", (event) => {
  const commandKey = event.metaKey || event.ctrlKey;
  const shortcut = String(event.key || "").toLocaleLowerCase();
  if (
    commandKey
    && state.massEditMode
    && !state.mutationInFlight
    && !clipboardShouldRemainNative(event.target)
  ) {
    if (shortcut === "c" && clipboardSelectedEntries().length) {
      event.preventDefault();
      copyClipboardSelectionFromButton();
      return;
    }
    if (shortcut === "v" && readStoredScheduleClipboardPayload()) {
      event.preventDefault();
      pasteScheduleClipboardFromButton();
      return;
    }
  }
  if (
    event.key === "Escape"
    && state.massEditMode
    && state.clipboardSelectionMode
    && !elements.entryDialog.open
    && !elements.deleteDialog.open
  ) {
    clearClipboardSelection({ deactivate: true });
    showToast("已退出複製選取。");
    return;
  }
  if (event.key === "Escape" && state.selectionMode && !elements.entryDialog.open && !elements.deleteDialog.open) {
    cancelSelectionMode();
  }
});

document.addEventListener("copy", handleScheduleCopy);
document.addEventListener("paste", handleSchedulePaste);

window.addEventListener("beforeunload", (event) => {
  if (!state.massEditMode || !state.massEditChanges.size) return;
  event.preventDefault();
  event.returnValue = "";
});

elements.entryDialog.addEventListener("close", () => {
  if (!elements.deleteDialog.open) state.editing = null;
  state.homeworkCompletion = null;
  elements.homeworkAutocomplete.hidden = true;
  closeHomeworkPicker();
  elements.homeworkAttachments.replaceChildren();
  elements.homeworkAttachments.hidden = true;
});
elements.entryDialog.addEventListener("click", (event) => {
  if (event.target === elements.entryDialog && !elements.deleteDialog.open) {
    elements.entryDialog.close();
  }
});

async function initialize() {
  renderEntryTagOptions();
  applyPurposeFontSize();
  showView("login");
  setConnection("正在連接", "connecting");
  try {
    await ensureSupabaseAuth();
    setConnection("雲端已連線", "online");
    const restored = await restoreSession();
    if (!restored) showView("login");
  } catch (error) {
    console.warn("Schedule initialization failed", error);
    setConnection("連線失敗", "error");
    setStatus(elements.loginStatus, "未能連接登入服務，請檢查網絡後重新整理。", "error");
  }
}

window.setInterval(refreshCountdownCards, 60_000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshCountdownCards();
});

initialize();
