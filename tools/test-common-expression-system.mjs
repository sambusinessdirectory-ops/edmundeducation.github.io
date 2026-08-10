#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const portals = [
  {
    key: "speaking",
    navId: "common-expression-speaking",
    file: "common-expression-speaking.html",
    zh: "會話",
    en: "Speaking"
  },
  {
    key: "written",
    navId: "common-expression-written",
    file: "common-expression-written.html",
    zh: "專業寫作",
    en: "Written"
  },
  {
    key: "rhetorical-speaking",
    navId: "common-expression-rhetorical-speaking",
    file: "common-expression-rhetorical-speaking.html",
    zh: "修辭會話",
    en: "Rhetorical Speaking"
  },
  {
    key: "rhetorical-writing",
    navId: "common-expression-rhetorical-writing",
    file: "common-expression-rhetorical-writing.html",
    zh: "修辭寫作",
    en: "Rhetorical Writing"
  },
  {
    key: "professional-message",
    navId: "common-expression-professional-message",
    file: "common-expression-professional-message.html",
    zh: "商業溝通",
    en: "Professional Message"
  },
  {
    key: "business-speaking",
    navId: "common-expression-business-speaking",
    file: "common-expression-business-speaking.html",
    zh: "商務會話",
    en: "Business Speaking"
  }
];

const expectedCatalogueStats = {
  speaking: { lessons: 13, questions: 370 },
  written: { lessons: 11, questions: 330 },
  "rhetorical-speaking": { lessons: 10, questions: 300 },
  "rhetorical-writing": { lessons: 8, questions: 240 },
  "professional-message": { lessons: 8, questions: 240 },
  "business-speaking": { lessons: 8, questions: 240 }
};

const baseLessonKeys = new Set([
  "speaking:common-expression-01",
  "speaking:common-expression-02"
]);

function loadManifest() {
  return JSON.parse(read("tools/common-expression-import-manifest.json"));
}

function loadCatalogue() {
  const window = {};
  vm.runInNewContext(read("common-expression-system-data.js"), { window }, {
    filename: "common-expression-system-data.js"
  });
  vm.runInNewContext(read("common-expression-system-imported-data.js"), { window }, {
    filename: "common-expression-system-imported-data.js"
  });
  return window.EDMUND_COMMON_EXPRESSION_DATA;
}

function lessonKey(systemKey, lessonId) {
  return `${systemKey}:${lessonId}`;
}

function assertNoCurlyApostrophes(value, path = "catalogue") {
  if (typeof value === "string") {
    // Source filenames preserve the exact uploaded name for provenance. All
    // student-visible copy must follow the site's straight-apostrophe rule.
    if (!path.endsWith(".source.file")) {
      assert.equal(value.includes("’"), false, `${path}: curly apostrophe`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoCurlyApostrophes(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      assertNoCurlyApostrophes(item, `${path}.${key}`);
    }
  }
}

function javascriptFunctionSource(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing named helper function ${name}`);
  const parameters = source.indexOf("(", start);
  let parameterDepth = 0;
  let parameterEnd = -1;
  for (let index = parameters; index < source.length; index += 1) {
    if (source[index] === "(") parameterDepth += 1;
    if (source[index] === ")") {
      parameterDepth -= 1;
      if (parameterDepth === 0) { parameterEnd = index; break; }
    }
  }
  const brace = source.indexOf("{", parameterEnd);
  assert.notEqual(brace, -1, `${name}: missing function body`);
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = brace; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1] || "";
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if (character === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (character === '"' || character === "'" || character === "`") { quote = character; continue; }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  assert.fail(`${name}: unterminated function body`);
}

function sqlFunctionSource(source, name) {
  const start = source.toLowerCase().indexOf(`create or replace function public.${name.toLowerCase()}(`);
  assert.notEqual(start, -1, `missing SQL helper function public.${name}`);
  const end = source.indexOf("$$;", start);
  assert.notEqual(end, -1, `${name}: unterminated SQL function`);
  return source.slice(start, end + 3);
}

test("all six Common Expression portals carry their identity, shared navigation and PWA security metadata", () => {
  for (const portal of portals) {
    const html = read(portal.file);
    assert.match(html, /<!doctype html>/i, `${portal.file}: document type`);
    assert.match(html, new RegExp(`<body[^>]+data-common-expression-system=["']${portal.key}["']`), `${portal.file}: catalogue key`);
    assert.match(html, new RegExp(`data-edmund-system-switcher[^>]+data-system=["']${portal.navId}["']`), `${portal.file}: shared-nav id`);
    assert.match(html, new RegExp(`<title>[^<]*${portal.zh}[^<]*${portal.en}[^<]*EdmundEducation[^<]*<\\/title>`), `${portal.file}: title`);
    assert.match(html, new RegExp(`rel=["']canonical["'] href=["']https:\\/\\/edmundeducation\\.com\\/${portal.file}["']`), `${portal.file}: canonical URL`);

    for (const contract of [
      /rel=["']manifest["'] href=["']\/manifest\.webmanifest["']/,
      /rel=["']icon["'] href=["']\/favicon\.ico["'] sizes=["']any["']/,
      /rel=["']apple-touch-icon["'] sizes=["']180x180["'] href=["']\/apple-touch-icon\.png["']/,
      /name=["']mobile-web-app-capable["'] content=["']yes["']/,
      /name=["']apple-mobile-web-app-capable["'] content=["']yes["']/,
      /href=["']\/pwa-ui\.css["']/,
      /src=["']\/pwa-register\.js["']/,
      /common-expression-system\.css\?v=20260810-1/,
      /common-expression-system-config\.js\?v=20260809-1/,
      /common-expression-system-data\.js\?v=20260809-2/,
      /common-expression-system-imported-data\.js\?v=20260809-2/,
      /common-expression-system\.js\?v=20260810-2/,
      /shared-system-nav\.css\?v=20260810-3/,
      /shared-system-nav\.js\?v=20260810-3/
    ]) assert.match(html, contract, `${portal.file}: missing required portal asset or PWA contract`);

    const csp = html.match(/http-equiv=["']Content-Security-Policy["'] content="([^"]+)"/i)?.[1] || "";
    assert.match(csp, /default-src 'self'/, `${portal.file}: restrictive default CSP`);
    assert.match(csp, /script-src[^;]*'self'[^;]*https:\/\/cdn\.jsdelivr\.net/, `${portal.file}: pinned Supabase CDN allowed`);
    assert.match(csp, /connect-src[^;]*'self'[^;]*https:\/\/ookkxzgpdclzrrhfmvqx\.supabase\.co/, `${portal.file}: only the configured Supabase project is allowed`);
    assert.match(csp, /object-src 'none'/, `${portal.file}: plugins blocked`);
    assert.match(csp, /frame-src 'none'/, `${portal.file}: frames blocked`);
    assert.match(csp, /worker-src 'self'/, `${portal.file}: same-origin service worker allowed`);
    assert.match(html, /@supabase\/supabase-js@2\.110\.8/, `${portal.file}: Supabase client version must be pinned`);
    assert.match(html, /integrity=["']sha384-[^"']+["']/, `${portal.file}: CDN dependency needs SRI`);
    assert.match(html, /crossorigin=["']anonymous["']/, `${portal.file}: SRI request mode`);

    const baseDataIndex = html.indexOf("common-expression-system-data.js?v=20260809-2");
    const importedDataIndex = html.indexOf("common-expression-system-imported-data.js?v=20260809-2");
    const engineIndex = html.indexOf("common-expression-system.js?v=20260810-2");
    assert.ok(baseDataIndex < importedDataIndex, `${portal.file}: base catalogue must load before imported lessons`);
    assert.ok(importedDataIndex < engineIndex, `${portal.file}: imported lessons must load before the module engine`);
  }
});

test("the shared catalogue exposes the complete 58-lesson, 1,720-question library", () => {
  const catalogue = loadCatalogue();
  assert.ok(catalogue);
  assert.equal(String(catalogue.version), "2026-08-09.2");
  assert.deepEqual(Object.keys(catalogue.systems), portals.map(({ key }) => key));

  let lessonTotal = 0;
  let questionTotal = 0;
  for (const portal of portals) {
    const system = catalogue.systems[portal.key];
    assert.equal(system.key, portal.key);
    assert.equal(system.navId, portal.navId);
    assert.equal(system.href, portal.file);
    assert.equal(system.titleZh, portal.zh);
    assert.equal(system.titleEn, portal.en);
    assert.ok(system.descriptionZh.length > 10);
    assert.ok(system.descriptionEn.length > 10);
    assert.ok(Array.isArray(system.lessons));
    assert.equal(system.lessons.length, expectedCatalogueStats[portal.key].lessons, `${portal.key}: lesson count`);
    const systemQuestionTotal = system.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);
    assert.equal(systemQuestionTotal, expectedCatalogueStats[portal.key].questions, `${portal.key}: question count`);
    lessonTotal += system.lessons.length;
    questionTotal += systemQuestionTotal;
  }

  assert.equal(lessonTotal, 58);
  assert.equal(questionTotal, 1720);
});

test("all 56 manifest PDFs are represented exactly once and no unrequested lesson was imported", () => {
  const manifest = loadManifest();
  const catalogue = loadCatalogue();
  assert.equal(manifest.length, 56);
  assert.equal(new Set(manifest.map(({ file }) => file)).size, 56, "manifest source filenames must be unique");

  const allLessons = [];
  for (const portal of portals) {
    for (const lesson of catalogue.systems[portal.key].lessons) {
      allLessons.push({ systemKey: portal.key, lesson });
    }
  }
  const sourceCounts = new Map();
  for (const { lesson } of allLessons) {
    sourceCounts.set(lesson.source.file, (sourceCounts.get(lesson.source.file) || 0) + 1);
  }

  for (const entry of manifest) {
    assert.equal(sourceCounts.get(entry.file), 1, `${entry.file}: represented exactly once`);
    const lessonId = `common-expression-${String(entry.idNumber).padStart(2, "0")}`;
    const lesson = catalogue.systems[entry.systemKey]?.lessons.find((item) => item.id === lessonId);
    assert.ok(lesson, `${entry.systemKey}/${lessonId}: manifest lesson exists`);
    assert.equal(lesson.source.file, entry.file, `${entry.systemKey}/${lessonId}: source filename`);
    assert.equal(lesson.source.originalLessonNumber, entry.sourceNumber, `${entry.systemKey}/${lessonId}: original source number`);
    assert.equal(lesson.titleEn, entry.titleEn, `${entry.systemKey}/${lessonId}: English title`);
    assert.equal(lesson.titleZh, entry.titleZh, `${entry.systemKey}/${lessonId}: Chinese title`);
  }

  const importedLessons = allLessons.filter(({ systemKey, lesson }) => !baseLessonKeys.has(lessonKey(systemKey, lesson.id)));
  assert.equal(importedLessons.length, 56);
  assert.equal(new Set(importedLessons.map(({ lesson }) => lesson.source.file)).size, 56);
  assert.deepEqual(
    importedLessons.map(({ lesson }) => lesson.source.file).sort(),
    manifest.map(({ file }) => file).sort(),
    "the generated catalogue must contain exactly the explicit manifest, not a broad Downloads glob"
  );
});

test("lesson and exercise records are complete, correctly scoped and use straight apostrophes", () => {
  const catalogue = loadCatalogue();

  for (const portal of portals) {
    const lessons = catalogue.systems[portal.key].lessons;
    const lessonIds = Array.from(lessons, ({ id }) => id);
    const slugs = Array.from(lessons, ({ slug }) => slug);
    assert.equal(new Set(lessonIds).size, lessons.length, `${portal.key}: lesson ids unique within system`);
    assert.equal(new Set(slugs).size, lessons.length, `${portal.key}: lesson slugs unique within system`);

    const questionIds = [];
    for (const lesson of lessons) {
      const key = lessonKey(portal.key, lesson.id);
      const imported = !baseLessonKeys.has(key);
      assert.match(lesson.id, /^common-expression-(?:0[1-9]|[1-9]\d{1,3})$/, `${key}: canonical lesson id`);
      assert.equal(lesson.questions.length, imported ? 30 : 20, `${key}: exercise count`);
      assert.ok(lesson.source.pageCount > 0, `${key}: source page count`);
      assert.ok(lesson.examples.length >= 3, `${key}: worked examples`);
      assert.ok(lesson.reminders.length >= 5, `${key}: usage safeguards`);
      assert.ok(lesson.usageGroups.length >= (imported ? 1 : 16), `${key}: structured usage coverage`);
      assert.ok(lesson.summaryPoints.length > 0, `${key}: summary points`);

      const lessonNumber = lesson.id.match(/common-expression-(\d+)$/)?.[1];
      for (const question of lesson.questions) {
        questionIds.push(question.id);
        assert.match(question.id, new RegExp(`^ce${lessonNumber}-q(?:0[1-9]|[12]\\d|30)$`), `${portal.key}/${question.id}: lesson-scoped question id`);
        assert.ok(question.promptEn.trim(), `${portal.key}/${question.id}: English prompt`);
        assert.ok(question.promptZh.trim(), `${portal.key}/${question.id}: Traditional Chinese prompt`);
        assert.ok(question.answerEn.trim(), `${portal.key}/${question.id}: English answer`);
        assert.ok(question.answerZh.trim(), `${portal.key}/${question.id}: Traditional Chinese answer`);
        assert.ok(Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.includes(question.answerEn), `${portal.key}/${question.id}: canonical answer is accepted`);
      }

      assertNoCurlyApostrophes(lesson, `${portal.key}.${lesson.id}`);
    }
    assert.equal(new Set(questionIds).size, questionIds.length, `${portal.key}: question ids unique within system`);
  }

  const speaking = catalogue.systems.speaking.lessons;
  assert.deepEqual(Array.from(speaking.slice(0, 2), ({ id }) => id), ["common-expression-01", "common-expression-02"]);
  assert.deepEqual(Array.from(speaking.slice(0, 2), ({ titleEn }) => titleEn), ["See you around", "That's good to hear"]);
  assert.equal(speaking[0].source.file, "Common Expression 1 - See you around.pdf");
  assert.equal(speaking[0].source.pageCount, 17);
  assert.equal(speaking[1].source.file, "Common Expression 2 - “That’s good to hear.pdf");
  assert.equal(speaking[1].source.pageCount, 35);
  assert.equal(speaking[0].questions[0].answerEn, "It was nice talking to you. See you around.");
  assert.equal(speaking[1].questions[0].answerEn, "A: I'm feeling much better today.\nB: That's good to hear.");
});

test("the frontend uses the shared Flashcard login token and the three bounded Common Expression persistence RPCs", () => {
  const config = read("common-expression-system-config.js");
  const engine = read("common-expression-system.js");
  assert.match(config, /studentLoginRpc:\s*["']flashcard_student_login["']/);
  assert.match(config, /snapshotRpc:\s*["']common_expression_student_snapshot["']/);
  assert.match(config, /saveStateRpc:\s*["']common_expression_save_lesson_state["']/);
  assert.match(config, /setBookmarkRpc:\s*["']common_expression_set_bookmark["']/);
  assert.match(engine, /const SESSION_KEY = `edmund-common-expression-\$\{SYSTEM_KEY\}-session-v1`/);
  assert.match(engine, /window\.EdmundSystemNav\?\.rememberStudentSession/);
  assert.match(engine, /window\.EdmundSystemNav\?\.getStudentSession/);
  assert.match(engine, /window\.EdmundSystemNav\?\.forgetStudentSession/);
  assert.match(engine, /signInAnonymously\(\)/, "RPC calls require an authenticated anonymous Supabase session");
  assert.match(engine, /p_token:\s*state\.token/);
  assert.match(engine, /p_system_key:\s*SYSTEM_KEY/);
  assert.match(engine, /p_lesson_id:\s*lessonId/);
  assert.match(engine, /p_state:/);
  assert.match(engine, /p_duration_ms:/);
  assert.match(engine, /p_bookmarked:/);
  assert.match(engine, /localStorage\.setItem/, "local safety copy remains available if the network is interrupted");
  assert.doesNotMatch(engine, /service_role|SUPABASE_SERVICE|secret[_-]?key/i, "browser code must never contain a server secret");
});

test("all Common Expression interfaces use the requested two-line title and one-page partial/all submission", () => {
  const engine = read("common-expression-system.js");
  assert.match(engine, /Common Expression<br><span[^>]*>常用語\$\{escapeHtml\(SYSTEM\.titleZh\)\} \$\{escapeHtml\(SYSTEM\.titleEn\)\}/, "title must break after Common Expression and keep the section on line two");
  assert.match(engine, /data-question-list/);
  assert.match(engine, /lesson\.questions\.map\(\(question, index\)/, "all 20/30 questions render from the complete lesson array");
  assert.doesNotMatch(engine, /questionIndex/, "the legacy one-question pager must be removed");
  assert.match(engine, /data-save-drafts/);
  assert.match(engine, /data-submit-partial/);
  assert.match(engine, /data-submit-all/);
  const submit = javascriptFunctionSource(engine, "submitAnswers");
  assert.match(submit, /targets/);
  assert.match(submit, /acceptedAnswers/);
  assert.match(submit, /persistLessonState\s*\(\s*lesson\.id/);
  assert.match(submit, /addLocalQuestionCompletion/);
  assert.match(javascriptFunctionSource(engine, "updateDraftsFromFields"), /checkedAnswer/, "edited drafts must not display feedback for an older answer");
});

test("the Common Expression dashboard has persistent question and time charts plus a full-dashboard link", () => {
  const engine = read("common-expression-system.js");
  assert.match(engine, /data-toggle-progress/);
  assert.match(engine, /data-question-chart/);
  assert.match(engine, /data-time-chart/);
  assert.match(engine, /student-progress\.html/);
  assert.match(engine, /PROGRESS_PANEL_PREFERENCE_KEY/);
  assert.match(engine, /CUMULATIVE_PROGRESS_PREFERENCE_KEY/);
  assert.match(engine, /localStorage\.setItem\(userPreferenceKey/);
  assert.match(engine, /\["week", "Week"\]/);
  assert.match(engine, /\["month", "Month"\]/);
  assert.match(engine, /\["half-year", "Half a Year"\]/);
  assert.match(engine, /\["ytd", "Year to Date"\]/);
  assert.match(engine, /\["year", "1 Year"\]/);
  assert.match(engine, /\["all", "All Time"\]/);
  assert.match(javascriptFunctionSource(engine, "progressChartSvg"), /data-common-\$\{type\}-day/);
  assert.match(javascriptFunctionSource(engine, "renderProgressDashboard"), /questionProgressSeries/);
  assert.match(javascriptFunctionSource(engine, "renderProgressDashboard"), /timeProgressSeries/);
});

test("the homepage exposes the requested six three-line portal cards", () => {
  const homepage = read("index.html");
  const expectations = [
    ["common-expression-speaking.html", "會話", "Speaking"],
    ["common-expression-written.html", "專業寫作", "Written"],
    ["common-expression-rhetorical-speaking.html", "修辭會話", "Rhetorical Speaking"],
    ["common-expression-rhetorical-writing.html", "修辭寫作", "Rhetorical Writing"],
    ["common-expression-professional-message.html", "商業溝通", "Professional Message"],
    ["common-expression-business-speaking.html", "商務會話", "Business speaking"]
  ];
  for (const [href, zh, en] of expectations) {
    assert.match(
      homepage,
      new RegExp(`href=["']${href.replace(".", "\\.")}["'][\\s\\S]*?<span class=["']category-name["']>(?:<span[^>]*>)?Common Expression(?:<\\/span>)?<br>常用語<br>${zh} ${en}<\\/span>`),
      `${href}: exact requested three-line label`
    );
  }
});

test("the shared system switcher lists all six Common Expression destinations", () => {
  const nav = read("shared-system-nav.js");
  for (const portal of portals) {
    assert.match(nav, new RegExp(`id:\\s*["']${portal.navId}["'][\\s\\S]{0,300}?href:\\s*["']${portal.file.replace(".", "\\.")}["']`), `${portal.file}: switcher destination`);
    assert.match(nav, new RegExp(`edmund-common-expression-${portal.key}-session-v1`), `${portal.key}: shared-session bridge key`);
  }
});

test("the Supabase migration isolates per-student data behind closed, token-derived authenticated RPCs", () => {
  const sql = read("supabase-common-expression-system.sql");
  const lower = sql.toLowerCase();

  assert.match(lower, /create table(?: if not exists)? public\.common_expression_lesson_states/);
  assert.match(lower, /create table(?: if not exists)? public\.common_expression_bookmarks/);
  assert.match(lower, /create table(?: if not exists)? public\.common_expression_question_completions/);
  assert.match(lower, /create table(?: if not exists)? public\.common_expression_time_activity_days/);
  assert.match(lower, /alter table public\.common_expression_lesson_states enable row level security/);
  assert.match(lower, /alter table public\.common_expression_bookmarks enable row level security/);
  assert.match(lower, /alter table public\.common_expression_question_completions enable row level security/);
  assert.match(lower, /alter table public\.common_expression_time_activity_days enable row level security/);
  for (const table of ["common_expression_lesson_states", "common_expression_bookmarks", "common_expression_question_completions", "common_expression_time_activity_days"]) {
    assert.match(lower, new RegExp(`revoke all on (?:table )?public\\.${table}[\\s\\S]{0,120}?from public, anon, authenticated`));
  }

  for (const rpc of [
    "common_expression_student_snapshot",
    "common_expression_save_lesson_state",
    "common_expression_set_bookmark"
  ]) {
    assert.match(lower, new RegExp(`create or replace function public\\.${rpc}\\(`));
    assert.match(lower, new RegExp(`revoke all on function public\\.${rpc}\\([\\s\\S]{0,220}?from public, anon, authenticated`));
    assert.match(lower, new RegExp(`grant execute on function public\\.${rpc}\\([\\s\\S]{0,220}?to authenticated`));
  }

  assert.ok((lower.match(/security definer/g) || []).length >= 3, "each public RPC must explicitly own its privileged boundary");
  assert.ok((lower.match(/set search_path\s*=\s*''/g) || []).length >= 3, "SECURITY DEFINER RPCs must use an empty search path");
  assert.ok((lower.match(/public\.flashcard_session_student_id\(p_token\)/g) || []).length >= 3, "every RPC derives the student from the shared Flashcard token");
  for (const { key } of portals) assert.ok(lower.includes(`'${key}'`), `closed system allowlist includes ${key}`);
  assert.match(lower, /jsonb_typeof\(p_state\)\s*(?:<>|!=)\s*'object'/, "state payload must be a JSON object");
  assert.match(lower, /octet_length\(p_state::text\)|length\(p_state::text\)/, "state payload size must be bounded");
  assert.match(lower, /p_duration_ms\s*(?:<|between)/, "duration input must be bounded");
  assert.match(lower, /p_lesson_id[^;]{0,220}(?:~|length|char_length)/s, "lesson ids must be validated before persistence");
  assert.doesNotMatch(lower, /grant\s+(?:all|select|insert|update|delete)[^;]+common_expression_(?:lesson_states|bookmarks|question_completions|time_activity_days)[^;]+to\s+(?:anon|authenticated)/, "clients only receive RPC execution, never direct table access");
  const snapshot = sqlFunctionSource(sql, "common_expression_student_snapshot");
  assert.match(snapshot, /questionActivity/);
  assert.match(snapshot, /timeActivity/);
  const save = sqlFunctionSource(sql, "common_expression_save_lesson_state");
  assert.match(save, /pg_advisory_xact_lock/, "concurrent first saves need a lesson-scoped lock");
  assert.match(save, /v_duration_delta_ms/);
  assert.match(save, /common_expression_question_completions/);
  assert.match(save, /common_expression_time_activity_days/);
  assert.match(save, /Asia\/Hong_Kong/);
  assert.match(save, /answer\.value\s*->\s*'attempts'/, "first checked submissions count exactly once, matching the established learning dashboards");
  assert.doesNotMatch(save, /answer\.value\s*->>\s*'correct'\)\s*::boolean/, "a submitted answer awaiting correction must not disappear from question activity");
  assert.match(lower, /checkedanswer/, "draft answers retain the last submitted text without weakening validation");
  const lessonMatcher = sqlFunctionSource(sql, "_common_expression_state_matches_lesson");
  assert.match(lessonMatcher, /v_expected_question_prefix/);
  assert.match(lessonMatcher, /v_question_id\s+not like\s+v_expected_question_prefix/, "a handcrafted question id must belong to the selected lesson");
});

test("RFC3339 timestamps accept Supabase +00:00 offsets and are normalized before comparison", () => {
  const sql = read("supabase-common-expression-system.sql");
  const engine = read("common-expression-system.js");
  const pattern = sql.match(/v_timestamp_pattern\s+constant\s+text\s*:=\s*'([^']+)'/i)?.[1];
  assert.ok(pattern, "the state validator must declare one timestamp pattern");
  const timestamp = new RegExp(pattern);
  for (const accepted of [
    "2026-08-09T08:09:10Z",
    "2026-08-09T08:09:10.123456Z",
    "2026-08-09T08:09:10+00:00",
    "2026-08-09T04:09:10-04:00"
  ]) assert.match(accepted, timestamp, `valid RFC3339 timestamp rejected: ${accepted}`);
  for (const rejected of [
    "2026-08-09T08:09:10",
    "2026-08-09 08:09:10+00:00",
    "2026-08-09T08:09:10+0000"
  ]) assert.doesNotMatch(rejected, timestamp, `invalid timestamp accepted: ${rejected}`);

  const normalizer = javascriptFunctionSource(engine, "normalizeTimestamp");
  assert.match(normalizer, /new Date\(/);
  assert.match(normalizer, /Number\.isNaN|isNaN/);
  assert.match(normalizer, /\.toISOString\(\)/, "valid offsets must become one canonical UTC form");
  const stateNormalizer = javascriptFunctionSource(engine, "normalizeLessonState");
  assert.ok((stateNormalizer.match(/normalizeTimestamp\(/g) || []).length >= 3, "lesson, completion and per-answer timestamps must all be normalized");
});

test("the authoritative database catalogue has exact lesson and question-count parity with all 58 lessons", () => {
  const sql = read("supabase-common-expression-system.sql");
  const lower = sql.toLowerCase();
  const catalogue = loadCatalogue();
  assert.match(lower, /create table(?: if not exists)? public\.common_expression_catalogue_lessons/);
  assert.match(lower, /primary key\s*\(\s*system_key\s*,\s*lesson_id\s*\)/s);
  assert.ok((lower.match(/foreign key\s*\(\s*system_key\s*,\s*lesson_id\s*\)\s*references\s+public\.common_expression_catalogue_lessons/gs) || []).length >= 2, "states and bookmarks must both reference the authoritative catalogue");

  const seedBlocks = [...lower.matchAll(
    /insert into public\.common_expression_catalogue_lessons\s*\([\s\S]*?\)\s*values\s*([\s\S]*?)\s*on conflict\s*\(\s*system_key\s*,\s*lesson_id\s*\)[\s\S]*?;/g
  )].map((match) => match[1]);
  assert.ok(seedBlocks.length, "catalogue seed insert is required");
  const seedRows = seedBlocks.flatMap((block) => [...block.matchAll(
    /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(true|false)\s*\)/g
  )].map(([, systemKey, lessonId, questionCount, contentVersion, enabled]) => ({
    systemKey,
    lessonId,
    questionCount: Number(questionCount),
    contentVersion: Number(contentVersion),
    enabled: enabled === "true"
  })));

  const expected = new Map();
  for (const portal of portals) {
    for (const lesson of catalogue.systems[portal.key].lessons) {
      expected.set(lessonKey(portal.key, lesson.id), lesson.questions.length);
    }
  }
  const actual = new Map();
  for (const row of seedRows) {
    const key = lessonKey(row.systemKey, row.lessonId);
    assert.equal(actual.has(key), false, `${key}: duplicate SQL catalogue seed`);
    assert.equal(row.enabled, true, `${key}: imported lesson must be enabled`);
    assert.ok(row.contentVersion >= 1, `${key}: positive content version`);
    actual.set(key, row.questionCount);
  }

  assert.equal(expected.size, 58);
  assert.equal(actual.size, 58);
  assert.deepEqual([...actual.keys()].sort(), [...expected.keys()].sort(), "SQL and browser catalogue lesson keys must match exactly");
  for (const [key, questionCount] of expected) {
    assert.equal(actual.get(key), questionCount, `${key}: SQL question_count matches the lesson data`);
  }
});

test("stale local or multi-tab snapshots merge every answer by its own updatedAt timestamp", () => {
  const sql = read("supabase-common-expression-system.sql");
  const engine = read("common-expression-system.js");
  const sqlMerge = sqlFunctionSource(sql, "_common_expression_merge_answers");
  assert.ok((sqlMerge.match(/jsonb_each/gi) || []).length >= 2, "merge must inspect stored and incoming answer maps");
  assert.match(sqlMerge, /full(?:\s+outer)?\s+join/i, "questions present on only one side must survive");
  assert.match(sqlMerge, /updatedAt/);
  assert.match(sqlMerge, /_common_expression_rfc3339_timestamp\s*\(|::timestamptz/i, "per-answer RFC3339 timestamps must be parsed and compared as timestamps");
  assert.match(sqlFunctionSource(sql, "common_expression_save_lesson_state"), /_common_expression_merge_answers\s*\(/i);

  const clientMerge = javascriptFunctionSource(engine, "mergeLessonStates");
  assert.match(clientMerge, /answers/);
  assert.match(clientMerge, /updatedAt/);
  assert.match(clientMerge, /Date\.parse|timestampValue|normalizeTimestamp/);
  assert.match(clientMerge, /Object\.keys|Object\.entries|new Set/, "the union of answer ids must be considered");
  const snapshotRecovery = javascriptFunctionSource(engine, "applySnapshot");
  assert.match(snapshotRecovery, /mergeLessonStates\s*\(/, "server and local recovery must use the same per-answer merge");
  assert.doesNotMatch(snapshotRecovery, /Date\.parse\([^\n]+updatedAt[^\n]+\)\s*>\s*Date\.parse\([^\n]+updatedAt/, "whole-lesson last-write-wins would discard newer individual answers");
});

test("dirty local lesson states survive failures and retry on recovery, pagehide, visibility and navigation", () => {
  const engine = read("common-expression-system.js");
  assert.match(engine, /dirtyLessonIds:\s*new Set\(\)/, "dirty lessons need explicit in-memory tracking");
  const localWriter = javascriptFunctionSource(engine, "writeLocalSnapshot");
  assert.match(localWriter, /dirtyLessonIds/, "dirty ids must persist in the local recovery snapshot");
  const snapshotRecovery = javascriptFunctionSource(engine, "applySnapshot");
  assert.match(snapshotRecovery, /dirtyLessonIds/);
  assert.match(snapshotRecovery, /retryDirtyLessonStates\s*\(/, "recovered dirty states must retry automatically");

  const answerHandler = javascriptFunctionSource(engine, "submitAnswers");
  assert.match(answerHandler, /markLessonDirty\s*\(\s*lesson\.id/);
  assert.ok(answerHandler.indexOf("markLessonDirty") < answerHandler.indexOf("persistLessonState"), "mark dirty before attempting the network save");
  const persistence = javascriptFunctionSource(engine, "persistLessonState");
  assert.match(persistence, /clearLessonDirty|dirtyLessonIds\.delete/);
  assert.match(persistence, /snapshot\.updatedAt|expectedUpdatedAt|revision/, "an older save response must not clear a newer local mutation");
  javascriptFunctionSource(engine, "retryDirtyLessonStates");

  assert.match(engine, /addEventListener\(["']pagehide["'][\s\S]{0,260}?writeLocalSnapshot\(\)[\s\S]{0,260}?retryDirtyLessonStates\(/);
  assert.match(engine, /visibilitychange[\s\S]{0,320}?document\.hidden[\s\S]{0,260}?retryDirtyLessonStates\(/);
  assert.match(engine, /data-dashboard-button|data-back-dashboard/);
  assert.match(engine, /(?:data-dashboard-button|data-back-dashboard)[\s\S]{0,500}?retryDirtyLessonStates\(/, "in-app navigation must trigger a best-effort retry");
});
