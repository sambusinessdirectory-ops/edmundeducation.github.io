(() => {
  'use strict';
  let generation=0, dwell=0, leave=0, deadline=0, fade=0, audio=null, active=null, panel=null, backdrop=null;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  function stop(){
    generation++;clearTimeout(dwell);clearTimeout(leave);clearTimeout(deadline);cancelAnimationFrame(fade);
    if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}
    active?.classList.remove('is-previewing');active=null;
    document.body.classList.remove('song-preview-open');
    if(panel){panel.remove();panel=null;}
    if(backdrop){const old=backdrop;old.classList.remove('is-visible');setTimeout(()=>old.remove(),700);backdrop=null;}
  }
  function maybeLeave(){clearTimeout(leave);leave=setTimeout(()=>{if(!panel?.matches(':hover')&&!active?.matches(':hover')&&!panel?.contains(document.activeElement)&&document.activeElement!==active)stop();},180);}
  async function start(card,song,options){
    stop();if(!options.allowed()||!card.isConnected)return;
    const run=generation;active=card;active.classList.add('is-previewing');options.pause();
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
    try {
      const loaded=await options.load();if(run!==generation||!options.allowed())return;
      const rows=loaded.translations.filter(r=>!r.break);const table=el('table');const body=el('tbody');const nodes=new Map();
      rows.forEach(row=>{const tr=el('tr');tr.dataset.lineId=row.lineId;tr.append(el('td','song-hook-en',row.english),el('td','song-hook-zh',row.chinese));body.append(tr);nodes.set(row.lineId,tr);});table.append(body);lyrics.append(table);
      const mark=id=>{const next=nodes.get(id);if(!next||next.classList.contains('is-current'))return;body.querySelector('.is-current')?.classList.remove('is-current');next.classList.add('is-current');const offset=next.getBoundingClientRect().top-lyrics.getBoundingClientRect().top+lyrics.scrollTop;lyrics.scrollTo({top:Math.max(0,offset-lyrics.clientHeight*.35),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
      requestAnimationFrame(()=>{if(run===generation)mark(hook.lineId);});
      if(!loaded.audioUrl){play.textContent='此歌曲暫未提供試聽';return;}
      const player=new Audio();audio=player;player.preload='auto';player.volume=0;
      const playAudio=async()=>{if(run!==generation)return;try{await player.play();if(run!==generation){player.pause();return;}play.textContent='❚❚ 暫停試聽';const began=performance.now();cancelAnimationFrame(fade);const ramp=now=>{if(run!==generation)return;player.volume=Math.max(0,Math.min(.65,(now-began)/900*.65));if(player.volume<.65)fade=requestAnimationFrame(ramp);};fade=requestAnimationFrame(ramp);clearTimeout(deadline);deadline=setTimeout(stop,30000);}catch{if(run===generation){play.textContent='▶ 播放試聽';play.disabled=false;}}};
      play.onclick=()=>{if(player.paused)void playAudio();else{cancelAnimationFrame(fade);player.pause();play.textContent='▶ 繼續試聽';}};
      player.addEventListener('loadedmetadata',()=>{if(run!==generation)return;player.currentTime=Math.min(hook.start,Math.max(0,player.duration-1));play.disabled=false;void playAudio();},{once:true});
      player.addEventListener('timeupdate',()=>{if(run!==generation)return;if(player.currentTime>=hook.start+hook.duration){stop();return;}const timed=rows.filter(r=>Number.isFinite(r.startSeconds)&&r.startSeconds<=player.currentTime);if(timed.length)mark(timed[timed.length-1].lineId);});
      player.addEventListener('ended',()=>{if(run===generation)stop();});
      player.addEventListener('error',()=>{if(run===generation){play.disabled=true;play.textContent='音訊暫時無法播放';}});
      player.src=loaded.audioUrl;player.load();
    } catch {if(run===generation){play.disabled=true;play.textContent='暫時無法載入試聽';}}
  }
  function bind(card,song,options){
    if(!window.SONG_PREVIEW_HOOKS?.[song.slug])return;
    const schedule=()=>{if(active===card){clearTimeout(leave);return;}if(active)stop();clearTimeout(dwell);clearTimeout(leave);dwell=setTimeout(()=>void start(card,song,options),2000);};
    card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&matchMedia('(hover: hover) and (pointer: fine)').matches)schedule();});
    card.addEventListener('pointerleave',()=>{clearTimeout(dwell);if(active===card)maybeLeave();});
    card.addEventListener('focus',schedule);card.addEventListener('blur',()=>{clearTimeout(dwell);if(active===card)maybeLeave();});
    const preview=el('button','song-card-preview','▷');preview.type='button';preview.setAttribute('aria-label',`試聽 ${song.title}`);preview.title='試聽';preview.addEventListener('click',event=>{event.stopPropagation();clearTimeout(dwell);void start(card,song,options);});card.querySelector('.song-card__thumb')?.append(preview);
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape')stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  window.SongPreview=Object.freeze({bind,stop});
})();
