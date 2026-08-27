import { EMAIL_TOPICS } from '../../../email-shared.mjs';

export function safeDiagnostic(error) {
  return String(error?.message || error || 'UNKNOWN_ERROR')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]').replace(/ya29\.[\w.-]+/g, '[redacted]')
    .replace(/(client_secret|refresh_token|access_token|code|token)=[^\s&]+/gi, '$1=[redacted]')
    .replace(/[\r\n\t]/g, ' ').slice(0,700);
}
export async function emailEvent(env, rpc, stage, outcome, details = {}, job = null) {
  if (env.EMAIL_EVENTS && !job) {
    if (env.EMAIL_EVENTS.length < 50) env.EMAIL_EVENTS.push({stage,outcome,details,time:new Date().toISOString()});
    return;
  }
  if(!env.EMAIL_ADMIN_TOKEN && !job?.jobId) return;
  const event = {p_admin_token:env.EMAIL_ADMIN_TOKEN || null,p_job_id:job?.jobId || null,
    p_request_id:job?.requestId || env.EMAIL_REQUEST_ID || null,p_stage:stage,p_outcome:outcome,p_details:details};
  try { await rpc(env,'schedule_email_v2_event',event,{timeoutMs:5000}); }
  catch { console.error('EMAIL_AUDIT_UNAVAILABLE', {requestId:event.p_request_id,jobId:event.p_job_id,stage,outcome}); }
}
export async function flushEmailEvents(env,rpc) {
  if(!env.EMAIL_ADMIN_TOKEN || !env.EMAIL_EVENTS?.length) return;
  const events=env.EMAIL_EVENTS.splice(0);
  try {
    const saved=await rpc(env,'schedule_email_v3_events',{p_admin_token:env.EMAIL_ADMIN_TOKEN,p_request_id:env.EMAIL_REQUEST_ID,p_events:events},{timeoutMs:5000});
    if(!saved) throw new Error('AUDIT_REJECTED');
  } catch {
    console.error('EMAIL_AUDIT_UNAVAILABLE',{requestId:env.EMAIL_REQUEST_ID,stages:events.map(e=>e.stage)});
  }
}
async function hmac(env, value) {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(env.SCHEDULE_SERVICE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function unsubscribeUrl(env, subscriberId) {
  return `https://edmundeducation.com/email-subscribe.html#unsubscribe=${subscriberId}.${await hmac(env,`email-unsubscribe:${subscriberId}`)}`;
}
export async function visitorRoute(request, env, {rpc,json,readLimitedJson,sha256Hex}) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/v1/email/subscriptions/')) return null;
  if (request.method !== 'POST') return json({error:'Method not allowed'},405,request,env);
  if (request.headers.get('Origin') !== (env.ALLOWED_ORIGIN || 'https://edmundeducation.com')) return json({error:'Origin not allowed'},403,request,env);
  if (!env.EMAIL_SIGNUP_RATE_LIMITER) return json({error:'Subscription service is not configured'},503,request,env);
  const rate = await env.EMAIL_SIGNUP_RATE_LIMITER.limit({key:await sha256Hex(`email-signup:${request.headers.get('CF-Connecting-IP') || 'unknown'}`)});
  if (!rate.success) return json({error:'請稍後再試 / Please try again later.'},429,request,env);
  let body;
  try { body=await readLimitedJson(request,4096); } catch { return json({error:'Invalid request'},400,request,env); }
  if (path.endsWith('/request')) {
    const email=String(body.email || '').trim().toLowerCase(),name=String(body.name || '').trim();
    const topics=[...new Set(Array.isArray(body.topics)?body.topics:[])];
    if (body.website) return json({ok:true},202,request,env);
    if (!body.consent || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || email.length>254 || name.length>80
      || !topics.length || topics.some(topic=>!Object.hasOwn(EMAIL_TOPICS,topic))) return json({error:'請填寫有效電郵、選擇頁面並同意訂閱。'},400,request,env);
    const token=[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
    await rpc(env,'schedule_email_subscription_request',{p_email:email,p_name:name,p_topics:topics,p_token_hash:await sha256Hex(token),
      p_confirmation_url:`https://edmundeducation.com/email-subscribe.html#confirm=${token}`});
    return json({ok:true,message:'如可處理此申請，確認信將加入寄送隊列。請查看收件匣和垃圾郵件；每小時最多寄一次確認信。'},202,request,env);
  }
  if (path.endsWith('/confirm')) {
    if (!/^[a-f0-9]{64}$/.test(body.token || '')) return json({error:'Invalid confirmation link'},400,request,env);
    const ok=await rpc(env,'schedule_email_subscription_confirm',{p_token_hash:await sha256Hex(body.token)});
    return json(ok?{ok:true}:{error:'確認連結已過期或無效，請重新申請。'},ok?200:400,request,env);
  }
  if (path.endsWith('/unsubscribe')) {
    const [id,signature]=String(body.token||'').split('.');
    if (!/^[a-f0-9-]{36}$/.test(id || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return json({error:'Invalid link'},400,request,env);
    const expected=await hmac(env,`email-unsubscribe:${id}`);
    let difference=0; for(let i=0;i<64;i++) difference|=signature.charCodeAt(i)^expected.charCodeAt(i);
    if(difference) return json({error:'Invalid link'},400,request,env);
    await rpc(env,'schedule_email_subscription_unsubscribe',{p_subscriber_id:id});
    return json({ok:true},200,request,env);
  }
  return json({error:'Not found'},404,request,env);
}
export function publishedPageContent(html) {
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) throw new Error('PAGE_MAIN_MISSING');
  return main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')
    .replace(/<!--\s*email-subscription-start\s*-->[\s\S]*?<!--\s*email-subscription-end\s*-->/g,'').replace(/\s+/g,' ').trim();
}
export async function checkPageUpdates(env,rpc,sha256Hex) {
  const hashes=await rpc(env,'schedule_email_published_hashes',{});
  for(const [topic,entry] of Object.entries(EMAIL_TOPICS)) {
    try {
      const response=await fetch(`https://edmundeducation.com${entry.path}`,{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
      if(!response.ok) throw new Error(`PAGE_HTTP_${response.status}`);
      const html=await response.text();
      if(html.length>5_000_000) throw new Error('PAGE_TOO_LARGE');
      const fingerprint=await sha256Hex(publishedPageContent(html)+'\n'+(hashes?.[topic]||''));
      await rpc(env,'schedule_email_page_check',{p_topic:topic,p_fingerprint:fingerprint,p_title:entry.title,p_error:null});
    } catch(error) {
      await rpc(env,'schedule_email_page_check',{p_topic:topic,p_fingerprint:null,p_title:entry.title,p_error:safeDiagnostic(error)});
    }
  }
}
