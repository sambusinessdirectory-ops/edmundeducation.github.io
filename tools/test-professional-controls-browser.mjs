// Run against a local static server (port 8633), or set FEATURE_QA_BASE.
// Every database request is intercepted; all accounts and messages are synthetic.
const {chromium,webkit}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
import fs from 'node:fs';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,''),base=process.env.FEATURE_QA_BASE||'http://127.0.0.1:8633/professional-english/';
const output=process.env.PROFESSIONAL_QA_OUTPUT||'/tmp/professional-controls-qa';fs.mkdirSync(output,{recursive:true});
const engine=process.argv[2]==='WebKit'?webkit:chromium;
const browser=await engine.launch({headless:true});
const cards=JSON.parse(fs.readFileSync(repo+'/professional-english/content/lesson-2-flashcards.json'));
const states={},messages=[];let photo=null,photoRevision=0;const slotPhotos={left:{image:null,revision:0},right:{image:null,revision:0}};const photoRequests=[];let apiCalls=0;
async function setup(id='alice',admin=false){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await context.route('**/rest/v1/**',async route=>{
  apiCalls++;const name=route.request().url().split('/').at(-1),args=route.request().postDataJSON(),owner=args.p_token;let payload={};
  if(name==='special_flash_course_photo_slot'){photoRequests.push(args);const row=slotPhotos[args.p_slot||'right'];if(!args.p_course)payload={courses:id==='outside'?[]:[{id:'qa-course',title:'Our course',can_edit:id==='editor'}]};else{if(args.p_action==='save'||args.p_action==='remove'){assert.equal(id,'editor');assert.equal(args.p_revision,row.revision);row.image=args.p_action==='save'?args.p_image:null;row.revision++;}photo=row.image;photoRevision=row.revision;payload={course_id:'qa-course',revision:row.revision,can_edit:id==='editor',changed:args.p_revision!==row.revision,image:args.p_revision!==row.revision?row.image:null};}}
  else if(name==='special_flash_library')payload={decks:[{id:'qa-deck',course_id:'qa-course',course_title:'ProfessionalEnglish_ThreeGardenRoad_HK',title:'Class 2 · 第二課',count:cards.length,version:1,active:true,known:0,review:0}]};
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
const student=await setup(),{page,context,errors}=student;await page.setViewportSize({width:1280,height:900});
await page.goto(base+'dialogue.html?id=l1d1');await page.locator('.pro-turn').first().waitFor();
const phrase=page.locator('[data-dialogue-line="0"] .pro-teaching-phrase');assert.equal(await phrase.count(),1);assert.match(await phrase.innerText(),/How may I assist you today/);assert.ok(await phrase.locator('button').count()>1,'individual word bookmarks remain usable inside a continuous phrase');
for(const width of [1280,768,390,320]){await page.setViewportSize({width,height:844});const button=page.locator('[data-bookmark-phrase]').first();const style=await button.evaluate(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,whiteSpace:getComputedStyle(n).whiteSpace}));assert.equal(style.whiteSpace,'nowrap');assert.ok(style.width>70&&style.height<65,JSON.stringify(style));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'dialogue no overflow at '+width);}
await page.setViewportSize({width:1280,height:900});await page.screenshot({path:output+'/dialogue-desktop.png'});
await page.goto(base+'dialogue.html?id=l1d1&view=practice');await page.locator('[data-blank]').first().waitFor();const first=page.locator('[data-blank]').first(),key=await first.getAttribute('data-blank'),answer=await first.getAttribute('data-answer');await first.fill(answer);await first.press('Tab');await page.waitForFunction(()=>document.querySelector('[data-blank-progress]').getAttribute('aria-valuenow')==='1');const second=page.locator('[data-blank]').nth(1),secondKey=await second.getAttribute('data-blank');await second.fill('unfinished');
let confirms=0;page.on('dialog',()=>confirms++);
async function mode(difficulty,hints='both'){await page.locator('[data-switch-mode]').click();await page.locator('[data-mode-switcher] [name=difficulty]').selectOption(difficulty);await page.locator('[data-mode-switcher] [name=hints]').selectOption(hints);await page.locator('[data-mode-switcher] button[type=submit]').click();await page.waitForFunction(d=>document.querySelector('.pro-current-mode')?.textContent.includes(d),{standard:'標準模式',hard:'高難度',hell:'地獄難度'}[difficulty]);}
await mode('hard','none');assert.equal(await page.locator('[data-blank-progress]').getAttribute('aria-valuenow'),'0');await mode('standard');assert.equal(await page.locator(`[data-blank="${key}"]`).inputValue(),answer);assert.equal(await page.locator(`[data-blank="${secondKey}"]`).inputValue(),'unfinished');assert.equal(await page.locator('[data-blank-progress]').getAttribute('aria-valuenow'),'1');assert.equal(confirms,0,'internal mode changes never ask to abandon progress');
// Switching remains available even when the network is down; drafts stay local.
await context.route('**/rest/v1/rpc/special_flash_learning_state',r=>r.fulfill({status:503,json:{message:'Synthetic offline'}}));await mode('hell');await mode('standard');assert.equal(await page.locator(`[data-blank="${secondKey}"]`).inputValue(),'unfinished');await context.unroute('**/rest/v1/rpc/special_flash_learning_state');
for(const width of [1280,768,390,320]){await page.setViewportSize({width,height:844});await page.locator('[data-dialogue-line="8"]').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(150);const toolbar=await page.locator('.pro-playback').boundingBox(),progress=await page.locator('[data-blank-progress]').boundingBox();assert.ok(toolbar.y>=0&&toolbar.y<20,JSON.stringify(toolbar));assert.ok(progress.y>toolbar.y&&progress.y+progress.height<toolbar.y+toolbar.height+1,'progress stays inside floating toolbar');assert.ok(progress.y+progress.height<420,'progress remains visible on phone');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390)await page.screenshot({path:output+'/practice-mobile.png'});}
await page.goto(base+'library.html?view=materials&lesson=1');await page.locator('.material-reader-controls').waitFor();
for(const width of [1280,768,390,320]){await page.setViewportSize({width,height:844});await page.locator('[data-material-page]').selectOption('2');await page.waitForTimeout(500);const r=await page.locator('.material-reader-controls').boundingBox();assert.ok(r.y>=0&&r.y<20,JSON.stringify(r));const pageTop=await page.locator('[data-source-page="2"]').boundingBox();assert.ok(pageTop.y>=r.y+r.height-2,'jumped page begins below toolbar '+JSON.stringify({width,r,pageTop}));await page.locator('[data-reader-translation]').click();assert.equal(await page.locator('[data-reader-translation]').getAttribute('aria-pressed'),'true');await page.locator('[data-reader-translation]').click();assert.match(await page.locator('[data-reader-pdf]').getAttribute('href'),/#page=2$/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390)await page.screenshot({path:output+'/reader-mobile.png'});}
const teacher=await setup('editor');await teacher.page.setViewportSize({width:1280,height:900});await teacher.page.goto(base);await teacher.page.locator('[data-photo-upload]').first().waitFor();
const png=await teacher.page.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=500;const x=c.getContext('2d');const pixels=x.createImageData(800,500);let seed=42;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;pixels.data[i]=seed&255;pixels.data[i+1]=(seed>>>8)&255;pixels.data[i+2]=(seed>>>16)&255;pixels.data[i+3]=255;}x.putImageData(pixels,0,0);x.fillStyle='#fff';x.font='50px sans-serif';x.fillText('Course photo',70,260);return c.toDataURL('image/png').split(',')[1];});
await teacher.page.locator('[data-photo-slot=right] [data-photo-file]').setInputFiles({name:'course.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await teacher.page.getByText('已更新，同課程的學生可看到。').waitFor();assert.ok(photo.startsWith('data:image/webp;base64,'));assert.ok(photo.length<500000);assert.ok(photo.length>65536,'realistic upload exceeds keepalive budget');assert.equal(photoRevision,1);
await teacher.page.locator('[data-photo-view]').click();await teacher.page.locator('.course-photo-preview').waitFor();await teacher.page.locator('.course-photo-preview button').click();await teacher.page.screenshot({path:output+'/photo-desktop.png'});
const peer=await setup('peer');await peer.page.goto(base);await peer.page.locator('[data-photo-view] img').waitFor();assert.equal(await peer.page.locator('[data-photo-upload]').count(),0);assert.equal(await peer.page.locator('[data-photo-view] img').getAttribute('src'),photo);
await teacher.page.locator('[data-photo-slot=right] [data-photo-file]').setInputFiles({name:'replacement.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await teacher.page.getByText('已更新，同課程的學生可看到。').waitFor();assert.equal(photoRevision,2);await peer.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await peer.page.waitForTimeout(200);assert.ok(photoRequests.some(r=>r.p_revision===1&&r.p_action===undefined),'peer checks newer revision automatically');
await teacher.page.setViewportSize({width:390,height:844});await teacher.page.locator('.course-photo-group').scrollIntoViewIfNeeded();assert.ok(await teacher.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await teacher.page.screenshot({path:output+'/photo-mobile.png'});
await teacher.page.locator('[data-photo-remove]').click();await teacher.page.getByText('已更新，同課程的學生可看到。').waitFor();assert.equal(photo,null);await peer.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await peer.page.locator('.course-photo-group').waitFor({state:'hidden'});
// Second slot is independent and its actual bytes decode as WebP, including Safari fallback.
await teacher.page.locator('[data-photo-slot=left] [data-photo-file]').setInputFiles({name:'left.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
await teacher.page.locator('[data-photo-slot=left] [data-photo-view] img').waitFor();
const bytes=Buffer.from(slotPhotos.left.image.split(',')[1],'base64');assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(slotPhotos.right.image,null);
await peer.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await peer.page.locator('[data-photo-slot=left] img').waitFor();
assert.equal(await peer.page.locator('[data-photo-slot=right] img').count(),0);
await teacher.page.locator('[data-photo-slot=right] [data-photo-file]').setInputFiles({name:'right.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await teacher.page.locator('[data-photo-slot=right] img').waitFor();
for(const width of [1280,768,390,320]){await teacher.page.setViewportSize({width,height:900});assert.ok(await teacher.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
await teacher.page.screenshot({path:output+'/two-photos-mobile.png'});
const outsider=await setup('outside');await outsider.page.goto(base);await outsider.page.locator('.deck-tile').waitFor();assert.equal(await outsider.page.locator('[data-photo-view]').count(),0);
for(const x of [student,teacher,peer,outsider])assert.deepEqual(x.errors,[]);await browser.close();console.log('PASS '+(engine===webkit?'WebKit':'Chromium')+': horizontal bookmarks, phrase highlights, offline mode switching and draft restore, sticky practice/reader controls, page jump offsets, photo upload/replacement/removal and peer visibility, 320–1280px.');
