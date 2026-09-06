export function mountListeningTypes(root, openPractice) {
  if (!root) return;
  let data, selected = '', query = '';
  const status = root.querySelector('[data-type-status]');
  const results = root.querySelector('[data-type-results]');
  const filters = root.querySelector('[data-type-filters]');
  function render() {
    if (!data) return;
    const terms = query.trim().toLocaleLowerCase();
    const rows = data.rows.filter(row => (!selected || row.types.includes(selected)) && (!terms || row.types.some(type => data.labels[type].toLocaleLowerCase().includes(terms)) || `practice ${row.practice}`.includes(terms)));
    status.textContent = `${new Set(rows.map(row => row.practice)).size} 套練習 · ${rows.length} 個部分`;
    results.replaceChildren();
    for (const row of rows) {
      const button=document.createElement('button'); button.type='button'; button.className='practice-card';
      const title=document.createElement('strong');title.textContent=`Practice ${row.practice} · Part ${row.part}`;
      const text=document.createElement('small');text.textContent=row.types.map(type=>data.labels[type]).join(' · ');
      button.append(title,text);button.addEventListener('click',()=>openPractice(row.practice,row.part));results.append(button);
    }
    filters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.type===selected)));
  }
  root.querySelector('input').addEventListener('input',event=>{query=event.target.value;render();});
  async function load() {
    try {
      const response=await fetch('listening-question-types.json?v=20260906'); if(!response.ok)throw new Error('load'); data=await response.json();
      filters.replaceChildren();
      for(const [type,label] of [['','全部題型'],...Object.entries(data.labels).filter(([type])=>data.rows.some(row=>row.types.includes(type)))]) {
        const button=document.createElement('button');button.type='button';button.className='secondary-button';button.dataset.type=type;button.textContent=label;
        button.addEventListener('click',()=>{selected=type;render();});filters.append(button);
      }
      render();
    } catch { status.textContent='題型目錄未能載入。'; const retry=document.createElement('button');retry.textContent='重試';retry.addEventListener('click',load,{once:true});status.append(retry); }
  }
  load();
}
