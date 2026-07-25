import {
  SCHEDULE_MAX_DATE,
  SCHEDULE_MIN_DATE,
  WEEKDAY_LABELS,
  addDays,
  defaultWeekStart,
  firstWeekStart,
  formatDayDate,
  formatWeekRange,
  isDateInScheduleRange,
  lastWeekStart,
  parseISODate,
  toISODate,
  weekDates
} from "./schedule-calendar.mjs";
import {
  countdownBreakdown,
  formatEstimatedMinutes,
  isAdjacentSpanTarget,
  planCountdownCapacityChange,
  spanBounds,
  spanLaneLayout,
  studyHoursBefore
} from "./schedule-enhancements.mjs";

const ADMIN_NAME = "Sam Admind Schedule";
const SESSION_KEY = "edmund-schedule-session-v1";
const TABLE_HIDDEN_KEY = "edmund-schedule-table-hidden-v1";
const MAX_SLOTS_PER_DAY = 100;
const MAX_COUNTDOWNS = 100;
const LONG_PRESS_MS = 2000;
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
  logout: document.querySelector("[data-logout]"),
  adminStudentsButton: document.querySelector("[data-admin-students]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginButton: document.querySelector("[data-login-button]"),
  loginStatus: document.querySelector("[data-login-status]"),
  passwordToggle: document.querySelector("[data-password-toggle]"),
  username: document.querySelector("#schedule-username"),
  password: document.querySelector("#schedule-password"),
  studentSearch: document.querySelector("[data-student-search]"),
  studentList: document.querySelector("[data-student-list]"),
  adminStatus: document.querySelector("[data-admin-status]"),
  viewingLabel: document.querySelector("[data-viewing-label]"),
  viewingStudent: document.querySelector("[data-viewing-student]"),
  weekRange: document.querySelector("[data-week-range]"),
  previousWeek: document.querySelector("[data-previous-week]"),
  nextWeek: document.querySelector("[data-next-week]"),
  currentWeek: document.querySelector("[data-current-week]"),
  exportPdf: document.querySelector("[data-export-pdf]"),
  toggleTable: document.querySelector("[data-toggle-table]"),
  toggleUnused: document.querySelector("[data-toggle-unused]"),
  toggleMascots: document.querySelector("[data-toggle-mascots]"),
  toggleSelection: document.querySelector("[data-toggle-selection]"),
  selectionActions: document.querySelector("[data-selection-actions]"),
  selectionCount: document.querySelector("[data-selection-count]"),
  batchComplete: document.querySelector("[data-batch-complete]"),
  moveSelected: document.querySelector("[data-move-selected]"),
  batchDelete: document.querySelector("[data-batch-delete]"),
  cancelSelection: document.querySelector("[data-cancel-selection]"),
  tableRegion: document.querySelector("[data-table-region]"),
  weekGrid: document.querySelector("[data-week-grid]"),
  calendarStatus: document.querySelector("[data-calendar-status]"),
  metricWeekGoals: document.querySelector("[data-metric-week-goals]"),
  metricTotalGoals: document.querySelector("[data-metric-total-goals]"),
  metricWeekCompleted: document.querySelector("[data-metric-week-completed]"),
  metricTotalCompleted: document.querySelector("[data-metric-total-completed]"),
  countdownGrid: document.querySelector("[data-countdown-grid]"),
  countdownStatus: document.querySelector("[data-countdown-status]"),
  addCountdowns: document.querySelector("[data-add-countdowns]"),
  removeCountdowns: document.querySelector("[data-remove-countdowns]"),
  entryDialog: document.querySelector("[data-entry-dialog]"),
  entryForm: document.querySelector("[data-entry-form]"),
  entryTitle: document.querySelector("[data-entry-title]"),
  entryMeta: document.querySelector("[data-entry-meta]"),
  entryMessage: document.querySelector("#schedule-message"),
  entryEstimatedMinutes: document.querySelector("#schedule-estimated-minutes"),
  entryHint: document.querySelector("[data-entry-hint]"),
  entryStatus: document.querySelector("[data-entry-status]"),
  closeEntry: document.querySelector("[data-close-entry]"),
  deleteEntry: document.querySelector("[data-delete-entry]"),
  toggleComplete: document.querySelector("[data-toggle-complete]"),
  toggleProgress: document.querySelector("[data-toggle-progress]"),
  saveEntry: document.querySelector("[data-save-entry]"),
  deleteDialog: document.querySelector("[data-delete-dialog]"),
  cancelDelete: document.querySelector("[data-cancel-delete]"),
  confirmDelete: document.querySelector("[data-confirm-delete]"),
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
  weekStart: defaultWeekStart(),
  weekPayload: emptyWeekPayload(),
  editing: null,
  weekRequestId: 0,
  toastTimer: null,
  tableHidden: readDisplayPreference(TABLE_HIDDEN_KEY),
  hideUnused: false,
  hideMascots: false,
  showUnusedTemporarily: false,
  selectionMode: false,
  selectedEntryIds: new Set(),
  moveEntryId: null,
  draggingEntryId: null,
  touchActionEntryId: null,
  longPressTimer: null,
  longPressPointerId: null,
  longPressOrigin: null,
  mutationInFlight: false,
  displayPreferenceRequestId: 0,
  suppressClickUntil: 0,
  countdownDraftOwner: "",
  countdownDrafts: new Map()
};

function emptyWeekPayload() {
  return {
    capacities: {},
    capacityVersions: {},
    entries: [],
    metrics: {
      weekGoals: 0,
      totalGoals: 0,
      weekCompleted: 0,
      totalCompleted: 0
    },
    countdownCapacity: 5,
    countdowns: []
  };
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

function showView(name) {
  for (const view of elements.views) view.hidden = view.dataset.view !== name;
  const loggedIn = Boolean(state.currentUser);
  elements.userPill.hidden = !loggedIn;
  elements.logout.hidden = !loggedIn;
  elements.adminStudentsButton.hidden = !(
    state.currentUser?.role === "admin" && name === "calendar"
  );
  if (loggedIn) {
    elements.userPill.textContent = state.currentUser.role === "admin"
      ? `${state.currentUser.name} · 管理員`
      : state.currentUser.name;
  }
  if (name === "calendar") applyDisplayPreferences();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearRenderedSchedule() {
  state.weekRequestId += 1;
  state.displayPreferenceRequestId += 1;
  state.mutationInFlight = false;
  state.weekPayload = emptyWeekPayload();
  state.hideUnused = false;
  state.hideMascots = false;
  state.showUnusedTemporarily = false;
  state.editing = null;
  clearLongPress();
  state.touchActionEntryId = null;
  state.countdownDraftOwner = "";
  state.countdownDrafts.clear();
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
  elements.countdownGrid?.replaceChildren();
  setStatus(elements.countdownStatus, "");
  setMetricsUnavailable();
  applyDisplayPreferences();
  setStatus(elements.entryStatus, "");
  setStatus(elements.calendarStatus, "");
}

function applyDisplayPreferences() {
  const hideUnusedNow = unusedSlotsAreHidden();
  elements.tableRegion.hidden = state.tableHidden;
  elements.toggleTable.textContent = state.tableHidden ? "顯示日程表" : "隱藏日程表";
  elements.toggleTable.setAttribute("aria-expanded", String(!state.tableHidden));
  elements.toggleUnused.textContent = hideUnusedNow ? "顯示所有格" : "隱藏未使用格";
  elements.toggleUnused.setAttribute("aria-pressed", String(hideUnusedNow));
  elements.toggleMascots.textContent = state.hideMascots ? "顯示吉祥物" : "隱藏吉祥物";
  elements.toggleMascots.setAttribute("aria-pressed", String(state.hideMascots));
  elements.weekGrid.classList.toggle("mascots-hidden", state.hideMascots);
  updateSelectionControls();
}

function unusedSlotsAreHidden() {
  return state.hideUnused && !state.showUnusedTemporarily;
}

function normalizeDisplayPreferences(value) {
  return {
    hideUnused: value?.hideUnused === true,
    hideMascots: value?.hideMascots === true
  };
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
  state.hideUnused = preferences.hideUnused;
  state.hideMascots = preferences.hideMascots;
  applyDisplayPreferences();
}

function selectedEntries() {
  return state.weekPayload.entries.filter((entry) => state.selectedEntryIds.has(entry.id));
}

function canMoveEntry(entry) {
  return Boolean(entry) && !(
    state.currentUser?.role === "student" && entry.source === "admin"
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
  clearLongPress();
  state.touchActionEntryId = null;
  updateSelectionControls();
}

function updateSelectionControls() {
  if (!elements.toggleSelection) return;
  const entries = selectedEntries();
  const protectedCount = entries.filter((entry) => !canMoveEntry(entry)).length;
  const moving = Boolean(state.moveEntryId);
  elements.toggleSelection.setAttribute("aria-pressed", String(state.selectionMode));
  elements.toggleSelection.textContent = state.selectionMode ? "退出選取" : "select multiple";
  elements.selectionActions.hidden = !state.selectionMode;
  elements.selectionCount.textContent = moving
    ? "請按一下要移到的空白格"
    : `已選取 ${entries.length} 項`;
  elements.batchComplete.disabled = state.mutationInFlight || moving || entries.length === 0;
  elements.batchComplete.textContent = entries.length && entries.every((entry) => entry.isCompleted)
    ? "取消完成"
    : "標記完成";
  elements.moveSelected.disabled = state.mutationInFlight || moving || entries.length !== 1 || !canMoveEntry(entries[0]);
  elements.moveSelected.textContent = moving ? "請選擇空白格" : "移動所選";
  elements.batchDelete.disabled = state.mutationInFlight || moving || entries.length === 0 || protectedCount > 0;
  elements.batchDelete.title = protectedCount > 0
    ? "老師安排只可由管理員刪除。"
    : "刪除所有已選取安排";
  elements.cancelSelection.disabled = state.mutationInFlight;
  elements.toggleUnused.disabled = state.mutationInFlight || moving;
  elements.toggleMascots.disabled = state.mutationInFlight;
}

function setMutationInFlight(busy) {
  state.mutationInFlight = Boolean(busy);
  elements.toggleUnused.disabled = busy;
  elements.toggleMascots.disabled = busy;
  elements.toggleSelection.disabled = busy;
  updateSelectionControls();
}

function toggleTableVisibility() {
  state.tableHidden = !state.tableHidden;
  saveDisplayPreference(TABLE_HIDDEN_KEY, state.tableHidden);
  applyDisplayPreferences();
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
    state.hideUnused = previous.hideUnused;
    state.hideMascots = previous.hideMascots;
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
    state.hideUnused = previous.hideUnused;
    state.hideMascots = previous.hideMascots;
    applyDisplayPreferences();
    setStatus(elements.calendarStatus, error.message || "未能儲存吉祥物設定。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (isCurrentRequest()) setMutationInFlight(false);
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
}

function setMetricsUnavailable() {
  elements.metricWeekGoals.textContent = "—";
  elements.metricTotalGoals.textContent = "—";
  elements.metricWeekCompleted.textContent = "—";
  elements.metricTotalCompleted.textContent = "—";
}

function todayISO() {
  return toISODate(new Date());
}

function countdownByPosition(position) {
  return state.weekPayload.countdowns.find((countdown) => Number(countdown.position) === Number(position)) || null;
}

function countdownOwnerKey() {
  const student = activeStudent();
  return student?.id ? String(student.id) : "";
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
  elements.countdownGrid.replaceChildren();
  const persistedCapacity = Math.max(5, Math.min(MAX_COUNTDOWNS, Number(state.weekPayload.countdownCapacity) || 5));
  const furthestDraft = Math.max(0, ...state.countdownDrafts.keys());
  const capacity = Math.min(MAX_COUNTDOWNS, Math.max(persistedCapacity, Math.ceil(furthestDraft / 5) * 5));
  elements.addCountdowns.disabled = state.mutationInFlight || persistedCapacity >= MAX_COUNTDOWNS;
  elements.removeCountdowns.disabled = state.mutationInFlight || persistedCapacity <= 5;

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

  const heading = document.createElement("h3");
  heading.textContent = `Clock ${position}`;
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
  card.append(heading, fields, days, detailGrid, calculator, actions, note);

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
  toggle.setAttribute("aria-expanded", String(!breakdown.hidden));
  update();
  return card;
}

function updateCountdownCard(card) {
  const start = card.querySelector("[data-countdown-start]").value;
  const end = card.querySelector("[data-countdown-end]").value;
  const title = card.querySelector("[data-countdown-title]").value.trim() || "此事件";
  const detail = countdownBreakdown(start, end);
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
  const studyHours = studyHoursBefore(start, end, daily.value);
  card.querySelector("[data-countdown-study-result]").textContent = `小時，每天累計可在「${title}」前溫習 ${studyHours.toLocaleString()} 小時`;
  breakdown.querySelectorAll("[data-countdown-part]").forEach((input) => {
    const partResult = breakdown.querySelector(`[data-countdown-part-result="${input.dataset.countdownPart}"]`);
    partResult.textContent = `可在「${title}」前溫習 ${studyHoursBefore(start, end, input.value).toLocaleString()} 小時`;
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
  if (state.mutationInFlight) return;
  const values = countdownCardValues(card);
  const persistedCapacity = Math.max(5, Number(state.weekPayload.countdownCapacity) || 5);
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
  if (state.mutationInFlight || ![-5, 5].includes(delta)) return;
  captureCountdownDrafts();
  const current = Math.max(5, Number(state.weekPayload.countdownCapacity) || 5);
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

async function ensureSupabaseAuth() {
  if (!supabaseClient) throw new Error("登入服務暫時未能載入，請重新整理頁面。");
  const current = await supabaseClient.auth.getSession();
  if (current.error) throw current.error;
  if (current.data?.session?.user?.id) return current.data.session;

  const signIn = await supabaseClient.auth.signInAnonymously();
  if (signIn.error) throw signIn.error;
  if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全連線。");
  return signIn.data.session;
}

async function callRpc(name, args = {}) {
  await ensureSupabaseAuth();
  const { data, error } = await supabaseClient.rpc(name, args);
  if (error) throw error;
  return data;
}

async function restoreSession() {
  const saved = readSession();
  if (!saved?.role) return false;
  try {
    if (saved.role === "admin" && saved.adminToken) {
      const rows = await callRpc("schedule_admin_me", { p_admin_token: saved.adminToken });
      const admin = Array.isArray(rows) ? rows[0] : null;
      if (!admin) return false;
      state.currentUser = {
        role: "admin",
        name: admin.name,
        adminToken: saved.adminToken,
        expiresAt: admin.expires_at
      };
      saveSession();
      await openAdminPanel();
      return true;
    }

    if (saved.role === "student" && saved.studentToken) {
      const rows = await callRpc("schedule_student_profile", { p_token: saved.studentToken });
      const student = Array.isArray(rows) ? rows[0] : null;
      if (!student) return false;
      state.currentUser = {
        role: "student",
        id: student.id,
        name: student.name,
        studentToken: saved.studentToken
      };
      state.selectedStudent = { id: student.id, name: student.name };
      saveSession();
      showView("calendar");
      await loadWeek();
      return true;
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
    state.weekStart = defaultWeekStart();
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
  const user = state.currentUser;
  if (user?.role === "student") window.EdmundSystemNav?.forgetStudentSession();
  state.currentUser = null;
  state.selectedStudent = null;
  state.adminStudents = [];
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
    console.warn("Supabase sign out failed", error);
  }
  setStatus(elements.loginStatus, "");
  showView("login");
  setConnection("可以登入", "online");
}

async function openAdminPanel() {
  if (state.currentUser?.role !== "admin") return;
  clearRenderedSchedule();
  state.selectedStudent = null;
  showView("admin");
  setStatus(elements.adminStatus, "正在載入學生帳戶…");
  try {
    const rows = await callRpc("schedule_admin_list_students", {
      p_admin_token: state.currentUser.adminToken
    });
    state.adminStudents = Array.isArray(rows) ? rows : [];
    renderStudentList();
    setStatus(elements.adminStatus, `已載入 ${state.adminStudents.length} 個學生帳戶。`);
  } catch (error) {
    console.warn("Admin student list failed", error);
    setStatus(elements.adminStatus, "未能載入學生帳戶，請重新登入。", "error");
    if (isExpiredSessionError(error)) await logout();
  }
}

function renderStudentList() {
  const query = elements.studentSearch.value.trim().toLocaleLowerCase();
  const students = state.adminStudents.filter((student) => (
    !query || String(student.name || "").toLocaleLowerCase().includes(query)
  ));
  elements.studentList.replaceChildren();

  if (!students.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = query ? "找不到符合的學生。" : "尚未有學生帳戶。";
    elements.studentList.append(empty);
    return;
  }

  for (const student of students) {
    const card = document.createElement("article");
    card.className = "student-card";
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = student.name;
    const note = document.createElement("span");
    note.textContent = "共用學生帳戶";
    copy.append(name, note);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "student-open-button";
    button.dataset.studentId = student.id;
    button.textContent = "查看日程";
    button.setAttribute("aria-label", `查看 ${student.name} 的日程`);
    card.append(copy, button);
    elements.studentList.append(card);
  }
}

async function openStudentSchedule(studentId) {
  const student = state.adminStudents.find((item) => item.id === studentId);
  if (!student || state.currentUser?.role !== "admin") return;
  clearRenderedSchedule();
  state.selectedStudent = { id: student.id, name: student.name };
  state.weekStart = defaultWeekStart();
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
  const student = activeStudent();
  if (!student) return;
  captureCountdownDrafts();
  resetSelectionMode();
  const requestedWeek = state.weekStart;
  const requestId = state.weekRequestId + 1;
  state.weekRequestId = requestId;
  state.weekPayload = emptyWeekPayload();
  elements.weekGrid.replaceChildren();
  setMetricsUnavailable();
  elements.exportPdf.disabled = true;
  setStatus(elements.calendarStatus, "正在載入本星期安排…");
  elements.weekGrid.setAttribute("aria-busy", "true");
  updateCalendarHeading();

  try {
    const payload = state.currentUser.role === "admin"
      ? await callRpc("schedule_admin_get_week", {
          p_admin_token: state.currentUser.adminToken,
          p_student_id: student.id,
          p_week_start: requestedWeek
        })
      : await callRpc("schedule_student_get_week", {
          p_token: state.currentUser.studentToken,
          p_week_start: requestedWeek
        });

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
            isInProgress: entry.isInProgress === true,
            spanGroupId: entry.spanGroupId || null
          }))
        : [],
      metrics: payload.metrics && typeof payload.metrics === "object"
        ? {
            weekGoals: Number(payload.metrics.weekGoals) || 0,
            totalGoals: Number(payload.metrics.totalGoals) || 0,
            weekCompleted: Number(payload.metrics.weekCompleted) || 0,
            totalCompleted: Number(payload.metrics.totalCompleted) || 0
          }
        : emptyWeekPayload().metrics,
      countdownCapacity: Math.max(5, Math.min(MAX_COUNTDOWNS, Number(payload.countdownCapacity) || 5)),
      countdowns: Array.isArray(payload.countdowns) ? payload.countdowns : []
    };
    renderWeek();
    renderMetrics();
    renderCountdowns();
    restoreCalendarFocus(focusTarget);
    elements.exportPdf.disabled = false;
    setStatus(elements.calendarStatus, `已儲存於雲端 · ${state.weekPayload.entries.length} 項安排`);
  } catch (error) {
    if (requestId !== state.weekRequestId) return;
    console.warn("Schedule week load failed", error);
    setStatus(elements.calendarStatus, error.message || "未能載入本星期安排。", "error");
    if (isExpiredSessionError(error)) await logout();
  } finally {
    if (requestId === state.weekRequestId) {
      elements.weekGrid.removeAttribute("aria-busy");
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

function renderWeek() {
  updateCalendarHeading();
  const entries = entryMap();
  const dates = weekDates(state.weekStart);
  const today = toISODate(new Date());
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

    const slots = document.createElement("div");
    slots.className = "day-slots";
    if (active) {
      const ordinarySlots = document.createElement("div");
      ordinarySlots.className = "ordinary-slot-list";
      let visibleSlots = 0;
      for (let slotIndex = 1; slotIndex <= capacity; slotIndex += 1) {
        const entry = entries.get(`${date}:${slotIndex}`);
        if (entry?.spanGroupId) continue;
        if (hideUnusedNow && !entry) continue;
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

    column.append(header, slots);
    if (active) {
      const spanDropZone = document.createElement("button");
      spanDropZone.type = "button";
      spanDropZone.className = "span-drop-zone";
      spanDropZone.dataset.spanDropDate = date;
      spanDropZone.textContent = "拖放至此延伸多日項目";
      spanDropZone.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}：拖放或在操作模式按此延伸多日項目`);
      column.append(spanDropZone);

      const controls = document.createElement("div");
      controls.className = "capacity-controls";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-slots-button";
      removeButton.dataset.removeSlotsDate = date;
      removeButton.textContent = capacity <= 10 ? "最少 10 格" : "－5 格";
      removeButton.disabled = capacity <= 10;
      removeButton.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}收起 5 個空白安排格`);

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-slots-button";
      addButton.dataset.addSlotsDate = date;
      addButton.textContent = capacity >= MAX_SLOTS_PER_DAY ? "已達每日上限" : "＋5 格";
      addButton.disabled = capacity >= MAX_SLOTS_PER_DAY;
      addButton.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}增加 5 個安排格`);
      controls.append(removeButton, addButton);
      column.append(controls);
    }
    elements.weekGrid.append(column);
  });
  updateSelectionControls();
}

function createSlotButton(date, dayIndex, slotIndex, entry, spanBottomStart = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "schedule-slot";
  button.dataset.slotDate = date;
  button.dataset.slotIndex = String(slotIndex);
  button.setAttribute(
    "aria-label",
    `${WEEKDAY_LABELS[dayIndex]} ${formatDayDate(date)} 第 ${slotIndex} 格${entry ? `：${entry.message}${entry.isCompleted ? "，已完成" : entry.isInProgress ? "，進行中" : ""}` : "，新增安排"}`
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
  }
  button.append(topLine);

  if (entry) {
    button.classList.add("has-entry");
    button.dataset.entryId = entry.id;
    button.draggable = canMoveEntry(entry);
    if (canMoveEntry(entry)) button.classList.add("can-touch-drag");
    if (state.touchActionEntryId && spanMemberIds(findEntryById(state.touchActionEntryId)).has(entry.id)) {
      button.classList.add("is-touch-action");
    }
    if (entry.spanGroupId) {
      const bounds = spanBounds(state.weekPayload.entries, entry);
      button.classList.add("is-span-project");
      if (spanBottomStart) button.classList.add("span-bottom-start");
      if (entry.scheduleDate === bounds.start) button.classList.add("span-start");
      else if (entry.scheduleDate === bounds.end) button.classList.add("span-end");
      else button.classList.add("span-middle");
      if (entry.scheduleDate !== bounds.end) button.classList.add("span-continues-right");
      button.dataset.spanGroupId = entry.spanGroupId;
      const spanBadge = document.createElement("span");
      spanBadge.className = "span-badge";
      spanBadge.textContent = `${bounds.length} 日項目`;
      topLine.append(spanBadge);
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
    message.className = "entry-message";
    message.textContent = entry.message;
    button.append(source, message);
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
  return button;
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
  if (state.mutationInFlight) return;
  if (state.selectionMode) {
    if (state.moveEntryId) state.showUnusedTemporarily = false;
    resetSelectionMode();
  } else {
    state.selectionMode = true;
  }
  renderWeek();
}

function cancelSelectionMode() {
  if (state.mutationInFlight) return;
  if (state.moveEntryId) state.showUnusedTemporarily = false;
  resetSelectionMode();
  renderWeek();
}

function toggleEntrySelection(entry) {
  if (!entry || state.mutationInFlight) return;
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
  const entries = selectedEntries();
  if (!entries.length || state.mutationInFlight) return;
  const completed = entries.some((entry) => !entry.isCompleted);
  setMutationInFlight(true);
  setStatus(elements.calendarStatus, completed ? "正在標記所選安排為完成…" : "正在取消所選安排的完成標記…");
  try {
    const common = {
      p_items: batchItems(entries),
      p_completed: completed
    };
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_batch_set_entries_completed", {
        ...common,
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id
      });
    } else {
      await callRpc("schedule_student_batch_set_entries_completed", {
        ...common,
        p_token: state.currentUser.studentToken
      });
    }
    showToast(completed ? `已完成 ${entries.length} 項安排。` : `已取消 ${entries.length} 項安排的完成標記。`);
    await loadWeek();
  } catch (error) {
    console.warn("Schedule batch completion failed", error);
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

function openEntryDialog(date, slotIndex) {
  const dayIndex = weekDates(state.weekStart).indexOf(date);
  const entry = findEntry(date, slotIndex);
  state.editing = { date, slotIndex: Number(slotIndex), entry };
  const protectedTeacherEntry = Boolean(
    entry?.source === "admin" && state.currentUser?.role === "student"
  );
  elements.entryTitle.textContent = protectedTeacherEntry ? "老師安排" : entry ? "修改安排" : "新增安排";
  elements.entryMeta.textContent = `${WEEKDAY_LABELS[dayIndex] || "日期"} · ${formatDayDate(date)} · 第 ${slotIndex} 格`;
  elements.entryMessage.value = entry?.message || "";
  elements.entryMessage.readOnly = protectedTeacherEntry;
  elements.entryEstimatedMinutes.value = entry?.estimatedMinutes || "";
  elements.entryEstimatedMinutes.readOnly = protectedTeacherEntry;
  elements.entryHint.textContent = protectedTeacherEntry
    ? "老師安排只可由管理員修改或刪除；您仍可標記完成。"
    : "按 Enter 儲存；如要換行請按 Shift + Enter。";
  elements.deleteEntry.hidden = !entry || protectedTeacherEntry;
  elements.saveEntry.hidden = protectedTeacherEntry;
  elements.toggleComplete.hidden = !entry;
  elements.toggleComplete.dataset.completed = String(Boolean(entry?.isCompleted));
  elements.toggleComplete.setAttribute("aria-pressed", String(Boolean(entry?.isCompleted)));
  elements.toggleComplete.textContent = entry?.isCompleted ? "取消完成" : "標記完成";
  elements.toggleProgress.hidden = !entry;
  elements.toggleProgress.dataset.inProgress = String(Boolean(entry?.isInProgress));
  elements.toggleProgress.setAttribute("aria-pressed", String(Boolean(entry?.isInProgress)));
  elements.toggleProgress.textContent = entry?.isInProgress ? "取消進行中" : "標記進行中";
  setStatus(elements.entryStatus, "");
  elements.entryDialog.showModal();
  window.setTimeout(() => {
    if (protectedTeacherEntry) elements.toggleComplete.focus();
    else elements.entryMessage.focus();
  }, 40);
}

async function saveEntry(event) {
  event.preventDefault();
  if (!state.editing || elements.entryMessage.readOnly) return;
  const focusTarget = {
    date: state.editing.date,
    slotIndex: state.editing.slotIndex
  };
  const message = elements.entryMessage.value.trim();
  if (!message) {
    setStatus(elements.entryStatus, "請輸入功課或溫習內容。", "error");
    return;
  }
  const estimatedMinutes = elements.entryEstimatedMinutes.value === ""
    ? null
    : Math.round(Number(elements.entryEstimatedMinutes.value));
  if (estimatedMinutes !== null && (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 10080)) {
    setStatus(elements.entryStatus, "預計需時請輸入 1 至 10080 分鐘。", "error");
    return;
  }

  const submit = elements.entryForm.querySelector("[data-save-entry]");
  submit.disabled = true;
  setStatus(elements.entryStatus, "正在儲存…");
  try {
    if (state.currentUser.role === "admin") {
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
    showToast("安排已儲存至雲端。");
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

async function changeCapacity(date, delta, button) {
  if (state.mutationInFlight || ![5, -5].includes(delta)) return;
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

async function changeWeek(amount) {
  if (state.mutationInFlight) return;
  const next = addDays(parseISODate(state.weekStart), amount);
  const first = firstWeekStart();
  const last = lastWeekStart();
  const clamped = next < first ? first : next > last ? last : next;
  const nextValue = toISODate(clamped);
  if (nextValue === state.weekStart) return;
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
        const card = document.createElement("article");
        card.className = `print-entry-card ${entry.source === "admin" ? "print-entry-admin" : "print-entry-student"}`;
        if (entry.isCompleted) card.classList.add("print-entry-completed");
        if (entry.isInProgress) card.classList.add("print-entry-progress");
        const label = document.createElement("span");
        label.className = "print-slot-label";
        label.textContent = `第 ${entry.slotIndex} 格`;
        const source = document.createElement("span");
        source.className = "print-source";
        source.textContent = `${entry.source === "admin" ? "老師安排" : "學生安排"}${entry.isCompleted ? " · 已完成" : entry.isInProgress ? " · 進行中" : ""}`;
        const message = document.createElement("p");
        message.textContent = `${entry.message}${entry.estimatedMinutes ? `\n預計需時：${formatEstimatedMinutes(entry.estimatedMinutes)}` : ""}`;
        card.append(label, source, message);
        list.append(card);
      });
    }
    day.append(heading, list);
    elements.printGrid.append(day);
  });
}

function exportPdf() {
  if (!activeStudent() || !state.weekPayload) return;
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

elements.loginForm.addEventListener("submit", login);
elements.logout.addEventListener("click", logout);
elements.adminStudentsButton.addEventListener("click", openAdminPanel);
elements.studentSearch.addEventListener("input", renderStudentList);
elements.studentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-student-id]");
  if (button) openStudentSchedule(button.dataset.studentId);
});

elements.passwordToggle.addEventListener("click", () => {
  const showing = elements.password.type === "text";
  elements.password.type = showing ? "password" : "text";
  elements.passwordToggle.textContent = showing ? "顯示" : "隱藏";
  elements.passwordToggle.setAttribute("aria-pressed", String(!showing));
});

elements.weekGrid.addEventListener("click", (event) => {
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
  if (!canMoveEntry(entry) || state.mutationInFlight) {
    event.preventDefault();
    return;
  }
  leaveTouchActionMode();
  state.draggingEntryId = entry.id;
  slot.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", entry.id);
});

elements.weekGrid.addEventListener("dragover", (event) => {
  if (!state.draggingEntryId || state.mutationInFlight) return;
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  const slot = event.target.closest("[data-slot-date]");
  if (!slot && !spanDropZone) return;
  const entry = findEntryById(state.draggingEntryId);
  if (spanDropZone) {
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
  const slot = event.target.closest("[data-slot-date]");
  if (slot && !slot.contains(event.relatedTarget)) slot.classList.remove("is-drop-target", "is-swap-target");
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  if (spanDropZone && !spanDropZone.contains(event.relatedTarget)) spanDropZone.classList.remove("is-span-target");
});

elements.weekGrid.addEventListener("drop", (event) => {
  const spanDropZone = event.target.closest("[data-span-drop-date]");
  const slot = event.target.closest("[data-slot-date]");
  if ((!slot && !spanDropZone) || !state.draggingEntryId) return;
  event.preventDefault();
  elements.weekGrid.querySelectorAll(".is-drop-target, .is-swap-target, .is-span-target").forEach((item) => item.classList.remove("is-drop-target", "is-swap-target", "is-span-target"));
  const entry = findEntryById(state.draggingEntryId);
  if (spanDropZone) extendEntryToDay(entry, spanDropZone.dataset.spanDropDate);
  else moveEntryTo(entry, slot.dataset.slotDate, Number(slot.dataset.slotIndex));
});

elements.weekGrid.addEventListener("dragend", () => {
  state.draggingEntryId = null;
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
  if (!elements.entryMessage.readOnly && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.entryForm.requestSubmit();
  }
});
elements.closeEntry.addEventListener("click", () => elements.entryDialog.close());
elements.deleteEntry.addEventListener("click", () => elements.deleteDialog.showModal());
elements.toggleComplete.addEventListener("click", toggleEntryCompletion);
elements.toggleProgress.addEventListener("click", toggleEntryProgress);
elements.cancelDelete.addEventListener("click", () => elements.deleteDialog.close());
elements.confirmDelete.addEventListener("click", deleteEntry);
elements.previousWeek.addEventListener("click", () => changeWeek(-7));
elements.nextWeek.addEventListener("click", () => changeWeek(7));
elements.currentWeek.addEventListener("click", async () => {
  if (state.mutationInFlight) return;
  state.showUnusedTemporarily = false;
  state.weekStart = defaultWeekStart();
  await loadWeek();
});
elements.exportPdf.addEventListener("click", exportPdf);
elements.toggleTable.addEventListener("click", toggleTableVisibility);
elements.toggleUnused.addEventListener("click", toggleUnusedSlots);
elements.toggleMascots.addEventListener("click", toggleMascots);
elements.toggleSelection?.addEventListener("click", toggleSelectionMode);
elements.batchComplete?.addEventListener("click", batchSetCompletion);
elements.moveSelected?.addEventListener("click", beginMoveSelected);
elements.batchDelete?.addEventListener("click", batchDeleteEntries);
elements.cancelSelection?.addEventListener("click", cancelSelectionMode);
elements.addCountdowns?.addEventListener("click", () => changeCountdownCapacity(5));
elements.removeCountdowns?.addEventListener("click", () => changeCountdownCapacity(-5));
elements.countdownGrid?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-countdown-position]");
  if (!card) return;
  if (event.target.closest("[data-save-countdown]")) saveCountdown(card);
  else if (event.target.closest("[data-delete-countdown]")) deleteCountdown(card);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.selectionMode && !elements.entryDialog.open && !elements.deleteDialog.open) {
    cancelSelectionMode();
  }
});

elements.entryDialog.addEventListener("close", () => {
  if (!elements.deleteDialog.open) state.editing = null;
});

async function initialize() {
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

initialize();
