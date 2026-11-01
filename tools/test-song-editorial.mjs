import assert from 'node:assert/strict';
import {editorialIssues} from './song-editorial/quality.mjs';
const song=options=>({description:'完整介紹。',exercises:[{id:'test',questions:[{number:1,options}]}]});
for(const option of ['thiss time tomorrow',"Body'ss aching","I've stayt to go","I'ves got to go","he'ss dead",'justs begun','nevers been born','Pulled my again','killed a again','anewinventedword'])assert.ok(editorialIssues(song([option])).length,option);
assert.deepEqual(editorialIssues(song(["Body's aching","Body's shaking","Body's breaking"])),[]);
assert.deepEqual(editorialIssues(song(['this time tomorrow','this time tonight','same time tomorrow'])),[]);
assert.ok(editorialIssues({...song([]),description:'最令人難'}).length);
assert.deepEqual(editorialIssues({...song([]),description:'<p>最令人難受的，是無法確定這份愛是否仍被需要。</p>'}),[]);
console.log('Editorial regression checks passed: malformed words, fallback distractors and unfinished descriptions blocked.');
