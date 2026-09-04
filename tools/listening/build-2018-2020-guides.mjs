import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {questionNumbers} from '../../dse-listening-question-ui.mjs';
const root=new URL('../../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
const sha=s=>createHash('sha256').update(s).digest('hex');
const norm=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9']+/g,' ').trim();
for(const year of process.argv.slice(2).filter(x=>/^20\d\d$/.test(x)).map(Number)){
 const {transcriptZh,questions,analysisRows,corrections={},speakerCorrections={},speakerLabels={},notes=[]}=await import(`./${year}-guide-content.mjs`);
 const context={window:{}};
 for(const name of [`dse-listening-${year}-transcript.js`,`dse-listening-${year}-data.js`])vm.runInNewContext(read(name),context);
 const data=context.window[`EDMUND_DSE_LISTENING_${year}`];
 const guide={year,source:{title:`${year} DSE Part A · 錄音稿翻譯及參考答案解析`,scope:`Part A Tasks 1–4, Questions 1–${data.questionCount}`,status:'Authored reference answers, not an official HKEAA marking scheme.',questionPaper:`${year} Paper 3 Part A.pdf`,questionDataSha256:sha(read(`dse-listening-${year}-data.js`)),transcriptDataSha256:sha(read(`dse-listening-${year}-transcript.js`)),styleReference:'2021 – DSE Listening – 5** Past Paper 題解書 (Edmund Sir); approved 2023 guide',timingBasis:'Original split-track transcript cues; cue-based audio navigation is approximate. Replay begins 15 seconds before the answer-bearing cue.',editorialNotes:[`Newly authored from ${year} original question data, figures and recording transcript; 2021/2023 used for teaching style only. Original recordings, questions, images, student data and Part B are unchanged.`,...notes]},transcriptNote:`按 ${year} 原有錄音稿整理，逐段附繁體中文翻譯，保留原有時間；明確的指示段落標作旁白，無法細分的對話保留群組標籤。定位時間為約略錄音提示。`,analysisNote:'以下為按錄音及題目編寫的參考答案與教學解析，並非考評局官方評分準則。',analysis:{},transcript:{},questions};
 for(const task of data.tasks){
  const n=task.number,original=data.transcript.partA[n],zh=transcriptZh[n].trim().split('\n');
  assert.equal(zh.length,original.length,`${year} T${n} transcript alignment`);
  assert.equal(questions[n].blocks.length,task.blocks.length,`${year} T${n} blocks`);
  const rows=original.map((r,i)=>({...r,speaker:speakerCorrections[`${n}:${i}`]??speakerLabels[r.speaker]??r.speaker,text:corrections[`${n}:${i}`]??r.text,zh:zh[i]}));
  rows.forEach((r,i)=>{assert(r.end>r.start&&r.start>=0,`${year} T${n} cue${i} timing`);if(i)assert(r.start>=rows[i-1].start,`${year} T${n} monotonic`);assert(/[\u3400-\u9fff]/u.test(r.zh),`${year} T${n} Chinese cue${i}`)});
  guide.transcript[n]=rows;
  for(const q of questionNumbers(task)){
   const entry=analysisRows.find(a=>a[0]===q);assert(entry,`${year} Q${q} missing`);
   const [,answer,explanation,evidence,cue]=entry;
   assert(rows[cue],`${year} Q${q} cue missing`);
   assert(norm(rows.map(r=>r.text).join(' ')).includes(norm(evidence)),`${year} Q${q} evidence absent: ${evidence}`);
   assert(norm(rows[cue].text).includes(norm(evidence)),`${year} Q${q} evidence not in cue${cue}`);
   guide.analysis[q]={task:n,answer,explanation,evidence,audioTime:rows[cue].start,audioEnd:rows[cue].end};
  }
 }
 assert.equal(Object.keys(guide.analysis).length,data.tasks.flatMap(questionNumbers).length);
 const output=JSON.stringify(guide,null,2)+'\n',file=new URL(`assets/dse-listening/${year}/guide.json`,root);
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),output,`${year} guide stale`);else fs.writeFileSync(file,output);
 console.log(`${year}: ${Object.keys(guide.analysis).length} analyses, ${Object.values(guide.transcript).flat().length} bilingual cues, ${Object.values(questions).reduce((n,q)=>n+q.blocks.length,0)} translated blocks; evidence/timings verified.`);
}
