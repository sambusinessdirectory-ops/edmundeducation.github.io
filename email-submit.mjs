// Only retry an immutable upload with its ORIGINAL request ID. Never resend Gmail.
const completed=result=>['queued','saved','cancelled'].includes(result?.state);
export async function resolveSubmission(api,requestId) {
  const result=await api(`/v1/admin/email/requests/${requestId}/resolve`,{method:'POST',body:'{}'});
  if(!completed(result)) throw new Error('要求結果仍未確定，請稍後再次核對。');
  return result;
}
export async function submitWithRecovery({api,slot,form,requestId,onProgress=()=>{}}) {
  const send=()=>api(`/v1/admin/email/templates/${slot}/submit`,{method:'POST',body:form,headers:{'X-Email-Request-ID':requestId},timeoutMs:90000});
  let lastError;
  for(let attempt=0;attempt<2;attempt++) {
    try {
      const result=await send();
      if(!completed(result)) throw new Error('伺服器未回傳有效收據。');
      return result;
    } catch(error) {
      lastError=error;onProgress('連線結果未確認，正在核對原要求；不會建立重複電郵…');
      try {const receipt=await api(`/v1/admin/email/requests/${requestId}`);if(completed(receipt)) return receipt;} catch { /* Resolve safely below. */ }
      if(error.status && error.status<500) break;
    }
  }
  const result=await resolveSubmission(api,requestId);
  return {...result,failure:lastError?.message};
}
export function submissionMessage(receipt) {
  if(receipt.state==='queued') return `已排隊 ${receipt.emailIds.length} 封（尚未確認送達；通常於 5 分鐘內處理）。電郵 ID：${receipt.emailIds.join(', ')}。要求 ID：${receipt.requestId}。可以安全離開本頁。`;
  if(receipt.state==='saved') return `訊息及附件已儲存（未執行一次性發送）。要求 ID：${receipt.requestId}。`;
  return `已確認此要求未完成，並已安全取消；沒有因此要求新增電郵。${receipt.failure||'請檢查內容後重新預覽發送。'} 要求 ID：${receipt.requestId}。`;
}
