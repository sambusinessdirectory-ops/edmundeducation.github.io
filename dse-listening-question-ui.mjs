// Native question controls for the DSE archive. Stores answers under the existing question IDs.
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const savedObject = value => { try { const parsed=JSON.parse(value || '{}'); return parsed && typeof parsed==='object' && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; } };

export function questionNumbers(task) {
  const numbers=new Set();
  for(const block of task.blocks) {
    if(Number(block.number)) numbers.add(Number(block.number));
    for(const number of block.numbers || []) numbers.add(Number(number));
    for(const source of [block.html,block.copy,...(block.rows||[]).flatMap(row=>[row.copy,row.concern,row.consequence])]) {
      for(const match of String(source||'').matchAll(/\{\{(\d+)(?:\|[^{}]*)?\}\}/g)) numbers.add(Number(match[1]));
    }
  }
  return [...numbers].sort((a,b)=>a-b);
}

export function answerTokens(html, answers) {
  return String(html).replace(/\{\{(\d+)(?:\|([^{}]+))?\}\}/g,(_,number,choices)=>{
    const value=String(answers.get(Number(number))||'');
    const common=`data-dse-answer-q="${number}" aria-label="第 ${number} 題答案"`;
    const field=choices
      ? `<select ${common}><option value="">選擇答案…</option>${choices.split('|').map(choice=>`<option value="${escape(choice)}"${value===choice?' selected':''}>${escape(choice)}</option>`).join('')}</select>`
      : `<input ${common} value="${escape(value)}" autocomplete="off" spellcheck="false">`;
    return `<label class="dse-answer-gap"><b>${number}</b>${field}</label>`;
  });
}

export function nativeBlock(block,answers) {
  if(block.type==='answer-group') {
    const ids=block.numbers.join(',');
    const selected=block.numbers.map(n=>String(answers.get(n)||''));
    return `<fieldset class="dse-answer-group"><legend>${escape(block.prompt)}</legend><p class="dse-control-hint">題號 ${ids} · ${block.mode==='order'?'為所聽到的圖片選擇次序；其他圖片留空。':`選擇 ${block.numbers.length} 項，每項分別計入進度。`}</p><div class="dse-choice-cards">${block.options.map((option,index)=>{
      const key=String.fromCharCode(65+index), item=typeof option==='string'?{text:option}:option;
      const label=`${key}. ${item.text}`;
      const control=block.mode==='order'
        ? `<select data-dse-order-group="${ids}" data-choice="${key}" aria-label="${escape(label)} 次序"><option value="">—</option>${block.numbers.map((_,i)=>`<option value="${i+1}"${selected[i]===key?' selected':''}>${i+1}</option>`).join('')}</select>`
        : `<input type="checkbox" data-dse-answer-group="${ids}" value="${key}"${selected.includes(key)?' checked':''}>`;
      return `<label class="dse-choice-card">${item.src?`<img src="${escape(item.src)}" alt="${escape(item.text)}" loading="lazy">`:''}<span>${escape(label)}</span>${control}</label>`;
    }).join('')}</div></fieldset>`;
  }
  if(block.type==='ranking') {
    const selected=savedObject(answers.get(block.number));
    return `<fieldset class="dse-answer-group"><legend>${block.number}. ${escape(block.prompt)}</legend><div class="listening-table-wrap"><table class="dse-native-table"><thead><tr><th>Facility</th><th>Rank</th></tr></thead><tbody>${block.options.map((label,index)=>`<tr><th scope="row">${escape(label)}</th><td><select data-dse-ranking="${block.number}" data-item="${index}" aria-label="${escape(label)} ranking"><option value="">—</option>${block.options.map((_,i)=>`<option value="${i+1}"${String(selected[index])===String(i+1)?' selected':''}>${i+1}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></fieldset>`;
  }
  if(block.type==='maze') {
    const cells=block.example?block.cells:savedObject(answers.get(block.number));
    return `<section class="dse-maze"><h4>${block.example?'Example':`${block.number}. ${escape(block.prompt)}`}</h4>${block.example?'':'<p class="dse-control-hint">按格子切換：空白 → O（路線）→ M（怪物）→ 空白。亦可用 Tab 及 Enter 操作。</p>'}<div class="listening-table-wrap"><table class="dse-maze-grid" aria-label="${block.example?'Monster Maze example':escape(block.prompt)}"><tbody>${['F','E','D','C','B','A'].map(row=>`<tr><th scope="row">${row}</th>${[1,2,3,4,5,6].map(col=>{
      const cell=`${row}${col}`,blocked=block.blocked.includes(cell),value=cells[cell]||'';
      return `<td${blocked?' class="is-blocked"':''}>${block.example?escape(value):`<button type="button" data-dse-maze-q="${block.number}" data-cell="${cell}" data-mark="${escape(value)}" aria-label="${cell}: ${value||'空白'}"${blocked?' disabled':''}>${escape(value)}</button>`}</td>`;
    }).join('')}<td class="dse-maze-wall" aria-label="Side wall"></td></tr>`).join('')}<tr><td class="dse-maze-wall"></td>${[1,2,3,4,5,6].map(n=>`<th scope="col">${n}</th>`).join('')}<td class="dse-maze-wall"></td></tr></tbody></table></div></section>`;
  }
  return null;
}

export function handleNativeInput(target,root,answers,notify=()=>{}) {
  const idsText=target.dataset.dseAnswerGroup || target.dataset.dseOrderGroup;
  if(idsText) {
    const ids=idsText.split(',').map(Number);
    if(target.dataset.dseAnswerGroup) {
      const controls=[...root.querySelectorAll(`[data-dse-answer-group="${idsText}"]`)];
      let selected=controls.filter(c=>c.checked);
      if(selected.length>ids.length) {target.checked=false;notify(`最多選擇 ${ids.length} 項。`);selected=controls.filter(c=>c.checked);}
      ids.forEach((n,i)=>answers.set(n,selected[i]?.value||''));
    } else {
      const controls=[...root.querySelectorAll(`[data-dse-order-group="${idsText}"]`)];
      if(target.value) controls.forEach(c=>{if(c!==target && c.value===target.value)c.value='';});
      ids.forEach((n,i)=>answers.set(n,controls.find(c=>c.value===String(i+1))?.dataset.choice||''));
    }
    return true;
  }
  if(target.dataset.dseRanking) {
    const number=Number(target.dataset.dseRanking), controls=[...root.querySelectorAll(`[data-dse-ranking="${number}"]`)];
    if(target.value) controls.forEach(c=>{if(c!==target && c.value===target.value)c.value='';});
    const value=Object.fromEntries(controls.filter(c=>c.value).map(c=>[c.dataset.item,c.value]));
    answers.set(number,Object.keys(value).length?JSON.stringify(value):'');return true;
  }
  return false;
}

export function handleMazeClick(target,answers) {
  const button=target.closest?.('[data-dse-maze-q]');
  if(!button || button.disabled) return false;
  const number=Number(button.dataset.dseMazeQ),cells=savedObject(answers.get(number));
  const next=({ '':'O',O:'M',M:'' })[button.dataset.mark||''];
  if(next)cells[button.dataset.cell]=next;else delete cells[button.dataset.cell];
  answers.set(number,Object.keys(cells).length?JSON.stringify(cells):'');
  button.dataset.mark=next;button.textContent=next;button.setAttribute('aria-label',`${button.dataset.cell}: ${next||'空白'}`);return true;
}
