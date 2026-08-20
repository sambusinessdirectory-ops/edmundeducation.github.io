(function () {
  "use strict";

  var RUNTIME_SCRIPTS = Object.freeze([
    "loader.js",
    "asset-registry.js",
    "production-runtime.js",
    "game.js"
  ]);
  var SAFE_CONNECTION_TYPES = new Set(["wifi", "ethernet"]);
  var runtimeRequested = false;
  var mobileDataConfirmed = false;

  var startGate = document.getElementById("gameStartGate");
  var startButton = document.getElementById("gameStartButton");
  var startStatus = document.getElementById("startGateStatus");
  var warning = document.getElementById("mobileDataWarning");
  var warningContinue = document.getElementById("mobileDataContinue");
  var warningCancel = document.getElementById("mobileDataCancel");
  var loadingScreen = document.getElementById("gameLoadingScreen");
  var gameShell = document.getElementById("gameShell");
  var cover = loadingScreen && loadingScreen.querySelector("img[data-src]");

  function connectionInfo() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function likelyMobileDevice() {
    if (navigator.userAgentData && navigator.userAgentData.mobile === true) return true;
    var ua = String(navigator.userAgent || "");
    if (/Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua)) return true;
    if (/Macintosh/i.test(ua) && Number(navigator.maxTouchPoints || 0) > 1) return true;
    return Number(navigator.maxTouchPoints || 0) > 0
      && typeof window.matchMedia === "function"
      && window.matchMedia("(pointer: coarse)").matches;
  }

  function requiresMobileDataWarning() {
    var connection = connectionInfo();
    if (connection && connection.saveData === true) return true;
    var type = String(connection && connection.type || "").toLowerCase();
    if (type === "cellular") return true;
    if (!likelyMobileDevice()) return false;
    return !SAFE_CONNECTION_TYPES.has(type);
  }

  function openWarning() {
    if (!warning) return;
    if (typeof warning.showModal === "function") {
      if (!warning.open) warning.showModal();
      return;
    }
    warning.hidden = false;
    warning.setAttribute("open", "");
    warning.classList.add("data-warning-fallback");
  }

  function closeWarning() {
    if (!warning) return;
    if (typeof warning.close === "function" && warning.open) warning.close();
    warning.removeAttribute("open");
    warning.classList.remove("data-warning-fallback");
  }

  function loadStylesheet(href) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.eddyRuntime = "stylesheet";
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", function () {
        reject(new Error("The game stylesheet could not be loaded."));
      }, { once: true });
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.eddyRuntime = "script";
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", function () {
        reject(new Error(src + " could not be loaded."));
      }, { once: true });
      document.body.appendChild(script);
    });
  }

  async function beginRuntime() {
    if (runtimeRequested) return;
    runtimeRequested = true;
    if (startButton) startButton.disabled = true;
    if (startStatus) startStatus.textContent = "Preparing the farm…";

    try {
      await loadStylesheet("styles.css");
      if (cover && !cover.getAttribute("src")) cover.src = cover.dataset.src;
      if (loadingScreen) loadingScreen.hidden = false;
      if (gameShell) gameShell.hidden = false;
      if (startGate) startGate.hidden = true;
      document.documentElement.classList.add("eddy-runtime-requested");

      for (var src of RUNTIME_SCRIPTS) await loadScript(src);
    } catch (error) {
      console.error("Eddy's Carrot Patch could not start", error);
      if (loadingScreen) loadingScreen.hidden = true;
      if (gameShell) gameShell.hidden = true;
      if (startGate) startGate.hidden = false;
      if (startStatus) startStatus.textContent = "The game could not load. Please refresh and try again.";
    }
  }

  function requestStart() {
    if (runtimeRequested) return;
    if (!mobileDataConfirmed && requiresMobileDataWarning()) {
      openWarning();
      return;
    }
    void beginRuntime();
  }

  if (startButton) startButton.addEventListener("click", requestStart);
  if (warningContinue) {
    warningContinue.addEventListener("click", function () {
      mobileDataConfirmed = true;
      closeWarning();
      void beginRuntime();
    });
  }
  if (warningCancel) warningCancel.addEventListener("click", closeWarning);

  window.EddyGameLaunchGate = Object.freeze({
    get runtimeRequested() { return runtimeRequested; },
    requiresMobileDataWarning: requiresMobileDataWarning,
    requestStart: requestStart
  });
})();
