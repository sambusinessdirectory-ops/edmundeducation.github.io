const placementByFunction = Object.freeze({
  'intro-background': 'I-BG', 'intro-transition': 'I-TR', 'intro-effect': 'I-EF',
  'intro-stance': 'I-ST', 'intro-thesis': 'I-TH',
  'body1-topic': 'B1-TP', 'body1-explanation': 'B1-EX', 'body1-examples': 'B1-EG',
  'body1-action': 'B1-AP', 'body1-conclusion': 'B1-CL',
  'body2-topic': 'B2-TP', 'body2-explanation': 'B2-EX', 'body2-examples': 'B2-EG',
  'body2-action': 'B2-AP', 'body2-conclusion': 'B2-CL',
  'rebuttal-opponent-topic': 'R-OT', 'rebuttal-opponent-explanations': 'R-OX',
  'rebuttal-opponent-examples': 'R-OE', 'rebuttal-opponent-conclusion': 'R-OC',
  'rebuttal-your-topic': 'R-YT', 'rebuttal-your-explanations': 'R-YX',
  'rebuttal-your-examples': 'R-YE', 'rebuttal-your-conclusions': 'R-YC',
  'conclusion-stance': 'C-ST', 'conclusion-arguments': 'C-AR',
  'conclusion-action': 'C-AP', 'conclusion-closing': 'C-CL'
});

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const generalFunction = { id: 'across-sections', title: 'Across sections', titleZh: '跨段落通用句型' };

export function mountSentenceSupport(root, writingFunctions) {
  if (!root) return { open() {}, close() {} };
  const toggle = root.querySelector('[data-structure-toggle]');
  const panel = root.querySelector('[data-structure-panel]');
  const select = root.querySelector('[data-structure-function]');
  const search = root.querySelector('[data-structure-search]');
  const results = root.querySelector('[data-structure-results]');
  const heading = root.querySelector('[data-structure-heading]');
  const count = root.querySelector('[data-structure-count]');
  const more = root.querySelector('[data-structure-more]');
  let catalog = null;
  let loading = null;
  let active = writingFunctions[0]?.id || '';
  let visibleCount = 30;

  let group = '';
  select.innerHTML = writingFunctions.map(item => {
    const prefix = item.group !== group ? `${group ? '</optgroup>' : ''}<optgroup label="${escapeHtml(item.group)} · ${escapeHtml(item.groupZh)}">` : '';
    group = item.group;
    return `${prefix}<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)} · ${escapeHtml(item.titleZh)}</option>`;
  }).join('') + `</optgroup><option value="${generalFunction.id}">${generalFunction.title} · ${generalFunction.titleZh}</option>`;

  const matches = () => {
    const tag = placementByFunction[active];
    const query = search.value.trim().toLocaleLowerCase();
    return (catalog || []).filter(item => (active === generalFunction.id
      ? item.tags.some(value => value.startsWith('F-')) : item.tags.includes(tag)) && (
      !query || `${item.id} ${item.formula} ${item.meaning} ${item.usage} ${item.example}`.toLocaleLowerCase().includes(query)
    )).sort((left, right) => right.sourceRows - left.sourceRows || left.id.localeCompare(right.id));
  };

  function render() {
    const current = writingFunctions.find(item => item.id === active) || generalFunction;
    heading.textContent = `${current.title} · ${current.titleZh}`;
    select.value = current.id;
    if (!catalog) return;
    const items = matches();
    count.textContent = `${items.length} 個適用句型`;
    results.innerHTML = items.length ? items.slice(0, visibleCount).map(item => {
      const example = item.example
        ? `<p lang="en">${escapeHtml(item.example)}</p><small>${escapeHtml(item.source)}</small>${item.sourceUrl ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">在 Writing Practice 查看來源 ↗</a>` : ''}`
        : '<p>目前的 Writing Practice 題庫未收錄這條來源原句。</p>';
      return `<article class="writing-structure-card"><button type="button" class="writing-structure-formula" data-structure-preview aria-expanded="false"><span>${escapeHtml(item.id)} · ${item.sourceRows} 筆來源</span><strong>${escapeHtml(item.formula)}</strong><em>移入游標或按一下查看原文例句</em></button><p class="writing-structure-meaning">${escapeHtml(item.meaning)}</p><p class="writing-structure-usage">${escapeHtml(item.usage)}</p><div class="writing-structure-example"><strong>Writing Practice 原文例句</strong>${example}</div></article>`;
    }).join('') : '<p class="writing-structure-empty">這個句子功能暫無已標註的句型。可在上方選擇另一個功能。</p>';
    more.hidden = items.length <= visibleCount;
  }

  async function load() {
    if (catalog) return;
    if (!loading) {
      loading = fetch('writing-sentence-support-data.json?v=20261021-1', { cache: 'force-cache' })
        .then(response => {
          if (!response.ok) throw new Error('Catalog unavailable');
          return response.json();
        })
        .then(rows => {
          if (!Array.isArray(rows)) throw new Error('Invalid catalog');
          catalog = rows;
        })
        .finally(() => { loading = null; });
    }
    await loading;
  }

  async function open(id = active) {
    if (placementByFunction[id] || id === generalFunction.id) active = id;
    visibleCount = 30;
    search.value = '';
    panel.hidden = false;
    root.dataset.open = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    results.innerHTML = '<p class="writing-structure-empty">正在載入句型…</p>';
    heading.textContent = (writingFunctions.find(item => item.id === active) || generalFunction).title;
    count.textContent = '';
    try { await load(); render(); }
    catch { results.innerHTML = '<p class="writing-structure-empty">暫時未能載入句型，請關閉後重試。</p>'; }
  }

  function close() {
    panel.hidden = true;
    root.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => panel.hidden ? void open() : close());
  root.querySelector('[data-structure-close]').addEventListener('click', close);
  select.addEventListener('change', () => { active = select.value; visibleCount = 30; search.value = ''; render(); });
  search.addEventListener('input', () => { visibleCount = 30; render(); });
  more.addEventListener('click', () => { visibleCount += 30; render(); });
  results.addEventListener('click', event => {
    const button = event.target.closest('[data-structure-preview]');
    if (!button) return;
    const card = button.closest('.writing-structure-card');
    const expanded = !card.classList.contains('is-expanded');
    card.classList.toggle('is-expanded', expanded);
    button.setAttribute('aria-expanded', String(expanded));
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(); });
  return { open, close };
}
