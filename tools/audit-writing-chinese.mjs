import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const baseline = process.argv[2] || 'HEAD';
const html = fs.readFileSync('writing-practice.html','utf8');
const files = [...html.matchAll(/<script src="(writing-practice[^"?]+-data\.js)/g)].map(m=>m[1]);
files.push('italian-1-burro-montato-data.js','italian-2-torta-coi-bischeri-data.js','french-1-fondant-data.js');
const records=[];
let checkedLeaves=0;
function compare(a,b,path,file,parentA,parentB) {
  if (a === b) {checkedLeaves++;return;}
  if (typeof a === 'string' && typeof b === 'string') {
    assert.ok(/[\u3400-\u9fff]/u.test(a), `Non-Chinese string changed: ${file}:${path}`);
    assert.ok(/[\u3400-\u9fff]/u.test(b), `Chinese string removed: ${file}:${path}`);
    // English examples embedded inside bilingual notes remain verbatim.
    const englishLines = str => str.split('\n').filter(line=>/[a-zA-Z]/.test(line) && !/[\u3400-\u9fff]/u.test(line));
    assert.deepEqual(englishLines(b),englishLines(a), `Embedded English changed: ${file}:${path}`);
    records.push({file,path,english:parentB?.english||parentB?.en||'',before:a,after:b});
    return;
  }
  assert.ok(a && b && typeof a === 'object' && typeof b === 'object', `Structural change: ${file}:${path}`);
  assert.deepEqual(Object.keys(b),Object.keys(a), `Keys changed: ${file}:${path}`);
  for (const k of Object.keys(a)) compare(a[k],b[k],`${path}.${k}`,file,a,b);
}
for(const file of files) {
  const before={window:{}},after={window:{}};
  vm.runInNewContext(execFileSync('git',['show',`${baseline}:${file}`],{encoding:'utf8',maxBuffer:40*1024*1024}),before);
  vm.runInNewContext(fs.readFileSync(file,'utf8'),after);
  compare(before.window,after.window,'window',file);
}
fs.writeFileSync('/tmp/writing-chinese-reviewed-fields.json',JSON.stringify(records,null,2));
console.log(JSON.stringify({dataFiles:files.length,unchangedLeaves:checkedLeaves,changedChineseFields:records.length,englishAndAnswerKeysUnchanged:true}));
