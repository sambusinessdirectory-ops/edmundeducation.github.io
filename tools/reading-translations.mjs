#!/usr/bin/env node
// Local editorial workflow only: no translation API, network calls or credentials.
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const folder = new URL('tools/reading-comprehension-translations/', root);
const json = async url => JSON.parse(await readFile(url, 'utf8'));
export const sourceOf = data => ({
  title: data.title, heading: data.sourceHeading || '',
  paragraphs: data.paragraphs.map(p => ({number:p.number, label:p.label || '', text:p.text}))
});
export const sourceHash = data => createHash('sha256').update(JSON.stringify(sourceOf(data))).digest('hex');
export function prepareTranslation(data, translation) {
  assert.equal(translation.articleId, data.id, 'Wrong article');
  assert.equal(translation.locale, 'zh-Hant');
  assert.equal(translation.sourceSha256, sourceHash(data), 'English source changed: recheck translation');
  assert.equal(translation.paragraphs.length, data.paragraphs.length, 'Incomplete article');
  const prose = value => {
    assert.equal(typeof value, 'string');
    assert.ok(value.trim() && /[\u3400-\u9fff]/u.test(value), 'Chinese text required');
    assert.ok(!/<\/?[a-z][^>]*>/i.test(value), 'Use plain text, not markup');
    assert.ok(!/(?:TODO|待翻譯|翻譯待補|translation pending)/i.test(value), 'No placeholders');
    return value;
  };
  const content = {
    articleId: data.id, locale:'zh-Hant', sourceTitle:data.title,
    sourceHeading:data.sourceHeading || '', title:prose(translation.title),
    heading:data.sourceHeading ? prose(translation.heading) : '',
    paragraphs:data.paragraphs.map((p,index) => {
      const t=translation.paragraphs[index];
      assert.equal(t.number,p.number,'Paragraph order/number mismatch');
      return {number:p.number,source:p.text,translation:prose(t.translation)};
    })
  };
  return {article_id:data.id,locale:'zh-Hant',source_sha256:translation.sourceSha256,content,published:true};
}
export async function inventory() {
  const catalogue=(await json(new URL('reading-comprehension-catalogue.json',root))).articles;
  const targets=catalogue.filter(a=>a.id!=='p1-069-albert-einstein').sort((a,b)=>a.id.localeCompare(b.id));
  const files=(await readdir(folder)).filter(name=>name.endsWith('.json'));
  const rows=[];
  for(const name of files.sort()) {
    const translation=await json(new URL(name,folder));
    assert.ok(targets.some(a=>a.id===translation.articleId),'Not in the 436 approved articles');
    assert.equal(name,`${translation.articleId}.json`);
    const data=await json(new URL(`reading-comprehension-data/${translation.articleId}.json`,root));
    rows.push(prepareTranslation(data,translation));
  }
  const completed=new Set(rows.map(r=>r.article_id));
  return {rows,summary:{target:targets.length,completed:rows.length,remaining:targets.length-rows.length,
    paragraphs:rows.reduce((n,r)=>n+r.content.paragraphs.length,0),
    completedIds:[...completed],next:targets.find(a=>!completed.has(a.id))?.id || null}};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const {rows,summary}=await inventory();
  const ids=process.argv.slice(3);
  console.log(JSON.stringify(process.argv[2]==='seed' ? rows.filter(r=>!ids.length||ids.includes(r.article_id)) : summary,null,2));
}
