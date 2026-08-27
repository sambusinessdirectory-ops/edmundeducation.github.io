#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {inventory,prepareTranslation,sourceHash} from './reading-translations.mjs';
const {rows,summary}=await inventory();
assert.equal(summary.target,436);
assert.ok(rows.length>0);
const root=new URL('../',import.meta.url);
const data=JSON.parse(await readFile(new URL('reading-comprehension-data/p1-001.json',root)));
const editorial=JSON.parse(await readFile(new URL('tools/reading-comprehension-translations/p1-001.json',root)));
const script=await readFile(new URL('reading-comprehension.js',root),'utf8');
const fn=script.match(/function applyArticleTranslation\(data, translation\) \{[\s\S]*?\n\}/)[0];
const apply=vm.runInNewContext(`(${fn})`);
const original=JSON.stringify(data);
const valid=rows.find(row=>row.article_id===data.id).content;
const copy=structuredClone(data);
assert.equal(apply(copy,valid),true);
assert.deepEqual(copy.paragraphs.map(p=>p.text),data.paragraphs.map(p=>p.text));
assert.ok(copy.paragraphs.every(p=>p.translation));
assert.deepEqual(copy.questions,data.questions);
for(const mutate of [
  t=>{t.articleId='p1-002';},t=>{t.locale='zh-Hans';},
  t=>{t.sourceTitle='changed';},t=>{t.sourceHeading='changed';},
  t=>{t.paragraphs.pop();},t=>{t.paragraphs[0].number=100;},
  t=>{t.paragraphs[0].source+=' changed';},t=>{t.paragraphs[0].translation=' ';},
  t=>{t.paragraphs[0].translation=null;},t=>{t.paragraphs.reverse();}
]) {
  const broken=structuredClone(valid);mutate(broken);
  const fresh=structuredClone(data);
  assert.equal(apply(fresh,broken),false);
  assert.equal(JSON.stringify(fresh),original,'No partial mutation on invalid payload');
}
assert.equal(apply(structuredClone(data),null),false);
for(const mutate of [t=>t.paragraphs.pop(),t=>{t.sourceSha256='0'.repeat(64);},t=>{t.paragraphs[0].translation='TODO';}]) {
  const broken=structuredClone(editorial);mutate(broken);
  assert.throws(()=>prepareTranslation(data,broken));
}
assert.equal(sourceHash(data),editorial.sourceSha256);
assert.match(script,/Optional support must never prevent/);
assert.match(script,/data-translation-heading/);
console.log(`Translation checks passed: ${summary.completed}/${summary.target} complete articles, ${summary.paragraphs} aligned paragraphs; source drift, cross-article data, partial content and placeholders rejected.`);
