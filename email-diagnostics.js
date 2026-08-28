// Classic script, intentionally independent of modules, Supabase JS and the editor.
// Starts first so module/load errors and button clicks cannot disappear silently.
(() => {
  'use strict';
  const version='20260828-email5',sessionKey='edmund-schedule-session-v1';
  const uid=()=>window.crypto?.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const n=Math.random()*16|0;return (c==='x'?n:(n&3|8)).toString(16);});
  const pageId=uid(),page=location.pathname.includes('content-admin')?'designer':'log';
  let rows=[],pending=[],owner='',ownerToken='',probePromise=null,flushPromise=null,ready=false;
  let health='checking',storageState='waiting',lastCode='',lastProof='',watchdog;
  const labels={page_loaded:'診斷程式已啟動',designer_ready:'編輯器已就緒',log_ready:'記錄介面已就緒',send_clicked:'已按下預覽發送',save_clicked:'已按下儲存',startup_failed:'啟動／載入失敗',runtime_failed:'程式執行失敗',ui_blocked:'操作已暫停',diagnostic_failed:'記錄服務失敗'};
  function session(){try{const s=JSON.parse(sessionStorage.getItem(sessionKey)||'null');return s?.role==='admin'?s:null;}catch{return null;}}
  function code(error){
    if(/^[A-Z0-9_]{1,80}$/.test(error?.code||''))return error.code;
    if(error?.status)return `HTTP_${error.status}`;
    if(error?.name==='AbortError')return 'REQUEST_TIMEOUT';
    return String(error?.name||'BROWSER_ERROR').replace(/[^a-z0-9_]/gi,'_').toUpperCase().slice(0,80);
  }
  function summary(error){return String(error?.message||(typeof error==='string'?error:'')).replace(/Bearer\s+\S+/gi,'Bearer [redacted]').replace(/[\w.+-]+@[\w.-]+/g,'[email]').replace(/(token|secret|password|code)\s*[=:]\s*[^\s&]+/gi,'$1=[redacted]').replace(/[A-Za-z0-9_./+-]{40,}/g,'[redacted]').replace(/[\r\n\t]/g,' ').slice(0,300);}
  function clean(row){return {id:String(row.id||uid()),requestId:String(row.requestId||pageId),slot:Number.isInteger(row.slot)?row.slot:null,stage:String(row.stage||'runtime_failed'),step:String(row.step||'startup'),state:row.state,code:row.code,message:row.message,file:row.file,line:row.line,version:row.version||version,time:row.time||new Date().toISOString(),audit:row.audit||'pending'};}
  function mergeDisk(value){
    const stored=JSON.parse(value||'[]');
    const recent=Array.isArray(stored)?stored.filter(r=>r && Date.parse(r.time)>Date.now()-7*86400000).map(clean):[];
    const merged=new Map(recent.map(r=>[r.id,r]));
    for(const row of rows){const previous=merged.get(row.id);merged.set(row.id,previous?.audit==='saved'?previous:row);}
    rows=[...merged.values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)).slice(-120);
    pending=rows.filter(r=>r.audit!=='saved');
  }
  function persist(){
    if(!owner)return;
    try {mergeDisk(localStorage.getItem(`edmund-email-diagnostics-v5:${owner}`));const value=JSON.stringify(rows.slice(-120));localStorage.setItem(`edmund-email-diagnostics-v5:${owner}`,value);if(localStorage.getItem(`edmund-email-diagnostics-v5:${owner}`)!==value)throw new Error();storageState='ok';}
    catch{storageState='unavailable';}
  }
  function render(){
    const panel=document.querySelector('[data-email-diagnostics]');if(!panel)return;
    const status=panel.querySelector('[data-diagnostic-status]');
    status.textContent=health==='ok'?`記錄管道已通過寫入及讀回檢查。自我檢查 ID：${lastProof}（沒有寄信）`:health==='checking'?'正在檢查登入、記錄寫入及讀回；沒有寄信。':`診斷未通過：${lastCode}。這不是空白記錄；尚未取得可靠的記錄管道。`;
    status.dataset.state=health==='failed'?'error':'';
    panel.querySelector('[data-diagnostic-storage]').textContent=`版本：${version} · 頁面：${ready?'已就緒':'尚未完成啟動'} · 本機持久記錄：${storageState==='ok'?'可用（同一管理員跨分頁／重新登入）':storageState==='unavailable'?'不可用；目前保留於本頁記憶體，伺服器記錄另存': '等待管理員驗證'} · 未確認記錄：${pending.length}`;
    const list=panel.querySelector('[data-diagnostic-events]');list.replaceChildren();
    for(const r of rows.slice(-12).reverse()){
      const item=document.createElement('details'),title=document.createElement('summary'),pre=document.createElement('pre');
      title.textContent=`${new Date(r.time).toLocaleString('zh-HK')} · ${labels[r.stage]||r.stage} · ${r.audit==='saved'?'伺服器已保存':r.audit==='failed'?'保存失敗，待重試':'等待保存'}`;
      pre.textContent=`要求 ID：${r.requestId}\n步驟：${r.step}\n代碼：${r.code||'—'}${r.message?`\n說明：${r.message}`:''}${r.file?`\n程式：${r.file}:${r.line||0}`:''}\n（診斷記錄不是寄送或送達證明）`;
      item.append(title,pre);list.append(item);
    }
    if(!rows.length){const p=document.createElement('p');p.textContent='此管理員尚無本機記錄；伺服器歷史記錄不依賴本機儲存。';list.append(p);}
    window.dispatchEvent(new CustomEvent('email-diagnostics-updated'));
  }
  async function api(path,body,requestId){
    const token=session()?.adminToken;if(!token)throw Object.assign(new Error('請先以管理員登入。'),{code:'ADMIN_SESSION_MISSING'});
    if(ownerToken && token!==ownerToken){owner='';ownerToken='';rows=[];pending=[];health='failed';throw Object.assign(new Error('登入工作階段已更改，請重新檢查。'),{code:'ADMIN_SESSION_CHANGED'});}
    const base=String(window.EDMUND_SCHEDULE_CONFIG?.workerBaseUrl||'').replace(/\/+$/,'');
    if(!base)throw Object.assign(new Error('未設定記錄服務網址。'),{code:'WORKER_URL_MISSING'});
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(base+path,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-Email-Request-ID':requestId},body:JSON.stringify(body),signal:controller.signal});
      const data=await response.json().catch(()=>null);
      if(!response.ok||!data)throw Object.assign(new Error(data?.error||'記錄服務回應無效。'),{code:data?.code||(response.ok?'INVALID_RESPONSE':`HTTP_${response.status}`),status:response.status});
      if(session()?.adminToken!==token)throw Object.assign(new Error('登入工作階段已更改。'),{code:'ADMIN_SESSION_CHANGED'});
      return data;
    }finally{clearTimeout(timer);}
  }
  function record(stage,context={}){
    const row=clean({...context,id:uid(),stage,version,audit:'pending'});rows.push(row);rows=rows.slice(-120);pending.push(row);pending=pending.slice(-120);persist();render();
    if(health==='ok')void flush();return row.requestId;
  }
  function flush(){
    if(flushPromise)return flushPromise;
    flushPromise=(async()=>{
      while(pending.length && health==='ok'){
        const row=pending[0];
        try{const data=await api('/v1/admin/email/client-events',row,row.requestId);if(data.recorded!==true)throw Object.assign(new Error('伺服器未確認保存。'),{code:'AUDIT_ACK_MISSING'});row.audit='saved';pending.shift();}
        catch(error){row.audit='failed';health='failed';lastCode=code(error);break;}
        finally{persist();render();}
      }
      return health==='ok' && !pending.length;
    })().finally(()=>{flushPromise=null;});return flushPromise;
  }
  function selfTest(){
    if(probePromise)return probePromise;
    health='checking';render();const requestId=uid();
    probePromise=(async()=>{
      try{
        const data=await api('/v1/admin/email/diagnostics',{},requestId);
        if(data.emailVersion!==5||!data.ok||data.noEmailSent!==true||!/^[a-f0-9]{64}$/.test(data.ownerKey||''))throw Object.assign(new Error('網站與服務版本不一致。'),{code:'DIAGNOSTIC_VERSION_MISMATCH'});
        if(data.checks?.databaseWrite!=='ok'||data.checks?.databaseRead!=='ok')throw Object.assign(new Error('記錄檢查未完成。'),{code:'DIAGNOSTIC_PROOF_MISSING'});
        owner=data.ownerKey;ownerToken=session().adminToken;
        try{mergeDisk(localStorage.getItem(`edmund-email-diagnostics-v5:${owner}`));}catch{storageState='unavailable';}
        health='ok';lastCode='';lastProof=requestId;persist();render();
        return await flush();
      }catch(error){health='failed';lastCode=code(error);render();return false;}
    })().finally(()=>{probePromise=null;});return probePromise;
  }
  async function ensureRecording(){
    if(health!=='ok' && !await selfTest())throw Object.assign(new Error(`記錄管道不可用（${lastCode}）；此次操作尚未發送。`),{code:lastCode||'AUDIT_UNAVAILABLE'});
    if(!await flush())throw Object.assign(new Error(`記錄未能保存（${lastCode}）；此次操作尚未發送。`),{code:lastCode||'AUDIT_UNAVAILABLE'});
  }
  function failure(error,context={}){record(context.step==='startup'?'startup_failed':'runtime_failed',{...context,code:code(error),message:summary(error)});}
  window.EDMUND_EMAIL_DIAGNOSTICS={version,record,failure,selfTest,ensureRecording,history:()=>rows.map(r=>({...r})),ready(){ready=true;clearTimeout(watchdog);record(page==='designer'?'designer_ready':'log_ready',{step:page==='designer'?'snapshot':'logs'});render();}};
  window.addEventListener('error',event=>{
    if(event.target?.tagName==='SCRIPT'){let file='';try{file=new URL(event.target.src).pathname.split('/').pop();}catch{}failure({code:'SCRIPT_LOAD_FAILED',message:'必要程式檔案未能載入。'},{step:'startup',file});}
    else if(event.error||event.message){let file='';try{file=new URL(event.filename).pathname.split('/').pop();}catch{}failure(event.error||{code:'RUNTIME_ERROR_NO_DETAILS',message:event.message},{step:ready?'preview':'startup',file,line:event.lineno});}
  },true);
  window.addEventListener('unhandledrejection',event=>failure(event.reason,{step:ready?'preview':'startup'}));
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-send],[data-save]');if(!button)return;
    const requestId=uid(),slot=Number(button.closest('[data-email-slot]')?.dataset.emailSlot)||null;
    event.emailRequestId=requestId;record(button.hasAttribute('data-send')?'send_clicked':'save_clicked',{requestId,slot,step:'validation'});
    if(!ready){event.preventDefault();event.stopImmediatePropagation();record('ui_blocked',{requestId,slot,step:'startup',code:'EDITOR_NOT_READY'});lastCode='EDITOR_NOT_READY';health='failed';render();}
  },true);
  window.addEventListener('online',()=>{void selfTest();});
  window.addEventListener('storage',event=>{
    if(!owner||session()?.adminToken!==ownerToken||event.key!==`edmund-email-diagnostics-v5:${owner}`)return;
    try{mergeDisk(event.newValue);render();if(health==='ok')void flush();}catch{storageState='unavailable';render();}
  });
  record('page_loaded',{step:'startup'});
  watchdog=setTimeout(()=>{if(!ready)failure({code:'EDITOR_STARTUP_TIMEOUT',message:'主要介面未在 20 秒內完成啟動。'},{step:'startup'});},20000);
  const mount=()=>{
    render();document.querySelector('[data-diagnostic-test]')?.addEventListener('click',()=>{void selfTest();});void selfTest();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
