import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing function: ${name}`);
  const paramsStart = source.indexOf("(", start);
  let paramsDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < source.length; index += 1) {
    if (source[index] === "(") paramsDepth += 1;
    if (source[index] === ")" && --paramsDepth === 0) {
      paramsEnd = index;
      break;
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
    if (character === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unterminated function: ${name}`);
}

const nameKey = extractFunction("flashcardLoginNameKey");
const login = extractFunction("login");
const performLogin = extractFunction("performFlashcardLogin");
const terminalOwner = extractFunction("terminalRecoveryOwnsAuthenticatedStudent");
const sameStudent = extractFunction("isSameAuthenticatedFlashcardStudent");
const reuseRecovery = extractFunction("reuseAuthenticatedFlashcardRecovery");
const reuseRecoveryAsync = reuseRecovery.replace(/^function /, "async function ");

assert.match(login, /flashcardLoginFlight\.nameKey === nameKey/);
assert.match(login, /return flashcardLoginFlight\.promise/);
assert.match(login, /task\.finally/);
assert.match(login, /flashcardLoginFlight\?\.promise === guarded/);
assert.match(login, /flashcardLoginFlight = \{ nameKey, promise: guarded \}/);
assert.doesNotMatch(login, /flashcardLoginFlight\s*=\s*\{[^}]*password/);
assert.doesNotMatch(login, /setTimeout|Promise\.race/);
assert.ok(
  performLogin.indexOf("reuseAuthenticatedFlashcardRecovery") < performLogin.indexOf("callSupabaseRpc"),
  "An authenticated terminal session must be reused before any new login RPC"
);
assert.match(reuseRecovery, /runFlashcardTerminalRecovery\(\{ automatic: true \}\)/);
assert.match(terminalOwner, /flashcardOutboxOwnerMatches\(record, context\)/);
assert.match(sameStudent, /flashcardLoginNameKey\(currentUser\.name\) === flashcardLoginNameKey\(name\)/);

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((success, failure) => {
    resolve = success;
    reject = failure;
  });
  return { promise, resolve, reject };
}

const flights = [];
const loginSandbox = { calls: [], flights };
const loginRuntime = vm.runInNewContext(`(() => {
  let flashcardLoginFlight = null;
  let loginFailureMessage = "";
  const performFlashcardLogin = (name, password) => {
    globalThis.calls.push({ name, password });
    return globalThis.flights.shift().promise;
  };
  ${nameKey}
  ${login}
  return { login, message: () => loginFailureMessage, flight: () => flashcardLoginFlight };
})()`, loginSandbox);

const first = deferred();
flights.push(first);
const sameA = loginRuntime.login(" Hayley ", "first-secret");
const sameB = loginRuntime.login("hayley", "second-secret");
assert.equal(sameA, sameB, "Rapid same-student submits must join exactly one promise");
assert.equal(loginRuntime.flight().nameKey, "hayley");
assert.equal(Object.hasOwn(loginRuntime.flight(), "password"), false);
assert.deepEqual(loginRuntime.flight().promise, sameA);
assert.equal(loginSandbox.calls.length, 1);
const differentDuringFlight = await loginRuntime.login("Another Student", "other-secret");
assert.equal(differentDuringFlight, false);
assert.equal(loginSandbox.calls.length, 1);
first.resolve(true);
assert.equal(await sameA, true);
await Promise.resolve();
assert.equal(loginRuntime.flight(), null, "The completed flight must release itself by promise identity");

const second = deferred();
flights.push(second);
const retry = loginRuntime.login("Hayley", "third-secret");
assert.equal(loginSandbox.calls.length, 2);
second.resolve(false);
assert.equal(await retry, false);

const recoveryRuntime = vm.runInNewContext(`(() => {
  let loginFailureMessage = "";
  let flashcardTerminalRecoveryPromise = null;
  let flashcardRecoveryRows = [{ owner: "student:hayley", requiresResolution: true }];
  let recoveryCalls = 0;
  const currentUser = { id: "student-1", name: "Hayley", role: "student", sessionToken: "token-1" };
  const studentSessionToken = "token-1";
  const supabaseState = { epoch: 7, outboxErrorClass: "terminal" };
  const captureSupabaseStateSaveContext = () => ({
    type: "student", owner: "student:hayley", studentId: "student-1", epoch: 7
  });
  const isSupabaseStateContextCurrent = context => context.epoch === 7;
  const flashcardOutboxOwnerMatches = (record, context) => record.owner === context.owner;
  const flashcardOutboxRecordRequiresResolution = record => record.requiresResolution === true;
  const runFlashcardTerminalRecovery = async () => { recoveryCalls += 1; return true; };
  ${nameKey}
  ${terminalOwner}
  ${sameStudent}
  ${reuseRecoveryAsync}
  return {
    reuse: reuseAuthenticatedFlashcardRecovery,
    recoveryCalls: () => recoveryCalls,
    message: () => loginFailureMessage
  };
})()`);
assert.equal(await recoveryRuntime.reuse(" hayley "), true);
assert.equal(recoveryRuntime.recoveryCalls(), 1);
assert.equal(await recoveryRuntime.reuse("Another Student"), false);
assert.equal(recoveryRuntime.recoveryCalls(), 1, "A different account must not invalidate the active recovery context");
assert.match(recoveryRuntime.message(), /不能切換帳戶/);

const setupEvents = extractFunction("setupEvents");
assert.match(setupEvents, /dataset\.flashcardLoginBusy/);
assert.match(setupEvents, /setAttribute\("aria-busy", "true"\)/);
assert.match(setupEvents, /controls\.forEach\(control => \{ control\.disabled = true; \}\)/);
assert.match(setupEvents, /finally[\s\S]{0,260}controls\.forEach\(control => \{ control\.disabled = false; \}\)/);

console.log("Flashcard login single-flight and authenticated recovery reuse gate passed.");
