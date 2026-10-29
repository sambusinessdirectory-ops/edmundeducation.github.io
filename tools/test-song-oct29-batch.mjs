import fs from 'node:fs';
import assert from 'node:assert/strict';
const slugs=['bohemian-rhapsody','viva-la-vida','perfect','somebody-that-i-used-to-know','imagine','fly-me-to-the-moon','my-way','forever-young','nothings-gonna-stop-us-now','take-on-me','somewhere-only-we-know','every-breath-you-take','with-or-without-you','always','livin-on-a-prayer','its-my-life','a-thousand-years','oops-i-did-it-again'];
function balance(positions,k,label){const counts=Array.from({length:k},(_,p)=>positions.filter(x=>x===p).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1,label);positions.forEach((p,i)=>{assert.ok(p>=0&&p<k);if(i>1)assert.ok(!(p===positions[i-1]&&p===positions[i-2]),label);});}
let total=0;
for(const slug of slugs){
 const d=JSON.parse(fs.readFileSync(`tools/song-content/${slug}.json`));
 assert.ok(d.description.startsWith('《'),`${slug} intro`);assert.ok(d.description.length<2000);
 assert.equal(d.vocabulary.length,10);assert.equal(d.exercises.length,4);
 assert.ok(fs.statSync(`song-media/${slug}/album.mp3`).size>1000000);assert.ok(fs.statSync(`song-media/${slug}/cover.webp`).size>5000);
 assert.equal(new Set(d.translations.map(r=>r.lineId)).size,d.translations.length);
 d.translations.forEach(r=>{assert.ok(r.english.trim());assert.ok(r.chinese.trim());if(r.startSeconds!==undefined){assert.ok(r.endSeconds>r.startSeconds);assert.ok(r.endSeconds<=d.audioAlignment.duration+.1);}});
 d.exercises.forEach((m,index)=>{
  assert.equal(m.questions.length,[20,32,40,50][index]);assert.equal(m.listeningLines.length,d.translations.length);total+=m.questions.length;
  balance(m.questions.map(q=>q.options.indexOf(q.answer)),3,slug+'/'+m.id);
  const seen=[];
  m.listeningLines.forEach((line,i)=>{
   assert.equal(line.lineId,d.translations[i].lineId);
   const restored=line.prompt.replace(/\{\{q:(\d+)\}\}/g,(_,n)=>{seen.push(+n);const q=m.questions[+n-1];assert.equal(q.lineId,line.lineId);assert.equal(q.options.length,3);assert.equal(new Set(q.options.map(s=>s.toLowerCase().replace(/[^a-z0-9]/g,''))).size,3);return q.answer;});
   assert.equal(restored,d.translations[i].english,slug+'/'+m.id+'/'+i);
  });assert.deepEqual(seen,m.questions.map(q=>q.number));
 });
 balance(d.vocabulary.map(q=>q.answer),4,slug+'/vocabulary');
 d.vocabulary.forEach(q=>{assert.equal(q.options.length,4);assert.equal(q.optionExplanations.length,4);assert.equal(q.explanation,q.optionExplanations[q.answer]);});
}
console.log(`${slugs.length} lessons: ${total} listening questions, 180 vocabulary questions, complete source lyric flow and balanced answer positions passed.`);
