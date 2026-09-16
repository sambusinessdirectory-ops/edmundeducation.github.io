import {session,rpc,bookmarks,saveState,getCached,savedStates,loadPreferences,fontControl} from './learning-state.mjs?v=20260916-library1';
import {escapeHtml as esc,searchContent,sourceLabel,playlistItems} from './library-core.mjs?v=20260916-library1';
const json=async path=>{const r=await fetch(path);if(!r.ok)throw Error('資料暫時未能載入，請重試。');return r.json();};
const params=()=>new URLSearchParams(location.search);
const materialPromise=()=>json('./content/lesson-materials.json?v=20260916-library1');
const link=(view,values={})=>'./library.html?'+new URLSearchParams({view,...values});
const date=value=>new Date(value).toLocaleString('zh-HK',{dateStyle:'medium',timeStyle:'short'});
let activePage=null,player=null,audioGeneration=0;
function stopAudio(){audioGeneration++;if(player){player.pause();player.onended=null;}document.querySelectorAll('[data-play-bookmark]').forEach(b=>b.setAttribute('aria-pressed','false'));}
async function playBookmark(item,done){
 const token=++audioGeneration;player?.pause();document.querySelectorAll('[data-play-bookmark]').forEach(b=>b.setAttribute('aria-pressed','false'));
 if(!player){player=new Audio("data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==");void player.play().catch(()=>{});}
 try{
  const manifest=await json('./dialogue-audio.json?v=20260916-lessons123');if(token!==audioGeneration)return;
  const path=manifest[`${item.dialogue}:${item.line}`]?.path;if(!path)throw Error('這句錄音暫時未能提供。');
  player=player||new Audio();player.src=new URL(path,location.href).href;player.onended=()=>{if(token===audioGeneration)done?.();};
  const button=document.querySelector(`[data-play-bookmark="${CSS.escape(item.key)}"]`);button?.setAttribute('aria-pressed','true');
  await player.play();
 }catch(error){if(token===audioGeneration)notice(error.message||'請再按播放按鈕。');}
}
function notice(text){const node=activePage?.querySelector('[data-library-status]');if(node)node.textContent=text;}
function pageHeader(view){return `<header class="library-heading"><p class="pro-eyebrow">PROFESSIONAL ENGLISH · 學習資料庫</p><h1>${({search:'搜尋詞語與句子',materials:'課文與下載',bookmarks:'我的書籤與播放清單',messages:'課程訊息'})[view]}</h1><nav aria-label="學習資料庫">${[['search','搜尋'],['materials','課文與下載'],['bookmarks','書籤與播放清單'],['messages','課程訊息']].map(([id,title])=>`<a href="${link(id)}" ${id===view?'aria-current="page"':''}>${title}</a>`).join('')}<a href="./">返回課程</a></nav></header><p data-library-status role="status" aria-live="polite"></p>`;}
function highlightQuery(container,query){
 if(!query)return;const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){const text=node.textContent,low=text.toLowerCase(),q=query.toLowerCase();let start=0,at=low.indexOf(q);if(at<0)continue;const fragment=document.createDocumentFragment();while(at>=0){fragment.append(text.slice(start,at));const mark=document.createElement('mark');mark.className='search-hit';mark.textContent=text.slice(at,at+q.length);fragment.append(mark);start=at+q.length;at=low.indexOf(q,start);}fragment.append(text.slice(start));node.replaceWith(fragment);}
}
async function searchPage(page){
 const query=(params().get('q')||'').slice(0,200),lesson=params().get('lesson')||'',type=params().get('type')||'';
 page.insertAdjacentHTML('beforeend',`<form class="library-search" action="./library.html"><input type="hidden" name="view" value="search"><label>搜尋英文或中文<input name="q" type="search" value="${esc(query)}" maxlength="200" placeholder="例如：receipt、follow up、投訴" required></label><label>課堂<select name="lesson"><option value="">全部課堂</option>${[1,2,3].map(n=>`<option value="${n}" ${lesson===String(n)?'selected':''}>第 ${n} 課</option>`).join('')}</select></label><label>內容<select name="type"><option value="">全部內容</option>${['課文','對話','一詞多義','字卡'].map(t=>`<option ${type===t?'selected':''}>${t}</option>`).join('')}</select></label><button type="submit" class="pro-primary">搜尋</button></form><section class="library-results" aria-live="polite"></section>`);
 if(!query)return;notice('正在搜尋…');
 const results=page.querySelector('.library-results');
 const [materials,...polysemy]=await Promise.all([materialPromise(),...[1,2,3].map(n=>json(`./content/lesson-${n}-polysemy.json?v=20260916-library1`))]);
 let entries=searchContent({materials,dialogues:window.EDMUND_PROFESSIONAL_DIALOGUES||[],polysemy},query),warning='';
 try{const flash=await rpc('search',{p_query:query});for(const row of flash.results||[])entries.push({kind:'字卡',lesson:Number((row.deck_title.match(/(?:Class|Lesson)\s*(\d+)/i)||[])[1])||0,title:row.front,location:row.deck_title+(row.position?` · 第 ${row.position} 張`:""),text:row.back+' '+row.note,href:`./?deck=${encodeURIComponent(row.deck_id)}&card=${encodeURIComponent(row.card_id)}`});if(flash.has_more)warning='字卡結果超過 100 項，請輸入更完整的詞語。';}catch{warning='字卡搜尋暫時未能連線；以下仍顯示課文與練習結果。';}
 entries=entries.filter(r=>(!lesson||String(r.lesson)===lesson)&&(!type||r.kind===type));notice(`${entries.length} 個位置${warning?' · '+warning:''}`);
 results.innerHTML=entries.length?entries.map(row=>`<article class="library-result"><div class="library-result-meta">${esc(row.kind)} · 第 ${row.lesson||'—'} 課 · ${esc(row.location)}</div><h2><a href="${esc(row.href)}">${esc(row.title)}</a></h2><p>${esc(row.text)}</p></article>`).join(''):'<p>找不到相符詞語。試試較短的詞語，或選擇全部課堂。</p>';
 results.querySelectorAll('p,h2').forEach(p=>highlightQuery(p,query));
}
async function materialsPage(page){
 const materials=await materialPromise(),lesson=materials.find(l=>l.lesson===Number(params().get('lesson')))||materials[0],number=Math.max(1,Math.min(lesson.pages.length,Number(params().get('page'))||1)),source=lesson.pages[number-1],q=params().get('q')||'';
 page.insertAdjacentHTML('beforeend',`<div class="material-downloads">${materials.map(l=>`<article><h2>第 ${l.lesson} 課</h2><p>${esc(l.title)}</p><a href="${link('materials',{lesson:l.lesson})}">閱讀文字版</a><a href="./${l.pdf}" download="Professional-English-Lesson-${l.lesson}.pdf">↓ 下載 PDF · ${l.pages.length} 頁</a></article>`).join('')}</div><section class="material-reader"><header class="material-reader-controls"><h2>第 ${lesson.lesson} 課 · ${esc(lesson.title)}</h2><label>頁數<select data-material-page>${lesson.pages.map(p=>`<option value="${p.page}" ${p.page===number?'selected':''}>${sourceLabel(p)}</option>`).join('')}</select></label><a href="./${lesson.pdf}#page=${number}" target="_blank" rel="noopener">查看原版 PDF ↗</a></header><p class="material-colour-note">保留原教材的角色顏色及教學重點標示。表格可左右捲動。</p><article class="material-text" aria-label="課文第 ${number} 頁">${source.html}</article><nav class="material-pagination" aria-label="課文頁數">${number>1?`<a href="${link('materials',{lesson:lesson.lesson,page:number-1,q})}">← 上一頁</a>`:'<span></span>'}<span>${number} / ${lesson.pages.length}</span>${number<lesson.pages.length?`<a href="${link('materials',{lesson:lesson.lesson,page:number+1,q})}">下一頁 →</a>`:'<span></span>'}</nav></section>`);
 page.querySelector('[data-material-page]').onchange=e=>location.assign(link('materials',{lesson:lesson.lesson,page:e.target.value,q}));
 highlightQuery(page.querySelector('.material-text'),q);
 if(params().has('page'))page.querySelector('.material-reader').scrollIntoView({block:'start'});
}
function bookmarkCard(item,playlist){
 return `<article class="phrase-card" data-phrase-card="${esc(item.key)}"><small>${esc(item.title)} · 第 ${Number(item.line)+1} 句</small><h3>${esc(item.word)}</h3><p>${esc(item.context)}</p><p class="phrase-chinese">${esc(item.translation)}</p><div class="phrase-actions"><button type="button" data-play-bookmark="${esc(item.key)}" aria-pressed="false">▶ 聆聽原句</button><a href="./dialogue.html?id=${encodeURIComponent(item.dialogue)}&line=${Number(item.line)}">返回對話</a>${playlist?`<button type="button" data-playlist-remove="${esc(item.key)}">移出清單</button><button type="button" data-playlist-up="${esc(item.key)}" aria-label="向上移動 ${esc(item.word)}">↑</button><button type="button" data-playlist-down="${esc(item.key)}" aria-label="向下移動 ${esc(item.word)}">↓</button>`:`<button type="button" data-remove-bookmark="${esc(item.key)}">移除書籤</button>`}</div></article>`;
}
async function bookmarksPage(page){
 try{await loadPreferences();}catch{notice('正在顯示此裝置的書籤，連線後會同步。');}
 if(!page.isConnected)return;
 const body=document.createElement('section');body.className='phrase-workspace';page.append(body);
 let current=params().get('playlist')||'',queue=[],cursor=0;
 const all=()=>bookmarks();
 const lists=()=>savedStates('playlist').filter(v=>!v.deleted).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
 const selected=()=>lists().find(v=>v.key==='playlist:'+current);
 const save=list=>{saveState(list.key,{...list,updatedAt:Date.now()});render();};
 function render(){
  const detailsOpen=body.querySelector('details')?.open||false;
  const saved=all(),playlist=selected(),items=playlist?playlistItems(playlist,saved):saved;
  body.innerHTML=`<section class="playlist-builder"><h2>情境播放清單</h2><p>按用途整理已收藏的詞語與片語，例如「接待訪客」或「處理投訴」。播放時會使用原對話錄音。</p><form data-new-playlist><label>新清單名稱<input name="name" maxlength="80" required placeholder="例如：接待訪客"></label><button type="submit">＋ 建立清單</button></form><nav class="playlist-list"><button type="button" data-open-playlist="" ${!playlist?'aria-current="page"':''}>全部書籤 (${saved.length})</button>${lists().map(l=>`<button type="button" data-open-playlist="${esc(l.key.slice(9))}" ${l.key===playlist?.key?'aria-current="page"':''}>${esc(l.name)} (${playlistItems(l,saved).length})</button>`).join('')}</nav></section>${playlist?`<section class="playlist-editor"><h2>${esc(playlist.name)}</h2><form data-rename-playlist><label>重新命名<input name="name" value="${esc(playlist.name)}" maxlength="80" required></label><button type="submit">儲存名稱</button></form><div class="phrase-actions"><button type="button" data-play-playlist ${items.length?'':'disabled'}>▶ 播放清單</button><button type="button" data-stop-playlist>■ 停止</button><button type="button" data-delete-playlist>刪除清單</button></div><details ${detailsOpen?'open':''}><summary>加入／移除書籤</summary><fieldset><legend>選擇要放進「${esc(playlist.name)}」的片語</legend>${saved.map(b=>`<label class="playlist-option"><input type="checkbox" data-playlist-include="${esc(b.key)}" ${playlist.items.includes(b.key)?'checked':''}>${esc(b.word)}<small>${esc(b.title)}</small></label>`).join('')||'<p>請先在對話按「收藏片語」。</p>'}</fieldset></details></section>`:'<p class="phrase-library-tip">在任何對話列按「收藏片語」，選擇一個片語或整句，即可在這裡找到。</p>'}<div class="phrase-grid">${items.map(b=>bookmarkCard(b,playlist)).join('')||'<p>這裡還沒有書籤。</p>'}</div>`;
 }
 function next(){if(cursor>=queue.length){stopAudio();notice('播放完畢。');return;}const item=queue[cursor++];notice(`正在播放 ${cursor} / ${queue.length} · ${item.word}`);void playBookmark(item,next);}
 body.addEventListener('submit',e=>{e.preventDefault();const name=new FormData(e.target).get('name')?.trim();if(!name)return;if(e.target.matches('[data-new-playlist]')){current=crypto.randomUUID();save({key:'playlist:'+current,name,items:[],deleted:false});history.replaceState(null,'',link('bookmarks',{playlist:current}));}else if(e.target.matches('[data-rename-playlist]')&&selected())save({...selected(),name});});
 body.addEventListener('change',e=>{const key=e.target.dataset.playlistInclude,list=selected();if(!key||!list)return;save({...list,items:e.target.checked?[...new Set([...list.items,key])]:list.items.filter(k=>k!==key)});});
 body.addEventListener('click',e=>{
  const button=e.target.closest('button,a');if(!button)return;const list=selected();
  if(button.matches('[data-open-playlist]')){stopAudio();current=button.dataset.openPlaylist;history.replaceState(null,'',link('bookmarks',current?{playlist:current}:{}));render();}
  else if(button.matches('[data-play-bookmark]')){queue=[];const item=all().find(b=>b.key===button.dataset.playBookmark);if(item){stopAudio();notice('正在播放原句 · '+item.word);void playBookmark(item,()=>{stopAudio();notice('播放完畢。');});}}
  else if(button.matches('[data-play-playlist]')&&list){stopAudio();queue=playlistItems(list,all());cursor=0;next();}
  else if(button.matches('[data-stop-playlist]')){queue=[];stopAudio();notice('已停止播放。');}
  else if(button.matches('[data-remove-bookmark]')){const item=all().find(b=>b.key===button.dataset.removeBookmark);if(item){stopAudio();saveState(item.key,{...item,bookmarked:false});render();}}
  else if(button.matches('[data-delete-playlist]')&&list&&confirm(`刪除「${list.name}」？原本的書籤會保留。`)){stopAudio();save({...list,deleted:true});current='';history.replaceState(null,'',link('bookmarks'));render();}
  else if(button.matches('[data-playlist-remove]')&&list)save({...list,items:list.items.filter(k=>k!==button.dataset.playlistRemove)});
  else if(button.matches('[data-playlist-up],[data-playlist-down]')&&list){const key=button.dataset.playlistUp||button.dataset.playlistDown,items=[...list.items],i=items.indexOf(key),j=i+(button.hasAttribute('data-playlist-up')?-1:1);if(i>=0&&j>=0&&j<items.length){[items[i],items[j]]=[items[j],items[i]];save({...list,items});}}
 });
 render();
 // Flashcard bookmarks remain available through the existing library on the home page.
 body.insertAdjacentHTML('afterend','<p><a href="./">← 查看課程首頁的字卡書籤</a></p>');
}
async function messagesPage(page){
 const owner=session(),admin=owner?.user?.role==='admin';let draftId=crypto.randomUUID(),rows=[];
 page.insertAdjacentHTML('beforeend',`${admin?'<form class="message-composer"><label>發布課程訊息<textarea name="body" rows="5" maxlength="4000" required placeholder="寫下要給同學的訊息…"></textarea></label><p>發布後，所有 Professional English 用戶均可在首頁及訊息板看到。</p><button type="submit" class="pro-primary">發布訊息</button></form>':''}<section class="message-list" aria-live="polite"></section>`);
 const container=page.querySelector('.message-list');
 async function refresh(){rows=await rpc('messages',{},owner);if(session()?.user?.id!==owner.user.id)return;container.innerHTML=rows.map(m=>`<article class="message-card"><time>${esc(date(m.updated_at))}</time><p>${esc(m.body)}</p>${admin?`<button type="button" data-delete-message="${esc(m.id)}">刪除訊息</button>`:''}</article>`).join('')||'<p>暫時沒有課程訊息。</p>';}
 page.querySelector('.message-composer')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.target,button=form.querySelector('button'),body=form.elements.body.value.trim();if(!body)return;button.disabled=true;notice('正在發布…');try{await rpc('messages',{p_action:'publish',p_id:draftId,p_body:body,p_revision:0},owner);form.reset();draftId=crypto.randomUUID();await refresh();notice('已發布。');}catch(error){notice(error.message);}finally{button.disabled=false;}});
 container.addEventListener('click',async e=>{const button=e.target.closest('[data-delete-message]');if(!button)return;const message=rows.find(m=>m.id===button.dataset.deleteMessage);if(!message||!confirm('刪除這則課程訊息？'))return;button.disabled=true;try{await rpc('messages',{p_action:'delete',p_id:message.id,p_revision:message.revision},owner);await refresh();notice('訊息已刪除。');}catch(error){notice(error.message);button.disabled=false;}});
 await refresh();
}
async function mount(){
 if(activePage||!session()?.token||!document.querySelector('#root .workspace'))return;
 const page=document.createElement('main');activePage=page;page.className='pro-practice-page library-page';document.body.append(page);document.body.classList.add('pro-library-open');
 const view=['search','materials','bookmarks','messages'].includes(params().get('view'))?params().get('view'):'search';page.innerHTML=pageHeader(view);
 try{await ({search:searchPage,materials:materialsPage,bookmarks:bookmarksPage,messages:messagesPage})[view](page);}catch(error){notice(error.message);const retry=document.createElement('button');retry.textContent='重試';retry.onclick=()=>location.reload();page.append(retry);}
}
if(document.body.dataset.professionalLibraryPage==='true'){
 new MutationObserver(()=>{if(activePage&&!session()?.token){stopAudio();activePage.remove();activePage=null;document.body.classList.remove('pro-library-open');}void mount();}).observe(document.getElementById('root'),{childList:true,subtree:true});void mount();window.addEventListener('pagehide',stopAudio);
}
