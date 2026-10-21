const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function mountIeltsPart3Finder(root, data, onOpen) {
  if (!root?.isConnected) return;
  if (!document.querySelector('[data-question-type-style]')) {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet'; sheet.href = 'question-type-finder.css?v=20261021-ielts1';
    sheet.dataset.questionTypeStyle = ''; document.head.append(sheet);
  }
  root.classList.add('question-type-finder');
  let selected = '', search = '', book = '', limit = 40;
  root.innerHTML = `<div class="qtf-search"><label>搜尋題型或問題（英文或中文）<input data-ielts-type-search type="search" placeholder="例如 your country、should、比較…"></label><button type="button" data-ielts-type-clear>清除</button></div><p class="qtf-total">${data.questionCount} 條 Part 3 題目 · ${data.bookCount} 本 · ${Object.keys(data.labels).length} 種題型</p><p class="qtf-total">同一道題可屬多種題型；「你的國家」和「應否」會分別標示，可交叉搜尋。</p><div class="qtf-grid" data-ielts-type-grid></div><div class="qtf-refine"><label>Book<select data-ielts-type-book><option value="">全部 Books</option>${Array.from({ length: data.bookCount }, (_, i) => `<option value="${i + 1}">Book ${i + 1}</option>`).join('')}</select></label></div><h3 data-ielts-type-heading>選擇題型</h3><p data-ielts-type-status role="status"></p><div class="qtf-results" data-ielts-type-results></div><button type="button" class="qtf-more" data-ielts-type-more hidden>顯示更多題目</button>`;
  const grid = root.querySelector('[data-ielts-type-grid]');
  const results = root.querySelector('[data-ielts-type-results]');
  const render = () => {
    const needle = search.normalize('NFKC').toLocaleLowerCase().trim();
    grid.innerHTML = Object.entries(data.labels).map(([type, [en, zh]]) => `<button class="qtf-type" type="button" data-ielts-type="${type}" aria-pressed="${selected === type}"><span><strong>${esc(en)}</strong><small>${esc(zh)}</small></span><b>${data.counts[type]} 題</b></button>`).join('');
    const rows = data.rows.filter(row => (!selected || row.types.includes(selected)) && (!book || row.book === Number(book)) && (!needle || `${row.text} ${row.translation} ${row.theme} Book ${row.book} ${row.types.map(type => data.labels[type].join(' ')).join(' ')}`.normalize('NFKC').toLocaleLowerCase().includes(needle)));
    const active = selected || book || needle;
    root.querySelector('[data-ielts-type-heading]').textContent = selected ? data.labels[selected].join(' · ') : active ? '搜尋結果' : '選擇題型';
    root.querySelector('[data-ielts-type-status]').textContent = active ? `${rows.length} 條題目` : '請選擇一種題型，或搜尋題目內容。';
    results.innerHTML = !active ? '' : rows.length ? rows.slice(0, limit).map(row => `<article class="qtf-result"><p class="qtf-meta">Book ${row.book} · Question ${row.number} · ${esc(row.theme)}</p><h4 lang="en">${esc(row.text)}</h4><p lang="zh-Hant" class="qtf-translation">${esc(row.translation)}</p><div class="qtf-tags">${row.types.map(type => `<span>${esc(data.labels[type][1])}</span>`).join('')}</div><a href="${esc(row.href)}" data-ielts-type-open="${esc(row.id)}">前往這道題 →</a></article>`).join('') : '<p>沒有相符題目，請更改篩選。</p>';
    root.querySelector('[data-ielts-type-more]').hidden = !active || rows.length <= limit;
  };
  root.addEventListener('click', event => {
    const type = event.target.closest('[data-ielts-type]');
    if (type) { selected = selected === type.dataset.ieltsType ? '' : type.dataset.ieltsType; limit = 40; render(); return; }
    if (event.target.closest('[data-ielts-type-clear]')) { selected = search = book = ''; limit = 40; root.querySelector('input').value = ''; root.querySelector('select').value = ''; render(); return; }
    if (event.target.closest('[data-ielts-type-more]')) { limit += 40; render(); return; }
    const link = event.target.closest('[data-ielts-type-open]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault(); onOpen(data.rows.find(row => row.id === link.dataset.ieltsTypeOpen));
    }
  });
  root.querySelector('[data-ielts-type-search]').addEventListener('input', event => { search = event.target.value; limit = 40; render(); });
  root.querySelector('[data-ielts-type-book]').addEventListener('change', event => { book = event.target.value; limit = 40; render(); });
  render();
}
