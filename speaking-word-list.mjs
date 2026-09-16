// Account-linked phrases, with a device-local order and exact source anchors.
export function createSpeakingWordList({ root, getUser, getToken, rpc, describe, notify }) {
  let enabled = false, timer, last = '', rows = [], list, generation = 0, captureGeneration = 0;
  const helper = window.EdmundWordBookmarks;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const orderKey = () => `speakingPhraseOrderV1:${getUser()?.id}`;
  const order = () => { try { const value = JSON.parse(localStorage.getItem(orderKey()) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const saveOrder = () => { try { localStorage.setItem(orderKey(), JSON.stringify(rows.map(row => row.item_key))); } catch { notify('排序未能儲存；請保持此頁開啟。', 'error'); } };
  const hash = text => { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.codePointAt(0),16777619); return (h >>> 0).toString(36); };
  const toolbar = document.createElement('div'); toolbar.className = 'speaking-brush-toolbar';
  toolbar.innerHTML = '<button type="button" data-speaking-pen aria-pressed="false">🖌 魔法筆 · 收藏字詞</button><span role="status" aria-live="polite">開啟後選取範文中的字詞，即可收藏。</span><button type="button" data-go="bookmarks">字詞書簽 →</button>';
  const pen = toolbar.querySelector('[data-speaking-pen]'), status = toolbar.querySelector('[role="status"]');
  pen.onclick = () => {
    enabled = !enabled; last = ''; captureGeneration += 1; clearTimeout(timer);
    pen.setAttribute('aria-pressed',String(enabled));
    status.textContent = enabled ? '選取字詞並放開，即會自動收藏。' : '開啟後選取範文中的字詞，即可收藏。';
  };
  function mountToolbar() {
    const host = root();
    const answer = host?.querySelector('.part1-answer-message,.response-card,.part3-step');
    if (getUser()?.role === 'student' && answer) { if (!toolbar.isConnected) host.prepend(toolbar); }
    else toolbar.remove();
  }
  new MutationObserver(mountToolbar).observe(root(),{childList:true,subtree:true}); mountToolbar();
  const selectedPhrase = () => getSelection()?.toString().replace(/\s+/g,' ').trim() || '';
  const wordCharacter = value => Boolean(value && /[\p{L}\p{N}'’\-]/u.test(value));
  function expandToWordBoundaries(sourceRange) {
    const range = sourceRange.cloneRange(), ancestor = range.commonAncestorContainer;
    const element = ancestor.nodeType === Node.ELEMENT_NODE ? ancestor : ancestor.parentElement;
    const container = element?.closest('.part1-message-en,.response-en,.part3-step-en');
    if (!container || !root().contains(container)) return range;
    const before = document.createRange(); before.selectNodeContents(container); before.setEnd(range.startContainer,range.startOffset);
    const text = String(container.textContent || '');
    let start = before.toString().length, end = start + range.toString().length;
    while (start < end && /\s/u.test(text[start])) start += 1;
    while (end > start && /\s/u.test(text[end - 1])) end -= 1;
    if (wordCharacter(text[start])) while (start > 0 && wordCharacter(text[start - 1])) start -= 1;
    if (wordCharacter(text[end - 1])) while (end < text.length && wordCharacter(text[end])) end += 1;
    const nodes = [], walker = document.createTreeWalker(container,NodeFilter.SHOW_TEXT); let node, offset = 0;
    while ((node = walker.nextNode())) { nodes.push({node,start:offset,end:offset + node.data.length}); offset += node.data.length; }
    const point = index => {
      const entry = nodes.find(item => index <= item.end) || nodes.at(-1);
      return entry ? {node:entry.node,offset:Math.max(0,Math.min(entry.node.data.length,index-entry.start))} : null;
    };
    const from = point(start), to = point(end);
    if (from && to) { range.setStart(from.node,from.offset); range.setEnd(to.node,to.offset); }
    return range;
  }
  async function capture(expectedPhrase) {
    if (!enabled || getUser()?.role !== 'student') return;
    const selection = getSelection(); if (!selection?.rangeCount || selection.isCollapsed) return;
    const rawPhrase = selectedPhrase();
    if (expectedPhrase && rawPhrase !== expectedPhrase) return schedule(280);
    const range = expandToWordBoundaries(selection.getRangeAt(0)), node = range.commonAncestorContainer;
    const element = node.nodeType === 1 ? node : node.parentElement;
    if (!root().contains(element) || element.closest('input,textarea,button,[contenteditable]')) return;
    const phrase = range.toString().replace(/\s+/g,' ').trim();
    if (!phrase || phrase.length > 300 || !/[\p{L}\p{N}]/u.test(phrase)) return;
    if (phrase !== rawPhrase) { selection.removeAllRanges(); selection.addRange(range); }
    const info = describe({element,phrase,range}); if (!info) return;
    const token = getToken(), owner = getUser()?.id;
    const itemKey = `speaking:${hash(`${info.href}|${phrase.toLowerCase()}`)}`;
    const identity = `${owner}:${itemKey}`; if (identity === last) return; last = identity;
    const currentCapture = ++captureGeneration;
    status.textContent = `正在收藏「${phrase}」…`;
    try {
      await helper.setWordBookmark({rpc,token,systemKey:'speaking',itemKey,...info,phrase});
      if (owner === getUser()?.id && currentCapture === captureGeneration) {
        status.textContent = `✓ 已收藏「${phrase}」。可繼續選取其他字詞。`;
        if (selectedPhrase() === phrase) getSelection()?.removeAllRanges();
      }
      if (owner === getUser()?.id) notify(`已收藏「${phrase}」到 Speaking 書簽。`,'info');
    }
    catch {
      if(last === identity) last='';
      if (currentCapture === captureGeneration) status.textContent = '收藏失敗，請重新選取字詞。';
      notify('未能收藏，請重新選取再試。','error');
    }
  }
  const schedule = (delay = 280) => {
    clearTimeout(timer);
    if (!enabled || getUser()?.role !== 'student') return;
    const phrase = selectedPhrase();
    if (!phrase) return;
    timer=setTimeout(() => capture(phrase),delay);
  };
  // Safari and trackpads can finish updating a native selection after pointerup.
  // Wait for selectionchange to settle so the saved phrase matches the highlight.
  document.addEventListener('selectionchange',() => schedule(280));
  document.addEventListener('pointerup',() => schedule(320));
  document.addEventListener('mouseup',() => schedule(320));
  document.addEventListener('touchend',() => schedule(380),{passive:true});
  document.addEventListener('keyup',() => schedule(220));
  function render() {
    if (!list?.isConnected) return;
    list.innerHTML = rows.length ? rows.map((row,index) => `<div class="speaking-phrase-row" data-phrase-index="${index}"><button type="button" class="speaking-phrase-grip" data-grip="${index}" aria-label="移動 ${escape(row.phrase)}；使用上下方向鍵排序" title="拖曳或使用上下方向鍵排序">☰</button><span><strong>${escape(row.phrase)}</strong><small>${escape(row.context_en)}</small></span><a href="${escape(sourceHref(row.href))}">查看原文 ↗</a></div>`).join('') : '<p>尚未收藏字詞。開啟範文上的魔法筆，選取想溫習的字詞。</p>';
  }
  function move(from,to) { if(from===to || to<0 || to>=rows.length)return; const [row]=rows.splice(from,1);rows.splice(to,0,row);saveOrder();render();list.querySelector(`[data-grip="${to}"]`)?.focus({preventScroll:true}); }
  function sourceHref(href) { try { const url=new URL(href,location.href); return url.origin===location.origin && url.pathname.endsWith('/speaking-system.html') ? url.href : 'speaking-system.html'; } catch { return 'speaking-system.html'; } }
  async function mountList(host) {
    const owner=getUser()?.id, current=++generation;
    const section=document.createElement('section'); section.className='speaking-phrase-section';
    section.innerHTML='<h2>魔法筆字詞書簽</h2><p>字詞跟隨帳戶同步；拖曳左側 ☰ 排序（排序儲存於此瀏覽器）。</p><div data-speaking-phrases role="status">正在載入字詞…</div>';
    host.prepend(section);list=section.querySelector('[data-speaking-phrases]');
    list.addEventListener('keydown',event=>{ const grip=event.target.closest('[data-grip]');if(!grip||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();move(Number(grip.dataset.grip),Number(grip.dataset.grip)+(event.key==='ArrowUp'?-1:1)); });
    list.addEventListener('pointerdown',event=>{
      const grip=event.target.closest('[data-grip]');if(!grip||event.button!==0)return;event.preventDefault();
      const from=Number(grip.dataset.grip);let to=from;grip.setPointerCapture(event.pointerId);
      const track=e=>{ const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-phrase-index]');if(target&&list.contains(target)){to=Number(target.dataset.phraseIndex);list.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));target.classList.add('drop-target');}if(e.clientY<80)scrollBy(0,-20);if(e.clientY>innerHeight-80)scrollBy(0,20); };
      const stop=e=>{grip.removeEventListener('pointermove',track);grip.removeEventListener('pointerup',stop);grip.removeEventListener('pointercancel',stop);if(e.type!=='pointercancel')move(from,to);list.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));};
      grip.addEventListener('pointermove',track);grip.addEventListener('pointerup',stop);grip.addEventListener('pointercancel',stop);
    });
    try { const data=await helper.listWordBookmarks({rpc,token:getToken(),systemKey:'speaking'});if(current!==generation||owner!==getUser()?.id||!section.isConnected)return;const ids=order();rows=data.sort((a,b)=>(ids.indexOf(a.item_key)<0?1e9:ids.indexOf(a.item_key))-(ids.indexOf(b.item_key)<0?1e9:ids.indexOf(b.item_key)));render(); }
    catch { if(section.isConnected){list.textContent='字詞未能載入。';const retry=document.createElement('button');retry.textContent='重試';retry.onclick=()=>{section.remove();mountList(host);};list.append(retry);} }
  }
  return {mountList};
}
