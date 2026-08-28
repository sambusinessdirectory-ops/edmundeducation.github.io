import assert from 'node:assert/strict';
import {groupEmailRequests,attemptHistory,recordAttempt} from '../email-attempt.mjs';
const event=(id,stage,details={},outcome='ok')=>({request_id:id,stage,details,outcome,created_at:'2026-08-27T16:24:49Z'});
const groups=groupEmailRequests([
 event('read','request_received',{method:'GET',path:'/v1/admin/email/logs'}),event('read','request_complete',{httpStatus:200}),
 event('preview','preview_opened'),event('preview','preview_check_finished'),
 event('cancel','preview_opened'),event('cancel','preview_cancelled'),
 event('error','browser_failed',{step:'assets'},'error'),
 event('queued','submit_committed',{state:'queued'}),
 event('client','browser_receipt',{state:'queued'}),
 event('draft','submit_committed',{state:'saved'})
]);
const byId=id=>groups.find(g=>g.requestId===id);
assert.equal(byId('read').readOnly,true);assert.match(byId('read').state,/不是發送/);
assert.match(byId('preview').state,/尚未取得/);assert.match(byId('cancel').state,/未發送/);
assert.match(byId('error').state,/失敗/);assert.match(byId('queued').state,/已建立/);
assert.match(byId('client').state,/尚未取得/);assert.match(byId('draft').state,/非一次性發送/);
const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
for(let i=0;i<70;i++)await assert.rejects(recordAttempt({storage,key:'test',requestId:'test-id',slot:1,stage:'browser_failed',step:'validation',api:async()=>{throw new Error('offline');}}),/offline/);
assert.equal(attemptHistory(storage,'test').length,60);
assert.deepEqual(Object.keys(attemptHistory(storage,'test')[0]).sort(),['requestId','slot','stage','step','time','version']);
console.log('PASS diagnostics: read requests distinguished, browser observations cannot claim queue success, offline metadata bounded.');
