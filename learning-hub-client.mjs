export const HUB_URL='https://edmund-speaking-system.edmundeducation.workers.dev';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function hubSession(){
 try { const own=JSON.parse(sessionStorage.getItem('edmundSpeakingSessionV1')||'null');if(own?.token)return own; } catch {}
 const shared=window.EdmundSystemNav?.getStudentSession?.();if(shared?.token)return shared;
 try{return JSON.parse(sessionStorage.getItem('edmund-universal-student-session-v1')||'null');}catch{return null;}
}
export async function hubRequest(group,action,payload={},session=hubSession()){
 if(!session?.token)throw new Error('Please sign in to your student account. 請先登入學生帳戶。');
 const response=await fetch(`${HUB_URL}/v1/${group}/${action}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.token}`},body:JSON.stringify(payload),cache:'no-store'});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to save. Please retry.');return result;
}
export async function hubIdentity(session=hubSession()){
 if(!session?.token)return null;try{const r=await fetch(HUB_URL+'/v1/learning-hub/identity',{headers:{Authorization:`Bearer ${session.token}`},cache:'no-store'});if(!r.ok)return null;return await r.json();}catch{return null;}
}
