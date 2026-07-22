(function initialiseEdmundSystemNavigation() {
  "use strict";

  const UNIVERSAL_SESSION_KEY = "edmund-universal-student-session-v1";
  const SYSTEMS = Object.freeze([
    { id: "flashcards", href: "flashcards.html", zh: "Flashcard 學習卡", en: "Flashcard System" },
    { id: "writing", href: "writing-practice.html", zh: "英文寫作練習", en: "Writing Practice" },
    { id: "speaking", href: "speaking-system.html", zh: "Speaking 說話練習", en: "Speaking System" },
    { id: "sentence", href: "sentence-structure.html", zh: "句子結構", en: "Sentence Structure" },
    { id: "schedule", href: "schedule-system.html", zh: "功課及溫習安排", en: "Study Schedule" },
    { id: "downloads", href: "model-essay-downloads.html", zh: "教材下載區", en: "Downloads" }
  ]);

  const SESSION_KEYS = Object.freeze({
    flashcards: "edmundFlashcardSession",
    speaking: "edmundSpeakingSessionV1",
    sentence: "edmund-sentence-structure-session-v1",
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
      flashcards() {
        const value = storageJson(storage, SESSION_KEYS.flashcards);
        if (value?.role !== "student" || value.impersonatedByAdmin === true || !value.sessionToken || !value.name) return null;
        return {
          token: String(value.sessionToken), id: String(value.id || ""), name: String(value.name), role: "student"
        };
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

    const universal = storageJson(storage, UNIVERSAL_SESSION_KEY);
    if (universal?.role === "student" && universal.token && universal.name) return universal;
    const active = candidates[activeSystem]?.();
    if (active) return active;
    return candidates.flashcards() || candidates.speaking() || candidates.sentence() || candidates.schedule() || candidates.downloads() || null;
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
