// V5 single-owner podcast runtime. The earlier files provide audited source data
// and DOM construction only; this controller exclusively owns cue/time state,
// playback boundaries, note transactions, restoration, and diagnostics.
window.podcastArchitectureVersion23='5-single-owner';
window.podcastCueTransactions23=[];
window.podcastTransactionV5=false;

const podcastCueMetaV5=cues.map((cue,index)=>({
  id:'cue-'+String(index+1).padStart(2,'0'),index,turn:cue[0],task:cue[1],text:cue[2],
  start:index?transcript[cues[index-1][0]].end:426,
  end:transcript[cue[0]].end,
  field:podcastNoteFieldsV4[fieldIds[index]].id
}));

function cueIndexAtTimeV5(time){
  const value=Number(time);
  if(!Number.isFinite(value))return 0;
  const found=podcastCueMetaV5.findIndex(cue=>value<=cue.end+.08);
  return found<0?podcastCueMetaV5.length-1:found;
}
function cueStateValidV5(index,time){
  const cue=podcastCueMetaV5[index],value=Number(time);
  return !!cue&&Number.isFinite(value)&&value>=cue.start-.08&&value<=cue.end+.08;
}
function podcastStateSnapshotV5(){
  const cue=podcastCueMetaV5[cueIndex]||podcastCueMetaV5[0];
  return {version:5,cueId:cue.id,j:cue.index,done:!!done,time:Number(audio.currentTime)||cue.start,field:cue.field,text:cue.text};
}
function persistPodcastStateV5(){
  if(window.podcastTransactionV5)return;
  safePodcastWriteV4('cur23-audioState',JSON.stringify(podcastStateSnapshotV5()));
  safePodcastWriteV4('cur23-cue',String(cueIndex));
}
function cancelPodcastWritingV5(){
  clearInterval(typing);typing=0;
  podcastRootV4()?.querySelectorAll('.curation-note-writing').forEach(field=>field.classList.remove('curation-note-writing'));
}
function applyPodcastStateV5(index,{time,completed=false,play=false,persist=true}={}){
  const cue=podcastCueMetaV5[Math.max(0,Math.min(podcastCueMetaV5.length-1,Number(index)||0))];
  window.podcastTransactionV5=true;cancelPodcastWritingV5();audio.pause();cueIndex=cue.index;done=!!completed;
  const requested=Number(time),position=Number.isFinite(requested)?Math.max(cue.start,Math.min(cue.end,requested)):cue.start;
  audio.currentTime=position;E('count').textContent=(cueIndex+1)+' / '+cues.length;E('next').disabled=!done;
  notes(cueIndex+(done?1:0));paint();window.podcastTransactionV5=false;
  if(persist)persistPodcastStateV5();
  if(play)audio.play().catch(showAudioFailure);
  return cue;
}
function restorePodcastStateV5(raw){
  const state=raw&&typeof raw==='object'?raw:{};
  const byId=podcastCueMetaV5.findIndex(cue=>cue.id===state.cueId);
  const requested=byId>=0?byId:Number(state.j);
  const time=Number(state.time);
  const valid=Number.isInteger(requested)&&cueStateValidV5(requested,time);
  const index=valid?requested:cueIndexAtTimeV5(time);
  const cue=podcastCueMetaV5[index];
  const repairedTime=Number.isFinite(time)?Math.max(cue.start,Math.min(cue.end,time)):cue.start;
  const completed=valid&&state.done===true&&Math.abs(repairedTime-cue.end)<=.25;
  return applyPodcastStateV5(index,{time:repairedTime,completed,persist:true});
}
function listenV5(index,play=false){return applyPodcastStateV5(index,{play})}
function recordCueTransactionV5(cue){
  const transaction={cueId:cue.id,index:cue.index,audioTime:Number(audio.currentTime.toFixed(3)),endpoint:cue.end,destination:'notes-'+cue.field,text:cue.text};
  window.podcastCueTransactions23.push(transaction);
  document.dispatchEvent(new CustomEvent('curation-cue-transaction',{detail:transaction}));
}
function podcastBoundaryV5(){
  if(!active||audio.paused||done||window.podcastTransactionV5)return;
  const cue=podcastCueMetaV5[cueIndex];if(!cue)return;
  if(!cueStateValidV5(cueIndex,audio.currentTime)&&audio.currentTime<cue.start-.08){applyPodcastStateV5(cueIndex);return}
  if(audio.currentTime+.035<cue.end)return;
  window.podcastTransactionV5=true;audio.pause();audio.currentTime=cue.end;done=true;cancelPodcastWritingV5();notes(cue.index);recordCueTransactionV5(cue);
  const field=podcastFieldV4(fieldIds[cue.index]);let count=0;
  if(!cue.text||!field){notes(cue.index+1);E('next').disabled=false;paint();window.podcastTransactionV5=false;persistPodcastStateV5();return}
  field.classList.add('curation-note-writing');
  typing=setInterval(()=>{
    count+=2;notes(cue.index,cue.text.slice(0,count));
    if(count>=cue.text.length){clearInterval(typing);typing=0;notes(cue.index+1);field.classList.remove('curation-note-writing');E('next').disabled=false;window.podcastTransactionV5=false;paint();persistPodcastStateV5()}
  },25);
  paint();
}
function activatePodcastV5(){
  const state=read23Record('cur23-audioState');
  restorePodcastStateV5(Object.keys(state).length?state:{j:cueIndex,time:podcastCueMetaV5[cueIndex]?.start||426,done:false});
  enhancePodcastSheet23();
}

// Replace every legacy entry point with the same controller.
const paintBeforePodcastV5=paint;
paint=function(){paintBeforePodcastV5();const elapsed=Math.max(0,audio.currentTime-426),duration=838.79-426;E('time').textContent=tstr(elapsed)+' / '+tstr(duration);[...E('ticks').children].forEach((pin,index)=>pin.classList.toggle('is-heard',podcastCueMetaV5[index].end<=audio.currentTime+.06))};
listen=listenV5;
boundary=podcastBoundaryV5;
podcastBoundary23V4=podcastBoundaryV5;
audio.ontimeupdate=()=>{podcastBoundaryV5();paint()};
audio.onplay=()=>{E('play').textContent='Ⅱ';E('play').setAttribute('aria-label','暫停錄音')};
audio.onpause=()=>{E('play').textContent='▶';E('play').setAttribute('aria-label','播放錄音');persistPodcastStateV5()};
E('play').onclick=()=>{if(done)listenV5(cueIndex,true);else if(audio.paused)audio.play().catch(showAudioFailure);else audio.pause()};
E('seek').oninput=event=>{const time=Number(event.target.value),index=cueIndexAtTimeV5(time);applyPodcastStateV5(index,{time});};
[...E('ticks').children].forEach((pin,index)=>{pin.onclick=()=>listenV5(index,true)});
panel.dataset.podcastArchitecture='v5-single-owner';scriptWindow.dataset.podcastArchitecture='v5-single-owner';
modernizePodcastChromeV4();
panel.classList.remove('curation-player-speed');
const playerTitle=panel.querySelector('.curation-player-title'),playerTimeline=panel.querySelector('.curation-player-timeline');
let playerSpeed=E('rate').closest('label.curation-player-speed');if(!playerSpeed){playerSpeed=document.createElement('label');playerSpeed.className='curation-player-speed';playerSpeed.append('速度 ',E('rate'))}
panel.append(playerTitle,E('play'),E('pins'),playerTimeline,E('time'),playerSpeed,E('audio-status'),E('audio-retry'),E('transcript-toggle'));
E('pins').textContent=E('ticks').hidden?'顯示停頓點':'隱藏停頓點';E('pins').setAttribute('aria-pressed',String(!E('ticks').hidden));
E('transcript-toggle').hidden=true;
const transcriptHead=scriptWindow.querySelector('.curation-transcript-window-head'),translate=E('transcript-translate');
if(transcriptHead&&!transcriptHead.querySelector('strong')){const title=document.createElement('strong'),help=document.createElement('span');title.textContent='錄音稿 · 自由捲動';help.textContent='拖曳移動 · 四角調整大小';transcriptHead.replaceChildren(title,translate,help)}
translate.textContent='中文對照';translate.onclick=()=>{const show=scriptWindow.classList.toggle('show-translation');translate.setAttribute('aria-pressed',String(show));translate.textContent=show?'隱藏中文':'中文對照'};
paint();
if(active)activatePodcastV5();
