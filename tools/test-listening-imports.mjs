import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { validatePractice, loadPractice, getLoadedPractice } from '../listening-practice-loader.mjs';
import { bookmarkLocation } from '../listening-study-core.mjs';
import worker from '../workers/edmund-audio/src/index.js';

const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const files=fs.readdirSync(new URL('assets/listening/practices/',root)).filter(file=>/^practice-\d+\.json$/.test(file));
const practices=files.map(file=>JSON.parse(read(`assets/listening/practices/${file}`))).sort((a,b)=>a.practice-b.practice);

test('the full import contains Practices 2–20 and can register later practices',()=>{
  assert.deepEqual(practices.filter(p=>p.practice<=20).map(p=>p.practice),Array.from({length:19},(_,i)=>i+2));
  const context={window:{}};vm.runInNewContext(read('listening-system-catalog.js'),context);
  assert.deepEqual(Array.from(context.window.EDMUND_LISTENING_CATALOG.practices,p=>p.practice),[1,...practices.map(p=>p.practice)]);
});

test('every practice has all 40 questions, answers, analysis and source diagrams',()=>{
  for(const data of practices){
    validatePractice(data,data.practice);
    assert.match(data.source.sha256,/^[a-f0-9]{64}$/);
    assert.deepEqual(data.parts.map(p=>p.part),[1,2,3,4]);
    assert.equal(Object.keys(data.analysis).length,40);
    for(const part of data.parts){
      assert.deepEqual(part.questions.flatMap(q=>q.numbers||[q.number]),Array.from({length:10},(_,i)=>(part.part-1)*10+i+1));
      assert(part.sourcePages.length && part.sourceBlocks.length);
      for(const block of part.sourceBlocks){
        assert(block.page>0 && block.page<=data.source.pageCount);
        if(block.type==='image')assert(fs.statSync(new URL(block.src,root)).size>1000,block.src);
        else assert(block.text.trim());
      }
      for(const q of part.questions){
        assert(q.prompt.trim());
        const answers=q.answers||[q.answer];assert(answers.every(a=>typeof a==='string'&&a.trim()));
        if(q.options){
          const keys=q.options.map(o=>o.key);assert.equal(new Set(keys).size,keys.length);
          assert(answers.every(answer=>keys.includes(answer)),`P${data.practice} Q${q.number||q.numbers}`);
        }
        for(const n of q.numbers||[q.number]){
          const analysis=data.analysis[n];
          assert(analysis.answer && analysis.explanation.length>35 && analysis.sourcePages.length);
        }
      }
    }
  }
});

test('all recording rows have real, positive, non-overlapping timestamps and complete question cues',()=>{
  let rows=0,tracks=0;
  for(const data of practices){
    assert.equal(Object.keys(data.timings.parts).length,4);
    assert.equal(Object.keys(data.timings.questions).length,40);
    for(const part of [1,2,3,4]){
      const transcript=data.transcript[part],timing=data.timings.parts[part];tracks++;
      assert.match(timing.audioSha256,/^[a-f0-9]{64}$/);
      assert.equal(timing.transcriptSha256,createHash('sha256').update(JSON.stringify(transcript)).digest('hex'),'Timings must match this exact transcript version');
      assert.match(timing.audioUrl,/^https:\/\/edmund-neural-audio\.edmundeducation\.workers\.dev\//);
      assert(timing.duration>200 && timing.coverage>.9,`P${data.practice}.${part} incomplete alignment`);
      assert.equal(timing.lines.length,transcript.length);
      for(const [i,line] of timing.lines.entries()){
        const label=`P${data.practice}.${part} row ${i}`;rows++;
        assert(transcript[i].en && transcript[i].zh && transcript[i].sourcePages.length,label);
        assert(Number.isFinite(line.start) && Number.isFinite(line.end),label+' missing timing');
        assert(line.start>=0 && line.end>line.start && line.end<=timing.duration,label+' invalid range');
        assert(line.coverage>=.8 || line.reviewed,label+' needs audio review');
        if(i)assert(line.start>=timing.lines[i-1].end-.05,label+' overlaps previous row');
        for(const key of [`practice${data.practice}:transcript:p${part}:line:${i}`,`practice${data.practice}:p${part}:t${i}:1:word`]){
          assert.equal(bookmarkLocation({item_key:key},data.transcript,data.timings,data.practice).start,line.start);
          assert.equal(bookmarkLocation({item_key:key},data.transcript,data.timings,data.practice+1),null);
        }
      }
    }
    for(const [n,cue] of Object.entries(data.timings.questions)){
      assert.equal(cue.part,Math.floor((Number(n)-1)/10)+1);
      assert.equal(cue.time,data.timings.parts[cue.part].lines[cue.line].start);
      assert(bookmarkLocation({item_key:`practice${data.practice}:analysis:q${n}`},data.transcript,data.timings,data.practice));
    }
  }
  console.log(`Validated ${tracks} recordings, ${rows} bilingual rows and ${practices.length*40} answer cues.`);
});

test('known source-file contradictions stay corrected and documented',()=>{
  const p12=practices.find(p=>p.practice===12),p17=practices.find(p=>p.practice===17);
  assert(Object.values(p12.analysis).every(a=>a.editorialNote && a.evidenceRows.length));
  const answers=new Map(p17.parts.flatMap(p=>p.questions.flatMap(q=>q.numbers?q.numbers.map((n,i)=>[n,q.answers[i]]):[[q.number,q.answer]])));
  for(const [n,value] of [[12,'B'],[14,'A'],[15,'C'],[16,'D'],[17,'A'],[19,'C'],[20,'B']])assert.equal(answers.get(n),value);
  assert(p17.source.corrections.length>=7);
  assert.equal(p17.parts[1].questions.find(q=>q.number===16).options.at(-1).en,'daily change in menu');
  assert.equal(practices.find(p=>p.practice===2).parts[1].questions[0].options.at(-1).en,'helping people find their seats');
});

test('loader isolates practices, deduplicates requests and permits retry after failure',async()=>{
  const originalFetch=globalThis.fetch;let calls=0,fail=true;
  globalThis.fetch=async url=>{
    calls++;
    const n=Number(String(url).match(/practice-(\d+)/)[1]);
    if(n===3&&fail)return new Response('',{status:503});
    return new Response(JSON.stringify(practices.find(p=>p.practice===n)));
  };
  try{
    const [a,b]=await Promise.all([loadPractice(2),loadPractice(2)]);assert.equal(calls,1);assert.equal(a,b);
    await assert.rejects(loadPractice(3));assert.equal(getLoadedPractice(3),null);
    fail=false;assert.equal((await loadPractice(3)).practice,3);assert.notEqual(getLoadedPractice(2),getLoadedPractice(3));
  }finally{globalThis.fetch=originalFetch;}
});

test('future recordings are discovered without another hard-coded 20-practice cap',async()=>{
  const env={EDMUND_ASSETS:{list:async()=>({objects:[1,2,3,4].map(part=>({key:`IELTS Listening - Recordings/Listening 21 Part ${part}.mp3`})),truncated:false})}};
  const response=await worker.fetch(new Request('https://edmund-neural-audio.edmundeducation.workers.dev/v1/listening/catalog'),env);
  const data=await response.json();assert.equal(data.expectedTracks,84);assert.equal(data.tracks.length,4);
  assert(data.tracks.every(track=>track.practice===21));assert.equal(data.missing.length,80);
});

test('shared UI retains the student safety and multi-practice boundaries',()=>{
  const script=read('listening-system.js');
  assert.match(script,/registeredPractices\.has\(number\)/);
  assert.match(script,/saveCurrentAnswers/);assert.match(script,/restoreCurrentAnswers/);
  assert.match(script,/if \(state\.practice === 1 && state\.token/,'P1-only points RPC must not overwrite P1 with a new practice');
  assert.doesNotMatch(script,/if \(state\.practice !== 1\)/);
  assert.match(read('listening-system.css'),/\.row-audio-player:not\(\[hidden\]\) ~ \.floating-audio-player\s*\{\s*display:none/,'The main dock must not cover row replay');
  const rowPlayer=read('listening-system.html').split('data-row-speed')[1].split('</select>')[0];
  for(const speed of [0.25,0.5,0.75,1,1.25,1.5,1.75,2])assert(rowPlayer.includes(`value="${speed}"`));
});
