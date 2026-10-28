const assert=require('node:assert/strict'),fs=require('fs');
const chromium=require(process.env.PLAYWRIGHT_MODULE||'playwright')[process.env.SONG_BROWSER||'chromium'];
const root=require('node:path').resolve(__dirname,'..');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const session={id:id(1),name:'Synthetic Student',role:'student',token:id(99)};
const lesson=process.env.SONG_LESSON||'photograph';
const original=JSON.parse(fs.readFileSync(root+`/tools/song-content/${lesson}.json`));
const song={...original,id:id(3),published:true,cover_url:'http://127.0.0.1:8766/song-media/photograph/cover.webp',audio_url:'http://127.0.0.1:8766/song-media/photograph/album.mp3'};
// Keep safe HTTPS media URLs and serve their bytes locally via route interception.
song.cover_url=original.cover_url;song.audio_url=original.audio_url;
let progress={};
const source=fs.readFileSync(root+'/song-appreciation.js','utf8').replace('  window.EdmundSongAppreciation = Object.freeze({','  window.songQA={state,enterAdmin,syncLyricsToPlayback,safeIntroduction,completionPanel,wordIndex,renderBigData,routeStudent};\n  window.EdmundSongAppreciation = Object.freeze({');
(async()=>{const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:950},serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await context.addInitScript(({session})=>{sessionStorage.setItem('edmund-song-appreciation-session-v1',JSON.stringify(session));window.supabase={createClient:()=>({rpc:async(name,args)=>{const r=await fetch('/mock-rpc/'+name,{method:'POST',body:JSON.stringify(args)});return {data:await r.json(),error:null};}})};},{session});
await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.pathname==='/shared-system-nav.js')return r.fulfill({contentType:'text/javascript',body:''});if(u.hostname==='edmundeducation.com'&&u.pathname.startsWith('/song-media/')){const bytes=fs.readFileSync(root+u.pathname),range=r.request().headers()['range'];if(range){const parts=/bytes=(\d+)-(\d*)/.exec(range),start=Number(parts[1]),end=parts[2]?Number(parts[2]):bytes.length-1;return r.fulfill({status:206,headers:{'content-type':'audio/mpeg','accept-ranges':'bytes','content-range':`bytes ${start}-${end}/${bytes.length}`},body:bytes.subarray(start,end+1)});}return r.fulfill({body:bytes,contentType:u.pathname.endsWith('.mp3')?'audio/mpeg':'image/webp'});}if(u.host!=='127.0.0.1:8766')return r.abort();if(u.pathname==='/song-appreciation.js')return r.fulfill({contentType:'text/javascript',body:source});if(!u.pathname.startsWith('/mock-rpc/'))return r.continue();const name=u.pathname.split('/').pop(),a=r.request().postDataJSON();let body=[];
if(name==='song_appreciation_student_me')body=[{id:session.id,name:session.name}];
if(['song_appreciation_student_list_songs','song_appreciation_student_get_song','song_appreciation_admin_list_songs'].includes(name))body=[{...song,translations:name==='song_appreciation_student_list_songs'?undefined:song.translations,exercises:song.exercises.map(m=>({...m,questions:m.questions.map(q=>({...q,answer:name==='song_appreciation_admin_list_songs'?q.answer:undefined}))}))}];
if(name==='song_appreciation_lesson_extras')body=[{id:song.id,cover_url:song.cover_url,audio_url:song.audio_url,translations:song.translations,vocabulary:song.vocabulary.map(({answer,explanation,optionExplanations,...q})=>q),vocabulary_progress:progress}];
if(name==='song_appreciation_admin_save_lesson'){Object.assign(song,{...a.p_details,exercises:a.p_details.modes,cover_url:a.p_details.cover_url});body=song;}
if(name==='song_appreciation_vocabulary_answer'){const q=song.vocabulary[a.p_number-1];body={selected:a.p_selected,answer:q.answer,explanation:q.explanation,optionExplanations:q.optionExplanations};progress[a.p_number]=body;}
return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
await page.goto('http://127.0.0.1:8766/song-appreciation.html');await page.waitForSelector('.song-card');assert.equal(await page.locator('.login-intro').count(),0);assert.match(await page.locator('.song-card img').getAttribute('src'),/cover.webp/);
await page.locator('.song-card > button').last().click();await page.locator('[data-song-tab="translation"]').click();await page.waitForFunction(()=>window.songQA.state.playerReady);assert.ok(await page.evaluate(()=>window.songQA.state.player.getDuration()>130));
await page.locator('[data-player-controls] [data-player-toggle]').click();await page.waitForFunction(()=>!document.querySelector('audio').paused);
await page.evaluate(lessonTime=>{window.songQA.state.player.pauseVideo();window.songQA.state.player.seekTo(lessonTime);},(original.translations[5].startSeconds+original.translations[5].endSeconds)/2);await page.waitForFunction(()=>document.querySelector('tr[data-line-id="line-6"]')?.classList.contains('is-current-line'));
await page.locator('[data-speed-trigger]').first().click();await page.getByRole('menuitemradio').filter({hasText:'0.75×'}).click();assert.equal(await page.locator('audio').evaluate(a=>a.playbackRate),.75);

await page.locator('[data-player-controls] [data-player-toggle]').click();await page.waitForFunction(()=>!document.querySelector('audio').paused);
await page.locator('[data-song-tab="vocabulary"]').click();
assert.equal(await page.locator('audio').evaluate(a=>a.paused),false,'Vocabulary preserves playback');
await page.evaluate(()=>window.songQA.routeStudent('big-data'));
assert.equal(await page.locator('.word-card').count(),50);
const counts=await page.locator('.word-frequency').allTextContents();assert.ok(parseInt(counts[0])>=parseInt(counts[49]));
await page.locator('[data-word-sort]').click();const ascending=await page.locator('.word-frequency').allTextContents();assert.ok(parseInt(ascending[0])<=parseInt(ascending[49]));
await page.locator('[data-word-search]').fill('photograph');assert.equal(await page.locator('.word-card').count(),1);
await page.locator('.word-card').click();assert.match(await page.locator('dialog').textContent(),/Photograph/);await page.locator('dialog .dialog-close').click();
const sample=await page.evaluate(()=>window.songQA.wordIndex([{id:'a',translations:[{english:"Love love, don't stop. Love!"}]}]).map(x=>[x.word,x.count]));assert.deepEqual(sample,[['love',3],["don't",1],['stop',1]]);
await page.locator('[data-word-search]').fill('');for(const width of [1024,390]){await page.setViewportSize({width,height:950});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}await page.setViewportSize({width:1280,height:950});await page.screenshot({path:'/tmp/song-big-data.png',fullPage:true});
await page.evaluate(()=>window.songQA.routeStudent('library'));
await page.locator('[data-song-search]').fill('hearts were never broken');assert.equal(await page.locator('.song-card').count(),1);await page.locator('[data-song-search]').fill('unmatched xyz');assert.equal(await page.locator('.song-card').count(),0);await page.locator('[data-song-search]').fill('');await page.locator('[data-open-tags]').click();await page.screenshot({path:'/tmp/song-tags-redesign.png'});await page.locator('dialog .dialog-close').click();
await page.evaluate(()=>{const panel=window.songQA.completionPanel('完成');const result=document.createElement('div');result.className='result-card';result.append(panel);document.body.append(result)});
assert.equal(await page.locator('.lesson-complete').last().evaluate(e=>getComputedStyle(e).color),'rgb(55, 43, 64)');
assert.deepEqual(errors,[]);console.log('Discovery upgrade passed: continuous audio, word counts, sorting, pagination, tag dialog and contrast.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
