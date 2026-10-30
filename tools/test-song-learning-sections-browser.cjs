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
let progress={},sectionProgress={},sharedRoom=null;
const source=fs.readFileSync(root+'/song-appreciation.js','utf8').replace('  window.EdmundSongAppreciation = Object.freeze({','  window.songQA={state,enterAdmin,syncLyricsToPlayback,safeIntroduction,completionPanel};\n  window.EdmundSongAppreciation = Object.freeze({');
(async()=>{const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:950},serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await context.addInitScript(({session})=>{sessionStorage.setItem('edmund-song-appreciation-session-v1',JSON.stringify(session));window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'transport'}}}})},rpc:(name,args)=>{const promise=(async()=>{const r=await fetch('/mock-rpc/'+name,{method:'POST',body:JSON.stringify(args)});return {data:await r.json(),error:null};})();promise.abortSignal=()=>promise;return promise;}})};},{session});
await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.pathname==='/shared-system-nav.js')return r.fulfill({contentType:'text/javascript',body:''});if(u.hostname==='edmundeducation.com'&&u.pathname.startsWith('/song-media/')){const bytes=fs.readFileSync(root+u.pathname),range=r.request().headers()['range'];if(range){const parts=/bytes=(\d+)-(\d*)/.exec(range),start=Number(parts[1]),end=parts[2]?Number(parts[2]):bytes.length-1;return r.fulfill({status:206,headers:{'content-type':'audio/mpeg','accept-ranges':'bytes','content-range':`bytes ${start}-${end}/${bytes.length}`},body:bytes.subarray(start,end+1)});}return r.fulfill({body:bytes,contentType:u.pathname.endsWith('.mp3')?'audio/mpeg':'image/webp'});}if(u.host!=='127.0.0.1:8766')return r.abort();if(u.pathname==='/song-appreciation.js')return r.fulfill({contentType:'text/javascript',body:source});if(!u.pathname.startsWith('/mock-rpc/'))return r.continue();const name=u.pathname.split('/').pop(),a=r.request().postDataJSON();let body=[];
if(name==='song_appreciation_room'){
 if(a.p_action==='start')sharedRoom={id:a.p_session,owner:a.p_device,song:a.p_song,mode:a.p_mode,version:a.p_version,started_at:new Date().toISOString(),media:null,revision:0};
 if(a.p_action==='end')sharedRoom=null;
 if(a.p_action==='media'&&sharedRoom)sharedRoom={...sharedRoom,revision:sharedRoom.revision+1,media:{...a.p_media,at:new Date().toISOString(),device:a.p_device}};
 body={accepted:true,devices:1,session:sharedRoom,server_time:new Date().toISOString()};
}
if(name==='song_appreciation_student_me')body=[{id:session.id,name:session.name}];
if(['song_appreciation_student_list_songs','song_appreciation_student_get_song','song_appreciation_admin_list_songs'].includes(name))body=[{...song,exercises:song.exercises.map(m=>({...m,questions:m.questions.map(q=>({...q,answer:name==='song_appreciation_admin_list_songs'?q.answer:undefined}))}))}];
if(name==='song_appreciation_learning_sections')body=[{id:song.id,learning_sections:Object.fromEntries(Object.entries(song.learning_sections||{}).map(([key,value])=>[key,key==='analysis'?value:{...value,questions:value.questions.map(({answer,explanation,optionExplanations,...q})=>q)}])),section_progress:sectionProgress}];
if(name==='song_appreciation_section_answer'){const q=song.learning_sections[a.p_section].questions[a.p_number-1];body={selected:a.p_selected,answer:q.answer,explanation:q.explanation,optionExplanations:q.optionExplanations};sectionProgress[`${a.p_section}:${a.p_version}:${a.p_number}`]=body;}
if(name==='song_appreciation_lesson_extras')body=[{id:song.id,cover_url:song.cover_url,audio_url:song.audio_url,translations:song.translations,vocabulary:song.vocabulary.map(({answer,explanation,optionExplanations,...q})=>q),vocabulary_progress:progress}];
if(name==='song_appreciation_admin_save_lesson'){Object.assign(song,{...a.p_details,exercises:a.p_details.modes,cover_url:a.p_details.cover_url});body=song;}
if(name==='song_appreciation_vocabulary_answer'){const q=song.vocabulary[a.p_number-1];body={selected:a.p_selected,answer:q.answer,explanation:q.explanation,optionExplanations:q.optionExplanations};progress[a.p_number]=body;}
return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
await page.goto('http://127.0.0.1:8766/song-appreciation.html');await page.waitForSelector('.song-card');await page.locator('.song-card > button').last().click();
await page.locator('[data-song-tab="advanced"]').waitFor({state:'visible'});
for(const name of ['advanced','structure','analysis'])assert.equal(await page.locator(`[data-song-tab="${name}"]`).isVisible(),true);
await page.locator('[data-song-tab="translation"]').click();await page.waitForFunction(()=>window.songQA.state.playerReady);
await page.locator('[data-player-controls] [data-player-toggle]').click();await page.waitForFunction(()=>!document.querySelector('audio').paused);
for(const name of ['advanced','structure']) {
 await page.locator(`[data-song-tab="${name}"]`).click();const panel=page.locator(`[data-learning-section="${name}"]`);
 assert.equal(await page.locator('audio').evaluate(a=>a.paused),false,'music continues in '+name);
 assert.equal(await panel.locator('.vocabulary-option').count(),4);assert.equal(await panel.locator('.vocabulary-feedback').textContent(),'');
 await panel.locator('.vocabulary-option').nth(0).click();await panel.locator('.vocabulary-option.is-correct').waitFor();assert.equal(await panel.locator('.vocabulary-feedback p').count(),4);
 await panel.locator('select').selectOption('1');assert.equal(await panel.locator('.vocabulary-feedback').textContent(),'');
 await panel.locator('select').selectOption('0');assert.equal(await panel.locator('.vocabulary-option.is-correct').count(),1);
 for(const width of [1280,768,390]){await page.setViewportSize({width,height:950});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow '+width);await panel.scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/song-${lesson}-${name}-${width}.png`,fullPage:true});}
}
await page.locator('[data-song-tab="analysis"]').click();assert.equal(await page.locator('.analysis-card').count(),original.learning_sections.analysis.items.length);assert.equal(await page.locator('audio').evaluate(a=>a.paused),false);
assert.ok(!/不是[^。！？\n]{0,180}而是/.test(await page.locator('[data-learning-section="analysis"]').textContent()));
await page.reload();await page.waitForSelector('.song-card');await page.locator('.song-card > button').last().click();await page.locator('[data-song-tab="advanced"]').click();await page.locator('[data-learning-section="advanced"] .vocabulary-option.is-correct').waitFor();
assert.deepEqual(errors,[]);await browser.close();console.log('PASS '+lesson+': 7 tabs, grading, rationales, saved reload, continuous audio, 3 widths, Chinese style.');})().catch(e=>{console.error(e);process.exit(1)});
