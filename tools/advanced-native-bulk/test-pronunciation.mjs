import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {audioQueue,audioIdentityPayload,hasRequiredPronunciation,requiredPronunciationVersion} from './schema.mjs';
import {buildArtifacts} from './build.mjs';
import config from './pronunciation-overrides.json' with {type:'json'};
const here=path.dirname(fileURLToPath(import.meta.url));
const hash=key=>createHash('sha256').update('{'+Object.keys(key).sort().map(name=>JSON.stringify(name)+': '+JSON.stringify(key[name])).join(', ')+'}').digest('hex');
const vectors=['ordinary text','curve ball','curveballish','precurveballs','curvable','curveball','CURVEBALLS','écurveball','curveball-like','getting from A to B','A to Bee','tearjerker','tearjerkers','quiet-hour','quiet hours'].flatMap(text=>['en-gb','en-us'].map(lang=>({text,voice:lang==='en-gb'?'bm_fable':'af_heart',lang,speed:.98})));
const py=spawnSync('python3',['-c',`import sys,json,importlib.util
s=importlib.util.spec_from_file_location('a',sys.argv[1]);a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
print(json.dumps([a.identity(x) for x in json.load(sys.stdin)]))`,path.join(here,'audio.py')],{input:JSON.stringify(vectors),encoding:'utf8'});
assert.equal(py.status,0,py.stderr);
assert.deepEqual(JSON.parse(py.stdout),vectors.map(c=>hash(audioIdentityPayload(c))),'Python and JavaScript identities must agree for both languages and exact boundaries.');
for(const c of vectors){const old=hash({...c,v:1});if(requiredPronunciationVersion(c.text))assert.notEqual(hash(audioIdentityPayload(c)),old);else assert.equal(hash(audioIdentityPayload(c)),old,'Unaffected keys must remain byte-identical.');}
for(const lang of ['en-gb','en-us']){
 const rules=config.languages[lang],request={text:'A curveball and two CURVEBALLS.',lang};
 const evidence={version:config.version,phonemesBefore:`(${rules.curveball.before}) ${rules.curveballs.before}.`,phonemesAfter:`(${rules.curveball.after}) ${rules.curveballs.after}.`,replacements:['curveball','curveballs'].map(lexeme=>({lexeme,count:1,...rules[lexeme]}))};
 assert.equal(hasRequiredPronunciation(request,{pronunciationOverrideVersion:config.version,pronunciation:evidence}),true,'Singular/plural counts and punctuation boundaries must match.');
 const tampered=structuredClone(evidence);tampered.phonemesAfter=rules.curveball.after;
 assert.equal(hasRequiredPronunciation(request,{pronunciationOverrideVersion:config.version,pronunciation:tampered}),false,'The complete corrected sentence, not only an expected lexeme, must match.');
}
for(const lang of ['en-gb','en-us']){
 const rule=config.languages[lang]['a to b'];
 const request={text:'We got from A to B quickly.',lang};
 const evidence={version:config.version,phonemesBefore:`wɪ ɡɒt fɹɒm ${rule.before} kwɪkli.`,phonemesAfter:`wɪ ɡɒt fɹɒm ${rule.after} kwɪkli.`,replacements:[{lexeme:'a to b',count:1,...rule}]};
 assert.equal(hasRequiredPronunciation(request,{pronunciationOverrideVersion:config.version,pronunciation:evidence}),true,'Letter A must be pronounced as the name of the letter in the exact A to B unit.');
}
for(const lang of ['en-gb','en-us'])for(const lexeme of ['tearjerker','quiet-hour']){
 const rule=config.languages[lang][lexeme],request={text:`The ${lexeme} is here.`,lang};
 const evidence={version:config.version,phonemesBefore:`ðə ${rule.before} ɪz hɪə.`,phonemesAfter:`ðə ${rule.after} ɪz hɪə.`,replacements:[{lexeme,count:1,...rule}]};
 assert.equal(hasRequiredPronunciation(request,{pronunciationOverrideVersion:config.version,pronunciation:evidence}),true,`Exact ${lexeme} phoneme correction must verify in ${lang}.`);
}

const fixture=JSON.parse(fs.readFileSync(path.join(here,'calibration-007.json'))).lessons[0];
fixture.id='advanced-native-011';fixture.number=11;
for(const sentence of [fixture.listening,fixture.speaking,...fixture.takeaways])sentence.en+=' A curveball.';
delete fixture.speaking.cloze;
const artifacts=buildArtifacts([fixture]);assert.equal(artifacts.validation.errors.length,0);
const clips=JSON.parse(artifacts.files['audio-queue.generated.json']);
for(const clip of clips){
 assert.equal(clip.pronunciationOverrideVersion,config.version);
 assert.equal(clip.synthesisKey,hash(audioIdentityPayload(clip)));
 assert.equal(hasRequiredPronunciation(clip,{...clip}),false,'Version alone without phoneme evidence must not pass.');
}
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'advanced-pronunciation-gate-'));
const state=path.join(directory,'state'),host='https://edmund-neural-audio.edmundeducation.workers.dev/assets/natural-english/audio/advanced-native/v1/';
const write=(name,value)=>{const file=path.join(directory,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
function setup(correct){
 const rows=clips.map((c,i)=>{
  const rule=config.languages[c.lang].curveball;
  return {...c,sha256:String(i+1).repeat(64),...(correct?{pronunciation:{version:config.version,phonemesBefore:rule.before,phonemesAfter:rule.after,replacements:[{lexeme:'curveball',count:1,...rule}]}}:{pronunciationOverrideVersion:undefined})};
 });
 write('drafts/batch-0011-0025.json',{lessons:[fixture]});write('selection.json',{lessons:[fixture]});
 write('editorial-coverage.json',{reviewedCurrentIds:[fixture.id],reviewedCurrentRecords:[{id:fixture.id,canonicalContentSha256:digest(fixture)}]});write('progress.json',{savedDraftLessons:1,updatedAt:new Date().toISOString()});
 write('state/metadata.json',{[fixture.id]:rows});write('state/public-manifest.json',{[fixture.id]:Object.fromEntries(clips.map(c=>[c.text,host+c.synthesisKey+'.mp3']))});
 write('state/r2-uploaded.json',Object.fromEntries(clips.map((c,i)=>['assets/natural-english/audio/advanced-native/v1/'+c.synthesisKey+'.mp3',String(i+1).repeat(64)])));
 return rows;
}
function select(name){const r=spawnSync(process.execPath,[path.join(here,'select-preview.mjs'),directory,state,name],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(fs.readFileSync(path.join(directory,'staging',name,'selection-evidence.json')));}
try{
 setup(false);const rejected=select('old-audio');assert.equal(rejected.selected,0);assert.ok(rejected.held[0].reasons.every(r=>r.endsWith('required-pronunciation-version-pending')));
 let rows=setup(true);assert.equal(select('corrected-audio').selected,1);
 const valid=structuredClone(rows[0]);
 for(const [name,mutate] of [
  ['tampered-after',r=>{r.pronunciation.phonemesAfter+='x';}],
  ['extra-token',r=>{r.pronunciation.phonemesBefore+=' '+r.pronunciation.phonemesBefore;}],
  ['embedded-token',r=>{r.pronunciation.phonemesBefore='x'+r.pronunciation.phonemesBefore;}]
 ]){
  const bad=structuredClone(valid);mutate(bad);
  assert.equal(hasRequiredPronunciation(clips[0],bad),false,name);
  write('state/metadata.json',{[fixture.id]:[bad,...rows.slice(1)]});
  assert.equal(select(name).selected,0,`Selector must reject ${name} phoneme evidence.`);
 }
 // Run stage in an isolated fake repository, never the real app or a frozen queue.
 const fakeTools=path.join(directory,'tools/advanced-native-bulk');fs.mkdirSync(fakeTools,{recursive:true});
 for(const file of ['stage.mjs','build.mjs','schema.mjs','pronunciation-overrides.json'])fs.copyFileSync(path.join(here,file),path.join(fakeTools,file));
 write('natural-english/audio/advanced-metadata.json',{});fs.writeFileSync(path.join(directory,'natural-english/audio/advanced-manifest.mjs'),'export default {};\n');
 const stage=()=>spawnSync(process.execPath,[path.join(fakeTools,'stage.mjs'),path.join(directory,'selection.json'),'--audio-state',state],{encoding:'utf8'});
 setup(false);const bad=stage();assert.notEqual(bad.status,0);assert.match(bad.stderr,/required pronunciation version/);assert.ok(!fs.existsSync(path.join(state,'local-stage.json')));
 setup(true);const good=stage();assert.equal(good.status,0,good.stderr);assert.ok(fs.existsSync(path.join(state,'local-stage.json')));
 console.log('Pronunciation: cross-language identity, unchanged old keys/pins, four-role queue versions, selector and isolated stage gates passed.');
}finally{fs.rmSync(directory,{recursive:true,force:true});}
