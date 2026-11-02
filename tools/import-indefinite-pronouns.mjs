// Build the browser data from the three supplied, student-facing Markdown files.
// Usage: node tools/import-indefinite-pronouns.mjs <curation.md> <exercises.md> <proofreading.md>
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const { marked } = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/marked');
const [guidePath, exercisePath, proofreadingPath] = process.argv.slice(2);
assert(guidePath && exercisePath && proofreadingPath, 'Pass the three Markdown source paths.');
const read = path => fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const guide = read(guidePath), exercise = read(exercisePath), proofreading = read(proofreadingPath);
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const safe = text => String(text).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

// The supplied source is retained for editorial audit. Only learning content
// belongs in the student guide: provenance, internal IDs and answer keys do not.
function studentGuide(source) {
  let text = source;
  const removeSection = (start, end) => {
    const before = text;
    text = text.replace(new RegExp(`^## ${start}[\\s\\S]*?(?=^## ${end})`, 'm'), '');
    assert.notEqual(text, before, `Missing guide section: ${start}`);
  };
  const replace = (from, to) => {
    assert(text.includes(from), `Missing guide wording: ${from.slice(0, 65)}`);
    text = text.replace(from, to);
  };
  removeSection('本文件的範圍與讀法', '一、');
  removeSection('九、', '十一、');
  const beforeLast = text;
  text = text.replace(/^## 十二、[\s\S]*$/m, '');
  assert.notEqual(text, beforeLast, 'Missing source appendix');
  replace('## 十一、最容易漏教的 20 項提醒', '## 九、重點回顧：20 項提醒');
  replace('**來源：** PDF 第 3 頁，16.1。', '');
  replace('人和事物形式通常作代名詞；-where 形式常作地點副詞，也可在某些句型中擔任像名詞的角色。教材有時把它們一起稱為 indefinite pronouns，有時把 -where 另列為 indefinite adverbs。**分類名稱不同，不影響實際造句規則。**', '先分清要說的是人、事物還是地方，再選表示「某個」「任選」「沒有」或「全部」的字。');
  replace('可成立，但結構與 everyone / anyone 不同，見 IP57。', '指一組中的每一個／任一個，常接 of，例如 every one of the photos。');
  replace('詞彙化的 a nobody、a little something 另見 IP30、IP61。', 'a nobody、a little something 有特別意思，後文會分別說明。');
  replace('這些句子沒有都使用 not，any- 仍可成立。教材對話中的 `see if anyone knows` 是間接查問，不能看見主句 I\'ll check 便機械選 someone。', '這些句子沒有使用 not，any- 仍可成立。`see if anyone knows` 是間接查問；即使主句是 `I’ll check`，也要看後面的查問意思。');
  replace('不能把「命令句」當作某一個字首的專用句型。第一句要帶某些食物；第二句開放選擇。', '祈使句也要按意思選詞：`something to eat` 是帶點吃的；`anything you like` 表示喜歡哪樣都可以拿；`someone` 指某個人，但沒有指定是誰。');
  replace('這類句子用否定加比較，強調沒有更高者；不表示有一個叫 nothing 的物件。教材演說的相近句型要一起讀比較詞、than 和談話語氣。', '這類句子用否定加比較，強調沒有更好或更有用的選擇。讀句子時，要連同比較詞和 than 一起看。');
  replace('來源 C1、C8、C11 特別需要這個整組判斷。', '讀完整個詞組，才知道說的是人、事物還是剩下的數量。');
  replace('這與掃描中後續 relative clauses 單元直接相連。', '關係子句中也要分清誰做動作，以及代名詞是否已經出現。');
  replace('不能因課本把 -where 稱作 adverbs，就斷言它們永遠不能出現在主語位置。', '談論某個地方本身時，也可以讓地方詞成為句子的主語。');
  replace('要看介詞所表達的來源、方向或整個名詞結構。', '要看介詞所表達的起點、方向或整個名詞結構。');
  replace('out of nowhere 是來源／突然出現，不能用 nothing 代替地方詞。', 'out of nowhere 表示突然出現，不能用 nothing 代替地方詞。');
  replace('來源最後故事確實有這個結構。', '這是自然、正確的句型。');
  replace('但它不是本教材基本書面答案。', '標準書面英語通常寫 `I didn’t see anything` 或 `I saw nothing`。');
  replace('來源第 3 頁 Speaking focus 的年齡用法必須與主表一起學。', '這是表示約略年齡的常見說法。');
  replace('來源科幻開場的 nowhere ... seen before 及 nothing like ... remembered 都在比較經驗與眼前景象，不可只按「沒有 not」選 some-。', '選 nothing like 等說法時，要看整句是否在比較眼前事物與記憶；不可只按「有沒有 not」選詞。');
  replace('這些是自然的整組用法；不因出現 a 就推翻 IP06 的普通句型。', '這些是有特別意思的整組用法；`a little something` 可帶 a，不代表普通的 someone、everything 也能隨意加 a。');
  replace('其他高頻整組：不可按每個字字面拼意思', '其他常見整組：不可按每個字字面拼意思');
  replace('整組用法要跟語境記，不把所有 idiom 當作主表的普通數量意思。這張表是高頻延伸，不代替完整詞典。', '這些常見整組用法應連同語境學習；意思未必能從每個單字逐一推算。');
  replace('八、文章中怎樣選：來源材料特別重要的層次', '八、在文章中按語境選詞');
  replace('第一句 nothing 由「怕賣清」的意思決定；第二句由「今晚有空」支持。cannot/doesn\'t 並非 no- 的唯一來源。來源對話 C8、C9、C11 的教學不能縮成「找否定動詞」。', '第一句 nothing 由「怕賣清」的意思決定；第二句由「今晚有空」支持。即使沒有 not，也要看上下文是否表達「沒有」。');
  replace('nothing anyone could do 是合法而且來源實際出現的結構。', 'nothing anyone could do 是自然、正確的句型。');
  const visibleText = text.replace(/^### IP\d{2}｜/gm, '### ');
  const leaked = visibleText.match(/(?:來源|教材|PDF|掃描|高頻|IP\d{2}|檢查理解：24 項診斷與答案|本次來源與編寫方式)/);
  assert(!leaked, `Student guide still contains editorial or answer-key material: ${leaked?.[0]} in ${visibleText.slice(Math.max(0, leaked?.index - 75), (leaked?.index ?? 0) + 90)}`);
  return text;
}

const conceptIds = [...guide.matchAll(/^### IP(\d{2})｜/gm)].map(match => Number(match[1]));
assert.deepEqual(conceptIds, Array.from({length:68}, (_, index) => index + 1));
// This source contains no needed raw HTML. Reject any such element so the generated
// browser data cannot import markup that the Markdown renderer would pass through.
assert(!/<\/?[a-z][^>]*>/i.test(guide), 'Review raw HTML in the guide before import.');
const student = studentGuide(guide);
let guideHtml = marked.parse(student.replace(/^# .+\n/, ''), { gfm: true });
guideHtml = guideHtml.replace(/<h3>IP(\d{2})｜([\s\S]*?)<\/h3>/g, (_, number, title) => `<h3 data-concept-number="${number}">${title}</h3>`);
assert.equal((guideHtml.match(/data-concept-number=/g) || []).length, 68);
let chapter = 0;
const chapters = [];
guideHtml = guideHtml.replace(/<h2>(.*?)<\/h2>/g, (_, title) => {
  const id = `indefinite-section-${++chapter}`;
  chapters.push({ id, title: title.replace(/<[^>]*>/g, '') });
  return `<h2 id="${id}">${title}</h2>`;
});
assert.equal(chapters.length, 9);
guideHtml = guideHtml.replace(/<table>/g, '<div class="grammar-new-table-wrap"><table>')
  .replace(/<\/table>/g, '</table></div>');

const exercises = [...exercise.matchAll(/^### 第 (\d+) 題\n([\s\S]*?)(?=^### 第 \d+ 題\n|(?![\s\S]))/gm)].map(match => {
  const number = Number(match[1]);
  const block = match[2].trim();
  const translation = block.match(/【([\s\S]*?)】/);
  assert(translation, `Missing Chinese context for exercise ${number}`);
  const prompt = block.slice(0, translation.index).trim().replace(/\n+/g, ' ');
  assert(prompt && !/答案：/.test(prompt), `Missing prompt for exercise ${number}`);
  return { number, prompt, translation: translation[1].trim(), section: number <= 50 ? '分組練習' : '混合練習' };
});
assert.deepEqual(exercises.map(item => item.number), Array.from({length:250}, (_, index) => index + 1));

const passages = [...proofreading.matchAll(/^### Passage (\d{2})｜([^\n]+)\n([\s\S]*?)(?=^### Passage \d{2}｜|(?![\s\S]))/gm)].map(match => {
  const number = Number(match[1]);
  const subtitle = match[3].match(/^\s*\*([^\n*]+)\*/m);
  const questions = [...match[3].matchAll(/^\*\*(\d{3})\.\*\* (.+)$/gm)].map(entry => ({ number: Number(entry[1]), sentence: entry[2].trim() }));
  assert.equal(questions.length, 20, `Passage ${number} must have 20 questions.`);
  return { number, title: match[2].trim(), subtitle: subtitle?.[1]?.trim() || '', questions };
});
assert.equal(passages.length, 10);
assert.deepEqual(passages.flatMap(p => p.questions.map(q => q.number)), Array.from({length:200}, (_, index) => index + 1));
assert(!passages.some(p => /jayden/i.test(JSON.stringify(p))), 'Remove names from published proofreading content.');

const payload = { guide: { slug: 'indefinite-pronouns', english: 'Someone, Anything, Nowhere, etc.', chinese: '不定代名詞與地點詞', count: 68, practiceCount: 250, html: guideHtml, chapters }, exercises, passages };
fs.writeFileSync('grammar-indefinite-pronouns-data.js', `// Generated from supplied Markdown; student-only sets have no answer key.\nwindow.EDMUND_INDEFINITE_PRONOUNS = ${JSON.stringify(payload)};\n`);
fs.writeFileSync('tools/indefinite-pronouns-import-manifest.json', JSON.stringify({ sourceHashes: { guide: hash(guide), exercises: hash(exercise), proofreading: hash(proofreading) }, guideConcepts: conceptIds.length, guideChapters: chapters.length, exercises: exercises.length, proofreadingPassages: passages.length, proofreadingQuestions: 200, answerKeySupplied: false }, null, 2) + '\n');
console.log(`Imported ${conceptIds.length} guide points, ${exercises.length} grammar questions, ${passages.length} proofreading passages and 200 proofreading questions.`);
