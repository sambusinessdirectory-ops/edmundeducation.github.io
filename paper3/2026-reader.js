(() => {
  const root = document.documentElement;
  const reader = document.querySelector("[data-reader]");
  if (!reader) return;

  const readerId = reader.dataset.reader;
  const storageKey = `edmund-paper3-${readerId}-v1`;
  const translationKey = "edmund-paper3-translations-v1";
  const pages = [...document.querySelectorAll(".page[data-kind]")];
  const navLinks = [...document.querySelectorAll(".page-nav a")];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const translationToggle = document.querySelector("[data-translation-toggle]");
  const printButton = document.querySelector("[data-print]");
  const mobileJump = document.querySelector("[data-mobile-jump]");
  const progress = document.querySelector("progress[data-progress]");
  const progressText = document.querySelector("[data-progress-text]");
  let state = { values: {}, read: {} };

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  }

  try {
    state = { ...state, ...safeParse(localStorage.getItem(storageKey), {}) };
  } catch {}

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }

  let saveTimer = 0;
  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(save, 180);
  }

  function fieldKey(field) {
    return field.dataset.save || field.id || field.name;
  }

  document.querySelectorAll("[data-save]").forEach((field) => {
    const key = fieldKey(field);
    if (!key) return;
    if (field.type === "checkbox") {
      field.checked = Boolean(state.read[key]);
      field.addEventListener("change", () => {
        state.read[key] = field.checked;
        updateProgress();
        save();
      });
    } else {
      field.value = state.values[key] || "";
      field.addEventListener("input", () => {
        state.values[key] = field.value;
        scheduleSave();
      });
    }
  });

  function updateProgress() {
    const readChecks = [...document.querySelectorAll("[data-read-page]")];
    const count = readChecks.filter((input) => input.checked).length;
    if (progress) {
      progress.max = readChecks.length;
      progress.value = count;
    }
    if (progressText) progressText.textContent = `${count} / ${readChecks.length}`;
  }

  function setTranslations(visible) {
    root.classList.toggle("hide-translation", !visible);
    if (translationToggle) {
      translationToggle.checked = visible;
      translationToggle.setAttribute("aria-checked", String(visible));
    }
    try { localStorage.setItem(translationKey, JSON.stringify(visible)); } catch {}
  }

  let translationsVisible = true;
  try {
    const stored = localStorage.getItem(translationKey);
    if (stored !== null) translationsVisible = JSON.parse(stored) !== false;
  } catch {}
  setTranslations(translationsVisible);
  translationToggle?.addEventListener("change", () => setTranslations(translationToggle.checked));

  function applyFilter(kind) {
    filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === kind)));
    pages.forEach((page) => { page.hidden = kind !== "all" && page.dataset.kind !== kind; });
  }

  filterButtons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
  printButton?.addEventListener("click", () => window.print());

  mobileJump?.addEventListener("change", () => {
    if (!mobileJump.value) return;
    applyFilter("all");
    document.querySelector(mobileJump.value)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.toggleAttribute("aria-current", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-20% 0px -65%", threshold: [0, .2, .5] });
  pages.forEach((page) => observer.observe(page));

  navLinks.forEach((link) => link.addEventListener("click", () => applyFilter("all")));
  window.addEventListener("pagehide", save);
  window.addEventListener("beforeprint", save);
  updateProgress();
})();
