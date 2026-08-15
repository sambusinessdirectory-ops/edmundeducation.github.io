import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const scriptSource = fs.readFileSync(path.join(root, "shared-system-nav.js"), "utf8");
const cssSource = fs.readFileSync(path.join(root, "shared-system-nav.css"), "utf8");
const sharedNavRelease = "20260814-1";

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

  assert.equal(read(sessionStorage, "edmund-student-progress-session-v1").token, "11111111-1111-4111-8111-111111111111");
  assert.equal(read(sessionStorage, "edmundSpeakingSessionV1").token, "11111111-1111-4111-8111-111111111111");
  assert.equal(read(sessionStorage, "edmund-listening-session-v1").token, "11111111-1111-4111-8111-111111111111");
  assert.equal(read(sessionStorage, "edmund-writing-submission-session-v1").token, "11111111-1111-4111-8111-111111111111");
  assert.equal(read(sessionStorage, "edmund-sentence-structure-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-idiom-system-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-proverb-system-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-phrasal-verb-system-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-dse-paper3-analysis-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-common-expression-speaking-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-common-expression-written-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-common-expression-rhetorical-speaking-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-common-expression-rhetorical-writing-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-common-expression-professional-message-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-common-expression-business-speaking-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-learning-portal-quotes-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-learning-portal-english-joke-collection-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-learning-portal-argument-learning-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-learning-portal-fragmented-reading-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-song-appreciation-session-v1").name, "Student One");
  assert.equal(read(sessionStorage, "edmund-learning-portal-precise-language-session-v1").name, "Student One");
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
  assert.equal(read(sessionStorage, "edmund-student-progress-session-v1").name, "Student Two");
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
    "edmund-student-progress-session-v1",
    "edmundFlashcardSession",
    "edmund-writing-submission-session-v1",
    "edmundSpeakingSessionV1",
    "edmund-listening-session-v1",
    "edmund-sentence-structure-session-v1",
    "edmund-idiom-system-session-v1",
    "edmund-proverb-system-session-v1",
    "edmund-phrasal-verb-system-session-v1",
    "edmund-dse-paper3-analysis-session-v1",
    "edmund-song-appreciation-session-v1",
    "edmund-common-expression-speaking-session-v1",
    "edmund-common-expression-written-session-v1",
    "edmund-common-expression-rhetorical-speaking-session-v1",
    "edmund-common-expression-rhetorical-writing-session-v1",
    "edmund-common-expression-professional-message-session-v1",
    "edmund-common-expression-business-speaking-session-v1",
    "edmund-schedule-session-v1",
    "edmundModelEssayDownloadSession"
  ].forEach(key => assert.equal(sessionStorage.getItem(key), null));
  assert.equal(localStorage.getItem("edmundWritingSession"), null);
});

test("student bridging and logout never overwrite active admin sessions", () => {
  const { api, localStorage, sessionStorage } = navigationRuntime();
  const adminSessions = {
    "edmund-student-progress-session-v1": { name: "Progress Admin", role: "admin", token: "admin-progress" },
    edmundFlashcardSession: { name: "Student Preview", role: "student", impersonatedByAdmin: true },
    "edmund-writing-submission-session-v1": { name: "Submission Admin", role: "admin", token: "admin-submission" },
    edmundSpeakingSessionV1: { name: "Speaking Admin", role: "admin", token: "admin-speaking" },
    "edmund-sentence-structure-session-v1": { name: "Sentence Admin", role: "admin", token: "admin-sentence" },
    "edmund-idiom-system-session-v1": { name: "Idiom Admin", role: "admin", token: "admin-idiom" },
    "edmund-proverb-system-session-v1": { name: "Proverb Admin", role: "admin", token: "admin-proverb" },
    "edmund-phrasal-verb-system-session-v1": { name: "Phrasal Verb Admin", role: "admin", token: "admin-phrasal" },
    "edmund-dse-paper3-analysis-session-v1": { name: "Paper 3 Admin", role: "admin", token: "admin-paper3" },
    "edmund-song-appreciation-session-v1": { name: "Song Admin", role: "admin", token: "admin-song" },
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

test("all established student portals load the shared accessible switcher", () => {
  const pages = {
    "student-progress.html": "progress",
    "flashcards.html": "flashcards",
    "writing-practice.html": "writing",
    "writing-submission.html": "writing-submission",
    "speaking-system.html": "speaking",
    "listening-system.html": "listening",
    "sentence-structure.html": "sentence",
    "idiom-system.html": "idioms",
    "proverb-system.html": "proverbs",
    "phrasal-verb-system.html": "phrasal-verbs",
    "dse-paper3-analysis.html": "dse-paper3-analysis",
    "ielts-reading-analysis.html": "ielts-reading-analysis",
    "schedule-system.html": "schedule",
    "model-essay-downloads.html": "downloads",
    "video-class.html": "video-class",
    "parent-communication.html": "parent-communication",
    "common-expression-speaking.html": "common-expression-speaking",
    "common-expression-written.html": "common-expression-written",
    "common-expression-rhetorical-speaking.html": "common-expression-rhetorical-speaking",
    "common-expression-rhetorical-writing.html": "common-expression-rhetorical-writing",
    "common-expression-professional-message.html": "common-expression-professional-message",
    "common-expression-business-speaking.html": "common-expression-business-speaking",
    "song-appreciation.html": "song-appreciation"
  };
  Object.entries(pages).forEach(([file, system]) => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(html, new RegExp(`shared-system-nav\\.css\\?v=${sharedNavRelease}`));
    assert.match(html, new RegExp(`shared-system-nav\\.js\\?v=${sharedNavRelease}`), `${file} must load the latest shared navigation release`);
    assert.match(html, new RegExp(`data-edmund-system-switcher data-system="${system}"`));
    assert.match(html, /data-system-switcher-trigger aria-label="開啟 EdmundEducation 系統快速切換"/);
  });
});

test("every system portal loads one consistent shared navigation CSS and JS release", () => {
  const { api } = navigationRuntime();
  for (const system of Array.from(api.systems)) {
    const html = fs.readFileSync(path.join(root, system.href), "utf8");
    assert.match(html, new RegExp(`shared-system-nav\\.css\\?v=${sharedNavRelease}`), `${system.href} must load shared navigation CSS ${sharedNavRelease}`);
    assert.match(html, new RegExp(`shared-system-nav\\.js\\?v=${sharedNavRelease}`), `${system.href} must load shared navigation JS ${sharedNavRelease}`);
    assert.doesNotMatch(html, /shared-system-nav\.(?:css|js)\?v=(?!20260814-1)/, `${system.href} must not retain a stale shared navigation release`);
  }
  const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(homepage, new RegExp(`shared-system-nav\\.js\\?v=${sharedNavRelease}`));
});

test("every portal can create the shared password control before login and reveal it after login", () => {
  assert.match(scriptSource, /const candidate = studentSessionCandidate\(\)/);
  assert.match(scriptSource, /button\.hidden = !candidate/);
  assert.match(scriptSource, /existing\.hidden = !candidate/);
  assert.doesNotMatch(scriptSource, /if \(!studentSessionCandidate\(\) \|\| document\.querySelector/);
  assert.match(scriptSource, /shared_student_change_password/);
  assert.match(scriptSource, /更改用戶系統 Password/);
});

test("menu behavior covers hover, focus, Escape and click-outside", () => {
  const { api } = navigationRuntime();
  assert.deepEqual(Array.from(api.systems, system => system.href), [
    "student-progress.html",
    "flashcards.html",
    "writing-practice.html",
    "writing-submission.html",
    "speaking-system.html",
    "listening-system.html",
    "sentence-structure.html",
    "idiom-system.html",
    "proverb-system.html",
    "phrasal-verb-system.html",
    "dse-paper3-analysis.html",
    "ielts-reading-analysis.html",
    "schedule-system.html",
    "model-essay-downloads.html",
    "video-class.html",
    "parent-communication.html",
    "common-expression-speaking.html",
    "common-expression-written.html",
    "common-expression-rhetorical-speaking.html",
    "common-expression-rhetorical-writing.html",
    "common-expression-professional-message.html",
    "common-expression-business-speaking.html",
    "quotes-system.html",
    "grammar-system.html",
    "collocation-system.html",
    "irregular-verb-system.html",
    "thematic-vocabulary-system.html",
    "part-of-speech-system.html",
    "synonyms-system.html",
    "error-identifier-system.html",
    "learning-roadmap.html",
    "spelling-system.html",
    "reading-logic-system.html",
    "translation-skills-system.html",
    "business-school-system.html",
    "complex-questions-system.html",
    "leisurely-reading.html",
    "english-humour-speaking.html",
    "english-humour-writing.html",
    "english-joke-collection.html",
    "argument-learning-system.html",
    "fragmented-reading-system.html",
    "song-appreciation.html",
    "precise-language-system.html"
  ]);
  const progressSystem = api.systems.find(({ id }) => id === "progress");
  assert.equal(progressSystem?.zh, "全面英文能力發展進度表");
  assert.equal(progressSystem?.en, "Student Progress");
  const proverbSystem = api.systems.find(({ id }) => id === "proverbs");
  assert.equal(proverbSystem?.zh, "(學生使用) 諺語");
  assert.equal(proverbSystem?.en, "學生使用系統");
  const phrasalVerbSystem = api.systems.find(({ id }) => id === "phrasal-verbs");
  assert.equal(phrasalVerbSystem?.zh, "Phrasal Verb 動詞片語");
  assert.equal(phrasalVerbSystem?.en, "學習系統");
  const paper3System = api.systems.find(({ id }) => id === "dse-paper3-analysis");
  assert.equal(paper3System?.zh, "DSE 卷3 綜合能力分析");
  assert.equal(paper3System?.en, "Integrated Skills Analysis");
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
  assert.match(cssSource, /max-height:\s*min\(78vh,\s*690px\)/, "the nineteen-link menu must fit small screens");
  assert.match(cssSource, /overflow-y:\s*auto/, "the nineteen-link menu must scroll when needed");
});

test("compact quick switch supports searchable systems and a homework homebase shortcut", () => {
  const { api } = navigationRuntime();
  assert.deepEqual(Array.from(api.searchSystems("flash"), system => system.id), ["flashcards"]);
  assert.deepEqual(Array.from(api.searchSystems("功課"), system => system.id), ["schedule"]);
  assert.deepEqual(Array.from(api.searchSystems("parent communication"), system => system.id), ["parent-communication"]);
  assert.equal(api.searchSystems("definitely missing").length, 0);
  assert.match(scriptSource, /data-system-switcher-search/);
  assert.match(scriptSource, /搜尋中文或英文名稱/);
  assert.match(scriptSource, /filterSwitcherLinks/);
  assert.match(scriptSource, /找到 \$\{matchCount\} 個系統/);
  assert.match(scriptSource, /aria-label="快速返回 - 溫習營地"/);
  assert.match(scriptSource, /href="schedule-system\.html"/);
  assert.match(cssSource, /\.edmund-system-switcher__link\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(cssSource, /\.edmund-system-switcher__homebase/);
});

test("only homepage cards 11 through 30 receive their familiar quick-switch themes", () => {
  const { api } = navigationRuntime();
  const themedCards = Array.from(api.systems)
    .filter(system => Number.isInteger(system.homepageCard))
    .map(system => system.homepageCard)
    .sort((left, right) => left - right);
  assert.deepEqual(themedCards, Array.from({ length: 20 }, (_, index) => index + 11));
  assert.equal(api.systems.find(system => system.id === "schedule")?.homepageCard, 11);
  assert.equal(api.systems.find(system => system.id === "progress")?.homepageCard, 24);
  assert.equal(api.systems.find(system => system.id === "common-expression-business-speaking")?.homepageCard, 30);
  assert.equal(api.systems.find(system => system.id === "video-class")?.homepageCard, undefined);
  for (let card = 11; card <= 30; card += 1) {
    assert.match(cssSource, new RegExp(`data-homepage-card=["']${card}["']`), `homepage card ${card} must have a quick-switch theme`);
  }
  assert.match(scriptSource, /edmund-system-switcher__link--homepage/);
  assert.match(scriptSource, /data-homepage-card/);
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
