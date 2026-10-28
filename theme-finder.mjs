const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountThemeFinder(root,{data,onOpen}){
 if(!document.querySelector('[data-theme-css]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./theme-finder.css',import.meta.url).href;link.dataset.themeCss='';document.head.append(link);}
 root._themeAbort?.abort();const controller=new AbortController();root._themeAbort=controller;const events={signal:controller.signal};
 const themes=data.themes.filter(t=>data.rows.some(r=>r.themes.includes(t.id))), labels=new Map(themes.map(t=>[t.id,t]));
 const sections=[...new Set(data.rows.map(r=>r.section))],years=[...new Set(data.rows.map(r=>r.year).filter(Boolean))].sort((a,b)=>b-a);
 let selected='',limit=30;
 root.classList.add('theme-finder');
 root.innerHTML=`<p>按內容主題尋找練習。每項可屬於多個主題，因此各類數量可能重疊。</p><div class="tf-controls"><label>Search · 搜尋主題或內容<input type="search" data-search placeholder="例如：運動 / sports / technology"></label><label>Section · 部分<select data-section><option value="">全部 · All</option>${sections.map(s=>`<option>${esc(s)}</option>`).join('')}</select></label>${years.length?`<label>Year · 年份<select data-year><option value="">全部 · All</option>${years.map(y=>`<option>${y}</option>`).join('')}</select></label>`:''}<button type="button" data-clear>清除篩選</button></div><div class="tf-tiles" aria-label="Themes 主題">${themes.map(t=>`<button type="button" data-theme="${t.id}" aria-pressed="false"><strong>${esc(t.en)}</strong><span>${esc(t.zh)}</span><small>${data.rows.filter(r=>r.themes.includes(t.id)).length}</small></button>`).join('')}</div><p data-status role="status" aria-live="polite"></p><div class="tf-results"></div><button type="button" data-more>Show more · 顯示更多</button>`;
 const search=root.querySelector('[data-search]'),section=root.querySelector('[data-section]'),year=root.querySelector('[data-year]');
 function render(){
  const q=search.value.trim().toLocaleLowerCase();
  const matchingThemes=new Set(themes.filter(t=>[t.en,t.zh,...t.aliases].join(' ').toLocaleLowerCase().includes(q)).map(t=>t.id));
  const rows=data.rows.filter(r=>(!selected||r.themes.includes(selected))&&(!section.value||r.section===section.value)&&(!year?.value||String(r.year)===year.value)&&(!q||[r.title,r.text,r.translation,r.year,r.set].join(' ').toLocaleLowerCase().includes(q)||r.themes.some(t=>matchingThemes.has(t))));
  root.querySelector('[data-status]').textContent=`${selected?labels.get(selected).en+' · '+labels.get(selected).zh+' — ':''}${rows.length} 項練習 / ${data.rows.length} · 顯示 ${Math.min(limit,rows.length)} 項`;
  root.querySelector('.tf-results').innerHTML=rows.slice(0,limit).map(r=>`<article class="tf-result"><div class="tf-meta" data-part="${esc(r.section)}"><small>${esc([r.year,r.set,r.section,r.number?'Q'+r.number:''].filter(Boolean).join(' · '))}</small><h3>${esc(r.title)}</h3></div><div><p lang="en">${esc(r.text)}</p>${r.translation?`<p lang="zh-Hant">（${esc(r.translation)}）</p>`:''}<div class="tf-tags">${r.themes.map(id=>`<span>${esc(labels.get(id)?.zh)}</span>`).join('')}</div><a class="tf-open" href="${esc(r.href)}" data-open="${esc(r.id)}">開始練習 · Open →</a></div></article>`).join('')||'<p>沒有符合的練習，請嘗試其他主題或搜尋字詞。</p>';
  root.querySelector('[data-more]').hidden=rows.length<=limit;
  root.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===selected)));
 }
 root.addEventListener('input',()=>{limit=30;render()},events);root.addEventListener('change',()=>{limit=30;render()},events);
 root.addEventListener('click',e=>{const t=e.target.closest('[data-theme]'),a=e.target.closest('[data-open]');if(t){selected=selected===t.dataset.theme?'':t.dataset.theme;limit=30;render()}else if(e.target.closest('[data-clear]')){selected='';search.value='';section.value='';if(year)year.value='';limit=30;render()}else if(e.target.closest('[data-more]')){limit+=30;render()}else if(a&&onOpen&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onOpen(data.rows.find(r=>r.id===a.dataset.open));}},events);
 render();return {destroy(){root.replaceChildren()}};
}
