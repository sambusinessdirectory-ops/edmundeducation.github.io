import {hubSession,hubRequest,escapeHtml as e} from './learning-hub-client.mjs';
export function localProfessionalRecords(){const account=hubSession();const owner=account?.id||account?.name||'guest';let history=[];try{history=JSON.parse(localStorage.getItem('edmund-speaking-professional-v1:'+owner+':history')||'[]');const current=JSON.parse(localStorage.getItem('edmund-speaking-professional-v1:'+owner)||'null');if(current)history.push(current);}catch{}return [...new Map(history.map(s=>[s.id,s])).values()];}

export async function mountProfessionalLibrary(root) {
  if (!root) return;
  const account = hubSession();
  const records = new Map(localProfessionalRecords().map(session => [session.id, {id:session.id,session,local:true}]));
  let offset = 0, pending = false, hasMore = false, error = '';
  function draw() {
    const rows = [...records.values()].sort((a,b) => Number(b.session.createdAt)-Number(a.session.createdAt));
    root.classList.add('professional-library');
    root.innerHTML = `<header class="pro-library-heading"><div><span class="pro-library-eyebrow">YOUR SPEAKING JOURNEY</span><h2>Professional Practice<span>專業口試紀錄</span></h2><p>Revisit your discussions, transcripts and teacher feedback.<br>重溫討論、個人發言、字幕及老師回饋。</p></div><span class="pro-library-count"><strong>${rows.length}</strong> sessions · 次練習</span></header>
      <div class="pro-library-list">${rows.map(record => {
        const session = record.session, completed = session.phase === 'results', date = new Date(session.createdAt);
        const validDate = Number.isFinite(date.getTime());
        const candidates = Array.isArray(session.candidates) ? session.candidates : [];
        const href = `speaking-professional.html?${record.local?'local':'record'}=${encodeURIComponent(record.id)}`;
        return `<article class="pro-library-record"><div class="pro-library-date" aria-hidden="true"><strong>${validDate?date.getDate():'—'}</strong><span>${validDate?date.toLocaleDateString('en-GB',{month:'short',year:'numeric'}):''}</span></div><div class="pro-library-body"><div class="pro-library-meta"><span class="pro-library-status ${completed?'is-complete':'is-active'}">${completed?'Completed · 已完成':'In progress · 進行中'}</span>${record.local?'<span class="pro-library-device">On this device · 此裝置</span>':''}</div><h3><a href="${e(href)}">${e(session.topic?.title||'Speaking practice')}</a></h3><div class="pro-library-participants"><span class="pro-library-avatars" aria-hidden="true">${candidates.slice(0,4).map(c=>`<span>${e(Array.from(c.name||c.id||'?')[0])}</span>`).join('')}</span><span>${e(candidates.map(c=>c.name||c.id).join(' · '))}</span></div><time${validDate?` datetime="${date.toISOString()}"`:''}>${validDate?e(date.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})):''}</time></div><a class="pro-library-open" href="${e(href)}">${completed?'View report · 查看報告':'Continue · 繼續練習'}<span aria-hidden="true">↗</span></a></article>`;
      }).join('') || '<div class="pro-library-empty"><span aria-hidden="true">🎙</span><h3>Your next conversation starts here.</h3><p>完成一次專業口試練習後，紀錄便會顯示在這裡。</p></div>'}</div>
      <footer class="pro-library-footer" aria-live="polite">${error?`<p>${e(error)}</p>`:''}${pending?'<span>Syncing records · 正在同步紀錄…</span>':hasMore||error?`<button type="button" data-pro-more>${error?'Retry · 重試':'Load more · 更多紀錄'}</button>`:''}</footer>`;
    root.querySelector('[data-pro-more]')?.addEventListener('click', more);
  }
  async function more() {
    if (pending) return;
    pending = true; error = ''; draw();
    try {
      const rows = await hubRequest('professional','list',{offset});
      if (!root.isConnected || hubSession()?.token !== account?.token) return;
      if (!Array.isArray(rows)) throw new Error('Records could not load. Please retry. 紀錄暫未能載入，請重試。');
      rows.forEach(record => records.set(record.id,record));
      offset += rows.length; hasMore = rows.length === 30;
    } catch (reason) { error = reason.message; }
    finally { pending = false; if(root.isConnected && hubSession()?.token === account?.token) draw(); }
  }
  draw();
  if (account?.token) await more();
}
