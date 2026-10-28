// Local-only fixture: two isolated browser sessions, real renderers, mocked network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
const base='http://127.0.0.1:8647',browser=await chromium.launch({headless:true});
const rows=new Map();let rev=0;const errors=[];
const student={id:'11111111-1111-4111-8111-111111111111',name:'Classroom QA',role:'student'};
const shim=`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'qa'}}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:(name,args)=>{const p=fetch('/qa-rpc/'+name,{method:'POST',body:JSON.stringify(args)}).then(async r=>({data:await r.json(),error:null}));p.abortSignal=()=>p;return p;}})};`;
async function device(html,script,bridge){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(html+': '+e.message));page.on('dialog',d=>d.accept());
 await context.route('**/*',async r=>{
  const url=new URL(r.request().url());
  if(url.pathname.startsWith('/qa-rpc/')){
   const name=url.pathname.split('/').at(-1),a=r.request().postDataJSON();
   if(name==='classroom_live_sync'){
    const key=a.p_token+':'+a.p_system+':'+a.p_scope;
    if(a.p_payload)rows.set(key,{revision:++rev,payload:a.p_payload});const row=rows.get(key);
    return r.fulfill({json:row?{revision:row.revision,payload:row.revision!==a.p_since?row.payload:null}:{revision:0}});
   }
   return r.fulfill({json:name.includes('sync')?{events:[],timeDays:[]}:[]});
  }
  if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.includes('supabase'))return r.fulfill({contentType:'application/javascript',body:shim});
  if(url.origin!==base){if(url.pathname.includes('/v1/'))return r.fulfill({json:{attempts:[],submissions:[],drafts:[]}});return r.abort();}
  if(url.pathname==='/'+html){const response=await r.fetch();return r.fulfill({response,body:(await response.text()).replace(/ integrity="[^"]+"/g,'').replace('    void initialiseFlashcardPortal().catch',script==='inline'?bridge+'\n    void initialiseFlashcardPortal().catch':'    void initialiseFlashcardPortal().catch')});}
  if(url.pathname==='/'+script){const response=await r.fetch();return r.fulfill({response,body:(await response.text())+'\n'+bridge});}
  if(/\/(shared-system-nav|eddy-global-dialogues|eddy-five-streak-dialogue)\.js/.test(url.pathname))return r.fulfill({contentType:'application/javascript',body:''});
  return r.continue();
 });
 await page.goto(base+'/'+html);await page.waitForFunction(()=>window.__qa);await page.waitForTimeout(150);return {page,context};
}
try{
 for(const system of ['sentence-structure','idiom-system','proverb-system','phrasal-verb-system']){
  rows.clear();const exercisePage=system==='sentence-structure'?'4':'EXERCISE_PAGE';
  const bridge=`window.__qa={state,live:classroomLive,setup:async()=>{state.user=${JSON.stringify(student)};state.authToken='qa';${system==='sentence-structure'?'await lessonLibrary.catalog();':''}await openLesson(CONTENT.lessons[0].id,{page:${exercisePage}});},answer:async()=>{const q=getLesson().questions[0];state.exercise.questionState[q.id]={status:'correct',lastAnswer:q.answer||'QA',reveal:true};state.exercise.correctIds=[q.id];await persistExercise();renderExercisePage(getLesson(),{preserveScroll:true});return q.id;},next:async()=>{state.exercise.round++;state.exercise.awaitingNextRound=false;await persistExercise();}};${system==='idiom-system'?`window.__qa.special=async()=>{const q=compassPracticeQuestions().find(q=>q.bonus);if(!q)return null;const options=compassMcOptions(q,getLesson());await answerCompassMcQuestion(q.id,options.correctAt);return q.id;};window.__qa.bonus=()=>[...compassBonusCorrectIds()];`:''}`;
  const a=await device(system+'.html',system+'.js',bridge),b=await device(system+'.html',system+'.js',bridge);
  await a.page.evaluate(()=>__qa.setup());await b.page.evaluate(()=>__qa.setup());
  const id=await a.page.evaluate(()=>__qa.answer());
  await b.page.waitForFunction(id=>__qa.state.exercise?.correctIds.includes(id),id);
  assert.equal(await b.page.evaluate(id=>__qa.state.exercise.questionState[id].reveal,id),true);
  assert.ok(await b.page.locator('[data-question-id="'+id+'"] .question-feedback').count() || await b.page.locator('[data-question-id="'+id+'"] [class*=feedback]').count() || await b.page.locator('[data-question-id="'+id+'"].is-correct').count());
  await b.page.evaluate(()=>__qa.next());await a.page.waitForFunction(()=>__qa.state.exercise.round===2);
  if(system==='idiom-system'){const bonus=await a.page.evaluate(()=>__qa.special());if(bonus)await b.page.waitForFunction(id=>__qa.bonus().includes(id),bonus);}
  await b.page.screenshot({path:'/tmp/classroom-'+system+'.png'});
  await a.context.close();await b.context.close();console.log('PASS two devices '+system+' feedback and round');
 }
 for(const system of ['speaking','written','rhetorical-speaking','rhetorical-writing','professional-message','business-speaking']){
  rows.clear();const bridge=`window.__qa={state,live:classroomLive,setup:()=>{state.user=${JSON.stringify(student)};state.token='qa';state.lessonId=SYSTEM.lessons[0].id;openExercise();},answer:async()=>{const q=getLesson(state.lessonId).questions[0];lessonState(state.lessonId).answers[q.id]={answer:q.answer||'QA',checkedAnswer:q.answer||'QA',correct:true,attempts:1,updatedAt:new Date().toISOString()};await persistLessonState(state.lessonId);renderQuestionList();return q.id;}};`;
  const html='common-expression-'+system+'.html',a=await device(html,'common-expression-system.js',bridge),b=await device(html,'common-expression-system.js',bridge);
  await a.page.evaluate(()=>__qa.setup());await b.page.evaluate(()=>__qa.setup());const id=await a.page.evaluate(()=>__qa.answer());
  await b.page.waitForFunction(id=>__qa.state.states.get(__qa.state.lessonId)?.answers[id]?.correct,id);
  await a.context.close();await b.context.close();console.log('PASS two devices common expressions '+system);
 }

 for(const html of ['natural-english.html','advanced-native.html']){
  rows.clear();const bridge=`window.__qa={live:classroomLive,setup:async()=>{user={...${JSON.stringify(student)},token:'qa'};ready=true;document.querySelector('[data-app]').hidden=false;await openModule(visibleModules[0].id);},answer:()=>{const q=current.questions.find(q=>q.type==='mc');index=current.steps.findIndex(s=>s.questions.includes(q.id));answer(q.id,q.answers[0]);return q.id;},state:()=>({index,feedback}),next:()=>{index++;render();classroomLive.publish();}};`;
  const a=await device(html,'natural-english/app.mjs',bridge),b=await device(html,'natural-english/app.mjs',bridge);
  await a.page.evaluate(()=>__qa.setup());await b.page.evaluate(()=>__qa.setup());const id=await a.page.evaluate(()=>__qa.answer());
  await b.page.waitForFunction(id=>__qa.state().feedback[id]?.correct,id);
  assert.equal(await b.page.locator('[data-question="'+id+'"] .feedback').innerText(),await a.page.locator('[data-question="'+id+'"] .feedback').innerText());
  const index=await a.page.evaluate(()=>__qa.state().index);await b.page.evaluate(()=>__qa.next());await a.page.waitForFunction(index=>__qa.state().index===index+1,index);
  await a.context.close();await b.context.close();console.log('PASS two devices '+html+' explanation and Next');
 }
 {
  rows.clear();const bridge=`window.__qa={setup:()=>{owner='qa';token='qa';window.EDMUND_LEARNING_PORTAL_CONTEXT={rpc:async(name,args)=>(await fetch('/qa-rpc/'+name,{method:'POST',body:JSON.stringify(args)})).json()};dashboard.hidden=false;beginRound();},answer:()=>answer(current().exercise.options.find(o=>o.text===current().exercise.answer).letter),next:nextQuestion,state:()=>({choice,cursor:progress.cursor})};`;
  const a=await device('synonyms-system.html','synonyms/app.mjs',bridge),b=await device('synonyms-system.html','synonyms/app.mjs',bridge);
  await a.page.evaluate(()=>__qa.setup());await b.page.evaluate(()=>__qa.setup());await a.page.evaluate(()=>__qa.answer());await b.page.waitForFunction(()=>__qa.state().choice);
  assert.equal(await b.page.locator('.syn-feedback').innerText(),await a.page.locator('.syn-feedback').innerText());
  await b.page.evaluate(()=>__qa.next());await a.page.waitForFunction(()=>__qa.state().cursor===1&&!__qa.state().choice);
  await a.context.close();await b.context.close();console.log('PASS two devices synonyms explanation and Next');
 }
 {
  rows.clear();const bridge=`window.__qa={state,elements,setup:()=>{state.user=${JSON.stringify(student)};state.authToken='qa';startNewDraft();showView('workspace');},edit:()=>{elements.writingInput.value='A live paragraph from the student.';scheduleDraftSave();},different:()=>{state.documentId=crypto.randomUUID();elements.writingInput.value='An unrelated draft';},submitted:()=>{classroomSubmitted={documentId:state.documentId,submissionId:state.documentId};classroomLive.publish();}};`;
  const a=await device('writing-submission.html','writing-submission.js',bridge),b=await device('writing-submission.html','writing-submission.js',bridge);
  await a.page.evaluate(()=>__qa.setup());await b.page.evaluate(()=>__qa.setup());await a.page.evaluate(()=>__qa.edit());
  await b.page.waitForFunction(()=>__qa.elements.writingInput.value==='A live paragraph from the student.');
  await b.page.evaluate(()=>__qa.different());await a.page.evaluate(()=>{__qa.elements.writingInput.value='A changed paragraph';__qa.elements.writingInput.dispatchEvent(new Event('input',{bubbles:true}));});
  await b.page.waitForTimeout(3000);assert.equal(await b.page.evaluate(()=>__qa.elements.writingInput.value),'An unrelated draft');
  const sharedId=await a.page.evaluate(()=>__qa.state.documentId);await b.page.evaluate(id=>{__qa.state.documentId=id;},sharedId);await a.page.evaluate(()=>__qa.submitted());await b.page.waitForFunction(()=>__qa.state.currentView==='submissions');
  await a.context.close();await b.context.close();console.log('PASS writing live draft, submitted-view transition, and protection of unrelated drafts');
 }
 {
  rows.clear();const bridge=`window.__qa={setup:()=>{currentUser=${JSON.stringify(student)};studentSessionToken='qa';currentDeckId='qa-deck';currentDeckTitle='QA';studySession={cards:[{front:'one',meaning:'一',examples:[]},{front:'two',meaning:'二',examples:[]}],mode:'all',roundNumber:1,roundQueue:[0,1],initialQueue:[0,1],initialTotal:2,currentPosition:0,answers:{},outcomes:{},outcomeTimes:{},cardAttemptCounts:{},flipped:true,completed:false,timerSeconds:1,startedAt:Date.now(),elapsedMs:0,attemptId:crypto.randomUUID()};currentView='deck-view';renderStudyCard();},tick:()=>markCard('green'),state:()=>studySession,ready:()=>!!classroomLive};`;
  const a=await device('flashcards.html','inline',bridge),b=await device('flashcards.html','inline',bridge);
  await a.page.waitForFunction(()=>__qa.ready());await b.page.waitForFunction(()=>__qa.ready());await a.page.evaluate(()=>__qa.setup());await b.page.evaluate(()=>__qa.setup());
  await a.page.evaluate(()=>__qa.tick());await b.page.waitForFunction(()=>__qa.state().outcomes['0']==='green');
  assert.equal(await b.page.evaluate(()=>__qa.state().classroomFollowing),true);assert.match(await b.page.locator('[data-green-count]').innerText(),/1/);assert.equal(await b.page.evaluate(()=>__qa.state().currentPosition),1);await b.page.waitForTimeout(1600);assert.equal(await b.page.evaluate(()=>__qa.state().outcomes['1']),undefined,'passive viewing must not produce timed answers');
  await a.context.close();await b.context.close();console.log('PASS flashcard green tick and next-card position');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
