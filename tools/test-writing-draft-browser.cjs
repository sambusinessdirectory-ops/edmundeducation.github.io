const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:900}});
await context.route('**/*',route=>{const url=route.request().url();if(!url.startsWith('http://127.0.0.1:8778/'))return route.abort();if(/eddy-global|shared-system-nav/.test(url))return route.fulfill({contentType:'application/javascript',body:''});return route.continue()});
const page=await context.newPage();
async function setup(){await page.goto('http://127.0.0.1:8778/writing-practice.html');await page.evaluate(()=>{
currentUser={name:'Local Draft QA',id:'local-draft-qa',role:'student',access:{}};
const fixture={id:'local-draft-fixture',title:'Paragraph saving check',exam:'IELTS Writing Task 2',taskType:'Opinion',questionPrompt:['Local regression test'],practiceModes:['blank','start','end','both'],paragraphs:['Introduction','Body paragraph 1','Body paragraph 2','Conclusion'].map((label,i)=>({label,sentences:[{parts:['This is ',{answer:'answer'+i},'.']}]})),translation:['引言','正文一','正文二','結論']};
writingExercises[fixture.id]=fixture;prepareWritingExercises();currentExerciseSectionKey=fixture.id;currentExerciseId='';currentPathwayLevel='exercise';practiceState=null;showAppPanel('exercise');startPracticeSetup();});}
await setup();await page.locator('[data-start-practice-mode="blank"]').click();
for(let i=0;i<4;i++)await page.locator('[data-answer-id]').nth(i).fill(i<2?'answer'+i:'saved hidden '+i);
await page.locator('[data-back-practice-mode]').click();await page.locator('[data-practice-paragraph="2"]').uncheck();await page.locator('[data-practice-paragraph="3"]').uncheck();await page.locator('[data-start-practice-mode="start"]').click();
assert.equal(await page.locator('[data-answer-id]').count(),2);assert.equal(await page.locator('[data-answer-id]').first().inputValue(),'answer0');
await page.locator('[data-practice-form] button[type="submit"]').click();
assert.deepEqual(await page.evaluate(()=>({total:practiceState.lastResult.total,correct:practiceState.lastResult.correct})),{total:2,correct:2});
await page.locator('[data-return-practice-modes]').click();await setup();
await page.locator('[data-practice-paragraph="2"]').check();await page.locator('[data-practice-paragraph="3"]').check();await page.locator('[data-practice-paragraph="0"]').uncheck();await page.locator('[data-practice-paragraph="1"]').uncheck();await page.locator('[data-start-practice-mode="blank"]').click();assert.equal(await page.locator('[data-answer-id]').first().inputValue(),'saved hidden 2');
await page.screenshot({path:'/tmp/writing-drafts-desktop.png'});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/writing-drafts-mobile.png'});
console.log('Browser passed: immediate inputs, mode/paragraph changes, partial scoring, page reopen and hidden answer restoration.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
