import fs from 'node:fs';
import assert from 'node:assert/strict';
const slugs=["just-give-me-a-reason", "hold-my-hand", "snowman", "what-makes-you-beautiful", "cheap-thrills", "rewrite-the-stars", "never-enough", "clocks", "yellow", "wake-me-up", "just-dance", "counting-stars", "diamonds", "believer", "we-are-young", "this-is-me", "another-day-in-paradise"];
function balance(a,k){const c=Array.from({length:k},(_,i)=>a.filter(p=>p===i).length);assert.ok(Math.max(...c)-Math.min(...c)<=1);a.forEach((p,i)=>{assert.ok(p>=0&&p<k);if(i>1)assert.ok(!(p===a[i-1]&&p===a[i-2]));});}
let questions=0,lines=0;
for(const slug of slugs){
 const d=JSON.parse(fs.readFileSync('tools/song-content/'+slug+'.json'));
 assert.equal(d.exercises.length,4);assert.equal(d.vocabulary.length,10);assert.ok(d.description.startsWith('《'));assert.ok(d.description.length<1500);
 const byId=new Map(d.translations.map(r=>[r.lineId,r]));assert.equal(byId.size,d.translations.length);
 for(const r of d.translations){assert.ok(r.chinese.trim());assert.ok(!/[\u4e00-\u9fff]/.test(r.english));if(r.startSeconds!==undefined)assert.ok(r.endSeconds>r.startSeconds&&r.endSeconds<=d.audioAlignment.duration);}
 lines+=d.translations.length;
 d.exercises.forEach((m,i)=>{
  assert.equal(m.questions.length,[20,32,40,50][i]);questions+=m.questions.length;
  assert.deepEqual(m.listeningLines.map(l=>l.lineId),d.translations.map(r=>r.lineId));
  balance(m.questions.map(q=>q.options.indexOf(q.answer)),3);
  const seen=[];
  for(const l of m.listeningLines){
   const parts=l.prompt.split('  · 聆聽細節：');
   const restored=parts[0].replace(/\{\{q:(\d+)\}\}/g,(_,n)=>m.questions[+n-1].answer);
   assert.equal(restored,byId.get(l.lineId).english,slug+'/'+m.id+'/'+l.lineId);
   for(const x of l.prompt.matchAll(/\{\{q:(\d+)\}\}/g)){const q=m.questions[+x[1]-1];seen.push(q.number);assert.equal(q.lineId,l.lineId);assert.equal(q.promptZh,byId.get(l.lineId).chinese);assert.equal(q.options.length,3);}
  }
  assert.deepEqual(seen.sort((a,b)=>a-b),m.questions.map(q=>q.number));
 });
 balance(d.vocabulary.map(q=>q.answer),4);
 d.vocabulary.forEach(q=>{assert.equal(q.options.length,4);assert.equal(q.optionExplanations.length,4);assert.equal(q.explanation,q.optionExplanations[q.answer]);});
 for(const f of ['album.mp3','user-cover-20261030.png'])assert.ok(fs.statSync('song-media/'+slug+'/'+f).size>5000);
}
console.log('PASS: 17 lessons, '+questions+' listening questions, 170 vocabulary questions, '+lines+' Chinese lyric translations, balanced answers and complete lyric flows.');
