import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import worker from '../workers/model-essay-downloads/src/index.js';
import {DSE_WRITING_PART_B_CATALOG as catalog} from '../workers/model-essay-downloads/src/dse-writing-part-b-catalog.js';
const source=process.argv[2],output=process.argv[3];
globalThis.FixedLengthStream ||= class {constructor(){const s=new TransformStream();this.readable=s.readable;this.writable=s.writable;}};
let permitted=true;const audits=[];const pending=[];
const env={ALLOWED_ORIGIN:'https://edmundeducation.com',SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_ANON_KEY:'test-publishable',SESSION_SIGNING_KEY:'test-only-dse-signing-key-at-least-32-characters',MODEL_ESSAY_SERVICE_SECRET:'test-only-dse-audit-key-at-least-32-characters',SPEAKING_ASSETS:{async get(key){const item=catalog.find(x=>x.key===key);if(!item)return null;const bytes=source?await readFile(path.join(source,item.filename)):Buffer.alloc(item.bytes);return {size:bytes.length,httpEtag:'"fixture"',body:new Blob([bytes]).stream()};}}};
const ctx={waitUntil(p){pending.push(p);}};const original=globalThis.fetch;
globalThis.fetch=async(url,options={})=>{
 const name=String(url).split('/').at(-1);const body=JSON.parse(options.body||'{}');
 if(name==='model_essay_student_profile')return Response.json([{id:'11111111-1111-4111-8111-111111111111',dse:true,ielts:false}]);
 if(name==='model_essay_record_download'){assert.equal(body.p_section,'dse');assert.equal(body.p_task,'writing-part-b');audits.push(body);return Response.json(permitted?body.p_request_id:null);}
 if(name==='model_essay_finish_download')return Response.json(true);
 throw new Error('Unexpected external request: '+url);
};
const request=(route,body={},origin=env.ALLOWED_ORIGIN)=>new Request('https://fixture.invalid/v1'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)});
try{
 const health=await(await worker.fetch(new Request('https://fixture.invalid/v1/health'),env,ctx)).json();assert.equal(health.collections['dse-writing-part-b'],82);
 assert.equal((await worker.fetch(request('/dse/writing-part-b/files/'+catalog[0].id),env,ctx)).status,401);
 assert.equal((await worker.fetch(request('/dse/writing-part-b/zip',{},'https://untrusted.invalid'),env,ctx)).status,403);
 const session=await worker.fetch(new Request('https://fixture.invalid/v1/session',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({token:'22222222-2222-4222-8222-222222222222',accessToken:'test-only-session'})}),env,ctx);
 assert.equal(session.status,200);const {token:downloadToken}=await session.json();
 assert.equal((await worker.fetch(request('/dse/writing-part-b/zip',{downloadToken,all:'1'}),env,ctx)).status,400);
 permitted=false;assert.equal((await worker.fetch(request('/dse/writing-part-b/files/'+catalog[0].id,{downloadToken}),env,ctx)).status,403);permitted=true;
 const single=await worker.fetch(request('/dse/writing-part-b/files/'+catalog[0].id,{downloadToken}),env,ctx);assert.equal(single.status,200);assert.equal(single.headers.get('content-type'),'application/pdf');assert.match(single.headers.get('cache-control'),/private/);
 const bytes=Buffer.from(await single.arrayBuffer());assert.equal(bytes.length,catalog[0].bytes);if(source)assert.equal(createHash('sha256').update(bytes).digest('hex'),catalog[0].sourceSha256);
 const zip=await worker.fetch(request('/dse/writing-part-b/zip',{downloadToken,all:'1',confirmAll:'1'}),env,ctx);assert.equal(zip.status,200);const archive=Buffer.from(await zip.arrayBuffer());assert.equal(archive.readUInt32LE(0),0x04034b50);assert.equal(archive.readUInt16LE(archive.length-12),82);if(output)await writeFile(output,archive);
 await Promise.all(pending);assert.ok(audits.some(x=>x.p_essay_ids.length===82));
 console.log('DSE Part B downloads passed: 82-file archive, PDF bytes, authentication, DSE access audit, CORS and confirmation.');
}finally{globalThis.fetch=original;}
