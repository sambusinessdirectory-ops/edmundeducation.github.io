import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('song-appreciation.js','utf8');
const code=source.slice(source.indexOf('  function listeningRoute('),source.indexOf('  function renderExerciseQuestions()'));
const route=vm.runInNewContext(code+';listeningRoute');
let modes=0,occurrences=0,questions=0;
for(const file of fs.readdirSync('tools/song-content').filter(f=>f.endsWith('.json'))){
 const song=JSON.parse(fs.readFileSync('tools/song-content/'+file));
 for(const mode of song.exercises){
  const original=JSON.stringify(mode),ordered=route(mode);
  const expected=mode.listeningLines.flatMap(l=>[...l.prompt.matchAll(/\{\{q:(\d+)\}\}/g)].map(m=>Number(m[1])));
  assert.equal(JSON.stringify(ordered.map(q=>q.number)),JSON.stringify(expected),file+' '+mode.id);
  assert.equal(new Set(expected).size,mode.questions.length);
  assert.equal(JSON.stringify(mode),original,'display routing must never mutate stored question IDs/options');
  const saved=Object.fromEntries(mode.questions.map(q=>[q.number,q.options[1]]));
  ordered.forEach(q=>assert.equal(saved[q.number],q.options[1],'saved selection remains attached to same question'));
  modes++;occurrences+=mode.listeningLines.length;questions+=ordered.length;
 }
}
console.log(`PASS: ${modes} modes, ${occurrences} lyric occurrences, ${questions} questions in song order with stable saved-answer IDs.`);
