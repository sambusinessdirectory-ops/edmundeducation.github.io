import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {questionNumbers} from '../../dse-listening-question-ui.mjs';
const root = new URL('../../', import.meta.url);
const read = f => fs.readFileSync(new URL(f,root),'utf8');
const norm = s => s.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9']+/g,' ').trim();
for (const year of process.argv.slice(2).map(Number).filter(Boolean)) {
 const {transcriptZh,questions,analysisRows} = await import(`./${year}-guide-content.mjs`);
 const c={window:{}};
 for(const kind of ['transcript','data']) vm.runInNewContext(read(`dse-listening-${year}-${kind}.js`),c);
 const data=c.window[`EDMUND_DSE_LISTENING_${year}`];
 const guide={year,source:{title:`${year} DSE Part A · 錄音稿翻譯及參考答案解析`,scope:`Part A Tasks 1–4, Questions 1–${data.questionCount}`,status:'Authored reference answers, not an official HKEAA marking scheme.',questionPaper:`${year} Paper 3 Part A.pdf`,questionDataSha256:createHash('sha256').update(read(`dse-listening-${year}-data.js`)).digest('hex'),transcriptDataSha256:createHash('sha256').update(read(`dse-listening-${year}-transcript.js`)).digest('hex'),styleReference:'2021 – DSE Listening – 5** Past Paper 題解書 (Edmund Sir); approved 2023 Part A guide',timingBasis:'Existing original-year split-track transcript cues. Navigation cues are approximate; replay begins 15 seconds before the selected answer-bearing cue.',editorialNotes:['Newly authored Traditional Chinese teaching material based on the original-year question data and recording transcript; 2021 and 2023 are style references only.','Original English, speaker labels and timings retained, including transcription imperfections. Chinese follows the recoverable meaning without inventing speaker identities. Original audio, questions, images, Part B and student answers are unchanged.']},transcriptNote:`按 ${year} 年原有錄音稿逐段翻譯，附繁體中文。原稿個別語音辨識及講者標籤可能不準；時間為約數。`,analysisNote:'以下為按錄音編寫的參考答案及解析，並非考評局官方評分準則。',analysis:{},transcript:{},questions};
 for(const task of data.tasks){
  const rows=data.transcript.partA[task.number], zh=transcriptZh[task.number].trim().split('\n');
  assert.equal(zh.length,rows.length,`${year} Task ${task.number}: cue translations`);
  assert.equal(questions[task.number].blocks.length,task.blocks.length,`${year} Task ${task.number}: question blocks`);
  const narratorBounds={2012:{1:[3,62],2:[9,122],3:[6,112],4:[5,68]},2013:{1:[6,61],2:[3,78],3:[8,63],4:[10,96]},2014:{1:[6,Infinity],2:[0,39],3:[2,54],4:[3,71]}}[year][task.number];
  const groupedSpeaker=year===2012&&task.number===2?'Dannie Wan／與會者':year===2014&&task.number===4?'Helen／John／Robbie Lowe／Ms Stanley':null;
  guide.transcript[task.number]=rows.map((r,i)=>{assert(r.end>r.start,`${year} task ${task.number} cue ${i} positive duration`);if(i)assert(r.start>=rows[i-1].start,'monotonic');return {...r,speaker:i<=narratorBounds[0]||i>=narratorBounds[1]?'Narrator':groupedSpeaker||r.speaker,zh:zh[i]};});
  for(const q of questionNumbers(task)){
   const row=analysisRows.find(r=>r[0]===q);assert(row,`${year} Q${q} missing`);
   const [,cue,answer,explanation,evidence]=row;
   const r=rows[cue];assert(r,`${year} Q${q} cue missing`);
   assert(norm(r.text).includes(norm(evidence)),`${year} Q${q}: evidence mismatch ${evidence}`);
   assert(explanation.length>=85,`${year} Q${q}: explanation too short`);
   guide.analysis[q]={task:task.number,answer,explanation,evidence,audioTime:r.start,audioEnd:r.end};
  }
 }
 guide.source.editorialNotes[1]='Original English and timings retained, including transcription imperfections. Unambiguous opening and closing examination instructions are labelled Narrator. The known mixed-speaker passages in 2012 Task 2 and 2014 Task 4 use broadened group labels, not guessed individual turn assignments; other supplied labels are retained. Chinese follows recoverable meaning without inventing identities. Original audio, questions, images, Part B and student answers are unchanged.';
 if(year===2014)guide.source.editorialNotes.push('Task 2: John’s comics view is Maybe (?), verified against original paper-page-5.jpg; the reconstructed question-data cell was corrected separately to match the paper. The original Task 2 transcript begins with the end-of-task timing instruction and does not include the opening task introduction.');
 assert.equal(Object.keys(guide.analysis).length,data.questionCount);
 const out=new URL(`assets/dse-listening/${year}/guide.json`,root);
 fs.mkdirSync(new URL('.',out),{recursive:true});fs.writeFileSync(out,JSON.stringify(guide,null,2)+'\n');
 console.log(`${year}: ${Object.keys(guide.analysis).length} analyses, ${Object.values(guide.transcript).flat().length} bilingual cues; all evidence/timings/alignment checks passed.`);
}
