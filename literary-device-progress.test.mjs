import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeProgress,normalizeProgress,progressCount} from './literary-device-progress.mjs';

test('restored legacy work counts without inventing question ids',()=>{
 const state=normalizeProgress({modes:{'#exercise':{legacyCredit:7,answers:{}}}});
 assert.equal(progressCount(state.modes['#exercise'],360),7);
 assert.deepEqual(state.modes['#exercise'].answers,{});
});

test('remote and newer local answers merge without losing submitted work',()=>{
 const merged=mergeProgress(
  {updatedAt:10,modes:{'#exercise':{answers:{'12':{correct:true,selectedLabels:['A']}},legacyCredit:7}}},
  {updatedAt:20,modes:{'#exercise':{answers:{'27':{correct:false,selectedLabels:['B']}},legacyCredit:7,order:['27','12'],currentId:'27'}}}
 );
 assert.deepEqual(Object.keys(merged.modes['#exercise'].answers).sort(),['12','27']);
 assert.equal(progressCount(merged.modes['#exercise'],360),9);
 assert.equal(merged.modes['#exercise'].currentId,'27');
});

test('progress never exceeds the bank size',()=>{
 const answers=Object.fromEntries(Array.from({length:360},(_,i)=>[String(i+1),{correct:true,selectedLabels:[]} ]));
 assert.equal(progressCount({answers,legacyCredit:7},360),360);
});
