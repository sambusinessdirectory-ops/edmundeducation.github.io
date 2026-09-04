import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {DEEP_ANALYSIS_ARTICLES,sourceBody,findPages,renderRichBody} from '../dse-deep-analysis.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(root,'dse-reading-analysis/dse-2023-a');
const data=JSON.parse(await readFile(resolve(dir,'index.json'),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(data.pageCount,322);assert.equal(data.pages.length,322);assert.equal(data.questions.length,22);
assert.equal(hash(await readFile(resolve(dir,'original.pdf'))),data.sourceSha256);
assert.deepEqual(data.questions.map(q=>q.number),Array.from({length:22},(_,i)=>i+1));
assert.deepEqual([...data.questions.flatMap(q=>q.pages),...data.supplementaryPages].sort((a,b)=>a-b),Array.from({length:322},(_,i)=>i+1));
for(const page of data.pages){
  assert.equal([page.header.join('\n'),sourceBody(page),page.footer.join('\n')].filter(Boolean).join('\n'),page.text,`All text preserved p.${page.number}`);
  assert.equal(hash(page.text),page.sha256);
  const glyphs=text=>[...text].filter(c=>!c.trim() ? false : true).sort().join('');
  assert.equal(glyphs(page.richBody.flatMap(row=>row.runs.map(run=>run.text)).join('')),glyphs(sourceBody(page)),`Rich text retains every non-whitespace source character on p.${page.number}`);
  const rendered=renderRichBody(page);
  assert.ok(!rendered.includes('<script'));

  assert.ok((await stat(resolve(dir,page.image))).size>1000);
}
for(const q of data.questions){assert.match(data.pages[q.startPage-1].text,new RegExp(`Question ${q.number}\\b`));assert.ok(q.answer);assert.equal(q.pages[0],q.startPage);assert.equal(q.pages.at(-1),q.endPage);}
assert.equal(data.questions[13].pages.length,51);
assert.ok(findPages(data.pages,'unless').length>10);
assert.ok(findPages(data.pages,'常見誤讀').length>1);
assert.equal(findPages(data.pages,'nonexistent-text-string-abc').length,0);
assert.equal(findPages(data.pages,'').length,322);
assert.ok(DEEP_ANALYSIS_ARTICLES.has('dse-2023-a'));assert.ok(!DEEP_ANALYSIS_ARTICLES.has('dse-2023-b1'));
assert.match(data.pages[279].text,/Not a good example/);
for(const [number,color] of [[173,'cyan'],[220,'pink'],[223,'yellow'],[248,'pink']]){
  const page=data.pages[number-1];
  assert.ok(page.richBody.some(row=>row.runs.some(run=>run.style.highlight===color)),`Original ${color} emphasis p.${number}`);
  assert.match(renderRichBody(page),new RegExp('source-highlight-'+color));
}
assert.ok(data.pages[219].richBody.some(row=>row.runs.some(run=>run.style.size>=19)));
assert.ok(data.pages[172].richBody.some(row=>row.runs.some(run=>run.style.bold && run.text.includes('speech verb'))));
assert.ok(data.pages[247].richBody.some(row=>row.runs.map(run=>run.text).join('').includes('但題目問 BOOM 的直接成因。')));
const script=await readFile(resolve(root,'reading-comprehension.js'),'utf8');
assert.match(script,/progress\.answered < progress\.total/);
assert.match(script,/saveDseDraft\(\); pauseTimer\(\); el\.audio\.pause\(\)/);
assert.match(script,/deepReader\.open\(state\.data, number, state\.user\.id/);
console.log('DSE deep analysis passed: 22 questions; all 322 pages partitioned, text hashes verified, unchanged source PDF and original page views present.');
