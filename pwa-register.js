(() => {
  "use strict";

  const DISMISS_KEY = "edmund-pwa-install-dismissed-until";
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const UPDATE_CHECK_THROTTLE_MS = 30 * 1000;
  let installPrompt = null;
  let reloadingForUpdate = false;
  let lastUpdateCheckAt = 0;
  let offeredUpdateWorker = null;

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
      localStorage.setItem(DISMISS_KEY, String(Date.now() + THIRTY_DAYS));
    } catch (_) {
      // Installation remains usable when storage is unavailable.
    }
  }

  function installWasDismissed() {
    try {
      return Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now();
    } catch (_) {
      return false;
    }
  }

  function showInstallButton() {
    if (standalone || installWasDismissed() || document.querySelector("[data-pwa-install]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pwa-install-button";
    button.dataset.pwaUi = "install";
    button.dataset.pwaInstall = "true";
    button.textContent = "安裝 EdmundEducation";
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
        "加入主畫面",
        "請按 Safari 的「分享」按鈕，再選擇「加入主畫面」。安裝後會以獨立 App 視窗開啟。",
        [
          { label: "稍後", run: () => { rememberInstallDismissal(); removeUi(); } },
          { label: "知道了", primary: true, run: removeUi }
        ]
      );
    });
    document.body.append(button);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    removeUi();
  });

  if (isiOS && !standalone) window.addEventListener("DOMContentLoaded", showInstallButton, { once: true });

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
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        offerUpdate(worker);
      }
    };
    if (worker.state === "installed") {
      offerWhenInstalled();
      return;
    }
    if (worker.state !== "redundant") worker.addEventListener("statechange", offerWhenInstalled);
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
      registration.addEventListener("updatefound", () => {
        watchUpdateWorker(registration.installing);
      });
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
