import {renderArchivePdf} from './writing-admin-archive-pdf.mjs?v=20261027-styled1';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const safeFilePart = value => String(value || 'unknown').normalize('NFKC').replace(/[\\/\u0000-\u001f\u007f:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 65) || 'unknown';

export function createWritingAdminArchive({root, api, getAdminKey, getStudents, normalizeSubmission, normalizeFeedback, renderHtml}) {
  const studentSelect = root.querySelector('[data-archive-student]');
  const gradedOnly = root.querySelector('[data-archive-graded]');
  const search = root.querySelector('[data-archive-search]');
  const list = root.querySelector('[data-archive-list]');
  const count = root.querySelector('[data-archive-count]');
  const status = root.querySelector('[data-archive-status]');
  const selectedCount = root.querySelector('[data-archive-selected-count]');
  const exportMatching = root.querySelector('[data-archive-export-matching]');
  const exportSelected = root.querySelector('[data-archive-export-selected]');
  const refreshButton = root.querySelector('[data-archive-refresh]');
  const selectVisible = root.querySelector('[data-archive-select-visible]');
  let rows = [];
  let selected = new Set();
  let busy = false;
  let loaded = false;
  let generation = 0;
  const message = text => { status.textContent = text; };
  function assertAdmin(key) { if (!key || getAdminKey() !== key) throw new Error('管理員登入已結束；請重新登入。'); }
  function filtered() {
    const studentId = studentSelect.value;
    const term = search.value.trim().toLocaleLowerCase();
    return rows.filter(row => (!studentId || row.studentId === studentId)
      && (!gradedOnly.checked || row.hasPublishedFeedback || row.feedbackStatus === 'published')
      && (!term || `${row.studentName} ${row.topic} ${row.submittedAt}`.toLocaleLowerCase().includes(term)));
  }
  function render() {
    const matches = filtered();
    const visible = matches.slice(0, 120);
    count.textContent = `${matches.length} 篇`;
    const chosen = matches.filter(row => selected.has(row.id)).length;
    selectedCount.textContent = `已選 ${chosen} 篇`;
    exportMatching.disabled = busy || !loaded || !matches.length;
    exportSelected.disabled = busy || !loaded || !chosen;
    refreshButton.disabled = busy;
    selectVisible.disabled = busy || !visible.length;
    list.replaceChildren();
    if (!loaded) { list.textContent = '正在載入文章清單……'; return; }
    if (!matches.length) { list.textContent = '沒有符合條件的文章。'; return; }
    const fragment = document.createDocumentFragment();
    for (const row of visible) {
      const label = document.createElement('label'); label.className = 'admin-archive-row';
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = selected.has(row.id); checkbox.dataset.archiveId = row.id; checkbox.disabled = busy;
      const body = document.createElement('span');
      const title = document.createElement('strong'); title.textContent = row.topic || '未命名題目';
      const meta = document.createElement('small'); meta.textContent = `${row.studentName || getStudents().find(student => student.id === row.studentId)?.name || '學生'} · ${row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('zh-HK') : '日期不詳'} · ${row.hasPublishedFeedback || row.feedbackStatus === 'published' ? '已發布評語' : '未有已發布評語'}`;
      body.append(title, meta); label.append(checkbox, body); fragment.append(label);
    }
    list.append(fragment);
    if (matches.length > visible.length) {
      const note = document.createElement('p'); note.className = 'admin-archive-note'; note.textContent = `清單先顯示首 ${visible.length} 篇；「匯出符合條件全部」會包含其餘 ${matches.length - visible.length} 篇。可用上方搜尋縮窄清單。`; list.append(note);
    }
  }
  function setStudents() {
    const existing = studentSelect.value;
    studentSelect.replaceChildren(new Option('所有學生', ''));
    for (const student of getStudents()) studentSelect.add(new Option(student.name, student.id));
    if ([...studentSelect.options].some(option => option.value === existing)) studentSelect.value = existing;
  }
  async function refresh() {
    if (busy || !getAdminKey()) return;
    const key = getAdminKey();
    const request = ++generation;
    busy = true; loaded = false; render(); message('正在載入所有學生文章……');
    try {
      const collected = [];
      for (let page = 1; page <= 10000; page += 1) {
        assertAdmin(key);
        const payload = await api(`/v1/admin/submissions?page=${page}&pageSize=100`);
        assertAdmin(key);
        if (!Array.isArray(payload?.submissions)) throw new Error('文章清單格式無效。');
        collected.push(...payload.submissions.map(normalizeSubmission).filter(row => UUID.test(row.id)));
        message(`已載入 ${collected.length} 篇文章……`);
        if (!payload.hasMore) break;
        if (page === 10000) throw new Error('文章清單超過匯出上限；未有建立不完整的 ZIP。');
      }
      if (request !== generation) return;
      rows = collected;
      selected = new Set([...selected].filter(id => rows.some(row => row.id === id)));
      loaded = true;
      message(`已載入 ${rows.length} 篇文章。選擇學生、文章或只看已發布評語。`);
    } catch (error) { if (request === generation) message(error.message || '未能載入文章清單。'); }
    finally { busy = false; render(); }
  }
  function suggestedName(items) {
    const date = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
    const student = studentSelect.value ? getStudents().find(item => item.id === studentSelect.value)?.name : '';
    return `EdmundEducation-寫作文章-${safeFilePart(student || '所有學生')}-${gradedOnly.checked ? '已發布評語-' : ''}${date}-${items.length}篇.zip`;
  }
  async function exportRows(items) {
    if (busy || !items.length) return;
    const key = getAdminKey(); assertAdmin(key);
    const requirePublished = gradedOnly.checked;
    const name = suggestedName(items);
    let fileHandle = null;
    if (typeof window.showSaveFilePicker === 'function') {
      try { fileHandle = await window.showSaveFilePicker({suggestedName: name, types: [{description: 'ZIP archive', accept: {'application/zip': ['.zip']}}]}); }
      catch (error) { if (error?.name === 'AbortError') return; throw error; }
    }
    assertAdmin(key);
    busy = true; render(); message(`正在準備 ${items.length} 篇 PDF……`);
    try {
      const parts = [];
      const writer = fileHandle ? await fileHandle.createWritable() : {
        async write(chunk) { parts.push(chunk); },
        async close() {},
        async abort() { parts.length = 0; }
      };
      const entries = items.map(row => ({name: `student-${row.studentId.slice(0, 8)}-${row.submittedAt.slice(0, 10)}-writing-${row.id.slice(0, 8)}.pdf`, uploaded: row.submittedAt, row}));
      await window.VideoClassZip.writeArchive(writer, entries, async (entry, index) => {
        assertAdmin(key);
        const id = entry.row.id;
        const base = `/v1/admin/submissions/${encodeURIComponent(id)}`;
        message(`正在製作 PDF ${index + 1} / ${entries.length}：${entry.row.topic}`);
        const [submissionPayload, feedbackPayload] = await Promise.all([api(base), api(`${base}/feedback`)]);
        assertAdmin(key);
        const submission = normalizeSubmission(submissionPayload?.submission || submissionPayload);
        if (submission.id !== id) throw new Error('文章服務回應與匯出清單不一致。');
        if (!submission.studentName) submission.studentName = entry.row.studentName || getStudents().find(student => student.id === submission.studentId)?.name || '';
        const feedback = normalizeFeedback(feedbackPayload?.feedback);
        if (feedback?.submissionId && feedback.submissionId !== id) throw new Error('評語服務回應與文章不一致。');
        if (requirePublished && feedback?.status !== 'published') throw new Error('匯出期間評語狀態已改變；請重新載入清單後再試。');
        const pdf = await renderArchivePdf({submission, feedback: feedback?.status === 'published' ? feedback : null}, {renderHtml, onProgress: (page, total) => { assertAdmin(key); message(`正在製作 PDF ${index + 1} / ${entries.length} · 第 ${page} / ${total} 頁`); }});
        assertAdmin(key);
        return new Blob([pdf], {type: 'application/pdf'}).stream();
      });
      if (!fileHandle) {
        const url = URL.createObjectURL(new Blob(parts, {type: 'application/zip'}));
        const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 120000);
      }
      message(`已完成 ${items.length} 篇文章的 PDF ZIP 匯出。`);
    } catch (error) { message(error.message || '匯出失敗；請重試。'); }
    finally { busy = false; render(); }
  }
  root.addEventListener('change', event => {
    if (event.target.matches('[data-archive-id]')) { if (event.target.checked) selected.add(event.target.dataset.archiveId); else selected.delete(event.target.dataset.archiveId); }
    render();
  });
  search.addEventListener('input', render);
  selectVisible.addEventListener('click', () => { for (const row of filtered().slice(0, 120)) selected.add(row.id); render(); });
  refreshButton.addEventListener('click', () => { void refresh(); });
  exportMatching.addEventListener('click', () => { void exportRows(filtered()); });
  exportSelected.addEventListener('click', () => { void exportRows(filtered().filter(row => selected.has(row.id))); });
  return {refresh, setStudents, reset() { generation += 1; rows = []; selected.clear(); loaded = false; busy = false; message(''); render(); }};
}
