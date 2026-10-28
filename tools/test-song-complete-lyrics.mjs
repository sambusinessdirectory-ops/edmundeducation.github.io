import fs from 'node:fs';
import assert from 'node:assert/strict';
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
for(const [name,count] of [['photograph',58],['open-arms',37],['thinking-out-loud',41],['shake-it-off',74],['dont-stop-believin',38],['if-bread',20],['i-lay-my-love-on-you',42],['i-want-it-that-way',54]]){
 const song=JSON.parse(fs.readFileSync(`tools/song-content/${name}.json`));
 assert.equal(song.translations.length,count);
 for(const mode of song.exercises){
  assert.equal(mode.listeningLines.length,count);
  const positions=mode.questions.map(q=>q.options.indexOf(q.answer));
  positions.forEach((p,i)=>{assert.ok(p>=0);if(i>1)assert.ok(p!==positions[i-1]||p!==positions[i-2],`${name}/${mode.id}: three repeated answer positions at ${i+1}`);});
  const seen=[];
  mode.listeningLines.forEach((line,i)=>{
   assert.equal(line.lineId,song.translations[i].lineId);
   const restored=line.prompt.replace(/\{\{q:(\d+)\}\}/g,(_,n)=>{
    seen.push(+n);const q=mode.questions.find(q=>q.number===+n);
    assert.equal(q.lineId,line.lineId);assert.ok(q.options.includes(q.answer));return q.answer;
   });
   assert.equal(norm(restored),norm(song.translations[i].english));
  });
  assert.deepEqual(seen,mode.questions.map(q=>q.number));
 }
 song.translations.forEach((r,i)=>{assert.ok(r.endSeconds>r.startSeconds);if(i)assert.ok(r.startSeconds>=song.translations[i-1].endSeconds-(name==='photograph'?.25:0));});
}
console.log('Complete lyric flow: every line, repeated chorus, blank and answer matches every lesson in all modes.');
