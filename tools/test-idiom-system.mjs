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

test("lesson data contains 138 complete eight-page lessons and all 6,900 questions", () => {
  const content = loadContent();
  assert.equal(content.version, "1");
  assert.equal(content.lessonCount, 138);
  assert.equal(content.questionCount, 6900);
  assert.equal(content.lessons.length, 138);
  assert.doesNotMatch(JSON.stringify(content), /\[object Object\]/);
  assert.doesNotMatch(JSON.stringify(content), /\/Users\/|[A-Z]:\\/);
  assert.doesNotMatch(
    JSON.stringify(content),
    /The expression does not simply mean|The Original Image|The Literal Picture|原來的畫面|字面畫面|Communicative Function|Communication Purpose|溝通功能|溝通用途/i
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
      if (lessonNumber >= 26) {
        assert.equal(question.sourcePages?.[0], question.sourcePage);
        assert.equal(question.answerSourcePages?.[0], question.answerSourcePage);
        assert.ok(question.sourcePages.every((page) => lesson.source.exercisePdfPages.includes(page)));
        assert.ok(question.answerSourcePages.every((page) => lesson.source.answerKeyPdfPages.includes(page)));
        assert.doesNotMatch(question.promptZh, /^(?:\[[\s\S]*\]|［[\s\S]*］|【[\s\S]*】)$/);
        assert.doesNotMatch(question.answerZh, /^(?:\[[\s\S]*\]|［[\s\S]*］|【[\s\S]*】)$/);
      }
    }

    if (lessonNumber >= 26) {
      assert.ok(lesson.titleZh.length <= 24, `${lessonId} needs a concise Chinese card title`);
      assert.doesNotMatch(lesson.titleZh, /按原檔示範答案|[:：]|[，。；;,;]$/u);
      assert.doesNotMatch(lesson.titleZh, /[/,;:]/u, `${lessonId} Chinese title uses full-width punctuation`);
      assert.ok(Array.isArray(lesson.source.contentPdfPages));
      assert.ok(Array.isArray(lesson.source.exercisePdfPages) && lesson.source.exercisePdfPages.length > 0);
      assert.ok(Array.isArray(lesson.source.answerKeyPdfPages) && lesson.source.answerKeyPdfPages.length > 0);
      if (lessonNumber === 72) assert.equal(lesson.source.contentPdfPages.length, 0);
      else assert.ok(lesson.source.contentPdfPages.length > 0);
      lesson.specificForms.forEach((form) => {
        assert.ok(form.descriptionZh && form.descriptionEn, `${lessonId} bilingual specific-form explanation`);
      });
      [...lesson.benefits, ...lesson.rules].forEach((card) => {
        assert.ok(card.zh && card.en, `${lessonId} bilingual learning card`);
      });
      lesson.origin.history.forEach((card) => {
        assert.ok(card.zh && card.en, `${lessonId} bilingual origin card`);
      });
      const checkBilingualExamples = (value, label = lessonId) => {
        const balancedDisplayDelimiters = (raw) => {
          const text = String(raw || "");
          for (const [opening, closing] of [["(", ")"], ["[", "]"], ["［", "］"], ["【", "】"], ["「", "」"], ["“", "”"]]) {
            let depth = 0;
            for (const character of text) {
              if (character === opening) depth += 1;
              else if (character === closing && --depth < 0) return false;
            }
            if (depth !== 0) return false;
          }
          return (text.match(/"/g) || []).length % 2 === 0;
        };
        if (Array.isArray(value)) {
          value.forEach((item, index) => checkBilingualExamples(item, `${label}[${index}]`));
          return;
        }
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value.examples)) {
          const parentChinese = new Set(
            [value.zh, value.descriptionZh].filter((item) => typeof item === "string" && item.trim())
          );
          value.examples.forEach((example, index) => {
            assert.ok(example.en, `${label}.examples[${index}] English`);
            assert.match(example.zh || "", /[\u3400-\u9fff]/, `${label}.examples[${index}] Chinese`);
            assert.doesNotMatch(example.en, /[\[［(（【]\s*$/u, `${label}.examples[${index}] trailing wrapper`);
            assert.ok(balancedDisplayDelimiters(example.en), `${label}.examples[${index}] balanced English wrappers`);
            assert.ok(balancedDisplayDelimiters(example.zh), `${label}.examples[${index}] balanced Chinese wrappers`);
            assert.ok(
              !parentChinese.has(example.zh),
              `${label}.examples[${index}] must not reuse its parent explanation as a false translation`
            );
          });
        }
        Object.entries(value).forEach(([key, item]) => checkBilingualExamples(item, `${label}.${key}`));
      };
      checkBilingualExamples(lesson);

      const genericTeachingCopy = /Source Exercise Pattern|Concise Idiomatic Expression|Follow the Source Exercise Meaning|Source Coverage|the meaning and usage of the expression|按原檔示範答案所顯示的意思及用法|原檔練習句式|簡潔地運用慣用語|按照原檔練習意思運用|原檔內容範圍|Use the target idiom with this source pattern|按照這個原檔句式運用目標慣用語|Apply this source point|按照原檔列出的這項重點運用目標慣用語/i;
      if (lessonNumber !== 72) {
        assert.doesNotMatch(JSON.stringify(lesson), genericTeachingCopy, `${lessonId} uses generic teaching fallback copy`);
      }

      const substantiveChinese = (raw) => {
        const text = String(raw || "").replace(/\s+/g, " ").trim();
        const ratioText = text.replace(/(?:句式|公式|句法框架)\s*[:：].*$/u, "");
        const cjk = (ratioText.match(/[\u3400-\u9fff]/gu) || []).length;
        const latin = (ratioText.match(/[A-Za-z]/g) || []).length;
        return cjk >= 2
          && latin <= Math.max(60, cjk * 3)
          && !/\bSource\s*:|Rewrite or respond|A strong exercise should|This is accidental|Do not use the idiom|:::|\]\s*[●•▪◦]/i.test(text)
          && !/^(?:的|和\s)/u.test(text);
      };
      const checkChineseFields = (value, label = lessonId, chineseContext = false) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => checkChineseFields(item, `${label}[${index}]`, chineseContext));
          return;
        }
        if (value && typeof value === "object") {
          Object.entries(value).forEach(([key, item]) => {
            checkChineseFields(item, `${label}.${key}`, key === "zh" || key.toLowerCase().endsWith("zh"));
          });
          return;
        }
        if (chineseContext && typeof value === "string" && value.trim()) {
          assert.ok(substantiveChinese(value), `${label} must contain substantive Chinese copy`);
          assert.doesNotMatch(value, /(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/u, `${label} PDF line-wrap spacing`);
          assert.doesNotMatch(value, /(?<=[\u3400-\u9fff])[.,;:?!]|[.,;:?!](?=[\u3400-\u9fff])/u, `${label} Chinese-adjacent ASCII punctuation`);
          assert.doesNotMatch(value, /(?:[;；]\s*){2,}|([，。；：！？、])\1+|^[;；]|。[;；]/u, `${label} repeated or leading Chinese punctuation`);
          assert.doesNotMatch(value, /(?<=[\u3400-\u9fff])。?\s*\.{3,}\s*。?/u, `${label} ASCII-dot ellipsis in Chinese copy`);
        }
      };
      checkChineseFields(lesson);

      const teachingWithoutQuestions = { ...lesson, questions: [] };
      assert.doesNotMatch(JSON.stringify(teachingWithoutQuestions), /[●•▪◦]/u, `${lessonId} raw PDF teaching bullet`);
      const clauseKey = (value) => String(value || "").toLowerCase().replace(
        /[\s，,。！？!?；;：:「」“”'’"()（）\[\]［］]/gu,
        ""
      );
      const assertNoDuplicateClauses = (value, label) => {
        const seen = new Set();
        for (const clause of String(value || "").split(/(?<=[。！？!?；;])/u).map((item) => item.trim()).filter(Boolean)) {
          const key = clauseKey(clause);
          if (key.length < 6) continue;
          assert.ok(!seen.has(key), `${label} duplicated Chinese teaching clause`);
          seen.add(key);
        }
        assert.doesNotMatch(String(value || ""), /(?:Rule|Benefit|Formula)\s+\d+\s*[:：]/i, `${label} structural body marker`);
      };
      assertNoDuplicateClauses(lesson.register.summaryZh, `${lessonId}.register.summaryZh`);
      assertNoDuplicateClauses(lesson.register.formalZh, `${lessonId}.register.formalZh`);
      assertNoDuplicateClauses(lesson.instructions.zh, `${lessonId}.instructions.zh`);
      lesson.specificForms.forEach((form, index) => assertNoDuplicateClauses(form.descriptionZh, `${lessonId}.specificForms[${index}]`));
      lesson.benefits.forEach((card, index) => assertNoDuplicateClauses(card.zh, `${lessonId}.benefits[${index}]`));
      lesson.rules.forEach((card, index) => assertNoDuplicateClauses(card.zh, `${lessonId}.rules[${index}]`));
      lesson.origin.history.forEach((card, index) => assertNoDuplicateClauses(card.zh, `${lessonId}.origin.history[${index}]`));

      const descriptionHeading = /^(?:Examples?\s*:?\s*|Best Core Grammar Bank|Core Grammar Bank|Grammar Bank|Important Rules|Benefits|Model Examples?|Formula(?:s|\(s\))?|Frame\s+\d+\s*:\s*[^.!?。！？]*)$/i;
      const assertEnglishTeachingBody = (value, label) => {
        assert.doesNotMatch(String(value || ""), /(?:Rule|Benefit|Formula)\s+\d+\s*[:：]/i, `${label} structural English body marker`);
        assert.doesNotMatch(String(value || ""), /^(?:規則|好處|句式)[一二三四五六七八九十\d]+\s*[:：]/u, `${label} Chinese heading in English body`);
      };
      assertEnglishTeachingBody(lesson.register.summaryEn, `${lessonId}.register.summaryEn`);
      assertEnglishTeachingBody(lesson.register.formalEn, `${lessonId}.register.formalEn`);
      assertEnglishTeachingBody(lesson.instructions.en, `${lessonId}.instructions.en`);
      lesson.specificForms.forEach((form, index) => {
        assert.doesNotMatch(form.descriptionEn, descriptionHeading, `${lessonId}.specificForms[${index}] English section-heading description`);
        assert.doesNotMatch(form.descriptionZh, descriptionHeading, `${lessonId}.specificForms[${index}] Chinese section-heading description`);
        assertEnglishTeachingBody(form.descriptionEn, `${lessonId}.specificForms[${index}].descriptionEn`);
        const formulaLike = form.descriptionEn.includes("+") || /^(?:Frame|Pattern|Formula)\s+\d+\b/i.test(form.descriptionEn);
        if (formulaLike) {
          assert.match(
            form.descriptionZh,
            /原檔列出的句法框架|核心句式庫.*句式/u,
            `${lessonId}.specificForms[${index}] formula explanation needs its paired Chinese formula label`
          );
        }
      });
      lesson.benefits.forEach((card, index) => assertEnglishTeachingBody(card.en, `${lessonId}.benefits[${index}].en`));
      lesson.rules.forEach((card, index) => assertEnglishTeachingBody(card.en, `${lessonId}.rules[${index}].en`));
      lesson.origin.history.forEach((card, index) => assertEnglishTeachingBody(card.en, `${lessonId}.origin.history[${index}].en`));

      const balancedTeachingDelimiters = (raw) => {
        const text = String(raw || "");
        for (const [opening, closing] of [["(", ")"], ["[", "]"], ["［", "］"], ["【", "】"], ["「", "」"], ["“", "”"]]) {
          let depth = 0;
          for (const character of text) {
            if (character === opening) depth += 1;
            else if (character === closing && --depth < 0) return false;
          }
          if (depth !== 0) return false;
        }
        return (text.match(/"/g) || []).length % 2 === 0;
      };
      const assertBalancedTeachingTree = (value, label = lessonId) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => assertBalancedTeachingTree(item, `${label}[${index}]`));
          return;
        }
        if (value && typeof value === "object") {
          Object.entries(value).forEach(([key, item]) => {
            if (key !== "questions") assertBalancedTeachingTree(item, `${label}.${key}`);
          });
          return;
        }
        if (typeof value === "string") {
          assert.ok(balancedTeachingDelimiters(value), `${label} unmatched teaching delimiter`);
        }
      };
      assertBalancedTeachingTree(lesson);

      lesson.specificForms.forEach((form) => {
        assert.ok(form.titleEn.length <= 80 && form.titleZh.length <= 30, `${lessonId} compact form heading`);
        assert.doesNotMatch(`${form.titleEn}${form.titleZh}`, /[●•▪◦]|[.!?。！？]$/u);
        assert.ok(
          !(/^Form\s+\d+$/i.test(form.titleEn) && /^句式(?:[一二三四五六七八九十]+|\d+)$/u.test(form.titleZh)),
          `${lessonId} must not publish a generic English/Chinese form-heading pair`
        );
      });
      [...lesson.benefits, ...lesson.rules].forEach((card) => {
        assert.ok(card.titleEn.length <= 80 && card.titleZh.length <= 30, `${lessonId} compact learning heading`);
        assert.doesNotMatch(`${card.titleEn}${card.titleZh}`, /[●•▪◦]|[.!?。！？]$/u);
        const genericEnglish = /^(?:Rule|Benefit)\s+\d+$/i.test(card.titleEn);
        const genericChinese = /^(?:規則|好處)(?:[一二三四五六七八九十]+|\d+)$/u.test(card.titleZh);
        assert.ok(!(genericEnglish && genericChinese), `${lessonId} must not publish a generic bilingual learning-heading pair`);
      });
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
  assert.equal(allQuestionIds.size, 6900);
  const allSpecificForms = content.lessons.flatMap((lesson) => lesson.specificForms || []);
  assert.equal(
    allSpecificForms.filter((form) => /^(?:Source grammar frame:|Core Grammar Bank\. Formula:)/i.test(form.descriptionEn || "") && /\.\.$/u.test(form.descriptionEn || "")).length,
    0,
    "formula fallback English descriptions must end with exactly one period"
  );
  assert.equal(
    allSpecificForms.filter((form) => /^(?:原檔列出的句法框架：|核心句式庫。句式：)/u.test(form.descriptionZh || "") && /\.。$/u.test(form.descriptionZh || "")).length,
    0,
    "formula fallback Chinese descriptions must end with exactly one Chinese full stop"
  );
  const chineseFacingStrings = [];
  const collectChineseFacingStrings = (value, chineseContext = false) => {
    if (Array.isArray(value)) {
      value.forEach((item) => collectChineseFacingStrings(item, chineseContext));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, item]) => {
        collectChineseFacingStrings(item, key === "zh" || key.toLowerCase().endsWith("zh"));
      });
      return;
    }
    if (chineseContext && typeof value === "string") chineseFacingStrings.push(value);
  };
  content.lessons.filter((lesson) => lesson.order >= 26).forEach((lesson) => collectChineseFacingStrings(lesson));
  assert.equal(
    chineseFacingStrings.reduce((count, value) => count + (value.match(/(?<=[\u3400-\u9fff])[.,;:?!]|[.,;:?!](?=[\u3400-\u9fff])/gu) || []).length, 0),
    0,
    "Chinese-facing fields must not retain adjacent ASCII punctuation"
  );
  assert.equal(
    chineseFacingStrings.reduce((count, value) => count + (value.match(/(?:[;；]\s*){2,}|([，。；：！？、])\1+|^[;；]|。[;；]/gu) || []).length, 0),
    0,
    "Chinese-facing fields must not retain repeated or leading separators"
  );
  assert.equal(
    chineseFacingStrings.reduce((count, value) => count + (value.match(/(?<=[\u3400-\u9fff])。?\s*\.{3,}\s*。?/gu) || []).length, 0),
    0,
    "Chinese prose must use the Chinese ellipsis while embedded English formulas remain unchanged"
  );
  assert.equal(content.lessons.find(({ order }) => order === 124)?.titleZh, "新手的好運／初次嘗試時意外成功");
  assert.equal(content.lessons.find(({ order }) => order === 42)?.titleZh, "視而不見／隻眼開、隻眼閉");
  assert.equal(content.lessons.find(({ order }) => order === 47)?.questions[44]?.highlight, "point the finger");
  assert.doesNotMatch(content.lessons.find(({ order }) => order === 124)?.questions[49]?.answerZh || "", /:::|This edition deliberately/i);
  const lesson133 = content.lessons.find(({ order }) => order === 133);
  assert.match(lesson133?.meaning?.zh || "", /[\u3400-\u9fff]/u);
  assert.doesNotMatch(lesson133?.meaning?.zh || "", /Communicative|Communication|溝通功能|溝通用途/i);
  assert.equal(
    (content.lessons.find(({ order }) => order === 66)?.benefits[0]?.zh.match(/它能濃縮較長的解釋/g) || []).length,
    1,
    "lesson 66 overlapping PDF prefix is removed"
  );
  const lesson104Rule = content.lessons.find(({ order }) => order === 104)?.rules[0];
  assert.match(lesson104Rule?.en || "", /Correct target:\s*back-seat driver/i);
  assert.match(lesson104Rule?.en || "", /Incorrect target forms:/i);
  assert.doesNotMatch(lesson104Rule?.en || "", /Rule\s+1\s*[:：]/i);
  for (const [order, formIndex] of [[67, 3], [80, 1]]) {
    const description = content.lessons.find((lesson) => lesson.order === order)?.specificForms[formIndex]?.descriptionEn || "";
    assert.doesNotMatch(description, /^Examples?\s*:?\s*$/i, `idiom-${order} form ${formIndex + 1} must not publish an example heading as its description`);
  }
  const lesson27 = content.lessons.find(({ order }) => order === 27);
  assert.equal(lesson27?.meaning?.zh, "很久沒有……；已有很長時間沒有……");
  assert.deepEqual(Array.from(lesson27?.meaning?.naturalZh || []), ["很久沒有……", "已有很長時間沒有……"]);
  assert.deepEqual(
    Array.from(content.lessons.find(({ order }) => order === 35)?.meaning?.naturalZh || []),
    ["決定……成敗", "成為……成敗的關鍵", "足以成就或毀掉……", "令……成功或失敗", "對……的成敗起決定作用"]
  );
  const lesson77Form = content.lessons.find(({ order }) => order === 77)?.specificForms[0];
  assert.equal(lesson77Form?.formula, "with + person");
  assert.equal(lesson77Form?.descriptionZh, "原檔列出的句法框架：with + person。");
  assert.equal(
    content.lessons.find(({ order }) => order === 136)?.rules.find(({ number }) => number === 3)?.zh,
    "錯誤的字面理解：「她裝滿了豆子。」正確的慣用意思：「她精力充沛、活力十足、精神奕奕或生龍活虎。」"
  );
  for (const order of [31, 36, 43, 65, 77, 133]) {
    const representative = content.lessons.find((lesson) => lesson.order === order);
    assert.ok(representative.specificForms.length > 1, `idiom-${order} retains source-specific forms`);
    assert.ok(representative.benefits.length > 0, `idiom-${order} retains source benefits`);
    assert.ok(representative.rules.length > 0, `idiom-${order} retains source rules`);
    assert.ok(representative.origin.history.length > 0, `idiom-${order} retains source history`);
  }
  const reviewedTitles = new Map([
    [31, "爭吵不休／水火不容"], [35, "成敗關鍵／決定成敗"], [44, "身體不適／有點不舒服"],
    [63, "一石二鳥／一舉兩得"], [72, "分而治之／分化統治"], [77, "並肩合作／同心協力"],
    [82, "小心翼翼／如履薄冰"], [88, "特洛伊木馬／暗藏威脅"], [92, "提心吊膽／極度緊張"],
    [98, "鳥瞰／全局概覽"], [104, "指手畫腳的乘客／愛管閒事者"], [117, "說曹操，曹操到／剛提起便出現"],
    [123, "因禍得福／塞翁失馬"], [132, "煙幕／障眼法"], [134, "打亂計劃／破壞局面"]
  ]);
  for (const [order, title] of reviewedTitles) {
    assert.equal(content.lessons.find((lesson) => lesson.order === order)?.titleZh, title);
  }
});

test("the reproducible Idiom import manifest accounts for every source and exact highlight", () => {
  const manifest = JSON.parse(read("tools/idiom-import-manifest.json"));
  assert.equal(manifest.fileCount, 113);
  assert.equal(manifest.questionCount, 5650);
  assert.deepEqual(
    manifest.sources.map(({ order }) => order),
    Array.from({ length: 113 }, (_, index) => index + 26)
  );
  for (const source of manifest.sources) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    assert.equal(source.questionCount, 50);
    assert.equal(source.physicalPageMatchCount, 100);
    assert.deepEqual(source.highlightModes, { expression: 50 });
    assert.ok(Array.isArray(source.contentPages));
    assert.ok(Array.isArray(source.exercisePages) && source.exercisePages.length > 0);
    assert.ok(Array.isArray(source.answerKeyPages) && source.answerKeyPages.length > 0);
  }
});

test("the generated forward migration keeps recreated Idiom RPCs service-role only", () => {
  const migration = read("supabase-idiom-system-lessons-26-138.sql");
  const exposedSignatures = [
    /public\.idiom_system_upsert_attempt\(\s*uuid, uuid, text, text, text, integer, integer, integer, integer,\s*timestamptz, jsonb\s*\)/s,
    /public\.idiom_system_list_bookmarks_page\(uuid, integer, integer\)/,
    /public\.idiom_system_admin_list_bookmarks_page\(\s*uuid, uuid, integer, integer\s*\)/s
  ];

  for (const signature of exposedSignatures) {
    const source = signature.source;
    assert.match(
      migration,
      new RegExp(`revoke all on function ${source}\\s*from public, anon, authenticated, service_role;`, "s")
    );
    assert.match(
      migration,
      new RegExp(`grant execute on function ${source}\\s*to service_role;`, "s")
    );
  }
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
