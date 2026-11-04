(() => {
  'use strict';
  const list = document.querySelector('#recordings-list');
  const status = document.querySelector('#recordings-status');
  const urls = [];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
  async function render() {
    urls.splice(0).forEach(URL.revokeObjectURL);
    try {
      const records = (await EssayMemoryRecordings.list()).sort((a,b) => b.savedAt.localeCompare(a.savedAt));
      status.textContent = records.length ? `共 ${records.length} 段錄音 · 只儲存在此瀏覽器` : '這個瀏覽器暫時沒有範文背書錄音。';
      list.innerHTML = records.map(record => {
        const url = URL.createObjectURL(record.blob);
        urls.push(url);
        return `<article class="recording-item"><h2>${escapeHtml(record.title)}</h2><p>${escapeHtml(new Date(record.savedAt).toLocaleString('zh-HK'))}</p><audio controls preload="none" src="${url}"></audio><div><a class="mini-button" href="${url}" download="${escapeHtml(record.id)}.${record.blob.type.includes('mp4')?'m4a':'webm'}">下載錄音</a><button class="mini-button" type="button" data-remove="${escapeHtml(record.id)}">刪除</button></div></article>`;
      }).join('');
    } catch (error) { status.textContent = `未能讀取錄音：${error.message}`; }
  }
  list.addEventListener('click', async event => {
    const button = event.target.closest('[data-remove]');
    if (!button || !confirm('刪除這段錄音？')) return;
    await EssayMemoryRecordings.remove(button.dataset.remove);
    render();
  });
  render();
})();
