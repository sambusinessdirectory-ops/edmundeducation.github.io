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
    status: $("[data-status]"), hourGrid: $("[data-hour-grid]"),
    dayWritingTotal: $("[data-day-writing-total]"), completionRate: $("[data-completion-rate]"),
    completionCopy: $("[data-completion-copy]"), priorityToggle: $("[data-priority-toggle]"),
    prioritySave: $("[data-priority-save]")
  };
  const state = {
    role: "", token: "", user: null, date: initialDate(), capacity: 10,
    active: new Map(), archived: [], hourBlocks: new Map(), busy: false,
    timerTick: 0, thinking: null, hourSaveTimers: new Map(), daySummary: {}, priorityMode: false,
    requestedTask: new URLSearchParams(location.search).get("task") || ""
  };

  function initialDate() {
    const requested = new URLSearchParams(location.search).get("date");
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(requested || ""))) return clampDate(requested);
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
    if (record) title.className = "saved-task-title";
    const subtitle = document.createElement("small");
    subtitle.textContent = record
      ? `已儲存 · ${formatDuration(effectiveElapsed(record))} · ${record.difficulty_rating ? `${record.difficulty_rating} 星難度` : "未評難度"}`
      : "空白工作格式 · 按此填寫";
    copy.append(title, subtitle);
    const chevron = document.createElement("span");
    chevron.className = "task-chevron";
    chevron.textContent = "⌄";
    summary.append(number, copy, chevron);
    if (record?.tag_keys?.length) {
      const tags = document.createElement("span");
      tags.className = "summary-tags";
      record.tag_keys.forEach((key) => {
        const tag = config.taskTags.find((item) => item.key === key);
        if (!tag) return;
        const dot = document.createElement("i");
        dot.dataset.tagKey = tag.key;
        dot.title = tag.label;
        tags.append(dot);
      });
      copy.append(tags);
    }
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
    if (state.thinking?.timerNode) {
      const current = state.thinking.baseSeconds + Math.max(0, Math.floor((Date.now() - state.thinking.startedAt) / 1000));
      state.thinking.timerNode.textContent = `思考 ${formatDuration(current)}`;
    }
    const daySeconds = [...state.active.values(), ...state.archived].reduce((sum, record) => sum + effectiveElapsed(record), 0);
    elements.dayWritingTotal.textContent = formatDuration(daySeconds);
  }

  function parseDuration(value) {
    const text = String(value || "").trim();
    if (!/^(?:\d+:)?[0-5]?\d:[0-5]\d$/.test(text)) return null;
    const parts = text.split(":").map(Number);
    return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
  }

  function safeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function printStep20(record) {
    const step20 = String(record?.answers?.q20 || record?.step20 || "").trim();
    if (!step20) { showStatus("這項工作尚未填寫 Step 20。", "error"); return null; }
    const steps = step20.split(/\r?\n/).map((step) => step.trim()).filter(Boolean);
    const popup = window.open("", "execution-step20-pdf", "width=920,height=760");
    if (!popup) { showStatus("請允許彈出視窗，才能匯出 Step 20 PDF。", "error"); return null; }
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${safeHtml(record.task_date || state.date)} - Task ${Number(record.slot_number) || ""} - ${safeHtml(record.title)}</title><link rel="stylesheet" href="${location.origin}/execution-step20-print.css?v=20260824-1"></head><body><header class="step20-print-header"><small>EDMUND EXECUTION · BABY STEPS REFERENCE</small><h1>${safeHtml(record.title)}</h1><p>${safeHtml(record.task_date || state.date)} · Task ${Number(record.slot_number) || ""}</p></header><ol class="step20-print-list">${steps.map((step) => `<li>${safeHtml(step)}</li>`).join("")}</ol><p class="step20-print-footer">20. 列出完成這項工作所需的每一個步驟。</p></body></html>`);
    popup.document.close();
    popup.focus();
    window.setTimeout(() => popup.print(), 250);
    return popup;
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
    timerValue.tabIndex = record?.writing_timer_started_at ? -1 : 0;
    timerValue.title = record?.writing_timer_started_at ? "計時中" : "按此手動調整時間";
    timerCopy.append(timerLabel, timerValue);
    const startTimer = document.createElement("button");
    startTimer.type = "button";
    startTimer.className = "start-timer";
    startTimer.textContent = record?.writing_timer_started_at ? "計時中…" : "▶ 開始計時";
    startTimer.disabled = Boolean(record?.writing_timer_started_at);
    timerBar.append(timerCopy, startTimer);
    timerValue.addEventListener("click", () => editTaskTime(slot, form, buttons, timerValue));
    timerValue.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editTaskTime(slot, form, buttons, timerValue); }
    });
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
      const heading = document.createElement("span");
      heading.className = "question-heading";
      const label = document.createElement("b");
      label.textContent = `${index + 1}. ${question.text}`;
      const thinking = document.createElement("em");
      thinking.className = "thinking-time-pill";
      thinking.dataset.thinkingTimer = `${slot}:${index + 1}`;
      thinking.textContent = `思考 ${formatDuration(Number(record?.thinking_seconds?.[`q${index + 1}`]) || 0)}`;
      heading.append(label, thinking);
      const textarea = document.createElement("textarea");
      textarea.name = `q${index + 1}`;
      textarea.value = String(record?.answers?.[`q${index + 1}`] || "");
      textarea.maxLength = 5000;
      textarea.addEventListener("focus", () => startThinkingTimer(slot, index + 1, form, buttons, textarea, thinking, record));
      textarea.addEventListener("blur", () => stopThinkingTimer(textarea));
      field.append(heading, textarea);
      if (index === 19) {
        const exportStep = document.createElement("button");
        exportStep.type = "button";
        exportStep.className = "export-step20";
        exportStep.textContent = "匯出 Step 20 PDF";
        exportStep.addEventListener("click", async () => {
          try { printStep20(await saveTask(slot, form, buttons)); }
          catch (_) { /* saveTask already reports validation errors */ }
        });
        field.append(exportStep);
      }
      questionGrid.append(field);
    });
    const tagPicker = document.createElement("fieldset");
    tagPicker.className = "task-tag-picker";
    const tagLegend = document.createElement("legend");
    tagLegend.textContent = "Homework 標籤（可多選）";
    tagPicker.append(tagLegend);
    const selectedTags = new Set(record?.tag_keys || []);
    config.taskTags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.tagKey = tag.key;
      button.textContent = tag.label;
      button.setAttribute("aria-pressed", String(selectedTags.has(tag.key)));
      button.addEventListener("click", () => toggleTaskTag(slot, form, buttons, tag, button, selectedTags));
      tagPicker.append(button);
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
    form.append(timerBar, titleLabel, questionGrid, tagPicker, rating, actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveTask(slot, form, buttons)
        .then(() => loadDay("工作構思已永久儲存。"))
        .catch(() => {});
    });
    details.append(form);
  }

  async function startThinkingTimer(slot, questionNumber, form, buttons, textarea, timerNode, record) {
    if (state.thinking?.textarea === textarea) return;
    if (state.thinking) await stopThinkingTimer(state.thinking.textarea);
    const startedAt = Date.now();
    try {
      const saved = record?.id ? record : await saveTask(slot, form, buttons, { allowDefaultTitle: true, quiet: true });
      const current = state.active.get(slot) || record || saved;
      const baseSeconds = Math.max(0, Number(current?.thinking_seconds?.[`q${questionNumber}`]) || 0);
      state.thinking = { textarea, timerNode, taskId: saved.id, questionNumber, startedAt, baseSeconds, slot };
      textarea.closest(".question-field")?.classList.add("is-thinking");
      timerNode.textContent = `思考 ${formatDuration(baseSeconds)}`;
      // A quick click-away can occur while a new task is being saved. Record that
      // interval immediately instead of leaving a hidden timer running.
      if (document.activeElement !== textarea) await stopThinkingTimer(textarea);
    } catch (error) {
      showStatus(error?.message || "未能開始記錄思考時間。", "error");
    }
  }

  async function stopThinkingTimer(textarea) {
    const session = state.thinking;
    if (!session || session.textarea !== textarea) return;
    state.thinking = null;
    textarea.closest(".question-field")?.classList.remove("is-thinking");
    const elapsed = Math.max(1, Math.min(86400, Math.round((Date.now() - session.startedAt) / 1000)));
    session.timerNode.textContent = `思考 ${formatDuration(session.baseSeconds + elapsed)}`;
    try {
      const total = await rpc(config.plannerThinkingRecordRpc, {
        p_task_id: session.taskId, p_question_number: session.questionNumber,
        p_elapsed_seconds: elapsed, ...authParams()
      });
      session.timerNode.textContent = `思考 ${formatDuration(total)}`;
      const record = state.active.get(session.slot);
      if (record) {
        record.thinking_seconds = { ...(record.thinking_seconds || {}), [`q${session.questionNumber}`]: Number(total) || 0 };
      }
    } catch (error) {
      showStatus(error?.message || "未能儲存這段思考時間。", "error");
    }
  }

  function answersFromForm(form) {
    const answers = {};
    questions.forEach((_, index) => {
      const value = String(form.elements[`q${index + 1}`]?.value || "").trim();
      if (value) answers[`q${index + 1}`] = value;
    });
    return answers;
  }

  function syncTaskButtons(form, buttons, record) {
    buttons.forEach((button) => { button.disabled = false; });
    const running = Boolean(record?.writing_timer_started_at);
    const start = form.querySelector(".start-timer");
    const stop = form.querySelector(".stop-timer");
    const move = form.querySelector(".move-task");
    if (start) {
      start.disabled = running;
      start.textContent = running ? "計時中…" : "▶ 開始計時";
    }
    if (stop) stop.disabled = !running;
    if (move) move.disabled = state.date === MAX_DATE;
  }

  async function saveTask(slot, form, buttons, options = {}) {
    let title = String(form.elements.title.value || "").trim();
    if (!title && options.allowDefaultTitle) {
      title = `Task ${slot}`;
      form.elements.title.value = title;
    }
    if (!title) {
      form.elements.title.focus();
      if (!options.quiet) showStatus("請先填寫工作名稱。", "error");
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
      const previous = state.active.get(slot) || {};
      const merged = { ...previous, ...row, status: "active", thinking_seconds: previous.thinking_seconds || {} };
      state.active.set(slot, merged);
      return merged;
    } catch (error) {
      if (!options.quiet) showStatus(error?.message || "未能儲存工作，請稍後再試。", "error");
      throw error;
    } finally {
      syncTaskButtons(form, buttons, state.active.get(slot));
    }
  }

  async function changeTaskTimer(slot, form, buttons, action) {
    try {
      const saved = await saveTask(slot, form, buttons);
      buttons.forEach((button) => { button.disabled = true; });
      const rows = await rpc(config.plannerTaskTimerRpc, { p_task_id: saved.id, p_action: action, ...authParams() });
      const timer = Array.isArray(rows) ? rows[0] : null;
      if (!timer?.id) throw new Error("未能更新計時器");
      const merged = { ...(state.active.get(slot) || saved), ...timer };
      state.active.set(slot, merged);
      const timerNode = form.querySelector(`[data-task-timer="${slot}"]`);
      const startButton = form.querySelector(".start-timer");
      const stopButton = form.querySelector(".stop-timer");
      timerNode.textContent = formatDuration(effectiveElapsed(merged));
      timerNode.tabIndex = merged.writing_timer_started_at ? -1 : 0;
      timerNode.title = merged.writing_timer_started_at ? "計時中" : "按此手動調整時間";
      startButton.disabled = Boolean(merged.writing_timer_started_at);
      startButton.textContent = merged.writing_timer_started_at ? "計時中…" : "▶ 開始計時";
      stopButton.disabled = !merged.writing_timer_started_at;
      showStatus(action === "start" ? "工作報告計時已開始。" : `計時已停止：${formatDuration(timer.writing_elapsed_seconds)}。`);
    } catch (error) {
      if (error?.message !== "Task title is required") showStatus(error?.message || "未能更新計時器。", "error");
    } finally {
      syncTaskButtons(form, buttons, state.active.get(slot));
    }
  }

  async function editTaskTime(slot, form, buttons, timerNode) {
    const record = state.active.get(slot);
    if (record?.writing_timer_started_at || timerNode.querySelector("input")) return;
    try {
      const saved = await saveTask(slot, form, buttons);
      const input = document.createElement("input");
      input.className = "timer-edit-input";
      input.value = formatDuration(saved.writing_elapsed_seconds);
      input.setAttribute("aria-label", "手動調整工作報告撰寫時間，格式為時分秒");
      timerNode.textContent = "";
      timerNode.append(input);
      input.focus(); input.select();
      let finished = false;
      const finish = async (save) => {
        if (finished || !input.isConnected) return;
        const seconds = parseDuration(input.value);
        if (save && seconds === null) { showStatus("請以 HH:MM:SS 或 MM:SS 格式輸入時間。", "error"); input.focus(); return; }
        finished = true;
        if (save) {
          const total = await rpc(config.plannerTaskTimeSetRpc, { p_task_id: saved.id, p_elapsed_seconds: seconds, ...authParams() });
          const merged = { ...saved, writing_elapsed_seconds: Number(total) || 0, writing_timer_started_at: null };
          state.active.set(slot, merged); timerNode.textContent = formatDuration(total); refreshTimers(); showStatus("撰寫時間已手動更新。");
        } else timerNode.textContent = formatDuration(saved.writing_elapsed_seconds);
      };
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); finish(true).catch((error) => showStatus(error.message, "error")); }
        if (event.key === "Escape") { event.preventDefault(); finish(false); }
      });
      input.addEventListener("blur", () => finish(true).catch((error) => showStatus(error.message, "error")));
    } catch (_) { /* validation already reported */ }
  }

  async function toggleTaskTag(slot, form, buttons, tag, button, selected) {
    const wasSelected = selected.has(tag.key);
    try {
      const saved = await saveTask(slot, form, buttons);
      wasSelected ? selected.delete(tag.key) : selected.add(tag.key);
      const result = await rpc(config.plannerTaskTagsRpc, { p_task_id: saved.id, p_tag_keys: [...selected], ...authParams() });
      const record = { ...saved, tag_keys: Array.isArray(result) ? result : [...selected] };
      state.active.set(slot, record);
      button.setAttribute("aria-pressed", String(selected.has(tag.key)));
      applyTagEdges(form.closest(".task-card"), record.tag_keys);
      showStatus("工作標籤已更新。");
    } catch (error) {
      wasSelected ? selected.add(tag.key) : selected.delete(tag.key);
      showStatus(error?.message || "未能更新工作標籤。", "error");
    }
  }

  function applyTagEdges(card, keys = []) {
    card.dataset.tagged = String(Boolean(keys.length));
    if (keys.length) card.dataset.tagEdge = keys[0];
    else delete card.dataset.tagEdge;
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
    const occupied = [...state.active.keys()].sort((a, b) => (state.active.get(a)?.priority_order || a) - (state.active.get(b)?.priority_order || b));
    const empty = Array.from({ length: state.capacity }, (_, index) => index + 1).filter((slot) => !state.active.has(slot));
    [...occupied, ...empty].forEach((slot) => {
      const record = state.active.get(slot) || null;
      const details = document.createElement("details");
      details.className = "task-card";
      details.dataset.slot = String(slot);
      details.dataset.saved = String(Boolean(record));
      if (record) details.dataset.taskId = record.id;
      applyTagEdges(details, record?.tag_keys || []);
      details.append(makeSummary(slot, record));
      details.addEventListener("toggle", () => { if (details.open) buildTaskForm(slot, record, details); });
      elements.active.append(details);
    });
    updatePriorityMode();
  }

  function updatePriorityMode() {
    elements.active.dataset.prioritizing = String(state.priorityMode);
    elements.priorityToggle.setAttribute("aria-pressed", String(state.priorityMode));
    elements.priorityToggle.textContent = state.priorityMode ? "取消排列" : "⇅ Prioritization";
    elements.prioritySave.hidden = !state.priorityMode;
    elements.addTen.disabled = state.priorityMode || state.capacity >= 1000;
    elements.active.querySelectorAll(".task-card").forEach((card) => {
      const draggable = state.priorityMode && card.dataset.saved === "true";
      card.draggable = draggable;
      if (!draggable) return;
      card.open = false;
      card.addEventListener("dragstart", priorityDragStart);
      card.addEventListener("dragover", priorityDragOver);
      card.addEventListener("drop", priorityDrop);
      card.addEventListener("dragend", priorityDragEnd);
    });
  }

  function priorityDragStart(event) {
    event.currentTarget.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.taskId);
  }
  function priorityDragOver(event) {
    const target = event.currentTarget;
    if (!state.priorityMode || target.dataset.saved !== "true") return;
    event.preventDefault();
    const dragging = elements.active.querySelector(".is-dragging");
    if (!dragging || dragging === target) return;
    const bounds = target.getBoundingClientRect();
    elements.active.insertBefore(dragging, event.clientY < bounds.top + bounds.height / 2 ? target : target.nextSibling);
  }
  function priorityDrop(event) { event.preventDefault(); }
  function priorityDragEnd() { elements.active.querySelectorAll(".task-card").forEach((card) => card.classList.remove("is-dragging")); }

  async function savePriorities() {
    const ids = [...elements.active.querySelectorAll('.task-card[data-saved="true"]')].map((card) => card.dataset.taskId);
    elements.prioritySave.disabled = true;
    try {
      await rpc(config.plannerPrioritiesRpc, { p_task_date: state.date, p_task_ids: ids, ...authParams() });
      ids.forEach((id, index) => {
        const record = [...state.active.values()].find((item) => item.id === id);
        if (record) record.priority_order = index + 1;
      });
      state.priorityMode = false; updatePriorityMode(); showStatus("新的工作優先次序已儲存。");
    } catch (error) { showStatus(error?.message || "未能儲存優先次序。", "error"); }
    finally { elements.prioritySave.disabled = false; }
  }

  function renderDayPlanner() {
    elements.hourGrid.replaceChildren();
    for (let hour = 0; hour < 24; hour += 1) {
      const record = state.hourBlocks.get(hour) || { plan_text: "", task_slots: [] };
      const selected = new Set((record.task_slots || []).map(Number));
      const block = document.createElement("article");
      block.className = "hour-block";
      if (record.plan_text || selected.size) block.dataset.filled = "true";
      const time = document.createElement("time");
      time.textContent = `${String(hour).padStart(2, "0")}:00`;
      const content = document.createElement("div");
      content.className = "hour-content";
      const textarea = document.createElement("textarea");
      textarea.maxLength = 2000;
      textarea.rows = 2;
      textarea.placeholder = "寫下這個小時要做的事情…";
      textarea.value = record.plan_text || "";
      const tags = document.createElement("div");
      tags.className = "hour-tags";
      const tagLabel = document.createElement("span");
      tagLabel.textContent = "連結工作";
      const tagList = document.createElement("div");
      tagList.className = "hour-tag-list";
      for (let slot = 1; slot <= state.capacity; slot += 1) {
        const tag = document.createElement("button");
        tag.type = "button";
        tag.textContent = String(slot);
        tag.title = state.active.get(slot)?.title || `Task ${slot}`;
        tag.setAttribute("aria-label", `連結 Task ${slot}`);
        tag.setAttribute("aria-pressed", String(selected.has(slot)));
        tag.addEventListener("click", () => {
          selected.has(slot) ? selected.delete(slot) : selected.add(slot);
          tag.setAttribute("aria-pressed", String(selected.has(slot)));
          block.dataset.filled = String(Boolean(textarea.value.trim() || selected.size));
          queueHourSave(state.date, hour, textarea.value, selected, 0);
        });
        tagList.append(tag);
      }
      tags.append(tagLabel, tagList);
      textarea.addEventListener("input", () => {
        block.dataset.filled = String(Boolean(textarea.value.trim() || selected.size));
        queueHourSave(state.date, hour, textarea.value, selected, 700);
      });
      textarea.addEventListener("blur", () => queueHourSave(state.date, hour, textarea.value, selected, 0));
      content.append(textarea, tags);
      block.append(time, content);
      elements.hourGrid.append(block);
    }
  }

  function queueHourSave(date, hour, text, selected, delay) {
    const slots = [...selected].sort((a, b) => a - b);
    if (date === state.date) state.hourBlocks.set(hour, { plan_text: text, task_slots: slots });
    const key = `${date}:${hour}`;
    window.clearTimeout(state.hourSaveTimers.get(key));
    state.hourSaveTimers.set(key, window.setTimeout(async () => {
      state.hourSaveTimers.delete(key);
      try {
        await rpc(config.plannerHourBlockSaveRpc, {
          p_task_date: date, p_hour_number: hour, p_plan_text: text,
          p_task_slots: slots, ...authParams()
        });
      } catch (error) {
        showStatus(error?.message || `未能儲存 ${String(hour).padStart(2, "0")}:00 的安排。`, "error");
      }
    }, delay));
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
      applyTagEdges(details, record.tag_keys || []);
      const summary = document.createElement("summary");
      const title = document.createElement("strong");
      title.textContent = record.title;
      const meta = document.createElement("small");
      const thinkingTotal = Object.values(record.thinking_seconds || {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
      meta.textContent = `Task ${record.slot_number} · 撰寫 ${formatDuration(record.writing_elapsed_seconds)} · 思考 ${formatDuration(thinkingTotal)} · ${record.difficulty_rating ? `${record.difficulty_rating} 星難度` : "未評難度"} · 完成於 ${formatTimestamp(record.completed_at)}`;
      summary.append(title, meta);
      const content = document.createElement("div");
      content.className = "archive-content";
      if (record.tag_keys?.length) {
        const tags = document.createElement("div");
        tags.className = "archive-tags";
        record.tag_keys.forEach((key) => {
          const tag = config.taskTags.find((item) => item.key === key);
          if (!tag) return;
          const chip = document.createElement("span");
          chip.textContent = tag.label;
          chip.dataset.tagKey = tag.key;
          tags.append(chip);
        });
        content.append(tags);
      }
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
      const [capacity, activeRows, archivedRows, hourRows, daySummary] = await Promise.all([
        rpc(config.plannerCapacityRpc, params),
        rpc(config.plannerTasksLoadRpc, { ...params, p_status: "active" }),
        rpc(config.plannerTasksLoadRpc, { ...params, p_status: "archived" }),
        rpc(config.plannerHourBlocksLoadRpc, params),
        rpc(config.plannerDaySummaryRpc, params)
      ]);
      state.capacity = Math.max(10, Math.min(1000, Number(capacity) || 10));
      state.active = new Map((Array.isArray(activeRows) ? activeRows : []).map((row) => [Number(row.slot_number), row]));
      state.archived = Array.isArray(archivedRows) ? archivedRows : [];
      state.hourBlocks = new Map((Array.isArray(hourRows) ? hourRows : []).map((row) => [Number(row.hour_number), row]));
      state.daySummary = daySummary || {};
      elements.capacity.textContent = String(state.capacity);
      elements.completionRate.textContent = `${Number(state.daySummary.completion_rate || 0).toFixed(Number(state.daySummary.completion_rate || 0) % 1 ? 1 : 0)}%`;
      elements.completionCopy.textContent = `${Number(state.daySummary.completed_tasks || 0)} / ${Number(state.daySummary.created_tasks || 0)} 完成`;
      renderActive();
      renderArchive();
      renderDayPlanner();
      refreshTimers();
      setConnection("已安全連接", "online");
      if (successMessage) showStatus(successMessage);
      if (!options.focusSlot && state.requestedTask) {
        const requested = [...state.active.values()].find((row) => String(row.id) === state.requestedTask);
        if (requested) options = { ...options, focusSlot: Number(requested.slot_number), openSlot: Number(requested.slot_number) };
        state.requestedTask = "";
      }
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
      elements.addTen.disabled = state.priorityMode || state.capacity >= 1000;
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
      renderDayPlanner();
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
  elements.priorityToggle.addEventListener("click", () => { state.priorityMode = !state.priorityMode; renderActive(); });
  elements.prioritySave.addEventListener("click", savePriorities);

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
