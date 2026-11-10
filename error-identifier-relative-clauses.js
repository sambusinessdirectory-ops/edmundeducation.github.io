(() => {
  "use strict";

  const portal = window.EDMUND_LEARNING_PORTAL_CONTEXT;
  const questions = window.ERROR_IDENTIFIER_RELATIVE_CLAUSES_QUESTIONS;
  const dashboard = document.querySelector('[data-view="dashboard"]');
  const modes = document.querySelector('[data-error-id-modes]');
  const moduleList = modes?.querySelector('.error-id-module-list') || modes?.querySelector('.error-id-mode-grid');
  if (!portal || !questions || !dashboard || !modes || !moduleList) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
  // PDF extraction can leave line-wrap spaces inside Chinese words. Remove only
  // spaces whose two neighbours are CJK characters; English spacing is intact.
  const cleanChineseWraps = value => String(value ?? '').replace(/([\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g, '$1');
  const state = {
    user:'', current:1, answers:{}, feedback:{}, drafts:{}, synced:{}, syncing:{},
    timers:{}, queue:Promise.resolve(), open:false, generation:0
  };
  const storageKey = () => `error-identifier-relative-clauses-400-v1:${state.user}`;
  const requestedMode = () => new URLSearchParams(location.search).get('mode');
  const complete = answer => answer?.mark === 'tick' || (
    answer?.mark === 'cross' && String(answer.wrong || '').trim() && String(answer.fix || '').trim()
  );
  const normalized = answer => answer?.mark === 'tick'
    ? {mark:'tick', wrong:'', fix:''}
    : {mark:'cross', wrong:String(answer?.wrong || '').trim(), fix:String(answer?.fix || '').trim()};
  const signature = answer => complete(answer) ? JSON.stringify(normalized(answer)) : '';
  const firstIncomplete = () => {
    for (let number = 1; number <= questions.length; number += 1) if (!state.answers[number]) return number;
    return 1;
  };

  moduleList.insertAdjacentHTML('beforeend', `
    <button class="error-id-module-card error-id-mode-card error-id-module-card--four" type="button" data-open-relative-clauses data-module="4">
      <span class="error-id-module-card__number" aria-hidden="true">04</span>
      <span class="error-id-module-card__copy"><span>MODULE 4 · RELATIVE CLAUSES</span><strong>Relative Clause</strong><small>關係子句單句校對</small></span>
      <span class="error-id-module-card__action"><b>共 400 題</b><span>繼續目前進度 ↗</span></span>
    </button>`);
  dashboard.insertAdjacentHTML('beforeend', `
    <section class="error-id-workspace relative-workspace" hidden>
      <button class="error-id-back" data-relative-back>← 返回模式選擇</button>
      <div class="error-id-intro"><div><p class="eyebrow">MODULE 4 · RELATIVE CLAUSES</p><h2>Relative Clause · 關係子句校對</h2><p>每題選 ✓ 或 ✕；有錯時選出錯誤字詞，再填改法。完成後會自動儲存並顯示四部分中文解說。</p></div><strong data-relative-progress></strong></div>
      <label class="relative-paper">選擇練習卷 <select data-relative-paper>${Array.from({length:20}, (_, index) => `<option value="${index + 1}">練習 ${String(index + 1).padStart(2, '0')} · 第 ${index * 20 + 1}–${index * 20 + 20} 題</option>`).join('')}</select></label>
      <nav class="relative-numbers" aria-label="本卷題目" data-relative-numbers></nav>
      <div data-relative-question></div>
      <div class="error-id-navigation"><button data-relative-prev>← 上一題</button><button data-relative-next>下一題 →</button></div>
      <p role="status" aria-live="polite" data-relative-status>完成作答後會自動儲存並顯示參考答案。</p>
    </section>`);

  const root = dashboard.querySelector('.relative-workspace');
  const card = root.querySelector('[data-relative-question]');
  const status = root.querySelector('[data-relative-status]');

  function save() {
    if (!state.user) return;
    try {
      localStorage.setItem(storageKey(), JSON.stringify({current:state.current, drafts:state.drafts}));
    } catch {
      status.textContent = '此瀏覽器未能儲存本機草稿；已提交答案仍會保存在帳戶。';
    }
  }

  function setRoute(mode) {
    const route = new URL(location.href);
    if (mode) route.searchParams.set('mode', mode); else route.searchParams.delete('mode');
    route.searchParams.delete('question');
    route.searchParams.delete('passage');
    history.replaceState(null, '', route);
  }

  function reference(answer, submitted) {
    const same = submitted.mark === answer.mark;
    const mine = submitted.mark === 'tick' ? '✓ 正確' : `✕ ${esc(submitted.wrong)} → ${esc(submitted.fix)}`;
    const expected = answer.mark === 'tick' ? '✓ 原句正確，無須修改。' : `✕ ${esc(answer.wrong)} → ${esc(answer.fix)}`;
    const guides = (answer.steps || []).map(step => `<div class="relative-guide"><strong>${esc(cleanChineseWraps(step.title))}</strong><p>${esc(cleanChineseWraps(step.body))}</p></div>`).join('');
    return `<section class="error-id-feedback"><div class="error-id-feedback__heading"><div><p class="eyebrow">REFERENCE ANSWER</p><h3>參考答案與解說</h3></div><span class="${same ? 'is-match' : 'is-different'}">${same ? '判斷吻合' : '判斷需修正'}</span></div><div class="error-id-feedback__compare"><div><small>你的提交</small><p lang="en">${mine}</p></div><div><small>參考改法</small><p lang="en">${expected}</p></div></div><p class="error-id-feedback__sentence"><b>完整句子</b><span lang="en">${esc(answer.correct_sentence)}</span></p><div class="error-id-feedback__reason"><span>${esc(answer.rule)}</span><p>展開下方四部分解說，逐項核對本句的意思、疑問、對照與判斷方法。</p></div><details><summary>四部分中文解說</summary>${guides}</details></section>`;
  }

  function render() {
    const question = questions[state.current - 1];
    const answer = state.drafts[state.current] || state.answers[state.current] || {};
    root.querySelector('[data-relative-progress]').textContent = `${Object.keys(state.answers).length} / 400 已提交`;
    root.querySelector('[data-relative-paper]').value = question.paper;
    root.querySelector('[data-relative-numbers]').innerHTML = questions.filter(item => item.paper === question.paper).map(item => `<button data-relative-go="${item.number}" ${item.number === state.current ? 'aria-current="step"' : ''}>${item.number}${state.answers[item.number] ? ' ✓' : ''}</button>`).join('');
    card.innerHTML = `<article class="error-id-question"><p class="eyebrow">練習 ${question.paper} · 第 ${question.number} / 400 題</p><div class="relative-sentence" lang="en">${question.sentence.split(/\s+/).map((word, index) => `<button type="button" data-relative-word="${index}" ${answer.mark === 'cross' ? '' : 'disabled'}>${esc(word)}</button>`).join(' ')}</div><div class="relative-judgments"><button type="button" data-relative-mark="tick" aria-pressed="${answer.mark === 'tick'}">✓ 正確</button><button type="button" data-relative-mark="cross" aria-pressed="${answer.mark === 'cross'}">✕ 有錯</button></div>${answer.mark === 'cross' ? `<div class="relative-fields"><label>錯誤字／片語<input data-relative-field="wrong" value="${esc(answer.wrong)}" maxlength="180" placeholder="點選句中字詞，或在此輸入"></label><label>應改為<input data-relative-field="fix" value="${esc(answer.fix)}" maxlength="180" placeholder="輸入改法；刪字請填「刪除」"></label></div>` : ''}<p class="error-indefinite-note">完成判斷及改正後，系統會自動儲存並顯示解說。</p>${state.feedback[state.current] && state.answers[state.current] ? reference(state.feedback[state.current], state.answers[state.current]) : ''}</article>`;
    root.querySelector('[data-relative-prev]').disabled = state.current === 1;
    root.querySelector('[data-relative-next]').disabled = state.current === 400;
    save();
  }

  function scheduleSync(number, delay) {
    clearTimeout(state.timers[number]);
    const owner = state.user;
    state.timers[number] = setTimeout(() => {
      state.queue = state.queue.catch(() => {}).then(() => owner === state.user ? syncAnswer(number) : undefined);
    }, delay);
  }

  async function syncAnswer(number) {
    const draft = state.drafts[number] || state.answers[number];
    const nextSignature = signature(draft);
    const session = portal.getSession();
    const owner = state.user;
    if (!nextSignature || !session.token || !owner) return;
    if (state.synced[number] === nextSignature && state.feedback[number]) return;
    if (state.syncing[number]) { scheduleSync(number, 350); return; }
    state.syncing[number] = true;
    status.textContent = '正在儲存並載入參考答案…';
    try {
      const result = await portal.rpc('error_identifier_relative_clauses_action', {p_token:session.token, p_number:number, p_answer:normalized(draft)});
      if (state.user !== owner) return;
      state.answers = result.answers || {};
      state.feedback = result.feedback || {};
      Object.entries(state.answers).forEach(([savedNumber, savedAnswer]) => { state.synced[savedNumber] = signature(savedAnswer); });
      if (state.synced[number] === nextSignature) delete state.drafts[number];
      status.textContent = `${Object.keys(state.answers).length} 題已儲存；參考答案已顯示。`;
      save();
      if (state.open) render();
    } catch (error) {
      if (state.user === owner) status.textContent = `儲存失敗：${error.message}`;
    } finally {
      if (state.user === owner) {
        state.syncing[number] = false;
        if (signature(state.drafts[number] || state.answers[number]) !== state.synced[number]) scheduleSync(number, 850);
      }
    }
  }

  function open(resume = false) {
    window.dispatchEvent(new CustomEvent('edmund:error-id-mode', {detail:{mode:'relative-clauses'}}));
    if (resume) state.current = firstIncomplete();
    setRoute('relative-clauses');
    state.open = true;
    modes.hidden = true;
    root.hidden = false;
    ['[data-error-id-single]', '[data-error-id-passage]', '[data-error-id-bar]'].forEach(selector => {
      const element = document.querySelector(selector); if (element) element.hidden = true;
    });
    render();
    root.scrollIntoView({behavior:'smooth'});
  }

  modes.querySelector('[data-open-relative-clauses]').addEventListener('click', () => open(true));
  window.addEventListener('edmund:error-id-mode', event => {
    if (event.detail?.mode === 'relative-clauses') return;
    state.open = false;
    root.hidden = true;
  });
  root.querySelector('[data-relative-paper]').addEventListener('change', event => {
    state.current = (Number(event.target.value) - 1) * 20 + 1;
    render();
  });
  root.addEventListener('input', event => {
    if (!event.target.dataset.relativeField) return;
    const number = state.current;
    state.drafts[number] = {...(state.drafts[number] || state.answers[number]), [event.target.dataset.relativeField]:event.target.value};
    save();
    if (complete(state.drafts[number])) scheduleSync(number, 850);
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-relative-back')) { setRoute(''); root.hidden = true; state.open = false; modes.hidden = false; return; }
    if (button.hasAttribute('data-relative-go')) { state.current = Number(button.dataset.relativeGo); render(); return; }
    if (button.hasAttribute('data-relative-prev')) { state.current = Math.max(1, state.current - 1); render(); return; }
    if (button.hasAttribute('data-relative-next')) { state.current = Math.min(400, state.current + 1); render(); return; }
    const number = state.current;
    if (button.hasAttribute('data-relative-mark')) {
      state.drafts[number] = {...(state.drafts[number] || state.answers[number]), mark:button.dataset.relativeMark, start:null};
    } else if (button.hasAttribute('data-relative-word')) {
      const answer = state.drafts[number] || {...state.answers[number]};
      const index = Number(button.dataset.relativeWord);
      const words = questions[number - 1].sentence.split(/\s+/);
      if (answer.start == null) { answer.start = index; answer.wrong = words[index]; }
      else { answer.wrong = words.slice(Math.min(answer.start, index), Math.max(answer.start, index) + 1).join(' '); answer.start = null; }
      state.drafts[number] = answer;
    } else return;
    render();
    if (complete(state.drafts[number])) scheduleSync(number, button.dataset.relativeMark === 'tick' ? 0 : 850);
  });

  async function sessionChanged() {
    const session = portal.getSession();
    const owner = session.user?.id || '';
    if (owner === state.user) {
      if (owner && requestedMode() === 'relative-clauses' && !state.open) open(true);
      return;
    }
    state.generation += 1;
    const generation = state.generation;
    Object.values(state.timers).forEach(clearTimeout);
    Object.assign(state, {user:owner, current:1, answers:{}, feedback:{}, drafts:{}, synced:{}, syncing:{}, timers:{}, queue:Promise.resolve(), open:false});
    root.hidden = true;
    card.innerHTML = '';
    if (!owner) return;
    try {
      const local = JSON.parse(localStorage.getItem(storageKey()) || '{}');
      state.current = Number.isInteger(local.current) && local.current >= 1 && local.current <= 400 ? local.current : 1;
      state.drafts = local.drafts || {};
    } catch {}
    try {
      const result = await portal.rpc('error_identifier_relative_clauses_action', {p_token:session.token});
      if (generation !== state.generation) return;
      state.answers = result.answers || {};
      state.feedback = result.feedback || {};
      Object.entries(state.answers).forEach(([number, savedAnswer]) => {
        state.synced[number] = signature(savedAnswer);
        if (signature(state.drafts[number]) === state.synced[number]) delete state.drafts[number];
      });
      status.textContent = Object.keys(state.answers).length ? `${Object.keys(state.answers).length} 題已儲存；完成新題目會自動顯示參考答案。` : '完成作答後會自動儲存並顯示參考答案。';
      Object.keys(state.drafts).forEach(number => {
        if (complete(state.drafts[number]) && signature(state.drafts[number]) !== state.synced[number]) scheduleSync(Number(number), 500);
      });
    } catch (error) {
      if (generation === state.generation) status.textContent = `未能載入帳戶進度：${error.message}`;
    }
    if (generation === state.generation && requestedMode() === 'relative-clauses') open(true);
  }

  window.addEventListener('edmund:learning-portal-session', sessionChanged);
  sessionChanged();
})();
