import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';

const html=fs.readFileSync(new URL('../essay-memorization.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../essay-memorization.js',import.meta.url),'utf8');
const migrationUrl=new URL('../supabase/migrations/20261110124500_essay_memory_realtime_progress.sql',import.meta.url);
assert.match(html,/essay-memorization\.js\?v=20261110-sync1/);
assert.match(html,/自動同步至同一學生帳戶的其他裝置/);
assert.match(app,/import\('\.\/classroom-live-sync\.mjs\?v=20261110-essay1'\)/);
assert.match(app,/system:'essay-memory'/);
assert.match(app,/essay_memory_progress_sync/);
assert.match(app,/localStorage\.setItem\(storageKey/,'local/offline fallback must remain immediate');
assert.match(app,/朗讀錄音只儲存在此瀏覽器/,'large voice recordings must remain device-local');
if (!fs.existsSync(migrationUrl)) {
  console.log('PASS Essay Memorization static sync contract; SQL and PGlite checks are skipped when migrations are absent from a dependency-free focused checkout.');
  process.exit(0);
}
const migration=fs.readFileSync(migrationUrl,'utf8');
assert.match(migration,/enable row level security/i);
assert.match(migration,/revoke all on essay_memory_private\.progress from public, anon, authenticated/i);
assert.match(migration,/p_system not in \([^)]*'essay-memory'/s);

const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
let PGlite;
try {
  ({PGlite}=require('@electric-sql/pglite'));
} catch (error) {
  if (error?.code !== 'MODULE_NOT_FOUND') throw error;
  console.log('PASS Essay Memorization static sync contract; PGlite database checks are skipped in dependency-free focused checkouts.');
  process.exit(0);
}
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function public.flashcard_session_student_id(uuid) returns uuid language sql as $$select case when $1 in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid) then $1 end$$;`);
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20261028051515_classroom_live_sync.sql',import.meta.url),'utf8'));
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20261028053118_classroom_live_retry_receipts.sql',import.meta.url),'utf8'));
await db.exec(migration);
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8222-bbbbbbbbbbbb'.replace('8222','8bbb');
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[randomUUID()]);
const sync=async({token=a,key='opinion:80',version='v1',base=0,progress=null,mutation=null}={})=>(await db.query(
  'select public.essay_memory_progress_sync($1,$2,$3,$4,$5,$6) result',
  [token,key,version,base,progress===null?null:JSON.stringify(progress),mutation]
)).rows[0].result;
const initial=await sync();assert.equal(initial.revision,0);assert.equal(initial.progress,null);
const firstProgress={stage:0,round:1,solved:{'0:0':2},completed:false,savedAt:'2026-11-10T00:00:00.000Z'};
const first=await sync({progress:firstProgress,mutation:randomUUID()});assert.ok(first.revision>0);assert.equal(first.progress.solved['0:0'],2);
const secondProgress={stage:1,round:0,solved:{'0:1':1},completed:false,savedAt:'2026-11-10T00:01:00.000Z'};
const second=await sync({base:first.revision,progress:secondProgress,mutation:randomUUID()});assert.ok(second.revision>first.revision);assert.deepEqual(second.progress.solved,{'0:0':2,'0:1':1});
const stale=await sync({base:first.revision,progress:{stage:0,round:0,solved:{'0:2':2},completed:true,savedAt:'2026-11-09T00:00:00.000Z'},mutation:randomUUID()});
assert.equal(stale.progress.stage,1,'a stale device must not rewind the latest navigation state');
assert.deepEqual(stale.progress.solved,{'0:0':2,'0:1':1,'0:2':2},'completion from both devices is merged');
assert.equal(stale.progress.completed,true);
assert.equal((await sync({token:b})).revision,0,'another account cannot read progress');
await assert.rejects(sync({key:'../bad',progress:firstProgress,mutation:randomUUID()}),/Invalid essay progress scope/);
const live=(await db.query('select public.classroom_live_sync($1,$2,$3,$4,$5,$6) result',[a,'essay-memory','20261110-realtime-v1:opinion:80',0,JSON.stringify({question:4,feedback:'correct'}),randomUUID()])).rows[0].result;
assert.equal(live.payload.feedback,'correct');
const grants=(await db.query("select has_table_privilege('authenticated','essay_memory_private.progress','select') direct,has_function_privilege('anon','public.essay_memory_progress_sync(uuid,text,text,bigint,jsonb,uuid)','execute') anonymous,has_function_privilege('authenticated','public.essay_memory_progress_sync(uuid,text,text,bigint,jsonb,uuid)','execute') authenticated")).rows[0];
assert.deepEqual(grants,{direct:false,anonymous:false,authenticated:true});
await db.close();
console.log('PASS Essay Memorization: durable account-isolated progress merge, stale-device protection, live classroom scope, offline local fallback and device-local recordings.');
