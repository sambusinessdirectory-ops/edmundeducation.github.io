import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const all={};
for(const [kind,count] of Object.entries({'dse-speaking':3102,'ielts-speaking':1545,'dse-reading':45,'ielts-reading':437})){
 const d=all[kind]=read(kind+'-themes.json');assert.equal(d.total,count);assert.equal(d.rows.length,count);assert.equal(new Set(d.rows.map(r=>r.id)).size,count);
 const themes=new Set(d.themes.map(t=>t.id));
 for(const r of d.rows){assert.ok(r.themes.length>0,r.id);assert.ok(r.text,r.id);for(const t of r.themes)assert.ok(themes.has(t),t);const url=new URL(r.href,'https://edmundeducation.com');assert.equal(url.origin,'https://edmundeducation.com');if(kind.endsWith('reading'))assert.ok(fs.existsSync((kind==='dse-reading'?'dse-reading-data/':'reading-comprehension-data/')+r.id+'.json'));}
 for(const t of d.themes)assert.equal(t.count,d.rows.filter(r=>r.themes.includes(t.id)).length);
}
const context={window:{}};for(const f of ['dse-speaking-data.js','dse-speaking-paper-supplement.js','speaking-system-data.js','speaking-system-part1-data.js','speaking-system-part3-data.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),context);
const w=context.window;const expected=[...w.EDMUND_DSE_SPEAKING_DATA.sets,...w.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets].flatMap(s=>['group','individual'].flatMap(k=>s[k==='group'?'groupDiscussion':'individualResponse'].map((_,i)=>`${s.year}:${s.set}:${k}:${i+1}`)));
assert.deepEqual(new Set(all['dse-speaking'].rows.map(r=>r.id)),new Set(expected));
for(const r of all['ielts-speaking'].rows){const d=r.part===1?w.EDMUND_SPEAKING_PART1_DATA:r.part===2?w.EDMUND_SPEAKING_DATA:w.EDMUND_SPEAKING_PART3_DATA;const e=d.books.find(b=>b.book===r.book)?.exercises.find(e=>e.index===r.exerciseIndex);assert.equal(e?.id,r.exerciseId);}
assert.deepEqual(new Set(all['ielts-reading'].rows.map(r=>r.id)),new Set(read('reading-comprehension-catalogue.json').articles.map(r=>r.id)));
assert.deepEqual(new Set(all['dse-reading'].rows.map(r=>r.id)),new Set(read('dse-reading-catalogue.json').years.flatMap(y=>Object.values(y.sections).map(s=>s.id))));
for(const [title,theme] of [['Black Gold','food'],['Coming of Age','business']])assert.ok(all['ielts-reading'].rows.find(r=>r.title===title)?.themes.includes(theme),title);
console.log('PASS: 5,129 indexed items; source IDs, destinations, counts, labels and semantic regressions.');
if(process.argv.includes('--dom')){
 const {JSDOM}=await import('./email-qa/node_modules/jsdom/lib/api.js');const dom=new JSDOM('<div id="root"></div>',{url:'https://edmundeducation.com'});globalThis.document=dom.window.document;globalThis.AbortController=dom.window.AbortController;
 const {mountThemeFinder}=await import('../theme-finder.mjs');const root=document.querySelector('#root');let opened;mountThemeFinder(root,{data:all['dse-reading'],onOpen:r=>opened=r});assert.equal(root.querySelectorAll('.tf-result').length,30);
 root.querySelector('[data-more]').click();assert.equal(root.querySelectorAll('.tf-result').length,45);
 const search=root.querySelector('[data-search]');search.value='科技';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.ok(root.querySelectorAll('.tf-result').length>0);assert.ok(root.querySelectorAll('.tf-result').length<45);
 root.querySelector('[data-clear]').click();const section=root.querySelector('[data-section]');section.value='B1';section.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(root.querySelectorAll('.tf-result').length,15);root.querySelector('[data-open]').click();assert.equal(opened.section,'B1');
 mountThemeFinder(root,{data:all['ielts-reading']});root.querySelector('[data-theme="sports"]').click();assert.equal(root.querySelector('[data-theme="sports"]').getAttribute('aria-pressed'),'true');console.log('PASS: search, reset, section filter, pagination, navigation and remount.');
}
