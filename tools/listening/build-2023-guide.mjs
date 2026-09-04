import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {analysisRows, transcriptZh, questionTranslations} from './2023-guide-content.mjs';
import {questionNumbers} from '../../dse-listening-question-ui.mjs';
import {locateGuideEvidence} from './guide-cue.mjs';
const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const sha = text => createHash('sha256').update(text).digest('hex');
const context = {window:{}};
for (const file of ['dse-listening-2023-transcript.js','dse-listening-2023-data.js']) vm.runInNewContext(read(file), context);
const data = context.window.EDMUND_DSE_LISTENING_2023;
const guide = {
 year: 2023,
 source: {
  title: '2023 DSE Part A · 錄音稿翻譯及參考答案解析',
  scope: 'Part A Tasks 1–4, Questions 1–53',
  status: 'Authored reference answers, not an official HKEAA marking scheme.',
  questionPaper: '2023 Paper 3 Part A.pdf',
  questionDataSha256: sha(read('dse-listening-2023-data.js')),
  transcriptDataSha256: sha(read('dse-listening-2023-transcript.js')),
  styleReference: '2021 – DSE Listening – 5** Past Paper 題解書 (Edmund Sir)',
  styleReferenceSha256: JSON.parse(read('assets/dse-listening/2021/guide.json')).source.sha256,
  timingBasis: 'Existing split-track cues. Selected Task 1 passages independently cross-checked with local ASR. Navigation cues are approximate.',
  editorialNotes: ['2023 teaching content is newly authored; the 2021 PDF is a style reference, not a source of 2023 answers.', 'Task 1 opening restored; mistaken “none the wiser” corrected to “the result”; unsupported guest first name removed. Combined speaker labels retained when a cue spans voices.', 'Light punctuation/spelling cleanup; original audio and student answers are unchanged.']
 },
 transcriptNote: '按 2023 錄音整理，附繁體中文翻譯。點擊一行可跳到相應錄音附近。',
 analysisNote: '以下為按錄音編寫的參考答案及解析，並非考評局官方評分準則。',
 analysis: {}, transcript: {}, questions: questionTranslations
};
const norm = text => text.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9']+/g,' ').trim();
for (const task of data.tasks) {
 const n = task.number, original = data.transcript.partA[n];
 assert.equal(transcriptZh[n].length, original.length, `Task ${n} translation alignment`);
 assert.equal(questionTranslations[n].blocks.length, task.blocks.length, `Task ${n} question blocks`);
 const rows = original.map((row,i) => ({...row, zh: transcriptZh[n][i], speaker: row.speaker.replaceAll('Hannah Cheung','Mother').replaceAll('Candice or Monica','Candice／Monica'), text:row.text.replaceAll('Candace','Candice')}));
 if (n === 1) {
  rows[6].text = rows[6].text.replace('Help! ', '');
  rows[15].text = rows[15].text.replace('story, Candice.', 'story. Candice?');
  rows[15].zh = rows[15].zh.replace('非凡的故事了。你和爸爸','非凡的故事了。Candice？你和爸爸');
  rows[27].text = 'And we were the result.';
  // Keep both halves of “air traffic controller” in a single bilingual cue.
  rows[9] = {...rows[9], end: rows[10].end, text: rows[9].text+' '+rows[10].text, zh: rows[9].zh+rows[10].zh.replace('主持人：','')};
  rows.splice(10,1);
  rows.splice(2,0,{start:57.2,end:75.43,speaker:'Candice／Monica',text:'Hello there, everyone in Cyberland. This is Candice. And this is Monica. And we are Extraordinary Hong Kong People.',zh:'網絡世界的各位，你們好！我是 Candice。我是 Monica。我們是《非凡香港人》（Extraordinary Hong Kong People）。'});
 }
 guide.transcript[n] = rows;
 const combined = norm(rows.map(row=>row.text).join(' '));
 for (const number of questionNumbers(task)) {
  const entry = analysisRows.find(row=>row[0]===number);
  assert(entry, `Missing Q${number}`);
  const [,answer,explanation,evidence] = entry;
  assert(combined.includes(norm(evidence)), `Q${number} evidence missing from transcript: ${evidence}`);
  guide.analysis[number] = {task:n,answer,explanation,evidence,questionSourcePages:[n+2],...locateGuideEvidence(rows,evidence)};
 }
}
assert.equal(Object.keys(guide.analysis).length,53);
const output = JSON.stringify(guide,null,2)+'\n';
const file = new URL('assets/dse-listening/2023/guide.json',root);
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(file,'utf8'),output,'2023 guide is stale');
else fs.writeFileSync(file,output);
console.log(`2023 guide: 53 evidence-checked analyses, ${Object.values(guide.transcript).flat().length} bilingual cues, 50 translated question blocks.`);
