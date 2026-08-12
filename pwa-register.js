(() => {
  "use strict";

  window.EdmundTextReady = import("/apostrophe-normalizer.mjs")
    .then(() => window.EdmundText)
    .catch((error) => {
      console.warn("EdmundEducation apostrophe normalizer failed to load", error);
      return null;
    });

  const ROOT_APP = Object.freeze({
    id: "root",
    name: "港大 Edmund Sir 英文補習",
    shortName: "港大 Edmund Sir 英文補習",
    manifest: "/manifest.webmanifest"
  });
  const DISMISS_KEY_PREFIX = "edmund-pwa-install-dismissed-until";
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const IDLE_MILLISECONDS = 25 * 60 * 1000;
  const IDLE_CHECK_MILLISECONDS = 15 * 1000;
  const UPDATE_CHECK_THROTTLE_MS = 30 * 1000;
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mobileLoginQuery = window.matchMedia("(pointer: coarse), (max-width: 900px)");
  let appIdentity = ROOT_APP;
  let installPrompt = null;
  let reloadingForUpdate = false;
  let lastUpdateCheckAt = 0;
  let offeredUpdateWorker = null;

  function currentPageName() {
    const name = location.pathname.split("/").filter(Boolean).pop() || "index.html";
    return name.toLowerCase();
  }

  async function configurePageIdentity() {
    try {
      const { EDMUND_PWA_APPS } = await import("/pwa-app-catalog.mjs");
      const app = EDMUND_PWA_APPS.find(({ href }) => href.toLowerCase() === currentPageName());
      if (app) appIdentity = app;
    } catch (error) {
      console.warn("EdmundEducation app catalogue failed to load", error);
    }
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) manifest.href = appIdentity.manifest;
    let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement("meta");
      appleTitle.name = "apple-mobile-web-app-title";
      document.head.append(appleTitle);
    }
    appleTitle.content = appIdentity.shortName;
    document.documentElement.dataset.edmundPwaApp = appIdentity.id;
    return appIdentity;
  }

  const identityReady = configurePageIdentity();

  function dismissalKey() {
    return `${DISMISS_KEY_PREFIX}:${appIdentity.id}`;
  }

  function removeUi() {
    document.querySelectorAll("[data-pwa-ui]").forEach((element) => element.remove());
  }

  function notice(title, message, actions) {
    removeUi();
    const panel = document.createElement("aside");
    panel.className = "pwa-notice";
    panel.dataset.pwaUi = "notice";
    panel.setAttribute("role", "status");
    const strong = document.createElement("strong");
    strong.textContent = title;
    const copy = document.createElement("p");
    copy.textContent = message;
    const actionRow = document.createElement("div");
    actionRow.className = "pwa-notice__actions";
    actions.forEach(({ label, primary = false, run }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      if (primary) button.dataset.pwaPrimary = "true";
      button.addEventListener("click", run);
      actionRow.append(button);
    });
    panel.append(strong, copy, actionRow);
    document.body.append(panel);
  }

  function rememberInstallDismissal() {
    try {
      localStorage.setItem(dismissalKey(), String(Date.now() + THIRTY_DAYS));
    } catch (_) {
      // Installation remains usable when storage is unavailable.
    }
  }

  function installWasDismissed() {
    try {
      return Number(localStorage.getItem(dismissalKey()) || 0) > Date.now();
    } catch (_) {
      return false;
    }
  }

  async function showInstallButton() {
    await identityReady;
    if (standalone || installWasDismissed() || document.querySelector("[data-pwa-install]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pwa-install-button";
    button.dataset.pwaUi = "install";
    button.dataset.pwaInstall = "true";
    button.textContent = `安裝 ${appIdentity.shortName}`;
    button.setAttribute("aria-label", `安裝 ${appIdentity.name}`);
    button.addEventListener("click", async () => {
      if (installPrompt) {
        const prompt = installPrompt;
        installPrompt = null;
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice?.outcome !== "accepted") rememberInstallDismissal();
        removeUi();
        return;
      }
      notice(
        `將「${appIdentity.shortName}」加入主畫面`,
        "請按 Safari 的「分享」按鈕，再選擇「加入主畫面」。安裝後會直接開啟這個系統。",
        [
          { label: "稍後", run: () => { rememberInstallDismissal(); removeUi(); } },
          { label: "知道了", primary: true, run: removeUi }
        ]
      );
    });
    document.body.append(button);
  }

  window.addEventListener("beforeinstallprompt", async (event) => {
    event.preventDefault();
    installPrompt = event;
    await showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    removeUi();
  });

  if (isiOS && !standalone) {
    const offerOnIos = () => void showInstallButton();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", offerOnIos, { once: true });
    else offerOnIos();
  }

  function passwordStepContainer(input) {
    const label = input.closest("label");
    if (label) return label;
    return input.closest(".field, .form-field, .login-field, .password-field") || input.parentElement;
  }

  function revealMobilePassword(form, password, { focus = false } = {}) {
    form.dataset.edmundPasswordRevealed = "true";
    const container = passwordStepContainer(password);
    if (container) container.dataset.edmundPasswordStep = "true";
    if (focus && mobileLoginQuery.matches) {
      window.requestAnimationFrame(() => {
        password.scrollIntoView({ block: "center", behavior: "smooth" });
        window.setTimeout(() => password.focus({ preventScroll: true }), 180);
      });
    }
  }

  function enhanceMobileLoginForm(form) {
    if (!(form instanceof HTMLFormElement) || form.dataset.edmundMobileLoginEnhanced === "true") return;
    const username = form.querySelector('input[autocomplete="username"], input[name="username"], input[type="email"], input[type="text"]');
    const password = form.querySelector('input[type="password"][autocomplete="current-password"], input[name="password"][type="password"]');
    if (!username || !password || username === password) return;
    form.dataset.edmundMobileLoginEnhanced = "true";
    const container = passwordStepContainer(password);
    if (container) container.dataset.edmundPasswordStep = "true";
    const reveal = (focus = false) => revealMobilePassword(form, password, { focus });
    if (username.value || password.value || !mobileLoginQuery.matches) reveal(false);
    username.addEventListener("focus", () => reveal(false));
    username.addEventListener("input", () => reveal(false));
    username.addEventListener("change", () => reveal(Boolean(username.value.trim())));
    username.addEventListener("blur", (event) => {
      if (!username.value.trim() || event.relatedTarget === password || form.contains(event.relatedTarget)) return;
      reveal(true);
    });
    username.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      reveal(true);
    });
    password.addEventListener("focus", () => reveal(false));
  }

  function enhanceMobileLogins(root = document) {
    if (root instanceof HTMLFormElement) enhanceMobileLoginForm(root);
    root.querySelectorAll?.("form").forEach(enhanceMobileLoginForm);
  }

  function initialiseMobileLoginExperience() {
    enhanceMobileLogins();
    const observer = new MutationObserver((records) => {
      records.forEach(({ addedNodes }) => addedNodes.forEach((node) => {
        if (node instanceof Element) enhanceMobileLogins(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    mobileLoginQuery.addEventListener?.("change", () => enhanceMobileLogins());
  }

  function initialiseIdleBreakGuard() {
    if (appIdentity.id === "root") return;
    let paused = false;
    let pausedAt = 0;
    let lastActivityAt = Date.now();
    let dialog = null;
    const adapters = new Set();

    const visible = (element) => {
      if (!element || element.hidden || element.disabled || element.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    };

    function isAuthenticated() {
      try {
        if (window.EdmundSystemNav?.getStudentSession?.()) return true;
      } catch (_) {
        // Visible app controls remain the canonical fallback.
      }
      return [...document.querySelectorAll("[data-logout], [data-action='logout']")].some(visible);
    }

    function activeMediaOrExercise() {
      const playingMedia = [...document.querySelectorAll("audio, video")]
        .some((media) => !media.paused && !media.ended && media.readyState >= 2);
      if (playingMedia) return true;
      return [...document.querySelectorAll([
        "[data-record-toggle].is-recording",
        "[data-record-toggle][aria-pressed='true']",
        ".recording-dot:not(.paused)"
      ].join(","))].some(visible);
    }

    function emit(type, detail) {
      document.dispatchEvent(new CustomEvent(type, { detail }));
    }

    function runAdapters(method, detail) {
      adapters.forEach((adapter) => {
        try { adapter?.[method]?.(detail); } catch (error) { console.warn(`Idle-break ${method} adapter failed`, error); }
      });
    }

    function ensureDialog() {
      if (dialog) return dialog;
      dialog = document.createElement("dialog");
      dialog.className = "edmund-idle-break-dialog";
      dialog.dataset.edmundIdleBreakDialog = "true";
      dialog.setAttribute("aria-labelledby", "edmund-idle-break-title");
      dialog.innerHTML = `<section class="edmund-idle-break-dialog__card">
        <p class="edmund-idle-break-dialog__eyebrow">25-MINUTE CHECK-IN</p>
        <h2 id="edmund-idle-break-title">你是否正在休息？</h2>
        <p>系統已經 25 分鐘沒有收到操作。為確保學習時間準確，計時已暫停。</p>
        <div class="edmund-idle-break-dialog__actions">
          <button type="button" data-idle-break-logout>是，休息並登出</button>
          <button type="button" data-idle-break-resume>不是，繼續學習</button>
        </div>
      </section>`;
      dialog.addEventListener("cancel", (event) => event.preventDefault());
      dialog.querySelector("[data-idle-break-resume]").addEventListener("click", resumeFromBreak);
      dialog.querySelector("[data-idle-break-logout]").addEventListener("click", logoutForBreak);
      document.body.append(dialog);
      return dialog;
    }

    function beginBreak() {
      if (paused || !isAuthenticated()) return;
      paused = true;
      pausedAt = Date.now();
      document.documentElement.dataset.edmundStudyPaused = "true";
      const detail = { reason: "inactivity", pausedAt };
      runAdapters("pause", detail);
      emit("edmund:idle-break-start", detail);
      const prompt = ensureDialog();
      prompt.showModal();
      window.setTimeout(() => prompt.querySelector("[data-idle-break-resume]")?.focus(), 0);
    }

    function resumeFromBreak() {
      if (!paused) return;
      const detail = { reason: "inactivity", pausedAt, resumedAt: Date.now() };
      paused = false;
      delete document.documentElement.dataset.edmundStudyPaused;
      dialog?.close();
      runAdapters("resume", detail);
      emit("edmund:idle-break-resume", detail);
      lastActivityAt = Date.now();
    }

    function logoutForBreak() {
      if (!paused) return;
      const detail = { reason: "inactivity", pausedAt };
      runAdapters("logout", detail);
      emit("edmund:idle-break-logout", detail);
      dialog?.close();
      const logout = [...document.querySelectorAll("[data-logout], [data-action='logout']")].find(visible);
      if (logout) logout.click();
      else {
        try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch (_) { /* Best effort. */ }
        window.location.replace(window.location.href);
      }
    }

    function markActivity() {
      if (!paused) lastActivityAt = Date.now();
    }

    function checkIdle() {
      if (paused) return;
      if (!isAuthenticated()) {
        lastActivityAt = Date.now();
        return;
      }
      if (activeMediaOrExercise()) {
        lastActivityAt = Date.now();
        return;
      }
      if (Date.now() - lastActivityAt >= IDLE_MILLISECONDS) beginBreak();
    }

    ["pointerdown", "keydown", "input", "change", "touchstart", "scroll"].forEach((type) => {
      document.addEventListener(type, markActivity, { passive: true, capture: true });
    });
    document.addEventListener("play", markActivity, true);
    document.addEventListener("timeupdate", markActivity, true);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkIdle();
    });
    window.setInterval(checkIdle, IDLE_CHECK_MILLISECONDS);

    window.EdmundIdleBreak = Object.freeze({
      idleMilliseconds: IDLE_MILLISECONDS,
      isPaused: () => paused,
      markActivity,
      registerAdapter(adapter) {
        if (!adapter || typeof adapter !== "object") return () => {};
        adapters.add(adapter);
        return () => adapters.delete(adapter);
      }
    });
  }

  const initialiseSharedPageExperience = async () => {
    await identityReady;
    initialiseMobileLoginExperience();
    initialiseIdleBreakGuard();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void initialiseSharedPageExperience(), { once: true });
  } else {
    void initialiseSharedPageExperience();
  }

  if (!("serviceWorker" in navigator)) return;
  const canRegister = location.protocol === "https:"
    || location.hostname === "localhost"
    || location.hostname === "127.0.0.1";
  if (!canRegister) return;

  function offerUpdate(worker) {
    if (!worker || offeredUpdateWorker === worker) return;
    offeredUpdateWorker = worker;
    notice(
      "網站有新版本可用",
      "為免打斷正在進行的練習，網站不會自動重新整理。您可完成目前工作後再更新。",
      [
        { label: "稍後更新", run: removeUi },
        {
          label: "立即更新",
          primary: true,
          run: () => {
            reloadingForUpdate = true;
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        }
      ]
    );
  }

  function watchUpdateWorker(worker) {
    if (!worker) return;
    const offerWhenInstalled = () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) offerUpdate(worker);
    };
    if (worker.state === "installed") offerWhenInstalled();
    else if (worker.state !== "redundant") worker.addEventListener("statechange", offerWhenInstalled);
  }

  function checkForUpdate(registration, { force = false } = {}) {
    const now = Date.now();
    if (!force && now - lastUpdateCheckAt < UPDATE_CHECK_THROTTLE_MS) return;
    lastUpdateCheckAt = now;
    registration.update().catch(() => {
      // A temporary network failure must not interrupt the current exercise.
    });
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
        updateViaCache: "none"
      });
      registration.addEventListener("updatefound", () => watchUpdateWorker(registration.installing));
      if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);
      watchUpdateWorker(registration.installing);
      checkForUpdate(registration, { force: true });

      const checkWhenActive = () => checkForUpdate(registration);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkWhenActive();
      });
      window.addEventListener("pageshow", checkWhenActive);
      window.addEventListener("focus", checkWhenActive);
      window.addEventListener("online", checkWhenActive);
      window.setInterval(checkWhenActive, 60 * 60 * 1000);
    } catch (error) {
      console.warn("EdmundEducation PWA registration failed", error);
    }
  }, { once: true });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloadingForUpdate) return;
    reloadingForUpdate = false;
    window.location.reload();
  });
})();
