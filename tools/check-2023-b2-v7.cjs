// V7 Paper 3 release gate. Pass a local or public 2023 B2 curation URL.
const { chromium, firefox, webkit } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');

const url = process.argv[2] || pathToFileURL(path.resolve(__dirname,'../paper3/2023-b2/curation/index.html')).href+'?curation=1';
const evidenceDir = process.env.PAPER3_EVIDENCE_DIR || '';

async function fresh(page){
  await page.goto(url);
  await page.evaluate(()=>{try{localStorage.clear()}catch{}try{sessionStorage.clear()}catch{}});
  await page.reload();
  await page.locator('#curation-step-jump').waitFor();
}
async function enterPodcast(page){
  await page.locator('[data-chapter=podcast]').click();
  await page.locator('.curation-player[data-podcast-architecture="v7-continuous-single-owner"]').waitFor();
}
async function waitForAudio(page){
  await page.evaluate(()=>audio.readyState>=1?true:new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('meeting.mp3 metadata timeout')),15000);
    audio.addEventListener('loadedmetadata',()=>{clearTimeout(timer);resolve(true)},{once:true});audio.load();
  }));
}
async function auditBoss(page){
  const result=await page.evaluate(()=>{
    const boss=rows.filter(row=>row.stage===0),page4=boss.filter(row=>row.leaf===4);
    const quotes=page4.map(row=>row.q).join('\n')+'\n'+nativePages23[3];
    jump23(rows.findIndex(row=>row.stage===0&&row.leaf===4));
    const page=document.querySelector('.native-reader-host').shadowRoot.querySelector('#page-4');
    const future=[...page.querySelectorAll('mark[data-step-index]')].filter(mark=>Number(mark.dataset.stepIndex)>i);
    return {
      count:boss.length,page4:page4.length,
      required:['Teen NetChef TV','William Puddle','Dante Cruz’s most recent email sets the scene','briefly describe the three courses staff should sign up for','Viewer’s Choice','draft of the storyboard for the video'].every(text=>quotes.includes(text)),
      futureHidden:future.every(mark=>!mark.classList.contains('is-revealed')&&getComputedStyle(mark).backgroundColor==='rgba(0, 0, 0, 0)'),
      synthetic:document.querySelectorAll('#notes23').length
    };
  });
  const message=JSON.stringify(result);assert(result.count>=16,message);assert(result.page4>=15,message);assert.equal(result.required,true,message);
  assert.equal(result.futureHidden,true,message);assert.equal(result.synthetic,0,message);
}
async function auditInitialPodcast(page){
  const state=await page.evaluate(()=>{
    const root=document.querySelector('.native-reader-host').shadowRoot,page3=root.querySelector('#page-3');
    const fields=[...page3.querySelectorAll('.note-sheet textarea')],headings=[...page3.querySelectorAll('.note-sheet .notes-form-body>h3')];
    const meta=window.podcastCueMetaV7;
    return {
      architecture:document.querySelector('#player')?.dataset.podcastArchitecture,
      transcriptArchitecture:document.querySelector('#trans')?.dataset.podcastArchitecture,
      audioConnected:audio.isConnected,audioMuted:audio.muted,audioVolume:audio.volume,audioSource:audio.currentSrc,
      playerCount:document.querySelectorAll('#player').length,transcriptCount:document.querySelectorAll('#trans').length,
      timelines:document.querySelectorAll('.curation-player-timeline').length,pins:document.querySelectorAll('.curation-player-pin').length,
      legacy:document.querySelectorAll('.seek-wrap,.pin-layer,#notes23').length,
      timeText:document.querySelector('#time')?.textContent,currentTime:audio.currentTime,
      cueIndex,done,completed:podcastController23.snapshot().completedThrough,
      cueProgress:E('count').textContent,
      revealed:document.querySelectorAll('#turns>.speech.is-revealed').length,
      strikes:document.querySelectorAll('#turns>.speech.curation-transcript-strike').length,
      currentTurns:document.querySelectorAll('#turns>.speech.is-current').length,
      follow:document.querySelector('#transcript-follow')?.getAttribute('aria-pressed'),
      structured:[...document.querySelectorAll('#turns>.speech')].every(line=>line.querySelector(':scope>.speaker')&&line.querySelector(':scope>.curation-transcript-copy')),
      turnCount:document.querySelectorAll('#turns>.speech').length,
      minCopyWidth:Math.min(...[...document.querySelectorAll('#turns>.speech>.curation-transcript-copy')].map(node=>node.getBoundingClientRect().width)),
      fieldIds:fields.map(field=>field.id),fieldValues:fields.map(field=>field.value),
      headingTasks:headings.filter(h=>h.classList.contains('curation-note-task')).map(h=>h.dataset.task),
      headingNoise:headings.filter(h=>h.classList.contains('curation-note-noise')).length,
      taskBadges:[...page3.querySelector('#notes-heading-william-video').querySelectorAll('.curation-note-task-badge')].map(node=>node.textContent),
      evidence:page3.querySelectorAll('.notes-evidence').length,
      togglePressed:document.querySelector('#pins')?.getAttribute('aria-pressed'),pinsHidden:document.querySelector('#ticks')?.hidden,
      coverage:{
        first:meta[0].playbackStart,last:meta.at(-1).end,
        contiguous:meta.every((cue,index)=>index===0?cue.playbackStart===426:Math.abs(cue.playbackStart-meta[index-1].end)<.001),
        sourceInside:meta.every(cue=>cue.sourceStart>=cue.playbackStart-.001&&cue.sourceEnd===cue.end),
        duration:meta.reduce((sum,cue)=>sum+cue.end-cue.playbackStart,0)
      }
    };
  });
  assert.equal(state.architecture,'v7-continuous-single-owner');assert.equal(state.transcriptArchitecture,'v7-continuous-single-owner');
  assert.equal(state.audioConnected,true);assert.equal(state.audioMuted,false);assert(state.audioVolume>=.99,state);assert.match(state.audioSource,/meeting\.mp3/);
  assert.equal(state.playerCount,1);assert.equal(state.transcriptCount,1);assert.equal(state.timelines,1);assert.equal(state.pins,17);assert.equal(state.legacy,0);
  assert.match(state.timeText,/^0:00 \/ 6:52/);assert(Math.abs(state.currentTime-426)<.15,state);assert.equal(state.cueIndex,0);assert.equal(state.done,false);assert.equal(state.completed,-1);
  assert.match(state.cueProgress,/1 \/ 17/);assert.doesNotMatch(state.cueProgress,/166/);
  assert.equal(state.revealed,0);assert.equal(state.strikes,0);assert.equal(state.currentTurns,1);assert.equal(state.follow,'true');
  assert.equal(state.structured,true);assert.equal(state.turnCount,76);assert(state.minCopyWidth>180,state);
  assert.deepEqual(state.fieldIds,['notes-live-study-cook','notes-filming-schedule','notes-food-kinds','notes-william-video','notes-golden-sun','notes-viewers-choice']);
  assert(state.fieldValues.every(value=>value===''),state.fieldValues);assert.deepEqual(state.headingTasks,['AB','B','C']);assert.equal(state.headingNoise,3);
  assert.deepEqual(state.taskBadges,['Task A','Task B']);assert.equal(state.evidence,6);
  assert.equal(state.togglePressed,String(!state.pinsHidden));
  assert.equal(state.coverage.first,426);assert.equal(state.coverage.last,838.79);assert.equal(state.coverage.contiguous,true);assert.equal(state.coverage.sourceInside,true);
  assert(Math.abs(state.coverage.duration-(838.79-426))<.01,state.coverage);
}
async function playCue(page,index){
  await page.evaluate(index=>{podcastController23.replay(index,false);audio.playbackRate=16;},index);
  const start=await page.evaluate(index=>({time:audio.currentTime,start:podcastCueMetaV7[index].playbackStart}),index);
  assert(Math.abs(start.time-start.start)<.08,start);
  await page.locator('#play').click();
  await page.waitForFunction(index=>window.podcastCueTransactions23.some(entry=>entry.index===index),index,{timeout:45000});
  await page.waitForFunction(()=>window.podcastTransactionV5===false,null,{timeout:10000});
  return page.evaluate(index=>window.podcastCueTransactions23.find(entry=>entry.index===index),index);
}
async function auditListeningJourney(page){
  await waitForAudio(page);
  await page.evaluate(()=>window.podcastCueTransactions23.length=0);
  const first=await playCue(page,0);
  assert.equal(first.destination,'notes-live-study-cook');assert.equal(first.text,'10 episodes');
  const firstState=await page.evaluate(()=>{
    const root=document.querySelector('.native-reader-host').shadowRoot;
    const body=document.querySelector('#turns'),source=body.querySelector('[data-id="18"]'),bodyRect=body.getBoundingClientRect(),sourceRect=source.getBoundingClientRect();
    return {value:root.querySelector('#notes-live-study-cook').value,follow:document.querySelector('#transcript-follow').getAttribute('aria-pressed'),done,completed:podcastController23.snapshot().completedThrough,revealed:document.querySelectorAll('#turns>.speech.is-revealed').length,current:body.querySelector('.is-current')?.dataset.id,source:source.classList.contains('is-cue-source'),sourceVisible:sourceRect.bottom>bodyRect.top&&sourceRect.top<bodyRect.bottom};
  });
  assert.match(firstState.value,/10 episodes/);assert.equal(firstState.follow,'true');assert.equal(firstState.done,true);assert.equal(firstState.completed,0);assert(firstState.revealed>0);
  assert.equal(firstState.current,'18',firstState);assert.equal(firstState.source,true,firstState);assert.equal(firstState.sourceVisible,true,firstState);

  await page.locator('#transcript-translate').click();
  const translated=await page.evaluate(()=>({
    shown:document.querySelector('#trans').classList.contains('show-translation'),
    pressed:document.querySelector('#transcript-translate').getAttribute('aria-pressed'),
    translations:document.querySelectorAll('#turns>.speech>.curation-transcript-copy>.translation').length,
    structured:[...document.querySelectorAll('#turns>.speech')].every(line=>line.querySelector(':scope>.speaker')&&line.querySelector(':scope>.curation-transcript-copy')),
    visibleTranslations:[...document.querySelectorAll('#turns>.speech .translation')].filter(node=>getComputedStyle(node).display!=='none').length,
    sample:document.querySelector('#turns>.speech .translation')?.textContent
  }));
  assert.equal(translated.shown,true);assert.equal(translated.pressed,'true');assert.equal(translated.translations,76);assert.equal(translated.visibleTranslations,76);assert.equal(translated.structured,true);assert.match(translated.sample,/多謝/);
  await page.evaluate(()=>language.click());
  assert.equal(await page.locator('#turns>.speech>.curation-transcript-copy>.translation').count(),76);
  await page.locator('#transcript-translate').click();

  const endpoint=await page.evaluate(()=>{audio.playbackRate=1;return podcastCueMetaV7[0].end});
  await page.locator('#play').click();await page.waitForTimeout(250);
  const resumed=await page.evaluate(()=>({time:audio.currentTime,cueIndex,done,follow:document.querySelector('#transcript-follow').getAttribute('aria-pressed')}));
  assert.equal(resumed.cueIndex,1,resumed);assert.equal(resumed.done,false,resumed);assert.equal(resumed.follow,'true');assert(resumed.time>=endpoint-.03,resumed);assert(resumed.time<endpoint+3,resumed);
  await page.locator('#play').click();

  await page.evaluate(()=>{podcastController23.replay(1,false);const middle=(podcastCueMetaV7[1].playbackStart+podcastCueMetaV7[1].sourceStart)/2;podcastController23.seek(middle);podcastController23.persist()});
  const beforeReload=await page.evaluate(()=>({snapshot:podcastController23.snapshot(),note:document.querySelector('.native-reader-host').shadowRoot.querySelector('#notes-live-study-cook').value}));
  assert.equal(beforeReload.snapshot.j,1);assert.equal(beforeReload.snapshot.done,false);assert.equal(beforeReload.snapshot.completedThrough,0);
  await page.reload();await page.locator('.curation-player[data-podcast-architecture="v7-continuous-single-owner"]').waitFor();
  const afterReload=await page.evaluate(()=>({snapshot:podcastController23.snapshot(),note:document.querySelector('.native-reader-host').shadowRoot.querySelector('#notes-live-study-cook').value}));
  assert.equal(afterReload.snapshot.j,1);assert.equal(afterReload.snapshot.done,false);assert.equal(afterReload.snapshot.completedThrough,0);assert(Math.abs(afterReload.snapshot.time-beforeReload.snapshot.time)<.2,{beforeReload,afterReload});assert.match(afterReload.note,/10 episodes/);

  await page.locator('[data-chapter=categorize]').click();await page.locator('[data-chapter=podcast]').click();
  const afterReturn=await page.evaluate(()=>({snapshot:podcastController23.snapshot(),note:document.querySelector('.native-reader-host').shadowRoot.querySelector('#notes-live-study-cook').value}));
  assert.equal(afterReturn.snapshot.j,1);assert.equal(afterReturn.snapshot.completedThrough,0);assert.match(afterReturn.note,/10 episodes/);

  await page.evaluate(()=>{window.podcastCueTransactions23.length=0;podcastController23.replay(0,false)});
  const ledger=[];
  for(let index=0;index<17;index++){
    const transaction=await playCue(page,index);ledger.push(transaction);
    const expected=await page.evaluate(index=>({text:podcastCueMetaV7[index].text,destination:'notes-'+podcastCueMetaV7[index].field,end:podcastCueMetaV7[index].end,start:podcastCueMetaV7[index].playbackStart}),index);
    assert.equal(transaction.text,expected.text);assert.equal(transaction.destination,expected.destination);
    assert(Math.abs(transaction.audioTime-expected.end)<.08,{transaction,expected});assert.equal(transaction.playbackStart,expected.start);
  }
  assert.equal(new Set(ledger.map(entry=>entry.cueId)).size,17);
  const values=await page.evaluate(()=>Object.fromEntries([...document.querySelector('.native-reader-host').shadowRoot.querySelectorAll('.note-sheet textarea')].map(field=>[field.id,field.value])));
  assert.match(values['notes-live-study-cook'],/10 episodes/);assert.match(values['notes-filming-schedule'],/October/);
  assert.match(values['notes-food-kinds'],/Main dishes[\s\S]*Desserts/);assert.match(values['notes-william-video'],/Flood[\s\S]*Social media training/);
  assert.match(values['notes-golden-sun'],/Burnt toast[\s\S]*Fire safety training/);assert.match(values['notes-viewers-choice'],/Viewer’s Choice[\s\S]*Fully live/);
  if(evidenceDir){fs.mkdirSync(evidenceDir,{recursive:true});fs.writeFileSync(path.join(evidenceDir,'2023-b2-v7-cue-transactions.json'),JSON.stringify(ledger,null,2));await page.screenshot({path:path.join(evidenceDir,'2023-b2-podcast-v7-chromium.png'),fullPage:true});}
}
async function auditOtherContracts(page){
  await page.evaluate(()=>jump23(rows.findIndex(row=>row.stage===4&&row.q.startsWith('William did flood the test kitchen'))));
  const result=await page.evaluate(()=>{
    const unit=document.querySelector('[data-current-essay-unit="true"]'),syntax=unit?.querySelector('.curation-essay-structure');
    const contact=rows.find(row=>row.stage===3&&row.q.startsWith('Neither Puddle, nor the director'));
    const rumour=rows.find(row=>row.stage===3&&row.q.startsWith('With rumours of a new show'));
    return {task:unit?.classList.contains('curation-essay-task-A'),outer:getComputedStyle(unit).backgroundColor,inner:syntax&&getComputedStyle(syntax).backgroundColor,text:unit?.textContent,syntax:syntax?.textContent,contactType:contact?.t,rumourType:rumour?.t};
  });
  assert.equal(result.task,true);assert.match(result.text,/William did flood/);assert.match(result.syntax,/did flood/);assert.notEqual(result.outer,result.inner);assert.equal(result.contactType,5);assert.equal(result.rumourType,6);
}
async function chromiumRun(){
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await fresh(page);await auditBoss(page);await enterPodcast(page);await waitForAudio(page);await auditInitialPodcast(page);await auditListeningJourney(page);await auditOtherContracts(page);
    assert.deepEqual(errors,[]);
  }finally{await browser.close()}
}
async function firefoxRun(){
  const browser=await firefox.launch();
  try{
    const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await fresh(page);await enterPodcast(page);await waitForAudio(page);await auditInitialPodcast(page);
    await page.evaluate(()=>window.podcastCueTransactions23.length=0);const first=await playCue(page,0);
    assert.equal(first.text,'10 episodes');assert.equal(await page.locator('#transcript-follow').getAttribute('aria-pressed'),'true');
    if(evidenceDir){fs.mkdirSync(evidenceDir,{recursive:true});await page.screenshot({path:path.join(evidenceDir,'2023-b2-podcast-v7-firefox.png'),fullPage:true});}
    assert.deepEqual(errors,[]);
  }finally{await browser.close()}
}
async function webkitRun(){
  const browser=await webkit.launch();
  try{
    const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await fresh(page);await enterPodcast(page);await waitForAudio(page);await auditInitialPodcast(page);
    const before=await page.evaluate(()=>audio.currentTime);await page.locator('#play').click();await page.waitForTimeout(1500);
    const playback=await page.evaluate(()=>({time:audio.currentTime,paused:audio.paused,muted:audio.muted,volume:audio.volume,connected:audio.isConnected}));
    assert.equal(playback.paused,false,playback);assert.equal(playback.muted,false,playback);assert.equal(playback.connected,true,playback);assert(playback.volume>=.99,playback);assert(playback.time>before+.5,playback);
    await page.locator('#play').click();assert.deepEqual(errors,[]);
  }finally{await browser.close()}
}
(async()=>{await chromiumRun();await firefoxRun();await webkitRun()})().catch(error=>{console.error(error);process.exitCode=1});
