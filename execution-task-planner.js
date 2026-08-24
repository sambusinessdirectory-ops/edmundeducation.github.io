(function initialiseExecutionTaskPlanner() {
  "use strict";

  const config = window.EDMUND_EXECUTION_CONFIG;
  const tables = Array.isArray(window.EDMUND_EXECUTION_TABLES) ? window.EDMUND_EXECUTION_TABLES : [];
  const template = tables.find((table) => table.id === "before-each-item");
  const questions = template ? template.groups.flatMap((group) => group.rows) : [];
  const settings = window.EDMUND_SUPABASE;
  const client = window.supabase?.createClient?.(settings?.url, settings?.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  if (!config || !client || questions.length !== 27) return;

  const MIN_DATE = "2026-01-01";
  const MAX_DATE = "2050-12-31";
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    loading: $("[data-loading]"), app: $("[data-planner-app]"), connection: $("[data-connection-status]"),
    user: $("[data-user-pill]"), dateInput: $("[data-date-input]"), previous: $("[data-previous-date]"),
    next: $("[data-next-date]"), day: $("[data-date-day]"), month: $("[data-date-month]"),
    heading: $("[data-date-heading]"), capacity: $("[data-capacity]"), addTen: $("[data-add-ten]"),
    active: $("[data-active-tasks]"), archive: $("[data-archive-list]"), archiveCount: $("[data-archive-count]"),
    status: $("[data-status]")
  };
  const state = { role: "", token: "", user: null, date: initialDate(), capacity: 10, active: new Map(), archived: [], busy: false, timerTick: 0 };

  function initialDate() {
    const now = new Date();
    return clampDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  }

  function clampDate(value) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : MIN_DATE;
    return date < MIN_DATE ? MIN_DATE : date > MAX_DATE ? MAX_DATE : date;
  }

  function shiftDate(value, days) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return clampDate(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`);
  }

  function setConnection(text, mode) {
    elements.connection.textContent = text;
    elements.connection.dataset.state = mode;
  }

  function showStatus(message, mode = "ok") {
    elements.status.textContent = message;
    elements.status.dataset.state = mode;
    elements.status.hidden = !message;
    if (message && mode !== "error") window.setTimeout(() => { if (elements.status.textContent === message) elements.status.hidden = true; }, 3500);
  }

  async function ensureAuth() {
    const { data } = await client.auth.getSession();
    if (data?.session) return;
    const { error } = await client.auth.signInAnonymously();
    if (error) throw error;
  }

  async function rpc(name, params) {
    await ensureAuth();
    const { data, error } = await client.rpc(name, params);
    if (error) throw error;
    return data;
  }

  function authParams() {
    return state.role === "admin"
      ? { p_student_token: null, p_admin_token: state.token }
      : { p_student_token: state.token, p_admin_token: null };
  }

  function readOwnSession() {
    try { return JSON.parse(sessionStorage.getItem(config.sessionKey) || "null"); }
    catch { return null; }
  }

  async function validateSession() {
    const own = readOwnSession();
    const universal = window.EdmundSystemNav?.getStudentSession?.();
    if (own?.role === "admin" && own.token) {
      const rows = await rpc(config.adminMeRpc, { p_admin_token: String(own.token) });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (row?.id && row?.name) {
        state.role = "admin";
        state.token = String(own.token);
        state.user = { id: String(row.id), name: String(row.name) };
        return true;
      }
    }
    const candidate = universal?.role === "student" ? universal : own?.role === "student" ? own : null;
    if (candidate?.token) {
      const rows = await rpc(config.studentProfileRpc, { p_token: String(candidate.token) });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (row?.id && row?.name && row?.session_token) {
        state.role = "student";
        state.token = String(row.session_token);
        state.user = { id: String(row.id), name: String(row.name) };
        return true;
      }
    }
    return false;
  }

  function formatDate(value, options) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("zh-HK", options).format(new Date(Date.UTC(year, month - 1, day, 12)));
  }

  function updateDateLabels() {
    const [year, month, day] = state.date.split("-");
    elements.day.textContent = day;
    elements.month.textContent = `${year} · ${month}`;
    elements.heading.textContent = formatDate(state.date, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    elements.dateInput.value = state.date;
    elements.previous.disabled = state.date === MIN_DATE;
    elements.next.disabled = state.date === MAX_DATE;
  }

  function makeSummary(slot, record) {
    const summary = document.createElement("summary");
    const number = document.createElement("span");
    number.className = "task-number";
    number.textContent = String(slot).padStart(2, "0");
    const copy = document.createElement("span");
    copy.className = "task-summary-copy";
    const title = document.createElement("strong");
    title.textContent = record?.title || `Task ${slot}`;
    const subtitle = document.createElement("small");
    subtitle.textContent = record
      ? `已儲存 · ${formatDuration(effectiveElapsed(record))} · ${record.difficulty_rating ? `${record.difficulty_rating} 星難度` : "未評難度"}`
      : "空白工作格式 · 按此填寫";
    copy.append(title, subtitle);
    const chevron = document.createElement("span");
    chevron.className = "task-chevron";
    chevron.textContent = "⌄";
    summary.append(number, copy, chevron);
    return summary;
  }

  function formatTimestamp(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }

  function effectiveElapsed(record) {
    const stored = Math.max(0, Number(record?.writing_elapsed_seconds) || 0);
    if (!record?.writing_timer_started_at) return stored;
    return stored + Math.max(0, Math.floor((Date.now() - new Date(record.writing_timer_started_at).getTime()) / 1000));
  }

  function formatDuration(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const remainder = value % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function refreshTimers() {
    document.querySelectorAll("[data-task-timer]").forEach((node) => {
      const record = state.active.get(Number(node.dataset.taskTimer));
      if (record) node.textContent = formatDuration(effectiveElapsed(record));
    });
  }

  function buildTaskForm(slot, record, details) {
    if (details.querySelector(".task-form")) return;
    const form = document.createElement("form");
    form.className = "task-form";
    form.noValidate = true;
    const timerBar = document.createElement("div");
    timerBar.className = "task-timer-bar";
    const timerCopy = document.createElement("div");
    const timerLabel = document.createElement("span");
    timerLabel.textContent = "工作報告撰寫時間";
    const timerValue = document.createElement("strong");
    timerValue.dataset.taskTimer = String(slot);
    timerValue.textContent = formatDuration(effectiveElapsed(record));
    timerCopy.append(timerLabel, timerValue);
    const startTimer = document.createElement("button");
    startTimer.type = "button";
    startTimer.className = "start-timer";
    startTimer.textContent = record?.writing_timer_started_at ? "計時中…" : "▶ 開始計時";
    startTimer.disabled = Boolean(record?.writing_timer_started_at);
    timerBar.append(timerCopy, startTimer);
    const titleLabel = document.createElement("label");
    titleLabel.className = "title-field";
    const titleCopy = document.createElement("span");
    titleCopy.textContent = "工作名稱";
    const title = document.createElement("input");
    title.name = "title";
    title.maxLength = 500;
    title.placeholder = "例如：準備並傳送商業發票";
    title.value = record?.title || "";
    title.required = true;
    titleLabel.append(titleCopy, title);
    const questionGrid = document.createElement("div");
    questionGrid.className = "task-questions";
    questions.forEach((question, index) => {
      const field = document.createElement("label");
      field.className = "question-field";
      if (index >= 25) field.dataset.reflection = "true";
      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${question.text}`;
      const textarea = document.createElement("textarea");
      textarea.name = `q${index + 1}`;
      textarea.value = String(record?.answers?.[`q${index + 1}`] || "");
      textarea.maxLength = 5000;
      field.append(label, textarea);
      questionGrid.append(field);
    });
    const actions = document.createElement("div");
    actions.className = "task-form-actions";
    const stopTimer = document.createElement("button");
    stopTimer.type = "button";
    stopTimer.className = "stop-timer";
    stopTimer.textContent = "■ 停止計時";
    stopTimer.disabled = !record?.writing_timer_started_at;
    const move = document.createElement("button");
    move.type = "button";
    move.className = "move-task";
    move.textContent = "→ 移到明天";
    move.disabled = state.date === MAX_DATE;
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "save-task";
    save.textContent = record ? "儲存更新" : "儲存工作構思";
    const archive = document.createElement("button");
    archive.type = "button";
    archive.className = "archive-task";
    archive.textContent = "✓ 這項工作完成";
    const buttons = [startTimer, stopTimer, move, save, archive];
    startTimer.addEventListener("click", () => changeTaskTimer(slot, form, buttons, "start"));
    stopTimer.addEventListener("click", () => changeTaskTimer(slot, form, buttons, "stop"));
    move.addEventListener("click", () => moveTaskTomorrow(slot, form, buttons));
    archive.addEventListener("click", () => archiveTask(slot, form, buttons));
    actions.append(stopTimer, move, save, archive);

    const rating = document.createElement("fieldset");
    rating.className = "difficulty-rating";
    const legend = document.createElement("legend");
    legend.textContent = "這項工作的難度";
    const ratingHint = document.createElement("span");
    ratingHint.textContent = record?.difficulty_rating ? `${record.difficulty_rating} / 5` : "尚未評分";
    const stars = document.createElement("div");
    stars.className = "rating-stars";
    for (let value = 1; value <= 5; value += 1) {
      const star = document.createElement("button");
      star.type = "button";
      star.textContent = "★";
      star.dataset.rating = String(value);
      star.setAttribute("aria-label", `${value} 星難度`);
      star.setAttribute("aria-pressed", String(value <= Number(record?.difficulty_rating || 0)));
      star.addEventListener("click", () => rateTask(slot, form, buttons, value, stars, ratingHint));
      stars.append(star);
    }
    rating.append(legend, ratingHint, stars);
    form.append(timerBar, titleLabel, questionGrid, rating, actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveTask(slot, form, buttons)
        .then(() => loadDay("工作構思已永久儲存。"))
        .catch(() => {});
    });
    details.append(form);
  }

  function answersFromForm(form) {
    const answers = {};
    questions.forEach((_, index) => {
      const value = String(form.elements[`q${index + 1}`]?.value || "").trim();
      if (value) answers[`q${index + 1}`] = value;
    });
    return answers;
  }

  async function saveTask(slot, form, buttons) {
    const title = String(form.elements.title.value || "").trim();
    if (!title) {
      form.elements.title.focus();
      showStatus("請先填寫工作名稱。", "error");
      throw new Error("Task title is required");
    }
    buttons.forEach((button) => { button.disabled = true; });
    try {
      const rows = await rpc(config.plannerTaskSaveRpc, {
        p_task_date: state.date,
        p_slot_number: slot,
        p_title: title,
        p_answers: answersFromForm(form),
        ...authParams()
      });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row?.id) throw new Error("Saved task was not returned");
      return row;
    } catch (error) {
      showStatus(error?.message || "未能儲存工作，請稍後再試。", "error");
      throw error;
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  async function changeTaskTimer(slot, form, buttons, action) {
    try {
      const saved = await saveTask(slot, form, buttons);
      buttons.forEach((button) => { button.disabled = true; });
      const rows = await rpc(config.plannerTaskTimerRpc, { p_task_id: saved.id, p_action: action, ...authParams() });
      const timer = Array.isArray(rows) ? rows[0] : null;
      if (!timer?.id) throw new Error("未能更新計時器");
      await loadDay(action === "start" ? "工作報告計時已開始。" : `計時已停止：${formatDuration(timer.writing_elapsed_seconds)}。`, { focusSlot: slot, openSlot: slot });
    } catch (error) {
      if (error?.message !== "Task title is required") showStatus(error?.message || "未能更新計時器。", "error");
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  async function rateTask(slot, form, buttons, value, stars, hint) {
    try {
      const saved = await saveTask(slot, form, buttons);
      const rating = await rpc(config.plannerTaskRatingRpc, { p_task_id: saved.id, p_rating: value, ...authParams() });
      stars.querySelectorAll("button").forEach((star) => star.setAttribute("aria-pressed", String(Number(star.dataset.rating) <= Number(rating))));
      hint.textContent = `${rating} / 5`;
      showStatus(`已記錄 ${rating} 星工作難度。`);
    } catch (error) {
      if (error?.message !== "Task title is required") showStatus(error?.message || "未能儲存難度評分。", "error");
    }
  }

  async function moveTaskTomorrow(slot, form, buttons) {
    try {
      const saved = await saveTask(slot, form, buttons);
      buttons.forEach((button) => { button.disabled = true; });
      const rows = await rpc(config.plannerTaskMoveRpc, { p_task_id: saved.id, ...authParams() });
      const moved = Array.isArray(rows) ? rows[0] : null;
      if (!moved?.id) throw new Error("未能移動工作");
      await loadDay(`工作已移到明天 ${moved.task_date} 的 Task ${moved.slot_number}。`);
    } catch (error) {
      if (error?.message !== "Task title is required") showStatus(error?.message || "未能把工作移到明天。", "error");
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  async function archiveTask(slot, form, buttons) {
    try {
      const saved = await saveTask(slot, form, buttons);
      buttons.forEach((button) => { button.disabled = true; });
      const result = await rpc(config.plannerTaskArchiveRpc, { p_task_id: saved.id, ...authParams() });
      if (!result) throw new Error("工作未能封存");
      await loadDay("工作已完成並移到封存紀錄。", { focusSlot: slot });
    } catch (error) {
      if (error?.message !== "Task title is required") showStatus(error?.message || "未能封存工作。", "error");
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  function renderActive() {
    elements.active.replaceChildren();
    for (let slot = 1; slot <= state.capacity; slot += 1) {
      const record = state.active.get(slot) || null;
      const details = document.createElement("details");
      details.className = "task-card";
      details.dataset.slot = String(slot);
      details.append(makeSummary(slot, record));
      details.addEventListener("toggle", () => { if (details.open) buildTaskForm(slot, record, details); });
      elements.active.append(details);
    }
  }

  function renderArchive() {
    elements.archive.replaceChildren();
    elements.archiveCount.textContent = String(state.archived.length);
    if (!state.archived.length) {
      const empty = document.createElement("p");
      empty.className = "archive-empty";
      empty.textContent = "這一天暫時沒有已完成的封存工作。";
      elements.archive.append(empty);
      return;
    }
    state.archived.forEach((record) => {
      const details = document.createElement("details");
      details.className = "archive-item";
      const summary = document.createElement("summary");
      const title = document.createElement("strong");
      title.textContent = record.title;
      const meta = document.createElement("small");
      meta.textContent = `Task ${record.slot_number} · ${formatDuration(record.writing_elapsed_seconds)} · ${record.difficulty_rating ? `${record.difficulty_rating} 星難度` : "未評難度"} · 完成於 ${formatTimestamp(record.completed_at)}`;
      summary.append(title, meta);
      const content = document.createElement("div");
      content.className = "archive-content";
      questions.forEach((question, index) => {
        const answer = String(record.answers?.[`q${index + 1}`] || "").trim();
        if (!answer) return;
        const row = document.createElement("div");
        row.className = "archive-answer";
        const questionText = document.createElement("strong");
        questionText.textContent = `${index + 1}. ${question.text}`;
        const answerText = document.createElement("p");
        answerText.textContent = answer;
        row.append(questionText, answerText);
        content.append(row);
      });
      const reactivate = document.createElement("button");
      reactivate.type = "button";
      reactivate.className = "reactivate-task";
      reactivate.textContent = "↶ 重新啟動這項工作";
      reactivate.addEventListener("click", () => reactivateTask(record, reactivate));
      content.append(reactivate);
      details.append(summary, content);
      elements.archive.append(details);
    });
  }

  async function reactivateTask(record, button) {
    button.disabled = true;
    try {
      const rows = await rpc(config.plannerTaskReactivateRpc, { p_task_id: record.id, ...authParams() });
      const restored = Array.isArray(rows) ? rows[0] : null;
      if (!restored?.id) throw new Error("未能重新啟動工作");
      await loadDay(`工作已重新啟動於 Task ${restored.slot_number}。`, { focusSlot: restored.slot_number, openSlot: restored.slot_number });
    } catch (error) {
      showStatus(error?.message || "未能重新啟動工作。", "error");
    } finally {
      button.disabled = false;
    }
  }

  async function loadDay(successMessage = "", options = {}) {
    if (state.busy) return;
    state.busy = true;
    elements.addTen.disabled = true;
    updateDateLabels();
    showStatus("");
    try {
      const params = { p_task_date: state.date, ...authParams() };
      const [capacity, activeRows, archivedRows] = await Promise.all([
        rpc(config.plannerCapacityRpc, params),
        rpc(config.plannerTasksLoadRpc, { ...params, p_status: "active" }),
        rpc(config.plannerTasksLoadRpc, { ...params, p_status: "archived" })
      ]);
      state.capacity = Math.max(10, Math.min(1000, Number(capacity) || 10));
      state.active = new Map((Array.isArray(activeRows) ? activeRows : []).map((row) => [Number(row.slot_number), row]));
      state.archived = Array.isArray(archivedRows) ? archivedRows : [];
      elements.capacity.textContent = String(state.capacity);
      renderActive();
      renderArchive();
      refreshTimers();
      setConnection("已安全連接", "online");
      if (successMessage) showStatus(successMessage);
      if (options.focusSlot) {
        const target = elements.active.querySelector(`[data-slot="${options.focusSlot}"]`);
        if (target && options.openSlot) {
          target.open = true;
          buildTaskForm(Number(options.openSlot), state.active.get(Number(options.openSlot)), target);
        }
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      console.warn("Execution planner could not load the selected date", error);
      setConnection("連線失敗", "error");
      showStatus(error?.message || "未能讀取這一天的工作。", "error");
    } finally {
      state.busy = false;
      elements.addTen.disabled = state.capacity >= 1000;
    }
  }

  async function addTen() {
    if (state.busy || state.capacity >= 1000) return;
    state.busy = true;
    elements.addTen.disabled = true;
    try {
      const capacity = await rpc(config.plannerCapacityAddRpc, { p_task_date: state.date, ...authParams() });
      state.capacity = Math.max(10, Math.min(1000, Number(capacity) || state.capacity));
      elements.capacity.textContent = String(state.capacity);
      renderActive();
      showStatus("已增加 10 個空白工作格式。這些空位不會產生不必要的資料。 ");
    } catch (error) {
      showStatus(error?.message || "未能增加工作格式。", "error");
    } finally {
      state.busy = false;
      elements.addTen.disabled = state.capacity >= 1000;
    }
  }

  elements.previous.addEventListener("click", () => { state.date = shiftDate(state.date, -1); loadDay(); });
  elements.next.addEventListener("click", () => { state.date = shiftDate(state.date, 1); loadDay(); });
  elements.dateInput.addEventListener("change", () => { state.date = clampDate(elements.dateInput.value); loadDay(); });
  elements.addTen.addEventListener("click", addTen);

  (async () => {
    setConnection("正在連接", "checking");
    try {
      await ensureAuth();
      if (!await validateSession()) {
        location.replace("execution-system.html");
        return;
      }
      elements.user.hidden = false;
      elements.user.textContent = state.role === "admin" ? `${state.user.name} · 管理員` : state.user.name;
      elements.loading.hidden = true;
      elements.app.hidden = false;
      state.timerTick = window.setInterval(refreshTimers, 1000);
      await loadDay();
    } catch (error) {
      console.warn("Execution planner initialization failed", error);
      setConnection("連線失敗", "error");
      elements.loading.querySelector("h1").textContent = "暫時未能開啟工作構思簿";
      elements.loading.querySelector("p").textContent = "請返回執行動力系統重新登入後再試。";
    }
  })();
})();
