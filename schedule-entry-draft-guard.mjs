export function hasLongUnsavedDraft(value, original = '') {
  return Array.from(String(value)).length > 100 && String(value) !== String(original);
}
export function mountEntryDraftGuard({dialog,input,getOriginal,onSave,isSaving=()=>false}) {
  const warning=document.createElement('dialog');warning.className='entry-draft-warning';
  warning.setAttribute('aria-labelledby','entry-draft-warning-title');
  warning.innerHTML='<h2 id="entry-draft-warning-title">保留你寫下的內容</h2><p>這個功課格已有超過 100 個字元的未儲存內容。作文請使用 Writing Submission；關閉並捨棄會清除這次修改。</p><p data-draft-download-status role="status"></p><div><button type="button" data-draft-keep>繼續編輯</button><button type="button" data-draft-save>儲存功課格</button><button type="button" data-draft-download>下載文字備份</button><button type="button" data-draft-discard>捨棄修改並關閉</button></div>';
  document.body.append(warning);
  const dirty=()=>dialog.open&&!input.readOnly&&hasLongUnsavedDraft(input.value,getOriginal());
  const keep=()=>{warning.close();input.focus();};
  function requestClose(){
    if(isSaving())return;
    if(!dirty()){dialog.close();return;}
    warning.querySelector('[data-draft-download-status]').textContent='';
    if(!warning.open)warning.showModal();
    warning.querySelector('[data-draft-keep]').focus();
  }
  warning.querySelector('[data-draft-keep]').onclick=keep;
  warning.querySelector('[data-draft-save]').onclick=()=>{warning.close();onSave();};
  warning.querySelector('[data-draft-discard]').onclick=()=>{warning.close();dialog.close();};
  warning.querySelector('[data-draft-download]').onclick=()=>{
    const url=URL.createObjectURL(new Blob(['\uFEFF',input.value],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='homework-writing-draft.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    warning.querySelector('[data-draft-download-status]').textContent='已開始下載文字備份。內容仍保留；你可以繼續編輯或選擇捨棄修改並關閉。';
  };
  warning.addEventListener('cancel',event=>{event.preventDefault();keep();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose();});
  dialog.addEventListener('close',()=>{if(!dialog.open&&warning.open)warning.close();});
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
  return {requestClose,dirty};
}
