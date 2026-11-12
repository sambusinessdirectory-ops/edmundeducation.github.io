(() => {
  "use strict";

  const reader = document.querySelector("[data-reader]");
  if (!reader) return;

  const root = document.documentElement;
  const readerId = reader.dataset.reader;
  const storageKey = `edmund-paper3-${readerId}-v2`;
  const legacyStorageKey = `edmund-paper3-${readerId}-v1`;
  const translationKey = "edmund-paper3-translations-v1";
  const pages = [...document.querySelectorAll(".page[data-kind]")];
  const navLinks = [...document.querySelectorAll(".page-nav a")];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const translationToggle = document.querySelector("[data-translation-toggle]");
  const printButton = document.querySelector("[data-print]");
  const resetButton = document.querySelector("[data-reset]");
  const mobileJump = document.querySelector("[data-mobile-jump]");
  const progress = document.querySelector("progress[data-progress]");
  const progressText = document.querySelector("[data-progress-text]");
  const filterStatus = document.querySelector("[data-filter-status]");
  const saveStatus = document.querySelector("[data-save-status]");
  const saveFields = [...document.querySelectorAll("[data-save]")];
  let currentFilter = "all";
  let saveTimer = 0;

  const emptyState = () => ({ version: 2, values: {}, read: {} });

  function safeParse(value) {
    try {
      const parsed = value ? JSON.parse(value) : null;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function readStoredState() {
    try {
      const current = safeParse(localStorage.getItem(storageKey));
      if (current) return { ...emptyState(), ...current, version: 2 };
      const legacy = safeParse(localStorage.getItem(legacyStorageKey));
      if (legacy) return { ...emptyState(), ...legacy, version: 2 };
    } catch {
      return emptyState();
    }
    return emptyState();
  }

  let state = readStoredState();

  function announceSave(message) {
    if (saveStatus) saveStatus.textContent = message;
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      localStorage.removeItem(legacyStorageKey);
      announceSave("已儲存在此瀏覽器");
    } catch {
      announceSave("此瀏覽器未能儲存");
    }
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    announceSave("儲存中…");
    saveTimer = window.setTimeout(persist, 220);
  }

  function fieldKey(field) {
    return field.dataset.save || field.id || field.name || "";
  }

  function updateProgress() {
    const readChecks = saveFields.filter((field) => field.matches("[data-read-page]"));
    const count = readChecks.filter((field) => field.checked).length;
    if (progress) {
      progress.max = readChecks.length;
      progress.value = count;
      progress.textContent = `${count} / ${readChecks.length}`;
    }
    if (progressText) progressText.textContent = `${count} / ${readChecks.length}`;
  }

  saveFields.forEach((field) => {
    const key = fieldKey(field);
    if (!key) return;
    if (field.matches('[type="checkbox"]')) {
      field.checked = Boolean(state.read[key]);
      field.addEventListener("change", () => {
        state.read[key] = field.checked;
        updateProgress();
        persist();
      });
      return;
    }
    field.value = typeof state.values[key] === "string" ? state.values[key] : "";
    field.addEventListener("input", () => {
      state.values[key] = field.value;
      scheduleSave();
    });
  });

  function setTranslations(visible) {
    root.classList.toggle("hide-translation", !visible);
    if (translationToggle) {
      translationToggle.checked = visible;
      translationToggle.setAttribute("aria-checked", String(visible));
    }
    try {
      localStorage.setItem(translationKey, JSON.stringify(visible));
    } catch {
      // Translation visibility remains functional for this session.
    }
  }

  let translationsVisible = true;
  try {
    const stored = localStorage.getItem(translationKey);
    if (stored !== null) translationsVisible = JSON.parse(stored) !== false;
  } catch {
    translationsVisible = true;
  }
  setTranslations(translationsVisible);
  translationToggle?.addEventListener("change", () => setTranslations(translationToggle.checked));

  function pageMatches(page, filter) {
    if (filter === "all") return true;
    const tags = new Set([page.dataset.kind, ...(page.dataset.tags || "").split(/\s+/)].filter(Boolean));
    return tags.has(filter);
  }

  function applyFilter(filter, { announce = true } = {}) {
    currentFilter = filter;
    let visibleCount = 0;
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
    pages.forEach((page) => {
      const visible = pageMatches(page, filter);
      page.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (filterStatus && announce) filterStatus.textContent = `顯示 ${visibleCount} / ${pages.length} 頁`;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter || "all"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => applyFilter("all"));
  });

  mobileJump?.addEventListener("change", () => {
    if (!mobileJump.value) return;
    applyFilter("all");
    document.querySelector(mobileJump.value)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting && !entry.target.hidden)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        link.toggleAttribute("aria-current", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, { rootMargin: "-18% 0px -65%", threshold: [0, 0.2, 0.5] });
    pages.forEach((page) => observer.observe(page));
  }

  printButton?.addEventListener("click", () => {
    persist();
    window.print();
  });

  let filterBeforePrint = "all";
  window.addEventListener("beforeprint", () => {
    filterBeforePrint = currentFilter;
    applyFilter("all", { announce: false });
    persist();
  });
  window.addEventListener("afterprint", () => applyFilter(filterBeforePrint));

  resetButton?.addEventListener("click", () => {
    const confirmed = window.confirm("只重設這份讀本的已讀進度和筆記？此動作不能復原。");
    if (!confirmed) return;
    state = emptyState();
    window.clearTimeout(saveTimer);
    saveFields.forEach((field) => {
      if (field.matches('[type="checkbox"]')) field.checked = false;
      else field.value = "";
    });
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(legacyStorageKey);
    } catch {
      // The visible reset still succeeds when storage is unavailable.
    }
    updateProgress();
    announceSave("本頁筆記及進度已重設");
  });

  window.addEventListener("pagehide", persist);
  updateProgress();
  applyFilter("all");
  announceSave("筆記已載入");
})();
