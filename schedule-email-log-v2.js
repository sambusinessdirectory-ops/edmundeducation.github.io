import {EMAIL_STAGES,EMAIL_TOPICS} from './email-shared.mjs';
const gate=document.querySelector('[data-gate]'),app=document.querySelector('[data-app]'),logs=document.querySelector('[data-logs]');
const base=String(window.EDMUND_SCHEDULE_CONFIG?.workerBaseUrl||'').replace(/\/+$/,'');
let token='',offset=0;
const when=value=>value?new Date(value).toLocaleString('zh-HK'):'—';
function element(tag,text){const node=document.createElement(tag);node.textContent=text;return node;}
function details(title,body){const d=document.createElement('details');d.append(element('summary',title),element('pre',body));return d;}
async function refresh(){
 const params=new URLSearchParams({audience:document.querySelector('[data-audience]').value,search:document.querySelector('[data-search]').value.trim(),offset:String(offset),limit:'100'});
 const response=await fetch(`${base}/v1/admin/email/logs?${params}`,{headers:{Authorization:`Bearer ${token}`}});
 const data=await response.json();if(!response.ok) throw new Error(data.error||'未能載入記錄');
 logs.replaceChildren();
 for(const item of data.logs||[]){
  const row=document.createElement('tr');
  row.append(element('td',when(item.created_at)),element('td',item.kind==='writing_submission'?'寫作提交通知（管理員）':item.kind?.startsWith('visitor')?`${item.kind==='visitor_confirmation'?'訪客確認信':'訪客更新'} ${EMAIL_TOPICS[item.topic]?.title||''}`:`學生訊息 ${item.template_slot??'已刪除'}`),element('td',`${item.recipient_name||'—'} · ${item.recipient_email}`));
  const cell=document.createElement('td'),d=document.createElement('details');
  d.append(element('summary',`${item.status} — ${EMAIL_STAGES[item.status]||item.status}`));
  d.append(element('pre',[
   `網站電郵 ID: ${item.email_id||item.id}`,`Gmail ID: ${item.provider_message_id||'尚未取得'}`,`Message-ID: ${item.message_id||'舊記錄未保存'}`,
   `要求 ID: ${item.request_id||'定期／舊記錄'}`,`嘗試次數: ${item.attempt_count??'—'}`,`最後更新: ${when(item.updated_at)}`,
   item.status==='queued'?`下一次可嘗試: ${when(item.next_attempt_at)}\n等待原因: ${item.waiting_reason||'—'}`:'',
   item.last_error?`錯誤: ${item.last_error}`:'',`附件: ${(item.attachments||[]).map(f=>f.filename).join(', ')||'無／舊記錄未保存'}`
  ].filter(Boolean).join('\n')));
  const timeline=document.createElement('ol');
  for(const point of item.checkpoints||[]){const li=element('li',`${when(point.time)} · ${EMAIL_STAGES[point.stage]||point.stage} [${point.outcome}]`);li.append(element('pre',JSON.stringify(point.details,null,2)));timeline.append(li);}
  if(!timeline.children.length) timeline.append(element('li','舊記錄：詳細檢查點於本次升級後才開始收集。'));
  d.append(timeline,details('內容',`${item.subject}\n\n${item.rendered_content}`));cell.append(d);row.append(cell);logs.append(row);
 }
 document.querySelector('[data-empty]').hidden=Boolean(data.logs?.length);
 document.querySelector('[data-prev]').disabled=offset===0;
 document.querySelector('[data-next]').disabled=(data.logs?.length||0)<100;
 document.querySelector('[data-page]').textContent=`第 ${offset+1}–${offset+(data.logs?.length||0)} 筆`;
 document.querySelector('[data-requests]').replaceChildren(...(data.requests||[]).map(r=>details(`${when(r.created_at)} · ${EMAIL_STAGES[r.stage]||r.stage} · ${r.outcome}`,`要求 ID: ${r.request_id}\n${JSON.stringify(r.details,null,2)}`)));
 const subscribers=document.querySelector('[data-subscribers]');subscribers.replaceChildren();
 for(const sub of data.subscribers||[]){const tr=document.createElement('tr');tr.append(...[sub.name||'—',sub.email,sub.status,sub.topics.map(t=>EMAIL_TOPICS[t]?.title||t).join('、'),when(sub.confirmed_at)].map(x=>element('td',x)));subscribers.append(tr);}
 document.querySelector('[data-monitors]').replaceChildren(...(data.monitors||[]).map(m=>element('p',`${EMAIL_TOPICS[m.topic]?.title||m.topic} · 檢查：${when(m.checked_at)} · 更新：${when(m.changed_at)}${m.last_error?` · 錯誤：${m.last_error}`:''}`)));
 document.querySelector('[data-scheduler]').textContent=data.scheduler?`排程器開始：${when(data.scheduler.started_at)}；完成：${when(data.scheduler.completed_at)}${data.scheduler.last_error?`；錯誤：${data.scheduler.last_error}`:''}`:'尚未收到新版排程器執行記錄。';
 gate.hidden=true;app.hidden=false;document.querySelector('[data-log-status]').textContent=`已更新 ${when(new Date())}`;
}
async function load(){try{await refresh();}catch(error){document.querySelector('[data-log-status]').textContent=error.message;gate.textContent=error.message;}}
document.querySelector('[data-refresh]').onclick=()=>load();
document.querySelector('[data-audience]').onchange=()=>{offset=0;load();};
document.querySelector('[data-search-form]').onsubmit=event=>{event.preventDefault();offset=0;load();};
document.querySelector('[data-prev]').onclick=()=>{offset=Math.max(0,offset-100);load();};
document.querySelector('[data-next]').onclick=()=>{offset+=100;load();};
try {const saved=JSON.parse(sessionStorage.getItem('edmund-schedule-session-v1')||'null');if(saved?.role!=='admin') throw new Error('請先在功課系統以管理員身分登入。');token=saved.adminToken;load();} catch(error){gate.textContent=error.message;}
