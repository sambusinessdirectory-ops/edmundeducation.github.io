// Metadata only: never store draft text, addresses, image/PDF bytes or tokens.
export const EMAIL_UI_VERSION='20260828-email5';
export const ATTEMPT_STAGES=Object.freeze({
  page_loaded:'診斷程式已啟動（不是發送）',
  designer_ready:'電郵編輯器已就緒',
  log_ready:'記錄介面已就緒（不是發送）',
  send_clicked:'已按下預覽發送按鈕（尚未發送）',
  save_clicked:'已按下儲存按鈕（不是發送）',
  startup_failed:'頁面啟動／程式載入失敗',
  runtime_failed:'瀏覽器程式執行失敗',
  diagnostic_failed:'診斷記錄服務失敗',
  ui_blocked:'操作被暫停（未發送）',
  preview_requested:'正在準備預覽（尚未發送）',
  preview_assets:'正在讀取已儲存圖片（尚未發送）',
  preview_opened:'預覽已開啟，等待最後確認（尚未發送）',
  preview_check_finished:'拼字檢查完成，等待最後確認（尚未發送）',
  preview_confirmed:'管理員已作最後確認',
  preview_cancelled:'管理員已取消預覽（未發送）',
  browser_upload:'瀏覽器開始提交（尚未證明排隊成功）',
  browser_failed:'瀏覽器步驟失敗／中斷',
  browser_receipt:'瀏覽器已收到伺服器收據'
});
export function attemptHistory(storage,key) {
  try {const rows=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(rows)?rows.slice(-60):[];} catch {return [];}
}
export function recordAttempt({storage,key,requestId,slot,stage,step,state,api}) {
  const entry={requestId,slot,stage,step,state,version:EMAIL_UI_VERSION,time:new Date().toISOString()};
  try {storage.setItem(key,JSON.stringify([...attemptHistory(storage,key),entry].slice(-60)));} catch { /* Network audit still attempted. */ }
  // Recording a preview never saves, enqueues, or sends an email. Propagate
  // recording failures to the caller. New pages use the early durable journal.
  return api('/v1/admin/email/client-events',{method:'POST',body:JSON.stringify(entry),headers:{'X-Email-Request-ID':requestId},timeoutMs:8000});
}

export function groupEmailRequests(events) {
  const groups=new Map();
  for(const event of events) {
    const key=event.request_id||'unknown';
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(event);
  }
  return [...groups.entries()].map(([requestId,points])=>{
    points.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    const received=points.find(p=>p.stage==='request_received');
    const readOnly=received?.details?.method==='GET' && received.details.path==='/v1/admin/email/logs';
    const committed=points.find(p=>p.stage==='submit_committed');
    const queued=committed?.details?.state==='queued' || points.some(p=>p.stage==='queued');
    const failed=points.some(p=>p.outcome==='error');
    const cancelled=points.some(p=>['preview_cancelled','submission_cancelled'].includes(p.stage));
    const hasBrowser=points.some(p=>Object.hasOwn(ATTEMPT_STAGES,p.stage));
    let state=queued?'已建立電郵隊列':committed?'已儲存草稿（非一次性發送）':failed?'步驟失敗；未取得排隊成功證明':cancelled?'已取消（未發送）':hasBrowser?'預覽／提交中；尚未取得排隊成功證明':'伺服器要求；不是寄送成功證明';
    if(readOnly)state='讀取 Email Log（不是發送）';
    if(!queued && !committed && !failed && points.every(p=>['page_loaded','designer_ready','log_ready','diagnostic_probe'].includes(p.stage)))state='頁面／診斷自我檢查（不是發送）';
    return {requestId,points,readOnly,time:points.at(-1).created_at,state};
  }).sort((a,b)=>new Date(b.time)-new Date(a.time));
}
