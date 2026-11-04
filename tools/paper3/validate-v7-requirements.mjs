import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const manifest=JSON.parse(read('tools/paper3/v7-requirements.json'));
const ids=new Set();
for(const requirement of manifest.requirements){
  for(const key of ['id','rule','owner','test','gate','evidence'])if(!String(requirement[key]||'').trim())throw new Error(`${requirement.id||'unknown'} missing ${key}`);
  if(ids.has(requirement.id))throw new Error(`Duplicate requirement ID ${requirement.id}`);ids.add(requirement.id);
}
if(manifest.version!=='7.0'||!manifest.status.startsWith('normative-candidate'))throw new Error('V7 authority/status is invalid');

const meeting=read('paper3/2023-b2/curation/meeting.js');
const lesson=read('paper3/2023-b2/curation/lesson.js');
const podcast=read('paper3/2023-b2/curation/podcast-v7.js');
const build=read('tools/build-2023-b2-reader.py');
const test=read('tools/check-2023-b2-v7.cjs');
const workflow=read('.github/workflows/pages-paper3-fast.yml');
const index=read('paper3/2023-b2/curation/index.html');

const forbidden=[
  [meeting,/setInterval\(boundary/,'legacy boundary timer'],
  [meeting,/else\s+listen\(0\s*,\s*false\)/,'bootstrap fallback listen'],
  [lesson,/const oldListen\s*=\s*listen/,'independent cue persistence wrapper'],
  [lesson,/audio\.addEventListener\(['"]pause['"]\s*,\s*remember23/,'legacy pause-state writer'],
  [index,/data-reader-source="podcast-v6\.js"/,'loaded V6 runtime'],
  [build,/podcast_v6_tag/,'V6 build injection']
];
for(const [source,pattern,label] of forbidden)if(pattern.test(source))throw new Error(`Forbidden ${label} remains`);
for(const required of [
  "podcastArchitectureVersion23='7-continuous-single-owner'",
  'playbackStart:previous',
  'completedThrough',
  'window.podcastController23',
  'podcastCueTransactions23'
])if(!podcast.includes(required))throw new Error(`V7 controller missing ${required}`);
if(!build.includes('podcast-v7.js'))throw new Error('Reader build does not inject V7');
if(!index.includes("podcastArchitectureVersion23='7-continuous-single-owner'"))throw new Error('Generated reader lacks V7 handshake');
for(const required of ['playCue(page,index)','await page.reload()','[data-chapter=categorize]','firefox.launch()','podcastCueMetaV7','v7-continuous-single-owner'])
  if(!test.includes(required))throw new Error(`V7 browser gate missing ${required}`);
for(const required of ['check-2023-b2-v7.cjs','validate-v7-requirements.mjs','7-continuous-single-owner','paper3-v7-conformance'])
  if(!workflow.includes(required))throw new Error(`Workflow missing V7 gate ${required}`);
console.log(`V7 traceability and ownership valid: ${manifest.requirements.length}/${manifest.requirements.length} requirements mapped.`);
