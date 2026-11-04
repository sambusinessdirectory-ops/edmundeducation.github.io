// V7 canonical Stage 3 controller.
//
// One controller owns playback, cue selection, transcript projection, note
// transactions, persistence and restoration.  A cue is a continuous listening
// interval: its playback start is the previous cue's endpoint, while
// sourceStart/sourceEnd identify the answer-bearing utterance inside it.
window.podcastArchitectureVersion23='7-continuous-single-owner';
window.podcastCueTransactions23=[];
window.podcastTransactionV5=false;

// The learner-facing recording starts at the first instructional sentence,
// not at the greetings that precede it in the full examination audio.
// This timestamp is the audited onset of “Let's talk about …”.
const podcastOriginV7=458.02;
const podcastEndV7=838.79;
const podcastDurationV7=podcastEndV7-podcastOriginV7;
const podcastCueMetaV7=cues.map((cue,index)=>{
  const source=transcript[cue[0]],previous=index?transcript[cues[index-1][0]].end:podcastOriginV7;
  return {
    id:'cue-'+String(index+1).padStart(2,'0'),index,turn:cue[0],task:cue[1],text:cue[2],
    playbackStart:previous,sourceStart:source.start,sourceEnd:source.end,end:source.end,
    field:podcastNoteFieldsV4[fieldIds[index]].id
  };
});
window.podcastCueMetaV7=podcastCueMetaV7;

let podcastCompletedThroughV7=-1;
let podcastFollowV7=true;
let podcastActivatedV7=false;
let podcastProgrammaticScrollV7=false;
let podcastStateLockV7=false;
let podcastChromeBuiltV7=false;
let podcastPlaybackCueV7=-1;
let podcastDesiredTimeV7=podcastOriginV7;
let podcastCurrentSentenceV7=-1;
// Correct the opening line from the audited audio. It remains available during
// later sentence review, but is not part of the live listening interval.
transcript[6].text='Hi everyone. Thanks for joining us today.';
for(const unit of window.reviewUnits23||[]){
  if(unit.turn===6&&unit.sentence==='And thanks for joining us today.')unit.sentence=transcript[6].text;
}
const podcastSentenceMetaV7=(window.reviewUnits23||[]).map((unit,index)=>{
  const timed={...unit,index};
  if(unit.sentence==="Let's talk about Live Studio Cook first though.")timed.start=podcastOriginV7;
  return timed;
});
window.podcastSentenceMetaV7=podcastSentenceMetaV7;

function preparePodcastAudioOutputV7(){
  if(!audio.isConnected)panel.prepend(audio);
  audio.preload='auto';audio.playsInline=true;audio.controls=false;
  audio.muted=false;audio.defaultMuted=false;
  if(!Number.isFinite(audio.volume)||audio.volume<.99)audio.volume=1;
  if(audio.readyState>=1&&(audio.currentTime<podcastOriginV7-.08||audio.currentTime>podcastEndV7+.08)){
    audio.currentTime=Math.max(podcastOriginV7,Math.min(podcastEndV7,podcastDesiredTimeV7));
  }
}
function playPodcastAudioV7(){
  preparePodcastAudioOutputV7();
  const started=audio.play();
  if(started&&typeof started.catch==='function')started.catch(showAudioFailure);
  return started;
}

function podcastMediaTimeV7(value){
  const time=Number(value);
  if(!Number.isFinite(time))return NaN;
  return time>=0&&time<podcastOriginV7?time+podcastOriginV7:time;
}
function podcastCueAtTimeV7(value){
  const time=podcastMediaTimeV7(value);
  if(!Number.isFinite(time)||time<=podcastOriginV7)return 0;
  const index=podcastCueMetaV7.findIndex(cue=>time<=cue.end+.06);
  return index<0?podcastCueMetaV7.length-1:index;
}
function podcastNextCueAfterTimeV7(value){
  const time=podcastMediaTimeV7(value);
  if(!Number.isFinite(time))return 0;
  return podcastCueMetaV7.findIndex(cue=>cue.end>time+.015);
}
function podcastCompletedAtTimeV7(value){
  const time=podcastMediaTimeV7(value);
  let completed=-1;
  podcastCueMetaV7.forEach(cue=>{if(cue.end<=time+.035)completed=cue.index});
  return completed;
}
function podcastStateSnapshotV7(){
  const cue=podcastCueMetaV7[cueIndex]||podcastCueMetaV7[0];
  return {
    version:7,architecture:'continuous-single-owner',cueId:cue.id,j:cue.index,
    time:Number(audio.currentTime)||podcastOriginV7,done:!!done,
    completedThrough:podcastCompletedThroughV7,field:cue.field,text:cue.text
  };
}
function persistPodcastStateV7(){
  if(podcastStateLockV7||window.podcastTransactionV5)return;
  safePodcastWriteV4('cur23-audioState',JSON.stringify(podcastStateSnapshotV7()));
  safePodcastWriteV4('cur23-cue',String(cueIndex));
}
function clearPodcastWritingV7(){
  clearInterval(typing);typing=0;
  podcastRootV4()?.querySelectorAll('.curation-note-writing,.curation-note-current').forEach(node=>node.classList.remove('curation-note-writing','curation-note-current'));
}
function updatePodcastLessonV7(){
  const cue=podcastCueMetaV7[cueIndex];
  if(!cue)return;
  E('count').textContent=(cueIndex+1)+' / '+cues.length;
  E('next').disabled=!done;
  E('meta').textContent='會議錄音 · '+(cueIndex+1)+' / '+cues.length;
  E('q').textContent=done?transcript[cue.turn].text:'由 '+tstr(cue.playbackStart-podcastOriginV7)+' 連續聆聽至下一個停頓點';
  E('a').textContent=done?cueHelp[cueIndex]:'逐句聽完整段落；答案只會在相關句說完後寫入。';
}
function projectPodcastNotesV7(partial=''){
  const completedCount=Math.max(0,podcastCompletedThroughV7+1);
  renderPodcastNotesV4(completedCount,partial);
}
function setPodcastPinsV7(show){
  const pins=E('ticks'),button=E('pins');if(!pins||!button)return;
  pins.hidden=!show;button.setAttribute('aria-pressed',String(show));
  button.textContent=show?'隱藏停頓點':'顯示停頓點';
}
function updatePodcastFollowV7(){
  const button=E('transcript-follow');if(!button)return;
  button.setAttribute('aria-pressed',String(podcastFollowV7));
  button.textContent=podcastFollowV7?'跟隨播放：開':'跟隨播放：關';
}
function ensurePodcastTranscriptLineV7(line,turnIndex){
  const turn=transcript[turnIndex];if(!line||!turn)return;
  line.className='speech';line.dataset.id=String(turnIndex);
  if(turn.end<=podcastOriginV7)line.classList.add('curation-transcript-preroll');
  line.replaceChildren();
  const speaker=document.createElement('strong');speaker.className='speaker';speaker.textContent=turn.speaker;
  const copy=document.createElement('div');copy.className='curation-transcript-copy';
  const text=document.createElement('p');text.className='curation-transcript-text';let cursor=0;
  podcastSentenceMetaV7.filter(unit=>unit.turn===turnIndex).forEach(unit=>{
    const at=turn.text.indexOf(unit.sentence,cursor);if(at<0)return;
    text.append(document.createTextNode(turn.text.slice(cursor,at)));
    const span=document.createElement('span');span.className='curation-transcript-sentence';
    if(unit.end<=podcastOriginV7)span.classList.add('curation-transcript-preroll');
    span.dataset.reviewIndex=String(unit.index);span.dataset.start=String(unit.start);span.dataset.end=String(unit.end);span.textContent=unit.sentence;
    text.append(span);cursor=at+unit.sentence.length;
  });
  text.append(document.createTextNode(turn.text.slice(cursor)));copy.append(text);
  if(zhTurns[turnIndex-6]){const translation=document.createElement('p');translation.className='translation';translation.textContent=zhTurns[turnIndex-6];copy.append(translation)}
  line.append(speaker,copy);
}
window.ensureTranscriptTurn23=ensurePodcastTranscriptLineV7;

function podcastTranslationVisibleV7(){
  return scriptWindow.classList.contains('show-translation');
}
function setPodcastTranslationV7(show){
  const visible=!!show,button=E('transcript-translate');
  scriptWindow.classList.toggle('show-translation',visible);
  if(button){button.setAttribute('aria-pressed',String(visible));button.textContent=visible?'隱藏中文':'中文對照'}
  if(typeof language!=='undefined')language.setAttribute('aria-pressed',String(visible));
  if(typeof lang!=='undefined')lang=visible;
  const globalToggle=document.querySelector('#show-translation');if(globalToggle)globalToggle.checked=visible;
  E('turns')?.querySelectorAll(':scope>.speech').forEach((line,index)=>{
    const copy=line.querySelector(':scope>.curation-transcript-copy');
    if(copy&&!copy.querySelector(':scope>.translation')&&zhTurns[index]){
      const translation=document.createElement('p');translation.className='translation';translation.textContent=zhTurns[index];copy.append(translation);
    }
  });
  return visible;
}
window.podcastTranslationVisibleV7=podcastTranslationVisibleV7;
window.setPodcastTranslationV7=setPodcastTranslationV7;

function fitPodcastTranscriptV7(){
  const playerBottom=Math.max(112,panel.getBoundingClientRect().bottom||205);
  const top=Math.min(innerHeight-280,playerBottom+12);
  const width=Math.min(620,Math.max(430,innerWidth*.31));
  const height=Math.min(620,Math.max(300,innerHeight-top-18));
  Object.assign(scriptWindow.style,{left:'auto',right:'18px',top:Math.max(8,top)+'px',width:Math.min(width,innerWidth-36)+'px',height:height+'px'});
}
function buildPodcastChromeV7(){
  document.querySelectorAll('.seek-wrap,.pin-layer').forEach(node=>node.remove());
  panel.replaceChildren();panel.className='curation-player';panel.dataset.podcastArchitecture='v7-continuous-single-owner';
  preparePodcastAudioOutputV7();
  const title=document.createElement('strong');title.className='curation-player-title';title.textContent='會議錄音';
  const play=document.createElement('button');play.id='play';play.type='button';play.textContent='▶';play.setAttribute('aria-label','播放錄音');
  const pinToggle=document.createElement('button');pinToggle.id='pins';pinToggle.type='button';pinToggle.className='curation-player-pins-toggle';
  const timeline=document.createElement('div');timeline.className='curation-player-timeline';
  const seek=document.createElement('input');seek.id='seek';seek.type='range';seek.step='.05';seek.min=String(podcastOriginV7);seek.max=String(podcastEndV7);seek.value=String(podcastOriginV7);seek.className='curation-player-seek';seek.setAttribute('aria-label','會議錄音時間軸');
  const pins=document.createElement('div');pins.id='ticks';pins.className='curation-player-pins';
  podcastCueMetaV7.forEach(cue=>{const button=document.createElement('button');button.type='button';button.className='curation-player-pin';button.style.left=Math.max(0,Math.min(100,(cue.end-podcastOriginV7)/podcastDurationV7*100))+'%';button.setAttribute('aria-label',(cue.index+1)+'. '+(cue.text||'會議結束')+' · '+tstr(cue.end-podcastOriginV7));button.onclick=()=>podcastController23.replay(cue.index,true);pins.append(button)});
  timeline.append(seek,pins);
  const time=document.createElement('output');time.id='time';time.className='curation-player-time';time.textContent='0:00 / '+tstr(podcastDurationV7);
  const speed=document.createElement('label');speed.className='curation-player-speed';speed.append('速度 ');
  const rate=document.createElement('select');rate.id='rate';rate.setAttribute('aria-label','播放速度');for(let value=.5;value<=3;value+=.25)rate.add(new Option(value+'×',value,value===1,value===1));speed.append(rate);
  const transcriptToggle=document.createElement('button');transcriptToggle.id='transcript-toggle';transcriptToggle.type='button';transcriptToggle.textContent='查看逐字稿';transcriptToggle.setAttribute('aria-expanded','false');
  const status=document.createElement('output');status.id='podcast-cue-status';status.className='curation-player-cue-status';status.setAttribute('aria-live','polite');
  const audioStatus=document.createElement('span');audioStatus.id='audio-status';audioStatus.setAttribute('role','status');audioStatus.setAttribute('aria-live','polite');
  const retry=document.createElement('button');retry.id='audio-retry';retry.type='button';retry.hidden=true;retry.textContent='重試載入錄音';
  panel.append(title,play,pinToggle,timeline,time,speed,transcriptToggle,status,audioStatus,retry);
  setPodcastPinsV7(true);

  scriptWindow.replaceChildren();scriptWindow.className='curation-transcript-window';scriptWindow.dataset.podcastArchitecture='v7-continuous-single-owner';scriptWindow.dataset.reviewMode='false';
  const head=document.createElement('header');head.className='curation-transcript-window-head';
  const heading=document.createElement('strong');heading.textContent='錄音稿 · 目前句子跟隨播放';
  const translate=document.createElement('button');translate.id='transcript-translate';translate.type='button';translate.className='curation-transcript-translate';translate.textContent='中文對照';translate.setAttribute('aria-pressed','false');
  const follow=document.createElement('button');follow.id='transcript-follow';follow.type='button';follow.className='curation-transcript-follow';
  const fit=document.createElement('button');fit.id='transcript-fit';fit.type='button';fit.className='curation-transcript-fit';fit.textContent='重設位置';
  const help=document.createElement('span');help.textContent='拖曳移動 · 四角調整大小';head.append(heading,translate,follow,fit,help);
  const body=document.createElement('div');body.id='turns';body.className='curation-transcript-window-body';body.setAttribute('role','log');body.setAttribute('aria-label','會議逐字稿');
  transcript.slice(6,82).forEach((turn,index)=>{const line=document.createElement('div');ensurePodcastTranscriptLineV7(line,index+6);body.append(line)});
  scriptWindow.append(head,body);
  for(const corner of ['nw','ne','sw','se']){const handle=document.createElement('i');handle.className='curation-resize-handle curation-resize-'+corner;handle.dataset.corner=corner;handle.setAttribute('aria-hidden','true');scriptWindow.append(handle)}
  fitPodcastTranscriptV7();bindPodcastChromeV7();podcastChromeBuiltV7=true;
}
function bindPodcastChromeV7(){
  E('rate').onchange=()=>audio.playbackRate=Number(E('rate').value)||1;
  E('pins').onclick=()=>setPodcastPinsV7(E('ticks').hidden);
  E('transcript-toggle').onclick=()=>{const open=scriptWindow.classList.toggle('mobile-visible');E('transcript-toggle').setAttribute('aria-expanded',String(open));E('transcript-toggle').textContent=open?'收起逐字稿':'查看逐字稿'};
  E('transcript-translate').onclick=()=>setPodcastTranslationV7(!podcastTranslationVisibleV7());
  E('transcript-follow').onclick=()=>{podcastFollowV7=!podcastFollowV7;updatePodcastFollowV7();if(podcastFollowV7)paintPodcastV7(true)};
  E('transcript-fit').onclick=fitPodcastTranscriptV7;
  for(const type of ['wheel','touchstart'])E('turns').addEventListener(type,()=>{if(!podcastProgrammaticScrollV7){podcastFollowV7=false;updatePodcastFollowV7()}},{passive:true});
  const head=scriptWindow.querySelector('.curation-transcript-window-head');
  head.onpointerdown=event=>{if(event.target.closest('button'))return;const rect=scriptWindow.getBoundingClientRect(),dx=event.clientX-rect.left,dy=event.clientY-rect.top;head.setPointerCapture(event.pointerId);head.onpointermove=move=>{const left=Math.max(0,Math.min(innerWidth-180,move.clientX-dx)),top=Math.max(0,Math.min(innerHeight-80,move.clientY-dy));Object.assign(scriptWindow.style,{left:left+'px',right:'auto',top:top+'px'})};head.onpointerup=()=>head.onpointermove=null};
  scriptWindow.querySelectorAll('.curation-resize-handle').forEach(handle=>{handle.onpointerdown=event=>{event.preventDefault();event.stopPropagation();const corner=handle.dataset.corner,start=scriptWindow.getBoundingClientRect(),x=event.clientX,y=event.clientY;handle.setPointerCapture(event.pointerId);handle.onpointermove=move=>{let left=start.left,top=start.top,width=start.width,height=start.height;if(corner.includes('e'))width=Math.max(430,start.width+move.clientX-x);if(corner.includes('s'))height=Math.max(240,start.height+move.clientY-y);if(corner.includes('w')){width=Math.max(430,start.width-(move.clientX-x));left=start.right-width}if(corner.includes('n')){height=Math.max(240,start.height-(move.clientY-y));top=start.bottom-height}left=Math.max(0,left);top=Math.max(0,top);width=Math.min(innerWidth-left,width);height=Math.min(innerHeight-top,height);Object.assign(scriptWindow.style,{left:left+'px',right:'auto',top:top+'px',width:width+'px',height:height+'px'})};handle.onpointerup=()=>handle.onpointermove=null}});
  updatePodcastFollowV7();
}
function currentPodcastSentenceAtV7(value){
  const time=podcastMediaTimeV7(value);if(!Number.isFinite(time))return null;
  return podcastSentenceMetaV7.find(unit=>time>=unit.start-.04&&time<=unit.end+.04)||null;
}
function followPodcastSentenceV7(sentence,force=false){
  if(!podcastFollowV7||!sentence||(!force&&sentence.index===podcastCurrentSentenceV7))return;
  const target=E('turns')?.querySelector('[data-review-index="'+sentence.index+'"]');if(!target)return;
  const body=E('turns'),bodyRect=body.getBoundingClientRect(),targetRect=target.getBoundingClientRect();
  const top=body.scrollTop+(targetRect.top-bodyRect.top)-body.clientHeight/2+targetRect.height/2;
  podcastProgrammaticScrollV7=true;
  body.scrollTo({top:Math.max(0,top),behavior:force||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  setTimeout(()=>{podcastProgrammaticScrollV7=false},500);
}
function paintPodcastV7(forceFollow=false){
  if(!podcastChromeBuiltV7)return;
  const time=Math.max(podcastOriginV7,Math.min(podcastEndV7,Number(audio.currentTime)||podcastOriginV7));
  const elapsed=time-podcastOriginV7,cue=podcastCueMetaV7[cueIndex],current=currentPodcastSentenceAtV7(time);
  E('time').textContent=tstr(elapsed)+' / '+tstr(podcastDurationV7);E('seek').value=String(time);
  [...E('ticks').children].forEach((pin,index)=>pin.classList.toggle('is-heard',index<=podcastCompletedThroughV7));
  if(scriptWindow.dataset.reviewMode!=='true'){
    for(const line of E('turns').children){
      const turnIndex=Number(line.dataset.id),turn=transcript[turnIndex],reached=turn.end>podcastOriginV7&&turn.end<=time+.035,taskCue=cues.find(item=>item[0]===turnIndex);
      line.classList.toggle('is-current-turn',turnIndex===current?.turn);line.classList.toggle('is-cue-source',turnIndex===cue.turn&&time>=cue.sourceStart-.04);
      line.querySelectorAll('.curation-transcript-sentence').forEach(sentence=>sentence.classList.toggle('is-current',Number(sentence.dataset.reviewIndex)===current?.index));
      line.classList.toggle('is-revealed',reached);
      line.classList.remove('curation-transcript-A','curation-transcript-B','curation-transcript-C','curation-transcript-listening','curation-transcript-strike','curation-transcript-strike-direct','curation-strike');
      if(reached&&taskCue)line.classList.add(taskCue[1]>=1&&taskCue[1]<=3?'curation-transcript-'+'ABC'[taskCue[1]-1]:'curation-transcript-listening');
      if(reached&&noiseTurns.has(turnIndex))line.classList.add('curation-transcript-strike','curation-transcript-strike-direct','curation-strike');
    }
    followPodcastSentenceV7(current,forceFollow);podcastCurrentSentenceV7=current?.index??-1;
  }
  E('podcast-cue-status').textContent='Cue '+(cue.index+1)+'/17 · 下一停頓 '+tstr(cue.end-podcastOriginV7)+' · '+podcastNoteFieldsV4[fieldIds[cue.index]].title+(current?' · '+current.speaker+': '+current.sentence:' · 等待下一句');
}
function focusPodcastDestinationV7(cue,{scroll=false}={}){
  const root=podcastRootV4(),field=podcastFieldV4(fieldIds[cue.index]);if(!root||!field)return;
  root.querySelectorAll('.curation-note-current').forEach(node=>node.classList.remove('curation-note-current'));
  const heading=root.querySelector('#notes-heading-'+cue.field),details=root.querySelector('[data-notes-section="'+cue.field+'"]');
  field.classList.add('curation-note-current');heading?.classList.add('curation-note-current');if(details)details.open=true;
  if(scroll)field.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
function setPodcastStateV7(index,{time,completed=false,completedThrough,play=false,persist=true}={}){
  const cue=podcastCueMetaV7[Math.max(0,Math.min(podcastCueMetaV7.length-1,Number(index)||0))];
  podcastStateLockV7=true;window.podcastTransactionV5=true;clearPodcastWritingV7();audio.pause();
  podcastPlaybackCueV7=-1;cueIndex=cue.index;const requested=podcastMediaTimeV7(time);
  const position=Number.isFinite(requested)?Math.max(cue.playbackStart,Math.min(cue.end,requested)):cue.playbackStart;
  podcastDesiredTimeV7=position;audio.currentTime=position;done=!!completed&&Math.abs(position-cue.end)<=.1;
  podcastCompletedThroughV7=Number.isInteger(completedThrough)?Math.max(-1,Math.min(cue.index,completedThrough)):(done?cue.index:Math.min(cue.index-1,podcastCompletedAtTimeV7(position)));
  projectPodcastNotesV7();updatePodcastLessonV7();focusPodcastDestinationV7(cue);paintPodcastV7(true);
  window.podcastTransactionV5=false;podcastStateLockV7=false;
  if(persist)persistPodcastStateV7();if(play)playPodcastAudioV7();return cue;
}
function restorePodcastStateV7(raw){
  const state=raw&&typeof raw==='object'?raw:{};
  if(state.version!==7)return setPodcastStateV7(0,{time:podcastOriginV7,completed:false,completedThrough:-1});
  const byId=podcastCueMetaV7.findIndex(cue=>cue.id===state.cueId),requested=byId>=0?byId:Number(state.j),time=podcastMediaTimeV7(state.time);
  const index=Number.isInteger(requested)&&podcastCueMetaV7[requested]?requested:podcastCueAtTimeV7(time);
  const cue=podcastCueMetaV7[index],validTime=Number.isFinite(time)&&time>=cue.playbackStart-.08&&time<=cue.end+.08;
  const repaired=validTime?Math.max(cue.playbackStart,Math.min(cue.end,time)):cue.playbackStart;
  const completed=state.done===true&&Math.abs(repaired-cue.end)<=.1;
  const completedThrough=Number.isInteger(state.completedThrough)?state.completedThrough:(completed?index:index-1);
  return setPodcastStateV7(index,{time:repaired,completed,completedThrough});
}
function recordPodcastTransactionV7(cue){
  const transaction={cueId:cue.id,index:cue.index,playbackStart:cue.playbackStart,sourceStart:cue.sourceStart,sourceEnd:cue.sourceEnd,audioTime:Number(audio.currentTime.toFixed(3)),displayTime:Number((audio.currentTime-podcastOriginV7).toFixed(3)),destination:'notes-'+cue.field,text:cue.text,architectureVersion:'7-continuous-single-owner',releaseSha:new URL(location.href).searchParams.get('release')||''};
  window.podcastCueTransactions23.push(transaction);document.dispatchEvent(new CustomEvent('curation-cue-transaction',{detail:transaction}));
}
function completePodcastCueV7(){
  if(!active||audio.paused||done||window.podcastTransactionV5)return;
  const playbackIndex=podcastPlaybackCueV7>=0?podcastPlaybackCueV7:podcastNextCueAfterTimeV7(audio.currentTime);
  const cue=podcastCueMetaV7[playbackIndex];if(!cue||audio.currentTime+.035<cue.end)return;
  cueIndex=cue.index;podcastPlaybackCueV7=-1;window.podcastTransactionV5=true;audio.pause();audio.currentTime=cue.end;done=true;podcastCompletedThroughV7=cue.index;clearPodcastWritingV7();
  recordPodcastTransactionV7(cue);focusPodcastDestinationV7(cue,{scroll:true});
  const field=podcastFieldV4(fieldIds[cue.index]);let count=0;
  if(!cue.text||!field){projectPodcastNotesV7();E('next').disabled=false;updatePodcastLessonV7();paintPodcastV7(true);window.podcastTransactionV5=false;persistPodcastStateV7();return}
  field.classList.add('curation-note-writing','curation-note-current');projectPodcastNotesV7('');
  typing=setInterval(()=>{count+=2;renderPodcastNotesV4(cue.index,cue.text.slice(0,count));if(count>=cue.text.length){clearInterval(typing);typing=0;projectPodcastNotesV7();field.classList.remove('curation-note-writing');E('next').disabled=false;window.podcastTransactionV5=false;updatePodcastLessonV7();paintPodcastV7(true);persistPodcastStateV7();update23(true)}},25);
  updatePodcastLessonV7();paintPodcastV7(true);
}
function replayPodcastCueV7(index,play=false){
  const cue=podcastCueMetaV7[index];if(!cue)return;
  return setPodcastStateV7(index,{time:cue.playbackStart,completed:false,completedThrough:index-1,play});
}
function seekPodcastV7(value){
  const time=Math.max(podcastOriginV7,Math.min(podcastEndV7,podcastMediaTimeV7(value)));
  const index=podcastCueAtTimeV7(time),cue=podcastCueMetaV7[index],atEnd=Math.abs(time-cue.end)<=.06;
  return setPodcastStateV7(index,{time,completed:atEnd,completedThrough:podcastCompletedAtTimeV7(time)});
}
function resumePodcastV7(){
  if(!audio.paused){audio.pause();return}
  const index=podcastNextCueAfterTimeV7(audio.currentTime);
  if(index<0){E('podcast-cue-status').textContent='17/17 已完成；可按停頓點重聽任何一段。';return}
  const cue=podcastCueMetaV7[index];podcastPlaybackCueV7=index;cueIndex=index;done=false;
  podcastCompletedThroughV7=Math.min(index-1,podcastCompletedThroughV7);
  // Invoke play directly inside the trusted click/pin event before doing the
  // visual follow work. This preserves Safari's user-activation token.
  playPodcastAudioV7();
  podcastFollowV7=true;updatePodcastFollowV7();updatePodcastLessonV7();focusPodcastDestinationV7(cue);paintPodcastV7(true);persistPodcastStateV7();
}
function activatePodcastV7(){
  active=rows[i]?.stage===2;panel.hidden=scriptWindow.hidden=!active;if(!active){audio.pause();return}
  surface.hidden=true;enhancePodcastSheet23();
  if(!podcastActivatedV7){podcastActivatedV7=true;const saved=read23Record('cur23-audioState');restorePodcastStateV7(saved)}
  else{projectPodcastNotesV7();updatePodcastLessonV7();paintPodcastV7(true)}
}
window.activatePodcastV7=activatePodcastV7;

buildPodcastChromeV7();
const podcastOriginalRenderV7=render;
render=function(){podcastOriginalRenderV7();activatePodcastV7()};
const podcastOriginalUpdateV7=update23;
update23=function(force=false){podcastOriginalUpdateV7(force);if(rows[i]?.stage===2){enhancePodcastSheet23();paintPodcastV7(!!force)}};

audio.ontimeupdate=()=>{if(audio.currentTime>=podcastOriginV7&&audio.currentTime<=podcastEndV7)podcastDesiredTimeV7=audio.currentTime;completePodcastCueV7();paintPodcastV7()};
function ensurePodcastMediaPositionV7(){
  if(audio.readyState<1)return;
  if(audio.currentTime<podcastOriginV7-.08||audio.currentTime>podcastEndV7+.08){
    const desired=Math.max(podcastOriginV7,Math.min(podcastEndV7,podcastDesiredTimeV7));audio.currentTime=desired;
  }
  paintPodcastV7(true);
}
audio.onloadedmetadata=()=>{ensurePodcastMediaPositionV7();queueMicrotask(ensurePodcastMediaPositionV7);setTimeout(ensurePodcastMediaPositionV7,0)};
audio.addEventListener('loadeddata',ensurePodcastMediaPositionV7);
audio.addEventListener('canplay',ensurePodcastMediaPositionV7);
audio.onplay=()=>{
  const index=podcastNextCueAfterTimeV7(audio.currentTime);
  if(index>=0){
    podcastPlaybackCueV7=index;cueIndex=index;done=false;podcastFollowV7=true;
    updatePodcastFollowV7();updatePodcastLessonV7();focusPodcastDestinationV7(podcastCueMetaV7[index]);paintPodcastV7(true);
  }
  E('play').textContent='Ⅱ';E('play').setAttribute('aria-label','暫停錄音');
};
audio.onpause=()=>{E('play').textContent='▶';E('play').setAttribute('aria-label','播放錄音');persistPodcastStateV7()};
audio.onerror=()=>{showAudioFailure();E('a').textContent='未能載入會議錄音。可先閱讀逐字稿，再按重試載入錄音。'};
E('play').onclick=resumePodcastV7;
E('seek').oninput=event=>seekPodcastV7(event.target.value);
E('audio-retry').onclick=()=>{E('audio-status').textContent='正在重新載入錄音…';const position=audio.currentTime;audio.load();audio.currentTime=position;playPodcastAudioV7()};

const underlyingNextV7=E('next').onclick,underlyingPrevV7=E('prev').onclick;
const curationNextV7=document.querySelector('.curation-shell #curation-next')?.onclick;
const curationPrevV7=document.querySelector('.curation-shell #curation-prev')?.onclick;
const podcastInReviewV7=()=>scriptWindow.dataset.reviewMode==='true';
function nextPodcastV7(){
  if(!done)return;
  if(cueIndex<podcastCueMetaV7.length-1){replayPodcastCueV7(cueIndex+1,true);update23(true);return}
  if(typeof curationNextV7==='function')curationNextV7();else{i=rows.findIndex(row=>row.stage===3);render();update23(true)}
}
function previousPodcastV7(){
  if(cueIndex>0){replayPodcastCueV7(cueIndex-1,false);update23(true);return}
  if(typeof underlyingPrevV7==='function')underlyingPrevV7();
}
E('next').onclick=()=>active&&!podcastInReviewV7()?nextPodcastV7():underlyingNextV7();
E('prev').onclick=()=>active&&!podcastInReviewV7()?previousPodcastV7():underlyingPrevV7();
const curationNextButtonV7=document.querySelector('.curation-shell #curation-next');
if(curationNextButtonV7)curationNextButtonV7.onclick=()=>rows[i].stage===2&&!podcastInReviewV7()?nextPodcastV7():curationNextV7?.();
const curationPrevButtonV7=document.querySelector('.curation-shell #curation-prev');
if(curationPrevButtonV7)curationPrevButtonV7.onclick=()=>rows[i].stage===2&&!podcastInReviewV7()?previousPodcastV7():curationPrevV7?.();

window.podcastController23={
  version:7,cues:podcastCueMetaV7,activate:activatePodcastV7,persist:persistPodcastStateV7,
  snapshot:podcastStateSnapshotV7,replay:replayPodcastCueV7,seek:seekPodcastV7,
  next:nextPodcastV7,previous:previousPodcastV7,paint:paintPodcastV7
};
// Compatibility names are read-only gateways to the V7 owner; no legacy timer
// or handler remains active.
listen=(index,play=false)=>replayPodcastCueV7(index,play);
notes=(n,partial='')=>{podcastCompletedThroughV7=Math.max(-1,Math.min(cues.length-1,n-1));renderPodcastNotesV4(n,partial);updatePodcastLessonV7()};
paint=paintPodcastV7;boundary=completePodcastCueV7;podcastBoundary23V4=completePodcastCueV7;
podcastStateSnapshotV5=podcastStateSnapshotV7;
applyPodcastStateV5=(index,options={})=>setPodcastStateV7(index,{time:options.time,completed:options.completed,completedThrough:options.completedThrough,play:options.play,persist:options.persist});
cueIndexAtTimeV5=podcastCueAtTimeV7;
activatePodcastV5=activatePodcastV7;

activatePodcastV7();
// Metadata may have loaded before V7 replaced the legacy onloadedmetadata
// callback. In that case assigning currentTime during bootstrap was ignored.
if(audio.readyState>=1&&(audio.currentTime<podcastOriginV7||audio.currentTime>podcastEndV7)){
  ensurePodcastMediaPositionV7();
}
update23(true);
