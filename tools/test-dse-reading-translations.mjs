import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { articles, inventory, prepareTranslation, sources, sourceHash } from './dse-reading-translations.mjs';

const root = new URL('../', import.meta.url);
const data = await articles();
assert.equal(data.length, 42);
assert.ok(data.every(item => item.year !== 2024));
assert.equal(data.reduce((n, item) => n + item.paragraphs.length, 0), 656);
assert.equal(data.reduce((n, item) => n + item.questions.length, 0), 965);
for (const article of data) {
  const fields = sources(article);
  assert.equal(new Set(fields.map(item => item.path)).size, fields.length);
  article.paragraphs.forEach((paragraph, index) => assert.ok(fields.some(item => item.path === `paragraphs/${index}/text`)));
  article.questions.forEach((question, index) => assert.ok(fields.some(item => item.path === `questions/${index}/prompt`)));
}
const { rows, summary } = await inventory();
assert.ok(rows.length, 'At least one reviewed translation is required');
if (process.argv.includes('--complete')) assert.equal(rows.length, data.length);
for (const row of rows) {
  const original = data.find(article => article.id === row.article_id);
  const copy = structuredClone(original);
  assert.ok(globalThis.DseReadingTranslations.apply(copy, row.content));
  assert.ok(copy.paragraphs.every(paragraph => paragraph.translation));
  assert.deepEqual(copy.questions, original.questions, 'Do not change questions or answer values');
  assert.equal(sourceHash(copy), sourceHash(original));
  for (const entry of row.content.entries) {
    const path = entry.path.split('/'), key = path.pop();
    const owner = path.reduce((object, item) => object[item], copy);
    assert.equal(globalThis.DseReadingTranslations.get(owner, key), entry.translation);
    assert.ok(!/<\/?[a-z][^>]*>/i.test(entry.translation), 'Translation text must be plain text');
    assert.doesNotMatch(entry.translation, /[这为们说时个从来会对关无开过还进让学国发业经动现应将写读语题问爱头应种类项号页书较当实观图边连举层简体带见记东车电离势点灾产处乐华门气长专术鸟鱼习资优旧办质换网声压钱与众变样谁难闻间欢妇态绿红黄卖买]/u, `${row.article_id}/${entry.path}: use Traditional Chinese`);
    assert.equal((entry.source.match(/_{3,}/g) || []).length, (entry.translation.match(/_{3,}/g) || []).length, `${row.article_id}/${entry.path}: preserve blanks`);
  }
  for (const mutate of [
    payload => payload.entries.pop(),
    payload => payload.entries.reverse(),
    payload => { payload.entries[0].source += ' changed'; },
    payload => { payload.entries[0].translation = 'TODO'; },
    payload => { payload.articleId = 'dse-2024-a'; },
    payload => { payload.entries.find(entry => entry.path.startsWith('questions/')).source += ' changed'; }
  ]) {
    const broken = structuredClone(row.content), untouched = structuredClone(original);
    mutate(broken);
    assert.equal(globalThis.DseReadingTranslations.apply(untouched, broken), false);
    assert.deepEqual(untouched, original, 'Reject the entire payload without partial application');
  }
  assert.throws(() => prepareTranslation(original, {articleId:original.id,locale:'zh-Hant',sourceSha256:'0'.repeat(64),translations:{}}));
}
const arrayBank = {id:'dse-2026-a',paragraphs:[{text:'Passage text.'}],questions:[{prompt:'Choose an option.',optionBank:['First option','Second option'],options:[{value:'A',label:'First option'}]}]};
const arrayFields = sources(arrayBank);
assert.ok(arrayFields.some(entry => entry.path === 'questions/0/optionBank/0'));
assert.ok(arrayFields.some(entry => entry.path === 'questions/0/optionBank/1'));
assert.ok(!arrayFields.some(entry => entry.path.endsWith('/value')));
assert.ok(globalThis.DseReadingTranslations.apply(arrayBank,{schemaVersion:1,articleId:arrayBank.id,locale:'zh-Hant',entries:arrayFields.map(entry=>({...entry,translation:`測試翻譯：${entry.source}`}))}));
assert.equal(globalThis.DseReadingTranslations.get(arrayBank.questions[0].optionBank,0),'測試翻譯：First option');
assert.equal(arrayBank.questions[0].options[0].value,'A');
const script = await readFile(new URL('reading-comprehension.js', root), 'utf8');
const html = await readFile(new URL('reading-comprehension.html', root), 'utf8');
assert.match(script, /rpc\('dse_reading_article_translation'/);
assert.match(script, /Translation source mismatch/);
assert.match(script, /function updateQuestionTranslations/);
assert.doesNotMatch(html, /class="translation-control" data-ielts-only/);
assert.doesNotMatch(html, /class="question-translation-toggle" data-ielts-only/);
console.log(`DSE translations: ${summary.completed}/${summary.target} sections, ${summary.paragraphs} paragraphs, ${summary.questions} questions, ${summary.fields} translated fields. Source drift, partial payloads and answer-value mutations rejected.`);
