(function initialiseStudentActivityLog() {
  "use strict";
  const PAGE_SIZE = 100;
  const labels = {
    home: "EdmundEducation 主頁", flashcards: "Flashcard 學習系統", writing: "Writing 寫作練習",
    reading: "Reading 閱讀理解", schedule: "功課及溫習安排", speaking: "Speaking 口語練習",
    listening: "Listening 聆聽練習", music: "背景音樂", "professional-english": "Professional English",
    "excellent-learning": "English Accent Learning System", "english-accent-learning": "English Accent Learning System"
  };
  let offset = 0;
  let loading = false;

  function session() {
    try { return JSON.parse(sessionStorage.getItem("edmund-schedule-session-v1") || "null"); } catch { return null; }
  }

  async function rpc(name, body) {
    const config = window.EDMUND_SUPABASE;
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: "POST", cache: "no-store", credentials: "omit",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "未能載入學生登入紀錄。");
    return payload;
  }

  function rowMarkup(row) {
    const date = new Date(row.visited_at);
    const time = Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("zh-HK", { dateStyle: "medium", timeStyle: "medium" });
    return `<article class="student-activity-log-row"><strong>${escapeHtml(row.student_name || "Unknown")}</strong><span>${escapeHtml(labels[row.system_id] || row.system_id)}</span><time datetime="${escapeHtml(row.visited_at)}">${escapeHtml(time)}</time></article>`;
  }

  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }

  async function load(reset = true) {
    const saved = session();
    const list = document.querySelector("[data-student-activity-list]");
    const status = document.querySelector("[data-student-activity-status]");
    if (!saved?.adminToken || !list || loading) return;
    loading = true;
    if (reset) { offset = 0; list.innerHTML = '<p class="empty-state">正在載入學生登入紀錄…</p>'; }
    try {
      const payload = await rpc("schedule_admin_list_student_activity", { p_admin_token: saved.adminToken, p_limit: PAGE_SIZE, p_offset: offset });
      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      if (reset) list.innerHTML = "";
      list.insertAdjacentHTML("beforeend", rows.map(rowMarkup).join(""));
      offset += rows.length;
      if (!list.children.length) list.innerHTML = '<p class="empty-state">尚未有學生登入紀錄。</p>';
      status.textContent = `顯示 ${Math.min(offset, Number(payload.total) || offset)} / ${Number(payload.total) || 0} 項登入紀錄`;
      document.querySelector("[data-student-activity-more]").hidden = offset >= Number(payload.total || 0);
    } catch (error) {
      status.textContent = error.message;
    } finally { loading = false; }
  }

  document.addEventListener("click", event => {
    if (event.target.closest("[data-student-activity-refresh]")) void load(true);
    if (event.target.closest("[data-student-activity-more]")) void load(false);
    if (event.target.closest("[data-admin-students]")) setTimeout(() => void load(true), 200);
  });
  const observer = new MutationObserver(() => {
    const view = document.querySelector('[data-view="admin"]');
    if (view && !view.hidden && !view.dataset.activityLoaded) { view.dataset.activityLoaded = "true"; void load(true); }
    if (view?.hidden) delete view.dataset.activityLoaded;
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["hidden"] });
})();
