// Adapted from the teacher's proofreading checklist for use beside a live draft.
import {mountFloatingWindow} from './floating-window.mjs';
export const PROOFREAD_CHECKLIST_GROUPS = Object.freeze([
  { id: 'basic', title: '基本檢查', items: [
    ['articles', '冠詞 a / an / the', '第一次提到常用 a / an；特定事物留意 the。檢查 an apple、a university。'],
    ['plural', '單數與複數', 'two books；one / each / every 後用單數，many / several 後用複數。'],
    ['pronouns', '代名詞一致', '同一個人不要突然換 he / she / they；檢查 he / him / his。'],
    ['spelling', '拼字', '檢查常拼錯的字、新學單字，以及 because、different、beautiful 等高頻字。'],
    ['tense', '時態', '寫過去的事時，留意有沒有無故跳回現在式。'],
    ['sentence', '完整句子', '每句都有主詞和動詞嗎？不要只留下 Because I was tired.'],
    ['capitals', '大寫', '檢查句首、I、人名、地名、星期和月份。'],
    ['punctuation', '標點', '每句末尾有 . ? ! 嗎？問句是否用了問號？'],
    ['missing-words', '漏字', '慢慢唸出聲，檢查 am / is / are 等容易漏掉的字。']
  ]},
  { id: 'higher', title: '進階語言檢查', items: [
    ['verb-form', '動詞形式', 'to / can / did 後留意動詞原形：can go、did go。'],
    ['be-verbs', 'be 動詞', '有沒有漏掉 am / is / are / was / were？'],
    ['prepositions', '介系詞', '檢查 in / on / at / to / for / with，尤其時間和地點。'],
    ['reference', '代名詞指涉', '讀者知道 he / she / it / they 指誰嗎？'],
    ['possessives', '擁有詞', "檢查 Tom's book、students' homework 等撇號。"],
    ['contractions', '縮寫', "檢查 don't、can't、won't 等撇號；正式文體可改用完整形式。"],
    ['formal', '正式用語', '正式作文避免 wanna / gonna / cuz 等口語寫法。'],
    ['word-meaning', '字義', '意思是否合適？例如 boring 與 bored。']
  ]},
  { id: 'advanced', title: '內容與結構檢查', items: [
    ['consistency', '內容一致', '前後事實有沒有矛盾？例如先寫 two brothers，後寫 only brother。'],
    ['timeline', '時間線一致', '故事中的時間順序和時態是否合理？'],
    ['answer-topic', '切題', '文章有沒有真正回答題目，而不只是文法正確？'],
    ['paragraph-idea', '段落中心', '每段是否圍繞一個主要意思？'],
    ['explanation', '解釋', '每段的主張是否有清楚解釋？'],
    ['support', '支持細節', '每個解釋是否有具體例子或細節支撐？'],
    ['opening-ending', '開頭與結尾', '較長作文是否有完整的開頭和結尾？']
  ]}
]);

const ITEM_IDS = new Set(PROOFREAD_CHECKLIST_GROUPS.flatMap(group => group.items.map(item => item[0])));
export function normalizeProofreadChecklistChecked(value) {
  return [...new Set(Array.isArray(value) ? value : [])].filter(id => ITEM_IDS.has(id));
}

export function normalizeProofreadChecklistRecord(value) {
  const checkedIds = normalizeProofreadChecklistChecked(value?.checkedIds ?? value);
  const touchedIds = normalizeProofreadChecklistChecked(value?.touchedIds ?? checkedIds);
  const toggleCount = Math.max(touchedIds.length, Math.min(100000, Number.isSafeInteger(value?.toggleCount) ? value.toggleCount : touchedIds.length));
  return {version: 1, checkedIds, touchedIds, toggleCount};
}

export function mountProofreadChecklist(host, onChange = () => {}) {
  if (!host) return {setVisible(){},setChecked(){},getChecked(){return [];},setRecord(){},getRecord(){return normalizeProofreadChecklistRecord(null);}};
  const progress = host.querySelector('[data-proofread-checklist-progress]');
  const list = host.querySelector('[data-proofread-checklist-list]');
  const collapse = host.querySelector('[data-proofread-checklist-collapse]');
  let checked = new Set();
  let touched = new Set();
  let toggleCount = 0;
  const inputs = new Map();
  for (const [groupIndex, group] of PROOFREAD_CHECKLIST_GROUPS.entries()) {
    const section = document.createElement('details');
    section.className = 'proofread-checklist-group';
    section.open = groupIndex === 0;
    const summary = document.createElement('summary');
    summary.textContent = `${group.title} · ${group.items.length}`;
    section.append(summary);
    for (const [id, title, hint] of group.items) {
      const label = document.createElement('label');
      label.className = 'proofread-checklist-item';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = id;
      const copy = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = title;
      const help = document.createElement('small');
      help.textContent = hint;
      copy.append(name, help);
      label.append(input, copy);
      section.append(label);
      inputs.set(id, input);
      input.addEventListener('change', () => {
        if (input.checked) checked.add(id);
        else checked.delete(id);
        touched.add(id);
        toggleCount += 1;
        label.classList.toggle('is-checked', input.checked);
        progress.textContent = `已檢查 ${checked.size} / ${ITEM_IDS.size}`;
        onChange();
      });
    }
    list.append(section);
  }
  collapse.addEventListener('click', () => {
    const collapsed = host.classList.toggle('is-collapsed');
    collapse.setAttribute('aria-expanded', String(!collapsed));
    collapse.textContent = collapsed ? '展開清單' : '收起';
  });
  mountFloatingWindow(host, {dragHandle: host.querySelector('.proofread-checklist-head'), minWidth: 280, minHeight: 220});
  function setChecked(value) {
    checked = new Set(normalizeProofreadChecklistChecked(value));
    for (const [id, input] of inputs) {
      input.checked = checked.has(id);
      input.closest('label').classList.toggle('is-checked', input.checked);
    }
    progress.textContent = `已檢查 ${checked.size} / ${ITEM_IDS.size}`;
  }
  return {
    setVisible(visible) { host.hidden = !visible; },
    setChecked,
    getChecked() { return [...checked]; },
    setRecord(value) {
      const record = normalizeProofreadChecklistRecord(value);
      setChecked(record.checkedIds);
      touched = new Set(record.touchedIds);
      toggleCount = record.toggleCount;
    },
    getRecord() { return {version: 1, checkedIds: [...checked], touchedIds: [...touched], toggleCount}; }
  };
}
