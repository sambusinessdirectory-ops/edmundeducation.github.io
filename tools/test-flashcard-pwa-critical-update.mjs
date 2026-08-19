import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const pwaSource = readFileSync(path.join(siteDir, "pwa-register.js"), "utf8");
const flashcardSource = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const workerSource = readFileSync(path.join(siteDir, "service-worker.js"), "utf8");
const releaseSource = readFileSync(path.join(siteDir, "release.json"), "utf8");
const pagesWorkflow = readFileSync(path.join(siteDir, ".github/workflows/pages.yml"), "utf8");

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing function: ${name}`);
  const paramsStart = source.indexOf("(", start);
  let paramsDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < source.length; index += 1) {
    if (source[index] === "(") paramsDepth += 1;
    if (source[index] === ")") {
      paramsDepth -= 1;
      if (paramsDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  const bodyStart = source.indexOf("{", paramsEnd);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated function: ${name}`);
}

const settleOperation = extractFunction(pwaSource, "settleServiceWorkerOperationBefore");
const claimReload = extractFunction(pwaSource, "claimCriticalUpdateReloadAttempt");
const beginReload = extractFunction(pwaSource, "beginServiceWorkerUpdateReload");
const findUpdate = extractFunction(pwaSource, "findInstalledServiceWorkerUpdate");
const findUpdateAsync = findUpdate.replace(/^function /, "async function ");
const reloadIfAvailable = extractFunction(pwaSource, "reloadIfCriticalUpdateAvailable");
const validRelease = extractFunction(pwaSource, "validStampedReleaseId");
const releaseRequiresReload = extractFunction(pwaSource, "deployedReleaseRequiresReload");
const releaseProbe = extractFunction(pwaSource, "deployedReleaseIdBefore");
const releaseProbeAsync = releaseProbe.replace(/^function /, "async function ");
const controllerReleaseProbe = extractFunction(pwaSource, "activeControllerReleaseIdBefore");
const beginReleaseReload = extractFunction(pwaSource, "beginDeployedReleaseReload");
const manualReloadNotice = extractFunction(pwaSource, "showManualSafetyReload");

assert.match(pwaSource, /window\.EdmundPwaUpdates\s*=\s*Object\.freeze/);
assert.match(pwaSource, /reloadIfUpdateAvailable:\s*reloadIfCriticalUpdateAvailable/);
assert.match(reloadIfAvailable, /navigator\.serviceWorker\.getRegistration\("\/"\)/);
assert.match(reloadIfAvailable, /updateViaCache:\s*"none"/);
assert.match(findUpdate, /if \(forceCheck\)/);
assert.match(findUpdate, /registration\.update\(\)/);
assert.match(reloadIfAvailable, /CRITICAL_UPDATE_MAX_TIMEOUT_MS/);
assert.match(reloadIfAvailable, /findInstalledServiceWorkerUpdate\(registration, deadline, \{ forceCheck \}\)/);
assert.match(reloadIfAvailable, /deployedReleaseIdBefore\(deadline, \{ force: true \}\)/);
assert.match(reloadIfAvailable, /deployedReleaseRequiresReload\(currentDeployedRelease\)/);
assert.match(reloadIfAvailable, /activeControllerReleaseIdBefore\(deadline\)/);
assert.ok(
  reloadIfAvailable.indexOf("deployedReleaseRequiresReload")
    < reloadIfAvailable.indexOf("navigator.serviceWorker.getRegistration"),
  "A page-vs-deployed release mismatch must be handled even when the new worker is already active"
);
assert.match(beginReload, /worker\.postMessage\(\{\s*type:\s*"SKIP_WAITING"\s*\}\)/);
assert.match(beginReload, /window\.location\.reload\(\)/);
assert.match(claimReload, /window\.sessionStorage\.getItem/);
assert.match(claimReload, /window\.sessionStorage\.setItem/);
assert.match(beginReleaseReload, /claimCriticalUpdateReloadAttempt\(targetRelease\)/);
assert.match(beginReleaseReload, /window\.location\.reload\(\)/);
assert.match(beginReleaseReload, /showManualSafetyReload\(\)/);
assert.match(manualReloadNotice, /重新載入最新版本/);
assert.match(manualReloadNotice, /window\.location\.reload\(\)/);
assert.match(workerSource, /url\.pathname === "\/release\.json"/);
assert.match(workerSource, /event\.data\?\.type === "GET_RELEASE_ID"/);
assert.match(workerSource, /postMessage\(\{ release: RELEASE_ID \}\)/);
assert.match(controllerReleaseProbe, /controller\.postMessage\(\{ type: "GET_RELEASE_ID" \}/);
assert.match(workerSource, /fetch\(request, \{ cache: "no-store" \}\)/);
assert.match(releaseSource, /"release": "__EDMUND_RELEASE__"/);
for (const artifact of ["service-worker.js", "pwa-register.js", "release.json"]) {
  assert.ok(pagesWorkflow.includes(`_site/${artifact}`), `Pages must stamp ${artifact}`);
}
assert.doesNotMatch(
  `${settleOperation}\n${claimReload}\n${beginReload}\n${findUpdate}\n${reloadIfAvailable}`,
  /localStorage\.clear|sessionStorage\.clear|indexedDB\.deleteDatabase|caches\.delete|while\s*\(\s*true\s*\)|setInterval/,
  "Critical update activation must be bounded and must never clear student data"
);

const forceCheckRuntime = vm.runInNewContext(`(() => {
  ${settleOperation}
  ${findUpdateAsync}
  return async forceCheck => {
    let updateCalls = 0;
    const registration = {
      waiting: null,
      installing: null,
      addEventListener() {},
      removeEventListener() {},
      update: async () => { updateCalls += 1; }
    };
    await findInstalledServiceWorkerUpdate(registration, Date.now() + 100, { forceCheck });
    return updateCalls;
  };
})()`, {
  window: { setTimeout, clearTimeout },
  Date,
  Promise
});
assert.equal(await forceCheckRuntime(false), 0, "A healthy login must use only the local SW state");
assert.equal(await forceCheckRuntime(true), 1, "Terminal recovery may force one bounded SW update check");

const releaseComparison = vm.runInNewContext(`(() => {
  const CLIENT_RELEASE_ID = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  ${validRelease}
  ${releaseRequiresReload}
  return deployedReleaseRequiresReload;
})()`);
assert.equal(releaseComparison("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), false);
assert.equal(releaseComparison("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"), true);
assert.equal(releaseComparison("__EDMUND_RELEASE__"), false);

const failedProbeRuntime = vm.runInNewContext(`(() => {
  const CLIENT_RELEASE_ID = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  let deployedReleaseId = "";
  let deployedReleaseProbePromise = null;
  ${settleOperation}
  ${validRelease}
  ${releaseProbeAsync}
  return deployedReleaseIdBefore;
})()`, {
  fetch: async () => { throw new Error("offline"); },
  window: { setTimeout, clearTimeout },
  Date,
  Promise
});
assert.equal(
  await failedProbeRuntime(Date.now() + 100),
  "",
  "A failed release probe must fail open without reloading or blocking login indefinitely"
);

const changingReleaseSandbox = {
  releases: [
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  ],
  window: { setTimeout, clearTimeout },
  Date,
  Promise
};
changingReleaseSandbox.fetch = async () => ({
  ok: true,
  json: async () => ({ release: changingReleaseSandbox.releases.shift() })
});
const changingReleaseProbe = vm.runInNewContext(`(() => {
  const CLIENT_RELEASE_ID = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  let deployedReleaseId = "";
  let deployedReleaseProbePromise = null;
  ${settleOperation}
  ${validRelease}
  ${releaseProbeAsync}
  return deployedReleaseIdBefore;
})()`, changingReleaseSandbox);
assert.equal(
  await changingReleaseProbe(Date.now() + 100, { force: true }),
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
);
assert.equal(
  await changingReleaseProbe(Date.now() + 100, { force: true }),
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "A critical check must observe a deployment that changed after its warm probe"
);

function createStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); }
  };
}

function createClaimRuntime(sessionStorage, now) {
  return vm.runInNewContext(`(() => {
    const CRITICAL_UPDATE_RELOAD_GUARD_MS = 2 * 60 * 1000;
    const CRITICAL_UPDATE_RELOAD_GUARD_KEY = "edmund-pwa-critical-update-reload";
    let automaticUpdateReloadTarget = "";
    const Date = { now: () => ${now} };
    ${claimReload}
    return claimCriticalUpdateReloadAttempt;
  })()`, { window: { sessionStorage } });
}

const sharedStorage = createStorage();
assert.equal(createClaimRuntime(sharedStorage, 1_000_000)(), true);
assert.equal(
  createClaimRuntime(sharedStorage, 1_001_000)(),
  false,
  "A reloaded page must not start a second automatic reload inside the guard window"
);
assert.equal(
  createClaimRuntime(sharedStorage, 1_121_000)(),
  true,
  "A genuinely later release may perform one new bounded update reload"
);
const targetStorage = createStorage();
assert.equal(createClaimRuntime(targetStorage, 3_000_000)("release-a"), true);
assert.equal(
  createClaimRuntime(targetStorage, 3_001_000)("release-b"),
  true,
  "A different target SHA must not be suppressed by the preceding release guard"
);

const unavailableStorage = {
  getItem() { throw new Error("blocked"); },
  setItem() { throw new Error("blocked"); }
};
const memoryGuard = createClaimRuntime(unavailableStorage, 2_000_000);
assert.equal(memoryGuard(), true);
assert.equal(memoryGuard(), false, "The in-memory guard must still prevent a same-page loop");

const activationRuntime = vm.runInNewContext(`(() => {
  const CRITICAL_UPDATE_RELOAD_GUARD_MS = 2 * 60 * 1000;
  const CRITICAL_UPDATE_RELOAD_GUARD_KEY = "edmund-pwa-critical-update-reload";
  let automaticUpdateReloadTarget = "";
  let reloadingForUpdate = false;
  let updateReloadFallbackTimer = 0;
  let reloads = 0;
  let removedUi = 0;
  let manualNotices = 0;
  const timers = [];
  const window = {
    sessionStorage: { getItem: () => null, setItem: () => {} },
    setTimeout(callback) { timers.push(callback); return timers.length; },
    clearTimeout() {},
    location: { reload() { reloads += 1; } }
  };
  const navigator = { serviceWorker: { controller: {} } };
  const removeUi = () => { removedUi += 1; };
  const showManualSafetyReload = () => { manualNotices += 1; };
  ${claimReload}
  ${beginReload}
  return {
    begin: beginServiceWorkerUpdateReload,
    runTimers: () => timers.splice(0).forEach(callback => callback()),
    reloads: () => reloads,
    removedUi: () => removedUi,
    manualNotices: () => manualNotices
  };
})()`);
const postedMessages = [];
const waitingWorker = { postMessage(message) { postedMessages.push(message); } };
assert.equal(activationRuntime.begin(waitingWorker, { automatic: true }), true);
assert.equal(
  activationRuntime.begin(waitingWorker, { automatic: true }),
  true,
  "A guarded stale page must continue reporting update-pending instead of allowing login"
);
assert.deepEqual(JSON.parse(JSON.stringify(postedMessages)), [{ type: "SKIP_WAITING" }]);
assert.equal(activationRuntime.removedUi(), 1);
assert.equal(activationRuntime.manualNotices(), 1, "A suppressed loop must offer a visible manual reload");
assert.equal(activationRuntime.reloads(), 0);
activationRuntime.runTimers();
assert.equal(activationRuntime.reloads(), 1, "The controller-change fallback may reload only once");

const login = extractFunction(flashcardSource, "performFlashcardLogin");
const recovery = extractFunction(flashcardSource, "runFlashcardTerminalRecovery");
const flashcardUpdateCheck = extractFunction(flashcardSource, "reloadForCurrentFlashcardClientUpdate");
const flashcardUpdateCheckAsync = flashcardUpdateCheck.replace(/^function /, "async function ");
assert.match(flashcardUpdateCheck, /EdmundPwaUpdates\?\.reloadIfUpdateAvailable/);
assert.match(flashcardUpdateCheck, /reason === "login" \? 500 : 2500/);
assert.match(flashcardUpdateCheck, /forceCheck:\s*reason !== "login"/);
assert.match(flashcardUpdateCheck, /currentView !== "login" \|\| isSessionInProgress\(\)/);
assert.doesNotMatch(flashcardUpdateCheck, /clear|removeItem|deleteDatabase/);
assert.ok(
  login.indexOf('reloadForCurrentFlashcardClientUpdate("login")') < login.indexOf("callSupabaseRpc"),
  "Login must update a stale Flashcard client before sending account credentials"
);
assert.ok(
  recovery.indexOf('reloadForCurrentFlashcardClientUpdate("terminal-recovery")')
    < recovery.indexOf("flashcardOutboxRowsForContext"),
  "Terminal recovery must update a stale client before inspecting or mutating its outbox"
);
assert.doesNotMatch(login, /location\.reload|SKIP_WAITING/);
assert.doesNotMatch(recovery, /location\.reload|SKIP_WAITING/);

async function runFlashcardUpdateGate({ currentView, sessionInProgress }) {
  const sandbox = { updateCalls: 0 };
  const check = vm.runInNewContext(`(() => {
    const currentView = ${JSON.stringify(currentView)};
    const isSessionInProgress = () => ${JSON.stringify(sessionInProgress)};
    let flashcardClientReloadPending = false;
    const window = { EdmundPwaUpdates: {
      reloadIfUpdateAvailable: async () => { globalThis.updateCalls += 1; return true; }
    } };
    const console = { warn() {} };
    ${flashcardUpdateCheckAsync}
    return reloadForCurrentFlashcardClientUpdate;
  })()`, sandbox);
  const result = await check("terminal-recovery");
  return { result, updateCalls: sandbox.updateCalls };
}

assert.deepEqual(
  await runFlashcardUpdateGate({ currentView: "deck-view", sessionInProgress: true }),
  { result: false, updateCalls: 0 },
  "A terminal conflict during an active answer must never reload the page"
);
assert.deepEqual(
  await runFlashcardUpdateGate({ currentView: "login", sessionInProgress: true }),
  { result: false, updateCalls: 0 },
  "The update gate must not reload while any study session remains active"
);
assert.deepEqual(
  await runFlashcardUpdateGate({ currentView: "login", sessionInProgress: false }),
  { result: true, updateCalls: 1 },
  "The login/recovery screen may activate one waiting safety update"
);

const repeatLoginSandbox = { updateCalls: 0 };
const repeatLoginUpdateGate = vm.runInNewContext(`(() => {
  const currentView = "login";
  const isSessionInProgress = () => false;
  let flashcardClientReloadPending = false;
  const window = { EdmundPwaUpdates: {
    reloadIfUpdateAvailable: async () => { globalThis.updateCalls += 1; return true; }
  } };
  const console = { warn() {} };
  ${flashcardUpdateCheckAsync}
  return reloadForCurrentFlashcardClientUpdate;
})()`, repeatLoginSandbox);
assert.equal(await repeatLoginUpdateGate("login"), true);
assert.equal(await repeatLoginUpdateGate("login"), true);
assert.equal(
  repeatLoginSandbox.updateCalls,
  1,
  "An immediate second submit must remain blocked by update-pending without reaching stale login code"
);

console.log("Flashcard critical PWA update gate passed.");
