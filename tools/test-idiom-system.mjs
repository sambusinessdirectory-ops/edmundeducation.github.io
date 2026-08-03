import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function loadContent() {
  const context = { window: {} };
  vm.runInNewContext(read("idiom-system-data.js"), context, { filename: "idiom-system-data.js" });
  return context.window.EDMUND_IDIOM_SYSTEM_DATA;
}

test("lesson data contains 25 complete eight-page lessons and all 1,250 questions", () => {
  const content = loadContent();
  assert.equal(content.version, "1");
  assert.equal(content.lessonCount, 25);
  assert.equal(content.questionCount, 1250);
  assert.equal(content.lessons.length, 25);
  assert.doesNotMatch(JSON.stringify(content), /\[object Object\]/);
  assert.doesNotMatch(JSON.stringify(content), /\/Users\/|[A-Z]:\\/);
  assert.doesNotMatch(
    JSON.stringify(content),
    /The expression does not simply mean|The Original Image|原來的畫面|Communicative Function|溝通功能/i
  );
  assert.doesNotMatch(JSON.stringify(content), /\bMia\b|米婭/);
  assert.match(JSON.stringify(content), /\bTom\b|湯姆/);

  const allQuestionIds = new Set();
  for (let lessonIndex = 0; lessonIndex < content.lessons.length; lessonIndex += 1) {
    const lessonNumber = lessonIndex + 1;
    const lessonId = `idiom-${String(lessonNumber).padStart(2, "0")}`;
    const lesson = content.lessons[lessonIndex];
    assert.equal(lesson.id, lessonId);
    assert.equal(lesson.order, lessonNumber);
    assert.equal(lesson.version, "1");
    assert.ok(lesson.titleZh);
    assert.ok(lesson.titleEn);
    assert.ok(Array.isArray(lesson.formulas) && lesson.formulas.length > 0);
    assert.ok(Array.isArray(lesson.examples) && lesson.examples.length > 0);
    assert.ok(lesson.meaning?.zh && lesson.meaning?.en);
    assert.ok(lesson.register?.summaryZh && lesson.register?.summaryEn);
    assert.ok(lesson.fixedVariable?.fixed);
    assert.ok(Array.isArray(lesson.specificForms) && lesson.specificForms.length > 0);
    assert.ok(Array.isArray(lesson.benefits) && lesson.benefits.length > 0);
    assert.ok(Array.isArray(lesson.origin?.history) && lesson.origin.history.length > 0);
    assert.ok(Array.isArray(lesson.rules) && lesson.rules.length > 0);
    assert.ok(lesson.instructions?.zh && lesson.instructions?.en);
    assert.ok(Number.isInteger(lesson.source?.pageCount) && lesson.source.pageCount > 0);
    assert.equal(lesson.questions.length, 50);
    assert.equal(new Set(lesson.questions.map(({ id }) => id)).size, 50);
    assert.equal(
      lesson.questions.map(({ id }) => id).join(","),
      Array.from({ length: 50 }, (_, index) => `${lessonId}-q${String(index + 1).padStart(2, "0")}`).join(",")
    );

    for (const question of lesson.questions) {
      assert.ok(!allQuestionIds.has(question.id), `duplicate question ID ${question.id}`);
      allQuestionIds.add(question.id);
      assert.ok(question.answer.toLocaleLowerCase().includes(question.highlight.toLocaleLowerCase()));
      assert.ok(question.prompt);
      assert.ok(question.promptZh);
      assert.ok(question.starter);
      assert.ok(question.answerZh);
      assert.ok(question.sourcePage >= 1 && question.sourcePage <= lesson.source.pageCount);
      assert.ok(question.answerSourcePage >= 1 && question.answerSourcePage <= lesson.source.pageCount);
      assert.ok(lesson.source.answerKeyPdfPages.includes(question.answerSourcePage));
    }

    if (lessonNumber > 1) {
      const assertNestedHighlights = (value, label) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => assertNestedHighlights(item, `${label}[${index}]`));
          return;
        }
        if (!value || typeof value !== "object") return;
        if (typeof value.highlight === "string" && value.highlight) {
          const englishText = ["en", "english", "answer", "example", "formula"]
            .map((key) => typeof value[key] === "string" ? value[key] : "")
            .join(" ")
            .toLocaleLowerCase();
          assert.ok(
            englishText.includes(value.highlight.toLocaleLowerCase()),
            `${label}.highlight must be an exact substring of its English text`
          );
        }
        for (const [key, item] of Object.entries(value)) {
          if (key !== "highlight") assertNestedHighlights(item, `${label}.${key}`);
        }
      };
      assertNestedHighlights(lesson, lesson.id);
    }
  }
  assert.equal(allQuestionIds.size, 1250);
});

test("portal exposes the eight-step flow, keeps artwork post-login, and has no START/ROLL login decoration", () => {
  const html = read("idiom-system.html");
  const app = read("idiom-system.js");
  const data = read("idiom-system-data.js");
  const loginView = html.match(/<section class="view" data-view="login">[\s\S]*?<section class="view" data-view="dashboard"/)?.[0] || "";

  assert.equal((html.match(/data-step="/g) || []).length, 8);
  assert.match(html, /data-jump-to-exercise/);
  assert.match(html, /data-lesson-search-input/);
  assert.match(html, /class="lesson-search-label"[^>]*>搜尋關鍵字</);
  assert.match(html, /data-clear-lesson-search/);
  assert.ok(html.indexOf('class="lesson-search-panel') < html.indexOf('data-lesson-choice-grid'), "search must appear directly before the lesson cards");
  assert.doesNotMatch(html, /SEARCH ALL LESSON CONTENT/);
  assert.match(read("idiom-system.css"), /\.lesson-search-controls\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s+auto/s);
  assert.match(read("idiom-system.css"), /\.lesson-search-controls input\s*\{[^}]*border:\s*2px/s);
  assert.match(app, /function searchLessons/);
  assert.match(app, /data-search-question/);
  assert.doesNotMatch(loginView, /class="hero-symbol"/);
  assert.doesNotMatch(loginView, /\bSTART\b|\bROLL\b/);
  assert.doesNotMatch(loginView, /start-the-ball-rolling\.webp|hero-illustration/);
  assert.match(data, /assets\/idiom-system\/start-the-ball-rolling\.webp/);
  assert.match(app, /class="lesson-choice-illustration"/);
  assert.match(app, /class="exercise-idiom-illustration"/);
  assert.match(html, /QUESTIONS DONE/i);
  assert.match(html, /TIME SPENT/i);
  assert.match(html, /data-system="idioms"/);
  assert.match(html, /idiom-system-data\.js/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /@supabase\/supabase-js@2\.110\.8\/dist\/umd\/supabase\.js/);
  assert.match(html, /integrity="sha384-[^"]+"/);
  assert.doesNotMatch(html, /@supabase\/supabase-js@2"><\/script>/);
});

test("student-facing Idiom copy contains no round counter", () => {
  const html = read("idiom-system.html");
  const app = read("idiom-system.js");
  assert.doesNotMatch(`${html}\n${app}`, /第\s*\$?\{?[^\n<]{0,30}輪|分輪|改正輪/);
});

test("frontend uses isolated Idiom state while retaining the shared student login contract", () => {
  const config = read("idiom-system-config.js");
  const app = read("idiom-system.js");

  assert.match(config, /edmund-idiom-system\.edmundeducation\.workers\.dev/);
  assert.match(config, /adminUsername:\s*"Sam Admin Idiom"/);
  assert.match(config, /studentLoginRpc:\s*"flashcard_student_login"/);
  assert.match(app, /edmund-idiom-system-session-v1/);
  assert.match(app, /const LESSON_PAGES = 8/);
  assert.match(app, /const EXERCISE_PAGE = 8/);
  assert.match(app, /function renderRegisterPage/);
  assert.match(app, /function renderFixedVariablePage/);
  assert.match(app, /function renderSpecificFormsPage/);
  assert.match(app, /function renderOriginPage/);
  assert.match(app, /state\.visitedLessonPages\.has\(step\)/);
  assert.doesNotMatch(app, /classList\.toggle\("is-complete", step < state\.lessonPage\)/);
  assert.match(app, /const operationUserId = String\(state\.user\.id/);
  assert.match(app, /true, operationAuthToken\)/);
  assert.match(app, /document\.visibilityState !== "hidden"/);
  assert.doesNotMatch(config, /password\s*:/i);
});

test("visual system uses the warm apple-juice palette and preserves gold completion", () => {
  const css = read("idiom-system.css");

  assert.match(css, /--blue:\s*#e84a1b/);
  assert.match(css, /--blue-bright:\s*#ff6a1a/);
  assert.match(css, /--accent-text:\s*#a91f0f/);
  assert.match(css, /\.eyebrow[\s\S]*?color:\s*var\(--accent-text\)/);
  assert.match(css, /\.lesson-choice\.is-complete/);
  assert.match(css, /\.lesson-choice-card \.lesson-choice\.is-complete:has\(\.lesson-choice-illustration\)/);
  assert.match(css, /#e5b94f/);
  assert.match(css, /\.lesson-choice-illustration/);
  assert.match(css, /@media \(max-width:\s*720px\)/);
});

test("the English Idiom login title stays close to the Chinese title size", () => {
  const css = read("idiom-system.css");
  const idiomTitleRule = css.match(/\.hero-copy h1 span\s*\{([^}]*)\}/)?.[1] || "";
  assert.ok(idiomTitleRule, "the English Idiom title needs an explicit style rule");
  const emSize = idiomTitleRule.match(/font-size:\s*([0-9.]+)em/i)?.[1];
  if (emSize !== undefined) {
    assert.ok(Number(emSize) >= 0.8, `the English Idiom title is only ${emSize}em of the Chinese title`);
  } else {
    assert.match(
      idiomTitleRule,
      /font-size:\s*(?:inherit|clamp\()/i,
      "the English Idiom title should inherit or use a near-peer responsive size"
    );
  }
});

test("homepage and shared switcher both link to the Idiom portal", () => {
  const home = read("index.html");
  const sharedNav = read("shared-system-nav.js");
  const idiomCard = home.match(/<a class="category idiom-system-card"[\s\S]*?<\/a>/)?.[0] || "";
  const idiomStyles = home.match(/\.idiom-system-card\s*\{[\s\S]*?(?=\n\s*\.(?:proverb|schedule)-system-card\s*\{)/)?.[0] || "";

  assert.match(home, /href="idiom-system\.html"/);
  assert.match(home, /英文慣用語[\s\S]*?Idiom[\s\S]*?學習系統/);
  assert.doesNotMatch(idiomCard, /class="idiom-wordmark"/);
  assert.doesNotMatch(idiomCard, /\bSTART\b|\bROLL\b/);
  assert.doesNotMatch(idiomCard, /<img|start-the-ball-rolling\.webp/);
  assert.match(idiomCard, /class="idiom-book-spine"/);
  assert.match(idiomCard, /class="idiom-book-stitching"/);
  assert.match(idiomCard, /class="idiom-book-strap"/);
  assert.match(idiomCard, /class="idiom-book-medallion"/);
  assert.ok(idiomStyles, "the homepage Idiom card styles must exist");
  assert.match(idiomStyles, /linear-gradient\(135deg,\s*#681612/);
  assert.match(idiomStyles, /\.idiom-book-medallion/);
  assert.doesNotMatch(idiomStyles, /\.idiom-wordmark\b/, "removed wordmark styles must not remain public CSS");
  assert.match(sharedNav, /id:\s*"idioms"/);
  assert.match(sharedNav, /href:\s*"idiom-system\.html"/);
  assert.match(sharedNav, /edmund-idiom-system-session-v1/);
});
