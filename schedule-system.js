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

const ADMIN_NAME = "Sam Admind Schedule";
const SESSION_KEY = "edmund-schedule-session-v1";
const MAX_SLOTS_PER_DAY = 100;

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
  weekGrid: document.querySelector("[data-week-grid]"),
  calendarStatus: document.querySelector("[data-calendar-status]"),
  entryDialog: document.querySelector("[data-entry-dialog]"),
  entryForm: document.querySelector("[data-entry-form]"),
  entryTitle: document.querySelector("[data-entry-title]"),
  entryMeta: document.querySelector("[data-entry-meta]"),
  entryMessage: document.querySelector("#schedule-message"),
  entryHint: document.querySelector("[data-entry-hint]"),
  entryStatus: document.querySelector("[data-entry-status]"),
  closeEntry: document.querySelector("[data-close-entry]"),
  deleteEntry: document.querySelector("[data-delete-entry]"),
  saveEntry: document.querySelector("[data-save-entry]"),
  deleteDialog: document.querySelector("[data-delete-dialog]"),
  cancelDelete: document.querySelector("[data-cancel-delete]"),
  confirmDelete: document.querySelector("[data-confirm-delete]"),
  toast: document.querySelector("[data-toast]"),
  printSheet: document.querySelector("[data-print-sheet]"),
  printRange: document.querySelector("[data-print-range]"),
  printStudent: document.querySelector("[data-print-student]"),
  printHead: document.querySelector("[data-print-head]"),
  printBody: document.querySelector("[data-print-body]")
};

const state = {
  currentUser: null,
  selectedStudent: null,
  adminStudents: [],
  weekStart: defaultWeekStart(),
  weekPayload: { capacities: {}, entries: [] },
  editing: null,
  weekRequestId: 0,
  toastTimer: null
};

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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearRenderedSchedule() {
  state.weekRequestId += 1;
  state.weekPayload = { capacities: {}, entries: [] };
  state.editing = null;
  elements.weekGrid.replaceChildren();
  elements.exportPdf.disabled = true;
  if (elements.deleteDialog.open) elements.deleteDialog.close();
  if (elements.entryDialog.open) elements.entryDialog.close();
  elements.entryMessage.value = "";
  elements.entryMessage.readOnly = false;
  elements.saveEntry.hidden = false;
  elements.deleteEntry.hidden = true;
  setStatus(elements.entryStatus, "");
  setStatus(elements.calendarStatus, "");
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
  const requestedWeek = state.weekStart;
  const requestId = state.weekRequestId + 1;
  state.weekRequestId = requestId;
  state.weekPayload = { capacities: {}, entries: [] };
  elements.weekGrid.replaceChildren();
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
    state.weekPayload = {
      capacities: payload.capacities && typeof payload.capacities === "object" ? payload.capacities : {},
      entries: Array.isArray(payload.entries) ? payload.entries : []
    };
    renderWeek();
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
  const selector = target.slotIndex
    ? `[data-slot-date="${target.date}"][data-slot-index="${Number(target.slotIndex)}"]`
    : `[data-add-slots-date="${target.date}"]`;
  window.requestAnimationFrame(() => elements.weekGrid.querySelector(selector)?.focus());
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
  elements.weekGrid.replaceChildren();

  dates.forEach((date, dayIndex) => {
    const active = isDateInScheduleRange(date);
    const rawCapacity = Number(state.weekPayload.capacities[date]);
    const capacity = active
      ? Math.max(10, Math.min(MAX_SLOTS_PER_DAY, Number.isFinite(rawCapacity) ? rawCapacity : 10))
      : 0;

    const column = document.createElement("section");
    column.className = "day-column";
    column.setAttribute("aria-labelledby", `schedule-day-${date}`);
    if (dayIndex >= 5) column.classList.add("is-weekend");
    if (!active) column.classList.add("is-outside-range");
    if (date === today) column.classList.add("is-today");

    const header = document.createElement("header");
    header.className = "day-header";
    const weekday = document.createElement("h2");
    weekday.id = `schedule-day-${date}`;
    weekday.textContent = WEEKDAY_LABELS[dayIndex];
    const dateLabel = document.createElement("span");
    dateLabel.textContent = active ? formatDayDate(date) : `${formatDayDate(date)} · 範圍外`;
    header.append(weekday, dateLabel);

    const slots = document.createElement("div");
    slots.className = "day-slots";
    if (active) {
      for (let slotIndex = 1; slotIndex <= capacity; slotIndex += 1) {
        const entry = entries.get(`${date}:${slotIndex}`);
        slots.append(createSlotButton(date, dayIndex, slotIndex, entry));
      }
    } else {
      const note = document.createElement("p");
      note.className = "empty-state";
      note.textContent = "只提供 2026 年 1 月至 2050 年 12 月。";
      slots.append(note);
    }

    column.append(header, slots);
    if (active) {
      const addWrap = document.createElement("div");
      addWrap.className = "add-slots-wrap";
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-slots-button";
      addButton.dataset.addSlotsDate = date;
      addButton.textContent = capacity >= MAX_SLOTS_PER_DAY ? "已達每日上限" : "＋5 格";
      addButton.disabled = capacity >= MAX_SLOTS_PER_DAY;
      addButton.setAttribute("aria-label", `${WEEKDAY_LABELS[dayIndex]}增加 5 個安排格`);
      addWrap.append(addButton);
      column.append(addWrap);
    }
    elements.weekGrid.append(column);
  });
}

function createSlotButton(date, dayIndex, slotIndex, entry) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "schedule-slot";
  button.dataset.slotDate = date;
  button.dataset.slotIndex = String(slotIndex);
  button.setAttribute(
    "aria-label",
    `${WEEKDAY_LABELS[dayIndex]} ${formatDayDate(date)} 第 ${slotIndex} 格${entry ? `：${entry.message}` : "，新增安排"}`
  );

  const number = document.createElement("span");
  number.className = "slot-number";
  number.textContent = `SLOT ${String(slotIndex).padStart(2, "0")}`;
  button.append(number);

  if (entry) {
    button.classList.add("has-entry");
    if (entry.source === "admin") button.classList.add("is-admin-entry");
    const source = document.createElement("span");
    source.className = `entry-source ${entry.source === "admin" ? "admin" : "student"}`;
    source.textContent = entry.source === "admin" ? "老師安排" : "學生安排";
    const message = document.createElement("p");
    message.className = "entry-message";
    message.textContent = entry.message;
    button.append(source, message);
  } else {
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
  elements.entryHint.textContent = protectedTeacherEntry
    ? "老師安排只可由管理員修改或刪除。"
    : "按 Enter 儲存；如要換行請按 Shift + Enter。";
  elements.deleteEntry.hidden = !entry || protectedTeacherEntry;
  elements.saveEntry.hidden = protectedTeacherEntry;
  setStatus(elements.entryStatus, "");
  elements.entryDialog.showModal();
  window.setTimeout(() => elements.entryMessage.focus(), 40);
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
        p_expected_updated_at: state.editing.entry?.updatedAt || null
      });
    } else {
      await callRpc("schedule_student_upsert_entry", {
        p_token: state.currentUser.studentToken,
        p_schedule_date: state.editing.date,
        p_slot_index: state.editing.slotIndex,
        p_message: message,
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

async function addSlots(date, button) {
  button.disabled = true;
  const previousCapacity = Math.max(10, Number(state.weekPayload.capacities[date]) || 10);
  setStatus(elements.calendarStatus, "正在增加 5 個安排格…");
  try {
    if (state.currentUser.role === "admin") {
      await callRpc("schedule_admin_add_slots", {
        p_admin_token: state.currentUser.adminToken,
        p_student_id: activeStudent().id,
        p_schedule_date: date
      });
    } else {
      await callRpc("schedule_student_add_slots", {
        p_token: state.currentUser.studentToken,
        p_schedule_date: date
      });
    }
    showToast(`${formatDayDate(date)} 已增加 5 格。`);
    await loadWeek({ date, slotIndex: Math.min(previousCapacity + 1, MAX_SLOTS_PER_DAY) });
  } catch (error) {
    console.warn("Schedule capacity update failed", error);
    setStatus(elements.calendarStatus, error.message || "未能增加格數。", "error");
    button.disabled = false;
    if (isExpiredSessionError(error)) await logout();
  }
}

async function changeWeek(amount) {
  const next = addDays(parseISODate(state.weekStart), amount);
  const first = firstWeekStart();
  const last = lastWeekStart();
  const clamped = next < first ? first : next > last ? last : next;
  const nextValue = toISODate(clamped);
  if (nextValue === state.weekStart) return;
  state.weekStart = nextValue;
  await loadWeek();
}

function preparePrintSheet() {
  const dates = weekDates(state.weekStart);
  const entries = entryMap();
  const capacities = dates.map((date) => (
    isDateInScheduleRange(date) ? Math.max(10, Number(state.weekPayload.capacities[date]) || 10) : 0
  ));
  const maxSlots = Math.max(10, ...capacities);

  elements.printStudent.textContent = activeStudent()?.name || "學生";
  elements.printRange.textContent = formatWeekRange(state.weekStart);
  elements.printHead.replaceChildren();
  elements.printBody.replaceChildren();

  const headRow = document.createElement("tr");
  dates.forEach((date, index) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = `${WEEKDAY_LABELS[index]}\n${formatDayDate(date)}`;
    headRow.append(cell);
  });
  elements.printHead.append(headRow);

  for (let slotIndex = 1; slotIndex <= maxSlots; slotIndex += 1) {
    const row = document.createElement("tr");
    dates.forEach((date, dayIndex) => {
      const cell = document.createElement("td");
      const label = document.createElement("span");
      label.className = "print-slot-label";
      label.textContent = `第 ${slotIndex} 格`;
      cell.append(label);
      if (slotIndex <= capacities[dayIndex]) {
        const entry = entries.get(`${date}:${slotIndex}`);
        if (entry) {
          if (entry.source === "admin") cell.classList.add("print-entry-admin");
          const source = document.createElement("span");
          source.className = "print-source";
          source.textContent = entry.source === "admin" ? "老師安排" : "學生安排";
          const message = document.createTextNode(entry.message);
          cell.append(source, message);
        }
      } else {
        cell.append(document.createTextNode("—"));
      }
      row.append(cell);
    });
    elements.printBody.append(row);
  }
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
  return String(error?.message || "").toLocaleLowerCase().includes("another session");
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
  const slot = event.target.closest("[data-slot-date]");
  if (slot) {
    openEntryDialog(slot.dataset.slotDate, Number(slot.dataset.slotIndex));
    return;
  }
  const addButton = event.target.closest("[data-add-slots-date]");
  if (addButton) addSlots(addButton.dataset.addSlotsDate, addButton);
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
elements.cancelDelete.addEventListener("click", () => elements.deleteDialog.close());
elements.confirmDelete.addEventListener("click", deleteEntry);
elements.previousWeek.addEventListener("click", () => changeWeek(-7));
elements.nextWeek.addEventListener("click", () => changeWeek(7));
elements.currentWeek.addEventListener("click", async () => {
  state.weekStart = defaultWeekStart();
  await loadWeek();
});
elements.exportPdf.addEventListener("click", exportPdf);

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
