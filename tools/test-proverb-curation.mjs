import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {stages,shuffled,evaluate,highlightedOptions} from '../proverb-curation-core.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const lessons=[1,2,3].map(n=>JSON.parse(read(`content/proverb-compass/proverb-0${n}.json`)));
const context={window:{}};vm.runInNewContext(read('proverb-system-data.js'),context);const source=context.window.EDMUND_PROVERB_SYSTEM_DATA.lessons;
test('all three lessons contain 50 traceable original IDs and 10 distinct themed extensions',()=>{
 const ids=new Set();for(const [i,l]of lessons.entries()){
 assert.equal(l.items.length,60);assert.equal(l.version,'2026-10-28.1');
 assert.deepEqual(l.items.slice(0,50).map(q=>q.id),Array.from(source[i].questions,q=>q.id));
 assert.equal(new Set(l.items.slice(50).map(q=>q.theme)).size,10);
 for(const [j,q]of l.items.entries()){assert(!ids.has(q.id));ids.add(q.id);assert(q.promptEn.trim());assert(/[\u3400-\u9fff]/u.test(q.promptZh));if(j<50){assert.equal(q.source.prompt,source[i].questions[j].prompt);assert.equal(q.source.answer,source[i].questions[j].answer);}}
 }
 assert.equal(ids.size,180);
});
test('all 720 choices are distinct within each item, reasonably balanced, and have specific Chinese reasons',()=>{
 const reasons=new Set();for(const l of lessons)for(const q of l.items){assert.equal(q.options.length,4,q.id);assert.equal(q.options.filter(o=>o.correct).length,1,q.id);assert.equal(new Set(q.options.map(o=>o.text)).size,4,q.id);
 const lengths=q.options.map(o=>o.text.split(/\s+/u).length);assert(Math.max(...lengths)/Math.min(...lengths)<=1.6,`length outlier ${q.id}`);
 for(const o of q.options){assert(/[\u3400-\u9fff]/u.test(o.reasonZh),q.id);assert(!reasons.has(o.reasonZh),`repeated rationale ${q.id}: ${o.reasonZh}`);reasons.add(o.reasonZh);assert(!/<script/i.test(o.text));}
 }assert.equal(reasons.size,720);
});
test('guides have six active stages, 12 distinct decisions, Chinese-first copy and complete feedback',()=>{
 assert.deepEqual(stages.map(s=>s[0]),[1,2,3,5,6,7,8]);const prompts=new Set();for(const l of lessons){const g=l.guide;for(const name of ['meaning','model','picture','boundary','where','tone','readAloud']){assert(g[name].zh);assert(g[name].en);}assert.equal(g.checks.length,3);assert.notEqual(g.model.en,g.readAloud.en);for(const page of [2,3,5,6]){const c=g.choices[page];assert(!prompts.has(c.prompt.en));prompts.add(c.prompt.en);assert(c.prompt.zh);assert.equal(c.options.length,3);assert.equal(c.options.filter(o=>o.correct).length,1);for(const o of c.options){assert(o.zh&&o.en&&o.reasonZh);}}}assert.equal(prompts.size,12);
});
test('wrong selections reveal just their own reason; right selections unlock all reasons after shuffle',()=>{
 for(const l of lessons)for(const q of l.items){const opts=shuffled(q.options,q.id);assert.deepEqual(opts,shuffled(q.options,q.id));for(let i=0;i<4;i++){const r=evaluate(opts,i);assert.equal(r.correct,opts[i].correct);assert.equal(r.reasons.length,opts[i].correct?4:1);if(!r.correct)assert.equal(r.reasons[0],opts[i].reasonZh);}assert.equal(evaluate(opts,99),null);}
});
test('neutral difference highlighting uses only text, escapes markup and preserves every word',()=>{
 const input=['He checks every bag.','He checks one bag.','He checks every parcel.','She checks every bag.'];const output=highlightedOptions(input);assert.equal(output.length,4);for(let i=0;i<4;i++){assert.equal(output[i].replace(/<[^>]*>/g,''),input[i]);assert.match(output[i],/<mark class="diff">/);}assert(!highlightedOptions(['<script>alert(1)</script>','fine'])[0].includes('<script>'));
 const rotation=[...input.slice(1),input[0]];const alt=highlightedOptions(rotation);for(let i=0;i<4;i++)assert.equal(alt[i].replace(/<[^>]*>/g,''),rotation[i]);
});
test('review is separate from student scores, with version-scoped tab storage and no retirement stage',()=>{
 const js=read('proverb-curation-review.mjs'),html=read('proverb-curation-review.html');assert.match(js,/sessionStorage/);assert.doesNotMatch(js,/\/v1\/attempts|authToken|supabase|localStorage/);assert.match(html,/不會寫入學生成績/);assert.match(js,/page===4\)page=5/);assert.match(js,/getUserMedia\(\{audio:true\}\)/);assert.match(js,/getTracks\(\)\.forEach\(t=>t.stop\(\)\)/);assert.match(js,/mediaGeneration/);assert.match(html,/noindex,nofollow/);
});
test('correct positions vary across every lesson without using correctness in the shuffle',()=>{
 for(const l of lessons){const counts=[0,0,0,0];for(const q of l.items)counts[shuffled(q.options,q.id).findIndex(o=>o.correct)]++;assert(counts.every(n=>n>=6&&n<=25),`${l.id}: ${counts}`);}
 const a=shuffled([{text:'a',correct:true},{text:'b',correct:false},{text:'c',correct:false},{text:'d',correct:false}],'same');const b=shuffled([{text:'a',correct:false},{text:'b',correct:true},{text:'c',correct:false},{text:'d',correct:false}],'same');assert.deepEqual(a.map(o=>o.text),b.map(o=>o.text));
});
