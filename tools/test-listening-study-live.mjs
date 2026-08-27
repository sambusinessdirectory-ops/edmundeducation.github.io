// Opt-in smoke test using a short-lived synthetic student token passed on stdin.
// Uploads only a generated tone and deletes that same test object before exit.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createInterface } from 'node:readline/promises';
const input=createInterface({input:process.stdin,output:process.stdout});
const token=(await input.question('Short-lived QA student token: ')).trim();input.close();
const base='https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/listening-study';
const headers={Origin:'https://edmundeducation.com',Authorization:`Bearer ${token}`};
const call=async(path,init={})=>{
  const response=await fetch(base+path,{...init,headers:{...headers,...init.headers}});
  if(!response.ok)throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  return response;
};
const before=await (await call('/recordings')).json();
const bookmarks=await (await call('/bookmarks')).json();
if(bookmarks.rows.some(row=>row.item_key==='qa-listening-release')){
  await call('/bookmarks/rating',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemKey:'qa-listening-release',difficulty:4})});
  const updated=await (await call('/bookmarks')).json();
  assert.equal(updated.rows.find(row=>row.item_key==='qa-listening-release').difficulty,4);
  const missing=await fetch(base+'/bookmarks/rating',{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({itemKey:'missing-qa-bookmark',difficulty:4})});
  assert.equal(missing.status,404);
  console.log('PASS: star rating persisted and an absent bookmark cannot be rated');
}
const bytes=await fs.readFile('/tmp/listening-release-test-20260827.mp3');
const id=crypto.randomUUID();
const form=()=>{const f=new FormData();for(const [k,v] of Object.entries({id,practice:1,part:1,rowIndex:10,title:'Listening release QA tone',transcript:'Synthetic test audio only.'}))f.append(k,String(v));f.append('file',new Blob([bytes],{type:'audio/mpeg'}),'qa.mp3');return f;};
let reserved=false;
try{
  reserved=true;
  await call('/recordings',{method:'POST',body:form()});
  await call('/recordings',{method:'POST',body:form()});
  const after=await (await call('/recordings')).json();
  assert.equal(after.quota.usedBytes,before.quota.usedBytes+bytes.length,'Retry must not double-charge storage');
  const audio=Buffer.from(await (await call(`/recordings/${id}`)).arrayBuffer());
  assert.deepEqual(audio,bytes,'Private download must match the uploaded MP3');
  const denied=await fetch(base+`/recordings/${id}`,{headers:{Origin:headers.Origin}});
  assert.equal(denied.status,401,'Anonymous download must fail');
  console.log('PASS: private MP3 upload, idempotent retry, quota, authenticated download, anonymous rejection');
}finally{
  if(reserved)await call(`/recordings/${id}`,{method:'DELETE'});
}
const final=await (await call('/recordings')).json();
assert.equal(final.quota.usedBytes,before.quota.usedBytes);
console.log('PASS: test recording deleted and quota restored');
