export function mountPaper3Search(root, openResult) {
 let rows, pending;
 root.innerHTML='<label>搜尋所有年份的全文<input type="search" placeholder="例如 wellness month" autocomplete="off"></label><p role="status" data-paper-search-status>搜尋 Data File、題目、範文、分析及 Part B 錄音稿。</p><div data-paper-search-results></div><button type="button" class="secondary-button" data-paper-search-more hidden>顯示更多</button>';
 const input=root.querySelector('input'),status=root.querySelector('[role=status]'),results=root.querySelector('[data-paper-search-results]'),more=root.querySelector('button');
 let generation=0,limit=30;
 async function search(reset=true){
  const current=++generation,term=input.value.normalize('NFKC').toLocaleLowerCase().trim();if(reset)limit=30;
  if(!term){results.replaceChildren();more.hidden=true;status.textContent='輸入關鍵字搜尋所有已提供的年份及卷別。';return;}
  status.textContent='正在搜尋…';
  try {
   if(!rows){pending||=fetch('paper3-search-index.json?v=20260906').then(r=>{if(!r.ok)throw Error();return r.json();}).finally(()=>{pending=null;});rows=await pending;}
   if(current!==generation)return;
   const matches=rows.filter(row=>`${row.year} ${row.level} ${row.title} ${row.text}`.normalize('NFKC').toLocaleLowerCase().includes(term));
   status.textContent=`${matches.length} 個結果`;results.replaceChildren();more.hidden=matches.length<=limit;
   for(const row of matches.slice(0,limit)){
    const card=document.createElement('article');card.className='paper-search-result';
    const heading=document.createElement('strong');heading.textContent=`${row.year} · ${row.level} · ${row.title}`;
    const snippet=document.createElement('p');const index=row.text.toLocaleLowerCase().indexOf(term);const start=Math.max(0,index-90);snippet.textContent=(start?'…':'')+row.text.slice(start,start+320)+(row.text.length>start+320?'…':'');
    const open=document.createElement(row.url?'a':'button');open.className='secondary-button';open.textContent='前往原文 →';
    if(row.url){open.href=row.url+(row.anchor?'#'+encodeURIComponent(row.anchor):'')+':~:text='+encodeURIComponent(row.text.slice(Math.max(0,index),Math.max(0,index)+60));if(!row.anchor)open.href=row.url+'#:~:text='+encodeURIComponent(row.text.slice(Math.max(0,index),Math.max(0,index)+60));}
    else {open.type='button';open.addEventListener('click',()=>openResult(row));}
    card.append(heading,snippet,open);results.append(card);
   }
  }catch{if(current===generation){status.textContent='搜尋資料未能載入，請重新搜尋。';const retry=document.createElement('button');retry.textContent='重試';retry.addEventListener('click',()=>search());status.append(retry);}}
 }
 input.addEventListener('input',()=>search());more.addEventListener('click',()=>{limit+=30;search(false);});
}
