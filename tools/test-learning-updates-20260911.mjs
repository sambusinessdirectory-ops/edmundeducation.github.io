import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {resizeBounds,mountFloatingWindow} from '../floating-window.mjs';
import {mountQuestionTypeFinder} from '../question-type-finder.mjs';
import {DIFFICULTIES,HINTS,blankPositions,mountDialoguePage,translationsText} from '../professional-english/dialogue-practice.mjs';
import {classify} from './dse-speaking-question-types.mjs';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const listening=JSON.parse(read('listening-question-types.json')),speaking=JSON.parse(read('dse-speaking-question-types.json'));
assert.equal(listening.questionCount,800);assert.equal(listening.partCount,80);assert.equal(Object.keys(listening.labels).length,8);
const coverage=new Set();for(const row of listening.rows){for(const q of row.questions)for(const n of q.numbers){const key=`${row.practice}:${n}`;assert.ok(!coverage.has(key));coverage.add(key);assert.equal(Math.ceil(n/10),row.part);}assert.equal(row.questions.flatMap(q=>q.numbers).length,row.last-row.first+1);assert.ok(row.href.includes(`question=${row.first}`));}assert.equal(coverage.size,800);
for(const [type,count] of Object.entries(listening.counts))assert.equal(count.questions,listening.rows.filter(r=>r.type===type).reduce((n,r)=>n+r.last-r.first+1,0));
assert.equal(listening.rows.find(r=>r.practice===8&&r.first===15).type,'matching');assert.equal(listening.rows.find(r=>r.practice===7&&r.first===26).type,'flowchart');assert.equal(listening.rows.find(r=>r.practice===11&&r.first===1).last,4);assert.equal(listening.rows.find(r=>r.practice===13&&r.first===8).type,'table');
const context={window:{}};for(const f of ['dse-speaking-data.js','dse-speaking-paper-supplement.js'])vm.runInNewContext(read(f),context);const sets=[...context.window.EDMUND_DSE_SPEAKING_DATA.sets,...context.window.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets];
assert.equal(speaking.rows.length,3102);assert.equal(speaking.setCount,282);assert.equal(new Set(speaking.rows.map(r=>r.id)).size,3102);
for(const row of speaking.rows){const set=sets.find(s=>s.year===row.year&&s.set===row.set);assert.equal(row.text,set[row.section==='group'?'groupDiscussion':'individualResponse'][row.number-1]);assert.ok(row.types.length>0);for(const type of row.types)assert.ok(speaking.labels[type]);assert.doesNotMatch(row.text,/^(?:You are members|want to talk about:|may want to talk about:)/);}
for(const [type,count]of Object.entries(speaking.counts)){assert.equal(count.questions,speaking.rows.filter(r=>r.types.includes(type)).length);assert.equal(count.questions,count.group+count.individual);}
for(const row of speaking.rows)assert.doesNotMatch(row.text,/TAKE AWAY|\?\s+.*(?:\d{2,}|NOT WAY)$/);
assert.ok(classify('The advantages and disadvantages of using social media','group').includes('advantages'));assert.ok(classify('The advantages and disadvantages of using social media','group').includes('disadvantages'));assert.ok(classify('What can students learn from a summer job?','individual').includes('advantages'));assert.ok(classify('Which is worse — poor service or bad food?','individual').includes('comparisons'));
assert.equal(sets.find(s=>s.year===2025&&s.set==='5.3').groupDiscussion[1],'challenges of taking a gap year');
const rect={left:100,top:100,right:700,bottom:600,width:600,height:500};for(const corner of ['nw','ne','sw','se']){const r=resizeBounds(rect,corner,40,30,{width:1200,height:900});assert.equal(r.width,corner.includes('w')?560:640);assert.equal(r.height,corner.includes('n')?470:530);if(corner.includes('w'))assert.equal(r.left+r.width,700);else assert.equal(r.left,100);if(corner.includes('n'))assert.equal(r.top+r.height,600);else assert.equal(r.top,100);}
const tiny=resizeBounds(rect,'se',-5000,-5000,{width:1200,height:900});assert.equal(tiny.width,280);assert.equal(tiny.height,160);
const dom=new JSDOM('<body><div id="finder"></div><aside id="panel"><header>Drag</header></aside></body>',{url:'https://edmundeducation.com/professional-english/dialogue.html?id=l1d1'});const w=dom.window;
for(const key of ['window','document','localStorage','history','location','navigator','CustomEvent','innerHeight','innerWidth'])Object.defineProperty(globalThis,key,{value:w[key],configurable:true});
w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};w.HTMLElement.prototype.setPointerCapture=function(){};
let played=[];class FakeAudio{constructor(src){this.src=src;this.paused=true;played.push(this);}async play(){this.paused=false;this.onplay?.();}pause(){this.paused=true;this.onpause?.();}load(){}removeAttribute(){}}
globalThis.Audio=FakeAudio;
const root=w.document.getElementById('finder');let opened;mountQuestionTypeFinder(root,{data:listening,kind:'listening',onOpen:r=>opened=r});root.querySelector('[data-qtf-type="map"]').click();assert.equal(root.querySelectorAll('.qtf-result').length,5);assert.match(root.querySelector('[data-qtf-status]').textContent,/27 題/);root.querySelector('[data-qtf-open]').click();assert.equal(opened.type,'map');assert.equal(opened.first,17);
root.querySelector('[data-qtf-clear]').click();const search=root.querySelector('input');search.value='表格';search.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(root.querySelectorAll('.qtf-result').length,9);
const r2=w.document.createElement('div');w.document.body.append(r2);mountQuestionTypeFinder(r2,{data:speaking,kind:'speaking'});r2.querySelector('[data-qtf-type="advantages"]').click();assert.ok(r2.querySelectorAll('.qtf-result').length>0);const section=r2.querySelector('[data-qtf-section]');section.value='individual';section.dispatchEvent(new w.Event('change'));assert.ok([...r2.querySelectorAll('.qtf-meta')].every(n=>n.textContent.includes('個人發言')));
const panel=w.document.getElementById('panel');mountFloatingWindow(panel,{dragHandle:panel.querySelector('header')});mountFloatingWindow(panel);assert.equal(panel.querySelectorAll('[data-resize-corner]').length,4);
const data=JSON.parse(read('professional-english/dialogues.json'));assert.equal(data.dialogues.length,7);assert.equal(data.dialogues.reduce((n,d)=>n+d.lines.length,0),87);
const publishedAudio=JSON.parse(read('professional-english/dialogue-audio.json'));
let pendingAudio=0;
for(const dialogue of data.dialogues)for(const [i,line]of dialogue.lines.entries()){
 const clip=publishedAudio[`${dialogue.id}:${i}`];
 if(!clip){assert.equal(line.voice,'american-male','only the quota-blocked Aries clips may be unavailable');pendingAudio++;continue;}
 assert.equal(clip.voice,line.voice);assert.equal(clip.sourceSha256,createHash('sha256').update(line.en).digest('hex'));
 const audio=fs.readFileSync(new URL('../professional-english/'+clip.path,import.meta.url));
 assert.ok(audio.length>256);assert.ok(audio.subarray(0,3).toString()==='ID3'||audio[0]===255);assert.ok(clip.duration>0);
}
assert.ok(pendingAudio===0||pendingAudio===23);if(process.argv.includes('--require-complete-audio'))assert.equal(pendingAudio,0);
const manifest={};for(const d of data.dialogues){for(const [i,l]of d.lines.entries()){assert.ok(l.zh);const expected=l.role==='Visitor'?(d.lesson===1?'british-male':'british-female'):(d.lesson===1?'american-female':'american-male');assert.equal(l.voice,expected);manifest[`${d.id}:${i}`]={path:`audio/${d.id}-${i}.mp3`};}for(const rate of DIFFICULTIES.map(x=>x.rate))assert.ok(d.lines.every((l,i)=>blankPositions(l.en,i,rate).size>0));}
assert.match(translationsText(data.dialogues[0]),/訪客：早上好/);assert.equal(data.voiceRecipes['american-male'].voice,'aries');assert.equal(data.voiceRecipes['american-female'].voice,'af_heart');assert.equal(data.voiceRecipes['british-female'].voice,'bf_isabella');assert.equal(data.voiceRecipes['british-male'].voice,'bm_fable');
const app=mountDialoguePage({dialogues:data.dialogues,audioManifest:manifest});const page=app.page;
assert.equal(page.querySelectorAll('.pro-turn').length,13);assert.equal(page.querySelectorAll('dialog').length,0);page.querySelector('[data-show-chinese]').click();assert.equal(page.querySelectorAll('[data-chinese][hidden]').length,0);
page.querySelector('[data-play-all]').click();await Promise.resolve();assert.ok(page.querySelector('[data-dialogue-line="0"]').classList.contains('is-speaking'));page.querySelector('[data-pro-speed="0.5"]').click();assert.equal(played.at(-1).playbackRate,.5);played.at(-1).onended();await Promise.resolve();assert.ok(page.querySelector('[data-dialogue-line="1"]').classList.contains('is-speaking'));assert.equal(played.at(-1).playbackRate,.5);page.querySelector('[data-sync-highlight]').click();assert.equal(page.querySelectorAll('.is-speaking').length,0);page.querySelector('[data-stop-audio]').click();assert.ok(played.at(-1).paused);
page.querySelector('[data-choose-mode]').click();assert.equal(page.querySelectorAll('[data-mode]').length,16);assert.equal(page.querySelectorAll('select').length,0);page.querySelector('[data-mode="medium"][data-hints="first"]').click();assert.match(location.search,/view=practice/);const inputs=[...page.querySelectorAll('[data-blank]')];assert.ok(inputs.length>0);inputs.forEach((input,i)=>input.value=i?'wrong':input.dataset.answer);page.querySelector('[data-check-answers]').click();assert.match(page.querySelector('[data-result-status]').textContent,/1 \/ /);assert.equal(page.querySelectorAll('.is-correct').length,1);page.querySelector('[data-retry-mistakes]').click();assert.ok(inputs[0].value);assert.equal(inputs[1].value,'');app.stop();
assert.match(read('speaking-system.js'),/apiRaw\("\/v1\/learning-voice"/);assert.doesNotMatch(read('speaking-system.js'),/function fallbackDseVoice/);assert.ok(read('speaking-system.js').includes('openRequestedDseQuestion'));
history.replaceState(null,'','?id=l2d1');const pending=mountDialoguePage({dialogues:data.dialogues,audioManifest:publishedAudio});
assert.equal(pending.page.querySelector('[data-play-all]').disabled,pendingAudio>0);assert.equal(pending.page.querySelectorAll('[data-play-line]:disabled').length,pendingAudio>0?data.dialogues.find(d=>d.id==='l2d1').lines.filter(l=>l.voice==='american-male').length:0);
pending.page.querySelector('[data-show-chinese]').click();assert.equal(pending.page.querySelectorAll('[data-chinese][hidden]').length,0);pending.stop();
console.log('Validated 800 listening questions, 3,102 speaking questions, four-corner geometry, finder filters/deep links, 87 translated lines, 16 modes, answer feedback and synchronized audio controls.');w.close();
