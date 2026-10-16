import assert from 'node:assert/strict';
import {nearDuplicates} from './near-duplicates.mjs';
const make=(id,en,zh)=>({id,listening:{en},writing:{promptZh:zh}});
const records=[
 make('a','The team checked the opening hours before printing the final set of posters.','新情境：小組先查開放時間，再印最後一批海報。用一至兩句英文描述。'),
 make('b','The team checked the opening hours before printing the final batch of posters.','新情境：小組先查開放時間，再印最後一批海報。用一至兩句英文說明。'),
 make('c','During the storm, a family moved their bicycles into the garage.','新情境：暴雨前家人把單車搬入車房。用一至兩句英文描述。')
];
const flags=nearDuplicates(records);
assert.ok(flags.some(f=>f.field==='listening'&&f.lessonA==='a'&&f.lessonB==='b'));
assert.ok(flags.some(f=>f.field==='writing'&&f.kind==='exact-normalized-task'));
assert.ok(!flags.some(f=>[f.lessonA,f.lessonB].includes('c')));
console.log('Near-duplicate screening finds close tasks without treating shared instructions as a duplicate decision.');
