// Shared by the browser preview and the Gmail MIME builder. No HTML from editors is trusted.
export const EMAIL_TOPICS = Object.freeze({
  resources: { title: '學習資源', path: '/resources.html' },
  'daily-newsletter': { title: '每日英文通訊', path: '/daily-newsletter.html' },
  'major-music': { title: '音樂賞析誌', path: '/major-music.html' },
  'news-analysis': { title: '新聞分析', path: '/news-analysis.html' },
  'english-study': { title: '英語學習', path: '/english-study.html' }
});

export function escapeEmailHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

export function httpsLink(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}

export function renderEmailHtml(job, imageSource = '') {
  const e = escapeEmailHtml;
  const link = httpsLink(job.signatureLink);
  const signature = imageSource ? `<p>${link ? `<a href="${e(link)}">` : ''}<img src="${e(imageSource)}" alt="Signature" style="max-width:100%;height:auto">${link ? '</a>' : ''}</p>` : '';
  const actionUrl = httpsLink(job.actionUrl);
  const unsubscribeUrl = httpsLink(job.unsubscribeUrl);
  return `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#172b49"><p>Hi ${e(job.recipientName || 'there')}</p><div>${e(job.content).replace(/\n/g,'<br>')}</div>${signature}${actionUrl ? `<p><a href="${e(actionUrl)}">${e(job.actionLabel || '查看更新 / View update')}</a></p>` : ''}${unsubscribeUrl ? `<hr><p style="font-size:12px"><a href="${e(unsubscribeUrl)}">取消訂閱 / Unsubscribe</a></p>` : ''}</div>`;
}

export const EMAIL_STAGES = Object.freeze({
  diagnostic_probe:'診斷記錄自我檢查（沒有寄信）',upload_expected:'已驗證管理員並記錄上載開始（尚未排隊）',
  submission_started:'已開始儲存及排隊', submit_committed:'儲存及排隊已完成（可憑要求 ID 恢復結果）', submission_cancelled:'未完成要求已安全取消；不會稍後重寄',
  writing_submitted: '學生已提交寫作；建立管理員通知',
  request_received: '網站已收到要求', authentication: '管理員身分驗證', upload_parsed: '圖片及附件已讀取',
  validation: '內容、檔案類型與大小驗證', template_saved: '草稿已儲存', preview_approved: '預覽已確認',
  spellcheck: '英文拼字檢查（可略過）', queued: '建立電郵 ID 並排隊', claimed: '取得寄送工作',
  token_refresh: '取得 Gmail 傳送授權', mime_built: '組合正文、圖片與 PDF', gmail_request: '提交 Gmail',
  gmail_accepted: 'Gmail 接受（不是收件匣送達證明）', accepted: '已記錄 Gmail 接受結果',
  failed: '失敗', uncertain: '結果不確定：請先檢查寄件備份，切勿直接重寄',
  cancelled: '已取消', request_failed: '要求失敗', request_complete: '要求完成', retry: '等待重試'
});
