import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../language-learning.js',import.meta.url),'utf8');const saved=new Map();
const storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
function edition(language){const c={window:{},localStorage:storage,URLSearchParams,location:{search:'?language='+language},document:{documentElement:{dataset:{}},addEventListener(){}}};vm.runInNewContext(source,c);return c.window.EdmundLanguage;}
const it=edition('it'),fr=edition('fr'),en=edition('en');it.storage.setItem('edmundFlashcardAttempts','Italian');assert.equal(fr.storage.getItem('edmundFlashcardAttempts'),null);assert.equal(en.storage.getItem('edmundFlashcardAttempts'),null);assert.equal(it.localKey('edmundFlashcardSession'),'edmundFlashcardSession');
const calls=[];const row={id:'fixture-id',name:'Student',created_at:'2020-01-01',access:{'dse-writing':true}};
const client={async rpc(name,args){calls.push({name,args});return {data:name==='language_learning_access'?args.p_args.p_access:[row],error:null};}};
const result=await it.rpc(client,'writing_admin_set_student_access',{p_admin_name:'Fixture',p_admin_password:'fixture-only',p_student_name:'Student',p_access:{'food-cooking':false}});
assert.equal(result.data[0].id,row.id);assert.equal(result.data[0].created_at,row.created_at);assert.equal(result.data[0].access['food-cooking'],false);assert.equal(row.access['dse-writing'],true);assert.equal(calls.some(c=>c.name==='writing_admin_set_student_access'),false);
await it.rpc(client,'flashcard_student_get_state_v2',{p_token:'fixture'});assert.equal(calls.at(-1).name,'language_learning_rpc');assert.equal(calls.at(-1).args.p_language,'it');
console.log('PASS: original/Italian/French storage isolation, record routing, independent access and preserved account metadata');
