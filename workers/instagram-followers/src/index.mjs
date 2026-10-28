export const PROFILE = 'edmundeducationedu';
export const OBJECT_KEY = 'site-data/instagram-edmundeducationedu.json';
export function parseFollowers(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m=>[m[1].toLowerCase(),m[3]]));
    if (!['description','og:description'].includes(attributes.property || attributes.name)) continue;
    const content = attributes.content || '';
    if (!content.toLowerCase().includes(PROFILE)) continue;
    const match = content.match(/^\s*([\d,]+(?:\.\d+)?)\s*([KM]?)\s+Followers\b/i);
    if (!match) continue;
    const approximate = Boolean(match[2]);
    const count = Number(match[1].replaceAll(',','')) * ({K:1000,M:1000000}[match[2].toUpperCase()] || 1);
    if (!Number.isSafeInteger(count) || count < 0 || count > 1_000_000_000) continue;
    return {username:PROFILE,count,approximate};
  }
  throw new Error('Instagram did not provide a verifiable public follower count');
}
export async function refresh(env, fetcher=fetch) {
  const response = await fetcher(`https://www.instagram.com/${PROFILE}/`, {headers:{'Accept-Language':'en-US,en;q=0.9'},signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`Instagram returned HTTP ${response.status}`);
  const html = await response.text();
  if (html.length > 3_000_000) throw new Error('Unexpected Instagram response size');
  const data = {...parseFollowers(html),updatedAt:new Date().toISOString(),source:`https://www.instagram.com/${PROFILE}/`};
  await env.COUNTS.put(OBJECT_KEY,JSON.stringify(data),{httpMetadata:{contentType:'application/json'}});
  return data;
}
export default {
  async scheduled(event,env,ctx) {await refresh(env).catch(error=>{console.error('Instagram daily refresh failed; keeping last verified count:',error.message);throw error;});},
  async fetch(request,env) {
    const url=new URL(request.url);
    if(url.pathname!=='/followers' || !['GET','HEAD'].includes(request.method))return new Response('Not found',{status:404});
    const stored=await env.COUNTS.get(OBJECT_KEY);
    if(!stored)return Response.json({error:'Count not available'},{status:503,headers:{'Access-Control-Allow-Origin':'*'}});
    const data=await stored.json();
    const stale=Date.now()-Date.parse(data.updatedAt)>48*60*60*1000;
    return new Response(request.method==='HEAD'?null:JSON.stringify({...data,stale,refreshIntervalHours:24}),{headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public,max-age=300','X-Content-Type-Options':'nosniff'}});
  }
};
