import {formatTime} from './execution-speedrun-core.mjs?v=20260914-3';
import {mapperElapsed,mapperStop,mapperSections,mapperContinue} from './execution-time-mapper-core.mjs?v=20260914-mapper-continue-1';

export function initTimeMapper({key,rpc,onSaved,message}) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button = document.createElement('button'); button.type='button'; button.dataset.mapperOpen='';
  button.textContent='◷ Time Mapper · 測量時間';
  document.querySelector('.page-heading').append(button);
  const dialog = document.createElement('dialog'); dialog.className='time-mapper'; dialog.dataset.mapper='';
  dialog.setAttribute('aria-labelledby','mapper-heading');
  dialog.innerHTML=`<header><div><span class="eyebrow">TIME MAPPER</span><h2 id="mapper-heading">邊做邊建立計時器</h2></div><button type="button" data-map-close aria-label="暫存並關閉">暫存並關閉</button></header>
    <p class="muted">不用預先估計時間。按「下一項」會立即停止本項計時，填寫下一項名稱時不會計時。</p>
    <p data-map-error role="alert" hidden></p>
    <form data-map-form><label data-map-title-label>計時器名稱<input data-map-title maxlength="160" required placeholder="例如：法文學習流程"></label>
    <label data-map-choice-label hidden>接下來做甚麼？<select data-map-choice><option value="same">同一主項目：新增子項目</option><option value="new">新增主項目</option></select></label>
    <p class="muted" data-map-convert hidden>原主項目的用時會保留為第一個子項目。</p>
    <label data-map-main-label>主項目名稱<input data-map-main maxlength="160" required placeholder="例如：閱讀"></label>
    <label>子項目名稱 <span data-map-optional>（選填，留空則只計時主項目）</span><input data-map-sub maxlength="160" placeholder="例如：第一篇文章"></label>
    <button class="primary" type="submit" data-map-go>確定並開始計時</button></form>
    <section class="mapper-clock-panel" data-map-live hidden><p data-map-current></p><div class="mapper-clock" data-map-clock>0:00.00</div><p data-map-status role="status"></p><div class="mapper-actions"><button type="button" data-map-pause>暫停</button><button type="button" class="primary" data-map-next>下一項 →</button></div></section>
    <section data-map-summary hidden><h3>已測量的部分 <span data-map-count></span></h3><div data-map-parts></div><p>已記錄合計 <strong data-map-total></strong></p></section>
    <footer><button type="button" data-map-discard>捨棄本機草稿</button><button type="button" class="primary" data-map-finish hidden>完成並儲存計時器與紀錄 ✓</button><p class="muted">實測紀錄保留精確時間；未來挑戰的預計時間向上取整至秒（最少 1 秒）。完成前的草稿會暫存在此裝置。</p></footer>`;
  document.body.append(dialog);
  const $ = s => dialog.querySelector(s);
  let draft = null, saving = false, opening = false;
  try { draft=JSON.parse(localStorage.getItem(key)||'null'); } catch {}
  if (draft && (!Array.isArray(draft.parts) || !draft.id || !draft.run_id)) draft=null;
  const fresh = () => ({id:crypto.randomUUID(),run_id:crypto.randomUUID(),title:'',parts:[],current:null,inputs:{main:'',sub:'',choice:'new'}});
  function persist() {
    try { if(draft)localStorage.setItem(key,JSON.stringify(draft)); else localStorage.removeItem(key); }
    catch { error('無法暫存草稿，請保持此頁開啟直至完成儲存。'); }
    button.textContent=draft ? '◷ 繼續 Time Mapper' : '◷ Time Mapper · 測量時間';
  }
  function error(text='') { $('[data-map-error]').textContent=text; $('[data-map-error]').hidden=!text; }
  function tick() { if(draft?.current && dialog.open) $('[data-map-clock]').textContent=formatTime(mapperElapsed(draft),true); }
  function fields() {
    const same=draft.parts.length>0 && $('[data-map-choice]').value!=='new';
    $('[data-map-main-label]').hidden=same; $('[data-map-main]').required=!same;
    $('[data-map-sub]').required=same; $('[data-map-optional]').hidden=same;
    $('[data-map-convert]').hidden=!(same && !draft.parts.find(p=>p.section_id===($('[data-map-choice]').value==='same' ? draft.parts.at(-1).section_id : $('[data-map-choice]').value))?.title);
  }
  function render() {
    const current=draft.current, finished=!!draft.finished;
    $('[data-map-title]').value=draft.title;
    $('[data-map-main]').value=draft.inputs.main;
    $('[data-map-sub]').value=draft.inputs.sub;
    $('[data-map-choice]').innerHTML='<option value="same">同一主項目：新增子項目</option><option value="new">新增主項目</option>'+(draft.base_revision!=null ? mapperSections(draft.parts).map(s=>`<option value="${escape(s.id)}">新增子項目至：${escape(s.title)}</option>`).join('') : '');
    $('[data-map-choice]').value=draft.inputs.choice;
    $('[data-map-title-label]').hidden=!!draft.parts.length;
    $('[data-map-choice-label]').hidden=!draft.parts.length;
    $('[data-map-form]').hidden=!!current || finished;
    $('[data-map-live]').hidden=!current;
    $('[data-map-summary]').hidden=!draft.parts.length;
    $('[data-map-finish]').hidden=!current && !draft.parts.length;
    $('[data-map-finish]').textContent=saving ? '正在儲存…' : finished ? '重試儲存計時器與紀錄' : '完成並儲存計時器與紀錄 ✓';
    $('[data-map-finish]').disabled=saving;
    $('[data-map-close]').disabled=saving;
    $('[data-map-discard]').disabled=saving;
    $('[data-map-count]').textContent=`（${draft.parts.length}）`;
    $('[data-map-parts]').innerHTML=mapperSections(draft.parts).map(s=>`<div class="mapper-section"><strong>${escape(s.title)}</strong><b>${formatTime(draft.parts.filter(p=>p.section_id===s.id).reduce((n,p)=>n+p.elapsed_ms,0),true)}</b>${draft.parts.filter(p=>p.section_id===s.id).map(p=>`<div><span>${escape(p.title||p.section_title)}</span><b>${formatTime(p.elapsed_ms,true)}</b>${draft.base_revision!=null ? `<button type="button" data-map-continue="${draft.parts.indexOf(p)}" ${current||finished||saving ? 'disabled' : ''}>繼續測量</button>` : ''}</div>`).join('')}</div>`).join('');
    $('[data-map-total]').textContent=formatTime(draft.parts.reduce((n,p)=>n+p.elapsed_ms,0),true);
    if(current) {
      $('[data-map-current]').textContent=[current.section_title,current.title].filter(Boolean).join(' / ');
      $('[data-map-status]').textContent=current.anchor==null ? '已暫停' : '正在測量本項時間';
      $('[data-map-pause]').textContent=current.anchor==null ? '繼續' : '暫停';
    }
    fields(); tick(); persist();
  }
  function close() {
    if(saving)return;
    if(draft?.current && draft.current.anchor!=null) {draft.current.elapsed_ms=mapperElapsed(draft);draft.current.anchor=null;}
    persist(); dialog.close();
  }
  button.addEventListener('click',()=>{
    if(opening || saving)return;
    draft ||= fresh(); render();error();dialog.showModal();tick();
    if(!draft.current && !draft.finished) (draft.parts.length ? $('[data-map-sub]') : $('[data-map-title]')).focus();
  });
  $('[data-map-close]').addEventListener('click',close);
  $('[data-map-discard]').addEventListener('click',()=>{
    if(saving || !confirm('捨棄此裝置尚未儲存的修改？資料庫中已儲存的計時器與紀錄會保留。'))return;
    draft=null;persist();dialog.close();
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  $('[data-map-form]').addEventListener('input',()=>{
    draft.title=$('[data-map-title]').value;
    draft.inputs={main:$('[data-map-main]').value,sub:$('[data-map-sub]').value,choice:$('[data-map-choice]').value};persist();fields();
  });
  $('[data-map-choice]').addEventListener('change',()=>{draft.inputs.choice=$('[data-map-choice]').value;fields();persist();});
  $('[data-map-form]').addEventListener('submit',e=>{
    e.preventDefault();if(draft.current || draft.finished)return;
    const same=draft.parts.length>0 && $('[data-map-choice]').value!=='new', previous=$('[data-map-choice]').value==='same' ? draft.parts.at(-1) : draft.parts.find(p=>p.section_id===$('[data-map-choice]').value);
    const main=same ? previous.section_title : $('[data-map-main]').value.trim(), sub=$('[data-map-sub]').value.trim();
    draft.title=$('[data-map-title]').value.trim();
    if(!draft.title || !main || same && !sub)return error('請填寫計時器、主項目及所需的子項目名稱。');
    const sections=mapperSections(draft.parts);
    if(draft.parts.length>=500 || !same && sections.length>=50 || same && draft.parts.filter(p=>p.section_id===previous.section_id).length>=100)return error('最多 50 個主項目、每個主項目 100 個子項目，合共 500 個計時部分。請完成並儲存。');
    const now=Date.now();
    if(same) draft.insertIndex=draft.parts.findLastIndex(p=>p.section_id===previous.section_id)+1;
    draft.current={id:crypto.randomUUID(),section_id:same ? previous.section_id : crypto.randomUUID(),section_title:main,title:sub||null,elapsed_ms:0,anchor:now,started_at:new Date(now).toISOString()};
    error();render();$('[data-map-next]').focus();
  });
  $('[data-map-parts]').addEventListener('click',e=>{
    const button=e.target.closest('[data-map-continue]');
    if(!button || saving || draft.current || draft.finished)return;
    draft=mapperContinue(draft,Number(button.dataset.mapContinue));error();render();$('[data-map-next]').focus();
  });
  $('[data-map-pause]').addEventListener('click',()=>{
    const now=Date.now();draft.current.elapsed_ms=mapperElapsed(draft,now);draft.current.anchor=draft.current.anchor==null ? now : null;render();
  });
  $('[data-map-next]').addEventListener('click',()=>{
    draft=mapperStop(draft);draft.inputs={choice:'same',main:'',sub:''};error();render();$('[data-map-sub]').focus();
  });
  $('[data-map-finish]').addEventListener('click',async()=>{
    if(saving)return;
    draft=mapperStop(draft);draft.finished=true;draft.request_id ||= crypto.randomUUID();persist();saving=true;error();render();
    try {
      const saved=draft.base_revision!=null ? await rpc('execution_speedrun_mapper_update',{p_run_id:draft.run_id,p_request_id:draft.request_id,p_revision:draft.base_revision,p_meter_updated_at:draft.meter_updated_at,p_title:draft.title,p_parts:draft.parts}) : await rpc('execution_speedrun_mapper_save',{p_id:draft.id,p_run_id:draft.run_id,p_title:draft.title,p_sections:mapperSections(draft.parts),p_splits:draft.parts.map(p=>({elapsed_ms:p.elapsed_ms,started_at:p.started_at,ended_at:p.ended_at}))});
      draft=null;persist();dialog.close();
      try {await onSaved(saved);} catch {message('Time Mapper 已儲存。請重新整理以查看計時器與紀錄。','pending');}
    } catch(e) {error(`未能儲存：${e.message || '請檢查連線後重試。'} 草稿已保留，重試不會重複建立。`);}
    finally {saving=false;if(draft)render();}
  });
  window.addEventListener('beforeunload',()=>{if(draft)persist();});
  setInterval(tick,50);
  button.textContent=draft ? '◷ 繼續 Time Mapper' : button.textContent;
  return {async openSaved(runId) {
    if(opening || saving)return;
    if(draft && draft.run_id!==runId)return message('此裝置有另一份 Time Mapper 草稿。請先按「繼續 Time Mapper」完成儲存。','pending');
    opening=true;button.disabled=true;
    try {
      draft ||= await rpc('execution_speedrun_mapper_open',{p_run_id:runId});
      render();error();dialog.showModal();tick();
    } catch(e) {message(e.message||'未能開啟映射紀錄。','error');}
    finally {opening=false;button.disabled=false;}
  }};
}
