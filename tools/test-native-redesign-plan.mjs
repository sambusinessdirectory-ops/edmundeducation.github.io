import assert from 'node:assert/strict';
import fs from 'node:fs';
import imported from '../natural-english/imported-lessons.mjs';
import {styles,plan} from './plan-native-english-redesign.mjs';

const saved=JSON.parse(fs.readFileSync(new URL('../natural-english/redesign-plan.json',import.meta.url),'utf8'));
const expected=plan();
assert.deepEqual(saved,expected,'saved editorial allocation must match source catalogue');
assert.equal(saved.rows.length,459);
const ids=Object.keys(styles),used=new Set();
for(const [index,row] of saved.rows.entries()){
  assert.ok(row.styles.length===5||row.styles.length===6,row.id);
  assert.equal(new Set(row.styles).size,row.styles.length,row.id);
  assert.ok(row.styles.includes('audio'),row.id);
  for(const style of row.styles){assert.ok(ids.includes(style),row.id+' '+style);used.add(style);}
  const source=imported.find(lesson=>lesson.id===row.id);
  assert.equal(row.sourceSha256,source.sourceSha256,row.id);
  assert.equal(row.status,[7,8,9,10,11,12,14,16,17,18].includes(row.number)?'draft-needs-editorial-review':'needs-content-authoring',row.id);
  if(index)assert.notDeepEqual(row.styles,saved.rows[index-1].styles,'neighbouring lessons must differ');
}
assert.deepEqual([...used].sort(),ids.sort());
assert.ok(saved.uses.speak>250&&saved.uses.speak<400);
assert.ok(saved.uses.final>250&&saved.uses.final<400);
assert.ok(saved.rows.some(row=>!row.styles.includes('speak')));
assert.ok(saved.rows.some(row=>!row.styles.includes('final')));
console.log('PASS: 459 approved lessons allocated five or six distinct styles; all 14 styles occur; speaking/final vary; sources match; ten drafts are held for review.');
