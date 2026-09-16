import {bindLiveSearch} from './search.mjs?v=20260916-ui-polish1';
import {rpc,session} from './learning-state.mjs?v=20260916-ui-polish1';
import {escapeHtml as esc} from './library-core.mjs?v=20260916-ui-polish1';
export function mountLibraryHome(host,owner){
 if(document.body.dataset.professionalLibraryPage==='true')return()=>{};
 let active=true,busy=false;
 host.innerHTML=`<section class="library-home"><div><p class="pro-eyebrow">WORDS · MATERIALS · YOUR PHRASES</p><h2>搜尋與學習資源</h2></div><form action="./library.html" class="library-home-search"><input type="hidden" name="view" value="search"><label class="sr-only" for="professional-all-search">搜尋所有課文、字卡及練習</label><input id="professional-all-search" name="q" type="search" maxlength="200" required placeholder="搜尋英文或中文，查看課堂及頁數…"><button type="submit">搜尋</button></form><p data-home-search-status role="status"></p><section class="library-results" data-home-results aria-live="polite"></section><nav><a href="./library.html?view=materials">課文與 PDF 下載</a><a href="./library.html?view=bookmarks">我的書籤</a><a href="./library.html?view=messages">${owner.user.role==='admin'?'發布／管理課程訊息':'課程訊息'}</a></nav><section class="home-messages" aria-label="課程訊息"><h3>老師的訊息</h3><div data-home-messages><p>正在載入…</p></div></section></section>`;
 const stopSearch=bindLiveSearch(host.querySelector('form'),host.querySelector('[data-home-results]'),host.querySelector('[data-home-search-status]'));
 async function refresh(){if(!active||busy||document.hidden||session()?.user?.id!==owner.user.id)return;busy=true;try{const rows=await rpc('messages',{},owner);if(active&&session()?.user?.id===owner.user.id){host.querySelector('[data-home-messages]').innerHTML=rows.length?rows.slice(0,3).map(m=>`<article><time>${esc(new Date(m.updated_at).toLocaleDateString('zh-HK'))}</time><p>${esc(m.body)}</p></article>`).join(''):'<p class="muted">暫時沒有新訊息。</p>';}}catch{if(active)host.querySelector('[data-home-messages]').textContent='訊息暫時未能載入。';}finally{busy=false;}}
 void refresh();const timer=setInterval(refresh,60000);window.addEventListener('focus',refresh);
 return()=>{stopSearch();active=false;clearInterval(timer);window.removeEventListener('focus',refresh);};
}
