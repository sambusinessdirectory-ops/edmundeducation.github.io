const CONNECTION_ERROR='暫時無法連線，請稍後再試。';

export function createAuthenticatedRpc({config,supabase,storage}={}){
 let client;
 function getClient(){
  if(client)return client;
  if(!supabase?.createClient||!config?.url||!config?.anonKey)throw Error('登入服務暫時未能載入，請重新整理頁面。');
  client=supabase.createClient(config.url,config.anonKey,{auth:{persistSession:Boolean(storage),...(storage?{storage}:{}),autoRefreshToken:true,detectSessionInUrl:false}});
  return client;
 }
 return async function rpc(name,args){
  try{
   const api=getClient();
   const current=await api.auth.getSession();
   if(current.error)throw current.error;
   if(!current.data?.session?.access_token){
    const signedIn=await api.auth.signInAnonymously();
    if(signedIn.error)throw signedIn.error;
    if(!signedIn.data?.session?.access_token)throw Error('Missing anonymous session');
   }
   const result=await api.rpc(name,args);
   if(result.error)throw result.error;
   return result.data;
  }catch(error){
   console.error('Literary Device RPC failed',name,error);
   if(error?.message==='登入服務暫時未能載入，請重新整理頁面。')throw error;
   throw Error(CONNECTION_ERROR,{cause:error});
  }
 };
}
