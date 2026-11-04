const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountQuestionTypeFinder(root, { data, kind, onOpen, selected = '' }) {
  if (!root?.isConnected) return;
  const speaking = kind === 'speaking';
  let query = '', section = '', year = '', limit = 40;
  if (!document.querySelector('[data-question-type-style]')) {
    const css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('./question-type-finder.css?v=20260911',import.meta.url);css.dataset.questionTypeStyle='';document.head.append(css);
  }
  root.classList.add('question-type-finder');
  root.innerHTML = `<div class="qtf-search"><label>搜尋題型或題目（英文或中文）<input type="search" data-qtf-query placeholder="${speaking?'例如 Advantages、好處、建議…':'例如 Matching、配對、表格…'}"></label><button type="button" data-qtf-clear>清除</button></div><p class="qtf-total">${Object.keys(data.labels).length} 種題型 · ${speaking?`${data.setCount} 套題目 · ${data.questionCount} 條問題`:`${data.practiceCount} 套練習 · ${data.partCount} 個部分 · ${data.questionCount} 題`}</p>${speaking?'<p class="qtf-total">同一問題可涉及多種題型，並會在相關分類中出現。</p>':''}<div class="qtf-grid" data-qtf-types></div>${speaking?`<div class="qtf-refine"><label>練習部分<select data-qtf-section><option value="">全部</option><option value="group">小組討論</option><option value="individual">個人發言</option></select></label><label>年份<select data-qtf-year><option value="">所有年份</option>${[...new Set(data.rows.map(r=>r.year))].sort((a,b)=>b-a).map(y=>`<option>${y}</option>`).join('')}</select></label></div>`:''}<h3 data-qtf-heading>選擇一種題型</h3><p data-qtf-status role="status">點選題型，即可找到相應題目。</p><div class="qtf-results" data-qtf-results></div><button type="button" class="qtf-more" data-qtf-more hidden>顯示更多題目</button>`;
  const sectionPicker = root.querySelector('[data-qtf-section]');
  const grid=root.querySelector('[data-qtf-types]'), results=root.querySelector('[data-qtf-results]');
  function render() {
    const term=query.normalize('NFKC').toLocaleLowerCase().trim();
    const matchingTypes=Object.keys(data.labels).filter(type=>!term||data.labels[type].join(' ').toLocaleLowerCase().includes(term));
    grid.innerHTML=Object.entries(data.labels).map(([type,[en,zh]])=>`<button type="button" class="qtf-type" data-qtf-type="${type}" aria-pressed="${selected===type}"${term&&!matchingTypes.includes(type)?' hidden':''}><span><strong>${esc(en)}</strong><small>${esc(zh)}</small></span><b>${data.counts[type].questions} 題</b></button>`).join('');
    const rows=data.rows.filter(row=>(!selected||(row.types||[row.type]).includes(selected))&&(!section||row.section===section)&&(!year||row.year===Number(year))&&(!term||(row.types||[row.type]).some(t=>matchingTypes.includes(t))||`${row.title||''} ${row.text||''} ${row.translation||''} ${(row.questions||[]).map(q=>q.prompt).join(' ')} Practice ${row.practice||''} ${row.year||''}`.toLocaleLowerCase().includes(term)));
    const active = selected || term || section || year;
    root.querySelector('[data-qtf-heading]').textContent=selected?data.labels[selected].slice(0,2).join(' · '):active?'搜尋結果':'選擇一種題型';
    root.querySelector('[data-qtf-status]').textContent=active?(speaking?`${rows.length} 條問題 · ${new Set(rows.map(r=>`${r.year}:${r.set}`)).size} 套題目`:`${rows.reduce((n,r)=>n+r.last-r.first+1,0)} 題 · ${rows.length} 組 · ${new Set(rows.map(r=>`${r.practice}:${r.part}`)).size} 個部分`):'點選題型，即可找到相應題目。';
    results.innerHTML=!active?'':!rows.length?'<p>沒有符合的題目，請清除或更改篩選。</p>':rows.slice(0,limit).map(row=> speaking?`<article class="qtf-result"><p class="qtf-meta">${row.year} DSE · ${esc(row.set)} · ${row.section==='group'?'小組討論':'個人發言'} · 第 ${row.number} 題</p><h4>${esc(row.title)}</h4><p lang="en">${esc(row.text)}</p>${row.translation?`<p lang="zh-Hant" class="qtf-translation">${esc(row.translation)}</p>`:''}<div class="qtf-tags">${row.types.map(t=>`<span>${esc(data.labels[t][1])}</span>`).join('')}</div><a href="${esc(row.href)}" data-qtf-open="${esc(row.id)}">查看指定題目及原題 →</a></article>`:`<article class="qtf-result"><p class="qtf-meta">Practice ${row.practice} · Part ${row.part}</p><h4>${esc(data.labels[row.type][0])}<small>${esc(data.labels[row.type][1])} · Questions ${row.first}–${row.last}</small></h4><details><summary>查看這組題目</summary>${row.questions.map(q=>`<p><b>${q.numbers.join('–')}.</b> ${esc(q.prompt)}</p>`).join('')}</details><a href="${esc(row.href)}" data-qtf-open="${esc(row.id)}">前往第 ${row.first} 題 →</a></article>`).join('');
    root.querySelector('[data-qtf-more]').hidden=!active||rows.length<=limit;
  }
  root.addEventListener('click',event=>{
    const type=event.target.closest('[data-qtf-type]');
    if(type){selected=selected===type.dataset.qtfType?'':type.dataset.qtfType;limit=40;render();root.querySelector('[data-qtf-heading]').scrollIntoView({behavior:'smooth',block:'start'});}
    if(event.target.closest('[data-qtf-clear]')){selected=query=section=year='';limit=40;root.querySelector('input').value='';root.querySelectorAll('select').forEach(s=>s.value='');render();}
    if(event.target.closest('[data-qtf-more]')){limit+=40;render();}
    const link=event.target.closest('[data-qtf-open]');if(link&&onOpen&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onOpen(data.rows.find(r=>r.id===link.dataset.qtfOpen));}
  });
  root.querySelector('[data-qtf-query]').addEventListener('input',e=>{query=e.target.value;limit=40;render();});
  sectionPicker?.addEventListener('change',e=>{section=e.target.value;limit=40;render();});
  root.querySelector('[data-qtf-year]')?.addEventListener('change',e=>{year=e.target.value;limit=40;render();});
  render();
}
