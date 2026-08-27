import {renderEmailHtml,escapeEmailHtml} from './email-shared.mjs';

let linterPromise;
export async function checkEmailSpelling(text) {
  // Local WASM only: draft text never goes to a third-party spelling service.
  if(!linterPromise) linterPromise=(async()=>{
    const [{WorkerLinter,Dialect},{slimBinary}]=await Promise.all([import('./assets/vendor/harper/2.7.0/index.js'),import('./assets/vendor/harper/2.7.0/slimBinary.js')]);
    const linter=new WorkerLinter({binary:slimBinary,dialect:Dialect.British});await linter.setup();return linter;
  })().catch(error=>{linterPromise=null;throw error;});
  const linter=await linterPromise;
  const groups=await linter.organizedLints(text,{language:'plaintext'});
  const issues=[];
  for(const [rule,lints] of Object.entries(groups)) for(const lint of lints) {
    let suggestions=[];
    try {
      suggestions=Array.from(lint.suggestions?.()||[]);
      const word=String(lint.get_problem_text?.()||'');
      if(/[A-Za-z]/.test(word)) issues.push({word,message:String(lint.message?.()||rule),suggestion:String(suggestions[0]?.get_replacement_text?.()||'')});
    } finally { suggestions.forEach(s=>s.free?.());lint.free?.(); }
  }
  return issues.slice(0,30);
}

export function validateEmailDraft({content,signatureFile,attachments,existingAttachments,signatureLink,recipientCount}) {
  if(!content.trim()) throw new Error('請先輸入內容。');
  if(!recipientCount) throw new Error('請至少選擇一位收件人。');
  if(content.length>8000 || new TextEncoder().encode(content).length>24000) throw new Error('內容太長（最多 8,000 字元）。');
  if(signatureLink) { const u=new URL(signatureLink); if(u.protocol!=='https:' || u.username || u.password) throw new Error('圖片連結必須使用 https://。'); }
  if(signatureFile && (signatureFile.size>2*1024*1024 || !['image/png','image/jpeg','image/gif','image/webp'].includes(signatureFile.type))) throw new Error('簽名圖片格式不符或超過 2 MB。');
  const all=[...attachments,...existingAttachments];
  if(all.length>3 || all.some(f=>(f.size??f.sizeBytes)>5*1024*1024) || all.reduce((n,f)=>n+(f.size??f.sizeBytes),0)>10*1024*1024) throw new Error('最多 3 份 PDF；每份最多 5 MB，合共最多 10 MB（包括已儲存附件）。');
}

export async function previewEmail({content,recipients,imageSource,signatureLink,attachments,sender,action='確認發送',checkSpelling=checkEmailSpelling}) {
  const dialog=document.createElement('dialog');dialog.className='email-preview';
  dialog.setAttribute('aria-labelledby','email-preview-title');
  dialog.innerHTML=`<div class="preview-heading"><h2 id="email-preview-title">發送前預覽</h2><button type="button" data-close aria-label="關閉預覽">×</button></div><p>寄件人：<span data-sender></span></p><p>主旨：EdmundEducation 學習提醒</p><label>收件人預覽（共 ${recipients.length} 位）<select data-recipient></select></label><p class="helper">預覽使用與寄信相同的內容格式；不同郵件程式的排版可能略有差異。</p><iframe title="電郵內容預覽" sandbox="" referrerpolicy="no-referrer"></iframe><div data-files></div><section data-warning hidden><h3>發送前拼字提醒</h3><p>英文拼字／文法檢查可能誤判專有名詞；中文未作檢查。你可返回修改，或照樣發送。</p><ul data-issues></ul></section><p role="status" data-progress></p><div class="button-row"><button class="secondary" data-edit>返回修改</button><button class="primary" data-next>預覽確認，檢查拼字 →</button></div>`;
  dialog.querySelector('[data-sender]').textContent=sender;
  const select=dialog.querySelector('select');recipients.forEach((r,i)=>select.add(new Option(`${r.studentName} · ${r.email}`,String(i))));
  const frame=dialog.querySelector('iframe');
  const render=()=>{frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'"></head><body style="padding:20px">${renderEmailHtml({recipientName:recipients[Number(select.value)].studentName,content,signatureLink},imageSource)}</body></html>`;};
  select.addEventListener('change',render);render();
  dialog.querySelector('[data-files]').innerHTML=`<strong>PDF 附件（${attachments.length}）</strong><ul>${attachments.map(f=>`<li>${escapeEmailHtml(f.name||f.filename)} · ${((f.size??f.sizeBytes)/1024).toFixed(1)} KB</li>`).join('')}</ul>`;
  document.body.append(dialog);dialog.showModal();
  return new Promise(resolve=>{
    let checked=false,spellcheck='not_checked',busy=false;
    const finish=value=>{dialog.close();dialog.remove();resolve(value);};
    dialog.querySelector('[data-close]').onclick=()=>finish(null);
    dialog.querySelector('[data-edit]').onclick=()=>finish(null);
    dialog.addEventListener('cancel',event=>{event.preventDefault();finish(null);});
    dialog.querySelector('[data-next]').onclick=async event=>{
      if(busy) return;
      if(checked) return finish({spellcheck});
      const button=event.currentTarget;busy=true;button.disabled=true;
      dialog.querySelector('[data-progress]').textContent='正在此裝置檢查英文拼字…';
      let timer;
      try {
        const issues=await Promise.race([checkSpelling(content),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),15000);})]);
        if(!dialog.isConnected) return;
        spellcheck=issues.length?`override_${issues.length}_warnings`:'passed';
        dialog.querySelector('[data-warning]').hidden=!issues.length;
        dialog.querySelector('[data-issues]').innerHTML=issues.map(i=>`<li><strong>${escapeEmailHtml(i.word)}</strong> — ${escapeEmailHtml(i.message)}${i.suggestion?` → ${escapeEmailHtml(i.suggestion)}`:''}</li>`).join('');
        dialog.querySelector('[data-progress]').textContent=issues.length?'請檢查以上提醒。':'未發現明顯英文拼字問題；請作最後確認。';
        button.textContent=issues.length?`忽略提醒，${action}`:action;
      } catch {
        if(!dialog.isConnected) return;
        spellcheck='unavailable_override';
        dialog.querySelector('[data-warning]').hidden=false;
        dialog.querySelector('[data-progress]').textContent='拼字檢查暫時無法使用；這不表示內容沒有錯誤。你仍可自行確認後發送。';
        button.textContent=`略過檢查，${action}`;
      } finally {clearTimeout(timer);checked=true;busy=false;button.disabled=false;}
    };
  });
}
