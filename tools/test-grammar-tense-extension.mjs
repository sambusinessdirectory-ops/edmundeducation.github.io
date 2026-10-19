import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));const {JSDOM}=require('jsdom');
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const baseFiles=['grammar-tense-data.js','grammar-tense-curation-data.js','grammar-articles-data.js','grammar-advanced-articles-data.js'];
const extensionFiles=['grammar-tense-extension-data.js','grammar-advanced-articles-extension-data.js'];
const dataFiles=[...baseFiles,...extensionFiles],scope={window:{}};vm.createContext(scope);baseFiles.forEach(f=>vm.runInContext(read(f),scope));
const originals=JSON.stringify({questions:scope.window.EDMUND_GRAMMAR_TENSE_QUESTIONS,guide:scope.window.EDMUND_GRAMMAR_TENSE_CURATION,advanced:scope.window.EDMUND_GRAMMAR_ADVANCED_ARTICLES_DATA});
extensionFiles.forEach(f=>vm.runInContext(read(f),scope));
const w=scope.window,tense=w.EDMUND_GRAMMAR_TENSE_QUESTIONS,guide=w.EDMUND_GRAMMAR_TENSE_CURATION,advanced=w.EDMUND_GRAMMAR_ADVANCED_ARTICLES_DATA;
assert.equal(JSON.stringify({questions:tense.slice(0,150),guide:guide.slice(0,52),advanced:{...advanced,topics:advanced.topics.slice(0,27),questions:advanced.questions.slice(0,100)}}),originals,'Every original concept and exercise is unchanged');
assert.equal(tense.length,195);assert.equal(guide.length,61);assert.equal(advanced.questions.length,120);assert.equal(advanced.topics.length,31);
for(const [manifest,concepts,questions,start] of [
 ['tools/grammar-tense-extension-manifest.json',guide.slice(52),tense.slice(150),151],
 ['tools/grammar-articles-extension-manifest.json',advanced.topics.slice(27),advanced.questions.slice(100),251]
]){
 const m=JSON.parse(read(manifest));assert.deepEqual(m.coverage.flatMap(c=>c.questionNumbers).sort((a,b)=>a-b),Array.from({length:questions.length},(_,i)=>i+start));
 for(const c of concepts){assert.equal(c.questionNumbers.length,5);assert.ok(c.focus || c.body);}
 for(const q of questions){assert.ok(q.prompt&&q.translation&&q.answer&&q.completeSentence);assert.equal(q.conceptNumber,concepts.find(c=>c.questionNumbers.includes(q.number)).number);assert.equal(q.steps?.length || q.explanation.filter(p=>/^步驟/.test(p)).length,7);}
}
assert.equal(tense.slice(150).filter(q=>q.stage==='extension-guided').length,27);assert.equal(advanced.questions.slice(100).filter(q=>q.stage==='extension-guided').length,12);
function dom(url){const dom=new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>',{runScripts:'outside-only',pretendToBeVisual:true,url});const {window:w}=dom;w.HTMLElement.prototype.scrollIntoView=function(){};
 w.localStorage.setItem('edmund-grammar-tense-v1:guest',JSON.stringify({current:150,attempts:{1:{answer:'walks',status:'correct'},150:{answer:'will have been waiting',status:'correct'}}}));
 w.localStorage.setItem('edmund-grammar-advanced-articles-v1:guest',JSON.stringify({question:250,attempts:{151:{answer:'x',status:'correct'},250:{answer:'the',status:'correct'}}}));
 [...dataFiles,'grammar-system.js','grammar-articles.js','grammar-advanced-articles.js'].forEach(f=>w.eval(read(f)));return dom;}
const d=dom('https://example.test/grammar-system.html?lesson=tense&view=practice&question=151'),doc=d.window.document;
assert.equal(doc.querySelectorAll('[data-tense-topic]').length,61);assert.match(doc.querySelector('#tense-topic-53 h3').textContent,/while/);assert.match(doc.querySelector('#tense-topic-61 h3').textContent,/if/);
assert.equal(doc.querySelector('[data-question-range]').options.length,8);assert.equal(doc.querySelector('[data-question-range]').options[7].textContent,'第 176–195 題');
for(const q of tense.slice(150)){
 const select=doc.querySelector('[data-question-range]');select.value=String(Math.floor((q.number-1)/25)*25+1);select.dispatchEvent(new d.window.Event('change'));
 doc.querySelector(`[data-question-grid] button[data-question-number="${q.number}"]`).click();
 assert.equal(doc.querySelector('[data-question-instruction]').hidden,false);assert.ok(doc.querySelector('[data-question-instruction-en]').textContent);
 const form=doc.querySelector('[data-answer-form]');const submit=value=>{form.querySelector('input').value=value;form.dispatchEvent(new d.window.Event('submit',{bubbles:true,cancelable:true}));return doc.querySelector('[data-feedback]').dataset.state;};
 assert.equal(submit('not-an-answer'),'wrong');assert.equal(submit(q.answer),'correct',`Tense ${q.number}`);assert.equal(submit(q.completeSentence),'correct',`Full sentence ${q.number}`);
 for(const alternative of q.acceptedAnswers)assert.equal(submit(alternative),'correct');
 assert.equal(doc.querySelectorAll('[data-inline-steps] [data-step-number]').length,7);
}
assert.equal(doc.querySelector('[data-next-question]').disabled,true);assert.equal(doc.querySelector('.grammar-progress').getAttribute('aria-valuemax'),'195');
assert.equal(JSON.parse(d.window.localStorage.getItem('edmund-grammar-tense-v1:guest')).attempts[1].status,'correct');assert.equal(JSON.parse(d.window.localStorage.getItem('edmund-grammar-tense-v1:guest')).attempts[150].status,'correct');d.window.close();
const a=dom('https://example.test/grammar-system.html?lesson=advanced-articles&view=practice&question=251'),ad=a.window.document;
assert.equal(ad.querySelectorAll('[data-advanced-articles-topic]').length,32);assert.ok(ad.querySelector('#advanced-articles-topic-94'));assert.ok(ad.querySelector('#advanced-articles-decision-map'));assert.equal(ad.querySelectorAll('#advanced-articles-topic-94').length,1);
const ids=[...ad.querySelectorAll('[id]')].map(el=>el.id);assert.equal(new Set(ids).size,ids.length,'No duplicate rule/map IDs');
for(const q of advanced.questions.slice(100)){
 const select=ad.querySelector('[data-advanced-articles-range]');select.value='251';select.dispatchEvent(new a.window.Event('change'));
 const buttons=[...ad.querySelectorAll('[data-advanced-articles-grid] button')];buttons.find(b=>b.textContent===String(q.number)).click();
 const form=ad.querySelector('[data-advanced-articles-form]');const submit=value=>{form.querySelector('input').value=value;form.dispatchEvent(new a.window.Event('submit',{bubbles:true,cancelable:true}));return ad.querySelector('[data-advanced-articles-feedback]').dataset.state;};
 assert.equal(submit('wrong'),'wrong');assert.equal(submit(q.answer),'correct',`Articles ${q.number}`);assert.equal(submit(q.completeSentence),'correct');if(q.answer==='Ø')assert.equal(submit('x'),'correct');
 if(q.contextualAnswers){assert.equal(submit('a'),'correct');assert.match(ad.querySelector('[data-advanced-articles-feedback]').textContent,/另一|讀法|歷史敘述/);}
 assert.equal(ad.querySelectorAll('[data-advanced-articles-steps] [data-step-number]').length,7);
}
assert.equal(ad.querySelector('[data-advanced-articles-next]').disabled,true);assert.equal(JSON.parse(a.window.localStorage.getItem('edmund-grammar-advanced-articles-v1:guest')).attempts[250].status,'correct');
a.window.close();
console.log('Both extensions passed: 65 new questions graded with 7 steps each, complete sentences, sensible variants, all concept links, preserved old progress, final navigation and unique IDs.');
