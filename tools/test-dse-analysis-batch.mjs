import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {DEEP_ANALYSIS_ARTICLES,sourceBody,renderRichBody,analysisAssetUrl,questionPageLabel} from '../dse-deep-analysis.mjs';
const root=new URL('../',import.meta.url);
const load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const glyphs=text=>[...text].filter(c=>c.trim()).sort().join('');
const expected={
 'dse-2023-b1':[226,23,45,'2a08df94064a6a8ceb266efdd6aaa15ffe7b085fdc7dd0a8ebd48fb3542d9714'],
 'dse-2023-b2':[194,46,69,'dd2b34c00397550c99ef13fc33ee64d3e1674b5bae0f0be2bbfd0eb0b51f5ca5'],
 'dse-2024-a':[210,1,23,'2fd73c4f2f2de70d4c42d35fb5cde0cb76237e688d369fdeadf6690019669c9c'],
 'dse-2024-b1':[160,24,42,'9e5822ab1ac6bf5082eebf6822d6420dc1feb6156cb4bd6b467d6025a0de3fd6'],
 'dse-2024-b2':[262,43,62,'03ea38d5dd659334dfc3a365b51093dfb6f3d59c100bf7dc93e508924ada3ba7'],
 'dse-2025-a':[190,1,21,'02d9ea069193e886222bbc582cd66a1804032f0feae5b0a12ee89c8ee63691e6'],
 'dse-2025-b1':[210,22,42,'f004f85138d29bff36e7625cded3ea59f619db35772b5d28924810cf0c31ee65'],
 'dse-2025-b2':[301,43,64,'b08c0df875c7b574e42f6cd77c33766a9822370c83034405cd3bb83301427c36']};
const site=await load('workers/edmund-site-assets/src/site-pack-index-v1.json');
let pages=0,questions=0,figures=0,emphasis=0;
for(const [id,[count,first,last,sha]] of Object.entries(expected)){
 const data=await load(`dse-reading-analysis/${id}/index.json`);const paper=await load(`dse-reading-data/${id}.json`);
 assert.ok(DEEP_ANALYSIS_ARTICLES.has(id));assert.equal(data.articleId,id);assert.equal(data.pageCount,count);assert.equal(data.pages.length,count);assert.equal(data.sourceSha256,sha);
 assert.deepEqual(data.questions.map(q=>q.number),paper.questions.map(q=>q.number));assert.equal(data.questions[0].number,first);assert.equal(data.questions.at(-1).number,last);
 const owned=data.questions.flatMap(q=>q.ownedPages??q.pages);
 assert.deepEqual([...owned,...data.supplementaryPages].sort((a,b)=>a-b),Array.from({length:count},(_,i)=>i+1),'Each original page assigned exactly once');
 for(const [i,page] of data.pages.entries()){
  assert.equal(page.number,i+1);assert.equal([...page.header,...page.body,...page.footer].join('\n'),page.text);assert.equal(hash(page.text),page.sha256);
  assert.equal(glyphs(page.richBody.flatMap(row=>row.runs.map(run=>run.text)).join('')),glyphs(sourceBody(page)),`${id} p${i+1} rich text loss`);
  const html=renderRichBody(page,'',name=>analysisAssetUrl(data,name));assert.ok(!/<script|onerror=|javascript:/i.test(html));
  for(const row of page.richBody){assert.ok(Number.isFinite(row.top));for(const run of row.runs){assert.ok(typeof run.text==='string');if(run.style.highlight)emphasis++;}}
  for(const name of [page.image,...(page.figures||[]).map(f=>f.file)]){
   const path=new URL(analysisAssetUrl(data,name)).pathname.replace('/site-assets/v1/','');const entry=site.entries[path];assert.ok(entry,`Missing Cloudflare source asset ${path}`);
   assert.ok(site.packs[entry[0]]);assert.ok(entry[1]>=0&&entry[2]>0&&entry[1]+entry[2]<=site.packs[entry[0]].size);assert.equal(entry[3],'image/webp');
  }
  figures+=(page.figures||[]).filter(f=>f.alt!=='原書封面').length;
 }
 for(const q of data.questions){
  assert.ok(q.answer&&q.answerLabel);assert.equal(q.pages[0],q.startPage);assert.equal(q.pages.at(-1),q.endPage);
  if(q.referenceOnly){assert.equal(id,'dse-2025-a');assert.equal(q.number,15);assert.deepEqual(q.pages,[27,190]);assert.match(q.sourceNote,/沒有.*獨立/);assert.equal(questionPageLabel(q),'原書 p.27、190');}
  else{
   assert.equal(data.pages[q.startPage-1].category,'task');
   assert.deepEqual(q.pages,Array.from({length:q.endPage-q.startPage+1},(_,i)=>q.startPage+i));
   const start=data.pages[q.startPage-1].text;
   // 2024 A Q13 omits its numeral in the source heading; its actual question and 13(i–iii) identify it.
   if(id==='dse-2024-a'&&q.number===13){assert.match(start,/Complete the summary of paragraph 5/);assert.match(start,/banyan/);assert.match(data.pages.slice(q.startPage,q.endPage).map(p=>p.text).join('\n'),/13[（(]i[）)]|Question 13|13\.\s*\(i\)/);}
   else assert.match(start,new RegExp(`(?:Question\\s*|Q\\s*|^|\\n)${q.number}(?:\\b|[.．、])`),`${id} Q${q.number} source boundary`);
  }
  if(q.answerSourcePages){assert.ok(q.answerSourcePages.every(n=>data.pages[n-1].text.includes(String(q.number))));assert.ok(q.answerSourcePages.every(n=>n<q.startPage));}
 }
 for(const file of [data.sourcePdf,...(data.sourceVariants||[]).map(v=>v.sourcePdf)]){
  const path=new URL(analysisAssetUrl(data,file)).pathname.replace('/site-assets/v1/','');assert.equal(site.entries[path]?.[3],'application/pdf');
 }
 assert.equal(data.pages[0].figures[0].file,'page-001.webp');
 if(id==='dse-2023-b1'){assert.match(data.questions.find(q=>q.number===32).sourceNote,/不能確定/);assert.match(data.questions.find(q=>q.number===45).sourceNote,/部分配對/);}
 if(id==='dse-2024-b1'){assert.equal(data.sourceVariants.length,1);assert.notEqual(data.sourceVariants[0].sourceSha256,sha);}
 if(id==='dse-2025-a'){assert.equal(data.sourceVariants[0].byteIdentical,true);assert.equal(data.sourceVariants[0].sourceSha256,sha);}
 pages+=count;questions+=data.questions.length;
}
assert.equal(pages,1753);assert.equal(questions,173);assert.equal(figures,3);assert.ok(emphasis>100);
assert.throws(()=>analysisAssetUrl({articleId:'test'},'../secret'));
assert.throws(()=>analysisAssetUrl({assetBase:'https://other.example/'},'original.pdf'));
assert.equal(analysisAssetUrl({articleId:'dse-2023-a'},'original.pdf'),'dse-reading-analysis/dse-2023-a/original.pdf');
console.log(`Batch analysis passed: ${pages} pages, ${questions} question entries, ${figures} embedded diagrams; full text, rich glyphs, partitions, sources and CDN references checked.`);
