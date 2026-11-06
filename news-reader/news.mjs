import {clearListening,renderListening} from './listening.mjs?v=smoking-20261106-1';
import {vocabularyGroups} from './vocabulary.mjs?v=vocab-levels-20261106-1';
const $ = id => document.getElementById(id);
const audio = $('audio');
const video = $('video');
const rate = $('rate');
const storageKey = 'edmund-news-reader-student-v1';
const rates = [.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3];
for (const value of rates) rate.add(new Option(value+'×',value));
rate.value = '1';
let lesson, mediaKey, audioUrl, audioPack='audio', sessionTimer, audioRequest, transitionTimer;
let generation = 0, mode = 'video', frame, lastCue, activeHits = '';
let clipEnd = null;
let studentToken = '', modeId = 'L', answers = new Map(), positions = {};
const fmt = time => Math.floor(time/60)+':'+String(Math.floor(time%60)).padStart(2,'0');
function view(id){
  for(const name of ['gate','library','lesson']){
    const stage=$(name);stage.hidden=name!==id;stage.classList.remove('stage-enter');
  }
  const target=$(id);void target.offsetWidth;target.classList.add('stage-enter');
  document.body.classList.remove('page-bridge');void document.body.offsetWidth;document.body.classList.add('page-bridge');
  clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>document.body.classList.remove('page-bridge'),540);
}
function button(text,action){const b=document.createElement('button');b.textContent=text;b.onclick=action;return b;}
function line(parent,text,tag='p'){const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;}
async function rpc(name,args){
  const {url,anonKey}=window.EDMUND_SUPABASE;
  const response=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:anonKey,'Content-Type':'application/json'},body:JSON.stringify(args),cache:'no-store'});
  if(!response.ok) throw Error('無法驗證學生帳戶，請檢查登入資料或稍後再試。');
  return (await response.json())[0];
}
async function unpack(name,key){
  const r=await fetch('/news-reader/'+name+'.bin');if(!r.ok)throw Error('教材載入失敗，請重新登入再試。');
  const data=new Uint8Array(await r.arrayBuffer());
  return crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(0,12)},key,data.slice(12));
}
async function enter(token,g){
  const row=await rpc('news_reader_student_publication',{p_student_token:token});
  if(!row?.content_key)throw Error('學生登入已過期，請重新登入。');
  const key=await crypto.subtle.importKey('raw',Uint8Array.from(row.content_key.match(/../g),x=>parseInt(x,16)),{name:'AES-GCM'},false,['decrypt']);
  if(g!==generation)return;
  mediaKey=key;studentToken=token;sessionStorage.setItem(storageKey,token);
  sessionTimer=setTimeout(()=>logout('學生登入已過期。'),Math.min(2147483647,Math.max(0,Date.parse(row.expires_at)-Date.now())));
  $('user').textContent=row.student_name;$('logout').hidden=false;$('password').value='';
  view('library');
}
function stop(){clipEnd=null;audio.pause();video.pause();cancelAnimationFrame(frame);}
function logout(message=''){
  generation++;stop();clearTimeout(sessionTimer);audio.removeAttribute('src');audio.load();video.currentTime=0;if(audioUrl)URL.revokeObjectURL(audioUrl);
  audioRequest=null;audioUrl=null;audioPack='audio';studentToken='';lesson=null;mediaKey=null;answers.clear();clearListening();modeId='L';positions={};
  sessionStorage.removeItem(storageKey);$('user').textContent='';$('logout').hidden=true;
  for(const id of ['wordList','question','en','zh','title','translation','modes'])$(id).replaceChildren();
  view('gate');$('loginStatus').textContent=message;
}
$('logout').onclick=()=>{window.EdmundSystemNav?.forgetStudentSession?.();logout();};
$('login').onsubmit=async event=>{
  event.preventDefault();const g=++generation;$('loginStatus').textContent='正在驗證…';
  try{const user=await rpc('flashcard_student_login',{p_name:$('username').value.trim(),p_password:$('password').value});
    if(!user?.session_token)throw Error('學生帳戶或密碼不正確。');
    await enter(user.session_token,g);
    if(g===generation)window.EdmundSystemNav?.rememberStudentSession?.({id:user.id,name:user.name,role:'student',token:user.session_token});
  }catch(e){if(g===generation)$('loginStatus').textContent=e.message;}
};
const saved=sessionStorage.getItem(storageKey)||window.EdmundSystemNav?.getStudentSession?.()?.token;
if(saved){const g=++generation;enter(saved,g).catch(e=>{if(g===generation)logout(e.message);});}
async function loadAudio(){
  if(audioUrl)return;
  if(!audioRequest){const g=generation;
    audioRequest=unpack(audioPack,mediaKey).then(bytes=>{if(g!==generation)return;
      audioUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));audio.src=audioUrl;audio.load();
    }).catch(e=>{if(g===generation)audioRequest=null;throw e;});}
  return audioRequest;
}
const clock=()=>mode==='video'?video.currentTime:audio.currentTime;
const playing=()=>mode==='video'?!video.paused:!audio.paused;
function tabs(){for(const id of ['audio','video'])$(id+'Mode').setAttribute('aria-pressed',String(mode===id));
  $('audioArt').hidden=mode!=='audio';video.hidden=mode!=='video';}
async function switchAudio(t=clock(),resume=playing(),message='',end=null){
  const g=generation;stop();clipEnd=end;mode='audio';tabs();$('mediaStatus').textContent=message;
  try{await loadAudio();if(g!==generation||mode!=='audio'||$('lesson').hidden)return;
    audio.currentTime=t;audio.playbackRate=Number(rate.value);if(resume)await audio.play();
  }catch(e){if(g===generation)$('mediaStatus').textContent='請按播放重試。 '+e.message;}
  if(g===generation)tick();
}
async function switchVideo(t=clock(),resume=playing()){
  stop();mode='video';tabs();video.currentTime=Math.min(t,Number.isFinite(video.duration)?video.duration:t);
  video.playbackRate=Number(rate.value);$('mediaStatus').textContent='';
  if(resume){try{await video.play();}catch{$('mediaStatus').textContent='請按播放開始本地新聞影片。';}}
  tick();
}
function seek(t){
  clipEnd=null;
  if(mode==='video')video.currentTime=t;else if(audioUrl)audio.currentTime=t;
  tick();
}
$('seek').oninput=e=>seek(Number(e.target.value));
$('play').onclick=async()=>{if(mode==='video'){if(video.paused){try{await video.play();}catch{$('mediaStatus').textContent='請再按一次播放。';}}else video.pause();}
  else if(audio.paused){try{await loadAudio();await audio.play();}catch{$('mediaStatus').textContent='請再按一次播放。';}}else audio.pause();};
rate.onchange=()=>{const speed=Number(rate.value);audio.playbackRate=speed;
  video.playbackRate=speed;};
$('audioMode').onclick=()=>{if(mode!=='audio')switchAudio();};$('videoMode').onclick=()=>{if(mode!=='video')switchVideo();};
function tick(){
  cancelAnimationFrame(frame);if(!lesson||$('lesson').hidden)return;
  const t=clock();
  if(mode==='audio'&&clipEnd!==null&&t>=clipEnd){const end=clipEnd;clipEnd=null;audio.pause();audio.currentTime=end;}
  const running=playing();$('time').value=fmt(t);$('seek').value=t;$('play').textContent=running?'暫停':'播放';
  const cue=lesson.captions.find(row=>t>=row[0]&&t<row[1]);
  if(lastCue!==cue){lastCue=cue;$('en').textContent=cue?.[2]||'';$('zh').textContent=cue?.[3]||'';}
  const active=lesson.questions.filter(q=>q.hits?.some(([s,e])=>t>=s&&t<e)).map(q=>q.id).join(' ');
  if(active!==activeHits){activeHits=active;const list=$('wordList');for(const b of list.querySelectorAll('.term')){
    const on=active.split(' ').includes(b.dataset.id);b.classList.toggle('active',on);
    if(on){const a=b.getBoundingClientRect(),v=list.getBoundingClientRect();if(a.top<v.top||a.bottom>v.bottom)list.scrollTop+=a.top-v.top-list.clientHeight*.3;}}}
  if(running)frame=requestAnimationFrame(tick);
}
for(const event of ['play','pause','seeked','timeupdate','ended'])audio.addEventListener(event,tick);
for(const event of ['play','pause','seeked','timeupdate','ended'])video.addEventListener(event,tick);
video.addEventListener('loadedmetadata',()=>{if(Number.isFinite(video.duration))$('seek').max=String(video.duration);});
video.addEventListener('error',()=>{if(mode==='video')switchAudio(video.currentTime,false,'本地影片暫時未能載入，已切換到原聲 MP3。');});
function buildWords(){
  const list=$('wordList');list.replaceChildren();
  for(const [,items] of vocabularyGroups(lesson.questions)){
    for(const q of items){const hits=Array.isArray(q.hits)?q.hits:[],b=button('',async()=>{
      const start=hits[0][0];if(mode==='video'){seek(start);await video.play();}
      else await switchAudio(start,true);
    });b.className='term';b.dataset.id=q.id;line(b,q.name,'strong');line(b,q.meaning+(hits.length?'':' · 延伸詞彙（錄音未出現）'),'small');
      if(q.phrase){const context=line(b,'新聞語境：'+q.phrase,'small');context.className='context';}
      b.disabled=!hits.length;list.append(b);}
  }
}
const modes=[['L','聽力理解'],['A2','A2 詞彙'],['ADV','進階詞彙'],['S','句子結構']];
function practice(){
  $('modes').replaceChildren(...modes.map(([id,name])=>{const b=button(name,()=>{modeId=id;practice();});b.setAttribute('aria-pressed',String(id===modeId));return b;}));
  if(modeId==='L'){
    renderListening($('question'),lesson.listening,positions.L||0,i=>{if(clipEnd!==null){audio.pause();clipEnd=null;}positions.L=i;practice();},(start,end)=>switchAudio(start,true,'正在播放本題錄音片段。',end));
    return;
  }
  const qs=lesson.questions.filter(q=>q.id.startsWith(modeId)&&q.quiz!==false),i=positions[modeId]||0,q=qs[i],box=$('question'),answer=answers.get(q.id);
  box.replaceChildren();line(box,'第 '+(i+1)+' / '+qs.length+' 題　·　答對 '+qs.filter(x=>answers.get(x.id)===x.answer).length+' 題','small');
  line(box,q.name,'h3');line(box,q.meaning+'　'+q.hint);if(q.phrase)line(box,'報道原句　'+q.phrase);
  line(box,q.prompt);q.choices.forEach((choice,k)=>{const b=button('ABCD'[k]+'. '+choice,()=>{answers.set(q.id,k);practice();});
    b.className='answer';if(answer!==undefined){b.disabled=true;if(k===q.answer)b.classList.add('correct');else if(k===answer)b.classList.add('wrong');}box.append(b);});
  if(answer!==undefined){const f=document.createElement('div');f.className='feedback';f.setAttribute('role','status');line(f,(answer===q.answer?'答對了！':'再看一次。')+' 正確答案：'+'ABCD'[q.answer]);q.why.forEach((v,k)=>line(f,'ABCD'[k]+'　'+v));box.append(f);}
  for(const [label,delta] of [['上一題',-1],['下一題',1]]){const b=button(label,()=>{positions[modeId]=i+delta;practice();});b.disabled=i+delta<0||i+delta>=qs.length;box.append(b);}
  if(answer!==undefined)box.append(button('重做本題',()=>{answers.delete(q.id);practice();}));
}
for(const entry of document.querySelectorAll('[data-lesson-pack]'))entry.onclick=async()=>{
  if(!studentToken||!mediaKey)return;
  const g=generation,pack=entry.dataset.lessonPack;
  $('libraryStatus').textContent='正在開啟教材…';entry.setAttribute('aria-busy','true');
  try{
    const data=JSON.parse(new TextDecoder().decode(await unpack(pack,mediaKey)));
    if(g!==generation)return;
    stop();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;audioRequest=null;audio.removeAttribute('src');audio.load();
    lesson=data;audioPack=data.media?.audioPack||entry.dataset.audioPack||'audio';answers.clear();clearListening();modeId='L';positions={};
    const source=$('videoSource');source.src=data.media?.video||entry.dataset.video;video.poster=data.media?.poster||entry.dataset.poster||'';video.load();
    $('seek').max=String(data.media?.duration||321);$('lessonKicker').textContent=entry.querySelector('small')?.textContent||'NEWS ENGLISH　/　LESSON';
    view('lesson');$('title').textContent=lesson.title;$('translation').textContent=lesson.zh;
    buildWords();practice();activeHits='';lastCue=null;mode='video';tabs();video.currentTime=0;tick();switchVideo(0,false);
    $('libraryStatus').textContent='';
  }catch(error){if(g===generation)$('libraryStatus').textContent='教材未能開啟。'+error.message;}
  finally{entry.removeAttribute('aria-busy');}
};
$('jumpListening').onclick=()=>{modeId='L';practice();};
$('back').onclick=()=>{stop();view('library');};
