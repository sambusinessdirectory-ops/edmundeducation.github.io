import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const dom=new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>',{runScripts:'outside-only',url:'https://example.test/grammar-system.html'});
const w=dom.window,d=w.document;
w.HTMLElement.prototype.scrollIntoView=function(){};
w.requestAnimationFrame=()=>1;
for(const f of ['grammar-tense-data.js','grammar-tense-curation-data.js','grammar-articles-data.js','grammar-advanced-articles-data.js','grammar-tense-extension-data.js','grammar-advanced-articles-extension-data.js','grammar-new-curations-data.js','grammar-indefinite-pronouns-data.js','grammar-system.js','grammar-articles.js','grammar-advanced-articles.js'])w.eval(read(f));
const normal=s=>s.replace(/\s+/g,'');
const old=[...d.querySelectorAll('[data-tense-curation] article,[data-articles-curation] article,[data-advanced-articles-curation] article')].map(card=>({id:card.id,blocks:[...card.querySelectorAll('p,h3,button')].map(x=>normal(x.textContent)).filter(Boolean)}));
w.eval(read('grammar-dialogue-notes.js'));w.eval(read('grammar-new-curations.js'));w.eval(read('grammar-dialogue-propagation.js'));
for(const {id,blocks} of old){
 const text=normal(d.getElementById(id).textContent);
 for(const block of blocks)assert.ok(text.includes(block),id+' lost content: '+block);
}
for(const [slug,count] of Object.entries({tense:61,articles:66,'advanced-articles':31,so:30,modal:42})){
 const view=d.querySelector('[data-eddy-module="'+slug+'"]');
 const figures=[...view.querySelectorAll('figure')];assert.equal(figures.length,count,slug);
 figures.forEach((f,i)=>{
 assert.ok(f.querySelector('figcaption').textContent.trim().length>15,slug+' note '+(i+1));
 assert.equal(f.querySelector('img').getAttribute('src'),`grammar-eddy-dialogues/unless/eddy-${String(i%33+1).padStart(2,'0')}.webp?v=20261106-live-assets1`);
 });
}
for(const guide of w.EDMUND_GRAMMAR_NEW_CURATIONS_DATA.filter(x=>['so','modal'].includes(x.slug))){
 const source=d.createElement('div');source.innerHTML=guide.html;
 const rendered=normal(d.querySelector('[data-new-grammar-curation="'+guide.slug+'"]').textContent);
 for(const node of source.querySelectorAll('p,li,td,blockquote'))assert.ok(rendered.includes(normal(node.textContent)),guide.slug+' lost '+node.textContent);
}
const check=d.querySelector('[data-tense-checkpoint-choice="form"]');assert.ok(check);check.click();
assert.equal(check.getAttribute('aria-pressed'),'true','Existing checkpoint handler retained');
d.querySelector('[data-tense-practice-question="151"]').click();
assert.equal(d.querySelector('[data-grammar-practice]').hidden,false,'Practice link retained');
assert.match(w.location.search,/question=151/);
dom.window.close();
console.log('PASS: 230 specific captions; 33-pose cycle; every original teaching paragraph preserved; checkpoint and practice links retained.');
