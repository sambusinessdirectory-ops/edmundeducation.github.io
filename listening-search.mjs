const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize=text=>String(text??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const tokens=query=>[...new Set(normalize(query).split(' ').filter(Boolean))];
export function searchEntries(entries,query){
 const terms=tokens(query);if(normalize(query).length<2)return [];
 return entries.map(entry=>({entry,title:normalize(entry.title),text:normalize(entry.text)}))
  .filter(({entry,title,text})=>terms.every(term=>`${entry.year||entry.practice} ${title} ${text}`.includes(term)))
  .map(({entry,title})=>({...entry,score:terms.reduce((n,t)=>n+(title.includes(t)?3:0),0)}))
  .sort((a,b)=>b.score-a.score || (a.section==='dse'?b.year-a.year:a.practice-b.practice) || a.part-b.part);
}
export function resultHref(entry){
 if(!Number.isInteger(entry.part)||entry.part<1||entry.part>4)throw Error('Invalid listening part');
 if(entry.section==='dse'&&Number.isInteger(entry.year)&&entry.year>=2012&&entry.year<=2026)return `listening-system.html?section=dse&year=${entry.year}&task=${entry.part}`;
 if(entry.section==='ielts'&&Number.isInteger(entry.practice)&&entry.practice>0)return `listening-system.html?section=ielts&practice=${entry.practice}&part=${entry.part}`;
 throw Error('Invalid listening result');
}
export function highlightedSnippet(text,query){
 const terms=tokens(query),plain=String(text||''),lower=normalize(plain);
 const positions=terms.map(t=>lower.indexOf(t)).filter(n=>n>=0),start=Math.max(0,(positions.length?Math.min(...positions):0)-65);
 const excerpt=plain.slice(start,start+230),pattern=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 // Escape fragments, not a combined HTML string: search text can never introduce markup.
 let out='',cursor=0;
 if(pattern)for(const match of excerpt.matchAll(new RegExp(pattern,'gi'))){out+=escape(excerpt.slice(cursor,match.index))+`<mark>${escape(match[0])}</mark>`;cursor=match.index+match[0].length;}
 out+=escape(excerpt.slice(cursor));return `${start?'…':''}${out}${start+230<plain.length?'…':''}`;
}
const pending=new Map();
export async function loadSearchIndex(section){
 if(!['dse','ielts'].includes(section))throw Error('Invalid listening library');
 if(!pending.has(section))pending.set(section,fetch(`assets/listening/search/${section}.json?v=20260904-archiveguides1`,{credentials:'omit'})
  .then(async response=>{if(!response.ok)throw Error('搜尋資料暫時未能載入，請再按「搜尋」重試。');return response.json();})
  .then(data=>{if(data.version!==1||!Array.isArray(data.entries))throw Error('搜尋資料格式不正確。');return data.entries;})
  .catch(error=>{pending.delete(section);throw error;}));
 return pending.get(section);
}
export function mountListeningSearch(root,{loadIndex=loadSearchIndex,onOpen}={}){
 const section=root.dataset.listeningSearch,input=root.querySelector('input'),form=root.querySelector('form');
 const status=root.querySelector('[data-search-status]'),results=root.querySelector('[data-search-results]'),more=root.querySelector('[data-search-more]');
 let revision=0,timer,matches=[],limit=12,query='';
 const draw=()=>{
  results.hidden=!matches.length;more.hidden=matches.length<=limit;
  results.innerHTML=matches.slice(0,limit).map(entry=>`<a class="listening-search-result" href="${resultHref(entry)}" data-search-id="${escape(entry.id)}"><strong>${entry.section==='dse'?`${entry.year} · Task ${entry.part}`:`Practice ${entry.practice} · Part ${entry.part}`} — ${escape(entry.title)}</strong><span>${highlightedSnippet(entry.text,query)}</span><small>前往${entry.section==='dse'?' Task':' Part'} ${entry.part} →</small></a>`).join('');
 };
 const run=async()=>{
  clearTimeout(timer);const current=++revision;query=input.value.trim();limit=12;
  matches=[];draw();
  if(normalize(query).length<2){status.textContent='輸入至少 2 個字元，搜尋題目及錄音稿。';return;}
  status.textContent='正在搜尋…';
  try{
   const entries=await loadIndex(section);if(current!==revision)return;
   matches=searchEntries(entries,query);draw();
   status.textContent=matches.length?`找到 ${matches.length} 個相關${section==='dse'?' Task':' Part'}。`:'找不到相關內容，請嘗試其他關鍵字。';
  }catch(error){if(current===revision)status.textContent=error.message||'搜尋暫時未能使用，請重試。';}
 };
 input.addEventListener('input',()=>{clearTimeout(timer);++revision;timer=setTimeout(run,220);});
 form.addEventListener('submit',event=>{event.preventDefault();void run();});
 more.addEventListener('click',()=>{limit+=12;draw();});
 results.addEventListener('click',event=>{
  const link=event.target.closest('[data-search-id]');
  if(!link||!onOpen||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const entry=matches.find(item=>item.id===link.dataset.searchId);if(!entry)return;
  event.preventDefault();onOpen(entry);
 });
}
