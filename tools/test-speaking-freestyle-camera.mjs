import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {seatLayout} from '../speaking-classroom-3d.mjs';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url)),{JSDOM}=require('jsdom');
for(const count of [2,3,4])for(let i=0;i<count;i++){const p=seatLayout(count,i);const dx=-p.x,dz=1.15-p.z;assert.ok(Math.abs(Math.atan2(dx,dz)-p.yaw)<1e-9,'seats face the common discussion centre');}
const source=await fs.readFile(new URL('../speaking-system.js',import.meta.url),'utf8');
assert.ok(source.includes('id:"freestyle",title:"Freestyle Speaking"'));
assert.ok(source.includes('presentation: exam.dataset.exam === "freestyle" ? "freestyle" : ""'));
const fn=source.slice(source.indexOf('  function applySpeakingPresentation()'),source.indexOf('  function sectionHeader('));
const d=new JSDOM('<main><h1>IELTS 說話考試</h1><p>IELTS SPEAKING · Band 9 · EXAM MODE</p><figure class="exam-practice-cover"><img src="assets/speaking-system/ielts-exam-practice-mode.png" alt="IELTS"></figure><p data-question>Describe a place you enjoy visiting.</p></main><nav>IELTS · Part 2</nav>');
const w=d.window,state={route:{presentation:'freestyle'}},dom={content:w.document.querySelector('main'),breadcrumbs:w.document.querySelector('nav')};
vm.runInNewContext(fn+'applySpeakingPresentation();',{state,dom,document:w.document,NodeFilter:w.NodeFilter});
assert.doesNotMatch(dom.content.textContent,/IELTS|Band 9|EXAM MODE/);assert.doesNotMatch(dom.breadcrumbs.textContent,/IELTS/);assert.equal(dom.content.querySelector('[data-question]').textContent,'Describe a place you enjoy visiting.');assert.ok(dom.content.querySelector('img').src.endsWith('freestyle-practice-mode.png'));
state.route.presentation='';dom.content.innerHTML='<h1>IELTS Speaking</h1>';vm.runInNewContext(fn+'applySpeakingPresentation();',{state,dom,document:w.document,NodeFilter:w.NodeFilter});assert.equal(dom.content.textContent,'IELTS Speaking');w.close();
console.log('Freestyle preserves question content, removes visible branding, keeps IELTS unchanged; 2/3/4 seats face inward.');
