(() => {
  'use strict';
  let generation=0, dwell=0, leave=0, deadline=0, audio=null, active=null, panel=null, backdrop=null, pinned=false;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  function stop(){
    pinned=false;generation++;clearTimeout(dwell);clearTimeout(leave);clearTimeout(deadline);
    if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}
    active?.classList.remove('is-previewing');active=null;
    document.body.classList.remove('song-preview-open');
    if(panel){panel.remove();panel=null;}
    if(backdrop){const old=backdrop;old.classList.remove('is-visible');setTimeout(()=>old.remove(),700);backdrop=null;}
  }
  function maybeLeave(){if(pinned)return;clearTimeout(leave);leave=setTimeout(()=>{if(!panel?.matches(':hover')&&!active?.matches(':hover')&&!panel?.contains(document.activeElement)&&document.activeElement!==active)stop();},180);}
  async function start(card,song,options,explicit=false){
    stop();if(!options.allowed()||!card.isConnected)return;
    pinned=explicit;const run=generation;active=card;active.classList.add('is-previewing');options.pause();
    const hook=window.SONG_PREVIEW_HOOKS?.[song.slug];if(!hook){stop();return;}
    const view=el('aside','song-hook-panel');panel=view;view.setAttribute('role','region');view.setAttribute('aria-label',`${song.title} 歌曲試聽與歌詞`);
    const heading=el('header','song-hook-heading'),labels=el('div');labels.append(el('span','song-hook-eyebrow','NOW PREVIEWING'),el('h2','',song.title),el('p','',song.singer));
    const close=el('button','song-hook-close','×');close.type='button';close.setAttribute('aria-label','關閉歌曲試聽');close.onclick=stop;heading.append(labels,close);
    const play=el('button','song-hook-play','載入試聽…');play.type='button';play.disabled=true;
    const lyrics=el('div','song-hook-lyrics');lyrics.setAttribute('tabindex','0');lyrics.setAttribute('aria-label','英文歌詞與中文翻譯');
    view.append(heading,play,lyrics);document.body.append(view);
    view.addEventListener('pointerenter',()=>clearTimeout(leave));view.addEventListener('pointerleave',maybeLeave);view.addEventListener('focusout',maybeLeave);
    const bg=el('div','song-hook-backdrop');backdrop=bg;bg.setAttribute('aria-hidden','true');
    if(song.coverUrl){const image=el('img');image.src=song.coverUrl;image.alt='';bg.append(image);}document.body.prepend(bg);document.body.classList.add('song-preview-open');requestAnimationFrame(()=>{if(run===generation)bg.classList.add('is-visible');});
    let rows=[],mark=()=>{};
    function prepareAudio(url,immediate){
      const player=new Audio();audio=player;player.preload='auto';player.volume=.65;
      const playAudio=async()=>{if(run!==generation)return;try{await player.play();if(run!==generation){player.pause();return;}play.textContent='❚❚ 暫停試聽';clearTimeout(deadline);deadline=setTimeout(stop,30000);}catch{if(run===generation){play.textContent='▶ 播放試聽';play.disabled=false;}}};
      play.onclick=()=>{if(player.paused)void playAudio();else{player.pause();play.textContent='▶ 繼續試聽';}};
      player.addEventListener('loadedmetadata',()=>{if(run!==generation)return;player.currentTime=Math.min(hook.start,Math.max(0,player.duration-1));play.disabled=false;if(!immediate)void playAudio();},{once:true});
      player.addEventListener('timeupdate',()=>{if(run!==generation)return;if(player.currentTime>=hook.start+hook.duration){stop();return;}const timed=rows.filter(r=>Number.isFinite(r.startSeconds)&&r.startSeconds<=player.currentTime);if(timed.length)mark(timed[timed.length-1].lineId);});
      player.addEventListener('ended',()=>{if(run===generation)stop();});
      player.addEventListener('error',()=>{if(run===generation){play.disabled=true;play.textContent='音訊暫時無法播放';}});
      player.src=url.split('#')[0]+'#t='+hook.start;player.load();if(immediate)void playAudio();
    }
    // The catalogue already carries the authorised audio URL. Calling play in
    // the tap handler preserves Safari's user gesture while lyrics load.
    if(explicit&&song.audioUrl)prepareAudio(song.audioUrl,true);
    try {
      const loaded=await options.load();if(run!==generation||!options.allowed())return;
      rows=loaded.translations.filter(r=>!r.break);const table=el('table');const body=el('tbody');const nodes=new Map();
      rows.forEach(row=>{const tr=el('tr');tr.dataset.lineId=row.lineId;tr.append(el('td','song-hook-en',row.english),el('td','song-hook-zh',row.chinese));body.append(tr);nodes.set(row.lineId,tr);});table.append(body);lyrics.append(table);
      mark=id=>{const next=nodes.get(id);if(!next||next.classList.contains('is-current'))return;body.querySelector('.is-current')?.classList.remove('is-current');next.classList.add('is-current');const offset=next.getBoundingClientRect().top-lyrics.getBoundingClientRect().top+lyrics.scrollTop;lyrics.scrollTo({top:Math.max(0,offset-lyrics.clientHeight*.35),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
      requestAnimationFrame(()=>{if(run===generation)mark(hook.lineId);});
      if(!loaded.audioUrl&&!audio){play.textContent='此歌曲暫未提供試聽';return;}
      if(!audio)prepareAudio(loaded.audioUrl,false);
    } catch {if(run===generation){if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}play.disabled=true;play.textContent='暫時無法載入試聽';}}
  }
  function bind(card,song,options){
    if(!window.SONG_PREVIEW_HOOKS?.[song.slug])return;
    const schedule=()=>{if(active===card){clearTimeout(leave);return;}if(active)stop();clearTimeout(dwell);clearTimeout(leave);dwell=setTimeout(()=>void start(card,song,options),650);};
    card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&matchMedia('(hover: hover) and (pointer: fine)').matches)schedule();});
    card.addEventListener('pointerleave',()=>{clearTimeout(dwell);if(active===card)maybeLeave();});
    card.addEventListener('focus',schedule);card.addEventListener('blur',()=>{clearTimeout(dwell);if(active===card)maybeLeave();});
    // Touch has no reliable hover: tap artwork or hold a stationary card.
    let touchTimer=0,touchOrigin=null,lastTouch=0,held=false;
    const cancelTouch=()=>{clearTimeout(touchTimer);touchTimer=0;touchOrigin=null;};
    card.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='touch')return;
      cancelTouch();lastTouch=Date.now();held=false;
      if(event.target.closest('button'))return;
      touchOrigin={x:event.clientX,y:event.clientY};
      touchTimer=setTimeout(()=>{touchTimer=0;if(!touchOrigin||!card.isConnected)return;held=true;void start(card,song,options,true);},650);
    },{passive:true});
    card.addEventListener('pointermove',event=>{if(touchOrigin&&Math.hypot(event.clientX-touchOrigin.x,event.clientY-touchOrigin.y)>12)cancelTouch();},{passive:true});
    card.addEventListener('pointerup',cancelTouch,{passive:true});
    card.addEventListener('pointercancel',cancelTouch,{passive:true});
    card.addEventListener('contextmenu',event=>event.preventDefault());
    card.addEventListener('dragstart',event=>event.preventDefault());
    card.addEventListener('click',event=>{if(held){held=false;event.preventDefault();event.stopImmediatePropagation();}},true);
    card.querySelector('.song-card__thumb')?.addEventListener('click',event=>{
      if(Date.now()-lastTouch>1500||event.target.closest('button'))return;
      event.preventDefault();event.stopPropagation();void start(card,song,options,true);
    });
    const preview=el('button','song-card-preview','▶ 試聽');preview.type='button';preview.setAttribute('aria-label',`試聽 ${song.title}`);preview.title='試聽';preview.addEventListener('click',event=>{event.stopPropagation();clearTimeout(dwell);if(active===card){stop();return;}void start(card,song,options,true);});card.querySelector('.song-card__thumb')?.append(preview);
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape')stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  window.SongPreview=Object.freeze({bind,stop});
})();
