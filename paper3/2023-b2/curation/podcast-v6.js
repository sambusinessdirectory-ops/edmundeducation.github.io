// V6 canonical podcast runtime. Earlier scripts provide audited content and
// native-note helpers only. This file replaces their temporary player and
// transcript DOM, clears the legacy polling clock, and exclusively owns
// playback, cue state, transcript tracking, note transactions and restoration.
window.podcastArchitectureVersion23='6-single-owner';
window.podcastCueTransactions23=[];
window.podcastTransactionV5=false;

const podcastAudioStartV6=426;
const podcastAudioEndV6=838.79;
const podcastCueMetaV5=cues.map((cue,index)=>({
  id:'cue-'+String(index+1).padStart(2,'0'),index,turn:cue[0],task:cue[1],text:cue[2],
  sourceStart:transcript[cue[0]].start,sourceEnd:transcript[cue[0]].end,
  start:transcript[cue[0]].start,end:transcript[cue[0]].end,
  field:podcastNoteFieldsV4[fieldIds[index]].id
}));
let podcastFollowTranscriptV6=true;
let podcastCurrentTurnV6=-1;

function cueIndexAtTimeV5(time){
  const value=podcastMediaTimeV6(time);if(!Number.isFinite(value))return 0;
  const exact=podcastCueMetaV5.findIndex(cue=>value>=cue.start-.08&&value<=cue.end+.08);if(exact>=0)return exact;
  const next=podcastCueMetaV5.findIndex(cue=>value<cue.start);return next<0?podcastCueMetaV5.length-1:next;
}
function cueStateValidV5(index,time){
  const cue=podcastCueMetaV5[index],value=podcastMediaTimeV6(time);return !!cue&&Number.isFinite(value)&&value>=cue.start-.08&&value<=cue.end+.08;
}
function podcastMediaTimeV6(time){const value=Number(time);if(!Number.isFinite(value))return NaN;return value>0&&value<podcastAudioStartV6?value+podcastAudioStartV6:value}
function podcastStateSnapshotV5(){
  const cue=podcastCueMetaV5[cueIndex]||podcastCueMetaV5[0];
  return {version:6,cueId:cue.id,j:cue.index,done:!!done,time:Number(audio.currentTime)||cue.start,field:cue.field,text:cue.text};
}
function persistPodcastStateV5(){
  if(window.podcastTransactionV5)return;
  safePodcastWriteV4('cur23-audioState',JSON.stringify(podcastStateSnapshotV5()));safePodcastWriteV4('cur23-cue',String(cueIndex));
}
function cancelPodcastWritingV5(){
  clearInterval(typing);typing=0;
  podcastRootV4()?.querySelectorAll('.curation-note-writing,.curation-note-current').forEach(field=>field.classList.remove('curation-note-writing','curation-note-current'));
}
function setPinVisibilityV6(show){
  const pins=E('ticks'),button=E('pins');if(!pins||!button)return;
  pins.hidden=!show;button.setAttribute('aria-pressed',String(show));button.textContent=show?'隱藏停頓點':'顯示停頓點';
}
function updateFollowButtonV6(){
  const button=E('transcript-follow');if(!button)return;
  button.setAttribute('aria-pressed',String(podcastFollowTranscriptV6));button.textContent=podcastFollowTranscriptV6?'跟隨播放：開':'跟隨播放：關';
}
function ensureTranscriptTurnV6(line,turnIndex){
  const turn=transcript[turnIndex];if(!line||!turn)return null;
  let speaker=line.querySelector(':scope > .speaker'),copy=line.querySelector(':scope > .curation-transcript-copy');
  if(!speaker||!copy){
    line.replaceChildren();line.classList.add('speech');line.dataset.id=String(turnIndex);
    speaker=document.createElement('strong');speaker.className='speaker';speaker.textContent=turn.speaker;
    copy=document.createElement('div');copy.className='curation-transcript-copy';
    const text=document.createElement('p');text.className='curation-transcript-text';text.textContent=turn.text;copy.append(text);
    if(zhTurns[turnIndex-6]){const translation=document.createElement('p');translation.className='translation';translation.textContent=zhTurns[turnIndex-6];copy.append(translation)}
    line.append(speaker,copy);
  }
  return copy;
}
window.ensureTranscriptTurn23=ensureTranscriptTurnV6;

function buildPodcastChromeV6(){
  document.querySelectorAll('.seek-wrap,.pin-layer').forEach(node=>node.remove());
  panel.replaceChildren();panel.className='curation-player';panel.dataset.podcastArchitecture='v6-single-owner';
  const title=document.createElement('strong');title.className='curation-player-title';title.textContent='會議錄音';
  const play=document.createElement('button');play.id='play';play.type='button';play.textContent='▶';play.setAttribute('aria-label','播放錄音');
  const pinToggle=document.createElement('button');pinToggle.id='pins';pinToggle.type='button';pinToggle.className='curation-player-pins-toggle';
  const timeline=document.createElement('div');timeline.className='curation-player-timeline';
  const seek=document.createElement('input');seek.id='seek';seek.type='range';seek.step='.05';seek.min=String(podcastAudioStartV6);seek.max=String(podcastAudioEndV6);seek.className='curation-player-seek';seek.setAttribute('aria-label','會議錄音時間軸');
  const pins=document.createElement('div');pins.id='ticks';pins.className='curation-player-pins';
  podcastCueMetaV5.forEach(cue=>{const button=document.createElement('button');button.type='button';button.className='curation-player-pin';button.style.left=Math.max(0,Math.min(100,(cue.end-podcastAudioStartV6)/(podcastAudioEndV6-podcastAudioStartV6)*100))+'%';button.setAttribute('aria-label',(cue.index+1)+'. '+(cue.text||'會議結束')+' · '+tstr(cue.end-podcastAudioStartV6));button.onclick=()=>listenV5(cue.index,true);pins.append(button)});
  timeline.append(seek,pins);
  const time=document.createElement('output');time.id='time';time.className='curation-player-time';time.setAttribute('aria-live','off');
  const speed=document.createElement('label');speed.className='curation-player-speed';speed.append('速度 ');const rate=document.createElement('select');rate.id='rate';rate.setAttribute('aria-label','播放速度');for(let value=.5;value<=3;value+=.25)rate.add(new Option(value+'×',value,value===1,value===1));speed.append(rate);
  const transcriptToggle=document.createElement('button');transcriptToggle.id='transcript-toggle';transcriptToggle.type='button';transcriptToggle.textContent='查看逐字稿';transcriptToggle.setAttribute('aria-expanded','false');
  const status=document.createElement('output');status.id='podcast-cue-status';status.className='curation-player-cue-status';status.setAttribute('aria-live','polite');
  const audioStatus=document.createElement('span');audioStatus.id='audio-status';audioStatus.setAttribute('role','status');audioStatus.setAttribute('aria-live','polite');
  const retry=document.createElement('button');retry.id='audio-retry';retry.type='button';retry.hidden=true;retry.textContent='重試載入錄音';
  panel.append(title,play,pinToggle,timeline,time,speed,transcriptToggle,status,audioStatus,retry);setPinVisibilityV6(true);

  scriptWindow.replaceChildren();scriptWindow.className='curation-transcript-window';scriptWindow.dataset.podcastArchitecture='v6-single-owner';
  const head=document.createElement('header');head.className='curation-transcript-window-head';
  const heading=document.createElement('strong');heading.textContent='錄音稿 · 目前句子跟隨播放';
  const translate=document.createElement('button');translate.id='transcript-translate';translate.type='button';translate.className='curation-transcript-translate';translate.textContent='中文對照';translate.setAttribute('aria-pressed','false');
  const follow=document.createElement('button');follow.id='transcript-follow';follow.type='button';follow.className='curation-transcript-follow';
  const fit=document.createElement('button');fit.id='transcript-fit';fit.type='button';fit.className='curation-transcript-fit';fit.textContent='重設位置';
  const help=document.createElement('span');help.textContent='拖曳移動 · 四角調整大小';head.append(heading,translate,follow,fit,help);
  const body=document.createElement('div');body.id='turns';body.className='curation-transcript-window-body';body.setAttribute('role','log');body.setAttribute('aria-label','會議逐字稿');
  transcript.slice(6,82).forEach((turn,index)=>{const line=document.createElement('div');line.className='speech';line.dataset.id=String(index+6);ensureTranscriptTurnV6(line,index+6);body.append(line)});
  scriptWindow.append(head,body);
  for(const corner of ['nw','ne','sw','se']){const handle=document.createElement('i');handle.className='curation-resize-handle curation-resize-'+corner;handle.dataset.corner=corner;handle.setAttribute('aria-hidden','true');scriptWindow.append(handle)}
  updateFollowButtonV6();fitTranscriptWindowV6();bindPodcastChromeV6();
}
function fitTranscriptWindowV6(){
  const playerBottom=Math.max(120,panel.getBoundingClientRect().bottom||205),top=Math.min(innerHeight-260,playerBottom+12),width=Math.min(560,Math.max(380,innerWidth*.28)),height=Math.min(590,Math.max(260,innerHeight-top-18));
  Object.assign(scriptWindow.style,{left:'auto',right:'18px',top:Math.max(8,top)+'px',width:Math.min(width,innerWidth-36)+'px',height:height+'px'});
}
function bindPodcastChromeV6(){
  E('rate').onchange=()=>audio.playbackRate=Number(E('rate').value)||1;
  E('pins').onclick=()=>setPinVisibilityV6(E('ticks').hidden);
  E('transcript-toggle').onclick=()=>{const open=scriptWindow.classList.toggle('mobile-visible');E('transcript-toggle').setAttribute('aria-expanded',String(open));E('transcript-toggle').textContent=open?'收起逐字稿':'查看逐字稿'};
  E('transcript-translate').onclick=()=>{const show=scriptWindow.classList.toggle('show-translation');E('transcript-translate').setAttribute('aria-pressed',String(show));E('transcript-translate').textContent=show?'隱藏中文':'中文對照'};
  E('transcript-follow').onclick=()=>{podcastFollowTranscriptV6=!podcastFollowTranscriptV6;updateFollowButtonV6();if(podcastFollowTranscriptV6)paintPodcastV6(true)};
  E('transcript-fit').onclick=fitTranscriptWindowV6;
  E('turns').addEventListener('scroll',event=>{if(event.isTrusted&&!audio.paused){podcastFollowTranscriptV6=false;updateFollowButtonV6()}},{passive:true});
  const head=scriptWindow.querySelector('.curation-transcript-window-head');
  head.onpointerdown=event=>{if(event.target.closest('button'))return;const rect=scriptWindow.getBoundingClientRect(),dx=event.clientX-rect.left,dy=event.clientY-rect.top;head.setPointerCapture(event.pointerId);head.onpointermove=move=>{const left=Math.max(0,Math.min(innerWidth-180,move.clientX-dx)),top=Math.max(0,Math.min(innerHeight-80,move.clientY-dy));Object.assign(scriptWindow.style,{left:left+'px',right:'auto',top:top+'px'})};head.onpointerup=()=>head.onpointermove=null};
  scriptWindow.querySelectorAll('.curation-resize-handle').forEach(handle=>{handle.onpointerdown=event=>{event.preventDefault();event.stopPropagation();const corner=handle.dataset.corner,start=scriptWindow.getBoundingClientRect(),x=event.clientX,y=event.clientY;handle.setPointerCapture(event.pointerId);handle.onpointermove=move=>{let left=start.left,top=start.top,width=start.width,height=start.height;if(corner.includes('e'))width=Math.max(380,start.width+move.clientX-x);if(corner.includes('s'))height=Math.max(220,start.height+move.clientY-y);if(corner.includes('w')){width=Math.max(380,start.width-(move.clientX-x));left=start.right-width}if(corner.includes('n')){height=Math.max(220,start.height-(move.clientY-y));top=start.bottom-height}left=Math.max(0,left);top=Math.max(0,top);width=Math.min(innerWidth-left,width);height=Math.min(innerHeight-top,height);Object.assign(scriptWindow.style,{left:left+'px',right:'auto',top:top+'px',width:width+'px',height:height+'px'})};handle.onpointerup=()=>handle.onpointermove=null}});
}
function currentTranscriptTurnV6(time){
  const value=podcastMediaTimeV6(time);let current=6;for(let index=6;index<82;index++){if(transcript[index].start<=value+.06)current=index;else break}return current;
}
function paintPodcastV6(forceFollow=false){
  const elapsed=Math.max(0,audio.currentTime-podcastAudioStartV6),duration=podcastAudioEndV6-podcastAudioStartV6;
  if(E('time'))E('time').textContent=tstr(elapsed)+' / '+tstr(duration);if(E('seek'))E('seek').value=String(audio.currentTime||podcastAudioStartV6);
  [...(E('ticks')?.children||[])].forEach((pin,index)=>pin.classList.toggle('is-heard',podcastCueMetaV5[index].end<=audio.currentTime+.06));
  if(scriptWindow.dataset.reviewMode==='true')return;
  const current=currentTranscriptTurnV6(audio.currentTime),cue=podcastCueMetaV5[cueIndex];
  for(const line of E('turns')?.children||[]){
    const turnIndex=Number(line.dataset.id),turn=transcript[turnIndex],reached=turn.end<=audio.currentTime+.06,taskCue=cues.find(item=>item[0]===turnIndex);
    ensureTranscriptTurnV6(line,turnIndex);line.classList.toggle('is-current',turnIndex===current);line.classList.toggle('is-cue-source',turnIndex===cue?.turn);line.classList.toggle('is-revealed',reached);
    line.classList.remove('curation-transcript-A','curation-transcript-B','curation-transcript-C','curation-transcript-listening');
    if(reached&&taskCue)line.classList.add(taskCue[1]>=1&&taskCue[1]<=3?'curation-transcript-'+'ABC'[taskCue[1]-1]:'curation-transcript-listening');
    line.classList.toggle('curation-transcript-strike',reached&&noiseTurns.has(turnIndex));line.classList.toggle('curation-transcript-strike-direct',reached&&noiseTurns.has(turnIndex));line.classList.toggle('curation-strike',reached&&noiseTurns.has(turnIndex));
  }
  if((forceFollow||current!==podcastCurrentTurnV6)&&podcastFollowTranscriptV6){const target=[...E('turns').children].find(line=>Number(line.dataset.id)===current);target?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  podcastCurrentTurnV6=current;if(E('podcast-cue-status')&&cue)E('podcast-cue-status').textContent=`Cue ${cue.index+1}/17 · ${tstr(cue.end-podcastAudioStartV6)} · ${podcastNoteFieldsV4[fieldIds[cue.index]].title}`;
}
function focusCueDestinationV6(cue,{scroll=false}={}){
  const root=podcastRootV4(),field=podcastFieldV4(fieldIds[cue.index]);if(!root||!field)return;
  root.querySelectorAll('.curation-note-current').forEach(node=>node.classList.remove('curation-note-current'));
  const heading=root.querySelector('#notes-heading-'+cue.field),details=root.querySelector('[data-notes-section="'+cue.field+'"]');
  field.classList.add('curation-note-current');heading?.classList.add('curation-note-current');if(details)details.open=true;
  if(scroll)field.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
function applyPodcastStateV5(index,{time,completed=false,play=false,persist=true}={}){
  const cue=podcastCueMetaV5[Math.max(0,Math.min(podcastCueMetaV5.length-1,Number(index)||0))];
  window.podcastTransactionV5=true;cancelPodcastWritingV5();audio.pause();cueIndex=cue.index;done=!!completed;
  const requested=podcastMediaTimeV6(time),position=Number.isFinite(requested)?Math.max(cue.start,Math.min(cue.end,requested)):cue.start;
  audio.currentTime=position;E('count').textContent=(cueIndex+1)+' / '+cues.length;E('next').disabled=!done;notes(cueIndex+(done?1:0));focusCueDestinationV6(cue);paintPodcastV6(true);window.podcastTransactionV5=false;
  if(persist)persistPodcastStateV5();if(play)audio.play().catch(showAudioFailure);return cue;
}
function restorePodcastStateV5(raw){
  const state=raw&&typeof raw==='object'?raw:{},byId=podcastCueMetaV5.findIndex(cue=>cue.id===state.cueId),requested=byId>=0?byId:Number(state.j),time=podcastMediaTimeV6(state.time);
  const valid=Number.isInteger(requested)&&cueStateValidV5(requested,time),index=valid?requested:cueIndexAtTimeV5(time),cue=podcastCueMetaV5[index];
  const repairedTime=Number.isFinite(time)?Math.max(cue.start,Math.min(cue.end,time)):cue.start,completed=valid&&state.done===true&&Math.abs(repairedTime-cue.end)<=.25;
  return applyPodcastStateV5(index,{time:repairedTime,completed,persist:true});
}
function listenV5(index,play=false){return applyPodcastStateV5(index,{play})}
function recordCueTransactionV5(cue){
  const transaction={cueId:cue.id,index:cue.index,audioTime:Number(audio.currentTime.toFixed(3)),displayTime:Number((audio.currentTime-podcastAudioStartV6).toFixed(3)),endpoint:cue.end,sourceEndpoint:cue.sourceEnd,destination:'notes-'+cue.field,text:cue.text,architectureVersion:'6-single-owner',releaseSha:new URL(location.href).searchParams.get('release')||''};
  window.podcastCueTransactions23.push(transaction);document.dispatchEvent(new CustomEvent('curation-cue-transaction',{detail:transaction}));
}
function podcastBoundaryV5(){
  if(!active||audio.paused||done||window.podcastTransactionV5)return;const cue=podcastCueMetaV5[cueIndex];if(!cue)return;
  if(!cueStateValidV5(cueIndex,audio.currentTime)&&audio.currentTime<cue.start-.08){applyPodcastStateV5(cueIndex);return}if(audio.currentTime+.035<cue.end)return;
  window.podcastTransactionV5=true;audio.pause();audio.currentTime=cue.end;done=true;cancelPodcastWritingV5();notes(cue.index);recordCueTransactionV5(cue);focusCueDestinationV6(cue,{scroll:true});
  const field=podcastFieldV4(fieldIds[cue.index]);let count=0;
  if(!cue.text||!field){notes(cue.index+1);E('next').disabled=false;paintPodcastV6(true);window.podcastTransactionV5=false;persistPodcastStateV5();return}
  field.classList.add('curation-note-writing','curation-note-current');
  typing=setInterval(()=>{count+=2;notes(cue.index,cue.text.slice(0,count));if(count>=cue.text.length){clearInterval(typing);typing=0;notes(cue.index+1);field.classList.remove('curation-note-writing');E('next').disabled=false;window.podcastTransactionV5=false;paintPodcastV6(true);persistPodcastStateV5()}},25);paintPodcastV6(true);
}
function activatePodcastV5(){
  const state=read23Record('cur23-audioState');restorePodcastStateV5(Object.keys(state).length?state:{j:cueIndex,time:podcastCueMetaV5[cueIndex]?.start||podcastAudioStartV6,done:false});enhancePodcastSheet23();
}

if(typeof podcastBoundaryTimer23!=='undefined')clearInterval(podcastBoundaryTimer23);
buildPodcastChromeV6();
notes=function(n,partial=''){renderPodcastNotesV4(n,partial);if(!active)return;E('meta').textContent='會議錄音 · '+(cueIndex+1)+' / '+cues.length;E('q').textContent=done?transcript[cues[cueIndex][0]].text:'聆聽至下一個關鍵點';E('a').textContent=done?cueHelp[cueIndex]:'留意講者有沒有更正早前的說法。'};
paint=paintPodcastV6;listen=listenV5;boundary=podcastBoundaryV5;podcastBoundary23V4=podcastBoundaryV5;
audio.ontimeupdate=()=>{podcastBoundaryV5();paintPodcastV6()};
audio.onloadedmetadata=()=>{if(audio.currentTime<podcastAudioStartV6||audio.currentTime>podcastAudioEndV6)audio.currentTime=podcastCueMetaV5[cueIndex]?.start||podcastAudioStartV6;paintPodcastV6(true)};
audio.onplay=()=>{E('play').textContent='Ⅱ';E('play').setAttribute('aria-label','暫停錄音')};
audio.onpause=()=>{E('play').textContent='▶';E('play').setAttribute('aria-label','播放錄音');persistPodcastStateV5()};
E('play').onclick=()=>{if(done)listenV5(cueIndex,true);else if(audio.paused)audio.play().catch(showAudioFailure);else audio.pause()};
E('seek').oninput=event=>{const time=Number(event.target.value),index=cueIndexAtTimeV5(time);applyPodcastStateV5(index,{time})};
E('audio-retry').onclick=()=>{E('audio-status').textContent='正在重新載入錄音…';audio.load();audio.currentTime=podcastCueMetaV5[cueIndex]?.start||podcastAudioStartV6;audio.play().catch(showAudioFailure)};
paintPodcastV6();if(active)activatePodcastV5();
