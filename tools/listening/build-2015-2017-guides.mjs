// Read-only generator. Pipe its JSON through apply_patch when updating guide assets.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {questionNumbers} from '../../dse-listening-question-ui.mjs';
const root = new URL('../../',import.meta.url);
const read = file => fs.readFileSync(new URL(file,root),'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const norm = value => value.toLowerCase().replace(/[‘’]/g,"'").replace(/[^a-z0-9']+/g,' ').trim();
const year = Number(process.argv.find(arg=>/^(2015|2016|2017)$/.test(arg)));
assert(year,'Supply 2015, 2016 or 2017');
const {transcriptZh,questionTranslations,analysisRows}=await import(`./${year}-guide-content.mjs`);
const context={window:{}};
for(const kind of ['transcript','data'])vm.runInNewContext(read(`dse-listening-${year}-${kind}.js`),context);
const data=context.window[`EDMUND_DSE_LISTENING_${year}`];
// Guide-only label corrections. Indices are zero-based source cue indices.
// A mixed cue keeps a grouped label; parent turn identity is never guessed.
const labelOverrides={
 2015:{
  1:{0:'Narrator',1:'Narrator',2:'Narrator',3:'Narrator',4:'Narrator／Nancy and Paul Caruso',49:'Narrator',50:'Narrator',51:'Narrator',52:'Narrator',53:'Narrator'},
  2:{0:'Narrator／Nancy, Lily and Mitchell',33:'Narrator',34:'Narrator',35:'Narrator'},
  3:{0:'Narrator',1:'Narrator',2:'Narrator',3:'Narrator'},
  4:{0:'Narrator',1:'Narrator',2:'Narrator',3:'Narrator',4:'Narrator／Power Focus guests',52:'Narrator',53:'Narrator'}
 },
 2016:{
  1:{13:'Chau family'},
  2:{2:'Chau family',4:'Chau family',6:'Chau family',8:'Chau family',10:'Chau family',11:'Chau family',12:'Chau family',14:'Chau family',16:'Chau family',18:'Chau family',20:'Chau family',27:'Chau family',29:'Chau family',45:'Chau family'},
  3:{14:'Angela Chau／Museum Guide',27:'Chau family／Museum Guide'}
 },
 2017:{
  1:{0:'Narrator',1:'Narrator',2:'Narrator',3:'Narrator／Brunch with Charlie guests',53:'Brunch with Charlie guests／Narrator',54:'Narrator'},
  2:{0:'Narrator',1:'Narrator',2:'Narrator／Twin-city committee',36:'Twin-city committee／Narrator',37:'Narrator',38:'Narrator'},
  3:{0:'Narrator',1:'Narrator',2:'Narrator',3:'Narrator／Candidate-city videos',47:'Narrator'},
  4:{0:'Narrator',1:'Narrator',2:'Narrator',3:'Narrator',4:'Narrator',57:'Narrator',58:'Narrator'}
 }
};
const guide={
 year,
 source:{
  title:`${year} DSE Part A · 錄音稿翻譯及參考答案解析`,
  scope:`Part A Tasks 1–4, Questions 1–${data.questionCount}`,
  status:'Authored reference answers, not an official HKEAA marking scheme.',
  questionPaper:`${year} Paper 3 Part A.pdf`,
  questionDataSha256:sha(read(`dse-listening-${year}-data.js`)),
  transcriptDataSha256:sha(read(`dse-listening-${year}-transcript.js`)),
  styleReference:'2021 – DSE Listening – 5** Past Paper 題解書 (Edmund Sir); approved 2023 bilingual teaching guide.',
  styleReferenceSha256:JSON.parse(read('assets/dse-listening/2021/guide.json')).source.sha256,
  timingBasis:'Original year split-track transcript cue boundaries. Audio navigation is approximate; answer spans may cover adjacent source cues when an utterance is split.',
  editorialNotes:[
   `${year} answers and explanations are newly authored from that year's question data and recording transcript; 2021 and 2023 are style references only.`,
   'Original English text, cue boundaries, audio, question controls, images, student answers and Part B are unchanged. Guide-only speaker labels correct clear examiner instructions to Narrator and use neutral grouped labels for mixed turns or unreliable parent attribution; no individual turn identity is guessed. Raw transcript files remain unchanged.',
   'Traditional Chinese translations retain all available transcript cues, including examiner instructions and cross-track fragments. Proper-name spellings in Chinese annotations follow the question paper where available; untranslated/missing speech is not invented.'
  ]
 },
 transcriptNote:`按 ${year} 年錄音逐段翻譯。點擊一行可跳至相應錄音附近，時間為近似導航位置。`,
 analysisNote:'以下為按錄音及題目編寫的參考答案與解析，並非考評局官方評分準則。',
 questions:questionTranslations,transcript:{},analysis:{}
};
const rowsByNumber=new Map(analysisRows.map(row=>[row[0],row]));
assert.equal(rowsByNumber.size,analysisRows.length,'Duplicate analyses');
for(const task of data.tasks){
 const n=task.number,source=data.transcript.partA[n];
 assert.equal(transcriptZh[n].length,source.length,`Task ${n} cue alignment`);
 assert.equal(questionTranslations[n].blocks.length,task.blocks.length,`Task ${n} block alignment`);
 guide.transcript[n]=source.map((row,i)=>({...row,speaker:labelOverrides[year]?.[n]?.[i]||row.speaker,zh:transcriptZh[n][i]}));
 source.forEach((row,i)=>{
  assert(row.end>row.start,`Task ${n} cue ${i} positive duration`);
  assert(i===0||row.start>=source[i-1].start,`Task ${n} cue ${i} monotonic start`);
  assert(transcriptZh[n][i].trim().length>0,`Task ${n} cue ${i} translated`);
 });
 for(const q of questionNumbers(task)){
  const entry=rowsByNumber.get(q);assert(entry,`Q${q} missing`);
  const [,answer,evidence,explanation]=entry;
  let match;
  // Prefer the shortest actual cue span containing the exact normalized evidence.
  for(let width=1;width<=source.length&&!match;width++)for(let i=0;i+width<=source.length;i++){
   if(norm(source.slice(i,i+width).map(row=>row.text).join(' ')).includes(norm(evidence))){match=[i,i+width-1];break;}
  }
  assert(match,`Q${q} evidence missing: ${evidence}`);
  const [first,last]=match;
  guide.analysis[q]={task:n,answer,explanation,evidence,audioTime:source[first].start,audioEnd:source[last].end};
 }
}
assert.equal(Object.keys(guide.analysis).length,data.questionCount,'Full question coverage');
const output=JSON.stringify(guide,null,2)+'\n';
if(process.argv.includes('--check')){
 assert.equal(read(`assets/dse-listening/${year}/guide.json`),output,'Guide asset is stale');
 console.log(`${year}: ${data.questionCount} analyses, ${Object.values(guide.transcript).flat().length} cues, ${data.tasks.reduce((s,t)=>s+t.blocks.length,0)} blocks; all evidence and timings valid.`);
}else if(process.argv.includes('--summary')){
 console.log(JSON.stringify({year,analyses:Object.keys(guide.analysis).length,cues:Object.values(guide.transcript).flat().length,shortExplanations:Object.entries(guide.analysis).filter(([,v])=>v.explanation.length<100).map(([q,v])=>[q,v.explanation.length])}));
}else process.stdout.write(output);
