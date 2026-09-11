import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),context={window:{}};
for(const p of ['dse-speaking-data.js','dse-speaking-paper-supplement.js','dse-speaking-source-layouts.js','dse-speaking-illustration-manifest.js','dse-speaking-source.js']) vm.runInNewContext(read(p),context);
const w=context.window,source=w.EDMUND_DSE_SPEAKING_SOURCE,sets=[...w.EDMUND_DSE_SPEAKING_DATA.sets,...w.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets].filter(s=>Number(s.year)===2024);
const expected={'1.1':2,'1.3':1,'2.2':1,'3.2':3,'3.3':2,'5.1':1,'5.2':5,'6.1':2,'7.1':3,'7.2':1,'7.3':1,'8.1':1,'8.2':1,'8.3':1};
assert.equal(sets.length,24);
let total=0;
for(const set of sets){
 const figures=source.illustrationsFor(set),segments=source.segmentsFor(set);
 assert.equal(figures.length,expected[set.set]||0,set.set);total+=figures.length;
 for(const f of figures){assert.ok(f.beforeSegment<segments.length);assert.ok(f.alt);assert.ok(f.width>0&&f.height>0);assert.equal(fs.readFileSync(new URL(f.src,root)).subarray(0,4).toString(),'RIFF');}
 for(const native of [true,false]){
  const html=source.render(segments,t=>String(t),native,figures);
  assert.equal((html.match(/<img /g)||[]).length,figures.length);
  for(const f of figures)assert.equal(html.split(f.src).length-1,1,'Every original crop appears once');
 }
}
assert.equal(total,25);
const audit=JSON.parse(read('tools/dse-2024-illustrations-audit.json'));
assert.equal(audit.crops.reduce((sum,c)=>sum+c.visualCount,0),29);
assert.equal(audit.auditedPages,48);
for(const html of ['speaking-system.html','speaking-professional.html']){
 const text=read(html);assert.match(text,/dse-speaking-illustrations\.css/);assert.match(text,/dse-speaking-source\.js/);
}
assert.match(read('speaking-professional.mjs'),/source\.illustrationsFor\(session.topic\)/);
console.log('2024 DSE: all 24 papers audited; 25 source crops preserve 29 illustrations in 14 sets; both renderers and asset references passed.');
