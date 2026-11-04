import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.resolve(import.meta.dirname,'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'v6-requirements.json'),'utf8'));
const ids=new Set();
for(const requirement of manifest.requirements){
  for(const key of ['id','rule','owner','test','gate','evidence'])if(!String(requirement[key]||'').trim())throw new Error(`${requirement.id||'unknown'} missing ${key}`);
  if(ids.has(requirement.id))throw new Error(`Duplicate requirement ID ${requirement.id}`);ids.add(requirement.id);
}
if(manifest.version!=='6.0'||manifest.status!=='normative')throw new Error('V6 manifest authority is invalid');
const lesson=fs.readFileSync(path.join(root,'paper3/2023-b2/curation/lesson.js'),'utf8');
const podcast=fs.readFileSync(path.join(root,'paper3/2023-b2/curation/podcast-v6.js'),'utf8');
const test=fs.readFileSync(path.join(root,'tools/check-2023-b2-entry.cjs'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/pages-paper3-fast.yml'),'utf8');
if(/className=['"](?:seek-wrap|pin-layer)/.test(lesson))throw new Error('Legacy podcast marker constructor remains');
if(!podcast.includes("podcastArchitectureVersion23='6-single-owner'"))throw new Error('Missing V6 runtime handshake');
if(test.includes("page.route('**/lesson.js"))throw new Error('Browser test hides lesson.js production behaviour');
if(!test.includes(".seek-wrap,.pin-layer"))throw new Error('Browser test does not reject orphan marker layers');
if(!workflow.includes('PAPER3_EVIDENCE_DIR='))throw new Error('Workflow does not archive browser evidence');
if(!workflow.includes('6-single-owner'))throw new Error('Workflow does not verify the V6 runtime');
console.log(`V6 traceability manifest valid: ${manifest.requirements.length}/${manifest.requirements.length} requirements mapped.`);
