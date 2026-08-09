(function initialiseEdmundSystemNavigation() {
  "use strict";

  const UNIVERSAL_SESSION_KEY = "edmund-universal-student-session-v1";
  const SYSTEMS = Object.freeze([
    { id: "progress", href: "student-progress.html", zh: "全面英文能力發展進度表", en: "Student Progress" },
    { id: "flashcards", href: "flashcards.html", zh: "Flashcard 學習卡", en: "Flashcard System" },
    { id: "writing", href: "writing-practice.html", zh: "英文寫作練習", en: "Writing Practice" },
    { id: "writing-submission", href: "writing-submission.html", zh: "Edmund Sir Writing 交文", en: "Writing Submission" },
    { id: "speaking", href: "speaking-system.html", zh: "Speaking 說話練習", en: "Speaking System" },
    { id: "sentence", href: "sentence-structure.html", zh: "句子結構", en: "Sentence Structure" },
    { id: "idioms", href: "idiom-system.html", zh: "英文慣用語", en: "Idiom Learning" },
    { id: "proverbs", href: "proverb-system.html", zh: "(學生使用) 諺語", en: "學生使用系統" },
    { id: "phrasal-verbs", href: "phrasal-verb-system.html", zh: "Phrasal Verb 動詞片語", en: "學習系統" },
    { id: "dse-paper3-analysis", href: "dse-paper3-analysis.html", zh: "DSE 卷3 綜合能力分析", en: "Integrated Skills Analysis" },
    { id: "schedule", href: "schedule-system.html", zh: "功課及溫習安排", en: "Study Schedule" },
    { id: "downloads", href: "model-essay-downloads.html", zh: "教材下載區", en: "Downloads" },
    { id: "common-expression-speaking", href: "common-expression-speaking.html", zh: "Common Expression 常用語", en: "會話 Speaking" },
    { id: "common-expression-written", href: "common-expression-written.html", zh: "Common Expression 常用語", en: "專業寫作 Written" },
    { id: "common-expression-rhetorical-speaking", href: "common-expression-rhetorical-speaking.html", zh: "Common Expression 常用語", en: "修辭會話 Rhetorical Speaking" },
    { id: "common-expression-rhetorical-writing", href: "common-expression-rhetorical-writing.html", zh: "Common Expression 常用語", en: "修辭寫作 Rhetorical Writing" },
    { id: "common-expression-professional-message", href: "common-expression-professional-message.html", zh: "Common Expression 常用語", en: "商業溝通 Professional Message" },
    { id: "common-expression-business-speaking", href: "common-expression-business-speaking.html", zh: "Common Expression 常用語", en: "商務會話 Business Speaking" }
  ]);

  const SESSION_KEYS = Object.freeze({
    progress: "edmund-student-progress-session-v1",
    flashcards: "edmundFlashcardSession",
    "writing-submission": "edmund-writing-submission-session-v1",
    speaking: "edmundSpeakingSessionV1",
    sentence: "edmund-sentence-structure-session-v1",
    idioms: "edmund-idiom-system-session-v1",
    proverbs: "edmund-proverb-system-session-v1",
    "phrasal-verbs": "edmund-phrasal-verb-system-session-v1",
    "dse-paper3-analysis": "edmund-dse-paper3-analysis-session-v1",
    "common-expression-speaking": "edmund-common-expression-speaking-session-v1",
    "common-expression-written": "edmund-common-expression-written-session-v1",
    "common-expression-rhetorical-speaking": "edmund-common-expression-rhetorical-speaking-session-v1",
    "common-expression-rhetorical-writing": "edmund-common-expression-rhetorical-writing-session-v1",
    "common-expression-professional-message": "edmund-common-expression-professional-message-session-v1",
    "common-expression-business-speaking": "edmund-common-expression-business-speaking-session-v1",
    schedule: "edmund-schedule-session-v1",
    downloads: "edmundModelEssayDownloadSession"
  });

  function storageJson(storage, key) {
    try {
      return JSON.parse(storage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeStorageJson(storage, key, value, overwrite = false) {
    try {
      if (!overwrite && storage.getItem(key)) return false;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function writeStudentSession(storage, key, value, overwrite = false) {
    const existing = storageJson(storage, key);
    if (existing?.role === "admin" || existing?.impersonatedByAdmin === true) return false;
    return writeStorageJson(storage, key, value, overwrite || existing?.role === "student");
  }

  function removeStudentSession(storage, key) {
    try {
      const existing = storageJson(storage, key);
      if (existing?.role === "student" && existing?.impersonatedByAdmin !== true) storage.removeItem(key);
    } catch {
      // Session cleanup is best-effort when storage is unavailable.
    }
  }

  function studentSessionCandidate() {
    let storage;
    try { storage = window.sessionStorage; } catch { return null; }
    const activeSystem = document.querySelector("[data-edmund-system-switcher]")?.dataset.system || "";
    const candidates = {
      progress() {
        const value = storageJson(storage, SESSION_KEYS.progress);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      flashcards() {
        const value = storageJson(storage, SESSION_KEYS.flashcards);
        if (value?.role !== "student" || value.impersonatedByAdmin === true || !value.sessionToken || !value.name) return null;
        return {
          token: String(value.sessionToken), id: String(value.id || ""), name: String(value.name), role: "student"
        };
      },
      "writing-submission"() {
        const value = storageJson(storage, SESSION_KEYS["writing-submission"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      speaking() {
        const value = storageJson(storage, SESSION_KEYS.speaking);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      sentence() {
        const value = storageJson(storage, SESSION_KEYS.sentence);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      idioms() {
        const value = storageJson(storage, SESSION_KEYS.idioms);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      proverbs() {
        const value = storageJson(storage, SESSION_KEYS.proverbs);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "phrasal-verbs"() {
        const value = storageJson(storage, SESSION_KEYS["phrasal-verbs"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "dse-paper3-analysis"() {
        const value = storageJson(storage, SESSION_KEYS["dse-paper3-analysis"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "common-expression-speaking"() {
        return commonExpressionSession("common-expression-speaking");
      },
      "common-expression-written"() {
        return commonExpressionSession("common-expression-written");
      },
      "common-expression-rhetorical-speaking"() {
        return commonExpressionSession("common-expression-rhetorical-speaking");
      },
      "common-expression-rhetorical-writing"() {
        return commonExpressionSession("common-expression-rhetorical-writing");
      },
      "common-expression-professional-message"() {
        return commonExpressionSession("common-expression-professional-message");
      },
      "common-expression-business-speaking"() {
        return commonExpressionSession("common-expression-business-speaking");
      },
      schedule() {
        const value = storageJson(storage, SESSION_KEYS.schedule);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.studentToken && value.name
          ? { token: String(value.studentToken), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      downloads() {
        const value = storageJson(storage, SESSION_KEYS.downloads);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.sessionToken && value.name
          ? { token: String(value.sessionToken), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      }
    };

    function commonExpressionSession(systemId) {
      const value = storageJson(storage, SESSION_KEYS[systemId]);
      return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
        ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
        : null;
    }

    const universal = storageJson(storage, UNIVERSAL_SESSION_KEY);
    if (universal?.role === "student" && universal.token && universal.name) return universal;
    const active = candidates[activeSystem]?.();
    if (active) return active;
    return candidates.progress()
      || candidates.flashcards()
      || candidates["writing-submission"]()
      || candidates.speaking()
      || candidates.sentence()
      || candidates.idioms()
      || candidates.proverbs()
      || candidates["phrasal-verbs"]()
      || candidates["dse-paper3-analysis"]()
      || candidates.schedule()
      || candidates.downloads()
      || candidates["common-expression-speaking"]()
      || candidates["common-expression-written"]()
      || candidates["common-expression-rhetorical-speaking"]()
      || candidates["common-expression-rhetorical-writing"]()
      || candidates["common-expression-professional-message"]()
      || candidates["common-expression-business-speaking"]()
      || null;
  }

  function rememberStudentSession(value) {
    if (!value || value.role !== "student" || value.impersonatedByAdmin === true || !value.token || !value.name) return false;
    let storage;
    try { storage = window.sessionStorage; } catch { return false; }
    const previous = storageJson(storage, UNIVERSAL_SESSION_KEY);
    const normalized = {
      token: String(value.token),
      id: String(value.id || previous?.id || ""),
      name: String(value.name),
      role: "student"
    };
    writeStorageJson(storage, UNIVERSAL_SESSION_KEY, normalized, true);
    bridgeStudentSession(normalized, true);
    return true;
  }

  function forgetStudentSession() {
    try {
      Object.values(SESSION_KEYS).forEach(key => removeStudentSession(window.sessionStorage, key));
      window.sessionStorage.removeItem(UNIVERSAL_SESSION_KEY);
    } catch {
      // The active app still clears its in-memory authentication state.
    }
    try {
      removeStudentSession(window.localStorage, "edmundWritingSession");
    } catch {
      // Writing Practice will also clear its own session during logout.
    }
  }

  function bridgeStudentSession(candidate = studentSessionCandidate(), overwrite = false) {
    if (!candidate?.token || !candidate?.name || candidate.role !== "student") return false;
    let storage;
    try { storage = window.sessionStorage; } catch { return false; }

    const universal = {
      token: String(candidate.token),
      id: String(candidate.id || ""),
      name: String(candidate.name),
      role: "student"
    };
    writeStorageJson(storage, UNIVERSAL_SESSION_KEY, universal, true);

    writeStudentSession(storage, SESSION_KEYS.progress, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);

    if (overwrite) {
      try {
        const writing = storageJson(window.localStorage, "edmundWritingSession");
        if (writing?.role === "student" && writing.impersonatedByAdmin !== true && writing.name !== universal.name) {
          window.localStorage.removeItem("edmundWritingSession");
        }
      } catch {
        // Writing Practice can still perform its token exchange on next entry.
      }
    }

    writeStudentSession(storage, SESSION_KEYS["writing-submission"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.speaking, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.sentence, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.idioms, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.proverbs, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS["phrasal-verbs"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS["dse-paper3-analysis"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    [
      "common-expression-speaking",
      "common-expression-written",
      "common-expression-rhetorical-speaking",
      "common-expression-rhetorical-writing",
      "common-expression-professional-message",
      "common-expression-business-speaking"
    ].forEach(systemId => {
      writeStudentSession(storage, SESSION_KEYS[systemId], {
        token: universal.token,
        id: universal.id,
        name: universal.name,
        role: "student"
      }, overwrite);
    });
    writeStudentSession(storage, SESSION_KEYS.schedule, {
      role: "student",
      id: universal.id,
      name: universal.name,
      studentToken: universal.token
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.downloads, {
      role: "student",
      id: universal.id,
      name: universal.name,
      sessionToken: universal.token,
      access: {}
    }, overwrite);

    // Flashcard permissions are never trusted from browser storage. Flashcards
    // validates this token through its canonical profile RPC before restoring.
    return true;
  }

  function menuHtml(currentSystem) {
    const links = SYSTEMS.map(system => {
      const current = system.id === currentSystem;
      return `<a class="edmund-system-switcher__link" href="${system.href}"${current ? ' aria-current="page"' : ""}>
        <strong>${system.zh}</strong><small>${system.en}</small>
      </a>`;
    }).join("");
    return `<nav class="edmund-system-switcher__menu" aria-label="EdmundEducation 系統快速切換">
      <div class="edmund-system-switcher__menu-heading"><strong>快速切換系統</strong><span>Quick switch</span></div>
      <div class="edmund-system-switcher__links">${links}</div>
      <a class="edmund-system-switcher__home" href="index.html">返回 EdmundEducation 首頁</a>
    </nav>`;
  }

  function closeSwitcher(switcher, returnFocus = false) {
    window.clearTimeout(Number(switcher.dataset.closeTimer || 0));
    switcher.dataset.open = "false";
    switcher.dataset.pinned = "false";
    const trigger = switcher.querySelector("[data-system-switcher-trigger]");
    trigger?.setAttribute("aria-expanded", "false");
    if (returnFocus && trigger) {
      switcher.dataset.suppressFocusOpen = "true";
      trigger.focus();
      window.setTimeout(() => { switcher.dataset.suppressFocusOpen = "false"; }, 0);
    }
  }

  function openSwitcher(switcher, { pinned = false } = {}) {
    window.clearTimeout(Number(switcher.dataset.closeTimer || 0));
    switcher.dataset.open = "true";
    if (pinned) switcher.dataset.pinned = "true";
    switcher.querySelector("[data-system-switcher-trigger]")?.setAttribute("aria-expanded", "true");
  }

  function scheduleClose(switcher) {
    window.clearTimeout(Number(switcher.dataset.closeTimer || 0));
    const timer = window.setTimeout(() => {
      if (switcher.dataset.pinned === "true") return;
      if (!switcher.matches(":hover") && !switcher.contains(document.activeElement)) closeSwitcher(switcher);
    }, 110);
    switcher.dataset.closeTimer = String(timer);
  }

  function enhanceSwitcher(switcher, index) {
    const currentSystem = String(switcher.dataset.system || "");
    const trigger = switcher.querySelector("[data-system-switcher-trigger]");
    if (!trigger || !SYSTEMS.some(system => system.id === currentSystem)) return;
    const menuId = `edmund-system-menu-${index + 1}`;
    switcher.insertAdjacentHTML("beforeend", menuHtml(currentSystem));
    const menu = switcher.querySelector(".edmund-system-switcher__menu");
    menu.id = menuId;
    trigger.setAttribute("aria-controls", menuId);
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    switcher.dataset.open = "false";
    switcher.dataset.pinned = "false";

    trigger.addEventListener("click", () => {
      if (switcher.dataset.pinned === "true") closeSwitcher(switcher);
      else openSwitcher(switcher, { pinned: true });
    });
    switcher.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") openSwitcher(switcher);
    });
    switcher.addEventListener("pointerleave", event => {
      if (event.pointerType === "mouse") scheduleClose(switcher);
    });
    switcher.addEventListener("focusin", () => {
      if (switcher.dataset.suppressFocusOpen !== "true") openSwitcher(switcher);
    });
    switcher.addEventListener("focusout", () => scheduleClose(switcher));
    switcher.querySelectorAll("a[href]").forEach(link => {
      link.addEventListener("click", () => bridgeStudentSession(studentSessionCandidate(), true));
    });
  }

  function initialise() {
    bridgeStudentSession(studentSessionCandidate(), true);
    const switchers = [...document.querySelectorAll("[data-edmund-system-switcher]")];
    switchers.forEach(enhanceSwitcher);

    document.addEventListener("pointerdown", event => {
      switchers.forEach(switcher => {
        if (!switcher.contains(event.target)) closeSwitcher(switcher);
      });
    });
    document.addEventListener("focusin", event => {
      switchers.forEach(switcher => {
        if (!switcher.contains(event.target)) closeSwitcher(switcher);
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const open = switchers.find(switcher => switcher.dataset.open === "true");
      if (open) {
        event.preventDefault();
        closeSwitcher(open, true);
      }
    });
  }

  window.EdmundSystemNav = Object.freeze({
    bridgeStudentSession,
    forgetStudentSession,
    getStudentSession: studentSessionCandidate,
    rememberStudentSession,
    systems: SYSTEMS
  });

  // Run the session bridge synchronously so app scripts later in the document
  // can restore a compatible same-origin student session immediately.
  bridgeStudentSession(studentSessionCandidate(), true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();
})();
