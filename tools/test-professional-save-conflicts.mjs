import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const bundle=fs.readFileSync(new URL('../professional-english/app.js',import.meta.url),'utf8');
const save=bundle.slice(bundle.indexOf('async function zt(){'),bundle.indexOf('function ml(',bundle.indexOf('async function zt(){')));
assert.ok(save.startsWith('async function zt(){'));
for(const code of ['PT409','40001']){
 let calls=0,backups=0;const notices=[];
 const state={marks:{one:'green'},study:{queue:['one'],position:1,completedAt:123,elapsedMs:1000},revision:2,seq:4,dirty:true,pending:null};
 const context={qt:{current:state},Go:{current:null},Ut:{current:false},cl:{current:true},crypto,e:{id:'deck',version:1},t:{token:'synthetic-token'},L:value=>notices.push(value),i:value=>notices.push(value),Ma:error=>error.message,Su:()=>backups++,De:async()=>{calls++;throw Object.assign(Error('Progress changed on another device. Reopen this deck to load it.'),{code});}};
 vm.createContext(context);vm.runInContext(save,context);
 await assert.rejects(context.zt(),error=>error.code===code);
 assert.equal(context.Ut.current,true);assert.equal(calls,1);assert.ok(backups>0);
 assert.equal(state.dirty,true);assert.ok(state.pending?.args.p_mutation);assert.equal(state.pending.args.p_marks.one,'green');assert.equal(state.pending.args.p_study.position,1,'completed work stays in the device backup');
 await assert.rejects(context.zt(),/Reopen/);assert.equal(calls,1,'blocked save cannot repeatedly hit the database');
 assert.ok(notices.includes('Not synced'));
}
console.log('Save conflict recovery: HTTP 409 and legacy errors stop further saves, retain completed device drafts, and show a recovery notice.');
