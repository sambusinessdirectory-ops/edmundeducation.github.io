const NETWORK_MESSAGE='未能連接登入服務。請保持網絡連線，再按登入重試；這不是密碼錯誤。';
const retryable=error=>/load failed|failed to fetch|network|fetch|timeout|abort|connection/i.test(String(error?.message||error));
// Keep the existing Supabase destination; recover interrupted Safari fetches.
export function connectionFetch(fetcher=globalThis.fetch.bind(globalThis)){
 return async(input,options={})=>{
  const request=new Request(input,options);
  for(let attempt=0;attempt<3;attempt++){
   if(request.signal.aborted)throw request.signal.reason;
   try{
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    const cancel=()=>controller.abort(request.signal.reason);
    request.signal.addEventListener('abort',cancel,{once:true});
    try{
     const response=await fetcher(request.clone(),{signal:controller.signal});
     if(response.status<500||attempt===2)return response;
    }finally{clearTimeout(timeout);request.signal.removeEventListener('abort',cancel);}
   }catch(error){if(request.signal.aborted)throw error;if(!retryable(error)||attempt===2)throw new Error(NETWORK_MESSAGE);}
   await new Promise(resolve=>setTimeout(resolve,400*(attempt+1)));
  }
 };
}
export function grammarAdminConnection(source=window){
 let client,pending;
 function getClient(){
  if(client)return client;
  const config=source.EDMUND_SUPABASE;
  if(!source.supabase?.createClient || !config?.url)throw new Error('登入服務未能載入，請重新整理頁面。');
  let storage;try{storage=source.sessionStorage;}catch{/* Private browsing can disable storage. */}
  client=source.supabase.createClient(config.url,config.anonKey,{global:{fetch:connectionFetch()},auth:{storageKey:'edmund-grammar-admin-auth-v1',persistSession:Boolean(storage),...(storage?{storage}:{}),autoRefreshToken:true,detectSessionInUrl:false}});
  return client;
 }
 async function connect(){
  if(pending)return pending;
  pending=(async()=>{
   const c=getClient();const current=await c.auth.getSession();if(current.error)throw current.error;
   if(!current.data?.session?.user?.id){const result=await c.auth.signInAnonymously();if(result.error)throw result.error;}
   return c;
  })();
  try{return await pending;}finally{pending=null;}
 }
 return {async rpc(name,args){
  if(!['grammar_admin_login','grammar_admin_profile','grammar_admin_logout'].includes(name))throw new Error('Unsupported admin operation');
  const c=await connect();const result=await c.rpc(name,args);if(result.error)throw result.error;return result.data;
 }};
}
export function loginError(error){
 const message=String(error?.message||'');
 return retryable(error)?NETWORK_MESSAGE:message||'登入失敗，請重試。';
}
