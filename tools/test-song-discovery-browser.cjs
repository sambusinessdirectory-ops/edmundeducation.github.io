const assert=require('node:assert/strict'),fs=require('fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=require('node:path').resolve(__dirname,'..');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const session={id:id(1),name:'Synthetic Student',role:'student',token:id(99)};
const lesson=process.env.SONG_LESSON||'photograph';
const original=JSON.parse(fs.readFileSync(root+`/tools/song-content/${lesson}.json`));
const song={...original,id:id(3),published:true,cover_url:'http://127.0.0.1:8766/song-media/photograph/cover.webp',audio_url:'http://127.0.0.1:8766/song-media/photograph/album.mp3'};
// Keep safe HTTPS media URLs and serve their bytes locally via route interception.
song.cover_url=original.cover_url;song.audio_url=original.audio_url;
let progress={};
const source=fs.readFileSync(root+'/song-appreciation.js','utf8').replace('  window.EdmundSongAppreciation = Object.freeze({','  window.songQA={state,enterAdmin,syncLyricsToPlayback,renderVocabulary,renderAttempts,renderLibrary,get answerAudio(){return answerAudio;}};\n  window.EdmundSongAppreciation = Object.freeze({');
(async()=>{const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:950},serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await context.addInitScript(({session})=>{sessionStorage.setItem('edmund-song-appreciation-session-v1',JSON.stringify(session));window.supabase={createClient:()=>({rpc:async(name,args)=>{const r=await fetch('/mock-rpc/'+name,{method:'POST',body:JSON.stringify(args)});return {data:await r.json(),error:null};}})};},{session});
await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='edmundeducation.com'&&u.pathname.startsWith('/song-media/')){const bytes=fs.readFileSync(root+u.pathname),range=r.request().headers()['range'];if(range){const parts=/bytes=(\d+)-(\d*)/.exec(range),start=Number(parts[1]),end=parts[2]?Number(parts[2]):bytes.length-1;return r.fulfill({status:206,headers:{'content-type':'audio/mpeg','accept-ranges':'bytes','content-range':`bytes ${start}-${end}/${bytes.length}`},body:bytes.subarray(start,end+1)});}return r.fulfill({body:bytes,contentType:u.pathname.endsWith('.mp3')?'audio/mpeg':'image/webp'});}if(u.host!=='127.0.0.1:8766')return r.abort();if(u.pathname==='/song-appreciation.js')return r.fulfill({contentType:'text/javascript',body:source});if(!u.pathname.startsWith('/mock-rpc/'))return r.continue();const name=u.pathname.split('/').pop(),a=r.request().postDataJSON();let body=[];
if(name==='song_appreciation_student_me')body=[{id:session.id,name:session.name}];
if(['song_appreciation_student_list_songs','song_appreciation_student_get_song','song_appreciation_admin_list_songs'].includes(name))body=[{...song,exercises:song.exercises.map(m=>({...m,questions:m.questions.map(q=>({...q,answer:name==='song_appreciation_admin_list_songs'?q.answer:undefined}))}))}];
if(name==='song_appreciation_lesson_extras')body=[{id:song.id,cover_url:song.cover_url,audio_url:song.audio_url,vocabulary:song.vocabulary.map(({answer,explanation,optionExplanations,...q})=>q),vocabulary_progress:progress}];
if(name==='song_appreciation_admin_save_lesson'){Object.assign(song,{...a.p_details,exercises:a.p_details.modes,cover_url:a.p_details.cover_url});body=song;}
if(name==='song_appreciation_vocabulary_answer'){const q=song.vocabulary[a.p_number-1];body={selected:a.p_selected,answer:q.answer,explanation:q.explanation,optionExplanations:q.optionExplanations};progress[a.p_number]=body;}
return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
await page.goto('http://127.0.0.1:8766/song-appreciation.html');await page.waitForSelector('.song-card');assert.equal(await page.locator('.login-intro').count(),0);assert.match(await page.locator('.song-card img').getAttribute('src'),/cover.webp/);
await page.locator('.song-card > button').last().click();await page.locator('[data-song-tab="translation"]').click();await page.waitForFunction(()=>window.songQA.state.playerReady);assert.ok(await page.evaluate(()=>window.songQA.state.player.getDuration()>190));
await page.locator('[data-player-controls] [data-player-toggle]').click();await page.waitForFunction(()=>!document.querySelector('audio').paused);
await page.evaluate(lessonTime=>{window.songQA.state.player.pauseVideo();window.songQA.state.player.seekTo(lessonTime);},lesson==='photograph'?44:38);await page.waitForFunction(()=>document.querySelector('tr[data-line-id="line-6"]')?.classList.contains('is-current-line'));
await page.locator('[data-playback-rate]').first().selectOption('0.75');assert.equal(await page.locator('audio').evaluate(a=>a.playbackRate),.75);
for (const width of [1280,390]) {
 await page.setViewportSize({width,height:950});
 await page.locator('[data-song-tab="exercise"]').click();
 if (await page.locator('[data-change-mode]').isVisible()) await page.locator('[data-change-mode]').click();
 await page.locator('[data-mode-grid] button').last().click();
 assert.equal(await page.locator('[data-lyric-flow]').count(),original.translations.length);
 assert.equal(await page.locator('.exercise-line[data-question]').count(),50);
 assert.equal(await page.locator(`[data-lyric-flow="line-${original.translations.length}"]`).count(),1);
 const firstMulti=original.exercises[3].listeningLines.find(l=>(l.prompt.match(/\{\{q:/g)||[]).length>1);
 assert.equal(await page.locator(`[data-lyric-flow="${firstMulti.lineId}"] .blank-number`).count(),(firstMulti.prompt.match(/\{\{q:/g)||[]).length);
 const ready=page.locator('[data-skip-preparation]');await ready.scrollIntoViewIfNeeded();
 assert.equal(await page.locator('audio').evaluate(a=>a.paused),true);assert.equal(await page.locator('[data-floating-player]').isVisible(),false);
 const button=await ready.boundingBox(),panel=await page.locator('.player-card').boundingBox();
 assert.ok(button.y>=panel.y&&button.y+button.height<=panel.y+panel.height,'ready button fits inside player');
 assert.ok(await ready.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'ready button is not clipped');
 await page.screenshot({path:`/tmp/song-ready-${width}.png`});await ready.click();
 await page.waitForFunction(()=>document.querySelector('[data-countdown]').hidden&&!document.querySelector('audio').paused);
 await page.locator('[data-lyric-flow]').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:`/tmp/song-${lesson}-flow-${width}.png`});
 await page.locator('[data-song-tab="translation"]').click();
}
await page.setViewportSize({width:1280,height:950});
if(original.vocabulary.length){
await page.locator('[data-song-tab="vocabulary"]').click();assert.equal(await page.locator('.vocabulary-option').count(),4);assert.equal(await page.locator('.vocabulary-feedback').textContent(),'');await page.locator('.vocabulary-option').nth(1).click();await page.waitForSelector('.vocabulary-option.is-correct');assert.match(await page.locator('.vocabulary-feedback').textContent(),/答案 B/);assert.equal(await page.locator('.vocabulary-feedback p').count(),5);await page.screenshot({path:'/tmp/song-photograph-vocabulary.png'});
await page.locator('.vocabulary-navigation button').last().click();assert.ok((await page.locator('.vocabulary-card h2').textContent()).includes(original.vocabulary[1].word));
await page.reload();await page.waitForSelector('.song-card');await page.locator('.song-card > button').last().click();await page.locator('[data-song-tab="vocabulary"]').click();await page.waitForSelector('.vocabulary-option.is-correct');
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/tmp/song-photograph-mobile.png'});
}
await page.setViewportSize({width:1280,height:950});
await page.evaluate(()=>{
 const qa=window.songQA;qa.state.songs.push({...qa.state.songs[0],id:'other-song',title:'Open Arms',singer:'Journey',tags:['journey','reunion']});qa.renderLibrary();
 qa.state.attempts=[{id:'attempt',songId:qa.state.activeSong.id,songTitle:'Photograph',mode:'hell',completedAt:new Date().toISOString(),correctCount:0,totalQuestions:1,durationSeconds:10,results:{1:{selected:'wrong',answer:'right',correct:false}}}];qa.renderAttempts();
});
assert.match(await page.locator('.attempt-card summary').textContent(),/HELL/);
await page.locator('[data-song-tab="vocabulary"]').click();
for(let i=0;i<original.vocabulary.length;i++){
 await page.evaluate(i=>{window.songQA.state.vocabularyIndex=i;window.songQA.renderVocabulary();},i);
 const option=page.locator('.vocabulary-option').first();if(await option.isEnabled()){await option.click();await page.waitForSelector('.vocabulary-option.is-correct');}
}
assert.equal(await page.locator('[data-vocabulary] .lesson-complete').count(),1);
assert.equal(await page.locator('.song-discovery-group').count(),2);
assert.equal(await page.evaluate(()=>window.songQA.answerAudio?.state),'running');
await page.locator('[data-vocabulary] .review-mistakes-button').click();
assert.ok(await page.locator('.mistake-review').count()>0);assert.match(await page.locator('.mistake-review').first().textContent(),/你的選擇：.*正確答案：/);
await page.locator('.dialog-close').click();
await page.locator('.lesson-complete > .primary-button').click();
await page.locator('[data-open-tags]').click();
await page.locator('.tag-picker-grid label').filter({hasText:'journey'}).click();
await page.locator('.tag-picker-grid label').filter({hasText:'memories'}).click();
await page.getByRole('button',{name:'套用標籤',exact:true}).click();
assert.equal(await page.locator('.song-card').count(),2);assert.equal(await page.locator('[data-selected-tags] button').count(),2);
await page.locator('[data-selected-tags] button').filter({hasText:'memories'}).click();
assert.equal(await page.locator('.song-card').count(),1);assert.match(await page.locator('.song-card').textContent(),/Open Arms/);
await page.screenshot({path:'/tmp/song-tag-library.png'});
await page.setViewportSize({width:1280,height:950});await page.evaluate(async()=>{window.songQA.state.session.role='admin';await window.songQA.enterAdmin();});await page.waitForSelector('[data-song-form]');
await page.locator('input[name="coverFile"]').setInputFiles(root+'/song-media/photograph/cover.webp');await page.waitForFunction(()=>document.querySelector('input[name="coverUrl"]').value.startsWith('data:image/webp'));await page.locator('[data-song-form] button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('[data-admin-save-status]').textContent==='已儲存');assert.match(song.cover_url,/^data:image\/webp/);
assert.deepEqual(errors,[]);console.log('Album browser: real MP3 playback, timed highlighting, rate, vocabulary explanations, saved reload and mobile layout passed.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
