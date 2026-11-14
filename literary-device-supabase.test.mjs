import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAuthenticatedRpc} from './literary-device-supabase.mjs';

test('loads the pinned Supabase client before the Literary Device login module',()=>{
 const html=fs.readFileSync('literary-device.html','utf8');
 const auth=fs.readFileSync('literary-device-auth.js','utf8');
 const clientIndex=html.indexOf('@supabase/supabase-js@2.110.8');
 const configIndex=html.indexOf('supabase-config.js');
 const authIndex=html.indexOf('literary-device-auth.js?v=ledger8');
 assert.ok(clientIndex>=0&&clientIndex<configIndex&&configIndex<authIndex);
 assert.match(auth,/createAuthenticatedRpc/);
 assert.doesNotMatch(auth,/fetch\(c\.url\+'\/rest\/v1\/rpc\/'/);
});

test('creates one anonymous Auth session before protected student RPCs',async()=>{
 const calls=[];let session=null,signIns=0;
 const client={
  auth:{
   async getSession(){return {data:{session},error:null};},
   async signInAnonymously(){signIns+=1;session={access_token:'anonymous-jwt'};return {data:{session},error:null};}
  },
  async rpc(name,args){calls.push({name,args,token:session?.access_token});return {data:[{ok:true}],error:null};}
 };
 const supabase={createClient(url,key,options){calls.push({url,key,options});return client;}};
 const rpc=createAuthenticatedRpc({config:{url:'https://project.supabase.co',anonKey:'publishable'},supabase,storage:{}});
 assert.deepEqual(await rpc('flashcard_student_login',{p_name:'Student'}),[{ok:true}]);
 assert.deepEqual(await rpc('flashcard_student_get_state_v2',{p_token:'student-token'}),[{ok:true}]);
 assert.equal(signIns,1);
 assert.equal(calls.filter(call=>call.name).length,2);
 assert.ok(calls.filter(call=>call.name).every(call=>call.token==='anonymous-jwt'));
 assert.equal(calls[0].options.auth.persistSession,true);
});

test('reports protected RPC failures without exposing backend details',async()=>{
 const session={access_token:'anonymous-jwt'};
 const supabase={createClient:()=>({auth:{getSession:async()=>({data:{session},error:null})},rpc:async()=>({data:null,error:{code:'42501',message:'permission denied'}})})};
 const rpc=createAuthenticatedRpc({config:{url:'https://project.supabase.co',anonKey:'publishable'},supabase});
 await assert.rejects(rpc('flashcard_student_get_state_v2',{}),/暫時無法連線/);
});

test('fails clearly when the pinned Supabase client did not load',async()=>{
 const rpc=createAuthenticatedRpc({config:{},supabase:{}});
 await assert.rejects(rpc('flashcard_student_login',{}),/登入服務暫時未能載入/);
});
