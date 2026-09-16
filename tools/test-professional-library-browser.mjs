// Run against a local static server (port 8633), or set FEATURE_QA_BASE.
// Every database request is intercepted; all accounts and messages are synthetic.
const {chromium,webkit}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
import fs from 'node:fs';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,''),base=process.env.FEATURE_QA_BASE||'http://127.0.0.1:8633/professional-english/';
const output=process.env.PROFESSIONAL_QA_OUTPUT||'/tmp/professional-library-qa';fs.mkdirSync(output,{recursive:true});
const engine=process.argv[2]==='WebKit'?webkit:chromium;
const browser=await engine.launch({headless:true});
const cards=JSON.parse(fs.readFileSync(repo+'/professional-english/content/lesson-2-flashcards.json'));
const states={},messages=[];let apiCalls=0;
async function setup(id='alice',admin=false){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await context.route('**/rest/v1/**',async route=>{
  apiCalls++;const name=route.request().url().split('/').at(-1),args=route.request().postDataJSON(),owner=args.p_token;let payload={};
  if(name==='special_flash_library')payload={decks:[{id:'qa-deck',course_id:'qa-course',course_title:'ProfessionalEnglish_ThreeGardenRoad_HK',title:'Class 2 · 第二課',count:cards.length,version:1,active:true,known:0,review:0}]};
  else if(name==='special_flash_deck')payload={deck:{id:'qa-deck',course_id:'qa-course',title:'Class 2 · 第二課',version:1,cards},progress:{marks:{},revision:0}};
  else if(name==='special_flash_annotations'||name==='special_flash_card_records')payload=[];
  else if(name==='special_flash_exercise_progress')payload={drafts:{},polysemy:{}};
  else if(name==='special_flash_record_marks')payload={accepted:args.p_events.length};
  else if(name==='special_flash_learning_state'){states[owner]??={};if(args.p_key){if(args.p_value!==undefined)states[owner][args.p_key]=args.p_value;payload=states[owner][args.p_key]??null;}else payload=Object.fromEntries(Object.entries(states[owner]).filter(([k])=>!k.startsWith('draft:')));}
  else if(name==='special_flash_save')payload={saved:true,revision:args.p_revision+1,mutation_id:args.p_mutation};
  else if(name==='special_flash_activity')payload={accepted:args.p_events.length};
  else if(name==='special_flash_learning_summary')payload={questions:0,cards:0,blanks:0,words:0,duration_ms:0,daily:[]};
  else if(name==='special_flash_team_effort')payload={courses:[]};
  else if(name==='special_flash_search')payload={results:[{deck_id:'qa-deck',card_id:cards[0].id,deck_title:'Class 2 · 第二課',front:cards[0].front,back:cards[0].back,note:'Keep your receipt.',position:1}],has_more:false};
  else if(name==='special_flash_messages'){
   if(args.p_action==='publish'){messages.unshift({id:args.p_id,body:args.p_body,revision:1,updated_at:new Date().toISOString()});payload={saved:true};}
   else if(args.p_action==='delete'){messages.splice(messages.findIndex(m=>m.id===args.p_id),1);payload={deleted:true};}
   else payload=messages;
  }else if(name==='special_flash_admin')payload={courses:[],accounts:[],decks:[],access:[]};
  await route.fulfill({json:payload});
 });
 await page.addInitScript(({id,admin})=>{
  localStorage.setItem('special-flash-session-v1',JSON.stringify({token:id,user:{id,username:'Synthetic '+id,role:admin?'admin':'student'}}));localStorage.setItem('edmund-professional-english-theme-v1','day');window.__plays=[];
  HTMLMediaElement.prototype.play=function(){window.__plays.push(this.src);this.dispatchEvent(new Event('play'));return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};
 },{id,admin});
 return {page,context,errors};
}
const {page,context,errors}=await setup();
await page.goto(base);await page.locator('.library-home').waitFor();await page.locator('.deck-tile').click();await page.locator('.range-grid--ten button').first().click();await page.locator('.front-display-card').waitFor();
await page.locator('[data-card-auto-audio]').click();await page.waitForTimeout(500);
const plays=()=>page.evaluate(()=>__plays.filter(x=>x.includes('.mp3')));
assert.equal((await plays()).length,1,'enable plays current card exactly once');
async function swipe(selector,dx){
 await page.locator(selector).evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(150);
 if(engine===chromium){const cdp=await context.newCDPSession(page),r=await page.locator(selector).boundingBox(),x=190,y=Math.max(170,Math.min(550,r.y+110));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+6*i/8}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
 else await page.locator(selector).evaluate((node,dx)=>{const send=(type,x,y,t)=>{const e=new Event(type,{bubbles:true,cancelable:true}),touch={identifier:1,clientX:x,clientY:y};Object.defineProperties(e,{touches:{value:type==='touchend'?[]:[touch]},changedTouches:{value:[touch]},timeStamp:{value:t}});node.dispatchEvent(e);};send('touchstart',180,100,0);send('touchmove',180+dx/2,102,100);send('touchmove',180+dx,104,180);send('touchend',180+dx,104,200);},dx);
 await page.waitForTimeout(600);
}
await page.locator('.front-display-card').tap();await page.locator('.flashcard-back-card').waitFor();await swipe('.front-display-card',-105);assert.equal(await page.locator('.study-progress').getAttribute('aria-valuenow'),'1','front panel swipe left advances');assert.equal((await plays()).length,2);
await page.locator('.front-display-card').tap();await page.locator('.flashcard-back-card').waitFor();await swipe('.flashcard-back-card',105);assert.equal(await page.locator('.study-progress').getAttribute('aria-valuenow'),'2');assert.equal((await plays()).length,3);
await page.locator('[data-card-auto-audio]').click();await page.locator('.front-display-card').tap();await page.locator('.grade-controls .tick').tap();await page.waitForTimeout(400);assert.equal((await plays()).length,3,'off prevents next card narration');
assert.equal(await page.locator('.study-progress').getAttribute('aria-valuemax'),'10');
await page.locator('.front-display-card').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(400);const progress=await page.locator('.learning-progress-widget').boundingBox();assert.ok(progress.y>=0&&progress.y<20&&progress.height>35,'progress remains visible on scroll');
await page.screenshot({path:output+'/mobile-card.png'});
await page.goto(base+'library.html?view=search&q=receipt');await page.locator('.library-result').first().waitFor();assert.ok(await page.locator('.library-result').count()>3);assert.ok((await page.locator('.library-results').innerText()).includes('第 2 課'));
await page.goto(base+'library.html?view=materials&lesson=2&page=1&q=receipt');await page.locator('.material-text').waitFor();assert.ok(await page.locator('.material-text mark').count()>20);assert.equal(await page.locator('.material-downloads a[download]').count(),3);assert.match(await page.locator('.material-text').innerText(),/QR Exit Receipt/);
await page.setViewportSize({width:1280,height:900});await page.screenshot({path:output+'/material-reader.png',fullPage:true});await page.setViewportSize({width:390,height:844});
await page.goto(base+'dialogue.html?id=l2d1');await page.locator('[data-bookmark-phrase]').first().waitFor();assert.ok(await page.locator('.is-teaching-highlight').count()>0);
for(let line=0;line<2;line++){
 await page.locator('[data-bookmark-phrase]').nth(line).click();await page.locator('.phrase-picker').waitFor();if(line===0){await page.locator('[data-phrase-token="0"]').click();await page.locator('[data-phrase-token="2"]').click();}
 await page.locator('[data-save-phrase]').click();assert.match(await page.locator('[data-phrase-status]').innerText(),/已加入書籤/);await page.locator('[data-close-phrase]').click();
}
assert.ok(await page.locator('.is-phrase-bookmarked').count()>0);await page.waitForTimeout(650);
await page.locator('[data-step="modes"]').click();await page.locator('[data-mode]').first().click();await page.locator('[data-blank-progress]').waitFor();const totalBlanks=await page.locator('[data-blank]').count();assert.equal(Number(await page.locator('[data-blank-progress]').getAttribute('aria-valuemax')),totalBlanks);const blank=page.locator('[data-blank]').first();await blank.fill(await blank.getAttribute('data-answer'));await blank.press('Tab');assert.equal(await page.locator('[data-blank-progress]').getAttribute('aria-valuenow'),'1');await page.locator('.pro-turn').nth(3).evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(150);const blankBar=await page.locator('.learning-progress-widget').boundingBox();assert.ok(blankBar.y>=0&&blankBar.y<20);
await page.goto(base+'library.html?view=bookmarks');await page.locator('.phrase-card').first().waitFor();assert.equal(await page.locator('.phrase-card').count(),2);
await page.locator('[data-new-playlist] input').fill('Visitor reception');await page.locator('[data-new-playlist] button').click();await page.locator('.playlist-editor').waitFor();await page.locator('.playlist-editor summary').click();await page.locator('[data-playlist-include]').first().check();await page.locator('[data-playlist-include]').nth(1).check();assert.equal(await page.locator('.phrase-card').count(),2);assert.equal(await page.locator('details').getAttribute('open'),'');
const names=await page.locator('.phrase-card h3').allTextContents();await page.locator('[data-playlist-down]').first().click();assert.deepEqual(await page.locator('.phrase-card h3').allTextContents(),[names[1],names[0]]);await page.locator('[data-play-playlist]').click();await page.waitForTimeout(200);assert.match(await page.locator('[data-library-status]').innerText(),/1 \/ 2/);
await page.waitForTimeout(650);const listUrl=page.url();const fresh=await setup();await fresh.page.goto(listUrl);await fresh.page.locator('.phrase-card').first().waitFor();assert.equal(await fresh.page.locator('.phrase-card').count(),2,'cloud preferences load in a fresh browser context');
const other=await setup('bob');await other.page.goto(base+'library.html?view=bookmarks');await other.page.locator('.playlist-builder').waitFor();assert.equal(await other.page.locator('.phrase-card').count(),0);
await page.goto(base+'polysemy.html?lesson=3');await page.locator('[data-poly-word]').first().waitFor();assert.match(await page.locator('[data-poly-word]').first().innerText(),/課文首次出現：第/);await page.locator('[data-poly-word]').first().click();await page.locator('.poly-source').waitFor();assert.ok((await page.locator('.poly-source').getAttribute('href')).includes('page='));await page.setViewportSize({width:390,height:520});await page.locator('[data-poly-answer]').last().evaluate(n=>n.scrollIntoView({block:'end',behavior:'instant'}));await page.waitForTimeout(200);const polyBar=await page.locator('.poly-word-progress').boundingBox();assert.ok(polyBar.y>=0&&polyBar.y<120);assert.ok(Number(await page.locator('#poly-word-progress').getAttribute('max'))>1);await page.setViewportSize({width:390,height:844});
const teacher=await setup('teacher',true);await teacher.page.goto(base+'library.html?view=messages');await teacher.page.locator('.message-composer').waitFor();await teacher.page.locator('.message-composer textarea').fill('Synthetic test: please review Lesson 2.');await teacher.page.locator('.message-composer button').click();await teacher.page.locator('.message-card').waitFor();await fresh.page.goto(base);await fresh.page.getByText('Synthetic test: please review Lesson 2.',{exact:true}).waitFor();await teacher.page.locator('[data-delete-message]').click();await teacher.page.waitForTimeout(100);assert.equal(await teacher.page.locator('.message-card').count(),0);
await fresh.page.goto(base+'?deck=qa-deck&card='+cards[5].id);await fresh.page.getByText('搜尋結果：第 6 張', {exact:false}).waitFor();await fresh.page.locator('[data-card-auto-audio]').click();await fresh.page.waitForTimeout(700);await fresh.page.reload();await fresh.page.locator('[data-card-auto-audio][aria-pressed="true"]').waitFor();
assert.deepEqual(errors,[]);assert.deepEqual(fresh.errors,[]);assert.deepEqual(other.errors,[]);assert.deepEqual(teacher.errors,[]);
console.log((engine===webkit?'WebKit':'Chromium')+': front/back swipe, autoplay on/off, sticky range progress, cross-lesson search, highlighted reader/downloads, phrase bookmarks, ordered cloud playlists, account isolation, page references, admin publish/delete passed. API calls: '+apiCalls);
await browser.close();
