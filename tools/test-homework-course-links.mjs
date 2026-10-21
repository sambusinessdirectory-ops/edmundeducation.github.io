import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {HOMEWORK_RESOURCE_CATALOG as catalog} from '../homework-resource-catalog.mjs';
import {MODULES} from '../junior-exam-prep/modules.mjs';
import {normalizeHomeworkHref,normalizeHomeworkResource,serializeScheduleMessage,parseScheduleMessage,homeworkAutocomplete,filterHomeworkResources} from '../schedule-homework-links.mjs';
import {formatHomeworkLinkExport} from '../schedule-homework-export.mjs';
const read=file=>fs.readFile(new URL('../'+file,import.meta.url),'utf8');
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const expected={grammar:468,'error-identification':357,'junior-exam-prep':19};
for(const [type,count] of Object.entries(expected)){
 const resources=catalog.filter(r=>r.type===type);assert.equal(resources.length,count);
 for(const resource of resources){
  assert.ok(normalizeHomeworkResource(resource),resource.id);
  const stored=serializeScheduleMessage('Assigned practice',[resource]);
  assert.deepEqual(parseScheduleMessage(stored).resources,[normalizeHomeworkResource(resource)]);
 }
 assert.match(formatHomeworkLinkExport({resources,exportedAt:'2026-10-19T00:00:00Z'}),/https:\/\/edmundeducation.com\//);
}
for(const [text,type] of [['Grammar','grammar'],['Error Identification','error-identification'],['Error Identifier','error-identification'],['Junior Exam Prep','junior-exam-prep'],['Jayden Homework','junior-exam-prep']])assert.equal(homeworkAutocomplete(text).type,type);
assert.ok(filterHomeworkResources(catalog,'grammar','tense 195').items.some(r=>r.id==='grammar:tense:q195'));
assert.equal(filterHomeworkResources(catalog,'error-identification','344').items[0]?.id,'error-identification:q344');
assert.equal(filterHomeworkResources(catalog,'junior-exam-prep','articles Passage 5').total,2,'Articles also occurs in Non-Articles; both matching modules remain searchable');
for(const url of [
 'grammar-system.html?lesson=bad&view=curation','grammar-system.html?lesson=tense&view=practice&question=-1',
 'grammar-system.html?lesson=tense&lesson=articles&view=curation','grammar-system.html?lesson=tense&view=curation&redirect=https://bad.example',
 'error-identifier-system.html?mode=single&passage=1','error-identifier-system.html?mode=passage&passage=0',
 'junior-exam-prep.html?module=not-assigned','junior-exam-prep.html?module=s2-exam-prep-advanced-tense&question=51',
 'junior-exam-prep.html?module=s2-exam-prep-advanced-tense&student=someone',
 'https://bad.example/grammar-system.html?lesson=tense&view=curation'
])assert.equal(normalizeHomeworkHref(url),null,url);
assert.equal(normalizeHomeworkHref('grammar-system.html'),'grammar-system.html','legacy calendar links remain valid');
assert.equal(normalizeHomeworkHref('error-identifier-system.html'),'error-identifier-system.html');
const settle=async()=>{for(let i=0;i<10;i++)await new Promise(resolve=>setTimeout(resolve,0));};
const jayden='df2a3ba9-25be-4b0c-823a-304d4c29c2ba';
function domFor(page,query=''){
 const dom=new JSDOM('<main data-learning-portal-root><section data-view="dashboard"></section></main>',{runScripts:'outside-only',pretendToBeVisual:true,url:`https://edmundeducation.com/${page}${query}`});
 dom.window.HTMLElement.prototype.scrollIntoView=function(){dom.scrolled=this.id;};
 return dom;
}
const errorSource=await read('error-identifier.js'),passageSource=await read('error-identifier-passage.js');
async function errorDom(query,loggedIn=false){
 const dom=domFor('error-identifier-system.html',query),w=dom.window;let session=loggedIn?{user:{id:'test-student'},token:'test-token'}:{};
 w.EDMUND_LEARNING_PORTAL_CONTEXT={getSession:()=>session,rpc:async()=>({answers:{},submitted_at:'',answered_count:0})};
 w.eval(await read('error-identifier-questions.js'));w.eval(await read('error-identifier-passages.js'));w.eval(errorSource);w.eval(passageSource);
 dom.signIn=()=>{session={user:{id:'test-student'},token:'test-token'};w.dispatchEvent(new w.Event('edmund:learning-portal-session'));};
 await settle();return dom;
}
for(const loggedIn of [false,true]){
 const dom=await errorDom('?mode=single&question=344',loggedIn),d=dom.window.document;
 if(!loggedIn){assert.equal(d.querySelector('[data-error-id-single]').hidden,true);dom.signIn();await settle();}
 assert.equal(d.querySelector('[data-error-id-single]').hidden,false);
 assert.ok(d.querySelector('[data-question="344"]'),'last question opens after login');
 d.querySelector('[data-navigate="previous"]').click();assert.equal(new URL(dom.window.location.href).searchParams.get('question'),'343');
 d.querySelector('[data-back-modes]').click();assert.equal(new URL(dom.window.location.href).searchParams.has('mode'),false);
 dom.window.close();
 const passage=await errorDom('?mode=passage&passage=11',loggedIn),pd=passage.window.document;
 if(!loggedIn){passage.signIn();await settle();}
 assert.equal(pd.querySelector('[data-error-id-passage]').hidden,false);
 assert.match(pd.querySelector('#error-id-passage-heading').textContent,/Charity Concert/);
 assert.equal(pd.querySelectorAll('[data-passage-line]').length,16);
 pd.querySelector('[data-passage-library]').click();assert.equal(new URL(passage.window.location.href).searchParams.has('passage'),false);
 passage.window.close();
}
// Junior: use the actual UI runtime, with account-scoped RPC reads and local files.
const juniorSource=(await read('junior-exam-prep/app.mjs')).replace(/^import .*;\n/gm,'');
async function juniorDom(query,initialOwner=null,delay=false){
 const dom=domFor('junior-exam-prep.html',query),w=dom.window;let session=initialOwner?{user:{id:initialOwner},token:'test-token'}:{};const requests=[];let release;
 const gate=delay?new Promise(resolve=>release=resolve):Promise.resolve();
 w.EDMUND_LEARNING_PORTAL_CONTEXT={getSession:()=>session,rpc:async()=>[]};
 w.fetch=async url=>{requests.push(url);await gate;return {ok:true,json:async()=>JSON.parse(await read(String(url).replace(/^\.\//,'').split('?')[0]))};};
 w.eval(`const MODULES=${JSON.stringify(MODULES)};const juniorHighlightToolbar=()=>'';const mountJuniorHighlighter=()=>({syncToolbar(){}});\n`+juniorSource);
 dom.signIn=async id=>{session=id?{user:{id},token:'test-token'}:{};w.dispatchEvent(new w.Event('edmund:learning-portal-session'));await settle();};
 dom.requests=requests;dom.release=release;await settle();return dom;
}
for(const module of MODULES.filter(module=>!module.href)){
 const query=`?module=${module.key}&question=41`;
 const dom=await juniorDom(query),d=dom.window.document;assert.equal(dom.requests.length,0,'no module opens before login');
 await dom.signIn('other-student');assert.equal(dom.requests.length,0,'a link does not grant an unassigned student access');
 assert.match(d.body.textContent,/沒有分配/);
 await dom.signIn(jayden);
 assert.equal(d.querySelectorAll('[data-answer]').length,50);
 assert.equal(d.querySelector('.junior-module-heading h2').textContent,module.title);
 assert.equal(dom.scrolled,'junior-q-041','Passage 5 opens at its first question');
 d.querySelector('[data-back]').click();assert.equal(new URL(dom.window.location.href).searchParams.has('module'),false);
 d.querySelector(`[data-open-module="${module.key}"]`).click();await settle();assert.equal(new URL(dom.window.location.href).searchParams.get('module'),module.key);
 await dom.signIn(null);assert.equal(d.querySelectorAll('[data-answer]').length,0,'logout clears module content');dom.window.close();
}
const delayed=await juniorDom(`?module=${MODULES[1].key}`,jayden,true);
await delayed.signIn('other-student');delayed.release();await settle();
assert.equal(delayed.window.document.querySelectorAll('[data-answer]').length,0,'an old account load cannot reopen homework after switching accounts');delayed.window.close();
const invalid=await juniorDom('?module=not-assigned',jayden);assert.equal(invalid.requests.length,0);invalid.window.close();
console.log('Homework course links: 844 resources, saved Calendar markers, exports, aliases, first/last questions, passages, login resumption, invalid links and Junior account isolation passed.');
