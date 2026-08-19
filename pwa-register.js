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
  const CLIENT_RELEASE_ID = "__EDMUND_RELEASE__";
  const CRITICAL_UPDATE_DEFAULT_TIMEOUT_MS = 2500;
  const CRITICAL_UPDATE_MAX_TIMEOUT_MS = 5000;
  const CRITICAL_UPDATE_RELOAD_GUARD_MS = 2 * 60 * 1000;
  const CRITICAL_UPDATE_RELOAD_GUARD_KEY = "edmund-pwa-critical-update-reload";
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mobileLoginQuery = window.matchMedia("(pointer: coarse), (max-width: 900px)");
  let appIdentity = ROOT_APP;
  let installPrompt = null;
  let reloadingForUpdate = false;
  let automaticUpdateReloadTarget = "";
  let updateReloadFallbackTimer = 0;
  let deployedReleaseId = "";
  let deployedReleaseProbePromise = null;
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

  function settleServiceWorkerOperationBefore(promise, deadline, fallback = null) {
    const remaining = Math.max(0, Number(deadline || 0) - Date.now());
    if (!remaining) return Promise.resolve(fallback);
    return new Promise((resolve) => {
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(value);
      };
      const timer = window.setTimeout(() => finish(fallback), remaining);
      Promise.resolve(promise).then(finish, () => finish(fallback));
    });
  }

  function validStampedReleaseId(value) {
    const normalized = String(value || "").trim();
    return /^[a-f0-9]{40}$/i.test(normalized) ? normalized.toLocaleLowerCase() : "";
  }

  function deployedReleaseRequiresReload(releaseId) {
    const client = validStampedReleaseId(CLIENT_RELEASE_ID);
    const deployed = validStampedReleaseId(releaseId);
    return Boolean(client && deployed && client !== deployed);
  }

  async function deployedReleaseIdBefore(deadline, { force = false } = {}) {
    if (!validStampedReleaseId(CLIENT_RELEASE_ID)) return "";
    if (deployedReleaseId && !force) return deployedReleaseId;
    if (!deployedReleaseProbePromise) {
      const probe = fetch(`/release.json?client=${encodeURIComponent(CLIENT_RELEASE_ID)}&at=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" }
      }).then(async response => {
        if (!response.ok) return "";
        const payload = await response.json();
        const release = validStampedReleaseId(payload?.release);
        if (release) deployedReleaseId = release;
        return release;
      });
      deployedReleaseProbePromise = probe.catch(() => "").finally(() => {
        if (deployedReleaseProbePromise === wrappedProbe) deployedReleaseProbePromise = null;
      });
      const wrappedProbe = deployedReleaseProbePromise;
    }
    return settleServiceWorkerOperationBefore(deployedReleaseProbePromise, deadline, "");
  }

  async function activeControllerReleaseIdBefore(deadline) {
    if (!validStampedReleaseId(CLIENT_RELEASE_ID)) return "";
    const controller = navigator.serviceWorker.controller;
    if (!controller || typeof MessageChannel !== "function") return "";
    const channel = new MessageChannel();
    const response = new Promise(resolve => {
      channel.port1.onmessage = event => resolve(validStampedReleaseId(event.data?.release));
      try {
        controller.postMessage({ type: "GET_RELEASE_ID" }, [channel.port2]);
      } catch (_) {
        resolve("");
      }
    });
    const release = await settleServiceWorkerOperationBefore(response, deadline, "");
    channel.port1.close?.();
    return release;
  }

  function claimCriticalUpdateReloadAttempt(targetRelease = "service-worker-update") {
    const now = Date.now();
    const target = String(targetRelease || "service-worker-update");
    if (automaticUpdateReloadTarget === target) return false;
    try {
      const rawPrevious = window.sessionStorage.getItem(CRITICAL_UPDATE_RELOAD_GUARD_KEY);
      let previous = null;
      try { previous = rawPrevious ? JSON.parse(rawPrevious) : null; } catch { previous = null; }
      const previousAt = Number(previous?.at || rawPrevious || 0);
      const previousTarget = String(previous?.target || "");
      if (
        previousAt > 0
        && now - previousAt < CRITICAL_UPDATE_RELOAD_GUARD_MS
        && (!previousTarget || previousTarget === target)
      ) return false;
      window.sessionStorage.setItem(
        CRITICAL_UPDATE_RELOAD_GUARD_KEY,
        JSON.stringify({ at: now, target })
      );
    } catch (_) {
      // The in-memory guard below still prevents a loop when session storage is unavailable.
    }
    automaticUpdateReloadTarget = target;
    return true;
  }

  function showManualSafetyReload() {
    notice(
      "需要完成安全更新",
      "自動重新載入未能完成。請按「重新載入最新版本」；學習紀錄不會被清除。",
      [{
        label: "重新載入最新版本",
        primary: true,
        run: () => { window.location.reload(); }
      }]
    );
  }

  function beginServiceWorkerUpdateReload(worker, { automatic = false, targetRelease = "" } = {}) {
    if (!worker || !navigator.serviceWorker.controller) return false;
    // A recent guarded attempt still means this page must not continue into a
    // safety-critical login. Report update-pending even though no second reload
    // is scheduled, so the caller keeps the stale client locked.
    if (automatic && !claimCriticalUpdateReloadAttempt(targetRelease || "service-worker-update")) {
      showManualSafetyReload();
      return true;
    }
    reloadingForUpdate = true;
    removeUi();
    try {
      worker.postMessage({ type: "SKIP_WAITING" });
    } catch (_) {
      reloadingForUpdate = false;
      if (automatic) showManualSafetyReload();
      return automatic;
    }
    if (updateReloadFallbackTimer) window.clearTimeout(updateReloadFallbackTimer);
    updateReloadFallbackTimer = window.setTimeout(() => {
      if (!reloadingForUpdate) return;
      reloadingForUpdate = false;
      window.location.reload();
    }, 1500);
    return true;
  }

  function beginDeployedReleaseReload(targetRelease) {
    if (!claimCriticalUpdateReloadAttempt(targetRelease)) {
      showManualSafetyReload();
      return true;
    }
    reloadingForUpdate = true;
    removeUi();
    if (updateReloadFallbackTimer) window.clearTimeout(updateReloadFallbackTimer);
    updateReloadFallbackTimer = window.setTimeout(() => {
      if (!reloadingForUpdate) return;
      reloadingForUpdate = false;
      window.location.reload();
    }, 50);
    return true;
  }

  async function findInstalledServiceWorkerUpdate(registration, deadline, { forceCheck = true } = {}) {
    if (registration.waiting) return registration.waiting;
    let discoveredWorker = registration.installing || null;
    const discoverWorker = () => {
      discoveredWorker = registration.installing || discoveredWorker;
    };
    if (forceCheck) {
      registration.addEventListener("updatefound", discoverWorker);
      try {
        await settleServiceWorkerOperationBefore(
          Promise.resolve().then(() => registration.update()),
          deadline
        );
      } finally {
        registration.removeEventListener("updatefound", discoverWorker);
      }
    }
    if (registration.waiting) return registration.waiting;
    const worker = registration.installing || discoveredWorker;
    if (!worker || worker.state === "redundant") return null;
    if (worker.state === "installed") return worker;
    await settleServiceWorkerOperationBefore(new Promise(resolve => {
      const onStateChange = () => {
        if (worker.state !== "installed" && worker.state !== "redundant") return;
        worker.removeEventListener("statechange", onStateChange);
        resolve(worker.state === "installed" ? worker : null);
      };
      worker.addEventListener("statechange", onStateChange);
    }), deadline);
    return registration.waiting || (worker.state === "installed" ? worker : null);
  }

  async function reloadIfCriticalUpdateAvailable({
    timeoutMs = CRITICAL_UPDATE_DEFAULT_TIMEOUT_MS,
    forceCheck = true
  } = {}) {
    if (!navigator.serviceWorker.controller || reloadingForUpdate) return false;
    const boundedTimeout = Math.min(
      CRITICAL_UPDATE_MAX_TIMEOUT_MS,
      Math.max(250, Number(timeoutMs) || CRITICAL_UPDATE_DEFAULT_TIMEOUT_MS)
    );
    const deadline = Date.now() + boundedTimeout;
    let currentDeployedRelease = await deployedReleaseIdBefore(deadline, { force: true });
    if (!currentDeployedRelease && Date.now() < deadline) {
      currentDeployedRelease = await activeControllerReleaseIdBefore(deadline);
    }
    if (deployedReleaseRequiresReload(currentDeployedRelease)) {
      return beginDeployedReleaseReload(currentDeployedRelease);
    }
    let registration = await settleServiceWorkerOperationBefore(
      navigator.serviceWorker.getRegistration("/"),
      deadline
    );
    if (!registration && !forceCheck) return false;
    if (!registration && Date.now() < deadline) {
      registration = await settleServiceWorkerOperationBefore(
        navigator.serviceWorker.register("/service-worker.js", {
          scope: "/",
          updateViaCache: "none"
        }),
        deadline
      );
    }
    if (!registration || Date.now() >= deadline) return false;
    const worker = await findInstalledServiceWorkerUpdate(registration, deadline, { forceCheck });
    if (!worker || !navigator.serviceWorker.controller) return false;
    return beginServiceWorkerUpdateReload(worker, {
      automatic: true,
      targetRelease: currentDeployedRelease
    });
  }

  window.EdmundPwaUpdates = Object.freeze({
    reloadIfUpdateAvailable: reloadIfCriticalUpdateAvailable
  });

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
          run: () => { beginServiceWorkerUpdateReload(worker); }
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
      void deployedReleaseIdBefore(Date.now() + CRITICAL_UPDATE_MAX_TIMEOUT_MS);

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
    if (updateReloadFallbackTimer) {
      window.clearTimeout(updateReloadFallbackTimer);
      updateReloadFallbackTimer = 0;
    }
    window.location.reload();
  });
})();
