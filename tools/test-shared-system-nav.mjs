import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const scriptSource = fs.readFileSync(path.join(root, "shared-system-nav.js"), "utf8");
const cssSource = fs.readFileSync(path.join(root, "shared-system-nav.css"), "utf8");

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}

function navigationRuntime() {
  const sessionStorage = new MemoryStorage();
  const localStorage = new MemoryStorage();
  const document = {
    activeElement: null,
    readyState: "loading",
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  const window = {
    document,
    sessionStorage,
    localStorage,
    clearTimeout,
    setTimeout
  };
  vm.runInNewContext(scriptSource, {
    console,
    document,
    window,
    clearTimeout,
    setTimeout
  }, { filename: "shared-system-nav.js" });
  return { api: window.EdmundSystemNav, localStorage, sessionStorage };
}

function read(storage, key) {
  return JSON.parse(storage.getItem(key) || "null");
}

test("shared student login safely bridges every Flashcard-token portal", () => {
  const { api, sessionStorage } = navigationRuntime();
  assert.equal(api.rememberStudentSession({
    token: "11111111-1111-4111-8111-111111111111",
    id: "22222222-2222-4222-8222-222222222222",
    name: "Student One",
    role: "student",
    access: { ielts: true, bookmarks: false }
  }), true);

  assert.equal(read(sessionStorage, "edmundSpeakingSessionV1").token, "11111111-1111-4111-8111-111111111111");
  assert.equal(read(sessionStorage, "edmund-sentence-structure-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-schedule-session-v1").studentToken, "11111111-1111-4111-8111-111111111111");
  assert.equal(read(sessionStorage, "edmundModelEssayDownloadSession").sessionToken, "11111111-1111-4111-8111-111111111111");
  assert.equal(sessionStorage.getItem("edmundFlashcardSession"), null);
  assert.equal(read(sessionStorage, "edmund-universal-student-session-v1").access, undefined);
});

test("switching students overwrites compatible sessions without borrowing permissions", () => {
  const { api, sessionStorage } = navigationRuntime();
  api.rememberStudentSession({
    token: "11111111-1111-4111-8111-111111111111",
    name: "Student One",
    role: "student",
    access: { ielts: true }
  });
  api.rememberStudentSession({
    token: "33333333-3333-4333-8333-333333333333",
    name: "Student Two",
    role: "student"
  });
  assert.equal(read(sessionStorage, "edmundSpeakingSessionV1").name, "Student Two");
  assert.equal(sessionStorage.getItem("edmundFlashcardSession"), null);
  assert.equal(read(sessionStorage, "edmund-universal-student-session-v1").access, undefined);
});

test("a newer universal student replaces stale target-portal student state", () => {
  const { api, sessionStorage } = navigationRuntime();
  sessionStorage.setItem("edmundSpeakingSessionV1", JSON.stringify({
    token: "11111111-1111-4111-8111-111111111111",
    name: "Student A",
    role: "student"
  }));
  sessionStorage.setItem("edmund-universal-student-session-v1", JSON.stringify({
    token: "22222222-2222-4222-8222-222222222222",
    name: "Student B",
    role: "student"
  }));
  assert.equal(api.getStudentSession().name, "Student B");
  api.bridgeStudentSession();
  assert.equal(read(sessionStorage, "edmundSpeakingSessionV1").name, "Student B");
});

test("student logout removes the universal and app-specific browser sessions", () => {
  const { api, localStorage, sessionStorage } = navigationRuntime();
  api.rememberStudentSession({
    token: "11111111-1111-4111-8111-111111111111",
    name: "Student One",
    role: "student",
    access: { ielts: true }
  });
  localStorage.setItem("edmundWritingSession", JSON.stringify({ name: "Student One", role: "student" }));
  api.forgetStudentSession();
  [
    "edmund-universal-student-session-v1",
    "edmundFlashcardSession",
    "edmundSpeakingSessionV1",
    "edmund-sentence-structure-session-v1",
    "edmund-schedule-session-v1",
    "edmundModelEssayDownloadSession"
  ].forEach(key => assert.equal(sessionStorage.getItem(key), null));
  assert.equal(localStorage.getItem("edmundWritingSession"), null);
});

test("student bridging and logout never overwrite active admin sessions", () => {
  const { api, localStorage, sessionStorage } = navigationRuntime();
  const adminSessions = {
    edmundFlashcardSession: { name: "Student Preview", role: "student", impersonatedByAdmin: true },
    edmundSpeakingSessionV1: { name: "Speaking Admin", role: "admin", token: "admin-speaking" },
    "edmund-sentence-structure-session-v1": { name: "Sentence Admin", role: "admin", token: "admin-sentence" },
    "edmund-schedule-session-v1": { name: "Schedule Admin", role: "admin", adminToken: "admin-schedule" },
    edmundModelEssayDownloadSession: { name: "Download Admin", role: "admin", adminToken: "admin-download" }
  };
  Object.entries(adminSessions).forEach(([key, value]) => sessionStorage.setItem(key, JSON.stringify(value)));
  localStorage.setItem("edmundWritingSession", JSON.stringify({ name: "Writing Preview", role: "student", impersonatedByAdmin: true }));

  api.rememberStudentSession({
    token: "11111111-1111-4111-8111-111111111111",
    name: "Student One",
    role: "student",
    access: { ielts: true }
  });
  api.forgetStudentSession();

  Object.entries(adminSessions).forEach(([key, value]) => assert.deepEqual(read(sessionStorage, key), value));
  assert.deepEqual(read(localStorage, "edmundWritingSession"), { name: "Writing Preview", role: "student", impersonatedByAdmin: true });
});

test("all six student portals load the shared accessible switcher", () => {
  const pages = {
    "flashcards.html": "flashcards",
    "writing-practice.html": "writing",
    "speaking-system.html": "speaking",
    "sentence-structure.html": "sentence",
    "schedule-system.html": "schedule",
    "model-essay-downloads.html": "downloads"
  };
  Object.entries(pages).forEach(([file, system]) => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(html, /shared-system-nav\.css/);
    assert.match(html, /shared-system-nav\.js/);
    assert.match(html, new RegExp(`data-edmund-system-switcher data-system="${system}"`));
    assert.match(html, /data-system-switcher-trigger aria-label="開啟 EdmundEducation 系統快速切換"/);
  });
});

test("menu behavior covers hover, focus, Escape and click-outside", () => {
  const { api } = navigationRuntime();
  assert.deepEqual(Array.from(api.systems, system => system.href), [
    "flashcards.html",
    "writing-practice.html",
    "speaking-system.html",
    "sentence-structure.html",
    "schedule-system.html",
    "model-essay-downloads.html"
  ]);
  assert.match(scriptSource, /pointerenter/);
  assert.match(scriptSource, /event\.pointerType === "mouse"/);
  assert.match(scriptSource, /trigger\.addEventListener\("click"/);
  assert.match(scriptSource, /openSwitcher\(switcher, \{ pinned: true \}\)/);
  assert.match(scriptSource, /switcher\.dataset\.pinned === "true"/);
  assert.match(scriptSource, /focusin/);
  assert.match(scriptSource, /document\.addEventListener\("focusin"/);
  assert.match(scriptSource, /suppressFocusOpen/);
  assert.match(scriptSource, /event\.key !== "Escape"/);
  assert.match(scriptSource, /if \(!switcher\.contains\(event\.target\)\) closeSwitcher/);
  assert.match(scriptSource, /aria-current="page"/);
  assert.doesNotMatch(scriptSource, /target=["']_blank/);
  assert.doesNotMatch(cssSource, /\.edmund-system-switcher:(?:hover|focus-within)\s+\.edmund-system-switcher__menu/, "closed click and Escape state must not be overridden by CSS focus/hover selectors");
});

test("Writing Practice exchanges the shared token without handling a password again", () => {
  const writing = fs.readFileSync(path.join(root, "writing-practice.html"), "utf8");
  const migration = fs.readFileSync(path.join(root, "supabase-universal-system-session.sql"), "utf8");
  assert.match(writing, /writing_student_session_from_flashcard/);
  assert.match(writing, /restoreUniversalStudentSession/);
  assert.match(migration, /flashcard_session_student_id\(p_token\)/);
  assert.match(migration, /revoke all on function public\.writing_student_session_from_flashcard\(uuid\)/);
  assert.match(migration, /grant execute on function public\.writing_student_session_from_flashcard\(uuid\) to authenticated/);
});

test("Flashcards validates the universal token server-side before restoring permissions", () => {
  const flashcards = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
  const migration = fs.readFileSync(path.join(root, "supabase-universal-system-session.sql"), "utf8");
  assert.match(flashcards, /restoreUniversalFlashcardSession/);
  assert.match(flashcards, /flashcard_student_session_profile/);
  assert.match(flashcards, /access: \{ \.\.\.defaultAccess\(\), \.\.\.\(student\.access \|\| \{\}\) \}/);
  assert.match(flashcards, /currentUser\?\.role !== "student"\s*\|\| currentUser\.impersonatedByAdmin/);
  assert.match(migration, /where session_row\.token = p_token\s+and session_row\.expires_at > now\(\)/);
  assert.match(migration, /revoke all on function public\.flashcard_student_session_profile\(uuid\)/);
  assert.match(migration, /grant execute on function public\.flashcard_student_session_profile\(uuid\) to authenticated/);
  assert.doesNotMatch(scriptSource, /SESSION_KEYS\.flashcards, \{\s*id: universal\.id/);
});

test("a newer universal student cannot be shadowed by an older persisted Writing student", () => {
  const writing = fs.readFileSync(path.join(root, "writing-practice.html"), "utf8");
  assert.match(writing, /function restoredWritingStudentMatches\(shared\)/);
  assert.match(writing, /currentUser\?\.role !== "student" \|\| currentUser\.impersonatedByAdmin/);
  assert.doesNotMatch(writing.match(/function restoredWritingStudentMatches[\s\S]*?\n    \}/)?.[0] || "", /sharedId|writingId/);
  assert.match(writing, /if \(restored && !restoredWritingStudentMatches\(shared\)\)/);
  assert.match(writing, /localStorage\.removeItem\(SESSION_KEY\);\s*restored = false;/);
  assert.match(writing, /currentUser\?\.role === "student" && !currentUser\.impersonatedByAdmin/);
  assert.match(writing, /const refreshed = await restoreUniversalStudentSession\(shared\)/);
  assert.match(writing, /else if \(refreshed === false\)[\s\S]*?forgetStudentSession\(\)/);
});
