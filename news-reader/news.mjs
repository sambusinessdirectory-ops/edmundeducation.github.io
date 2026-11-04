const $ = id => document.getElementById(id);
const audio = $('audio');
const rate = $('rate');
const storageKey = 'edmund-news-reader-student-v1';
const rates = [.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3];
for (const value of rates) rate.add(new Option(value+'×',value));
rate.value = '1';
let lesson, mediaKey, audioUrl, player, sessionTimer, audioRequest;
let generation = 0, videoAttempt = 0, mode = 'audio', frame, lastCue, activeHits = '', prepared = false;
let studentToken = '', modeId = 'A2', answers = new Map(), positions = {};
const fmt = time => Math.floor(time/60)+':'+String(Math.floor(time%60)).padStart(2,'0');
function view(id){for(const name of ['gate','library','lesson']) $(name).hidden = name!==id;}
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
  const data=JSON.parse(new TextDecoder().decode(await unpack('lesson',key)));
  if(g!==generation)return;
  lesson=data;mediaKey=key;studentToken=token;sessionStorage.setItem(storageKey,token);
  sessionTimer=setTimeout(()=>logout('學生登入已過期。'),Math.min(2147483647,Math.max(0,Date.parse(row.expires_at)-Date.now())));
  $('user').textContent=row.student_name;$('logout').hidden=false;$('password').value='';
  $('entry').querySelector('strong').textContent=lesson.title;$('entry').querySelector('span').textContent=lesson.zh;
  view('library');
}
function stop(){audio.pause();videoAttempt++;if(player){player.destroy();player=null;}prepared=false;$('videoHost').replaceChildren();cancelAnimationFrame(frame);}
function logout(message=''){
  generation++;stop();clearTimeout(sessionTimer);audio.removeAttribute('src');audio.load();if(audioUrl)URL.revokeObjectURL(audioUrl);
  audioRequest=null;audioUrl=null;studentToken='';lesson=null;mediaKey=null;answers.clear();positions={};
  sessionStorage.removeItem(storageKey);$('user').textContent='';$('logout').hidden=true;
  for(const id of ['wordList','question','en','zh','title','translation','modes'])$(id).replaceChildren();
  $('entry').querySelector('strong').textContent='';$('entry').querySelector('span').textContent='';
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
    audioRequest=unpack('audio',mediaKey).then(bytes=>{if(g!==generation)return;
      audioUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));audio.src=audioUrl;audio.load();
    }).catch(e=>{if(g===generation)audioRequest=null;throw e;});}
  return audioRequest;
}
let api;
function youtube(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(!api){api=new Promise((resolve,reject)=>{
    const s=document.createElement('script'),timer=setTimeout(()=>reject(Error('影片載入逾時')),9000);
    window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);resolve(window.YT);};
    s.onerror=()=>{clearTimeout(timer);reject(Error('未能連接影片服務'));};s.src='https://www.youtube.com/iframe_api';document.head.append(s);
  }).catch(e=>{api=null;throw e;});}
  return api;
}
const clock=()=>mode==='video'&&prepared?player.getCurrentTime():audio.currentTime;
const playing=()=>mode==='video'&&prepared?player.getPlayerState()===1:!audio.paused;
function tabs(){for(const id of ['audio','video'])$(id+'Mode').setAttribute('aria-pressed',String(mode===id));
  $('audioArt').hidden=mode!=='audio';$('videoHost').hidden=mode!=='video';}
async function switchAudio(t=clock(),resume=playing(),message=''){
  const g=generation;stop();mode='audio';tabs();$('mediaStatus').textContent=message;
  try{await loadAudio();if(g!==generation||mode!=='audio'||$('lesson').hidden)return;
    audio.currentTime=t;audio.playbackRate=Number(rate.value);if(resume)await audio.play();
  }catch(e){if(g===generation)$('mediaStatus').textContent='請按播放重試。 '+e.message;}
  if(g===generation)tick();
}
async function switchVideo(){
  const t=clock(),resume=playing();stop();mode='video';tabs();const attempt=videoAttempt;
  $('mediaStatus').textContent='正在連接新聞影片…';
  const backup=message=>{if(attempt===videoAttempt)switchAudio(prepared?clock():t,prepared?playing():resume,message);};
  try{const YT=await youtube();if(attempt!==videoAttempt)return;
    const mount=document.createElement('div');$('videoHost').replaceChildren(mount);
    player=new YT.Player(mount,{videoId:lesson.videoId,playerVars:{playsinline:1,origin:location.origin,rel:0},events:{
      onReady:()=>{if(attempt!==videoAttempt)return;prepared=true;
        if(!player.getAvailablePlaybackRates().includes(Number(rate.value))){backup('影片不支援此速度，已切換到原聲 MP3。');return;}
        player.seekTo(t,true);player.setPlaybackRate(Number(rate.value));if(resume)player.playVideo();$('mediaStatus').textContent='';tick();},
      onStateChange:()=>{if(attempt===videoAttempt&&prepared)tick();},
      onPlaybackRateChange:e=>{if(attempt===videoAttempt&&rates.includes(e.data))rate.value=String(e.data);},
      onError:()=>backup('此影片未能嵌入播放，已切換到原聲 MP3。')
    }});setTimeout(()=>{if(!prepared)backup('影片連接逾時，已切換到原聲 MP3。');},9000);
  }catch{backup('影片服務無法連線，已切換到原聲 MP3。');}
}
function seek(t){
  if(mode==='video'&&prepared)player.seekTo(t,true);else if(audioUrl)audio.currentTime=t;
  tick();
}
$('seek').oninput=e=>seek(Number(e.target.value));
$('play').onclick=async()=>{if(mode==='video'){if(!prepared)return;playing()?player.pauseVideo():player.playVideo();}
  else if(audio.paused){try{await loadAudio();await audio.play();}catch{$('mediaStatus').textContent='請再按一次播放。';}}else audio.pause();};
rate.onchange=()=>{const speed=Number(rate.value);audio.playbackRate=speed;
  if(mode==='video'&&prepared){if(player.getAvailablePlaybackRates().includes(speed))player.setPlaybackRate(speed);
    else switchAudio(clock(),playing(),'已切換到原聲 MP3，以所選速度播放。');}};
$('audioMode').onclick=()=>{if(mode!=='audio')switchAudio();};$('videoMode').onclick=()=>{if(mode!=='video')switchVideo();};
function tick(){
  cancelAnimationFrame(frame);if(!lesson||$('lesson').hidden)return;
  const t=clock(),running=playing();$('time').value=fmt(t);$('seek').value=t;$('play').textContent=running?'暫停':'播放';
  const cue=lesson.captions.find(row=>t>=row[0]&&t<row[1]);
  if(lastCue!==cue){lastCue=cue;$('en').textContent=cue?.[2]||'';$('zh').textContent=cue?.[3]||'';}
  const active=lesson.questions.filter(q=>q.hits?.some(([s,e])=>t>=s&&t<e)).map(q=>q.id).join(' ');
  if(active!==activeHits){activeHits=active;const list=$('wordList');for(const b of list.children){
    const on=active.split(' ').includes(b.dataset.id);b.classList.toggle('active',on);
    if(on){const a=b.getBoundingClientRect(),v=list.getBoundingClientRect();if(a.top<v.top||a.bottom>v.bottom)list.scrollTop+=a.top-v.top-list.clientHeight*.3;}}}
  if(running)frame=requestAnimationFrame(tick);
}
for(const event of ['play','pause','seeked','timeupdate','ended'])audio.addEventListener(event,tick);
function buildWords(){
  const list=$('wordList');list.replaceChildren();
  for(const q of lesson.questions.filter(q=>q.hits)){const b=button('',async()=>{
    const start=q.hits[0][0];if(mode==='video'&&prepared){seek(start);player.playVideo();}
    else await switchAudio(start,true);
  });b.className='term';b.dataset.id=q.id;line(b,q.name,'strong');line(b,q.meaning+(q.hits.length?'':' · 延伸詞彙（錄音未出現）'),'small');b.disabled=!q.hits.length;list.append(b);}
}
const modes=[['A2','基礎詞彙'],['ADV','進階詞彙'],['S','句子結構']];
function practice(){
  $('modes').replaceChildren(...modes.map(([id,name])=>{const b=button(name,()=>{modeId=id;practice();});b.setAttribute('aria-pressed',String(id===modeId));return b;}));
  const qs=lesson.questions.filter(q=>q.id.startsWith(modeId)),i=positions[modeId]||0,q=qs[i],box=$('question'),answer=answers.get(q.id);
  box.replaceChildren();line(box,'第 '+(i+1)+' / '+qs.length+' 題　·　答對 '+qs.filter(x=>answers.get(x.id)===x.answer).length+' 題','small');
  line(box,q.name,'h3');line(box,q.meaning+'　'+q.hint);if(q.phrase)line(box,'報道原句　'+q.phrase);
  line(box,q.prompt);q.choices.forEach((choice,k)=>{const b=button('ABCD'[k]+'. '+choice,()=>{answers.set(q.id,k);practice();});
    b.className='answer';if(answer!==undefined){b.disabled=true;if(k===q.answer)b.classList.add('correct');else if(k===answer)b.classList.add('wrong');}box.append(b);});
  if(answer!==undefined){const f=document.createElement('div');f.className='feedback';f.setAttribute('role','status');line(f,(answer===q.answer?'答對了！':'再看一次。')+' 正確答案：'+'ABCD'[q.answer]);q.why.forEach((v,k)=>line(f,'ABCD'[k]+'　'+v));box.append(f);}
  for(const [label,delta] of [['上一題',-1],['下一題',1]]){const b=button(label,()=>{positions[modeId]=i+delta;practice();});b.disabled=i+delta<0||i+delta>=qs.length;box.append(b);}
  if(answer!==undefined)box.append(button('重做本題',()=>{answers.delete(q.id);practice();}));
}
$('entry').onclick=()=>{if(!studentToken)return;view('lesson');$('title').textContent=lesson.title;$('translation').textContent=lesson.zh;
  buildWords();practice();activeHits='';lastCue=null;mode='audio';tabs();tick();switchVideo();};
$('back').onclick=()=>{stop();view('library');};
