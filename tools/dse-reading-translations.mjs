#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import '../dse-reading-translations.js';

const root = new URL('../', import.meta.url);
export const translationFolder = new URL('tools/dse-reading-translations/', root);
const json = async url => JSON.parse(await readFile(url, 'utf8'));
export const sources = globalThis.DseReadingTranslations.sources;
export const sourceHash = data => createHash('sha256').update(JSON.stringify(sources(data))).digest('hex');
const common = new Map(Object.entries({
  'Answer every question using the passage.': '根據文章回答所有問題。',
  'NG': '未提及', 'Not Given': '未提及', 'NOT GIVEN': '未提及',
  'True': '正確', 'False': '錯誤', 'TRUE': '正確', 'FALSE': '錯誤',
  'Yes': '是', 'No': '否', 'Statements': '陳述', 'Statement': '陳述',
  'T / F / NG': '正確／錯誤／未提及', 'Answer': '答案', 'Answers': '答案',
  'Line': '行數', 'Lines': '行數', 'Paragraph': '段落', 'Paragraph Nos.': '段落編號',
  'Word': '字詞', 'Words': '字詞', 'Meaning': '意思', 'Example': '例子',
  'Letter': '字母', 'Heading': '標題', 'Question': '問題'
}));
function commonTranslation(source) {
  if (common.has(source)) return common.get(source);
  let match = source.match(/^Paragraphs? (\d+)(?:[-–](\d+))?$/);
  if (match) return match[2] ? `第 ${match[1]} 至 ${match[2]} 段` : `第 ${match[1]} 段`;
  match = source.match(/^HKDSE (\d{4}) English Language Paper 1 Part (A|B1|B2)$/);
  if (match) return `${match[1]} 年香港中學文憑考試英國語文科卷一 ${match[2]} 部分`;
  match = source.match(/^Text (\d+)$/);
  if (match) return `文章 ${match[1]}`;
  match = source.match(/^Lines? (\d+)[–-](\d+)$/);
  if (match) return `第 ${match[1]} 至 ${match[2]} 行`;
  match = source.match(/^Questions? (\d+)[–-](\d+)$/);
  if (match) return `第 ${match[1]} 至 ${match[2]} 題`;
  match = source.match(/^Text (\d+) - Paragraph (\d+)$/);
  if (match) return `文章 ${match[1]}，第 ${match[2]} 段`;
  match = source.match(/^(\d+) · Lines (\d+)[–-](\d+)$/);
  if (match) return `第 ${match[1]} 段，第 ${match[2]} 至 ${match[3]} 行`;
  match = source.match(/^HKDSE (\d{4}) English Language Paper 1 Part (A|B1|B2) · Text (\d+)$/);
  if (match) return `${match[1]} 年香港中學文憑考試英國語文科卷一 ${match[2]} 部分，文章 ${match[3]}`;
  return undefined;
}
export async function articles() {
  const catalogue = await json(new URL('dse-reading-catalogue.json', root));
  const entries = catalogue.years.filter(year => year.year !== 2024).flatMap(year => Object.values(year.sections).filter(Boolean));
  return Promise.all(entries.map(entry => json(new URL(`dse-reading-data/${entry.id}.json`, root))));
}
export function prepareTranslation(data, translation) {
  assert.equal(translation.articleId, data.id);
  assert.equal(translation.locale, 'zh-Hant');
  assert.equal(translation.sourceSha256, sourceHash(data), `${data.id}: English source changed`);
  const expected = sources(data);
  const provided = translation.translations;
  const bySource = new Map();
  for (const [path, value] of Object.entries(provided)) {
    const field = expected.find(item => item.path === path);
    assert.ok(field, `${data.id}: unexpected field ${path}`);
    if (!bySource.has(field.source)) bySource.set(field.source, value);
  }
  const content = { schemaVersion: 1, articleId: data.id, locale: 'zh-Hant', entries: expected.map(item => ({ ...item,
    translation: provided[item.path] ?? bySource.get(item.source) ?? commonTranslation(item.source)
  })) };
  for (const entry of content.entries) assert.ok(entry.translation, `${data.id}: missing translation for ${entry.path}`);
  assert.ok(globalThis.DseReadingTranslations.apply(structuredClone(data), content), `${data.id}: incomplete or invalid Chinese translation`);
  return { article_id: data.id, locale: 'zh-Hant', source_sha256: translation.sourceSha256, content, published: true };
}
export async function inventory() {
  const data = await articles();
  const names = (await readdir(translationFolder)).filter(name => name.endsWith('.json'));
  const rows = [];
  for (const name of names.sort()) {
    const translation = await json(new URL(name, translationFolder));
    const article = data.find(item => item.id === translation.articleId);
    assert.ok(article, `${name}: article not in the DSE catalogue`);
    assert.equal(name, `${article.id}.json`);
    rows.push(prepareTranslation(article, translation));
  }
  return { rows, summary: { target: data.length, completed: rows.length, remaining: data.length - rows.length,
    fields: rows.reduce((sum, row) => sum + row.content.entries.length, 0),
    paragraphs: data.filter(item => rows.some(row => row.article_id === item.id)).reduce((sum, item) => sum + item.paragraphs.length, 0),
    questions: data.filter(item => rows.some(row => row.article_id === item.id)).reduce((sum, item) => sum + item.questions.length, 0) } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === 'compact-source') {
    for (const data of await articles()) if (data.id === process.argv[3]) {
      console.log(JSON.stringify({articleId:data.id,locale:'zh-Hant',sourceSha256:sourceHash(data)}));
      const seen = new Set();
      for (const field of sources(data)) if (!commonTranslation(field.source) && !seen.has(field.source)) {
        seen.add(field.source);
        console.log(`${field.path}\t${field.source}`);
      }
    }
  } else if (process.argv[2] === 'source') {
    for (const data of await articles()) if (!process.argv[3] || data.id.includes(process.argv[3])) console.log(JSON.stringify({articleId:data.id,locale:'zh-Hant',sourceSha256:sourceHash(data),entries:sources(data)},null,2));
  } else {
    const { rows, summary } = await inventory();
    const ids = process.argv.slice(3);
    console.log(JSON.stringify(process.argv[2] === 'seed' ? rows.filter(row => !ids.length || ids.includes(row.article_id)) : summary, null, 2));
  }
}
