import {escapeHtml as e} from './learning-hub-client.mjs';

let library, audio, activeTrack, dialog;
let activeGenre = '';
const mounts = new Set();

function ensureStyles(){
  if(document.querySelector('link[data-background-music-player-style]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('./background-music-player.css?v=20260910-cinematic1',import.meta.url).href;
  link.dataset.backgroundMusicPlayerStyle='';
  document.head.append(link);
}
async function tracks(){
  if(!library){
    const response=await fetch(new URL('./background-music-catalog.json?v=20260910-five-per-genre',import.meta.url));
    if(!response.ok) throw Error('Music library could not load');
    library=await response.json();
  }
  return library.tracks;
}
const clock=(seconds)=>{seconds=Number.isFinite(seconds)?Math.max(0,Math.floor(seconds)):0;return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
const genres=(rows)=>[...new Set(rows.map(row=>row.genre))];
const rowKey=(row)=>row.catalogId||(row.id+'-'+row.genre);

function playerMarkup(rows,genre){
  const genreRows=genres(rows).map(name=>{
    const first=rows.find(row=>row.genre===name);
    return '<button type="button" class="music-genre-card'+(name===genre?' is-active':'')+'" data-genre-card="'+e(name)+'" aria-pressed="'+(name===genre)+'"><img src="'+e(first.art)+'" alt=""><span>'+e(name)+'</span><small>5 tracks · 5 首</small></button>';
  }).join('');
  return '<section class="music-player" data-music-player>'+
    '<header class="music-player-heading"><div><p>EDMUND STUDY SOUND</p><h2>Background Music <span>背景音樂</span></h2></div><button type="button" data-window aria-label="Open separate player">↗ <span>Open player</span></button></header>'+
    '<div class="music-genre-rail" data-genre-rail>'+genreRows+'</div>'+
    '<div class="music-player-stage"><div class="music-now-playing"><div class="music-disc" data-disc><img data-art alt=""><span aria-hidden="true"></span></div>'+
    '<div class="music-track-copy"><small data-genre-label></small><h3 data-title>Select a track</h3><p data-artist></p><div class="music-tempo"><strong data-bpm>— BPM</strong><span>Estimated tempo · 預計節奏</span></div></div></div>'+
    '<div class="music-controls"><div class="music-progress"><time data-current>0:00</time><input data-seek type="range" min="0" max="1" step="0.1" value="0" aria-label="Track progress"><time data-duration>0:00</time></div>'+
    '<div class="music-transport"><button type="button" data-shuffle aria-label="Shuffle">⌘</button><button type="button" data-previous aria-label="Previous track">|‹</button><button type="button" class="music-play" data-play aria-label="Play">▶</button><button type="button" data-next aria-label="Next track">›|</button><button type="button" data-repeat aria-label="Repeat" aria-pressed="false">↻</button></div>'+
    '<label class="music-volume"><span>Volume · 音量</span><input data-volume type="range" min="0" max="1" step=".05" value=".25"></label></div>'+
    '<aside class="music-queue"><div><p>UP NEXT · 接下來</p><strong data-queue-title>'+e(genre)+'</strong></div><div data-track-list></div></aside></div>'+
    '<footer class="music-credit"><p data-credit></p><p role="status" aria-live="polite"></p></footer></section>';
}
function setupAudio(){
  if(audio) return audio;
  audio=new Audio();audio.preload='metadata';audio.volume=.25;
  ['timeupdate','loadedmetadata','play','pause'].forEach(name=>audio.addEventListener(name,syncMounts));
  audio.addEventListener('ended',()=>audio.loop?(audio.currentTime=0,audio.play().catch(()=>{})):playOffset(1));
  return audio;
}
function syncMounts(){
  for(const root of mounts){
    if(!root.isConnected){mounts.delete(root);continue;}
    const seek=root.querySelector('[data-seek]');if(seek){seek.max=Number.isFinite(audio?.duration)?audio.duration:1;seek.value=audio?.currentTime||0;}
    const current=root.querySelector('[data-current]');if(current)current.textContent=clock(audio?.currentTime||0);
    const duration=root.querySelector('[data-duration]');if(duration)duration.textContent=clock(audio?.duration||0);
    const play=root.querySelector('[data-play]');if(play){play.textContent=audio&&!audio.paused?'❚❚':'▶';play.setAttribute('aria-label',audio&&!audio.paused?'Pause':'Play');}
    root.querySelector('[data-disc]')?.classList.toggle('is-playing',Boolean(audio&&!audio.paused));
  }
}
function setStatus(message=''){for(const root of mounts){const node=root.querySelector('[role=status]');if(node)node.textContent=message;}}
async function setTrack(row,{autoplay=false}={}){
  if(!row)return;setupAudio();activeTrack=row;activeGenre=row.genre;
  const resolved=new URL(row.src,location.href).href;if(audio.src!==resolved){audio.src=row.src;audio.load();}
  await renderAll();if(autoplay)try{await audio.play();}catch(error){setStatus(error.message);}
}
function renderRoot(root,rows){
  if(!activeGenre)activeGenre=rows[0]?.genre||'';
  const list=rows.filter(row=>row.genre===activeGenre);
  if(!activeTrack||activeTrack.genre!==activeGenre)activeTrack=list[0]||null;
  root.querySelectorAll('[data-genre-card]').forEach(button=>{const on=button.dataset.genreCard===activeGenre;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));});
  const art=root.querySelector('[data-art]');if(art&&activeTrack){art.src=activeTrack.art;art.alt=activeTrack.genre+' artwork';}
  root.querySelector('[data-genre-label]').textContent=activeTrack?(activeTrack.genre+' · INSTRUMENTAL'):'';
  root.querySelector('[data-title]').textContent=activeTrack?.title||'No track available';
  root.querySelector('[data-artist]').textContent=activeTrack?.artist||'';
  root.querySelector('[data-bpm]').textContent=activeTrack?.bpm?('≈ '+activeTrack.bpm+' BPM'):'— BPM';
  root.querySelector('[data-queue-title]').textContent=activeGenre+' · '+list.length+' tracks';
  root.querySelector('[data-track-list]').innerHTML=list.map((row,index)=>'<button type="button" class="music-track-card'+(rowKey(row)===rowKey(activeTrack)?' is-active':'')+'" data-track-card="'+e(rowKey(row))+'"><img src="'+e(row.art)+'" alt=""><span><strong>'+e(row.title)+'</strong><small>'+e(row.artist)+' · ≈ '+(row.bpm||'—')+' BPM</small></span><b>'+String(index+1).padStart(2,'0')+'</b></button>').join('');
  root.querySelector('[data-credit]').innerHTML=activeTrack?(e(activeTrack.title)+' · '+e(activeTrack.artist)+' · <a target="_blank" rel="noopener" href="'+e(activeTrack.sourceUrl)+'">Free Music Archive</a> · <a target="_blank" rel="noopener" href="'+e(activeTrack.licenseUrl)+'">'+e(activeTrack.license)+'</a>. BPM is an approximate listening guide.'):'';
  syncMounts();
}
async function renderAll(){const rows=await tracks();for(const root of mounts)if(root.isConnected)renderRoot(root,rows);}
async function playOffset(offset){const rows=await tracks(),list=rows.filter(row=>row.genre===activeGenre);if(!list.length)return;let index=Math.max(0,list.findIndex(row=>rowKey(row)===rowKey(activeTrack)));index=(index+offset+list.length)%list.length;await setTrack(list[index],{autoplay:true});}

export async function mountMusic(root){
  ensureStyles();const rows=await tracks();setupAudio();mounts.add(root);const initialGenre=activeGenre||rows[0]?.genre||'';
  root.innerHTML=playerMarkup(rows,initialGenre);if(!activeTrack)activeTrack=rows.find(row=>row.genre===initialGenre)||rows[0];
  root.addEventListener('click',async event=>{
    const genre=event.target.closest('[data-genre-card]');if(genre){activeGenre=genre.dataset.genreCard;const next=rows.find(row=>row.genre===activeGenre);return setTrack(next,{autoplay:!audio.paused});}
    const track=event.target.closest('[data-track-card]');if(track)return setTrack(rows.find(row=>rowKey(row)===track.dataset.trackCard),{autoplay:true});
    if(event.target.closest('[data-play]')){if(!activeTrack)return;if(!audio.src)await setTrack(activeTrack);return audio.paused?audio.play().catch(error=>setStatus(error.message)):audio.pause();}
    if(event.target.closest('[data-previous]'))return playOffset(-1);if(event.target.closest('[data-next]'))return playOffset(1);
    if(event.target.closest('[data-shuffle]')){const list=rows.filter(row=>row.genre===activeGenre);return setTrack(list[Math.floor(Math.random()*list.length)],{autoplay:true});}
    if(event.target.closest('[data-repeat]')){audio.loop=!audio.loop;event.target.closest('[data-repeat]').setAttribute('aria-pressed',String(audio.loop));return;}
    if(event.target.closest('[data-window]'))return window.open('background-music.html?player=1','edmund-background-music','popup,width=900,height=820,resizable=yes');
  });
  root.querySelector('[data-seek]').addEventListener('input',event=>{audio.currentTime=Number(event.target.value)||0;});
  root.querySelector('[data-volume]').addEventListener('input',event=>{audio.volume=Number(event.target.value);});
  renderRoot(root,rows);
}
export async function openMusic(){
  ensureStyles();if(dialog?.isConnected){dialog.showModal();return;}
  dialog=document.createElement('dialog');dialog.className='background-music-dialog';dialog.innerHTML='<button type="button" class="music-dialog-close" data-close aria-label="Close">×</button><div data-player></div>';
  document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.showModal();await mountMusic(dialog.querySelector('[data-player]'));
}
document.addEventListener('click',event=>{if(event.target.closest('[data-edmund-music-header]'))openMusic().catch(console.error);});
const root=document.querySelector('[data-music-library]');if(root)mountMusic(root).catch(error=>root.textContent=error.message);
