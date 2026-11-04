const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountQuestionTypeFinder(root, {data, kind, onOpen, selected = ''}) {
  if (!root?.isConnected) return;
  const speaking = kind === 'speaking';
  const dse = kind === 'dse-listening';
  let query = '', section = '', year = '', limit = 40;
  if (!document.querySelector('[data-question-type-style]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = new URL('./question-type-finder.css?v=20261104-dse1', import.meta.url);
    css.dataset.questionTypeStyle = '';
    document.head.append(css);
  }
  root.classList.add('question-type-finder');
  if (dse) root.classList.add('question-type-finder--dse');
  const placeholder = speaking ? '例如 Advantages、好處、建議…' : dse ? '例如 地圖、表格、2020、Tiny Libraries…' : '例如 Matching、配對、表格…';
  const total = speaking
    ? `${data.setCount} 套題目 · ${data.questionCount} 條問題`
    : dse ? `${data.paperCount} 個年份 · ${data.taskCount} 個 Task · ${data.questionCount} 題`
    : `${data.practiceCount} 套練習 · ${data.partCount} 個部分 · ${data.questionCount} 題`;
  const yearOptions = [...new Set(data.rows.map(row => row.year))].sort((a,b) => b-a).map(value => `<option value="${value}">${value}</option>`).join('');
  const refine = speaking
    ? `<div class="qtf-refine"><label>練習部分<select data-qtf-section><option value="">全部</option><option value="group">小組討論</option><option value="individual">個人發言</option></select></label><label>年份<select data-qtf-year><option value="">所有年份</option>${yearOptions}</select></label></div>`
    : dse ? `<div class="qtf-refine"><label>年份<select data-qtf-year><option value="">所有年份</option>${yearOptions}</select></label><label>Task<select data-qtf-section><option value="">全部 Task</option>${[1,2,3,4].map(value=>`<option value="${value}">Task ${value}</option>`).join('')}</select></label></div>` : '';
  root.innerHTML = `<div class="qtf-search"><label>搜尋題型或題目（英文或中文）<input type="search" data-qtf-query placeholder="${placeholder}"></label><button type="button" data-qtf-clear>清除</button></div><p class="qtf-total">${Object.keys(data.labels).length} 種題型 · ${total}</p>${speaking||dse?'<p class="qtf-total">同一題可涉及多種題型，並會在相關分類中出現。</p>':''}<div class="qtf-grid" data-qtf-types></div>${refine}<h3 data-qtf-heading>選擇一種題型</h3><p data-qtf-status role="status">點選題型，即可找到相應題目。</p><div class="qtf-results" data-qtf-results></div><button type="button" class="qtf-more" data-qtf-more hidden>顯示更多題目</button>`;
  const grid = root.querySelector('[data-qtf-types]');
  const results = root.querySelector('[data-qtf-results]');
  const queryInput = root.querySelector('[data-qtf-query]');
  const sectionPicker = root.querySelector('[data-qtf-section]');
  const yearPicker = root.querySelector('[data-qtf-year]');
  const more = root.querySelector('[data-qtf-more]');

  const resultCard = row => {
    if (speaking) return `<article class="qtf-result"><p class="qtf-meta">${row.year} DSE · ${esc(row.set)} · ${row.section==='group'?'小組討論':'個人發言'} · 第 ${row.number} 題</p><h4>${esc(row.title)}</h4><p lang="en">${esc(row.text)}</p>${row.translation?`<p lang="zh-Hant" class="qtf-translation">${esc(row.translation)}</p>`:''}<div class="qtf-tags">${row.types.map(type=>`<span>${esc(data.labels[type][1])}</span>`).join('')}</div><a href="${esc(row.href)}" data-qtf-open="${esc(row.id)}">查看指定題目及原題 →</a></article>`;
    if (dse) return `<article class="qtf-result"><p class="qtf-meta">${row.year} DSE · Task ${row.task} · 第 ${row.number} 題</p><h4>${esc(row.title)}</h4><p lang="en">${esc(row.text)}</p><div class="qtf-tags">${row.types.map(type=>`<span>${esc(data.labels[type][1])}</span>`).join('')}</div><a href="${esc(row.href)}" data-qtf-open="${esc(row.id)}">前往第 ${row.number} 題 →</a></article>`;
    return `<article class="qtf-result"><p class="qtf-meta">Practice ${row.practice} · Part ${row.part}</p><h4>${esc(data.labels[row.type][0])}<small>${esc(data.labels[row.type][1])} · Questions ${row.first}–${row.last}</small></h4><details><summary>查看這組題目</summary>${row.questions.map(question=>`<p><b>${question.numbers.join('–')}.</b> ${esc(question.prompt)}</p>`).join('')}</details><a href="${esc(row.href)}" data-qtf-open="${esc(row.id)}">前往第 ${row.first} 題 →</a></article>`;
  };
  function render() {
    const term = query.normalize('NFKC').toLocaleLowerCase().trim();
    const matchingTypes = Object.keys(data.labels).filter(type=>!term||data.labels[type].join(' ').toLocaleLowerCase().includes(term));
    grid.innerHTML = Object.entries(data.labels).map(([type,[en,zh]])=>`<button type="button" class="qtf-type" data-qtf-type="${type}" aria-pressed="${selected===type}"${term&&!matchingTypes.includes(type)?' hidden':''}><span><strong>${esc(en)}</strong><small>${esc(zh)}</small></span><b>${data.counts[type].questions} 題</b></button>`).join('');
    const rows = data.rows.filter(row => {
      const types = row.types || [row.type];
      if (selected && !types.includes(selected)) return false;
      if (section && (dse ? row.task !== Number(section) : row.section !== section)) return false;
      if (year && row.year !== Number(year)) return false;
      if (!term) return true;
      const searchable = `${row.title||''} ${row.text||''} ${row.translation||''} ${(row.questions||[]).map(q=>q.prompt).join(' ')} Practice ${row.practice||''} ${row.year||''} ${row.task||''} ${row.number||''}`.toLocaleLowerCase();
      return types.some(type=>matchingTypes.includes(type)) || searchable.includes(term);
    });
    const active = selected || term || section || year;
    root.querySelector('[data-qtf-heading]').textContent = selected ? data.labels[selected].slice(0,2).join(' · ') : active ? '搜尋結果' : '選擇一種題型';
    root.querySelector('[data-qtf-status]').textContent = !active ? '點選題型，即可找到相應題目。' : speaking
      ? `${rows.length} 條問題 · ${new Set(rows.map(row=>`${row.year}:${row.set}`)).size} 套題目`
      : dse ? `${rows.length} 題 · ${new Set(rows.map(row=>`${row.year}:${row.task}`)).size} 個 Task · ${new Set(rows.map(row=>row.year)).size} 個年份`
      : `${rows.reduce((n,row)=>n+row.last-row.first+1,0)} 題 · ${rows.length} 組 · ${new Set(rows.map(row=>`${row.practice}:${row.part}`)).size} 個部分`;
    results.innerHTML = !active ? '' : !rows.length ? '<p>沒有符合的題目，請清除或更改篩選。</p>' : rows.slice(0,limit).map(resultCard).join('');
    more.hidden = !active || rows.length <= limit;
  }
  root.addEventListener('click', event => {
    const type = event.target.closest('[data-qtf-type]');
    if (type) { selected = selected===type.dataset.qtfType ? '' : type.dataset.qtfType; limit=40; render(); root.querySelector('[data-qtf-heading]').scrollIntoView({behavior:'smooth',block:'start'}); }
    if (event.target.closest('[data-qtf-clear]')) { selected=query=section=year=''; limit=40; queryInput.value=''; root.querySelectorAll('select').forEach(select=>select.value=''); render(); }
    if (event.target.closest('[data-qtf-more]')) { limit+=40; render(); }
    const link = event.target.closest('[data-qtf-open]');
    if (link && onOpen && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpen(data.rows.find(row=>row.id===link.dataset.qtfOpen)); }
  });
  queryInput.addEventListener('input', event => {query=event.target.value;limit=40;render();});
  sectionPicker?.addEventListener('change', event => {section=event.target.value;limit=40;render();});
  yearPicker?.addEventListener('change', event => {year=event.target.value;limit=40;render();});
  render();
}
