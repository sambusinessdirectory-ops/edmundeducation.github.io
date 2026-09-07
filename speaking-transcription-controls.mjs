import {LocalEnglishTranscriber,loadEnglishModel} from './speaking-local-transcription.mjs';
let enabled=false,generation=0,current=null,displayed=null;
function paint(){const value=displayed?displayed.text+(displayed.partial?' '+displayed.partial:''):'';document.querySelectorAll('[data-local-transcript]').forEach(n=>{if(n.textContent!==value)n.textContent=value;});}
function status(message){document.querySelectorAll('[data-transcription-status]').forEach(n=>n.textContent=message);}
function syncControls(){document.querySelectorAll('[data-transcription-control] input').forEach(n=>n.checked=enabled);}
function finish(session){
 if(!session)return Promise.resolve();
 if(session.finishing)return session.finishing;
 session.finishing=(async()=>{try{await session.ready;await session.engine.stop();}catch{}session.partial='';if(displayed===session)paint();try{if(session.text)localStorage.setItem('edmund-transcript:'+session.owner+':'+session.key,JSON.stringify({text:session.text,at:Date.now()}));}catch{}})();
 return session.finishing;
}
window.EdmundSpeakingTranscription={
 async start(stream,key){
  if(!enabled)return;
  const ticket=++generation,previous=current;current=null;await finish(previous);
  if(ticket!==generation||!enabled)return;
  const session={engine:new LocalEnglishTranscriber(),text:'',partial:'',key,owner:window.EdmundSystemNav?.getStudentSession?.()?.id||'guest'};
  current=displayed=session;paint();session.ready=session.engine.start(stream);
  try{await session.ready;if(ticket!==generation||current!==session){await finish(session);return;}
   session.engine.target((words,interim)=>{if(interim)session.partial=words;else{session.text+=(session.text?' ':'')+words;session.partial='';}if(displayed===session)paint();});
  }catch(error){if(current===session){current=null;status(error.message);}}
 },
 pause(value){if(current)current.engine.paused=value;},
 async stop(){++generation;const session=current;current=null;await finish(session);}
};
function mount(){
 for(const recorder of document.querySelectorAll('.recorder-card,.exam-answer-recorder,.exam-mode-panel,[data-recording-preview]')){
  const host=recorder.matches('[data-recording-preview]')?recorder.parentElement:recorder;
  if(host.querySelector('[data-transcription-control]'))continue;
  const section=document.createElement('section');section.dataset.transcriptionControl='';
  section.innerHTML=`<label><input type="checkbox" ${enabled?'checked':''}> English transcription · 英文即時字幕（離線辨識）</label><p data-transcription-status>First use downloads a 40 MB English package. Speech stays on this device. 首次下載約 40 MB。</p><p data-local-transcript style="white-space:pre-wrap"></p>`;
  host.append(section);
  section.querySelector('input').onchange=async e=>{
   enabled=e.target.checked;syncControls();
   if(!enabled){await window.EdmundSpeakingTranscription.stop();status('Transcription off · 字幕已關閉。');return;}
   status('Loading English package… 載入中…');
   try{await loadEnglishModel();if(!enabled)return;status('Ready · 錄音時將即時顯示英文字幕。');if(window.EdmundSpeakingRecordingStream?.active)await window.EdmundSpeakingTranscription.start(window.EdmundSpeakingRecordingStream,window.EdmundSpeakingRecordingKey||'exam');}
   catch(error){enabled=false;syncControls();status(error.message);}
  };
 }
 paint();
}
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}).observe(document.body,{childList:true,subtree:true});mount();
