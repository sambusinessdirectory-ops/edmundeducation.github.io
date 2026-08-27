import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { bookmarkLocation, safeBookmarkHref, bookmarksCsv, RowReplay } from '../listening-study-core.mjs';
import { handleRequest } from '../supabase/functions/listening-study/server.mjs';
import { inspectMp3 } from '../supabase/functions/listening-study/mp3.mjs';

const root = new URL('../',import.meta.url);
const load = (file, key) => { const c={window:{}}; vm.runInNewContext(fs.readFileSync(new URL(file,root),'utf8'),c); return c.window[key]; };
const transcript=load('listening-practice-1-transcript.js','EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT');
const timings=load('listening-practice-1-timings.js','EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS');
test('all authored rows and legacy word bookmarks resolve to exact timings and bilingual text',()=>{
  for(const part of [1,2,3,4]) transcript[part].forEach((row,index)=>{
    for(const item_key of [`practice1:transcript:p${part}:line:${index}`,`practice1:p${part}:t${index}:2:word`]){
      const result=bookmarkLocation({item_key},transcript,timings);
      assert.equal(result.start,timings.parts[part].lines[index].start);
      assert.equal(result.end,timings.parts[part].lines[index].end);
      assert.equal(result.transcript,`${row.en}\n${row.zh}`);
    }
  });
  assert.equal(bookmarkLocation({item_key:'practice1:p1:table:r1'},transcript,timings),null);
  assert.equal(bookmarkLocation({item_key:'practice2:transcript:p1:line:0'},transcript,timings),null);
});
test('bookmark URLs and CSV cannot inject schemes or spreadsheet formulas',()=>{
  assert.equal(safeBookmarkHref('javascript:alert(1)'),'listening-system.html?section=ielts');
  assert.equal(safeBookmarkHref('https://evil.example'),'listening-system.html?section=ielts');
  const csv=bookmarksCsv([{flashcard_students:{name:'=1+1'},title:'Hello, "world"',detail:'\n+CMD',difficulty:4,href:'javascript:evil'}]);
  assert(csv.includes('"\'=1+1"')); assert(csv.includes('Hello, ""world""')); assert(!csv.includes('javascript:'));
});
class Audio extends EventTarget {
  constructor(){ super(); this.currentTime=0; this.paused=true; }
  pause(){ this.paused=true; this.dispatchEvent(new Event('pause')); }
  play(){ this.paused=false; this.dispatchEvent(new Event('play')); return Promise.resolve(); }
}
test('row replay stops at media-time boundary at every speed and resets after navigation',async()=>{
  for(const speed of [.25,.5,.75,1,1.25,1.5,1.75,2]){
    const audio=new Audio(), replay=new RowReplay(audio,()=>1,()=>{});
    await replay.play('https://audio.example',10,12,speed);
    assert.equal(audio.currentTime,10); assert.equal(audio.playbackRate,speed);
    audio.currentTime=12.01; audio.dispatchEvent(new Event('timeupdate'));
    assert.equal(audio.paused,true); assert.equal(audio.currentTime,12);
    await audio.play(); assert.equal(audio.currentTime,10);
    replay.stop(); audio.currentTime=40; audio.dispatchEvent(new Event('timeupdate')); assert.equal(audio.currentTime,40);
  }
});

const token='11111111-1111-4111-8111-111111111111', student='22222222-2222-4222-8222-222222222222';
const env={url:'https://database.test',key:'test-server-key'};
const request=(path,method='GET',body,auth=token,origin='https://edmundeducation.com')=>new Request('https://database.test/functions/v1/listening-study'+path,{method,headers:{origin,...(auth?{Authorization:`Bearer ${auth}`} : {}),...(body && !(body instanceof FormData)?{'Content-Type':'application/json'}:{})},body:body instanceof FormData ? body : body===undefined?undefined:JSON.stringify(body)});
const json=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
test('protected routes fail closed before reading data',async()=>{
  let calls=0;
  const transport=async()=>{calls++;return json([]);};
  assert.equal((await handleRequest(request('/recordings','GET',undefined,''),env,transport)).status,401);
  assert.equal((await handleRequest(request('/recordings','GET',undefined,token,'https://evil.example'),env,transport)).status,403);
  assert.equal(calls,0);
  assert.equal((await handleRequest(request('/admin/bookmarks'),env,transport)).status,401);
});
test('rating updates only the authenticated student existing Listening bookmark, not a supplied student id',async()=>{
  const calls=[];
  const transport=async(url,options)=>{calls.push({url,options});return url.includes('/rpc/')?json([{id:student,name:'QA'}]):json([{difficulty:5}]);};
  const result=await handleRequest(request('/bookmarks/rating','PATCH',{itemKey:'practice1:p1:t1:1:word',difficulty:5,student_id:'other'}),env,transport);
  assert.equal(result.status,200);
  const url=new URL(calls[1].url); assert.equal(url.searchParams.get('student_id'),`eq.${student}`); assert.equal(url.searchParams.get('system_key'),'eq.listening');
  assert.equal((await handleRequest(request('/bookmarks/rating','PATCH',{itemKey:'x',difficulty:6}),env,transport)).status,400);
});
test('admin endpoints verify a separate admin session; exports are paginated without student passwords',async()=>{
  const calls=[]; const transport=async(url)=>{calls.push(url);return url.includes('/rpc/')?json([{id:student,name:'Admin'}]):json([{title:'Test'}]);};
  const result=await handleRequest(request('/admin/bookmarks?offset=500'),env,transport);
  assert.equal(result.status,200); assert(calls[0].includes('listening_admin_me'));
  const params=new URL(calls[1]).searchParams; assert.equal(params.get('offset'),'500'); assert(!params.get('select').includes('password')); assert(params.get('select').includes('flashcard_students!inner(name)'));
});
test('server quota counts pending uploads and deletions as well as ready recordings',async()=>{
  const transport=async url=>url.includes('/rpc/')?json([{id:student}]):json([{size_bytes:1024,storage_state:'uploading'},{size_bytes:2048,storage_state:'ready'},{size_bytes:4096,storage_state:'deleting'}]);
  const result=await (await handleRequest(request('/recordings'),env,transport)).json();
  assert.equal(result.quota.usedBytes,7168); assert.equal(result.quota.maxBytes,104857600);
});
test('strict MP3 parser rejects arbitrary data and accepts consistent complete frames',()=>{
  assert.equal(inspectMp3(new Uint8Array(10000)),null);
  const bytes=new Uint8Array(417*50); for(let i=0;i<50;i++)bytes.set([0xff,0xfb,0x90,0],i*417);
  assert(inspectMp3(bytes).durationMs>1000); assert.equal(inspectMp3(bytes.subarray(0,bytes.length-1)),null);
});
test('recordings are ownership-filtered, private and never delete metadata on storage failure',async()=>{
  const calls=[];const transport=async(url,options={})=>{
    calls.push({url,options});
    if(url.includes('listening_student_profile'))return json([{id:student}]);
    if(url.includes('listening_claim_recording_delete'))return json({recording:{object_path:'students/qa/recording.mp3'}});
    if(url.includes('/storage/'))return new Response('',{status:500});
    return json([{object_path:'students/qa/recording.mp3',storage_state:'ready'}]);
  };
  assert.equal((await handleRequest(request(`/recordings/${token}`,'DELETE'),env,transport)).status,502);
  assert(new URL(calls[1].url).searchParams.get('student_id')===`eq.${student}`);
  assert(!calls.some(c=>c.url.includes('/rest/v1/listening_recordings')&&c.options.method==='DELETE'));
});
test('migration retains existing logins and applies server-only permissions and atomic quotas',()=>{
  const sql=fs.readFileSync(new URL('supabase-listening-study-20260827.sql',root),'utf8');
  assert.match(sql,/pg_advisory_xact_lock/);assert.match(sql,/used\+p_size>104857600/);
  assert.match(sql,/from public, anon, authenticated/);assert.match(sql,/password_hash <> extensions\.crypt/);
  assert.doesNotMatch(sql,/update public\.flashcard_students|drop table|delete from public\.learning_portal_bookmarks/i);
});
