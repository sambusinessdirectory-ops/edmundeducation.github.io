import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {modules} from '../natural-english/catalogue.mjs';
import sourceLessons from '../natural-english/imported-lessons.mjs';
import {audioManifest} from '../natural-english/audio/manifest.mjs';

const imported=modules.filter(module=>module.number>=7);
const metadata=JSON.parse(fs.readFileSync(new URL('../natural-english/audio/imported-metadata.json',import.meta.url),'utf8'));
const audioByPath=new Map(Object.values(metadata).flat().map(row=>[row.path,row]));
assert.equal(imported.length,460);
assert.equal(sourceLessons.length,460);
assert.equal(sourceLessons.reduce((sum,module)=>sum+module.questions.length,0),4600);
assert.equal(new Set(imported.map(module=>module.number)).size,460);
assert.equal(new Set(imported.map(module=>module.id)).size,460);
assert.equal(imported.reduce((sum,module)=>sum+module.questions.length,0),2223);
for(const module of imported){
  assert.match(module.sourceSha256,/^[0-9a-f]{64}$/,module.id);
  assert.match(module.sourceFile,/^\d+_.*\.pdf$/,module.id);
  assert.equal(module.revision,2,module.id);
  assert.ok(module.steps.length>=5&&module.steps.length<=8,module.id);
  if(module.number!==102){
    assert.ok(module.steps.length===5||module.steps.length===6,module.id);
    assert.ok(module.questions.every(question=>question.id.startsWith(module.id+'-v2-')),module.id);
    assert.ok(module.questions.some(question=>question.type==='open'),module.id);
  }else assert.equal(module.questions.length,11,module.id);
  if(module.number===102){const dialogues=module.steps.filter(step=>step.dialogue);assert.equal(dialogues.length,2);for(const step of dialogues){assert.deepEqual(step.dialogue.map(turn=>turn.speaker),['A','B','A']);assert.equal(step.dialogue.map(turn=>turn.en).join(' '),step.model);}}
  assert.deepEqual(new Set(module.steps.flatMap(step=>step.questions)),new Set(module.questions.map(question=>question.id)),module.id);
  for(const question of module.questions){
    assert.ok(question.answers.length,module.id+' '+question.id);
    if(question.type==='mc'){
      assert.ok(question.options.length>=2&&question.options.length<=6,module.id+' '+question.id);
      assert.ok(question.answers.every(answer=>question.options.includes(answer)),module.id+' '+question.id);
      assert.ok(question.options.every(option=>option.length<=160),module.id+' '+question.id);
    }else assert.ok(['blank','open'].includes(question.type),module.id+' '+question.id);
  }
  const models=[...new Set(module.steps.map(step=>step.model).filter(Boolean).concat(module.takeaways))];
  for(const model of models){
    const path=audioManifest[module.id]?.[model];assert.ok(path,module.id+' '+model);
    const row=audioByPath.get(path);assert.ok(row,module.id+' audio metadata for '+model);
    const audio=new URL('../'+path,import.meta.url);const bytes=fs.readFileSync(audio);
    assert.ok(bytes.length>1800,module.id+' '+model);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,module.id+' audio checksum');
  }
}
assert.equal(imported.find(module=>module.number===452).titleEn,'The straw is clogged.');
assert.equal(imported.find(module=>module.number===453).titleEn,'The paper straw has gone soggy.');
const held=fs.readFileSync(new URL('../natural-english/IMPORT-REVIEW.md',import.meta.url),'utf8');
for(const number of [15,38,46,105,148,171,180,217,231,239,242,244,268,311,338,474,475]){
  assert.ok(!imported.some(module=>module.number===number),'held lesson '+number+' must not publish');
  assert.match(held,new RegExp('\\| '+number+' \\|'));
}
console.log('PASS: 460 approved lessons, 2,223 live v2 questions, 17 held PDFs, source archive intact, and every model audio verified.');
