import assert from 'node:assert/strict';
import {connectionFetch,loginError,grammarAdminConnection} from '../grammar-admin-connection.mjs';
const url='https://ookkxzgpdclzrrhfmvqx.supabase.co/rest/v1/rpc/grammar_admin_login';
let calls=0;
const retry=connectionFetch(async(request)=>{
 assert.equal(request.url,url);assert.equal(await request.text(),'{"example":"body survives retries"}');
 if(++calls<3)throw new TypeError('Load failed');return new Response('[]');
});
assert.equal((await retry(url,{method:'POST',body:'{"example":"body survives retries"}'})).status,200);assert.equal(calls,3);
calls=0;const wrong=connectionFetch(async()=>{calls++;return new Response('invalid credentials',{status:400});});assert.equal((await wrong(url)).status,400);assert.equal(calls,1,'Do not retry bad credentials');
calls=0;const down=connectionFetch(async()=>{calls++;throw new TypeError('Load failed');});await assert.rejects(down(url),/這不是密碼錯誤/);assert.equal(calls,3);
assert.match(loginError(new TypeError('Load failed')),/連接/);assert.equal(loginError(new Error('Wrong password')),'Wrong password');
assert.rejects(grammarAdminConnection({}).rpc('anything',{}),/Unsupported/);
console.log('Grammar connection checks: interrupted Safari requests retried with intact body, fixed destination, no credential-error retry, useful network messages.');
