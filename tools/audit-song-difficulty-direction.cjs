const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('song-difficulty-data.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('song-difficulty.js','utf8'),sandbox);
const original=JSON.parse(fs.readFileSync('tools/song-import-reports/20261029-difficulty-metadata.json'));
assert.equal(original.axes[3],'clarityDifficulty');
const rows=[];
for(const [slug,p] of Object.entries(sandbox.window.SONG_DIFFICULTY_DATA)){
 assert.equal(p.scores.length,6);assert.ok(p.scores.every(v=>Number.isInteger(v)&&v>=1&&v<=10));
 const total=p.scores.reduce((a,b)=>a+b,0),stars=sandbox.window.SongDifficulty.starLevel(total);
 const old=original.profiles[slug];if(old)assert.deepEqual(Array.from(p.scores),old.scores);
 for(let axis=0;axis<6;axis++)if(p.scores[axis]<10){const plus=p.scores.slice();plus[axis]++;const next=plus.reduce((a,b)=>a+b,0);assert.equal(next,total+1);assert.ok(sandbox.window.SongDifficulty.starLevel(next)>=stars);}
 rows.push({slug,vocalDecodingDifficulty:p.scores[3],total,stars,scoreChanged:false,evidence:old?'Original clarityDifficulty axis; unchanged six scores and original note':'Later profile using the same six-axis difficulty schema; no individual original note',originalNote:old?.note||null});
}
const report={date:'2026-10-30',scope:'All 49 published profiles; direction, provenance, totals and stars',conclusion:'The former clarity label was ambiguous. Existing stored values were difficulty values already. Do not apply 11-minus-score: that would reverse correctly directed estimates.',direction:'Every axis: 1 easier, 10 harder. Axis 4: 辨音難度 / Vocal decoding difficulty.',limits:'Editorial estimates, not learner-calibrated measurements. This is a direction/provenance audit, not a fresh audio-listening assessment. Eleven later profiles have less documented individual reasoning. No unsupported numeric changes were made.',profiles:rows};
fs.writeFileSync('tools/song-import-reports/20261030-difficulty-direction-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(rows.length+' profiles: direction, six-axis monotonicity, original evidence, totals and stars PASS; numeric changes 0.');
