import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {reviews,groups,extraEvidence,distractors,noise,instruction,noiseSpans} from './dse2018-curation-review.mjs';
import {questionNumbers} from '../../dse-listening-question-ui.mjs';
const root=new URL('../../',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const guide=JSON.parse(read('assets/dse-listening/2018/guide.json'));
const ctx={window:{}};for(const name of ['transcript','data'])vm.runInNewContext(read(`dse-listening-2018-${name}.js`),ctx);
const source=ctx.window.EDMUND_DSE_LISTENING_2018;
const recordings=JSON.parse(read('tools/listening/dse2018-curation-audio.json'));
// Missing narrator material recovered from the original audio, also printed in
// the paper. These additions are local to curation; archive row IDs do not move.
const additions={
 3:{after:[
 {start:479.56,end:482.34,speaker:'Narrator',text:'That is the end of Task 3.',zh:'任務三完結。'},
 {start:483.38,end:486.74,speaker:'Narrator',text:'You now have one minute to tidy up your answers.',zh:'你現在有一分鐘整理答案。'}]},
 4:{before:[
 {start:12.18,end:14.26,speaker:'Narrator',text:'Task 4.',zh:'任務四。'},
 {start:15.36,end:20.48,speaker:'Narrator',text:'You will listen to the What, Why, How weekly podcast.',zh:'你將聆聽《What, Why, How》每週播客。'},
 {start:22.10,end:28.94,speaker:'Narrator',text:'Kaity is discussing the psychology of games and play with two professors of psychology.',zh:'Kaity 正與兩位心理學教授討論遊戲與玩樂的心理學。'},
 {start:30.16,end:33.60,speaker:'Narrator',text:'Answer the questions below and complete the table.',zh:'回答下面的問題，並完成表格。'}]}
};
const curation={id:'dse2018-part-a',year:2018,version:'2026-10-26.dse1',presentation:{title:'2018 DSE · Part A',exam:'DSE LISTENING',partLabel:'Task',fileId:'dse2018-part-a'},source:{guideSha256:hash(guide),questionDataSha256:hash(source),timingBasis:'Existing bilingual guide cue boundaries, cross-checked against the original four MP3s with faster-whisper-base.en. Complete confirming context selected manually; no interpolated times.',status:guide.source.status},parts:[]};
const content={year:2018,analysis:guide.analysis,parts:[],transcript:{},timings:{parts:{}}};
const preferred={1:'terrible',3:'great / wonderful',13:'Dan has not done any research',16:'walls',27:'completed',28:'Pieter',30:'riding horses',31:'a pretend wedding',32:'exercise',33:'a kicking game',35:'small blocks',36:'only a few colours',37:'very complex pictures',38:'funny / humorous',39:'for free',40:'provide entertainment',41:'have an outcome or goal',42:'follow a set of rules',44:'helps them fight better',45:'jumping',46:'helps them escape predators',50:'develop morality',51:'learn how to live together peacefully'};
for(const task of source.tasks){
 const n=task.number,rows=guide.transcript[n],prefix=additions[n]?.before||[],suffix=additions[n]?.after||[],offset=prefix.length;
 const transcript=[...prefix,...rows,...suffix].map(r=>({en:r.text,zh:r.zh,speaker:r.speaker}));
 content.transcript[n]=transcript;
 const track=recordings.find(r=>r.task===n);
 const part={part:n,title:task.title,subtitle:guide.questions[n].title,instructions:n===3?'Part A：改錯或 ✓ · Part B：每項最多 4 字 · Part C：一個或多個字':'依原題作答；不必使用完整句子。',duration:track.duration,audioUrl:track.url,audioSha256:track.audioSha256,transcriptSha256:hash(transcript),cues:[],annotations:[]};
 const span=(line,quote)=>{assert(rows[line].text.includes(quote),`T${n} row ${line} missing ${quote}`);return {line:line+offset,quote,revealAt:rows[line].end};};
 const questions=[];
 for(const number of questionNumbers(task)){
  const review=reviews.find(r=>r[0]===number);assert(review,`Missing Q${number}`);
  const [,questionText,hint,paraphrase,startLine,endLine]=review,a=guide.analysis[number];
  const evidenceLine=rows.findIndex(r=>r.start===a.audioTime);assert(evidenceLine>=0);
  const evidence=[span(evidenceLine,a.evidence),...(extraEvidence[number]||[]).map(([i,q])=>span(i,q))];
  const rejected=(distractors[number]||[]).map(([line,quote,rejectLine,why])=>({...span(line,quote),candidateAt:rows[line].end,rejectAt:rows[rejectLine].end,why}));
  const end=rows[endLine].end;
  assert(evidence.every(e=>e.revealAt<=end)&&rejected.every(e=>e.rejectAt<=end),`Q${number} prematurely stops`);
  const groupQuestions=groups.find(g=>g.includes(number));
  part.cues.push({id:`dse2018-q${number}`,question:number,questionText,answer:preferred[number]||a.answer,accepted:[a.answer],hint,paraphrase,start:rows[startLine].start,end,endLine:endLine+offset,evidence,distractors:rejected,...(groupQuestions?{groupQuestions,...(number===3||number===4?{groupLabel:'同一人物 · 感受與原因分欄'}:number===14||number===15?{groupLabel:'同時確認上下標籤 · 固定位置'}:number>=35&&number<=37?{groupLabel:'同一句三格 · 按句型配對'}:{})}:{})});
  questions.push({number,prompt:questionText,...([17,18].includes(number)?{maze:task.blocks.find(b=>b.type==='maze'&&b.number===number)}:{})});
 }
 part.cues.sort((a,b)=>a.end-b.end||a.question-b.question);
 const full=[...prefix,...rows,...suffix];
 part.annotations=full.map((r,i)=>({line:i,role:i<offset||i>=offset+rows.length||instruction[n].includes(i-offset)?'instruction':part.cues.some(c=>c.evidence.some(e=>e.line===i))?'evidence':part.cues.some(c=>c.distractors.some(e=>e.line===i))?'distractor':noise[n].includes(i-offset)?'noise':'context',...(noiseSpans[n]?.[i-offset]?{noiseSpans:noiseSpans[n][i-offset]}:{})}));
 assert(part.annotations.every(a=>a.role!=='noise'||!part.cues.some(c=>[...c.evidence,...c.distractors].some(e=>e.line===a.line))));
 content.timings.parts[n]={audioUrl:track.url,audioSha256:track.audioSha256,transcriptSha256:part.transcriptSha256,lines:full.map(({start,end})=>({start,end}))};
 content.parts.push({part:n,title:task.title,instruction:task.instruction,translation:guide.questions[n],blocks:task.blocks,questions,pages:{1:[2,3],2:[4,5],3:[6,7],4:[8,9]}[n]});
 curation.parts.push(part);
}
const target=new URL('dse-curation-data/2018.json',root),out=JSON.stringify({curation,content},null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),out,'Rebuild DSE 2018 curation');
else {fs.mkdirSync(new URL('dse-curation-data/',root),{recursive:true});fs.writeFileSync(target,out);}
console.log(`DSE 2018: ${curation.parts.reduce((n,p)=>n+p.cues.length,0)} curated answers; ${Object.values(content.transcript).flat().length} bilingual rows; original explanations preserved.`);
