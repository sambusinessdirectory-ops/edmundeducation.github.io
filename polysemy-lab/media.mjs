import {mountRecorder,storeRecording,listRecordings} from './recording.mjs?v=20260928-five-companions1';
import {allQuestionMap,esc} from './core.mjs?v=20260929-polysemy-mass1';
let manifestPromise;
const manifest=()=>manifestPromise||=(Promise.all(['audio.json','audio-new.json'].map(file=>fetch(new URL('./'+file+'?v=20260924-polysemy-audio4',import.meta.url)).then(r=>{if(!r.ok)throw Error();return r.json();}))).then(rows=>Object.assign({},...rows)).catch(e=>{manifestPromise=null;throw e;}));
const clock=seconds=>{const value=Number.isFinite(seconds)?Math.max(0,seconds):0;return `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;};
const speechVoices=[
 {lang:'en-US',names:['Samantha','Ava','Allison','Jenny']},
 {lang:'en-US',names:['Alex','Aaron','Tom','Guy']},
 {lang:'en-GB',names:['Daniel','Oliver','Ryan']},
 {lang:'en-GB',names:['Kate','Serena','Stephanie','Libby']}
];
function speakSentence(q,onend){
 const synth=window.speechSynthesis;if(!synth||!window.SpeechSynthesisUtterance)return false;
 synth.cancel();const index=(q.sentenceIndex??0)%4,recipe=speechVoices[index];
 const utterance=new SpeechSynthesisUtterance(q.en);utterance.lang=recipe.lang;utterance.rate=.94;
 const available=synth.getVoices().filter(v=>v.lang?.toLowerCase().startsWith(recipe.lang.toLowerCase()));
 utterance.voice=recipe.names.map(name=>available.find(v=>v.name.toLowerCase().includes(name.toLowerCase()))).find(Boolean)||available[index%Math.max(available.length,1)]||null;
 utterance.onend=onend;utterance.onerror=onend;synth.speak(utterance);return true;
}
function waveform(seed,count=46){
 let state=[...String(seed||'recording')].reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,2166136261);
 return Array.from({length:count},(_,index)=>{state=(state*1664525+1013904223)>>>0;const envelope=.42+.58*Math.sin(Math.PI*(index+1)/(count+1));const height=Math.max(20,Math.min(95,Math.round((20+(state%76)*envelope)/5)*5));return `<i class="wave-h-${height} wave-d-${index%11}" aria-hidden="true"></i>`;}).join('');
}
export function createMedia({getUser,getModule,getCompanion,rpc}){
 let voice=null,dispose=()=>{},epoch=0,urls=[];
 const questionRecordings=new Map(),recordingLists=new Map();
 const questionKey=(owner,module,question)=>owner+':'+module+':'+question;
 function rememberRecording(item){
  const key=questionKey(item.owner,item.module||'show',item.question);
  const previous=questionRecordings.get(key);
  if(!previous||String(item.at||'')>=String(previous.at||''))questionRecordings.set(key,item);
  try{localStorage.setItem('edmund-polysemy-recorded:'+key,'1');}catch{}
 }
 async function findRecording(owner,module,question){
  const key=questionKey(owner,module,question);
  if(questionRecordings.has(key))return questionRecordings.get(key);
  if(!recordingLists.has(owner))recordingLists.set(owner,(async()=>{
   const token=getUser()?.id===owner?getUser().token:null;if(!token)return;
   const [local,remote]=await Promise.allSettled([listRecordings(owner),rpc('polysemy_lab_modules_recording',{p_token:token,p_action:'list',p_payload:{}})]);
   if(getUser()?.id!==owner)return;
   const merged=new Map();
   if(local.status==='fulfilled')for(const item of local.value)if(item.id)merged.set(item.id,item);
   if(remote.status==='fulfilled')for(const item of remote.value)merged.set(item.id,{...merged.get(item.id),...item,owner,synced:true});
   for(const item of merged.values())rememberRecording({...item,owner});
   if(remote.status==='rejected')recordingLists.delete(owner);
  })());
  await recordingLists.get(owner);
  return questionRecordings.get(key)||null;
 }
 async function restoreRecording(owner,module,question){
  const item=await findRecording(owner,module,question);if(!item||getUser()?.id!==owner)return null;
  if(item.blob)return item;
  const token=getUser().token;
  const data=await rpc('polysemy_lab_modules_recording',{p_token:token,p_action:'get',p_payload:{id:item.id}});
  if(getUser()?.id!==owner)return null;
  const restored={...item,blob:new Blob([Uint8Array.from(atob(data.audio),c=>c.charCodeAt(0))],{type:data.mime})};
  rememberRecording(restored);return restored;
 }

 function suspend(){voice?.pause();window.speechSynthesis?.cancel();document.querySelectorAll('[data-library] audio').forEach(a=>a.pause());dispose();dispose=()=>{};document.querySelectorAll('[data-sentence-media] .recorder').forEach(p=>p.hidden=true);document.querySelectorAll('[data-open-recorder]').forEach(b=>b.hidden=false);}
 function stop(){epoch++;voice?.pause();window.speechSynthesis?.cancel();voice=null;dispose();dispose=()=>{};document.querySelectorAll('[data-library] audio').forEach(a=>a.pause());urls.forEach(u=>URL.revokeObjectURL(u));urls=[];}
 async function upload(item){const user=getUser();if(user?.id!==item.owner)throw Error('請重新登入。');const token=user.token;const audio=await new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.onerror=reject;f.readAsDataURL(item.blob);});await rpc('polysemy_lab_modules_recording',{p_token:token,p_action:'save',p_payload:{id:item.id,module:item.module||'show',question:item.question,mime:item.blob.type.split(';')[0],audio}});item.synced=true;try{await storeRecording(item);}catch{}}
 async function save(blob,question,owner,module){if(blob.size>2097152)throw Error('錄音超過 2 MB，請縮短後再試。');const item={id:crypto.randomUUID(),owner,module,question,blob,at:new Date().toISOString(),synced:false};rememberRecording(item);let cached=false;try{await storeRecording(item);cached=true;}catch{}try{await upload(item);return true;}catch{if(cached)return false;throw Error('未能儲存至帳戶或此裝置，請保持本頁並重試。');}}
 function controls(host,q){const module=getModule().id;const owner=getUser()?.id;if(!owner)return;host.innerHTML='<div class="media-actions"><button data-listen>聽示範</button><button data-open-recorder>錄音朗讀</button></div><p data-audio-status role="status"></p><section class="recorder" hidden></section>';const message=host.querySelector('[data-audio-status]');let playing=false;
 const listen=host.querySelector('[data-listen]');if(!getModule().mass)manifest().then(rows=>{if(host.isConnected&&!rows[q.id]&&!window.speechSynthesis){listen.disabled=true;listen.textContent='示範音訊準備中';}}).catch(()=>{});
 host.querySelector('[data-listen]').onclick=async e=>{if(playing){voice?.pause();window.speechSynthesis?.cancel();playing=false;e.currentTarget.textContent='聽示範';return;}const button=e.currentTarget,gen=epoch;button.disabled=true;message.textContent='正在載入…';try{if(getModule().mass){playing=speakSentence(q,()=>{playing=false;if(host.isConnected)button.textContent='聽示範';});button.textContent=playing?'停止示範':'示範音訊準備中';message.textContent=playing?'':'此裝置沒有可用的朗讀聲音。';return;}const row=(await manifest())[q.id];if(gen!==epoch||getUser()?.id!==owner||!host.isConnected||document.hidden){message.textContent='';return;}if(!row){playing=speakSentence(q,()=>{playing=false;if(host.isConnected)button.textContent='聽示範';});if(!playing){button.textContent='示範音訊準備中';message.textContent='此裝置沒有可用的朗讀聲音。';return;}button.textContent='停止示範';message.textContent='';return;}voice?.pause();voice=new Audio(new URL(row.path,import.meta.url));const clip=voice;clip.onended=()=>{playing=false;button.textContent='聽示範';};clip.onerror=()=>{playing=false;button.textContent='聽示範';message.textContent='音訊未能載入，請再試。';};await clip.play();if(gen!==epoch){clip.pause();return;}playing=true;button.textContent='暫停示範';message.textContent='';}catch{message.textContent='音訊未能載入，請再試。';}finally{button.disabled=false;}};
 host.querySelector('[data-open-recorder]').onclick=e=>{voice?.pause();window.speechSynthesis?.cancel();playing=false;if(!host.querySelector('[data-listen]').disabled)host.querySelector('[data-listen]').textContent='聽示範';const panel=host.querySelector('.recorder');panel.hidden=false;e.currentTarget.hidden=true;dispose=mountRecorder(panel,{key:questionKey(owner,module,q.id),companion:getCompanion(),loadRecording:()=>restoreRecording(owner,module,q.id),onRecorded:blob=>save(blob,q.id,owner,module),onSkip:()=>{dispose();dispose=()=>{};panel.hidden=true;host.querySelector('[data-open-recorder]').hidden=false;}});};
 }
 async function library(host){
  stop();
  const gen=epoch,user=getUser();
  if(!user)return;
  const owner=user.id,token=user.token,module=getModule().id,questions=getModule().questions;
  host.innerHTML=`
   <section class="recording-library-hero">
    <div>
     <p class="eyebrow">YOUR VOICE ARCHIVE</p>
     <h2>我的錄音 <span>My Recordings</span></h2>
     <p>重聽每一次朗讀，留意節奏、清晰度和信心的變化。</p>
    </div>
    <div class="recording-library-hero-actions">
     <span class="recording-count" data-recording-count>0 RECORDINGS</span>
     <button data-reference>返回詞義總覽</button>
    </div>
   </section>
   <form class="panel recording-upload">
    <div class="recording-upload-heading"><span class="recording-upload-icon" aria-hidden="true">＋</span><div><p class="eyebrow">ADD TO YOUR ARCHIVE</p><h3>新增錄音 · Add a recording</h3></div></div>
    <label>${esc(getModule().word)} · 選擇句子<select name="question">${questions.map(q=>`<option value="${q.id}">${esc(q.en)}</option>`).join('')}</select></label>
    <label class="recording-file-label"><span>選擇錄音檔案 · Choose audio</span><small>MP3 · M4A · WAV · WebM · Ogg / 最大 2 MB</small><input type="file" name="audio" accept="audio/webm,audio/mp4,audio/ogg,audio/mpeg,audio/wav,.m4a,.mp3,.wav" required></label>
    <button class="primary recording-save" type="submit">↑ 儲存錄音 · Save recording</button><p role="status"></p>
   </form>
   <p data-library-status role="status" class="recording-library-status">正在載入…</p>
   <div data-recording-list></div>`;

  const form=host.querySelector('form');
  form.onsubmit=async event=>{
   event.preventDefault();
   const data=new FormData(form),file=data.get('audio'),status=form.querySelector('[role=status]'),button=form.querySelector('button');
   button.disabled=true;
   try{
    const extension=file.name.split('.').at(-1).toLowerCase();
    const mime=({'mp3':'audio/mpeg',m4a:'audio/mp4',mp4:'audio/mp4',wav:'audio/wav',webm:'audio/webm',ogg:'audio/ogg'})[extension]||file.type.split(';')[0];
    if(!['audio/mpeg','audio/mp4','audio/wav','audio/webm','audio/ogg'].includes(mime))throw Error('請選擇 MP3、M4A、WAV、WebM 或 Ogg 錄音。');
    status.textContent='正在儲存…';
    const ok=await save(new Blob([file],{type:mime}),data.get('question'),owner,module);
    if(gen!==epoch)return;
    await library(host);
    host.querySelector('form [role=status]').textContent=ok?'已儲存至學生帳戶。':'已保留在此裝置，請重試上傳。';
   }catch(error){
    status.textContent=error?.message||'未能儲存，請重試。';
   }finally{
    button.disabled=false;
   }
  };

  let local=[],remote=[],failed=false;
  try{local=await listRecordings(owner);}catch{}
  try{remote=await rpc('polysemy_lab_modules_recording',{p_token:token,p_action:'list',p_payload:{}});}catch{failed=true;}
  if(epoch!==gen||getUser()?.id!==owner)return;
  const items=new Map(local.map(row=>[row.id,row]));
  for(const row of remote)items.set(row.id,{...items.get(row.id),...row,synced:true});
  const entries=[...items.values()].sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));
  const list=host.querySelector('[data-recording-list]');
  host.querySelector('[data-recording-count]').textContent=`${entries.length} ${entries.length===1?'RECORDING':'RECORDINGS'}`;
  host.querySelector('[data-library-status]').textContent=failed?'雲端暫未能連線，以下是此裝置的錄音。':entries.length?'':'尚未有錄音。可以在練習題按「錄音朗讀」。';

  entries.forEach((item,index)=>{
   const question=allQuestionMap.get(item.question);
   const sentence=question?.en||'朗讀記錄';
   const word=question?.word||item.module||'show';
   const created=item.at?new Date(item.at):null;
   const when=created&&!Number.isNaN(created.valueOf())?created.toLocaleString('zh-HK',{dateStyle:'medium',timeStyle:'short'}):'較早的錄音';
   const mime=(item.mime||item.blob?.type||'').split(';')[0];
   const extension=({'audio/mp4':'m4a','audio/mpeg':'mp3','audio/wav':'wav','audio/ogg':'ogg'})[mime]||'webm';
   const box=document.createElement('article');
   box.className=`panel recording-item recording-index-${Math.min(index,8)}`;
   box.innerHTML=`
    <div class="recording-card-heading">
     <span class="recording-sequence">REC ${String(index+1).padStart(3,'0')}</span>
     <span class="recording-storage-status ${item.synced?'is-synced':'is-local'}">${item.synced?'● ACCOUNT COPY':'● DEVICE COPY'}</span>
    </div>
    <h3 lang="en">${esc(sentence)}</h3>
    <p class="recording-meta"><strong>${esc(word)}</strong><span aria-hidden="true">•</span><time>${esc(when)}</time></p>
    <div class="recording-player">
     <div class="recording-waveform" data-waveform>${waveform(item.id||item.question)}<input data-seek type="range" min="0" max="1000" value="0" disabled aria-label="錄音播放位置 · Recording position"></div>
     <div class="recording-time"><span data-current-time>0:00</span><span data-total-time>—:—</span></div>
     <div class="recording-controls">
      <button class="recording-skip" type="button" data-skip="-5" aria-label="倒退 5 秒"><span aria-hidden="true">↶</span><small>5</small></button>
      <button class="recording-play" type="button" data-play aria-label="播放錄音 · Play recording"><span data-play-icon aria-hidden="true">▶</span></button>
      <button class="recording-skip" type="button" data-skip="5" aria-label="前進 5 秒"><small>5</small><span aria-hidden="true">↷</span></button>
     </div>
    </div>
    <audio hidden preload="metadata"></audio>
    <div class="recording-card-footer">
     <p role="status" aria-live="polite"></p>
     <a hidden download="${esc(item.module||'show')}-recording.${extension}">↓ 下載錄音 · Download</a>
     ${!item.synced?'<button class="recording-upload-retry" type="button" data-upload>↥ 重試上傳</button>':''}
    </div>`;
   list.append(box);

   const status=box.querySelector('[role=status]');
   const player=box.querySelector('audio');
   const playButton=box.querySelector('[data-play]');
   const playIcon=box.querySelector('[data-play-icon]');
   const seek=box.querySelector('[data-seek]');
   const bars=[...box.querySelectorAll('[data-waveform] i')];
   const currentTime=box.querySelector('[data-current-time]');
   const totalTime=box.querySelector('[data-total-time]');
   const link=box.querySelector('a[download]');
   let blob=item.blob||null;

   function paint(){
    const duration=Number.isFinite(player.duration)&&player.duration>0?player.duration:0;
    const ratio=duration?Math.min(1,player.currentTime/duration):0;
    currentTime.textContent=clock(player.currentTime);
    totalTime.textContent=duration?clock(duration):'—:—';
    seek.value=String(Math.round(ratio*1000));
    bars.forEach((bar,barIndex)=>bar.classList.toggle('is-past',ratio>=(barIndex+1)/bars.length));
   }
   function setPlaying(playing){
    box.classList.toggle('is-playing',playing);
    playIcon.textContent=playing?'❚❚':'▶';
    playButton.setAttribute('aria-label',playing?'暫停錄音 · Pause recording':'播放錄音 · Play recording');
   }
   async function prepare(){
    if(player.src)return player;
    status.textContent='正在載入錄音…';
    if(!blob){
     const data=await rpc('polysemy_lab_modules_recording',{p_token:token,p_action:'get',p_payload:{id:item.id}});
     blob=new Blob([Uint8Array.from(atob(data.audio),character=>character.charCodeAt(0))],{type:data.mime});
    }
    if(gen!==epoch||getUser()?.id!==owner)return null;
    const url=URL.createObjectURL(blob);
    urls.push(url);
    player.src=url;
    link.href=url;
    link.hidden=false;
    seek.disabled=false;
    if(player.readyState<1)await new Promise((resolve,reject)=>{
     player.addEventListener('loadedmetadata',resolve,{once:true});
     player.addEventListener('error',()=>reject(Error('Audio metadata failed')),{once:true});
    });
    paint();
    status.textContent='';
    return player;
   }

   player.addEventListener('play',()=>setPlaying(true));
   player.addEventListener('pause',()=>setPlaying(false));
   player.addEventListener('ended',()=>{setPlaying(false);paint();});
   player.addEventListener('timeupdate',paint);
   player.addEventListener('loadedmetadata',paint);

   playButton.onclick=async()=>{
    if(!player.paused){player.pause();return;}
    playButton.disabled=true;
    try{
     const ready=await prepare();
     if(!ready)return;
     host.querySelectorAll('audio').forEach(audio=>{if(audio!==player)audio.pause();});
     await player.play();
     status.textContent='';
    }catch{
     setPlaying(false);
     status.textContent='未能播放，請重試。';
    }finally{
     playButton.disabled=false;
    }
   };
   seek.oninput=()=>{
    if(!Number.isFinite(player.duration))return;
    player.currentTime=player.duration*Number(seek.value)/1000;
    paint();
   };
   box.querySelectorAll('[data-skip]').forEach(button=>button.onclick=async()=>{
    try{
     const ready=await prepare();
     if(!ready)return;
     const duration=Number.isFinite(player.duration)?player.duration:0;
     player.currentTime=Math.max(0,Math.min(duration,player.currentTime+Number(button.dataset.skip)));
     paint();
    }catch{
     status.textContent='未能載入錄音，請重試。';
    }
   });

   const retry=box.querySelector('[data-upload]');
   if(retry)retry.onclick=async()=>{
    retry.disabled=true;
    try{
     await upload(item);
     if(gen===epoch)await library(host);
    }catch{
     status.textContent='未能上傳，裝置副本仍然保留。';
     retry.disabled=false;
    }
   };
  });
 }

 return {stop,suspend,controls,library};
}
