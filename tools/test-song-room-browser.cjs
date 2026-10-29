const assert=require('node:assert/strict'),fs=require('fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=require('node:path').resolve(__dirname,'..');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const session={id:id(1),name:'Synthetic Student',role:'student',token:id(99)};
const song={id:id(3),title:'Synthetic Song',singer:'Test Artist',youtube_url:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',description:'Test description',tags:[],translations:[{lineId:'line-1',english:'Morning light fills this room.',chinese:'晨光照亮這房間。',startSeconds:10,endSeconds:20},{lineId:'line-2',english:'We sing together every day.',chinese:'我們每天一起唱歌。',startSeconds:24,endSeconds:34}],exercises:[{id:'standard',label:'Standard',version:1,questionCount:6,questions:Array.from({length:6},(_,i)=>({number:i+1,prompt:i<3?'Morning {{blank}} fills this room.':'We sing {{blank}} every day.',promptZh:i<3?'晨光照亮這房間。':'我們每天一起唱歌。',options:['light','rain','snow'],optionsZh:['光','雨','雪'],answer:'light'}))}]};
let sharedRoom=null,devices=new Set(),joined=new Set(),ejected=new Set();let drafts={},bookmarks=[],attempts=[],calls=[],failDraft=false,dropReply=false,delayDraft=0;
const source=fs.readFileSync(root+'/song-appreciation.js','utf8').replace('  window.EdmundSongAppreciation = Object.freeze({','  window.songQA={state,openSong,startExercise,flushDraft,chooseAnswer,showView,renderLibrary,resetDraftAnswers,checkPartialAnswers,routeStudent,finishReadCountdown,live:()=>liveSync,classroom,completionPanel,switchSongTab,joinClassroom,togglePlayer,seekPlayer,relisten};\n  window.EdmundSongAppreciation = Object.freeze({');

(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[];let liveOffline=false;
 async function device(label){
 const context=await browser.newContext({viewport:{width:1280,height:950},serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(label+': '+e.message));page.on('dialog',d=>d.accept());
await context.addInitScript(({session})=>{sessionStorage.setItem('edmund-song-appreciation-session-v1',JSON.stringify(session));for(const offset of [0,-1]){const day=new Date();day.setDate(day.getDate()+offset);const key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;localStorage.setItem(`edmund-night-return-v1:seen:student:${session.id}:${key}`,'1');}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:"transport"}}}})},rpc:(name,args)=>{const promise=(async()=>{const r=await fetch('/mock-rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});const body=await r.json();return r.ok?{data:body,error:null}:{data:null,error:body};})();promise.abortSignal=()=>promise;return promise;}})};window.YT={PlayerState:{PLAYING:1,PAUSED:2,ENDED:0},Player:class{constructor(mount,opts){this.opts=opts;this.current=0;this.rate=1;this.duration=180;setTimeout(()=>opts.events.onReady(),20);}playVideo(){this.opts.events.onStateChange({data:1});}pauseVideo(){this.opts.events.onStateChange({data:2});}seekTo(t){this.current=t;}getCurrentTime(){return this.current;}getDuration(){return this.duration;}getAvailablePlaybackRates(){return [.25,.5,.75,1,1.25,1.5,2];}getPlaybackRate(){return this.rate;}setPlaybackRate(v){this.rate=v;this.opts.events.onPlaybackRateChange();}destroy(){}}};},{session:{...session,token:label==='student'?session.token:id(100)}});
await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.host!=='127.0.0.1:8768')return r.abort();if(u.pathname==='/song-appreciation.js')return r.fulfill({contentType:'text/javascript',body:source});if(!u.pathname.startsWith('/mock-rpc/'))return r.continue();
const name=u.pathname.split('/').pop(),a=r.request().postDataJSON();calls.push({name,args:a,label,at:Date.now()});let body=[];
if(name==='song_appreciation_room'){
 if(ejected.has(a.p_device))return r.fulfill({json:{ejected:true,accepted:false,devices:0,session:null}});
 devices.add(a.p_device);let accepted=true;
 if(sharedRoom&&attempts.some(t=>t.id===sharedRoom.id))sharedRoom=null;
 if(a.p_action==='eject'){for(const d of devices)if(d!==a.p_device){ejected.add(d);devices.delete(d);joined.delete(d);}}
 if(a.p_action==='start'){if(sharedRoom)accepted=false;else{sharedRoom={id:a.p_session,owner:a.p_device,song:a.p_song,mode:a.p_mode,version:a.p_version,started_at:new Date().toISOString(),media:null,revision:0};joined.add(a.p_device);}}
 if(a.p_action==='join')joined.add(a.p_device);
 if(a.p_action==='media'){assert.ok(joined.has(a.p_device));sharedRoom={...sharedRoom,revision:sharedRoom.revision+1,media:{...a.p_media,at:new Date().toISOString(),device:a.p_device}};}
 if(a.p_action==='end'){sharedRoom=null;joined.clear();}
 body={accepted,devices:devices.size,session:sharedRoom,server_time:new Date().toISOString()};
 }
else if(name==='song_appreciation_live_snapshot'){if(liveOffline)return r.fulfill({status:503,json:{message:'Offline'}});const d=drafts[a.p_song_id+'/'+a.p_mode_id];const completed=attempts.find(t=>t.song_id===a.p_song_id&&t.mode_id===a.p_mode_id&&t.started_at===d?.started_at);const revision=d?d.revision+':'+(completed?.id||''):'0';body=revision===a.p_since||!d?{revision}:{revision,payload:{draft:d,attempt:completed||null}};}
else if(name==='song_appreciation_student_me')body=[{id:session.id,name:session.name}];
else if(name==='song_appreciation_student_list_songs')body=[song];
else if(name==='song_appreciation_student_get_song')body=[song];
else if(name==='song_appreciation_draft_list')body=Object.values(drafts);
else if(name==='song_appreciation_attempt_list')body=attempts;
else if(name==='song_appreciation_bookmark_list')body=bookmarks;
else if(name==='song_appreciation_bookmark_add'){const row={id:id(40+bookmarks.length),song_id:a.p_song_id,kind:a.p_kind,bookmark_text:a.p_kind==='song'?song.title:a.p_bookmark_text,source_locator:a.p_source_locator};bookmarks.unshift(row);body=[row];}
else if(name==='song_appreciation_bookmark_delete'){bookmarks=bookmarks.filter(x=>x.id!==a.p_bookmark_id);body=true;}
else if(name==='song_appreciation_draft_save'){
 if(delayDraft)await new Promise(x=>setTimeout(x,delayDraft));
 if(failDraft)return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Synthetic offline'})});
 const key=a.p_song_id+'/'+a.p_mode_id,old=drafts[key];
 if(old?.mutation_id===a.p_mutation_id)body=[old];else{
 if(Number(old?.revision||0)!==a.p_expected_revision)return r.fulfill({status:409,contentType:'application/json',body:JSON.stringify({code:'40001',message:'Draft changed on another device'})});
 let result=a.p_action==='reset'?{}:{...(old?.result||{})};if(a.p_action==='check')for(const [k,v] of Object.entries(a.p_answers))result[k]={selected:v,answer:'light',correct:v==='light'};
 const row={student_id:session.id,song_id:a.p_song_id,mode_id:a.p_mode_id,exercise_version:a.p_exercise_version,answers:a.p_answers,result,duration_ms:a.p_duration_ms,started_at:a.p_started_at,revision:Number(old?.revision||0)+1,mutation_id:a.p_mutation_id};drafts[key]=row;body=[row];}
 if(dropReply){dropReply=false;return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Synthetic lost reply'})});}
}
else if(name==='song_appreciation_attempt_save'){const row={id:a.p_attempt_id,song_id:a.p_song_id,mode_id:a.p_mode_id,exercise_version:a.p_exercise_version,answers:a.p_answers,result:Object.fromEntries(Object.entries(a.p_answers).map(([k,v])=>[k,{selected:v,answer:'light',correct:v==='light'}])),correct_count:Object.values(a.p_answers).filter(x=>x==='light').length,total_count:6,duration_ms:a.p_duration_ms,started_at:a.p_started_at,completed_at:a.p_completed_at};attempts=[row];body=[row];}
return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});

 await page.goto('http://127.0.0.1:8768/song-appreciation.html');await page.waitForSelector('.song-card');
 await page.evaluate(async id=>{await songQA.openSong(id,'exercise');await songQA.startExercise('standard');},song.id);
 await page.waitForFunction(()=>songQA.state.playerReady&&songQA.live());if(label==='student')await page.evaluate(()=>songQA.finishReadCountdown());else{assert.equal(await page.evaluate(()=>songQA.state.exercise),null,'second device cannot start a second exercise');await page.evaluate(()=>songQA.joinClassroom());assert.equal(await page.evaluate(()=>songQA.state.countdownTimer),0,'joining never starts a second countdown');}
 return {context,page};
 }
 try{
 const a=await device('student'),b=await device('tutor');
 await b.page.waitForFunction(()=>songQA.state.playerState===1);
 await b.page.evaluate(()=>songQA.togglePlayer());await a.page.waitForFunction(()=>songQA.state.playerState===2);
 await a.page.evaluate(()=>songQA.seekPlayer(5));await b.page.waitForFunction(()=>songQA.state.player.getCurrentTime()>=5);
 await b.page.evaluate(()=>songQA.relisten());await a.page.waitForFunction(()=>songQA.state.playerState===1);
 await b.page.waitForTimeout(1200);const commands=calls.filter(c=>c.args.p_action==='media').length;await b.page.waitForTimeout(1200);assert.equal(calls.filter(c=>c.args.p_action==='media').length,commands,'received commands never echo back');

 await b.page.evaluate(()=>{const p=songQA.state.player;window.qaPlayer=p;window.qaMediaNode=document.querySelector('[data-youtube-shell]').firstChild;window.qaFirstChoice=document.querySelector('[data-question="1"] [data-option]');p.current=40;p.playVideo();p.pauseCount=0;p.seekCount=0;p.destroyCount=0;const pause=p.pauseVideo.bind(p),seek=p.seekTo.bind(p),destroy=p.destroy.bind(p);p.pauseVideo=(...args)=>{p.pauseCount++;pause(...args)};p.seekTo=(...args)=>{p.seekCount++;seek(...args)};p.destroy=(...args)=>{p.destroyCount++;destroy(...args)};});
 // Measure after the answer handler, excluding Playwright's scroll/animation wait.
 const started=await a.page.evaluate(()=>{songQA.chooseAnswer(1,'light');return Date.now();});
 await b.page.waitForFunction(()=>document.querySelector('[data-question="1"] [data-option="light"]').getAttribute('aria-checked')==='true');
 const latency=Date.now()-started;assert.ok(latency<1300,`choice latency ${latency}ms`);
 // Rapid continuous input must still reach the server before the last click.
 const before=calls.filter(c=>c.name==='song_appreciation_draft_save').length;
 for(let i=0;i<10;i++){await a.page.evaluate(i=>songQA.chooseAnswer(2,i%2?'light':'rain'),i);await a.page.waitForTimeout(80);}
 assert.ok(calls.filter(c=>c.name==='song_appreciation_draft_save').length>before,'continuous choices cannot starve autosave');
 await b.page.waitForFunction(()=>songQA.state.exercise.answers[2]==='light');
 const passiveSaves=calls.filter(c=>c.label==='tutor'&&c.name==='song_appreciation_draft_save').length;await b.page.waitForTimeout(1600);assert.equal(calls.filter(c=>c.label==='tutor'&&c.name==='song_appreciation_draft_save').length,passiveSaves);
 await a.page.evaluate(()=>songQA.checkPartialAnswers());await b.page.waitForFunction(()=>!!songQA.state.exercise.results[1]);assert.equal(await b.page.locator('[data-question="1"] .answer-feedback').innerText(),'正確');
 const media=await b.page.evaluate(()=>({same:songQA.state.player===qaPlayer&&document.querySelector('[data-youtube-shell]').firstChild===qaMediaNode,choiceSame:document.querySelector('[data-question="1"] [data-option]')===qaFirstChoice,time:qaPlayer.current,playing:songQA.state.playerState,pause:qaPlayer.pauseCount,seek:qaPlayer.seekCount,destroy:qaPlayer.destroyCount}));assert.deepEqual(media,{same:true,choiceSame:true,time:40,playing:1,pause:0,seek:0,destroy:0});
 await b.page.evaluate(()=>songQA.chooseAnswer(3,'rain'));await a.page.waitForFunction(()=>songQA.state.exercise.answers[3]==='rain');
 await Promise.all([a.page.evaluate(()=>songQA.chooseAnswer(4,'light')),b.page.evaluate(()=>songQA.chooseAnswer(5,'light'))]);await a.page.waitForFunction(()=>songQA.state.exercise.answers[5]==='light');await b.page.waitForFunction(()=>songQA.state.exercise.answers[4]==='light');
 await b.page.screenshot({path:'/tmp/song-classroom-desktop.png'});
 // Reconnection catches up from canonical progress without replaying writes.
 liveOffline=true;await a.page.evaluate(()=>songQA.chooseAnswer(3,'rain'));await a.page.waitForTimeout(1800);liveOffline=false;await b.page.evaluate(()=>window.dispatchEvent(new Event('online')));await b.page.waitForFunction(()=>songQA.state.exercise.answers[3]==='rain');
 for(let n=3;n<=6;n++)await a.page.evaluate(n=>songQA.chooseAnswer(n,'light'),n);await a.page.locator('[data-submit-exercise]').click();await b.page.waitForFunction(()=>songQA.state.exercise.submitted);assert.equal(await b.page.locator('[data-result-score]').innerText(),'6 / 6');assert.equal(attempts.length,1,'observing a result does not create a second attempt');
 await b.page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}));await b.page.waitForTimeout(400);const hidden=calls.filter(c=>c.label==='tutor'&&c.name==='song_appreciation_live_snapshot').length;await b.page.waitForTimeout(1300);assert.equal(calls.filter(c=>c.label==='tutor'&&c.name==='song_appreciation_live_snapshot').length,hidden);
 await b.page.evaluate(()=>{delete document.hidden;songQA.routeStudent('library');});const left=calls.filter(c=>c.label==='tutor'&&c.name==='song_appreciation_live_snapshot').length;await b.page.waitForTimeout(1300);assert.equal(calls.filter(c=>c.label==='tutor'&&c.name==='song_appreciation_live_snapshot').length,left);

 await a.page.evaluate(()=>{const q=songQA;q.state.activeSong.vocabulary=[{word:'test',options:['a','b','c','d'],number:1}];q.state.songs.push({...q.state.songs[0],id:'other',title:'Another Song'});document.querySelector('[data-result-card] .lesson-complete')?.remove();document.querySelector('[data-result-card]').append(q.completionPanel('完成！'));});
 await a.page.getByRole('button',{name:/開始字彙練習/}).click();assert.equal(await a.page.locator('[data-song-tab="vocabulary"]').getAttribute('aria-selected'),'true');
 await a.page.evaluate(()=>songQA.switchSongTab('exercise'));
 const rail=a.page.locator('[data-result-card] .song-discovery');await rail.scrollIntoViewIfNeeded();
 await rail.dispatchEvent('touchstart');assert.equal(await rail.evaluate(el=>getComputedStyle(el).overflowX),'auto');
 await rail.evaluate(el=>el.scrollLeft=200);assert.ok(await rail.evaluate(el=>el.scrollLeft)>0,'touch rail can scroll right');await rail.evaluate(el=>el.scrollLeft=50);assert.ok(await rail.evaluate(el=>el.scrollLeft)<200,'touch rail can scroll left');
 await a.page.setViewportSize({width:820,height:1180});await rail.scrollIntoViewIfNeeded();
 const touch=await a.context.newCDPSession(a.page);await touch.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 await rail.evaluate(el=>el.scrollLeft=250);const box=await rail.boundingBox(),y=box.y+box.height/2,x=box.x+box.width*.7;
 const swipe=async delta=>{await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+delta*i/8,y}]});await a.page.waitForTimeout(25);}await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await a.page.waitForTimeout(350);};
 const beforeSwipe=await rail.evaluate(el=>el.scrollLeft);await swipe(-160);const afterSwipe=await rail.evaluate(el=>el.scrollLeft);assert.ok(afterSwipe>beforeSwipe,'native touch swipe advances recommendations');await swipe(160);assert.ok(await rail.evaluate(el=>el.scrollLeft)<afterSwipe,'reverse touch swipe goes back');
 await a.page.screenshot({path:'/tmp/song-completion-tablet.png'});
 assert.equal(await a.page.locator('footer a[href*="image-credits"]').count(),0);
 await a.page.evaluate(()=>songQA.startExercise('standard'));assert.equal(await a.page.evaluate(()=>songQA.state.exercise.submitted),false,'next exercise starts after completed room');
 await a.page.getByRole('button',{name:'中斷其他裝置連線',exact:true}).click();
 await b.page.waitForFunction(()=>songQA.state.session===null);assert.equal(await a.page.evaluate(()=>songQA.classroom.devices),1);assert.equal(await a.page.locator('[data-classroom-bar]').isVisible(),false);

 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,choiceLatencyMs:latency,checks:['exclusive start','join without countdown','two-way playback','no playback echo','two-way answers','concurrent edits merge','two devices','half-second playback refresh','continuous rapid input','selected choices','checked results','submitted scores','unchanged audio and lyric DOM','no duplicate observer saves','offline recovery','hidden and leaving stop polling','completion unlock','vocabulary shortcut','native touch swipe both directions','eject peer and hide bar']}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
