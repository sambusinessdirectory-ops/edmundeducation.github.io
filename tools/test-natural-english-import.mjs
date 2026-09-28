import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {modules} from '../natural-english/catalogue.mjs';
import {audioManifest} from '../natural-english/audio/manifest.mjs';

const imported=modules.filter(module=>module.number>=7);
const metadata=JSON.parse(fs.readFileSync(new URL('../natural-english/audio/imported-metadata.json',import.meta.url),'utf8'));
const voiceCycle=['american-female','american-male','british-male','british-female'];
assert.equal(imported.length,460);
assert.equal(new Set(imported.map(module=>module.number)).size,460);
assert.equal(new Set(imported.map(module=>module.id)).size,460);
assert.equal(imported.reduce((sum,module)=>sum+module.questions.length,0),4601);
for(const module of imported){
  assert.match(module.sourceSha256,/^[0-9a-f]{64}$/,module.id);
  assert.match(module.sourceFile,/^\d+_.*\.pdf$/,module.id);
  assert.equal(module.steps.length,8,module.id);
  assert.equal(module.questions.length,module.number===102?11:10,module.id);
  if(module.number===102){const dialogues=module.steps.filter(step=>step.dialogue);assert.equal(dialogues.length,2);for(const step of dialogues){assert.deepEqual(step.dialogue.map(turn=>turn.speaker),['A','B','A']);assert.equal(step.dialogue.map(turn=>turn.en).join(' '),step.model);}}
  assert.deepEqual(new Set(module.steps.flatMap(step=>step.questions)),new Set(module.questions.map(question=>question.id)),module.id);
  for(const question of module.questions){
    assert.ok(question.answers.length,module.id+' '+question.id);
    if(question.type==='mc'){
      assert.ok(question.options.length>=2&&question.options.length<=6,module.id+' '+question.id);
      assert.ok(question.answers.every(answer=>question.options.includes(answer)),module.id+' '+question.id);
      assert.ok(question.options.every(option=>option.length<=160),module.id+' '+question.id);
    }else{
      assert.equal(question.type,'blank',module.id+' '+question.id);
      assert.ok(question.answers.every(answer=>answer.length<=160),module.id+' '+question.id);
    }
  }
  const models=[...new Set(module.steps.map(step=>step.model).filter(Boolean).concat(module.takeaways))];
  assert.deepEqual(Object.keys(audioManifest[module.id]||{}),models,module.id+' audio entries');
  const rows=metadata[module.id]||[];assert.equal(rows.length,models.length,module.id+' metadata entries');
  for(const [index,model] of models.entries()){
    const row=rows[index];assert.equal(row.text,model,module.id+' audio order');
    const dialogue=module.id==='native-102'&&[1,3].includes(index);
    assert.equal(row.voice,dialogue?'american-female+british-male':voiceCycle[index%4],module.id+' voice cycle');
    if(dialogue){assert.equal(row.model,'Kokoro alternating speakers',module.id+' dialogue voice model');assert.match(row.path,/native-102-0[24]-two-voices-[0-9a-f]+\.mp3$/);}
    if(row.voice==='american-male')assert.ok(!row.model||row.model==='Aura 2 Aries',module.id+' male voice');
    assert.equal(row.path,audioManifest[module.id][model],module.id+' manifest path');
    const audio=new URL('../'+row.path,import.meta.url);const bytes=fs.readFileSync(audio);
    assert.ok(bytes.length>1800,module.id+' '+model);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,module.id+' audio checksum');
  }
}
const held=fs.readFileSync(new URL('../natural-english/IMPORT-REVIEW.md',import.meta.url),'utf8');
for(const number of [15,38,46,105,148,171,180,217,231,239,242,244,268,311,338,474,475]){
  assert.ok(!imported.some(module=>module.number===number),'held lesson '+number+' must not publish');
  assert.match(held,new RegExp('\\| '+number+' \\|'));
}
console.log('PASS: 460 approved lessons, 4,601 valid questions, 17 held PDFs, every model audio present.');
