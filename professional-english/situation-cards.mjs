import {session} from './learning-state.mjs?v=20260916-ui-polish1';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const cardId=(lesson,card)=>`l${lesson}c${card.number}`;
let mounted=false;

async function initialise(){
  if(mounted||!document.querySelector('#root .course-section')||!session()?.user?.id)return;
  mounted=true;
  const owner=session().user.id;
  const page=document.createElement('main');
  page.className='pro-practice-page situation-page';
  document.body.classList.add('pro-dialogue-open','syn-page-open');
  document.body.append(page);
  try{
    const responses=await Promise.all([
      fetch('./content/situation-cards.json?v=20260930-lesson5'),
      fetch('./content/situation-card-translations.json?v=20260930-situation-voices1'),
      fetch('./content/situation-card-audio.json?v=20260930-situation-voices1'),
    ]);
    if(responses.some(response=>!response.ok))throw Error('content');
    const [data,translations,manifest]=await Promise.all(responses.map(response=>response.json()));
    let active=Math.max(1,Math.min(5,Number(new URLSearchParams(location.search).get('lesson'))||1));
    const shown=new Set();
    let player=null,playingCard='',playingIndex=-1,continuous=false,generation=0;
    const ownsPage=()=>session()?.user?.id===owner;
    function status(key,message){const node=page.querySelector(`[data-situation-status="${key}"]`);if(node)node.textContent=message;}
    function sync(){
      page.querySelectorAll('[data-situation-play-line]').forEach(button=>{
        const current=button.dataset.situationCard===playingCard&&Number(button.dataset.situationPlayLine)===playingIndex&&player&&!player.paused;
        button.setAttribute('aria-pressed',String(Boolean(current)));
        button.closest('.situation-turn')?.classList.toggle('is-speaking',Boolean(current));
      });
      page.querySelectorAll('[data-situation-play-all]').forEach(button=>{
        button.setAttribute('aria-pressed',String(button.dataset.situationCard===playingCard&&Boolean(player&&!player.paused&&continuous)));
      });
    }
    function stopAudio(message=''){
      generation++;
      const key=playingCard;
      if(player){player.onended=null;player.onerror=null;player.pause();player.removeAttribute('src');player.load();}
      player=null;playingCard='';playingIndex=-1;continuous=false;
      sync();if(key)status(key,message);
    }
    function findCard(key){for(const lesson of data.lessons)for(const card of lesson.cards)if(cardId(lesson.lesson,card)===key)return card;return null;}
    async function playLine(key,index,all=false){
      if(!ownsPage())return;
      const card=findCard(key),clip=manifest[`${key}:${index}`];
      if(!card||!clip?.path){status(key,'這句錄音暫時未能載入。');return;}
      stopAudio();
      const token=generation;
      playingCard=key;playingIndex=index;continuous=all;
      player=new Audio(new URL(clip.path,location.href).href);
      const audio=player;audio.preload='auto';
      audio.onplay=()=>{if(token!==generation)return;sync();status(key,`正在播放第 ${index+1} / ${card.turns.length} 句`);};
      audio.onended=()=>{if(token!==generation)return;if(continuous&&index+1<card.turns.length)void playLine(key,index+1,true);else stopAudio('播放完畢。');};
      audio.onerror=()=>{if(token===generation)stopAudio('錄音未能播放，請再試一次。');};
      try{await audio.play();}catch{if(token===generation)stopAudio('未能播放錄音，請再按一次播放。');}
    }
    function render(){
      if(!ownsPage())return;
      stopAudio();
      const lesson=data.lessons.find(item=>item.lesson===active);
      page.innerHTML=`<header class="pro-page-header"><a href="./">← 返回課程 · Back to course</a><a href="./synonyms.html">同義詞練習</a></header><section class="syn-intro"><small>PROFESSIONAL ENGLISH · SITUATION CARDS</small><h1>處境卡 (Situation Card) 答案</h1><p>選擇課堂，打開處境卡閱讀、聆聽完整對話；需要時顯示逐句中文翻譯。</p></section><nav class="situation-tabs" aria-label="選擇課堂">${data.lessons.map(item=>`<a href="?lesson=${item.lesson}" data-lesson="${item.lesson}" class="${item.lesson===active?'active':''}">第 ${item.lesson} 課</a>`).join('')}</nav><section class="syn-section"><h2>第 ${lesson.lesson} 課 · ${esc(lesson.title)}</h2><p>${lesson.cards.length} 張處境卡</p>${lesson.cards.map(card=>{
        const key=cardId(lesson.lesson,card),translated=shown.has(key),lines=translations[key]||[];
        const complete=card.turns.every((_,index)=>manifest[`${key}:${index}`]?.path);
        return `<details class="situation-card" data-situation-detail="${key}"><summary>處境卡 ${card.number} · ${esc(card.title)}</summary><div class="situation-controls"><button type="button" data-situation-play-all data-situation-card="${key}" aria-pressed="false" ${complete?'':'disabled'}>▶ 播放整段</button><button type="button" data-situation-stop data-situation-card="${key}">■ 停止</button><button type="button" data-situation-translation data-situation-card="${key}" aria-pressed="${translated}">${translated?'隱藏':'顯示'}繁體中文翻譯</button><span role="status" data-situation-status="${key}"></span></div><div class="situation-chat">${card.turns.map((turn,index)=>`<article class="situation-turn ${/^Security/.test(turn.role)?'security':''}"><strong>${index+1}. ${esc(turn.role)}</strong><p lang="en">${esc(turn.en)}</p><p class="situation-translation" lang="zh-Hant" ${translated?'':'hidden'}>${esc(lines[index]||'')}</p><button type="button" data-situation-play-line="${index}" data-situation-card="${key}" aria-pressed="false" aria-label="聆聽第 ${index+1} 句：${esc(turn.role)}" ${manifest[`${key}:${index}`]?.path?'':'disabled'}>▶ 聆聽</button></article>`).join('')}</div></details>`;
      }).join('')}</section>`;
    }
    page.addEventListener('click',event=>{
      if(!ownsPage())return;
      const link=event.target.closest('[data-lesson]');
      if(link){event.preventDefault();active=Number(link.dataset.lesson);history.pushState(null,'',`?lesson=${active}`);render();window.scrollTo({top:0,behavior:'smooth'});return;}
      const toggle=event.target.closest('[data-situation-translation]');
      if(toggle){const key=toggle.dataset.situationCard,visible=!shown.has(key);if(visible)shown.add(key);else shown.delete(key);toggle.setAttribute('aria-pressed',String(visible));toggle.textContent=`${visible?'隱藏':'顯示'}繁體中文翻譯`;toggle.closest('.situation-card').querySelectorAll('.situation-translation').forEach(node=>node.hidden=!visible);return;}
      const playAll=event.target.closest('[data-situation-play-all]');
      if(playAll){void playLine(playAll.dataset.situationCard,0,true);return;}
      const playOne=event.target.closest('[data-situation-play-line]');
      if(playOne){void playLine(playOne.dataset.situationCard,Number(playOne.dataset.situationPlayLine));return;}
      if(event.target.closest('[data-situation-stop]'))stopAudio('已停止播放。');
    });
    page.addEventListener('toggle',event=>{
      if(event.target.matches('.situation-card')&&!event.target.open&&event.target.dataset.situationDetail===playingCard)stopAudio();
    },true);
    window.addEventListener('popstate',()=>{active=Math.max(1,Math.min(5,Number(new URLSearchParams(location.search).get('lesson'))||1));render();});
    window.addEventListener('pagehide',()=>stopAudio(),{once:true});
    render();
  }catch{page.innerHTML='<p role="alert">處境卡暫時未能載入。請重新整理頁面。</p>';}
}

new MutationObserver(initialise).observe(document.getElementById('root'),{childList:true,subtree:true});
initialise();
