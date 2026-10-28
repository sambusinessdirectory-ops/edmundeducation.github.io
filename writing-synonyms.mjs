export function searchSynonymLessons(entries, query, limit = 50) {
  const term = String(query || '').normalize('NFKC').toLocaleLowerCase().trim();
  if (!term) return [];
  const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase();
  return entries.map(entry => {
    const head = normalize(entry.headword);
    const words = (entry.terms || []).map(([word, meaning]) => normalize(word) + ' ' + normalize(meaning));
    const score = head === term ? 0 : head.startsWith(term) ? 1 : words.some(word => word.split(' ')[0] === term) ? 2 : head.includes(term) ? 3 : words.some(word => word.includes(term)) ? 4 : normalize(entry.subtitle).includes(term) ? 5 : -1;
    return {entry, score};
  }).filter(item => item.score >= 0).sort((a,b) => a.score - b.score).slice(0,limit).map(item => item.entry);
}
export function synonymPracticeUrl(id, view = 'question') {
  return `synonyms-system.html?embed=writing#${encodeURIComponent(id)}:${view === 'guide' ? 'guide' : 'question'}`;
}
export function mountWritingSynonyms({getSession}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'writing-synonyms-dialog';
  dialog.setAttribute('aria-labelledby','writing-synonyms-title');
  dialog.innerHTML = `<header><div><h2 id="writing-synonyms-title">同義詞搜尋／練習</h2><p>搜尋字詞或中文意思，查看現有教材並即時練習。</p></div><button type="button" data-syn-close aria-label="關閉同義詞搜尋">關閉 ×</button></header><form><label for="writing-synonyms-search">搜尋詞語</label><div class="writing-synonyms-search"><input id="writing-synonyms-search" type="search" placeholder="例如 help、assist、重要" autocomplete="off"><button type="submit">搜尋</button></div></form><p data-syn-status role="status" aria-live="polite">輸入詞語開始搜尋。</p><div data-syn-results></div><section data-syn-practice hidden><div class="writing-synonyms-practice-bar"><strong data-syn-lesson></strong><button type="button" data-syn-back>返回搜尋</button></div><p>練習會沿用同義詞系統的學生帳戶和進度。</p><iframe title="同義詞互動練習" allow="microphone 'self'" hidden></iframe></section>`;
  document.body.append(dialog);
  const input = dialog.querySelector('input'), status = dialog.querySelector('[data-syn-status]'), results = dialog.querySelector('[data-syn-results]'), practice = dialog.querySelector('[data-syn-practice]'), frame = dialog.querySelector('iframe');
  let index = null, loading = null, ticket = 0, focusBefore;
  async function search() {
    const current = ++ticket;
    if (!input.value.trim()) {results.replaceChildren();status.textContent='輸入詞語開始搜尋。';return;}
    status.textContent = '正在搜尋同義詞教材……';
    try {
      if (!index) {
        loading ||= fetch(new URL('./synonyms/writing-search-index.json?v=20261028-examples1', import.meta.url)).then(response => {if(!response.ok)throw new Error();return response.json();}).catch(error => {loading=null;throw error;});
        index = await loading;
      }
      if(current !== ticket || !dialog.open)return;
      const matches = searchSynonymLessons(index,input.value);
      results.replaceChildren();
      status.textContent = matches.length ? `找到 ${matches.length}${matches.length === 50 ? '（先顯示首 50 項）' : ' 項'}教材。` : '沒有找到相符詞語，請試試其他字詞或中文意思。';
      for (const entry of matches) {
        const card = document.createElement('article'), title = document.createElement('h3'), summary = document.createElement('p'), words = document.createElement('p'), actions = document.createElement('div');
        title.textContent = entry.title;summary.textContent = entry.subtitle;
        words.textContent = entry.terms.slice(0,14).map(([word,meaning])=>`${word}（${meaning}）`).join(' · ');
        card.append(title,summary,words,actions);
        const details=document.createElement('details'), toggle=document.createElement('summary'), guide=document.createElement('section');
        toggle.textContent='查看同義詞、例句及中文翻譯';details.append(toggle,guide);card.append(details);
        let loaded=false;
        details.addEventListener('toggle',async()=>{
          if(!details.open||loaded)return;loaded=true;guide.textContent='正在載入例句…';
          try{
            const lesson=entry.id==='important'?(await import('./synonyms/important-data.mjs')).importantModule
              :entry.id==='social-media'?(await import('./synonyms/social-media-data.mjs')).socialMediaModule
              :await fetch(new URL('./synonyms/'+entry.dataFile.replace(/^\.\//,''),import.meta.url)).then(r=>{if(!r.ok)throw new Error();return r.json();});
            guide.replaceChildren();
            for(const word of lesson.words){
              const first=word.exercises?.[0], item=document.createElement('div');item.className='writing-synonym-example';
              for(const [tag,cls,value] of [['h4','',word.word],['strong','',word.meaning],['p','',word.note||''],['p','example-en',word.example||first?.upgrade?.replace('______',word.word)||first?.original||''],['p','example-zh',word.exampleZh||first?.zh||'']]){
                if(!value)continue;const node=document.createElement(tag);node.className=cls;node.textContent=value;if(cls==='example-en')node.lang='en';item.append(node);
              }
              guide.append(item);
            }
          }catch{loaded=false;guide.textContent='未能載入例句。請收起後再展開重試。';}
        });
        for (const [view,label] of [['guide','同義詞指南'],['question',`練習題目（${entry.questions}）`]]) {
          const button = document.createElement('button');button.type='button';button.textContent=label;button.disabled=view==='question'&&!entry.questions;
          button.addEventListener('click',()=>{
            practice.hidden=false;results.hidden=true;dialog.querySelector('form').hidden=true;status.hidden=true;
            dialog.querySelector('[data-syn-lesson]').textContent=entry.title;
            frame.hidden=false;frame.src=synonymPracticeUrl(entry.id,view);
          });actions.append(button);
        }
        results.append(card);
      }
    } catch {if(current===ticket)status.textContent='教材載入失敗，請按搜尋重試。';}
  }
  function back(){frame.removeAttribute('src');frame.hidden=true;practice.hidden=true;results.hidden=false;dialog.querySelector('form').hidden=false;status.hidden=false;input.focus();}
  function close(){ticket++;if(dialog.open)dialog.close();frame.removeAttribute('src');}
  dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();void search();});
  let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,180);});
  dialog.querySelector('[data-syn-back]').addEventListener('click',back);
  dialog.querySelector('[data-syn-close]').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  dialog.addEventListener('close',()=>{frame.removeAttribute('src');focusBefore?.focus();});
  function open(button=document.activeElement){
    focusBefore=button;back();dialog.showModal();input.focus();
    if(input.value)void search();
    if(!getSession())status.textContent='可搜尋教材；練習及儲存進度需要學生登入。';
  }
  document.querySelectorAll('[data-writing-synonyms]').forEach(button=>button.addEventListener('click',()=>open(button)));
  return {close,open};
}
