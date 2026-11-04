(() => {
  "use strict";

  const config = window.EDMUND_SUPABASE;
  const i18n = window.ChipCourseI18n;
  const storageKey = "edmund-chip-course-admin-session-v1";
  const loginScreen = document.getElementById("login-screen");
  const lessonScreen = document.getElementById("lesson-screen");
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const loginMessage = document.getElementById("login-message");
  let lessonContent = null;
  let messageKey = "";

  function message(key = "") {
    messageKey = key;
    loginMessage.textContent = key ? i18n.t(key) : "";
  }
  function put(id, value) { document.getElementById(id).textContent = value || ""; }

  async function rpc(name, body) {
    if (!config?.url || !config?.anonKey) throw new Error("connectionUnavailable");
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error("connectionFailed");
    return response.json();
  }

  function showLogin(key = "") {
    loginScreen.hidden = false;
    lessonScreen.hidden = true;
    lessonContent = null;
    for (const id of [
      "lesson-title", "lesson-intro", "lesson-boundary", "design-explanation",
      "test-explanation", "test-code", "run-command", "expected-result", "clock-note"
    ]) put(id, "");
    document.getElementById("lesson-rules").replaceChildren();
    document.getElementById("lesson-terms").replaceChildren();
    window.ChipCourseLab.clear();
    message(key);
  }

  function list(id, values, brackets = false) {
    const root = document.getElementById(id);
    root.replaceChildren();
    for (const value of values || []) {
      const item = document.createElement("li");
      item.textContent = brackets ? `[${value.term}; ${value.meaning}]` : value;
      root.append(item);
    }
  }

  function renderLessonText() {
    if (!lessonContent) return;
    const lesson = i18n.getLanguage() === "zh-Hant"
      ? { ...lessonContent, ...(lessonContent.translations?.zh_Hant || {}) }
      : lessonContent;
    put("lesson-title", lesson.title);
    put("lesson-intro", lesson.intro);
    put("lesson-boundary", lesson.boundary);
    put("design-explanation", lesson.design_explanation);
    put("test-explanation", lesson.test_explanation);
    put("test-code", lesson.test_code);
    put("run-command", lesson.run_command);
    put("expected-result", lesson.expected_result);
    put("clock-note", lesson.clock_note);
    list("lesson-rules", lesson.rules);
    list("lesson-terms", lesson.terms, true);
  }

  function renderLesson(lesson) {
    lessonContent = lesson;
    renderLessonText();
    window.ChipCourseLab.load(lesson.design_code);
    loginScreen.hidden = true;
    lessonScreen.hidden = false;
    message("");
  }

  async function openLesson(token) {
    const who = await rpc("chip_course_admin_me", { p_admin_token: token });
    if (!Array.isArray(who) || !who.length) throw new Error("sessionEnded");
    const rows = await rpc("chip_course_get_lesson", { p_admin_token: token, p_slug: "led-blinker" });
    if (!Array.isArray(rows) || !rows.length) throw new Error("lessonUnavailable");
    renderLesson(rows[0].content);
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginButton.disabled = true;
    message("");
    const username = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password");
    const password = passwordInput.value;
    passwordInput.value = "";
    try {
      const rows = await rpc("chip_course_admin_login", { p_username: username, p_password: password });
      if (!Array.isArray(rows) || !rows.length) {
        throw new Error("signInFailed");
      }
      const token = rows[0].admin_token;
      sessionStorage.setItem(storageKey, token);
      await openLesson(token);
    } catch (error) {
      sessionStorage.removeItem(storageKey);
      showLogin(i18n.t(error.message) ? error.message : "connectionFailed");
    } finally {
      loginButton.disabled = false;
    }
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    const token = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
    showLogin("signedOut");
    if (token) {
      try { await rpc("chip_course_admin_logout", { p_admin_token: token }); } catch { /* Local sign-out still works. */ }
    }
  });

  document.addEventListener("chip-course-language-change", () => {
    renderLessonText();
    if (messageKey) message(messageKey);
  });

  const savedToken = sessionStorage.getItem(storageKey);
  if (savedToken) {
    openLesson(savedToken).catch(error => {
      sessionStorage.removeItem(storageKey);
      showLogin(i18n.t(error.message) ? error.message : "connectionFailed");
    });
  }
})();
