import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {grammarModules} from '../grammar-admin-export.mjs';

const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const dom=new JSDOM(`<!doctype html><html><body><header class="edmund-system-header"><div class="edmund-system-header__actions"></div></header><main data-learning-portal-root><section data-view="dashboard"><div data-learner-cards></div></section></main></body></html>`,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.test/grammar-system.html'});
const {window}=dom;
window.scrollTo=()=>{};
window.HTMLElement.prototype.scrollIntoView=function(){};

const html=fs.readFileSync(new URL('../grammar-system.html',import.meta.url),'utf8');
const dataFiles=[...html.matchAll(/<script src="([^"?]*data\.js)(?:\?[^"\s]*)?"/g)].map(match=>match[1]);
dataFiles.push('grammar-indefinite-pronouns-answers.js');
for(const file of [...new Set(dataFiles)])window.eval(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
const modules=grammarModules(window);
assert.ok(modules.length>=7,'administrator library should include every exercise-backed grammar module');

const learnerCards=window.document.querySelector('[data-learner-cards]');
for(const [index,module] of modules.entries()){
  const card=window.document.createElement('article');
  card.className=`grammar-lesson-card${index===1?' grammar-lesson-card--articles':index>1?' grammar-lesson-card--new-curation':''}`;
  card.innerHTML=`<div class="grammar-lesson-card__copy"><p class="eyebrow">MODULE ${index+1} · CURATION</p><h3>${module.title}</h3><p>閱讀導讀與教學內容</p></div><div class="grammar-lesson-card__stats"><button data-open-curation>閱讀導讀</button></div>`;
  learnerCards.append(card);
}

window.EDMUND_SUPABASE={url:'https://example.supabase.co',anonKey:'test-publishable-key'};
window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anon'}}},error:null})},rpc:async(name)=>({data:name==='grammar_admin_profile'?[{name:'UI Test Admin',session_token:'test-session'}]:[],error:null})};}};
window.sessionStorage.setItem('edmund-grammar-admin-session-v1','test-session');

const originals={window:globalThis.window,document:globalThis.document,sessionStorage:globalThis.sessionStorage,FormData:globalThis.FormData,setInterval:globalThis.setInterval};
Object.assign(globalThis,{window,document:window.document,sessionStorage:window.sessionStorage,FormData:window.FormData,setInterval:()=>0});
try{
  await import(`../grammar-admin-expanded.mjs?ui-test=${Date.now()}`);
  await new Promise(resolve=>setTimeout(resolve,25));
  const panel=window.document.querySelector('main.grammar-admin');
  assert.ok(panel && !panel.hidden,'remembered administrator session opens the answer library');
  assert.ok(window.document.querySelector('[data-admin-gate]').hidden,'login gate is hidden after session validation');
  assert.ok(!window.document.querySelector('[data-admin-content]').hidden,'learner-style module library is visible');
  const cards=[...window.document.querySelectorAll('.grammar-admin__module-card')];
  assert.equal(cards.length,modules.length,'every exercise-backed module gets a learner-style card');
  for(const [index,card] of cards.entries()){
    assert.equal(card.querySelector('.grammar-lesson-card__copy h3').textContent.trim(),modules[index].title);
    assert.doesNotMatch(card.textContent,/CURATION|導讀|教學內容/u,'admin module cards do not expose curation entry points');
    assert.equal(card.querySelectorAll('button').length,1,'module card has one exercise-review action');
  }

  cards[0].querySelector('button').click();
  await new Promise(resolve=>setTimeout(resolve,80));
  const review=window.document.querySelector('[data-answer-browser]');
  assert.ok(!review.hidden,'exercise action opens the in-page expanded review');
  assert.ok(window.document.querySelector('[data-admin-content]').hidden,'catalogue is replaced by the review instead of a plain export page');
  const questions=[...review.querySelectorAll('.grammar-admin__question')];
  assert.equal(questions.length,modules[0].questions.length,'all questions render together without pagination');
  assert.equal(review.querySelectorAll('.grammar-admin__reference-answer').length,questions.length,'every question shows its reference answer');
  assert.equal(review.querySelectorAll('.grammar-admin__steps').length,questions.length,'every question shows its complete explanation area');
  assert.equal(review.querySelectorAll('details').length,0,'answers and explanation steps are not collapsed');
  assert.equal(review.querySelectorAll('.grammar-admin__pagination').length,0,'expanded review has no ten-item pagination');
  assert.ok(questions[0].querySelectorAll('.grammar-admin__steps li').length>=1,'step-by-step explanation is visibly expanded');
  const search=review.querySelector('[data-answer-search]');search.value='definitely-not-a-real-grammar-question';search.dispatchEvent(new window.Event('input',{bubbles:true}));
  assert.equal(questions.filter(question=>!question.hidden).length,0,'review search filters the expanded question list');
  assert.ok(!review.querySelector('[data-answer-empty]').hidden,'empty search result is explained');
  console.log(`Expanded grammar admin UI: ${modules.length} learner-style module cards; ${questions.length} fully expanded answers and explanations verified.`);
} finally {
  Object.assign(globalThis,originals);
  dom.window.close();
}
